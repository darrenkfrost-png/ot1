import { useSettings } from '../context/SettingsContext'; // clinical settings Hook
import { Settings as SettingsIcon, X, SlidersHorizontal, Image as ImageIcon, Volume2, Eye, Brain, Moon, Sun, Smartphone, Zap, Bell, Target, Palette, Layout, Ghost, ZapOff, CheckCircle2, Activity, RefreshCw, Radio, Server, ShieldCheck, Terminal, HardDrive, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect, useRef } from 'react';
import { GALLERY_IMAGES } from '../data/images';
import { VIDEO_WALLPAPERS } from '../data/videoWallpapers';
import { motion, AnimatePresence } from 'motion/react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from './ToastSystem';
import { PREVIEW_SCREENSAVER_EVENT } from './Screensaver';
import { CLINIC } from '../data/clinic';
import { speechSupported } from '../utils/readAloud';

/*
 * Aura colours. The first is the original gold - toned from the highlighter
 * it used to be, but the same colour, so anyone who liked it keeps it. The
 * rest are calmer options; all of them sit behind text at 7% and glow
 * outside the box, so none of them can affect legibility.
 */
const READING_AURA_COLOURS = [
  { label: 'Gold', hex: '#f5b301' },
  { label: 'Teal', hex: '#14b8a6' },
  { label: 'Sky', hex: '#38bdf8' },
  { label: 'Lavender', hex: '#a78bfa' },
  { label: 'Rose', hex: '#fb7185' },
  { label: 'Mint', hex: '#34d399' },
];

export default function SettingsPanel() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visuals' | 'theme' | 'accessibility' | 'diagnostics'>('theme');
  const { trackClick } = useAnalytics();
  const { showToast } = useToast();

  /*
   * DIAGNOSTICS REPORTS ONLY WHAT IT MEASURED. This tab used to release
   * scripted jargon lines on timers so it looked busy, print "operating
   * within nominal boundaries" whatever the checks found, count "canvas
   * nodes" from a hand-typed table (even with the film background, where no
   * canvas runs) and describe a microphone and "audio consultation" feature
   * that do not exist. Now it runs two real checks - can this browser save
   * settings, and is the contact form's server answering - and states the
   * rest as plain facts read from this device and these settings.
   */
  type ContactState = 'unchecked' | 'ready' | 'running' | 'not-set-up' | 'down';
  const [scanState, setScanState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [checkLog, setCheckLog] = useState<string[]>([]);
  const [contactState, setContactState] = useState<ContactState>('unchecked');
  const [storageState, setStorageState] = useState<'unchecked' | 'ok' | 'blocked'>('unchecked');

  const canReadAloud = speechSupported();
  const textSizePercent = Math.round((settings.fontSizeMultiplier || 1) * 100);

  const backgroundName = (() => {
    switch (settings.activeWallpaper) {
      case 'video': {
        const clip = VIDEO_WALLPAPERS.find((c) => c.id === settings.videoWallpaper) ?? VIDEO_WALLPAPERS[0];
        return `Film: ${clip?.label ?? 'emblem'}`;
      }
      case 'none':
        return 'Plain';
      case 'static-image':
        return 'Picture';
      default: {
        const name = settings.activeWallpaper.replace('-', ' ');
        return `${name.charAt(0).toUpperCase()}${name.slice(1)} (animated)`;
      }
    }
  })();

  /*
   * Worded to claim no more than the check saw. It asks the site's server one
   * question (/api/health) and sends nothing, so even the best answer means
   * "the server is up and says a delivery address is set", never "your
   * message will arrive". "Answering" on its own read as the second.
   */
  const contactValue: Record<ContactState, string> = {
    unchecked: 'Not checked yet',
    ready: 'Server up, sending set up',
    running: 'Server up, sending not confirmed',
    'not-set-up': 'Sending not set up - please phone or email',
    down: 'Server not answering - please phone or email',
  };

  const runSystemDiagnostic = async () => {
    trackClick("Run device check");
    setScanState('running');
    setCheckLog([]);

    let storageOk = false;
    try {
      localStorage.setItem('__ct6_diagnostic', '1');
      localStorage.removeItem('__ct6_diagnostic');
      storageOk = true;
    } catch {
      /* blocked by this browser */
    }

    /*
     * /api/health answers only while the site's own server runs, and that
     * server is what sends the contact form. It proves the server is up, not
     * that sending is configured, so "ready" needs the server to say so
     * (contactReady) - a missing answer is reported as just "running".
     */
    let contact: ContactState = 'down';
    // Only a refusal carries a code worth quoting. A host that answers every
    // address with its own web page returns 200 too, and "did not answer
    // (HTTP 200)" would read as a contradiction.
    let refusedWith = 0;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch('/api/health', { cache: 'no-store', signal: controller.signal });
      if (!res.ok) refusedWith = res.status;
      if (res.ok) {
        const body = await res.json().catch(() => null);
        if (body && body.status === 'ok') {
          contact = body.contactReady === true ? 'ready' : body.contactReady === false ? 'not-set-up' : 'running';
        }
      }
    } catch {
      /* no answer at all */
    } finally {
      window.clearTimeout(timer);
    }

    const phoneOrEmail = `Please phone ${CLINIC.telephone} or email ${CLINIC.email} instead.`;
    const lines = [
      `Checked at ${new Date().toLocaleTimeString('en-GB')}.`,
      storageOk
        ? 'Saving your settings: works on this device.'
        : 'Saving your settings: this browser is blocking it, so your choices last until you leave or reload the page.',
      contact === 'ready'
        ? 'Contact form: its server answered and says an address to send messages to is set up. No test message was sent, so this does not prove a message would arrive.'
        : contact === 'running'
          ? 'Contact form: its server answered, but did not say whether sending is set up. No test message was sent.'
          : contact === 'not-set-up'
            ? `Contact form: its server answered, but sending messages is not set up yet. ${phoneOrEmail}`
            : `Contact form: its server did not answer${refusedWith ? ` (HTTP ${refusedWith})` : ''}. ${phoneOrEmail}`,
      canReadAloud
        ? `Read aloud: available in this browser${settings.readAloudEnabled ? '' : ', but switched off under Accessibility'}.`
        : 'Read aloud: not available in this browser.',
      `Background: ${backgroundName}.`,
      `Text size: ${textSizePercent}%. Reduce movement: ${settings.reduceMotion ? 'on' : 'off'}. Page movement and film: ${settings.animationsEnabled ? 'on' : 'off'}.`,
    ];

    setStorageState(storageOk ? 'ok' : 'blocked');
    setContactState(contact);
    setCheckLog(lines);
    setScanState('completed');
    showToast("Check finished", "info");
  };

  const wallpaperOptions = ['none', 'video', 'fluid', 'polymetric', 'hyperspace', 'network', 'waves', 'grid', 'matrix', 'rain', 'circuit', 'aurora', 'particles', 'constellation', 'orbs', 'ripple', 'polyrhythm', 'dna', 'static-image'];

  const handleOpen = () => {
     setIsOpen(true);
     trackClick("Open Supreme Settings");
  };

  useEffect(() => {
    const handleEvent = () => handleOpen();
    window.addEventListener('open-settings', handleEvent);
    return () => window.removeEventListener('open-settings', handleEvent);
  }, []);

  const handleUpdate = (key: any, value: any) => {
     updateSetting(key, value);
     // Occasional feedback for major changes or just silent for slider
  };

  const handleReset = () => {
    resetSettings();
    showToast("Settings reset to defaults", "info");
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Say where the choices live. In a browser that blocks site data they
    // cannot be saved, and claiming they were would be untrue.
    let canSave = false;
    try {
      localStorage.setItem('__ct6_save_probe', '1');
      localStorage.removeItem('__ct6_save_probe');
      canSave = true;
    } catch {
      /* blocked */
    }
    showToast(
      canSave
        ? "Settings saved on this device"
        : "Settings applied until you leave or reload the page - this browser is not letting the site save them",
      canSave ? "success" : "info"
    );
  };

  /*
   * The backdrop only helps a pointer user; a keyboard user needs Escape, and
   * a screen reader needs focus to land inside the dialog when it opens or the
   * page behind it is what gets read. Tab stays inside the window while it is
   * open (it used to walk out into the page hidden behind the dark overlay),
   * and closing hands focus back to whatever opened it, rather than dropping
   * it at the top of the page.
   */
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      const items = focusables();
      if (!panel || !items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (opener && opener !== document.body && document.contains(opener)) opener.focus();
    };
  }, [isOpen]);

  return (
    <>
      {/* Clean View swaps the round cog for a small 'Settings' tab in the same
          corner. The tab IS the way back: it opens this panel, where Clean View
          can be switched off. It used to remove the cog with nothing in its
          place (the restore control lived in the deleted voice controller), and
          the choice is saved, so the button stayed gone on every later visit.
          Smaller, not fainter: it keeps full contrast over the film. */}
      {settings.hideOverlays && (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-28 right-4 lg:bottom-auto lg:top-20 lg:right-8 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-[11px] font-bold uppercase tracking-widest text-slate-800 hover:bg-slate-50 focus-visible:outline-teal-500"
          style={{ zIndex: 'calc(var(--z-overlay) - 5)' }}
          aria-label="Open settings"
        >
          Settings
        </button>
      )}
      {!settings.hideOverlays && (
        <button
          onClick={handleOpen}
          className="fixed bottom-28 right-4 lg:bottom-auto lg:top-20 lg:right-8 p-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-premium border border-slate-200/60 hover:bg-white transition-all hover:scale-105 active:scale-95 group focus-visible:outline-teal-500"
          style={{ zIndex: 'calc(var(--z-overlay) - 5)' }}
          aria-label="Open Settings"
        >
          <SettingsIcon size={20} className="text-slate-600 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 'var(--z-overlay)' }}>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
               ref={panelRef}
               role="dialog"
               aria-modal="true"
               aria-label="Settings"
               tabIndex={-1}
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-5xl max-h-[90vh] glass-premium rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/60 holographic-border outline-none"
            >
               {/* Sidebar Tabs */}
               <div className="w-full md:w-72 bg-white/40 backdrop-blur-3xl border-b md:border-b-0 md:border-r border-white/40 p-8 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 hide-scrollbar z-10">
                  <div className="hidden md:flex items-center gap-4 mb-8 px-2">
                     <div className="p-3 bg-slate-950 text-teal-400 rounded-2xl shadow-lg ring-4 ring-teal-500/5"><SlidersHorizontal size={20} /></div>
                     <div className="flex flex-col">
                       <h3 className="font-display font-medium text-lg tracking-tight leading-none">Settings</h3>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">For this browser</span>
                     </div>
                  </div>
                  
                  <TabButton active={activeTab === 'theme'} onClick={() => setActiveTab('theme')} icon={<ImageIcon size={18} />} label="Canvas & Art" />
                  <TabButton active={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')} icon={<Eye size={18} />} label="Visual Engine" />
                  <TabButton active={activeTab === 'accessibility'} onClick={() => setActiveTab('accessibility')} icon={<Volume2 size={18} />} label="Accessibility" />
                  <TabButton active={activeTab === 'diagnostics'} onClick={() => setActiveTab('diagnostics')} icon={<Activity size={18} />} label="Diagnostics" />
               </div>

               {/* Content Area */}
               <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white/60 backdrop-blur-2xl custom-scrollbar relative z-10">
                  <button
                     onClick={() => setIsOpen(false)}
                     aria-label="Close settings"
                     className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all active:scale-90"
                  >
                     <X size={24} />
                  </button>

                  <div className="max-w-3xl">
                     {activeTab === 'theme' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">Theme & Canvas Layer</h2>
                             <p className="text-slate-600 font-light text-base leading-relaxed">Choose what sits behind the pages: a film, an animated pattern, a picture, or nothing.</p>
                           </div>

                           <div className="space-y-6">
                              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700 block">Background</label>
                              {/* Two across until there is room for more, and a narrower
                                  letter-spacing: long names such as CONSTELLATION were cut
                                  off inside their buttons (nine of them on a phone), and the
                                  text-size setting now makes these labels larger still. */}
                              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                 {wallpaperOptions.map(opt => (
                                    <button 
                                       key={opt}
                                       onClick={() => {
                                          console.log("Switching wallpaper to:", opt);
                                          updateSetting('activeWallpaper', opt as any);
                                       }}
                                       aria-pressed={settings.activeWallpaper === opt}
                                       className={cn(
                                          "group relative flex flex-col items-center justify-center py-5 px-3 rounded-[1.5rem] text-[9.3px] font-black uppercase tracking-wider transition-all duration-500 border overflow-hidden",
                                          settings.activeWallpaper === opt 
                                             ? "bg-slate-950 border-slate-800 text-white shadow-premium ring-2 ring-teal-500/20" 
                                             : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-white hover:border-teal-200 hover:text-slate-900"
                                       )}
                                    >
                                       {/* Active Indicator Dot */}
                                       <div className={cn(
                                          "w-1.5 h-1.5 rounded-full mb-3 shadow-[0_0_8px_rgba(20,184,166,0.5)] transition-all duration-500",
                                          settings.activeWallpaper === opt ? "bg-teal-400 animate-pulse scale-125" : "bg-slate-200 group-hover:bg-teal-300"
                                       )} />
                                       <span className="relative z-10 max-w-full text-center [overflow-wrap:anywhere]">{opt.replace('-', ' ')}</span>
                                       
                                       {/* Selected Backdrop Glow */}
                                       {settings.activeWallpaper === opt && (
                                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-teal-500/10 blur-xl opacity-50 pointer-events-none"></div>
                                       )}

                                       {/* Technical border segments */}
                                       <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-teal-500/0 group-hover:border-teal-500/40 transition-colors"></div>
                                       <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-teal-500/0 group-hover:border-teal-500/40 transition-colors"></div>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {settings.activeWallpaper === 'video' && (
                              <div className="space-y-6 pt-10 border-t border-slate-100">
                                 <div className="flex items-baseline justify-between gap-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700 block">Background film</label>
                                    <span className="text-[10px] font-medium text-slate-600 tracking-wide">Silent · seamless loop</span>
                                 </div>
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {VIDEO_WALLPAPERS.map((clip) => {
                                       const isActive = (settings.videoWallpaper ?? VIDEO_WALLPAPERS[0].id) === clip.id;
                                       return (
                                          <button
                                             key={clip.id}
                                             onClick={() => updateSetting('videoWallpaper', clip.id)}
                                             aria-pressed={isActive}
                                             className={cn(
                                                "group relative w-full aspect-video rounded-[1.5rem] overflow-hidden border-4 transition-all shadow-lg",
                                                isActive ? "border-teal-500 scale-95 shadow-teal-500/20" : "border-white hover:border-slate-100"
                                             )}
                                          >
                                             <img src={clip.poster} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                             <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 px-2 truncate">
                                                {clip.label}
                                             </span>
                                             {isActive && (
                                                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.9)] animate-pulse" />
                                             )}
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>
                           )}

                           {settings.activeWallpaper === 'static-image' && (
                              <div className="space-y-6 pt-10 border-t border-slate-100">
                                 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700 block">Choose a picture</label>
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {GALLERY_IMAGES.slice(0, 12).map((img, i) => (
                                       <button 
                                          key={i} 
                                          onClick={() => updateSetting('staticWallpaper', img)}
                                          aria-label={`Use picture ${i + 1} as the background`}
                                          aria-pressed={settings.staticWallpaper === img}
                                          className={cn("w-full aspect-square rounded-[2rem] overflow-hidden border-4 transition-all shadow-lg", settings.staticWallpaper === img ? "border-teal-500 scale-95 shadow-teal-500/20" : "border-white hover:border-slate-100")}
                                       >
                                          <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           )}

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                              <div className="space-y-6">
                                 <div className="flex justify-between items-center">
                                     <label htmlFor="setting-background-brightness" className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700">Background brightness</label>
                                     <span className="text-xs font-black text-slate-600">{Math.round(settings.wallpaperBrightness * 100)}%</span>
                                 </div>
                                 <input
                                    id="setting-background-brightness"
                                    type="range" min="0.1" max="2" step="0.1"
                                    value={settings.wallpaperBrightness}
                                    onChange={(e) => updateSetting('wallpaperBrightness', parseFloat(e.target.value))}
                                    aria-valuetext={`${Math.round(settings.wallpaperBrightness * 100)} per cent`}
                                    className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                 />
                              </div>

                              <div className="space-y-6">
                                 <div className="flex justify-between items-center">
                                     <label htmlFor="setting-background-speed" className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700">Background speed</label>
                                     <span className="text-xs font-black text-slate-600">{settings.wallpaperSpeed}x</span>
                                 </div>
                                 <input
                                    id="setting-background-speed"
                                    type="range" min="0" max="3" step="0.1"
                                    value={settings.wallpaperSpeed}
                                    onChange={(e) => updateSetting('wallpaperSpeed', parseFloat(e.target.value))}
                                    aria-valuetext={`${settings.wallpaperSpeed} times normal speed`}
                                    aria-describedby="setting-background-speed-note"
                                    className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                 />
                                 <p id="setting-background-speed-note" className="text-xs text-slate-600">Animated backgrounds only, not the film.</p>
                              </div>
                           </div>

                           <div className="space-y-6 pt-10 border-t border-slate-100">
                              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700 block">Animated background detail</label>
                              <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full max-w-md border border-slate-100">
                                  {['low', 'balanced', 'ultra'].map(q => (
                                      <button
                                         key={q}
                                         onClick={() => updateSetting('wallpaperQuality', q as any)}
                                         aria-pressed={settings.wallpaperQuality === q}
                                         className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", settings.wallpaperQuality === q ? "bg-white text-slate-950 shadow-premium" : "text-slate-600 hover:text-slate-900")}
                                      >{q}</button>
                                  ))}
                              </div>
                              {/* Read from WallpaperCanvas: the level sets how many points the
                                  Network, Constellation and Polymetric patterns draw and how far
                                  apart they join up. The other patterns ignore it. */}
                              <p className="text-[10px] text-slate-600 font-medium">More points on the Network, Constellation and Polymetric backgrounds. Lower is easier on older devices.</p>
                           </div>
                        </div>
                     )}

                     {activeTab === 'visuals' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">Visual Engine Controls</h2>
                             <p className="text-slate-600 font-light text-base leading-relaxed">Choose how busy and colourful the site looks.</p>
                           </div>

                           <div className="space-y-10">
                               <div className="space-y-6 pb-10 border-b border-slate-100">
                                  <div className="space-y-2">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-800 block">Idle Screen</label>
                                     <p className="text-sm text-slate-600 font-light leading-relaxed">
                                        How long the screen sits untouched before the emblem, the guides and the films take over. Press the emblem to come back.
                                     </p>
                                  </div>
                                  <div className="flex justify-between items-center">
                                     <span className="text-xs font-bold text-slate-700">Appears after</span>
                                     <span className="text-xs font-black text-slate-700">
                                        {settings.screensaverDelaySeconds < 60
                                           ? `${settings.screensaverDelaySeconds} seconds`
                                           : `${Math.round(settings.screensaverDelaySeconds / 60)} minute${settings.screensaverDelaySeconds >= 120 ? 's' : ''}`}
                                     </span>
                                  </div>
                                  <input
                                     type="range" min="15" max="900" step="15"
                                     value={settings.screensaverDelaySeconds}
                                     onChange={(e) => updateSetting('screensaverDelaySeconds', parseInt(e.target.value, 10))}
                                     aria-label="Seconds of inactivity before the idle screen appears"
                                     className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                  />
                                  {/* Waiting out the timer to check a change is how a stale build
                                      went unnoticed for a whole conversation. */}
                                  <button
                                     type="button"
                                     onClick={() => { setIsOpen(false); window.dispatchEvent(new Event(PREVIEW_SCREENSAVER_EVENT)); }}
                                     className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-teal-700 hover:bg-teal-800 transition-colors active:scale-95 focus-visible:outline-teal-500 flex items-center justify-center gap-3"
                                  >
                                     <Eye size={14} /> Preview it now
                                  </button>
                               </div>

                               <div className="space-y-6">
                                  <div className="space-y-2">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700 block">Animated background colour</label>
                                     <p className="text-sm text-slate-600 font-light leading-relaxed">Used by the animated backgrounds (Fluid, Network and the others), not the film.</p>
                                  </div>
                                  <div className="flex flex-wrap gap-4" role="group" aria-label="Animated background colour">
                                     {[
                                        { hex: '#14b8a6', name: 'Teal' },
                                        { hex: '#0ea5e9', name: 'Sky blue' },
                                        { hex: '#6366f1', name: 'Indigo' },
                                        { hex: '#f43f5e', name: 'Rose' },
                                        { hex: '#f59e0b', name: 'Amber' },
                                        { hex: '#10b981', name: 'Green' },
                                     ].map(({ hex: color, name }) => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => {
                                             updateSetting('colorAccent', color);
                                             updateSetting('wallpaperColor', color);
                                          }}
                                          aria-label={`Animated background colour: ${name}`}
                                          aria-pressed={settings.colorAccent === color}
                                          title={name}
                                          className={cn("w-12 h-12 rounded-2xl border-4 transition-all shadow-lg flex items-center justify-center", settings.colorAccent === color ? "border-slate-900 scale-110" : "border-white hover:scale-105")}
                                          style={{ backgroundColor: color }}
                                        >
                                          {settings.colorAccent === color && <Zap size={16} className="text-white animate-pulse" />}
                                        </button>
                                     ))}
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                                  {/* These two were saved and read by nothing. They now drive
                                      decoration only (rules in the style block at the foot of
                                      this file), so no colour under any text changes. The
                                      stored values keep their old names; only the labels
                                      say what each one really does. */}
                                  <div className="space-y-4">
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700 block">Card glow</label>
                                        <p className="text-sm text-slate-600 font-light leading-relaxed">The soft light around the glass cards.</p>
                                     </div>
                                     <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full border border-slate-100" role="group" aria-label="Card glow">
                                         {([['glass', 'Breathing'], ['solid', 'Still'], ['minimal', 'Off']] as const).map(([style, name]) => (
                                             <button
                                                key={style}
                                                type="button"
                                                onClick={() => updateSetting('cardStyle', style)}
                                                aria-pressed={settings.cardStyle === style}
                                                className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", settings.cardStyle === style ? "bg-white text-slate-950 shadow-premium" : "text-slate-600 hover:text-slate-900")}
                                             >{name}</button>
                                         ))}
                                     </div>
                                  </div>

                                  <div className="space-y-4">
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700 block">Grid pattern</label>
                                        <p className="text-sm text-slate-600 font-light leading-relaxed">The fine grid drawn behind some panels.</p>
                                     </div>
                                     <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full border border-slate-100" role="group" aria-label="Grid pattern">
                                         {([['high', 'Full'], ['medium', 'Faint'], ['minimal', 'Off']] as const).map(([intensity, name]) => (
                                             <button
                                                key={intensity}
                                                type="button"
                                                onClick={() => updateSetting('uiIntensity', intensity)}
                                                aria-pressed={settings.uiIntensity === intensity}
                                                className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", settings.uiIntensity === intensity ? "bg-white text-slate-950 shadow-premium" : "text-slate-600 hover:text-slate-900")}
                                             >{name}</button>
                                         ))}
                                     </div>
                                  </div>
                               </div>

                               <div className="space-y-6 pt-10 border-t border-slate-100">
                                   <ToggleOption
                                      label="Page movement and film"
                                      description="Pages glide as they change, and the background film, the logo film and the animated backgrounds move. Turn it off and pages change without sliding, still pictures take their place, and the opening film is skipped. Films you choose to play still play. For the least movement everywhere, also turn on Reduce movement under Accessibility."
                                      enabled={settings.animationsEnabled}
                                      onToggle={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
                                   />
                                   <ToggleOption
                                      label="Clean View"
                                      description="Swap the round settings button for a small 'Settings' tab, so less sits over the page. Press the tab to come back here."
                                      enabled={settings.hideOverlays}
                                      onToggle={() => updateSetting('hideOverlays', !settings.hideOverlays)}
                                   />
                               </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'accessibility' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">Accessibility & Inclusivity</h2>
                             <p className="text-slate-600 font-light text-base leading-relaxed">Adjust text, colour and motion to suit how you see and read.</p>
                           </div>

                           <div className="space-y-10">
                               <div className="space-y-6">
                                  <div className="flex justify-between items-center">
                                      <label htmlFor="setting-text-size" className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700">Text size</label>
                                      <span className="text-xs font-black text-slate-600">{Math.round(settings.fontSizeMultiplier * 100)}%</span>
                                  </div>
                                  <input
                                     id="setting-text-size"
                                     type="range" min="0.8" max="1.5" step="0.05"
                                     value={settings.fontSizeMultiplier}
                                     onChange={(e) => updateSetting('fontSizeMultiplier', parseFloat(e.target.value))}
                                     aria-valuetext={`${Math.round(settings.fontSizeMultiplier * 100)} per cent`}
                                     className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                  />
                               </div>

                               <div className="space-y-6 pt-10 border-t border-slate-100">
                                   <ToggleOption
                                      label="Reduce movement"
                                      description="Turns off moving and sliding effects. Helpful if movement on screen is distracting or makes you feel unwell."
                                      enabled={settings.reduceMotion}
                                      onToggle={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                                   />
                               </div>

                               <div className="space-y-6 pt-10 border-t border-slate-100">
                                   <ToggleOption
                                      label="Read Aloud"
                                      description="Rest on any passage and a speaker button appears - press it to hear the text read out. Uses your device's own free voice."
                                      enabled={settings.readAloudEnabled}
                                      onToggle={() => updateSetting('readAloudEnabled', !settings.readAloudEnabled)}
                                   />
                               <div className="space-y-6 pt-10 border-t border-slate-100">
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-800 block">Reading Aura</label>
                                      <p className="text-sm text-slate-600 font-light leading-relaxed">
                                         The light that surrounds a passage when you rest on it, showing it can be read aloud. Pick the colour that sits easiest with you.
                                      </p>
                                   </div>
                                   <div className="flex flex-wrap gap-3">
                                      {READING_AURA_COLOURS.map((c) => {
                                         const active = settings.readingAuraColor === c.hex;
                                         return (
                                            <button
                                               key={c.hex}
                                               type="button"
                                               onClick={() => updateSetting('readingAuraColor', c.hex)}
                                               aria-pressed={active}
                                               aria-label={`Reading aura colour: ${c.label}`}
                                               title={c.label}
                                               className={cn(
                                                  'w-12 h-12 rounded-2xl border-2 transition-all focus-visible:outline-teal-500 active:scale-95',
                                                  active ? 'border-slate-900 scale-110' : 'border-slate-200 hover:border-slate-400'
                                               )}
                                               style={{
                                                  backgroundColor: `color-mix(in srgb, ${c.hex} 18%, white)`,
                                                  boxShadow: `0 0 0 1px ${c.hex}55, 0 0 18px -4px ${c.hex}`,
                                               }}
                                            />
                                         );
                                      })}
                                   </div>
                                   {/* Shown with the real thing rather than described - the aura is
                                       the sort of change you have to see to choose. */}
                                   <div className="p-5 rounded-2xl bg-white border border-slate-100">
                                      <p
                                         className="text-sm text-slate-700 leading-relaxed rounded-xl p-3"
                                         style={{
                                            backgroundColor: `color-mix(in srgb, ${settings.readingAuraColor} 7%, transparent)`,
                                            boxShadow: `0 0 0 1px color-mix(in srgb, ${settings.readingAuraColor} 30%, transparent), 0 0 30px -8px ${settings.readingAuraColor}`,
                                         }}
                                      >
                                         This is how a passage will look when you rest on it.
                                      </p>
                                   </div>
                               </div>

                                   {settings.readAloudEnabled && (
                                      <div className="space-y-4">
                                         <div className="flex justify-between items-center">
                                            <label htmlFor="setting-reading-speed" className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-800">Reading Speed</label>
                                            <span className="text-xs font-black text-slate-600">{settings.readAloudRate.toFixed(2)}x</span>
                                         </div>
                                         <input
                                            id="setting-reading-speed"
                                            type="range" min="0.7" max="1.4" step="0.05"
                                            value={settings.readAloudRate}
                                            onChange={(e) => updateSetting('readAloudRate', parseFloat(e.target.value))}
                                            aria-valuetext={`${settings.readAloudRate.toFixed(2)} times normal speed`}
                                            className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                         />
                                      </div>
                                   )}
                               </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'diagnostics' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">Diagnostics</h2>
                             <p className="text-slate-600 font-light text-base leading-relaxed">Checks what this browser can do with the site: saving your settings, reading aloud, and whether the contact form's server answers and says sending is set up.</p>
                           </div>
                           {/* Which build is actually in front of you. The 30-second
                               answer to "why can I not see the change I just made". */}
                           <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900 text-white">
                              <div className="space-y-1">
                                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-300">Running build</div>
                                 <div className="text-xs text-slate-300 font-light">If this is not the newest build, the page is being served from a stale server or cache.</div>
                              </div>
                              <code className="font-mono text-sm font-bold text-white bg-white/10 px-4 py-2 rounded-xl">
                                 {__BUILD_ID__} · {__BUILD_TIME__}
                              </code>
                           </div>


                           <div className="space-y-8">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                 <div className="space-y-1">
                                    <div className="font-bold text-slate-900 text-sm">Check this device</div>
                                    <div className="text-slate-600 font-light text-xs">Runs the checks below on this device.</div>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={runSystemDiagnostic}
                                    disabled={scanState === 'running'}
                                    className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-white flex items-center gap-3 bg-teal-700 hover:bg-teal-800 hover:shadow-teal-500/25 active:scale-95 shadow-lg cursor-pointer"
                                 >
                                    <RefreshCw size={14} className={scanState === 'running' ? "animate-spin" : ""} />
                                    {scanState === 'running' ? 'Checking...' : scanState === 'completed' ? 'Run it again' : 'Run the check'}
                                 </button>
                              </div>

                              {/* Each tile is a real reading. The first two come from the
                                  check above; the rest are read live from this browser and
                                  these settings, so they never wait on a button. */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between gap-4 min-h-36">
                                    <div className="flex items-center gap-3 text-slate-600">
                                       <Server size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">Contact form service</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">{contactValue[contactState]}</div>
                                       {(contactState === 'down' || contactState === 'not-set-up') && (
                                          <div className="text-xs font-medium text-slate-700">
                                             Call <a href={`tel:${CLINIC.telephoneLink}`} className="font-bold text-teal-800 underline">{CLINIC.telephone}</a>
                                          </div>
                                       )}
                                       {(contactState === 'ready' || contactState === 'running') && (
                                          <div className="text-xs font-medium text-slate-700">
                                             No test message is sent.
                                          </div>
                                       )}
                                    </div>
                                 </div>

                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between gap-4 min-h-36">
                                    <div className="flex items-center gap-3 text-slate-600">
                                       <HardDrive size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">Saving your settings</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">
                                          {storageState === 'unchecked' ? 'Not checked yet' : storageState === 'ok' ? 'Works on this device' : 'Blocked by this browser'}
                                       </div>
                                       <div className="text-xs font-medium text-slate-600">
                                          {storageState === 'blocked' ? 'Your choices last until you leave or reload the page.' : 'Kept in this browser only.'}
                                       </div>
                                    </div>
                                 </div>

                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between gap-4 min-h-36">
                                    <div className="flex items-center gap-3 text-slate-600">
                                       <Volume2 size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">Read aloud</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">
                                          {canReadAloud ? 'Available on this device' : 'Not available in this browser'}
                                       </div>
                                       {canReadAloud && (
                                          <div className="text-xs font-medium text-slate-600">
                                             {settings.readAloudEnabled ? 'Switched on under Accessibility.' : 'Switched off under Accessibility.'}
                                          </div>
                                       )}
                                    </div>
                                 </div>

                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between gap-4 min-h-36">
                                    <div className="flex items-center gap-3 text-slate-600">
                                       <ImageIcon size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">Background</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">{backgroundName}</div>
                                       <div className="text-xs font-medium text-slate-600">Change it under Canvas & Art.</div>
                                    </div>
                                 </div>

                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between gap-4 min-h-36 sm:col-span-2">
                                    <div className="flex items-center gap-3 text-slate-600">
                                       <Eye size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">Text size and movement</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">Text size {textSizePercent}%</div>
                                       <div className="text-xs font-medium text-slate-600">
                                          Reduce movement is {settings.reduceMotion ? 'on' : 'off'} (Accessibility). Page movement and film is {settings.animationsEnabled ? 'on' : 'off'} (Visual Engine).
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Always mounted, so a screen reader hears the findings arrive. */}
                              <div aria-live="polite">
                              {checkLog.length > 0 && (
                                 <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-700">
                                       <Terminal size={14} />
                                       <h3 className="text-[10px] font-black uppercase tracking-widest">What the check found</h3>
                                    </div>
                                    <ul className="bg-white text-sm text-slate-800 p-5 rounded-2xl border border-slate-200 leading-relaxed space-y-1.5 list-disc pl-9">
                                       {checkLog.map((line, i) => (
                                          <li key={i} className="select-text">{line}</li>
                                       ))}
                                    </ul>
                                 </div>
                              )}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 bg-white/50 backdrop-blur-sm -mx-8 -mb-8 px-8 py-8 md:-mx-12 md:-mb-12 md:px-12 md:py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">Reset all settings</span>
                        <span className="text-xs text-slate-600">Puts every setting back to how it started.</span>
                      </div>
                      <div className="flex gap-4 w-full sm:w-auto">
                         <button 
                            onClick={handleReset}
                            className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all border border-slate-100"
                         >
                            Reset
                         </button>
                         <button 
                            onClick={handleClose}
                            className="flex-1 sm:flex-none px-10 py-3.5 bg-slate-950 text-white hover:bg-slate-800 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-900/20 active:translate-y-0.5"
                         >
                            Apply & Close
                         </button>
                      </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
         .hide-scrollbar::-webkit-scrollbar { display: none; }
         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

         /*
          * Card glow + Grid pattern (Visual Engine). SettingsContext puts the
          * choice on <html> as data-card-style / data-ui-intensity. Decoration
          * only: the glow is box-shadow outside each card and the grid is a
          * faint line pattern, so no colour under any text changes.
          * Unlayered, so they win over the layered .crystal-glass and
          * .neural-grid rules in index.css. :not(:focus-visible) keeps the
          * focus ring's white band on glass tiles that take keyboard focus.
          */
         [data-card-style="solid"] .crystal-glass:not(:focus-visible) {
           animation: none !important;
           box-shadow: 0 0 42px -12px rgba(45, 212, 191, 0.28);
         }
         [data-card-style="minimal"] .crystal-glass:not(:focus-visible) {
           animation: none !important;
           box-shadow: none !important;
         }
         [data-ui-intensity="medium"] .neural-grid {
           background-image:
             linear-gradient(to right, rgba(13, 148, 136, 0.02) 1px, transparent 1px),
             linear-gradient(to bottom, rgba(13, 148, 136, 0.02) 1px, transparent 1px);
         }
         [data-ui-intensity="minimal"] .neural-grid {
           background-image: none;
         }
      `}} />
    </>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
   return (
      <button
         type="button"
         onClick={onClick}
         aria-pressed={active}
         className={cn(
            "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all w-fit md:w-full shrink-0",
            active ? "bg-white text-slate-950 shadow-premium ring-4 ring-slate-100" : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
         )}
      >
         <span className={cn("shrink-0 p-2 rounded-xl transition-all", active ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "bg-slate-200 text-slate-600")}>{icon}</span>
         {/* On phones the words are hidden to save room, but kept for screen
             readers - display:none left four nameless buttons. */}
         <span className="sr-only md:not-sr-only tracking-tight">{label}</span>
      </button>
   )
}

function ToggleOption({ label, description, enabled, onToggle }: { label: string, description: string, enabled: boolean, onToggle: () => void }) {
   /*
    * The whole row is one real button: a styled div takes a click but nothing
    * else, while role="switch" + aria-checked is how assistive tech learns
    * both what this is and which way it currently points, and Enter/Space
    * come free with the element.
    */
   return (
      <button
         type="button"
         role="switch"
         aria-checked={enabled}
         onClick={onToggle}
         className="w-full text-left flex items-start gap-6 cursor-pointer group p-4 hover:bg-slate-50/50 rounded-3xl transition-all border border-transparent hover:border-slate-100 focus-visible:outline-teal-500"
      >
         <div className="flex-1">
            <div className="font-bold text-slate-900 text-sm tracking-tight">{label}</div>
            <div className="text-slate-600 font-light text-xs leading-relaxed mt-0.5">{description}</div>
         </div>
         <div className={cn("relative w-14 h-8 rounded-full shrink-0 transition-all duration-500 border-2 shadow-inner mt-1", enabled ? "bg-teal-500 border-teal-600 ring-4 ring-teal-500/10" : "bg-slate-200 border-slate-300 ring-4 ring-slate-200/5")}>
             <div className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-xl transition-all duration-500", enabled ? "left-[calc(100%-24px)]" : "left-1.5")}></div>
         </div>
      </button>
   )
}
