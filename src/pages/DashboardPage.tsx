import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  TrendingUp, 
  CalendarCheck, 
  Target, 
  Award, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Zap, 
  CheckCircle2, 
  Sliders, 
  AlertTriangle, 
  Stethoscope, 
  HeartPulse,
  Cpu,
  RefreshCw, 
  Terminal,
  Printer,
  Info,
  Brain,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';
import { cn } from '../lib/utils';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from '../components/ToastSystem';
import { CLINIC } from '../data/clinic';
import { PRACTITIONERS } from '../data';
import { BOOKING_URL } from '../constants';
import { GALLERY_IMAGES } from '../data/images';
import { VIDEOS } from '../data/resources';

/** The four example stages - the card titles and the dialog titles. */
const MILESTONE_TITLES = ['Settling down', 'Moving more easily', 'Getting stronger', 'Finishing treatment'];

interface AuditData {
  overallHealth: number;
  architecturalInsights: string[];
  nextStepRoadmap: string[];
  upgradeReview: string;
}

export default function DashboardPage() {
  const { trackClick } = useAnalytics();
  const { showToast } = useToast();

  // Daily Exercise Tracking State
  const [exercises, setExercises] = useState([
    { id: 'ex1', title: 'Cervical Retraction (Isometric)', sets: '3 sets of 10s', completed: false },
    { id: 'ex2', title: 'Levator Scapulae Active Soft Stretch', sets: '2 sets of 30s', completed: false },
    { id: 'ex3', title: 'Thoracic Extension mobilisation', sets: '12 slow reps', completed: false },
    { id: 'ex4', title: 'Decompression Breathwork Cycle', sets: '5 slow minutes', completed: false },
  ]);

  /*
   * The sample chart. Eight weeks of an EXAMPLE neck recovery, not anyone's
   * record. Ticking the practice checklist moves the last week, so a visitor
   * can see how a chart like this works. Week 8 starts at its no-ticks values
   * (it used to start higher, so the first tick made the numbers WORSE while
   * a toast announced progress). Derived from the checklist, not stored, so
   * resetting the checklist resets the chart too.
   */
  const completedCount = exercises.filter(ex => ex.completed).length;
  const chartData = useMemo(() => {
    const weeks = [
      { week: 'Wk 1', painLevel: 8, mobility: 30, strength: 25 },
      { week: 'Wk 2', painLevel: 6, mobility: 45, strength: 35 },
      { week: 'Wk 3', painLevel: 5, mobility: 55, strength: 45 },
      { week: 'Wk 4', painLevel: 4, mobility: 65, strength: 55 },
      { week: 'Wk 5', painLevel: 3, mobility: 75, strength: 65 },
      { week: 'Wk 6', painLevel: 2, mobility: 85, strength: 75 },
      { week: 'Wk 7', painLevel: 1, mobility: 90, strength: 85 },
      { week: 'Wk 8', painLevel: 1, mobility: 92, strength: 90 },
    ];
    const last = weeks.length - 1;
    weeks[last] = {
      ...weeks[last],
      mobility: Math.min(92 + completedCount * 2, 100),
      strength: Math.min(90 + completedCount * 2, 100),
      painLevel: completedCount > 2 ? 0 : 1,
    };
    return weeks;
  }, [completedCount]);

  // Biomechanical ROM Simulator States
  const [romNeckFlexion, setRomNeckFlexion] = useState(65); // degrees (optimal ~45-80)
  const [romNeckRotation, setRomNeckRotation] = useState(55); // degrees (optimal ~70-90)
  const [painLevel, setPainLevel] = useState(4); // 0-10 scale

  // UPGRADE 1: Interactive Milestone States
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const milestoneDialogRef = React.useRef<HTMLDivElement | null>(null);
  // The card that opened the dialog, so focus can go back to it on close.
  const milestoneOpenerRef = React.useRef<HTMLButtonElement | null>(null);

  // Keyboard and screen-reader users must land inside the dialog when it
  // opens; Escape closes it, and focus returns to the card that opened it.
  // Tab stays inside it too: its Close button is its only control, so Tab
  // goes there rather than to the page hidden behind the dimmed backdrop.
  useEffect(() => {
    if (selectedMilestone === null) return;
    milestoneDialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedMilestone(null);
      } else if (e.key === 'Tab') {
        const close = milestoneDialogRef.current?.querySelector<HTMLButtonElement>('button');
        if (close) {
          e.preventDefault();
          close.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const opener = milestoneOpenerRef.current;
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [selectedMilestone]);

  // UPGRADE 5: Sound Synthesizer function
  const playAcousticPing = useCallback((freq: number, duration: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio playback blocked by browser policy — fail silently
    }
  }, []);

  // The printable visit summary. Built on this device only; it holds the
  // date it was made, nothing else - the readings on it are always live.
  const [triageReport, setTriageReport] = useState<{ date: string } | null>(null);
  // A stable callback ref: moves keyboard focus onto the summary when it
  // appears (the button that made it disappears), and only then - an inline
  // arrow would re-run on every slider move and steal focus back.
  const focusOnMount = useCallback((el: HTMLElement | null) => { el?.focus(); }, []);

  // System Audit Live State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditData | null>(null);

  // ==========================================
  // PT Prescription & SOAP draft states
  // ==========================================
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [isAiPrescribedMode, setIsAiPrescribedMode] = useState(false);

  const [soapSymptoms, setSoapSymptoms] = useState("");
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const [soapNoteResult, setSoapNoteResult] = useState<string | null>(null);

  const handleRestoreDefaultExercises = () => {
    trackClick("Restore Default Exercises");
    setExercises([
      { id: 'ex1', title: 'Cervical Retraction (Isometric)', sets: '3 sets of 10s', completed: false },
      { id: 'ex2', title: 'Levator Scapulae Active Soft Stretch', sets: '2 sets of 30s', completed: false },
      { id: 'ex3', title: 'Thoracic Extension mobilisation', sets: '12 slow reps', completed: false },
      { id: 'ex4', title: 'Decompression Breathwork Cycle', sets: '5 slow minutes', completed: false },
    ]);
    setIsAiPrescribedMode(false);
    showToast("Reverted to standard baseline clinical exercise plan.", "success");
  };

  const handleGenerateSoapNote = async () => {
    trackClick("Draft AI SOAP Note");
    setIsGeneratingSoap(true);


    /* Built here, from what the visitor typed and the sliders on this page.
       The AI service this once called was removed from the server, so every
       press ended in an error. No AI now, and nothing leaves the device. */
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const noticed = soapSymptoms.trim() || '(nothing written yet)';
    setSoapNoteResult(
      `Notes for my appointment, ${today}\n\n` +
      `What I have noticed:\n${noticed}\n\n` +
      `My own readings from the Recovery Tools page:\n` +
      `- Looking down: ${romNeckFlexion}°\n` +
      `- Turning my head: ${romNeckRotation}°\n` +
      `- Pain: ${painLevel} out of 10\n\n` +
      `Questions I want to ask:\n- `
    );
    setIsGeneratingSoap(false);
    showToast("Your note is ready below. Check it, then copy or print it.", "success");
  };

  // Ticking a row. The sample chart follows from `exercises` (see chartData),
  // so nothing here reaches into other state from inside an updater.
  const handleToggleExercise = useCallback((id: string) => {
    trackClick("Toggle Rehab Exercise Checkbox");
    const willBeTicked = !exercises.find(ex => ex.id === id)?.completed;
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
    if (willBeTicked) {
      showToast("Ticked off. The last week of the sample chart moves with your ticks. Nothing is saved.", "success");
    }
  }, [exercises, trackClick, showToast]);

  // Musculoskeletal rating formulas
  const calculatedBioScore = useMemo(() => Math.round(((romNeckFlexion / 80) * 45) + ((romNeckRotation / 90) * 45) - (painLevel * 5) + 10), [romNeckFlexion, romNeckRotation, painLevel]);
  const bioScoreLimit = useMemo(() => Math.max(10, Math.min(calculatedBioScore, 100)), [calculatedBioScore]);

  const advice = useMemo(() => {
    if (painLevel >= 7) {
      return { status: "High discomfort", desc: "That is a high score. If pain is severe or getting worse, or comes with numbness, weakness or a fever, call the clinic or NHS 111 rather than waiting for your next visit.", color: "text-red-700", border: "border-red-500/20", bg: "bg-red-500/5" };
    }
    if (bioScoreLimit < 55) {
      return { status: "Some stiffness", desc: "Your neck is not moving as far as it could. Keep to the movements your practitioner gave you, and mention these numbers at your next appointment.", color: "text-amber-700", border: "border-amber-500/20", bg: "bg-amber-500/5" };
    }
    return { status: "Moving comfortably", desc: "Your neck is moving well and pain is low. Keep up the exercises you were given, and ask before adding anything new.", color: "text-teal-800", border: "border-teal-500/20", bg: "bg-teal-500/5" };
  }, [painLevel, bioScoreLimit]);

  /*
   * The visit summary. This used to wait 1.8 seconds, play beeps and show a
   * random "CT6-REHAB-######" number beside claims of encryption and a
   * therapist "pre-briefed" - none of which happened. It is built at once,
   * here, and dated; nothing is sent to the clinic.
   */
  const handleGenerateTriage = () => {
    trackClick("Make visit summary");
    setTriageReport({
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
    showToast("Your summary is ready. It stays on this device, and nothing has been sent anywhere.", "success");
  };

  /*
   * Device check. Real checks only - the server audit this once called was
   * removed.
   *
   * "The clinic website answered" used to fetch /api/health, which only exists
   * while the site's own Node server runs. Served as plain files (as it is on
   * the host) that address is a 404, so every visitor was told the website did
   * not answer while reading it. It now fetches robots.txt: a file every build
   * writes, which the service worker neither precaches nor routes, so a Yes
   * means the website really answered over the network just now.
   *
   * /api/health is still asked, but only to say whether the CONTACT FORM can
   * send, as a tip with the phone number - it is not a device matter and never
   * counts against the score.
   */
  const fetchWithTimeout = async (url: string, ms = 8000) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { cache: 'no-store', signal: controller.signal });
    } finally {
      window.clearTimeout(timer);
    }
  };

  const handleRunSystemAudit = async () => {
    trackClick("Run Live System Audit");
    setIsAuditing(true);

    const checks: [string, boolean][] = [];
    try { checks.push(['The clinic website answered', (await fetchWithTimeout('/robots.txt')).ok]); }
    catch { checks.push(['The clinic website answered', false]); }
    let canSave = false;
    try { localStorage.setItem('ct6-check', '1'); canSave = localStorage.getItem('ct6-check') === '1'; localStorage.removeItem('ct6-check'); } catch { /* blocked */ }
    checks.push(['This device can remember your settings', canSave]);
    checks.push(['This device is online', navigator.onLine]);

    // The contact form posts to the site's own server. 'yes' only when that
    // server says a delivery address is set (contactReady); 'unknown' when it
    // runs but does not say; 'no' when it is not there at all.
    let contactForm: 'yes' | 'no' | 'unknown' = 'no';
    try {
      const res = await fetchWithTimeout('/api/health');
      const isJson = (res.headers.get('content-type') || '').includes('application/json');
      if (res.ok && isJson) {
        const body = await res.json();
        contactForm = body?.contactReady === true ? 'yes' : body?.contactReady === false ? 'no' : 'unknown';
      }
    } catch { /* not reachable: the form cannot send either */ }
    const contactTip =
      contactForm === 'yes'
        ? 'The contact form can send messages to the clinic at the moment.'
        : contactForm === 'no'
          ? `Messages from the contact form cannot be sent at the moment. Call ${CLINIC.telephone} or email ${CLINIC.email} instead.`
          : `If a message from the contact form does not send, call ${CLINIC.telephone} or email ${CLINIC.email} instead.`;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setAuditResult({
      overallHealth: Math.round((checks.filter(([, ok]) => ok).length / checks.length) * 100),
      architecturalInsights: checks.map(([name, ok]) => `${ok ? 'Yes' : 'No'}: ${name.toLowerCase()}.`),
      nextStepRoadmap: [
        contactTip,
        'Text too small? The Settings cog can make it larger.',
        reduced ? 'Reduced motion is on, so the page keeps movement to a minimum.' : 'Prefer less movement on screen? Turn on reduced motion in Settings.',
        'Nothing you type or set on this page is sent to the clinic.',
      ],
      upgradeReview: checks.every(([, ok]) => ok)
        ? 'Everything this page needs is working on your device.'
        : `Something above said No. The page will still work, but if anything looks wrong, call the clinic on ${CLINIC.telephone}.`,
    });
    setIsAuditing(false);
    showToast("Check finished.", "success");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Section */}
      <section className="relative p-12 bg-slate-950 rounded-[4rem] text-white shadow-3xl overflow-hidden group holographic-border">
        {/* The site's own grain tile (.noise-tile in index.css). This texture
            used to be hotlinked from transparenttextures.com, an unrelated
            third-party site, which saw every visitor's address. */}
        <div className="absolute inset-0 z-0 noise-tile opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px] uppercase tracking-widest border border-teal-500/20">
                    <Activity size={14} className="animate-pulse" /> Patient Tools — Preview
                </span>
                <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tighter leading-none text-white">
                    Recovery <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Tools.</span>
                </h1>
                <p className="text-slate-400 max-w-xl text-lg font-light leading-relaxed">
                    Try the self-help tools we're building: log daily exercises, track movement and discomfort, and put together a summary sheet to bring to your appointment.
                </p>
            </div>
            
            <div className="flex gap-4" role="group" aria-label="Sample data — not a personal record">
                <div className="text-center bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                    <div className="text-[10px] uppercase font-black tracking-widest text-teal-400 mb-1">Current Phase</div>
                    <div className="text-2xl font-bold text-white">Active Rehab</div>
                    <div className="text-[11px] uppercase font-black tracking-widest text-slate-400 mt-1.5">Sample data</div>
                </div>
                <div className="text-center bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                    <div className="text-[10px] uppercase font-black tracking-widest text-emerald-400 mb-1">Goal Completion</div>
                    <div className="text-2xl font-bold text-white">78%</div>
                    <div className="text-[11px] uppercase font-black tracking-widest text-slate-400 mt-1.5">Sample data</div>
                </div>
            </div>
        </div>
      </section>

      {/* Honesty notice — this page has no login, so nothing on it can be anyone's personal record */}
      <section aria-label="Sample data notice" className="!mt-8">
        <div className="flex items-start sm:items-center gap-4 p-6 rounded-[2rem] bg-teal-50 border border-teal-200 shadow-sm">
          <Info size={22} className="text-teal-700 shrink-0" aria-hidden="true" />
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            A preview of the tools we're building — the numbers below are <span className="font-bold">sample data, not your record</span>.
            Nothing you try here is saved or sent anywhere, so play with the sliders and checklists freely, then print the summary to bring to your visit.
          </p>
        </div>
      </section>

      {/* Progress Chart Module */}
      <section className="space-y-6" role="region" aria-label="Sample progress data — a preview, not a personal record">
        <div className="flex items-center gap-3 ml-4">
            <TrendingUp size={24} className="text-teal-600" />
            <h2 className="text-3xl font-display font-bold text-slate-50 tracking-tight">Health Progress</h2>
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">Sample data</span>
        </div>
        
        <div className="bg-white/95 backdrop-blur-3xl p-8 lg:p-12 rounded-[3.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 relative overflow-hidden group crystal-glass holographic-border">
            <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none mix-blend-screen mix-blend-lighten z-0"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-teal-100/50 transition-colors z-0"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10 font-sans">
               {/* Left Controls/Stats */}
               <div className="lg:col-span-1 flex flex-col justify-between space-y-8">
                  <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900">Neck recovery (sample)</h3>
                      <p className="text-sm text-slate-600 font-light leading-relaxed">
                          An example of how eight weeks of neck recovery might look. It is not your record. Ticking an exercise below moves the last week of this example so you can see how a chart like this works. It does not measure you.
                      </p>
                  </div>

                  <div className="space-y-4">
                     {[
                         { label: "Movement", val: `${chartData[chartData.length - 1].mobility}%`, desc: 'Week 8 of the sample chart', color: "text-emerald-600" },
                         { label: "Pain", val: `${chartData[chartData.length - 1].painLevel}/10`, desc: "Week 8 of the sample chart", color: "text-teal-600" },
                     ].map((stat, i) => (
                         <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100/80 shadow-sm hover:shadow-lg transition-all cursor-default">
                             <div>
                                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">{stat.label}</div>
                                 <div className="text-xs text-slate-500 font-medium">{stat.desc}</div>
                             </div>
                             <div className={cn("text-xl font-bold", stat.color)}>{stat.val}</div>
                         </div>
                     ))}
                  </div>
               </div>

               {/* Right Chart */}
               <div className="text-slate-600 lg:col-span-3 h-[400px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMobility" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="week" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                itemStyle={{ fontWeight: 600, color: '#334155' }}
                            />
                            <Area type="monotone" dataKey="mobility" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorMobility)" name="Movement, sample (%)" activeDot={{ r: 6, fill: "#14b8a6", stroke: "#fff", strokeWidth: 2 }} />
                            <Area type="monotone" dataKey="strength" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStrength)" name="Strength, sample (%)" activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="painLevel" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Pain, sample (0-10)" dot={false} activeDot={{ r: 4 }} />
                        </AreaChart>
                   </ResponsiveContainer>
               </div>
            </div>
                      {/* Treatment Milestones */}
             <div className="mt-12 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                     <Target size={18} className="text-teal-500" /> Stages of recovery (example)
                   </h4>
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Tap a card to see what each stage means</span>
                </div>
                {/*
                  * These cards used to grade the visitor: a tick for "Full Range
                  * of Motion" once the sliders passed 75° and 85°, "Pre-approved"
                  * discharge when the pain slider fell below 3. Nothing on a web
                  * page may approve discharge or set targets from what a visitor
                  * types, so every card is now just an example stage. They are
                  * real buttons, so a keyboard can open them too.
                  */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {MILESTONE_TITLES.map((m, i) => (
                         <button
                           type="button"
                           key={i}
                           onClick={(e) => { milestoneOpenerRef.current = e.currentTarget; setSelectedMilestone(i); playAcousticPing(440, 0.08, 'triangle'); }}
                           className="w-full text-left flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/30 border border-transparent hover:border-teal-100 hover:shadow-md cursor-pointer transition-all duration-300 relative group"
                         >
                            <span className="flex items-center gap-3 w-full">
                               <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black bg-teal-700 text-white">
                                   <span className="text-[10px] font-mono">{i + 1}</span>
                               </span>
                               <span className="h-0.5 flex-1 rounded-full bg-slate-200" />
                            </span>
                            <span className="block">
                               <span className="block font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">{m}</span>
                               <span className="block text-[10px] uppercase font-black tracking-widest mt-1 text-slate-600">
                                 Example stage
                               </span>
                            </span>
                         </button>
                   ))}
                </div>

                {/* MIL_DETAIL OVERLAY (Upgrade 1 Modal dialog) */}
                <AnimatePresence>
                  {selectedMilestone !== null && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                      onClick={() => setSelectedMilestone(null)}
                    >
                      <motion.div
                        ref={milestoneDialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="milestone-title"
                        tabIndex={-1}
                        initial={{ scale: 0.95, y: 15 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 15 }}
                        className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border border-slate-100 shadow-2xl relative space-y-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Brackets */}
                        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-200"></div>
                        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-200"></div>

                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-black text-teal-800 tracking-widest">Example stage {selectedMilestone + 1}</span>
                          <h3 id="milestone-title" className="text-2xl font-bold font-display text-slate-900 tracking-tight">
                            {MILESTONE_TITLES[selectedMilestone]}
                          </h3>
                        </div>

                        {/*
                          * Every verdict that stood here is gone: "Physiological
                          * discharge approved", "(Discharge Ready)", named therapies
                          * "required", and a request to push the neck past 85° and
                          * 75° "to approve this milestone". The visitor's own
                          * readings are shown as they are, never graded.
                          */}
                        <div className="space-y-4 text-xs leading-relaxed text-slate-600">
                          {selectedMilestone === 0 && (
                            <>
                              <p>Sample: the first sore, tender stage has settled. Your practitioner decides when you are ready to move on.</p>
                              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 font-medium">
                                {/* This line named a clinician who does not work here,
                                    and dated a verification that never happened. */}
                                Status: <span className="font-bold">Sample milestone</span> — your practitioner sets real targets with you in clinic.
                              </div>
                            </>
                          )}
                          {selectedMilestone === 1 && (
                            <>
                              <p>Being able to look down and turn your head both ways without your shoulders joining in.</p>
                              <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center">
                                  <span>Looking down (your slider):</span>
                                  <span className="font-mono font-bold text-slate-800">{romNeckFlexion}°</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Turning your head (your slider):</span>
                                  <span className="font-mono font-bold text-slate-800">{romNeckRotation}°</span>
                                </div>
                              </div>
                              <div className="p-3.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 font-medium leading-relaxed space-y-2">
                                <p>Your practitioner decides when you have reached this stage.</p>
                                <p>There is no number to reach here. Do not push your neck further to change these readings. Your practitioner will set targets that suit you.</p>
                              </div>
                            </>
                          )}
                          {selectedMilestone === 2 && (
                            <>
                              <p>Gentle strengthening, when your practitioner says you are ready.</p>
                              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                <div className="flex justify-between">
                                  <span>Ticked on the practice list:</span>
                                  <span className="font-bold text-slate-800">{completedCount} of {exercises.length}</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden" aria-hidden="true">
                                  <div className="bg-teal-600 h-full" style={{ width: `${Math.round((completedCount / exercises.length) * 100)}%` }}></div>
                                </div>
                              </div>
                              <div className="p-3.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 leading-relaxed">
                                This stage is an example. Your practitioner will tell you when to start strengthening work.
                              </div>
                            </>
                          )}
                          {selectedMilestone === 3 && (
                            <>
                              <p>Getting ready to finish treatment is a decision you and your practitioner make together.</p>
                              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                <span>Your pain score (your slider):</span>
                                <span className="font-mono font-bold text-slate-800">
                                  {painLevel} out of 10
                                </span>
                              </div>
                              <div className="p-3.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 leading-relaxed space-y-2">
                                <p>Only your practitioner can say when treatment can finish.</p>
                                <p>If your pain is not settling, tell your practitioner. If it is severe or getting worse, call the clinic or NHS 111.</p>
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedMilestone(null)}
                          className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
        </div>
      </section>

      {/* NEW SECTION: Range of Motion (ROM) Simulator & Daily Rehab Tracker */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Daily Exercise & Log Tracker */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-3xl crystal-glass rounded-[3rem] border border-slate-100 p-8 shadow-premium flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeartPulse className="text-teal-600 animate-pulse" size={24} />
                <h3 className="text-2xl font-bold text-slate-900 font-display">Daily Rehab Checklist</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-500/20 px-3 py-1 rounded-full">
                {exercises.filter(ex => ex.completed).length}/{exercises.length} Complete
              </span>
            </div>
            
            <p className="text-sm text-slate-600 font-light leading-relaxed">
              Tick each exercise when you have done it. This is a practice list: your ticks move the last week of the sample chart above, and nothing is saved.
            </p>

            {/*
              * Real checkboxes for a keyboard and a screen reader: each row is
              * a button with role="checkbox", so Tab reaches it, Space or
              * Enter ticks it, and its ticked state is announced.
              */}
            <div className="space-y-3" role="group" aria-label="Practice exercise list">
              {exercises.map((ex) => (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={ex.completed}
                  key={ex.id}
                  onClick={() => handleToggleExercise(ex.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                    ex.completed
                      ? "bg-teal-50/40 border-teal-500/30 text-slate-900"
                      : "bg-white hover:bg-slate-50 border-slate-100 text-slate-600"
                  )}
                >
                  <span className="flex items-center gap-4">
                    <span className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors duration-300",
                      ex.completed
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "border-slate-500 group-hover:border-teal-600"
                    )} aria-hidden="true">
                      {ex.completed && <CheckCircle2 size={14} />}
                    </span>
                    <span className="block">
                      <span className={cn("block text-xs md:text-sm font-bold", ex.completed ? "line-through text-slate-600" : "text-slate-800")}>{ex.title}</span>
                      <span className="block text-[10px] text-slate-600 uppercase mt-0.5">{ex.sets}</span>
                    </span>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" className={cn("text-slate-300 transition-all", ex.completed ? "text-teal-500" : "group-hover:translate-x-1")} />
                </button>
              ))}
            </div>
          </div>

          {/* AI Prescription Suite Action (Upgrade) */}
          <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-500" /> Your own exercises
                </h4>
                <p className="text-[11px] text-slate-600 font-light mt-0.5">
                  The routine above is an example. Your practitioner will give you exercises that suit you.
                </p>
              </div>
              {isAiPrescribedMode && (
                <button 
                  onClick={handleRestoreDefaultExercises}
                  className="text-[9px] uppercase tracking-widest font-black text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Reset Routine
                </button>
              )}
            </div>
            
            <Link
              to="/contact"
              onClick={() => trackClick("Ask for own exercises")}
              className="w-full h-12 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 border transition-all bg-indigo-600 text-white hover:bg-indigo-500 border-transparent shadow-lg shadow-indigo-500/10 focus-inset"
            >
              <Sparkles size={13} />
              Ask the clinic for your exercises
            </Link>
          </div>

          <div className="mt-8 p-4 bg-teal-500/5 rounded-2xl border border-teal-500/10 flex items-center gap-4">
            <Award className="text-teal-600 shrink-0" size={24} />
            <p className="text-[11px] text-slate-600 font-medium font-sans">
              Keep to the exercises your practitioner gives you, and ask before adding new ones.
            </p>
          </div>
        </div>

        {/* Biomechanical ROM & Pain Joint Simulator */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-3xl crystal-glass rounded-[3rem] border border-slate-100 p-8 shadow-premium space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sliders className="text-indigo-600" size={24} />
              <h3 className="text-2xl font-bold text-slate-900 font-display">How far your neck moves</h3>
            </div>
            <p className="text-sm text-slate-600 font-light leading-relaxed">
              Move the sliders to show roughly how far your neck moves and how much it hurts today. This is not a test, and nothing is sent to the clinic.
            </p>

            {/* Slider Interfaces */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="neck-looking-down" className="font-bold text-slate-700">Looking down</label>
                  <span className="font-mono text-indigo-600 font-bold">{romNeckFlexion}° <span className="text-xs text-slate-600">/ 80°</span></span>
                </div>
                <input
                  type="range"
                  id="neck-looking-down"
                  aria-valuetext={`${romNeckFlexion} degrees of 80`}
                  min="20"
                  max="80"
                  value={romNeckFlexion}
                  onChange={(e) => setRomNeckFlexion(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase">
                  <span>Stiff (20°)</span>
                  <span>Full (80°)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="neck-turning" className="font-bold text-slate-700">Turning your head</label>
                  <span className="font-mono text-indigo-600 font-bold">{romNeckRotation}° <span className="text-xs text-slate-600">/ 90°</span></span>
                </div>
                <input
                  type="range"
                  id="neck-turning"
                  aria-valuetext={`${romNeckRotation} degrees of 90`}
                  min="30"
                  max="90"
                  value={romNeckRotation}
                  onChange={(e) => setRomNeckRotation(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase">
                  <span>Stiff (30°)</span>
                  <span>Full (90°)</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="pain-score" className="font-bold text-slate-700">How much it hurts (0-10)</label>
                  <span className="font-mono text-red-700 font-bold">{painLevel} <span className="text-xs text-slate-600">/ 10</span></span>
                </div>
                <input
                  type="range"
                  id="pain-score"
                  aria-valuetext={`${painLevel} out of 10`}
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="w-full accent-red-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <span className="text-teal-700">None (0)</span>
                  <span className="text-amber-700">Tolerable (5)</span>
                  <span className="text-red-700">Severe (10)</span>
                </div>
              </div>

              {/*
                * A "ROM Vision Calibration" panel stood here. It opened the
                * camera, showed a crosshair, and measured nothing at all -
                * the angles it "calibrated" came from the sliders above.
                * Asking a patient for their camera on a medical site in
                * exchange for theatre is not a feature, so it is gone.
                * (This note was once bare JSX text, so visitors saw it
                * printed on the page; it is a real comment now.)
                */}

            </div>
          </div>

          {/* Metric Outputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner font-sans">
            <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-3 border-r border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Movement score</span>
              <span className={cn("text-5xl font-display font-black my-2", bioScoreLimit > 70 ? "text-emerald-700" : bioScoreLimit > 45 ? "text-amber-700" : "text-red-700")}>
                {bioScoreLimit}%
              </span>
              <span className="text-xs font-bold text-slate-600 uppercase">A guide, not a diagnosis</span>
            </div>

            {/*
              * A live region: when the pain score crosses into "High
              * discomfort", a screen reader hears the call-the-clinic-or-111
              * line too, not just a sighted visitor.
              */}
            <div className="md:col-span-8 space-y-2 pl-3" role="status" aria-live="polite">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} aria-hidden="true" className={cn(painLevel >= 7 ? "text-red-700" : "text-amber-700")} />
                <span className={cn("text-xs font-black uppercase tracking-wider", advice.color)}>{advice.status}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{advice.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/*
        * SUMMARY SHEET to print and bring to an appointment.
        * This was "Pre-Visit Telehealth Triage Report Exporter": it claimed
        * the data was synchronised, encrypted ("End-to-End Crypt Key
        * Activated") and that the therapist was "pre-briefed", and it showed a
        * random reference number. None of that was true - the clinic offers no
        * telehealth and nothing here is ever sent. It now says what it does.
        */}
      <section className="bg-slate-950 rounded-[4rem] text-white p-12 lg:p-16 relative overflow-hidden group holographic-border">
          <div className="absolute inset-0 neural-grid opacity-[0.08]" />
          <div className="absolute top-0 left-1/3 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-teal-500/10 text-teal-300 font-bold text-[9px] uppercase tracking-widest border border-teal-500/20">
                <Printer size={12} /> Print for your visit
              </span>
              <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight text-white mb-2 tracking-tighter">
                A summary to bring to <br/>your appointment
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                Puts your slider readings, your pain score, the exercises you ticked and your notes on one sheet you can print and bring with you. It stays on this device, and nothing is sent to the clinic.
              </p>

              <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-400" aria-hidden="true" /> Stays on this device
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-teal-400" aria-hidden="true" /> Nothing is sent anywhere
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center shrink-0 w-full lg:w-auto">
              <AnimatePresence mode="wait">
                {!triageReport ? (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleGenerateTriage}
                    className="h-20 w-full sm:w-[350px] bg-teal-600 hover:bg-teal-500 text-slate-950 font-black uppercase text-xs tracking-[0.3em] rounded-[2rem] shadow-glow-teal flex items-center justify-center gap-4 transition-all hover:-translate-y-1 active:scale-95 group/btn"
                  >
                    <ClipboardList className="group-hover/btn:scale-125 transition-transform text-slate-950" size={20} aria-hidden="true" />
                    Make my summary
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-5 sm:p-8 bg-slate-900 border border-slate-800 rounded-[2rem] sm:rounded-[3rem] w-full sm:w-[390px] shadow-3xl text-slate-300 relative overflow-hidden group font-sans"
                  >
                    <div className="absolute inset-0 bg-teal-500/5 rounded-[3rem] pointer-events-none" />

                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <h4 ref={focusOnMount} tabIndex={-1} className="text-sm font-bold text-white tracking-tight uppercase">Summary for your appointment</h4>
                          <p className="text-xs text-teal-300 font-mono mt-0.5">Made on {triageReport.date}</p>
                        </div>
                        <CheckCircle2 className="text-teal-400" size={28} aria-hidden="true" />
                      </div>

                      {/*
                        * PHYSICAL-LIKE SLIP - the visitor's own readings, shown
                        * as they are. The (OK)/(LIMIT) grades that sat beside
                        * them are gone: a page may not judge a neck from a
                        * slider. The page's "movement score" is left off too -
                        * it is this page's own rough formula, not a reading,
                        * and does not belong on a sheet for a practitioner.
                        */}
                      <div className="bg-slate-950/60 p-3 sm:p-4 rounded-2xl border border-slate-900 font-mono text-[11px] text-slate-300 space-y-3">
                        <div className="text-xs text-slate-300 uppercase font-black">Your own notes — not a clinical record</div>
                        <div className="border-b border-dashed border-slate-700 pb-2">
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">NAME:</span>
                            <span className="text-white text-right">write on the printout</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">CLINIC:</span>
                            <span className="text-white text-right">{CLINIC.address.town} ({CLINIC.address.postcode})</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">LOOKING DOWN:</span>
                            <span className="text-white">{romNeckFlexion}°</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">TURNING YOUR HEAD:</span>
                            <span className="text-white">{romNeckRotation}°</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">PAIN:</span>
                            <span className="text-white">{painLevel} out of 10</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">EXERCISES:</span>
                            <span className="text-white text-right">{completedCount} of {exercises.length} ticked</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">YOUR NOTES:</span>
                            <span className="text-teal-300">{soapNoteResult ? "Included" : "None yet"}</span>
                          </div>
                        </div>

                      </div>


                      <div className="flex gap-3">
                        {/*
                          * Prints the summary sheet only - see the print copy
                          * portalled to <body> at the foot of this page.
                          */}
                        <button
                          type="button"
                          onClick={() => { trackClick("Print visit summary"); window.print(); }}
                          className="flex-1 py-4 bg-teal-500 text-slate-950 hover:bg-teal-400 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Printer size={13} aria-hidden="true" /> Print my summary
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTriageReport(null);
                            showToast("Summary cleared. Press 'Make my summary' to build it again.", "info");
                          }}
                          className="px-4 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* AI SOAP CLINICAL NOTE GENERATOR (Upgrade) */}
          <div className="relative z-10 mt-12 pt-12 border-t border-slate-900 grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-bold text-[8.5px] uppercase tracking-widest border border-indigo-500/20">
                <Brain size={12} className="animate-pulse" /> Notes for your visit
              </span>
              <h4 className="text-xl font-display font-bold text-white tracking-tight">Tidy up your notes</h4>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Write down what you have noticed, in your own words. This turns it into a short, tidy note you can bring to your appointment. It is a draft for you to check, not a medical record.
              </p>

              <div className="space-y-2">
                <label htmlFor="soap-symptoms" className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">What you have noticed</label>
                <textarea
                  id="soap-symptoms"
                  value={soapSymptoms}
                  onChange={(e) => setSoapSymptoms(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 focus:outline-none focus:border-teal-500 font-sans resize-none"
                  placeholder="For example: stiff neck in the mornings, worse after driving..."
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateSoapNote}
                disabled={isGeneratingSoap}
                className="focus-inset w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border border-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {isGeneratingSoap ? <RefreshCw size={13} className="animate-spin text-teal-400" /> : <Sparkles size={13} />}
                {isGeneratingSoap ? "Tidying..." : "Tidy up my notes"}
              </button>
            </div>

            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 relative flex flex-col justify-between font-mono text-[11px] leading-relaxed text-slate-400 overflow-hidden h-full min-h-[250px]">
              <div className="absolute top-4 right-5 text-[8px] font-black tracking-widest text-slate-400">DRAFT</div>
              
              <div className="space-y-4 overflow-y-auto max-h-[280px] pr-2 scrollbar-thin">
                {soapNoteResult ? (
                  <div className="space-y-3 font-sans text-slate-300">
                    <div className="p-3.5 bg-teal-500/5 border border-teal-500/15 rounded-xl flex items-center justify-between text-[11px]">
                      <span className="font-bold text-teal-500">Draft ready. Check it before you share it.</span>
                      <span className="text-[8px] font-mono text-slate-500"></span>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-900/80">{soapNoteResult}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
                    <Brain className="text-slate-700" size={32} />
                    <p className="text-xs text-slate-400 max-w-sm">
                      Nothing drafted yet. Write what you have noticed, then press "Tidy up my notes".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
      </section>

      {/* NEW SECTION: AI Systems Diagnostic & Technical Audit Hub */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 ml-4">
            <Cpu size={24} className="text-teal-600 animate-pulse" />
            <h2 className="text-3xl font-display font-bold text-slate-50 tracking-tight">Does this page work on your device?</h2>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-premium border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-2xl font-bold text-white font-display">Device check</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                {/* There is no server-agent node and no LLM core. What this
                    button really does is check the things the browser can
                    actually check, which is worth saying plainly. */}
                Runs the checks this page can genuinely make from your browser: whether the
                clinic website answers, whether this device can remember your settings, and
                whether you are online. It also looks at whether the contact form can send
                messages, and gives you the clinic's phone number and email in case it cannot.
              </p>
            </div>

            <button
              onClick={handleRunSystemAudit}
              disabled={isAuditing}
              className="h-16 w-full lg:w-auto px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 group shrink-0 border border-indigo-400/20 cursor-pointer"
            >
              <RefreshCw className={cn(isAuditing ? "animate-spin" : "group-hover:rotate-180 transition-transform")} size={16} />
              {isAuditing ? "Checking..." : "Run the check"}
            </button>
          </div>

          <AnimatePresence>
            {auditResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mt-8 pt-8 border-t border-slate-800 space-y-8 overflow-hidden font-sans"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  
                  {/* Cyber Health Score */}
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center flex flex-col justify-center items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Checks passed</span>
                    <span className="text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 my-3">
                      {auditResult.overallHealth}%
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] font-black uppercase tracking-wider">
                      <Terminal size={10} /> Done
                    </div>
                  </div>

                  {/* Clinical Insights */}
                  <div className="md:col-span-3 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Terminal size={14} /> What the check found
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {auditResult.architecturalInsights.map((insight, idx) => (
                        <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl relative">
                          
                          <p className="text-xs text-slate-300 leading-relaxed font-light">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Target size={14} /> Tips
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {auditResult.nextStepRoadmap.map((step, idx) => (
                      <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl relative">
                        
                        <p className="text-xs text-slate-400 leading-relaxed font-light">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/50 p-6 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                    <ShieldCheck size={14} /> Summary
                  </h4>
                  <p className="text-xs leading-relaxed text-indigo-200 font-light font-sans">
                    {auditResult.upgradeReview}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* Up Next & Recommended */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
          <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-8">
                  <CalendarCheck size={24} className="text-indigo-500" />
                  <h3 className="text-2xl font-bold text-slate-900 font-display">Upcoming Appointments</h3>
              </div>
              
              {/*
                * Two appointments used to sit here - "14:00 with Dr. Sarah
                * Jenkins", "09:30 with Tom Barnes". Neither clinician works at
                * this practice, and neither booking existed. This preview has
                * no link to the booking system, so the only honest thing it
                * can show is that it has nothing to show.
                */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      This preview doesn't connect to the booking diary, so your real
                      appointments aren't shown here.
                  </p>
                  <a
                      href={BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                      <CalendarCheck size={14} /> Check or book online
                  </a>
              </div>
          </div>
          
          <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 hover:shadow-xl transition-all font-sans">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Zap size={24} className="text-amber-700" />
                    <h3 className="text-2xl font-bold text-slate-900 font-display">Where to go next</h3>
                  </div>
              </div>
              
              <div className="space-y-4">
                  {[
                      /*
                       * These were "Watch: Phase 3 Core Stability", "Complete:
                       * Daily Mobility Form" and "Read: Return to Running
                       * Protocol" — a prescribed plan, on cards that looked
                       * clickable and did nothing, for a patient nobody had
                       * assessed. Every row below goes somewhere that exists.
                       */
                      { title: 'Watch the clinic films', type: 'Video', dur: `${VIDEOS.length} to choose from`, href: '/resources', color: 'bg-teal-50 text-teal-800' },
                      { title: 'Read the patient guides', type: 'Guides', dur: `${GALLERY_IMAGES.length} illustrated`, href: '/gallery', color: 'bg-blue-50 text-blue-700' },
                      { title: 'Questions before your visit', type: 'Answers', dur: 'Common ones', href: '/faq', color: 'bg-purple-50 text-purple-700' },
                  ].map((act, i) => (
                      <a
                          key={i}
                          href={act.href}
                          className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group cursor-pointer hover:border-teal-200 hover:shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                      >
                          <div className="flex items-center gap-4">
                             <div className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest", act.color)}>{act.type}</div>
                             <h4 className="font-bold text-slate-800 group-hover:text-teal-800 transition-colors">{act.title}</h4>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="text-xs text-slate-600 font-medium whitespace-nowrap">{act.dur}</span>
                             <ChevronRight size={18} className="text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
                          </div>
                      </a>
                  ))}
              </div>
          </div>
      </section>

      {/*
        * THE PRINT COPY of the visit summary. "Print" used to print the whole
        * page - sidebar, charts, dark panels, footer - over many sheets, and
        * the notes' words only as far as the page happened to show them. This
        * plain black-on-white copy is portalled straight into <body>, so the
        * print rule can hide every other child of <body> (#root and every
        * overlay) and paper gets this sheet alone. Invisible on screen. It
        * exists only while a summary does, so an ordinary Ctrl+P on this page
        * without a summary still prints the page as before.
        */}
      {triageReport && typeof document !== 'undefined' && createPortal(
        <div id="visit-summary-print" className="hidden">
          <style>{PRINT_CSS}</style>
          <div className="vs-title">Notes for my appointment</div>
          <p>{CLINIC.name}, {CLINIC.addressLine}</p>
          <p>Made on {triageReport.date} with the Recovery Tools page on the clinic's website. These are my own notes, not a clinical record.</p>
          <p className="vs-name">Name: <span className="vs-line" /></p>

          <div className="vs-head">My readings</div>
          <ul>
            <li>Looking down: {romNeckFlexion}°</li>
            <li>Turning my head: {romNeckRotation}°</li>
            <li>Pain: {painLevel} out of 10</li>
          </ul>

          <div className="vs-head">Practice exercises I ticked ({completedCount} of {exercises.length})</div>
          {completedCount > 0 ? (
            <ul>
              {exercises.filter(ex => ex.completed).map(ex => (
                <li key={ex.id}>{ex.title} ({ex.sets})</li>
              ))}
            </ul>
          ) : (
            <p>None ticked.</p>
          )}

          {soapNoteResult && (
            <>
              <div className="vs-head">My notes</div>
              <pre>{soapNoteResult}</pre>
            </>
          )}
        </div>,
        document.body
      )}

    </div>
  );
}

/**
 * Print rules for the visit summary. Rendered inside the print copy itself,
 * so they exist only while a summary does. Unlayered, so they beat every
 * Tailwind layer (the `hidden` utility and preflight's list and heading
 * resets). Points, not rem: the site's text-size setting scales the root
 * font, and a printed sheet should not depend on it. Black on white, so it
 * reads the same whether or not "background graphics" is ticked.
 */
const PRINT_CSS = `
#visit-summary-print { display: none; }
@media print {
  @page { margin: 15mm; }
  html, body { background: #fff !important; height: auto !important; min-height: 0 !important; overflow: visible !important; }
  body > :not(#visit-summary-print) { display: none !important; }
  #visit-summary-print { display: block !important; color: #000 !important; background: #fff !important; font: 12pt/1.5 Arial, Helvetica, sans-serif !important; }
  #visit-summary-print * { color: #000 !important; background: transparent !important; box-shadow: none !important; text-shadow: none !important; }
  #visit-summary-print .vs-title { font-size: 18pt; font-weight: bold; margin: 0 0 6pt; }
  #visit-summary-print .vs-head { font-size: 13pt; font-weight: bold; margin: 14pt 0 4pt; padding-bottom: 2pt; border-bottom: 1px solid #000; }
  #visit-summary-print p { margin: 0 0 4pt; }
  #visit-summary-print ul { margin: 0; padding-left: 18pt; list-style: disc; }
  #visit-summary-print li { margin: 0 0 2pt; }
  #visit-summary-print pre { white-space: pre-wrap; font: inherit; margin: 0; }
  #visit-summary-print .vs-name { margin-top: 8pt; }
  #visit-summary-print .vs-line { display: inline-block; width: 80mm; border-bottom: 1px solid #000; }
}
`;
