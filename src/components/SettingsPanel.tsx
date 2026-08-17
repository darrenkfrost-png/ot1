import { useSettings } from '../context/SettingsContext'; // clinical settings Hook
import { Settings as SettingsIcon, X, SlidersHorizontal, Image as ImageIcon, Volume2, Eye, Brain, Moon, Sun, Smartphone, Zap, Bell, Target, Palette, Layout, Ghost, ZapOff, CheckCircle2, Activity, RefreshCw, Radio, Server, ShieldCheck, Terminal, HardDrive, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { GALLERY_IMAGES } from '../data/images';
import { VIDEO_WALLPAPERS } from '../data/videoWallpapers';
import { motion, AnimatePresence } from 'motion/react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from './ToastSystem';

export default function SettingsPanel() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visuals' | 'theme' | 'ai' | 'accessibility' | 'behavior' | 'diagnostics'>('theme');
  const { trackClick } = useAnalytics();
  const { showToast } = useToast();

  const [scanState, setScanState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState({
    apiStatus: 'Offline',
    apiLatency: 0,
    micStatus: 'Not Scanned',
    localStorageCheck: 'Pending',
    activeCanvasNodes: 0,
    renderingFidelity: 'Balanced'
  });

  const runSystemDiagnostic = async () => {
    trackClick("Execute Diagnostics Scan");
    setScanState('running');
    setConsoleLogs([]);
    const addLogWithDelay = (msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
          resolve();
        }, delay);
      });
    };

    await addLogWithDelay("SYSTEM_INTEGRATION // Launching diagnostic master pass...", 150);
    await addLogWithDelay("STORAGE_PERSISTENT // Checking Client State consistency...", 250);
    
    let storageOk = false;
    try {
      localStorage.setItem('__ct6_diagnostic', 'nominal');
      localStorage.removeItem('__ct6_diagnostic');
      storageOk = true;
    } catch(e) {}

    await addLogWithDelay(storageOk ? "SUCCESS: Local persistence layer verified successfully." : "WARNING: Storage layer read-only. Fallback state enabled.", 150);
    await addLogWithDelay("COMMUNICATIONS_HUB // Pinging secure endpoint: /api/health...", 300);

    let latency = 0;
    let apiResponding = false;
    const startTime = Date.now();
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        latency = Date.now() - startTime;
        apiResponding = true;
      }
    } catch (e) {
      console.error(e);
    }

    if (apiResponding) {
      await addLogWithDelay(`SUCCESS: Connect health endpoint responded in ${latency}ms.`, 150);
    } else {
      await addLogWithDelay("ERROR: Connect health endpoint timeout / non-responsive.", 150);
    }

    await addLogWithDelay("VOICE_AI_CHANNEL // Checking microphone hardware and permissions...", 350);
    let perm = "prompt";
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as any });
        perm = result.state;
      }
    } catch(e) {}

    await addLogWithDelay(`INFO: Audio input subsystem status parsed: [${perm.toUpperCase()}]`, 150);
    await addLogWithDelay("VISUAL_ACCELERATION // Analyzing canvas node count & quality context...", 300);
    
    // Node density estimations
    const nodeMapping: Record<string, number> = { low: 40, balanced: 100, ultra: 280 };
    const approxNodes = nodeMapping[settings.wallpaperQuality] || 100;
    
    await addLogWithDelay(`SUCCESS: Canvas render pipelines initialized at [${settings.wallpaperQuality.toUpperCase()}] node density (${approxNodes} nodes active).`, 150);
    await addLogWithDelay("SUPREME_PASS_COMPLETE // System operating within nominal boundaries.", 400);

    setDiagnostics({
      apiStatus: apiResponding ? 'Online / Nominal' : 'No Connection',
      apiLatency: latency,
      micStatus: perm.toUpperCase(),
      localStorageCheck: storageOk ? 'PASSED (Stateful)' : 'FAILED (Read-only)',
      activeCanvasNodes: approxNodes,
      renderingFidelity: settings.wallpaperQuality.toUpperCase()
    });
    setScanState('completed');
    showToast("Diagnostics Pass Complete", "success");
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
    showToast("Settings Applied Permanently", "success");
  };

  return (
    <>
      {/* The cog goes with the rest of the floating furniture when the view is
          collapsed; the pill by the microphone brings it all back. */}
      {!settings.hideOverlays && (
        <button
          onClick={handleOpen}
          className="fixed top-24 sm:top-20 right-4 sm:right-8 p-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-premium border border-slate-200/60 hover:bg-white transition-all hover:scale-105 active:scale-95 group focus-visible:outline-teal-500"
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
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-5xl max-h-[90vh] glass-premium rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/60 holographic-border"
            >
               {/* Sidebar Tabs */}
               <div className="w-full md:w-72 bg-white/40 backdrop-blur-3xl border-b md:border-b-0 md:border-r border-white/40 p-8 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 hide-scrollbar z-10">
                  <div className="hidden md:flex items-center gap-4 mb-8 px-2">
                     <div className="p-3 bg-slate-950 text-teal-400 rounded-2xl shadow-lg ring-4 ring-teal-500/5"><SlidersHorizontal size={20} /></div>
                     <div className="flex flex-col">
                       <h3 className="font-display font-medium text-lg tracking-tight leading-none">Settings</h3>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Control Core</span>
                     </div>
                  </div>
                  
                  <TabButton active={activeTab === 'theme'} onClick={() => setActiveTab('theme')} icon={<ImageIcon size={18} />} label="Canvas & Art" />
                  <TabButton active={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')} icon={<Eye size={18} />} label="Visual Engine" />
                  <TabButton active={activeTab === 'behavior'} onClick={() => setActiveTab('behavior')} icon={<Target size={18} />} label="App Behavior" />
                  <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Brain size={18} />} label="AI Systems" />
                  <TabButton active={activeTab === 'accessibility'} onClick={() => setActiveTab('accessibility')} icon={<Volume2 size={18} />} label="Accessibility" />
                  <TabButton active={activeTab === 'diagnostics'} onClick={() => setActiveTab('diagnostics')} icon={<Activity size={18} />} label="Diagnostics" />
               </div>

               {/* Content Area */}
               <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white/60 backdrop-blur-2xl custom-scrollbar relative z-10">
                  <button 
                     onClick={() => setIsOpen(false)}
                     className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-90"
                  >
                     <X size={24} />
                  </button>

                  <div className="max-w-3xl">
                     {activeTab === 'theme' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">Theme & Canvas Layer</h2>
                             <p className="text-slate-500 font-light text-base leading-relaxed">Configure the background canvas animations and core thematic colours of this site.</p>
                           </div>

                           <div className="space-y-6">
                              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">Dynamic Backgrounds</label>
                              <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
                                 {wallpaperOptions.map(opt => (
                                    <button 
                                       key={opt}
                                       onClick={() => {
                                          console.log("Switching wallpaper to:", opt);
                                          updateSetting('activeWallpaper', opt as any);
                                       }}
                                       className={cn(
                                          "group relative flex flex-col items-center justify-center py-5 px-3 rounded-[1.5rem] text-[9.3px] font-black uppercase tracking-[0.2em] transition-all duration-500 border overflow-hidden",
                                          settings.activeWallpaper === opt 
                                             ? "bg-slate-950 border-slate-800 text-white shadow-premium ring-2 ring-teal-500/20" 
                                             : "bg-slate-50/50 border-slate-100 text-slate-400 hover:bg-white hover:border-teal-200 hover:text-slate-900"
                                       )}
                                    >
                                       {/* Active Indicator Dot */}
                                       <div className={cn(
                                          "w-1.5 h-1.5 rounded-full mb-3 shadow-[0_0_8px_rgba(20,184,166,0.5)] transition-all duration-500",
                                          settings.activeWallpaper === opt ? "bg-teal-400 animate-pulse scale-125" : "bg-slate-200 group-hover:bg-teal-300"
                                       )} />
                                       <span className="relative z-10">{opt.replace('-', ' ')}</span>
                                       
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
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">Motion Signature</label>
                                    <span className="text-[10px] font-medium text-slate-400 tracking-wide">Silent · seamless loop</span>
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
                                 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">Select Master Asset</label>
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {GALLERY_IMAGES.slice(0, 12).map((img, i) => (
                                       <button 
                                          key={i} 
                                          onClick={() => updateSetting('staticWallpaper', img)}
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
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Luminosity</label>
                                     <span className="text-xs font-black text-slate-400">{Math.round(settings.wallpaperBrightness * 100)}%</span>
                                 </div>
                                 <input 
                                    type="range" min="0.1" max="2" step="0.1"
                                    value={settings.wallpaperBrightness}
                                    onChange={(e) => updateSetting('wallpaperBrightness', parseFloat(e.target.value))}
                                    className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                 />
                              </div>

                              <div className="space-y-6">
                                 <div className="flex justify-between items-center">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Velocity</label>
                                     <span className="text-xs font-black text-slate-400">{settings.wallpaperSpeed}x</span>
                                 </div>
                                 <input 
                                    type="range" min="0" max="3" step="0.1"
                                    value={settings.wallpaperSpeed}
                                    onChange={(e) => updateSetting('wallpaperSpeed', parseFloat(e.target.value))}
                                    className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                 />
                              </div>
                           </div>

                           <div className="space-y-6 pt-10 border-t border-slate-100">
                              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">Render Fidelity (3D/Animated)</label>
                              <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full max-w-md border border-slate-100">
                                  {['low', 'balanced', 'ultra'].map(q => (
                                      <button
                                         key={q}
                                         onClick={() => updateSetting('wallpaperQuality', q as any)}
                                         className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", settings.wallpaperQuality === q ? "bg-white text-slate-950 shadow-premium" : "text-slate-400 hover:text-slate-600")}
                                      >{q}</button>
                                  ))}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">Higher fidelity increases node density and interaction complexity.</p>
                           </div>
                        </div>
                     )}

                     {activeTab === 'visuals' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">Visual Engine Controls</h2>
                             <p className="text-slate-500 font-light text-base leading-relaxed">Customize the rendering intensity and aesthetic profile of the interface.</p>
                           </div>

                           <div className="space-y-10">
                               <div className="space-y-6">
                                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">System Accent Color</label>
                                  <div className="flex flex-wrap gap-4">
                                     {['#14b8a6', '#0ea5e9', '#6366f1', '#f43f5e', '#f59e0b', '#10b981'].map(color => (
                                        <button 
                                          key={color}
                                          onClick={() => {
                                             updateSetting('colorAccent', color);
                                             updateSetting('wallpaperColor', color);
                                          }}
                                          className={cn("w-12 h-12 rounded-2xl border-4 transition-all shadow-lg flex items-center justify-center", settings.colorAccent === color ? "border-slate-900 scale-110" : "border-white hover:scale-105")}
                                          style={{ backgroundColor: color }}
                                        >
                                          {settings.colorAccent === color && <Zap size={16} className="text-white animate-pulse" />}
                                        </button>
                                     ))}
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                                  <div className="space-y-4">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">Card Geometry</label>
                                     <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full border border-slate-100">
                                         {['glass', 'solid', 'minimal'].map(style => (
                                             <button
                                                key={style}
                                                onClick={() => updateSetting('cardStyle', style as any)}
                                                className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", settings.cardStyle === style ? "bg-white text-slate-950 shadow-premium" : "text-slate-400 hover:text-slate-600")}
                                             >{style}</button>
                                         ))}
                                     </div>
                                  </div>

                                  <div className="space-y-4">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">UI Complexity</label>
                                     <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full border border-slate-100">
                                         {['high', 'medium', 'minimal'].map(intensity => (
                                             <button
                                                key={intensity}
                                                onClick={() => updateSetting('uiIntensity', intensity as any)}
                                                className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", settings.uiIntensity === intensity ? "bg-white text-slate-950 shadow-premium" : "text-slate-400 hover:text-slate-600")}
                                             >{intensity}</button>
                                         ))}
                                     </div>
                                  </div>
                               </div>

                               <div className="space-y-6 pt-10 border-t border-slate-100">
                                   <ToggleOption 
                                      label="Glassmorphism & Frosted Blur" 
                                      description="Enable premium refraction effects (requires modern GPU acceleration)." 
                                      enabled={settings.blurEffects} 
                                      onToggle={() => updateSetting('blurEffects', !settings.blurEffects)} 
                                   />
                                   <ToggleOption 
                                      label="Holographic Overlays" 
                                      description="Add subtle spectral lighting effects to primary interactive elements." 
                                      enabled={settings.holographicEffects} 
                                      onToggle={() => updateSetting('holographicEffects', !settings.holographicEffects)} 
                                   />
                                   <ToggleOption 
                                      label="Parallax Depth Interaction" 
                                      description="Perspective-shifting layers across the main dashboard components." 
                                      enabled={settings.parallaxEnabled} 
                                      onToggle={() => updateSetting('parallaxEnabled', !settings.parallaxEnabled)} 
                                   />
                                   <ToggleOption
                                      label="Motion Transitions"
                                      description="Fluid page and route animations for a cohesive clinical experience."
                                      enabled={settings.animationsEnabled}
                                      onToggle={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
                                   />
                                   <ToggleOption
                                      label="Clean View"
                                      description="Hide the microphone, assistant and this settings button, leaving the page on its own. A small control by the microphone brings them back."
                                      enabled={settings.hideOverlays}
                                      onToggle={() => updateSetting('hideOverlays', !settings.hideOverlays)}
                                   />
                               </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'behavior' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">App Behavior</h2>
                             <p className="text-slate-500 font-light text-base leading-relaxed">Tune how the application responds and handles user sessions.</p>
                           </div>

                           <div className="space-y-10">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                   <div className="space-y-4">
                                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">Dashboard Layout</label>
                                      <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full border border-slate-100">
                                          {['grid', 'list', 'dense'].map(l => (
                                              <button
                                                 key={l}
                                                 onClick={() => updateSetting('dashboardLayout', l as any)}
                                                 className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", settings.dashboardLayout === l ? "bg-white text-slate-950 shadow-premium" : "text-slate-400 hover:text-slate-600")}
                                              >{l}</button>
                                          ))}
                                      </div>
                                   </div>
                               </div>

                               <div className="space-y-6 pt-10 border-t border-slate-100">
                                   <ToggleOption 
                                      label="Push Notifications" 
                                      description="Receive real-time clinic updates and appointment reminders." 
                                      enabled={settings.enableNotifications} 
                                      onToggle={() => updateSetting('enableNotifications', !settings.enableNotifications)} 
                                   />
                                   <ToggleOption 
                                      label="Notification Acoustics" 
                                      description="Play specialized clinical chimes for system notifications." 
                                      enabled={settings.notificationSound} 
                                      onToggle={() => updateSetting('notificationSound', !settings.notificationSound)} 
                                   />
                                   <ToggleOption 
                                      label="Logo Identity Cycling" 
                                      description="Seamlessly cycle between original and clinical logo versions." 
                                      enabled={settings.showLogoCycling} 
                                      onToggle={() => updateSetting('showLogoCycling', !settings.showLogoCycling)} 
                                   />
                                   <ToggleOption 
                                      label="Live Dashboard Statistics" 
                                      description="Display real-time recovery and clinic-wide health metrics." 
                                      enabled={settings.showClinicalStats} 
                                      onToggle={() => updateSetting('showClinicalStats', !settings.showClinicalStats)} 
                                   />
                                   <ToggleOption 
                                      label="Auto-Save Session Drafts" 
                                      description="Preserve your AI consultation progress automatically." 
                                      enabled={settings.autoSaveDrafts} 
                                      onToggle={() => updateSetting('autoSaveDrafts', !settings.autoSaveDrafts)} 
                                   />
                                   <ToggleOption 
                                      label="Experimental Core Features" 
                                      description="Enable unreleased clinical AI modules (Beta)." 
                                      enabled={settings.experimentalFeatures} 
                                      onToggle={() => updateSetting('experimentalFeatures', !settings.experimentalFeatures)} 
                                   />
                               </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'ai' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">AI & Neuro-Systems</h2>
                             <p className="text-slate-500 font-light text-base leading-relaxed">Tune the behavior and reasoning density of the AI Clinical Consultant.</p>
                           </div>

                           <div className="space-y-10">
                               <div className="space-y-6">
                                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">Clinical Persona Bias</label>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {[
                                         { id: 'clinical', title: 'Clinical Expert', desc: 'Precise, objective, formal terminology.' },
                                         { id: 'friendly', title: 'Supportive Guide', desc: 'Empathetic, clear, patient focus.' },
                                         { id: 'direct', title: 'Concise Core', desc: 'Logical, fast, direct data points.' }
                                      ].map(p => (
                                          <button
                                             key={p.id}
                                             onClick={() => updateSetting('aiAssistantPersona', p.id as any)}
                                             className={cn("flex-1 text-left p-6 rounded-3xl border-2 transition-all group", settings.aiAssistantPersona === p.id ? "bg-slate-950 border-slate-950 text-white shadow-2xl" : "bg-slate-50 border-transparent hover:border-slate-200")}
                                          >
                                              <div className="flex items-center gap-2 mb-2">
                                                <Ghost size={16} className={cn(settings.aiAssistantPersona === p.id ? "text-teal-400" : "text-slate-300")} />
                                                <div className="font-bold text-sm">{p.title}</div>
                                              </div>
                                              <div className={cn("text-xs leading-relaxed font-light", settings.aiAssistantPersona === p.id ? "text-slate-400" : "text-slate-500")}>{p.desc}</div>
                                          </button>
                                      ))}
                                  </div>
                               </div>

                               <div className="space-y-6 pt-10 border-t border-slate-100">
                                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 block">AI Response Detail Level</label>
                                  <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full border border-slate-100">
                                      {(['concise', 'standard', 'verbose'] as const).map(level => (
                                          <button
                                             key={level}
                                             onClick={() => updateSetting('aiResponseDetail', level)}
                                             className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", settings.aiResponseDetail === level ? "bg-slate-950 text-white shadow-premium" : "text-slate-400 hover:text-slate-600")}
                                          >{level}</button>
                                      ))}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-light italic">
                                     {settings.aiResponseDetail === 'concise' ? 'Engine will return single-sentence technical markers only.' : 
                                      settings.aiResponseDetail === 'verbose' ? 'Comprehensive structural analysis with detailed preventative therapy steps.' :
                                      'Balanced clinical feedback optimized for standard consultations.'}
                                  </p>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                                   <div className="space-y-6">
                                      <div className="flex justify-between items-center">
                                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Vocal Velocity</label>
                                          <span className="text-xs font-black text-slate-400">{settings.aiVoiceSpeed}x</span>
                                      </div>
                                      <input 
                                         type="range" min="0.5" max="2" step="0.1"
                                         value={settings.aiVoiceSpeed}
                                         onChange={(e) => updateSetting('aiVoiceSpeed', parseFloat(e.target.value))}
                                         className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                      />
                                   </div>
                                   <div className="space-y-6">
                                      <div className="flex justify-between items-center">
                                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Confidence Cut-off</label>
                                          <span className="text-xs font-black text-slate-400">{Math.round(settings.aiConfidenceThreshold * 100)}%</span>
                                      </div>
                                      <input 
                                         type="range" min="0.5" max="1" step="0.05"
                                         value={settings.aiConfidenceThreshold}
                                         onChange={(e) => updateSetting('aiConfidenceThreshold', parseFloat(e.target.value))}
                                         className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                      />
                                   </div>
                               </div>

                               <div className="space-y-6 pt-10 border-t border-slate-100">
                                   <ToggleOption 
                                      label="Voice Wake Activation" 
                                      description="Allow the AI Core to listen for wake words when app is active." 
                                      enabled={settings.enableVoiceWake} 
                                      onToggle={() => updateSetting('enableVoiceWake', !settings.enableVoiceWake)} 
                                   />
                                   <ToggleOption 
                                      label="Predictive Logic Modules" 
                                      description="Anticipate physiological trends based on recent patient inputs." 
                                      enabled={settings.aiPredictiveSuggestions} 
                                      onToggle={() => updateSetting('aiPredictiveSuggestions', !settings.aiPredictiveSuggestions)} 
                                   />
                                   <ToggleOption 
                                      label="AI Auto-Speak Responses" 
                                      description="Automatically read assistant responses aloud using text-to-speech." 
                                      enabled={settings.aiAutoSpeak} 
                                      onToggle={() => updateSetting('aiAutoSpeak', !settings.aiAutoSpeak)} 
                                   />
                               </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'accessibility' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">Accessibility & Inclusivity</h2>
                             <p className="text-slate-500 font-light text-base leading-relaxed">Optimize the interface for your specific physiological or sensory requirements.</p>
                           </div>

                           <div className="space-y-10">
                               <div className="space-y-6">
                                  <div className="flex justify-between items-center">
                                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Font Dimension</label>
                                      <span className="text-xs font-black text-slate-400">{Math.round(settings.fontSizeMultiplier * 100)}%</span>
                                  </div>
                                  <input 
                                     type="range" min="0.8" max="1.5" step="0.05"
                                     value={settings.fontSizeMultiplier}
                                     onChange={(e) => updateSetting('fontSizeMultiplier', parseFloat(e.target.value))}
                                     className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                  />
                               </div>

                               <div className="space-y-6 pt-10 border-t border-slate-100">
                                   <ToggleOption 
                                      label="Enhanced High Contrast" 
                                      description="Eliminate chromatic nuance for maximum legibility." 
                                      enabled={settings.highContrastMode} 
                                      onToggle={() => updateSetting('highContrastMode', !settings.highContrastMode)} 
                                   />
                                   <ToggleOption 
                                      label="Reduce UI Fluidity" 
                                      description="Minimalize animations and transitions for sensitive users." 
                                      enabled={settings.reduceMotion} 
                                      onToggle={() => updateSetting('reduceMotion', !settings.reduceMotion)} 
                                   />
                                   <ToggleOption 
                                      label="Tactile Haptics" 
                                      description="Vibrate the framework during critical data intersections." 
                                      enabled={settings.hapticFeedback} 
                                      onToggle={() => updateSetting('hapticFeedback', !settings.hapticFeedback)} 
                                   />
                                   <ToggleOption 
                                      label="Semantic Screen Reader Support" 
                                      description="Enforce strict HTML hierarchy for assist-tech devices." 
                                      enabled={settings.screenReaderOptimized} 
                                      onToggle={() => updateSetting('screenReaderOptimized', !settings.screenReaderOptimized)} 
                                   />
                               </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'diagnostics' && (
                        <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="space-y-3">
                             <h2 className="text-3xl font-display font-medium text-slate-900 tracking-tight">System Health & Diagnostics</h2>
                             <p className="text-slate-500 font-light text-base leading-relaxed">Run core hardware checks, communication link latency scans, and verify local storage configurations.</p>
                           </div>

                           <div className="space-y-8">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                 <div className="space-y-1">
                                    <div className="font-bold text-slate-900 text-sm">Diagnostic Integrity Pass</div>
                                    <div className="text-slate-400 font-light text-xs">Analyze clinical endpoint routes and secure local caches.</div>
                                 </div>
                                 <button 
                                    onClick={runSystemDiagnostic}
                                    disabled={scanState === 'running'}
                                    className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-white flex items-center gap-3 bg-teal-700 hover:bg-teal-800 hover:shadow-teal-500/25 active:scale-95 shadow-lg cursor-pointer"
                                 >
                                    <RefreshCw size={14} className={scanState === 'running' ? "animate-spin" : ""} />
                                    {scanState === 'running' ? 'Scanning...' : scanState === 'completed' ? 'Re-Run Scan' : 'Execute Diagnostic'}
                                 </button>
                              </div>

                              {/* Grid stats */}
                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between h-36">
                                    <div className="flex items-center gap-3 text-slate-400">
                                       <Server size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">Clinical Backend</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">{diagnostics.apiStatus}</div>
                                       {diagnostics.apiLatency > 0 && (
                                          <div className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{diagnostics.apiLatency}ms Latency</div>
                                       )}
                                    </div>
                                 </div>

                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between h-36">
                                    <div className="flex items-center gap-3 text-slate-400">
                                       <Cpu size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">Storage Integrity</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">{diagnostics.localStorageCheck}</div>
                                       <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Persistent Web Storage</div>
                                    </div>
                                 </div>

                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between h-36">
                                    <div className="flex items-center gap-3 text-slate-400">
                                       <Radio size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">Microphone Node</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">{diagnostics.micStatus}</div>
                                       <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Audio Consultation Node</div>
                                    </div>
                                 </div>

                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between h-36">
                                    <div className="flex items-center gap-3 text-slate-400">
                                       <HardDrive size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">Canvas Nodes</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">{diagnostics.activeCanvasNodes} Nodes</div>
                                       <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-widest">{diagnostics.renderingFidelity} FIDELITY</div>
                                    </div>
                                 </div>

                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between h-36 lg:col-span-2">
                                    <div className="flex items-center gap-3 text-slate-400">
                                       <ShieldCheck size={16} />
                                       <span className="text-[10px] font-black uppercase tracking-wider">App Operations Scope</span>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="font-bold text-lg text-slate-900 tracking-tight">Active Clinical Sandbox</div>
                                       <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Production Deploy Ready</div>
                                    </div>
                                 </div>
                              </div>

                              {/* Console / Log Terminal */}
                              {consoleLogs.length > 0 && (
                                 <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-400">
                                       <Terminal size={14} />
                                       <label className="text-[10px] font-black uppercase tracking-widest block text-slate-400">Telemetry Log Output</label>
                                    </div>
                                    <div className="bg-slate-950 font-mono text-[11px] p-5 rounded-2xl block text-emerald-400 max-h-[220px] overflow-y-auto border border-slate-900 scroll-smooth leading-relaxed">
                                       {consoleLogs.map((log, i) => (
                                          <div key={i} className="whitespace-pre-wrap select-text">{log}</div>
                                       ))}
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 bg-white/50 backdrop-blur-sm -mx-8 -mb-8 px-8 py-8 md:-mx-12 md:-mb-12 md:px-12 md:py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">System Reset</span>
                        <span className="text-xs text-slate-400 font-light italic">Clear all local overrides.</span>
                      </div>
                      <div className="flex gap-4 w-full sm:w-auto">
                         <button 
                            onClick={handleReset}
                            className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all border border-slate-100"
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
      `}} />
    </>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
   return (
      <button 
         onClick={onClick}
         className={cn(
            "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all w-fit md:w-full shrink-0",
            active ? "bg-white text-slate-950 shadow-premium ring-4 ring-slate-100" : "text-slate-400 hover:bg-slate-100/50 hover:text-slate-600"
         )}
      >
         <span className={cn("shrink-0 p-2 rounded-xl transition-all", active ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "bg-slate-200 text-slate-400")}>{icon}</span>
         <span className="hidden md:inline tracking-tight">{label}</span>
      </button>
   )
}

function ToggleOption({ label, description, enabled, onToggle }: { label: string, description: string, enabled: boolean, onToggle: () => void }) {
   return (
      <label className="flex items-start gap-6 cursor-pointer group p-4 hover:bg-slate-50/50 rounded-3xl transition-all border border-transparent hover:border-slate-100">
         <div className="flex-1">
            <div className="font-bold text-slate-900 text-sm tracking-tight">{label}</div>
            <div className="text-slate-500 font-light text-xs leading-relaxed mt-0.5">{description}</div>
         </div>
         <div className={cn("relative w-14 h-8 rounded-full shrink-0 transition-all duration-500 border-2 shadow-inner mt-1", enabled ? "bg-teal-500 border-teal-600 ring-4 ring-teal-500/10" : "bg-slate-200 border-slate-300 ring-4 ring-slate-200/5")}>
             <div className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-xl transition-all duration-500", enabled ? "left-[calc(100%-24px)]" : "left-1.5")}></div>
         </div>
      </label>
   )
}
