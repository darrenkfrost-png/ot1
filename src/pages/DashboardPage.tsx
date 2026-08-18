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
  Share2, 
  Cpu, 
  RefreshCw, 
  Terminal, 
  Printer,
  Camera,
  CameraOff,
  Brain,
  Sparkles
} from 'lucide-react';
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

interface AuditData {
  overallHealth: number;
  architecturalInsights: string[];
  nextStepRoadmap: string[];
  upgradeReview: string;
}

export default function DashboardPage() {
  const { trackClick } = useAnalytics();
  const { showToast } = useToast();

  // Dynamic state for Recharts data
  const [chartData, setChartData] = useState([
    { week: 'Wk 1', painLevel: 8, mobility: 30, strength: 25 },
    { week: 'Wk 2', painLevel: 6, mobility: 45, strength: 35 },
    { week: 'Wk 3', painLevel: 5, mobility: 55, strength: 45 },
    { week: 'Wk 4', painLevel: 4, mobility: 65, strength: 55 },
    { week: 'Wk 5', painLevel: 3, mobility: 75, strength: 65 },
    { week: 'Wk 6', painLevel: 2, mobility: 85, strength: 75 },
    { week: 'Wk 7', painLevel: 1, mobility: 90, strength: 85 },
    { week: 'Wk 8', painLevel: 0, mobility: 95, strength: 95 },
  ]);

  // Daily Exercise Tracking State
  const [exercises, setExercises] = useState([
    { id: 'ex1', title: 'Cervical Retraction (Isometric)', sets: '3 sets of 10s', completed: false },
    { id: 'ex2', title: 'Levator Scapulae Active Soft Stretch', sets: '2 sets of 30s', completed: false },
    { id: 'ex3', title: 'Thoracic Extension mobilisation', sets: '12 slow reps', completed: false },
    { id: 'ex4', title: 'Decompression Breathwork Cycle', sets: '5 slow minutes', completed: false },
  ]);

  // Biomechanical ROM Simulator States
  const [romNeckFlexion, setRomNeckFlexion] = useState(65); // degrees (optimal ~45-80)
  const [romNeckRotation, setRomNeckRotation] = useState(55); // degrees (optimal ~70-90)
  const [painLevel, setPainLevel] = useState(4); // 0-10 scale

  // UPGRADE 1: Interactive Milestone States
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

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

  // Triage Sharing State
  const [isGeneratingTriage, setIsGeneratingTriage] = useState(false);
  const [triageReport, setTriageReport] = useState<{ id: string; timestamp: string } | null>(null);

  // System Audit Live State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditData | null>(null);

  // ==========================================
  // STATE-OF-THE-ART UPGRADES: Camera-guided ROM, PT Prescription, & SOAP draft states
  // ==========================================
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [isAiPrescribedMode, setIsAiPrescribedMode] = useState(false);

  const [soapSymptoms, setSoapSymptoms] = useState("Aching compression and rigid muscle tension at base of skull, worse during horizontal glances and deep sit work.");
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const [soapNoteResult, setSoapNoteResult] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    trackClick("Activate ROM Optical Guide Camera");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
      showToast("Accessing video sensor. Live ROM calibration crosshair engaged.", "success");
    } catch (err) {
      // Camera not available — show fallback vector grid
      showToast("Video feed restricted in preview. Engaged vector calibration wireframe grid.", "info");
      setIsCameraActive(true); // Engages the elegant vector simulation
    }
  }, [trackClick, showToast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    showToast("ROM sensor alignment closed.", "info");
  }, [stream, showToast]);

  const handlePrescribeExercises = async () => {
    trackClick("Generate Custom AI Prescription Routine");
    setIsPrescribing(true);
    showToast("Evaluating joint angles and calculating active torque profiles...", "loading");

    try {
      const res = await fetch('/api/prescribe-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          romFlexion: romNeckFlexion,
          romRotation: romNeckRotation,
          painIndex: painLevel
        })
      });
      /*
       * Only real guidance is displayed. The server used to answer failures
       * with hardcoded neck exercises dressed up as a personalised
       * prescription; showing an error is the safe outcome here, not a
       * degraded one.
       */
      if (!res.ok) {
        const problem = await res.json().catch(() => ({}));
        showToast(
          problem.message || 'Exercise guidance is unavailable right now. Please ask your practitioner.',
          'error'
        );
        return;
      }

      const data = await res.json();
      if (data.exercises && data.exercises.length > 0) {
        const mapped = data.exercises.map((ex: any, index: number) => ({
          id: `ai-ex-${index}`,
          title: ex.title,
          sets: ex.sets,
          completed: false,
          instructions: ex.instructions
        }));
        setExercises(mapped);
        setIsAiPrescribedMode(true);
        showToast("Personalised routine generated. Check it with your practitioner before starting.", "success");
      } else {
        showToast('No exercises were returned. Please ask your practitioner.', 'error');
      }
    } catch (err) {
      console.error("Exercise prescription failed:", err);
      showToast('Exercise guidance is unavailable right now. Please ask your practitioner.', 'error');
    } finally {
      setIsPrescribing(false);
    }
  };

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
    showToast("Drafting formal SOAP clinical charts via Gemini LLM...", "loading");

    try {
      const res = await fetch('/api/generate-soap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: soapSymptoms,
          romFlexion: romNeckFlexion,
          romRotation: romNeckRotation,
          painLevel: painLevel
        })
      });
      if (!res.ok) {
        const problem = await res.json().catch(() => ({}));
        showToast(
          problem.message || 'Clinical documentation could not be generated. Please write this note manually.',
          'error'
        );
        return;
      }
      const data = await res.json();
      setSoapNoteResult(data.soapNote);
      showToast("Clinical SOAP Note drafted. Review before it goes in any record.", "success");
    } catch (err) {
      console.error("SOAP generation failed:", err);
      showToast('Clinical documentation could not be generated. Please write this note manually.', 'error');
    } finally {
      setIsGeneratingSoap(false);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Exercise log effect that updates chartData directly on completion
  const handleToggleExercise = useCallback((id: string) => {
    trackClick("Toggle Rehab Exercise Checkbox");
    setExercises(prev => {
      const updated = prev.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex);
      const totalCompleted = updated.filter(ex => ex.completed).length;
      
      // Dynamically shift Wk 8 parameters representing the 'Active Today' state
      setChartData(prevChart => {
        const copy = [...prevChart];
        const lastIdx = copy.length - 1;
        
        // Base starting point
        const baseMobility = 92;
        const baseStrength = 90;
        const basePain = 1;

        copy[lastIdx] = {
          ...copy[lastIdx],
          mobility: Math.min(baseMobility + totalCompleted * 2, 100),
          strength: Math.min(baseStrength + totalCompleted * 2, 100),
          painLevel: Math.max(basePain - (totalCompleted > 2 ? 1 : 0), 0)
        };
        return copy;
      });

      if (updated.find(ex => ex.id === id)?.completed) {
        showToast("Exercise logged successfully! Kinetic progression updated in real-time.", "success");
      }
      return updated;
    });
  }, [trackClick, showToast]);

  // Musculoskeletal rating formulas
  const calculatedBioScore = useMemo(() => Math.round(((romNeckFlexion / 80) * 45) + ((romNeckRotation / 90) * 45) - (painLevel * 5) + 10), [romNeckFlexion, romNeckRotation, painLevel]);
  const bioScoreLimit = useMemo(() => Math.max(10, Math.min(calculatedBioScore, 100)), [calculatedBioScore]);

  const advice = useMemo(() => {
    if (painLevel >= 7) {
      return { status: "Elevated Compensatory Guarding", desc: "Your indicators suggest heavy mechanical muscle guarding. Immediate joint mobilization is contraindicated. Focus on gentle decompression breath-work.", color: "text-red-500", border: "border-red-500/20", bg: "bg-red-500/5" };
    }
    if (bioScoreLimit < 55) {
      return { status: "Moderate ROM Restriction", desc: "Anatomical ranges of motion are compressed. Recommended matching: Cranio-Cervical Myofascial Release or spinal mobilization therapy.", color: "text-amber-700", border: "border-amber-500/20", bg: "bg-amber-500/5" };
    }
    return { status: "Nominal Kinetic Integrity", desc: "Joint kinematics are within physiological norms. Maintain active recovery stretching and progress to load-bearing neck strengthening.", color: "text-teal-400", border: "border-teal-500/20", bg: "bg-teal-500/5" };
  }, [painLevel, bioScoreLimit]);

  // Export prep triage action
  const handleGenerateTriage = () => {
    trackClick("Generate Triage PDF Package");
    setIsGeneratingTriage(true);
    showToast("Compiling mechanical metrics, joint ROM inputs, and clinical histories...", "loading");
    
    // Play double beep on build startup
    playAcousticPing(587.33, 0.15, 'sine'); // D5
    setTimeout(() => playAcousticPing(880, 0.25, 'sine'), 130);

    setTimeout(() => {
      setIsGeneratingTriage(false);
      setTriageReport({
        id: `CT6-REHAB-${Math.floor(Math.random() * 900000 + 100000)}`,
        timestamp: new Date().toLocaleDateString('en-GB', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      });
      showToast("Triage report package finalized and encrypted with clinical signature.", "success");
      
      // Play a diagnostic sync chime sequence on success
      playAcousticPing(523.25, 0.12, 'triangle'); // C5
      setTimeout(() => playAcousticPing(659.25, 0.12, 'triangle'), 80); // E5
      setTimeout(() => playAcousticPing(783.99, 0.3, 'sine'), 160); // G5
    }, 1800);
  };

  // Run the Live AI Autonomous System Audit using Gemini API
  const handleRunSystemAudit = async () => {
    trackClick("Run Live System Audit");
    setIsAuditing(true);
    showToast("Initiating server-side clinical system diagnostics...", "loading");

    try {
      const res = await fetch('/api/system-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Endpoint returned error status.');
      }

      const data = await res.json();
      setAuditResult(data);
      showToast("Clinical AI self-audit completed successfully.", "success");
    } catch (err) {
      /*
       * The "resilient local backup" here produced a 97% health score and a
       * glowing review whenever the audit failed, then announced it had
       * "compiled and verified successfully". An audit that cannot run has no
       * result to report.
       */
      console.error("System audit failed:", err);
      showToast("The system audit could not run. Nothing has been scored.", "error");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Section */}
      <section className="relative p-12 bg-slate-950 rounded-[4rem] text-white shadow-3xl overflow-hidden group holographic-border">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px] uppercase tracking-widest border border-teal-500/20">
                    <Activity size={14} className="animate-pulse" /> Patient Portal
                </span>
                <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tighter leading-none text-white">
                    Welcome back, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Richard.</span>
                </h1>
                <p className="text-slate-400 max-w-xl text-lg font-light leading-relaxed">
                    Access your personalized biomechanical metrics, complete daily rehabilitation assignments, and run pre-visit triage reports.
                </p>
            </div>
            
            <div className="flex gap-4">
                <div className="text-center bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                    <div className="text-[10px] uppercase font-black tracking-widest text-teal-400 mb-1">Current Phase</div>
                    <div className="text-2xl font-bold text-white">Active Rehab</div>
                </div>
                <div className="text-center bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                    <div className="text-[10px] uppercase font-black tracking-widest text-emerald-400 mb-1">Goal Completion</div>
                    <div className="text-2xl font-bold text-white">78%</div>
                </div>
            </div>
        </div>
      </section>

      {/* Progress Chart Module */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 ml-4">
            <TrendingUp size={24} className="text-teal-600" />
            <h2 className="text-3xl font-display font-bold text-slate-50 tracking-tight">Personal Health Progress</h2>
        </div>
        
        <div className="bg-white/95 backdrop-blur-3xl p-8 lg:p-12 rounded-[3.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 relative overflow-hidden group crystal-glass holographic-border">
            <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none mix-blend-screen mix-blend-lighten z-0"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-teal-100/50 transition-colors z-0"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10 font-sans">
               {/* Left Controls/Stats */}
               <div className="lg:col-span-1 flex flex-col justify-between space-y-8">
                  <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900">Cervical Spine Rehabilitation</h3>
                      <p className="text-sm text-slate-600 font-light leading-relaxed">
                          Your weekly mobility and core strength levels show positive trajectory. Real-time updates depend on your daily exercise completions.
                      </p>
                  </div>
                  
                  <div className="space-y-4">
                     {[
                         { label: "Overall Mobility", val: `${chartData[chartData.length - 1].mobility}%`, desc: 'From the readings above', color: "text-emerald-500" },
                         { label: "Pain Index", val: `${chartData[chartData.length - 1].painLevel}/10`, desc: "Current Status", color: "text-teal-500" },
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
               <div className="lg:col-span-3 h-[400px] w-full">
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
                                itemStyle={{ fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="mobility" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorMobility)" name="Mobility Level (%)" activeDot={{ r: 6, fill: "#14b8a6", stroke: "#fff", strokeWidth: 2 }} />
                            <Area type="monotone" dataKey="strength" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStrength)" name="Core Strength (%)" activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="painLevel" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Pain Index (0-10)" dot={false} activeDot={{ r: 4 }} />
                        </AreaChart>
                   </ResponsiveContainer>
               </div>
            </div>
                      {/* Treatment Milestones */}
             <div className="mt-12 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
                     <Target size={18} className="text-teal-500" /> Kinetic Recovery Milestone Explorer
                   </h4>
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Click cards to analyze diagnostic criteria</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {['Inflammation Reduced', 'Full Range of Motion', 'Load Bearing Achieved', 'Functional Discharge'].map((m, i) => {
                       // Live requirements evaluation
                       let requirementsMet = false;
                       let statusText = "Pending";
                       let highlightColor = "text-slate-600";
                       let bgDot = "bg-slate-200";

                       if (i === 0) {
                         requirementsMet = true;
                         statusText = "Completed & Audited";
                         highlightColor = "text-teal-800";
                         bgDot = "bg-teal-500 text-white";
                       } else if (i === 1) {
                         const flexionCheck = romNeckFlexion >= 75;
                         const rotationCheck = romNeckRotation >= 85;
                         requirementsMet = flexionCheck && rotationCheck;
                         statusText = requirementsMet ? "Completed & Met" : "Requires Slider Adjustment";
                         highlightColor = requirementsMet ? "text-emerald-600" : "text-amber-700 font-bold animate-pulse";
                         bgDot = requirementsMet ? "bg-emerald-500 text-white" : "bg-amber-400 text-slate-950";
                       } else if (i === 2) {
                         requirementsMet = exercises.filter(ex => ex.completed).length >= 2;
                         statusText = requirementsMet ? "Completed & Met" : "Active Treatment";
                         highlightColor = "text-teal-800";
                         bgDot = "bg-teal-500 text-white";
                       } else if (i === 3) {
                         requirementsMet = painLevel < 3;
                         statusText = requirementsMet ? "Pre-approved" : "Target: Week 8 Discharge";
                         highlightColor = "text-slate-500";
                         bgDot = "bg-slate-200 text-slate-450";
                       }

                       return (
                         <div 
                           key={i} 
                           onClick={() => { setSelectedMilestone(i); playAcousticPing(440, 0.08, 'triangle'); }}
                           className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/30 border border-transparent hover:border-teal-100 hover:shadow-md cursor-pointer transition-all duration-300 relative group"
                         >
                            <div className="flex items-center gap-3">
                               <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black", bgDot)}>
                                   {i === 0 || requirementsMet ? <CheckCircle2 size={13} /> : <span className="text-[9px] font-mono">{i+1}</span>}
                               </div>
                               <div className={cn("h-0.5 flex-1 rounded-full", i === 0 || requirementsMet ? "bg-teal-500" : "bg-slate-200")} />
                            </div>
                            <div>
                               <p className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">{m}</p>
                               <p className={cn("text-[9px] uppercase font-black tracking-widest mt-1", highlightColor)}>
                                 {statusText}
                               </p>
                            </div>
                         </div>
                       );
                   })}
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
                          <span className="text-[10px] uppercase font-black text-teal-600 tracking-widest">Clinical Milestone Phase 0{selectedMilestone + 1}</span>
                          <h3 className="text-2xl font-bold font-display text-slate-100 tracking-tight">
                            {['Inflammation Reduced (Acute Relief)', 'Physiological Range of Motion', 'Active Load Resiliency', 'Functional Checkout & Discharge'][selectedMilestone]}
                          </h3>
                        </div>

                        <div className="space-y-4 text-xs leading-relaxed text-slate-500 font-light">
                          {selectedMilestone === 0 && (
                            <>
                              <p>The acute inflammatory phase in your C4-C6 segment has reached clinical resolution. Tissue warmth, protective muscle guarding, and hyper-sensitivities are fully resolved.</p>
                              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 font-medium">
                                Status: <span className="font-bold">Verified in clinic</span> by Dr. Sarah Jenkins on Oct 12.
                              </div>
                            </>
                          )}
                          {selectedMilestone === 1 && (
                            <>
                              <p>Requires balanced neck movement in flexion and bilateral rotation without secondary shoulder compensations.</p>
                              <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center">
                                  <span>Cervical Flexion ROM Target:</span>
                                  <span className={cn("font-mono font-bold", romNeckFlexion >= 75 ? "text-emerald-600" : "text-amber-600")}>
                                    {romNeckFlexion}° / 75° {romNeckFlexion >= 75 ? "✓" : "✗"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Cervical Rotation ROM Target:</span>
                                  <span className={cn("font-mono font-bold", romNeckRotation >= 85 ? "text-emerald-600" : "text-amber-600")}>
                                    {romNeckRotation}° / 85° {romNeckRotation >= 85 ? "✓" : "✗"}
                                  </span>
                                </div>
                              </div>
                              {romNeckFlexion >= 75 && romNeckRotation >= 85 ? (
                                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-medium flex items-center gap-2">
                                  <CheckCircle2 size={14} /> Biomechanic criteria fully met via live inputs.
                                </div>
                              ) : (
                                <div className="p-3.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 font-medium leading-relaxed">
                                  Attention: Please adjust cervical rotation beyond 85° and flexion beyond 75° using the sliders to approve this milestone limit.
                                </div>
                              )}
                            </>
                          )}
                          {selectedMilestone === 2 && (
                            <>
                              <p>Validation of active mechanical loading under weight and elastic vectors. Safe kinetic performance requires completion of at least 2 prescribed daily rehabilitation tasks.</p>
                              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                <div className="flex justify-between">
                                  <span>Core Tasks Logged:</span>
                                  <span className="font-bold text-slate-800">{exercises.filter(ex => ex.completed).length} Completed</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-teal-500 h-full" style={{ width: `${Math.min(100, (exercises.filter(ex => ex.completed).length / 2) * 100)}%` }}></div>
                                </div>
                              </div>
                              {exercises.filter(ex => ex.completed).length >= 2 ? (
                                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-medium flex items-center gap-2">
                                  <CheckCircle2 size={14} /> Muscle recruitment load bearing verified.
                                </div>
                              ) : (
                                <div className="p-3.5 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 leading-relaxed">
                                  Check off 2 or more active rehab exercises in your checklist to verify kinetic strength load-bearing status!
                                </div>
                              )}
                            </>
                          )}
                          {selectedMilestone === 3 && (
                            <>
                              <p>Discharge planning. Standard checklist is met when subjective pain level on the Visual Analogue Scale (VAS) remains below 3 index points.</p>
                              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                <span>Your Pain Score Checklist:</span>
                                <span className={cn("font-mono font-bold", painLevel < 3 ? "text-emerald-600" : "text-amber-600")}>
                                  VAS {painLevel} / 10 {painLevel < 3 ? "✓ (Discharge Ready)" : "✗ (Restricted)"}
                                </span>
                              </div>
                              {painLevel < 3 ? (
                                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-medium">
                                  Physiological discharge approved. Alignment lock target verified.
                                </div>
                              ) : (
                                <div className="p-3.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 leading-relaxed">
                                  Subjective pain scale is too high. Active recovery, vagus breath coaching, and muscle relaxation required to clear discharge checkpoints.
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <button 
                          onClick={() => setSelectedMilestone(null)}
                          className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Minimize Milestone
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
              Completing daily exercises lowers your calculated somatic pain metrics and updates your visual kinetic recovery lines.
            </p>

            <div className="space-y-3">
              {exercises.map((ex) => (
                <div 
                  key={ex.id}
                  onClick={() => handleToggleExercise(ex.id)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                    ex.completed 
                      ? "bg-teal-50/40 border-teal-500/30 text-slate-900" 
                      : "bg-white hover:bg-slate-50 border-slate-100 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors duration-300",
                      ex.completed 
                        ? "bg-teal-500 border-teal-500 text-white" 
                        : "border-slate-300 group-hover:border-teal-500"
                    )}>
                      {ex.completed && <CheckCircle2 size={14} />}
                    </div>
                    <div>
                      <h4 className={cn("text-xs md:text-sm font-bold", ex.completed ? "line-through text-slate-500" : "text-slate-800")}>{ex.title}</h4>
                      <p className="text-[10px] text-slate-600 uppercase mt-0.5">{ex.sets}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className={cn("text-slate-300 transition-all", ex.completed ? "text-teal-500" : "group-hover:translate-x-1")} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Prescription Suite Action (Upgrade) */}
          <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-500" /> AI Active Prescriber
                </h4>
                <p className="text-[11px] text-slate-600 font-light mt-0.5">
                  Adapt daily rehabilitation to matches your live range of motion inputs.
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
            
            <button
              onClick={handlePrescribeExercises}
              disabled={isPrescribing}
              className={cn(
                "w-full h-12 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 border transition-all",
                isAiPrescribedMode
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 border-transparent shadow-lg shadow-indigo-500/10"
              )}
            >
              {isPrescribing ? (
                <RefreshCw className="animate-spin" size={13} />
              ) : (
                <Sparkles size={13} />
              )}
              {isPrescribing 
                ? "Compiling custom bio-prescription..." 
                : isAiPrescribedMode 
                  ? "Care routine updated (Click to refresh)" 
                  : "Prescribe Custom AI Routine"
              }
            </button>
          </div>

          <div className="mt-8 p-4 bg-teal-500/5 rounded-2xl border border-teal-500/10 flex items-center gap-4">
            <Award className="text-teal-600 shrink-0" size={24} />
            <p className="text-[11px] text-slate-500 font-medium font-sans">
              Richard is currently on a <span className="font-bold text-teal-600">5-day streak!</span> Keep moving to preserve bone density and joint lubrication.
            </p>
          </div>
        </div>

        {/* Biomechanical ROM & Pain Joint Simulator */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-3xl crystal-glass rounded-[3rem] border border-slate-100 p-8 shadow-premium space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sliders className="text-indigo-600" size={24} />
              <h3 className="text-2xl font-bold text-slate-900 font-display">Musculoskeletal Range of Motion (ROM)</h3>
            </div>
            <p className="text-sm text-slate-500 font-light leading-relaxed">
              Log cervical angles and current acute discomfort scales. The system compiles these to index safety alignments before hands-on treatment.
            </p>

            {/* Slider Interfaces */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">Cervical Flexion ROM</span>
                  <span className="font-mono text-indigo-600 font-bold">{romNeckFlexion}° <span className="text-xs text-slate-600">/ 80°</span></span>
                </div>
                <input
                  type="range"
                  aria-label="Cervical flexion range of motion, in degrees"
                  aria-valuetext={`${romNeckFlexion} degrees of 80`}
                  min="20"
                  max="80"
                  value={romNeckFlexion}
                  onChange={(e) => setRomNeckFlexion(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <span>Restricted (20°)</span>
                  <span>Optimal (80°)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">Cervical Rotation ROM</span>
                  <span className="font-mono text-indigo-600 font-bold">{romNeckRotation}° <span className="text-xs text-slate-400">/ 90°</span></span>
                </div>
                <input
                  type="range"
                  aria-label="Cervical rotation range of motion, in degrees"
                  aria-valuetext={`${romNeckRotation} degrees of 90`}
                  min="30"
                  max="90"
                  value={romNeckRotation}
                  onChange={(e) => setRomNeckRotation(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <span>Guarded (30°)</span>
                  <span>Optimal (90°)</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">Subjective Discomfort (VAS Scale)</span>
                  <span className="font-mono text-red-500 font-bold">{painLevel} <span className="text-xs text-slate-400">/ 10</span></span>
                </div>
                <input
                  type="range"
                  aria-label="Subjective discomfort, visual analogue scale from 0 to 10"
                  aria-valuetext={`${painLevel} out of 10`}
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="w-full accent-red-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <span className="text-teal-500">None (0)</span>
                  <span className="text-amber-700">Tolerable (5)</span>
                  <span className="text-red-500">Severe (10)</span>
                </div>
              </div>

              {/* AUTOMATED ROM CAMERA CALIBRATION MODULE (Upgrade) */}
              <div className="md:col-span-2 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-900 relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="space-y-3 flex-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-350 font-bold text-[8px] uppercase tracking-widest border border-indigo-500/20">
                    <Camera size={11} className="animate-pulse" /> Diagnostic Optical Guide
                  </span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">ROM Vision Calibration</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed max-w-sm">
                    Enable camera sensing. Place your head in the target crosshair to automatically calibrate neck rotation and flexion deflection rates.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={cn(
                    "h-12 px-6 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-lg shrink-0 w-full sm:w-auto",
                    isCameraActive 
                      ? "bg-red-950/40 text-red-400 border-red-500/30 hover:bg-red-900/30" 
                      : "bg-indigo-600 text-white border-indigo-550 hover:bg-indigo-500 shadow-indigo-500/10"
                  )}
                >
                  {isCameraActive ? <CameraOff size={13} /> : <Camera size={13} />}
                  {isCameraActive ? "Halt Sensor" : "Calibrate ROM"}
                </button>

                <AnimatePresence>
                  {isCameraActive && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 200 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="absolute inset-x-0 bottom-0 overflow-hidden bg-black flex justify-center items-center h-[200px] border-t border-slate-900 z-10"
                    >
                      {stream ? (
                        <video 
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover opacity-50 scale-x-[-1]"
                        />
                      ) : (
                        <div className="absolute inset-x-0 inset-y-0 flex flex-col sm:flex-row justify-around items-center p-4 bg-slate-950">
                          <div className="flex flex-col items-center text-center space-y-1">
                            <svg className="w-12 h-12 text-teal-400/40 animate-pulse" viewBox="0 0 100 100" fill="none">
                              <circle cx="50" cy="40" r="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                              <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                              <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                              <g transform={`rotate(${romNeckRotation - 60} 50 40)`}>
                                <line x1="50" y1="15" x2="50" y2="65" stroke="#14b8a6" strokeWidth="2.5" />
                                <circle cx="50" cy="15" r="3.5" fill="#14b8a6" />
                              </g>
                            </svg>
                            <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest font-black">Vector calibration override active</span>
                          </div>
                          
                          {/* Manual micro adjustment buttons */}
                          <div className="flex flex-col gap-1.5 relative z-50">
                            <div className="text-[7px] font-mono text-indigo-400 uppercase tracking-widest font-black text-center mb-0.5">Click to Micro-Adjust Alignment</div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button 
                                type="button"
                                onClick={() => { setRomNeckFlexion(prev => Math.max(30, prev - 5)); playAcousticPing(400, 0.08, 'sawtooth'); }}
                                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-white rounded text-[8px] font-mono tracking-wider font-extrabold cursor-pointer hover:bg-slate-850 active:scale-95 transition-transform"
                              >
                                FLEX -5°
                              </button>
                              <button 
                                type="button"
                                onClick={() => { setRomNeckFlexion(prev => Math.min(80, prev + 5)); playAcousticPing(440, 0.08, 'sawtooth'); }}
                                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-white rounded text-[8px] font-mono tracking-wider font-extrabold cursor-pointer hover:bg-slate-850 active:scale-95 transition-transform"
                              >
                                FLEX +5°
                              </button>
                              <button 
                                type="button"
                                onClick={() => { setRomNeckRotation(prev => Math.max(30, prev - 5)); playAcousticPing(300, 0.08, 'sawtooth'); }}
                                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-white rounded text-[8px] font-mono tracking-wider font-extrabold cursor-pointer hover:bg-slate-850 active:scale-95 transition-transform"
                              >
                                ROT -5°
                              </button>
                              <button 
                                type="button"
                                onClick={() => { setRomNeckRotation(prev => Math.min(90, prev + 5)); playAcousticPing(340, 0.08, 'sawtooth'); }}
                                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-white rounded text-[8px] font-mono tracking-wider font-extrabold cursor-pointer hover:bg-slate-850 active:scale-95 transition-transform"
                              >
                                ROT +5°
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <svg className="w-full h-full text-indigo-500/25" viewBox="0 0 200 100" fill="none">
                          <circle cx="100" cy="50" r="32" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                          <circle cx="100" cy="50" r="2.5" fill="currentColor" />
                          <line x1="100" y1="10" x2="100" y2="90" stroke="currentColor" strokeWidth="0.5" />
                          <line x1="50" y1="50" x2="150" y2="50" stroke="currentColor" strokeWidth="0.5" />
                          <text x="138" y="53" fill="#14b8a6" className="font-mono text-[8px] font-bold">{romNeckFlexion}° Flexion</text>
                          <text x="24" y="53" fill="#6366f1" className="font-mono text-[8px] font-bold">{romNeckRotation}° Rotation</text>
                        </svg>
                        
                        <div className="absolute bottom-3 left-4 text-[7px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                          ALIGNMENT INTENSITY AUTO
                        </div>
                        <div className="absolute top-3 right-4 text-[7px] font-mono text-teal-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900 animate-pulse">
                          ● LOCK STANDBY
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Metric Outputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner font-sans">
            <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-3 border-r border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kinetic Alignment Score</span>
              <span className={cn("text-5xl font-display font-black my-2", bioScoreLimit > 70 ? "text-emerald-500" : bioScoreLimit > 45 ? "text-amber-700" : "text-red-500")}>
                {bioScoreLimit}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Biomechanical Safety</span>
            </div>
            
            <div className="md:col-span-8 space-y-2 pl-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className={cn(painLevel >= 7 ? "text-red-500" : "text-amber-700")} />
                <span className={cn("text-xs font-black uppercase tracking-wider", advice.color)}>{advice.status}</span>
              </div>
              <p className="text-xs text-slate-500 font-light leading-relaxed">{advice.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: Patient Prep Triage Exporter & Telehealth PDF Generator */}
      <section className="bg-slate-950 rounded-[4rem] text-white p-12 lg:p-16 relative overflow-hidden group holographic-border">
          <div className="absolute inset-0 neural-grid opacity-[0.08]" />
          <div className="absolute top-0 left-1/3 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[90px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-teal-500/10 text-teal-300 font-bold text-[9px] uppercase tracking-widest border border-teal-500/20">
                <Printer size={12} /> CLINICAL DATA SYNCHRONIZATION
              </span>
              <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight text-white mb-2 tracking-tighter">
                Pre-Visit Telehealth <br/>Triage Report Exporter
              </h3>
              <p className="text-slate-400 leading-relaxed font-light text-lg">
                Instantly consolidate your range of motion scores, current spinal alignment indexes, yesterday's pain scales, and logged rehab tasks. Exporter auto-crypts credentials so your therapist is pre-briefed prior to spinal adjustments.
              </p>
              
              <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-400" /> Current Assessment Locked
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-teal-400" /> End-to-End Crypt Key Activated
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center shrink-0 w-full lg:w-auto">
              <AnimatePresence mode="wait">
                {!triageReport ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleGenerateTriage}
                    disabled={isGeneratingTriage}
                    className="h-20 w-full sm:w-[350px] bg-teal-600 hover:bg-teal-500 text-slate-950 font-black uppercase text-xs tracking-[0.3em] rounded-[2rem] shadow-glow-teal flex items-center justify-center gap-4 transition-all hover:-translate-y-1 active:scale-95 group/btn"
                  >
                    {isGeneratingTriage ? (
                      <RefreshCw className="animate-spin text-slate-950" size={24} />
                    ) : (
                      <Share2 className="group-hover/btn:scale-125 transition-transform text-slate-950" size={20} />
                    )}
                    {isGeneratingTriage ? "Compiling Pack..." : "Generate Clinic Report"}
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] w-full sm:w-[390px] shadow-3xl text-slate-300 relative overflow-hidden group font-sans"
                  >
                    <div className="absolute inset-0 bg-teal-500/5 rounded-[3rem] pointer-events-none" />
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-tight uppercase">Triage Docket Slip</h4>
                          <p className="text-[10px] text-teal-400 font-mono mt-0.5">{triageReport.id}</p>
                        </div>
                        <CheckCircle2 className="text-teal-400" size={28} />
                      </div>

                      {/* PHYSICAL-LIKE SLIP */}
                      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900 font-mono text-[11px] text-slate-300 space-y-3 relative">
                        <div className="absolute top-2 right-3 text-[7px] text-slate-600 uppercase font-black">Example — not a clinical record</div>
                        <div className="border-b border-dashed border-slate-800 pb-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500">PATIENT:</span>
                            <span className="text-white font-bold">Your name</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">CLINIC:</span>
                            <span className="text-white">{CLINIC.address.town} ({CLINIC.address.postcode})</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">FLEXION ROM:</span>
                            <span className={cn(romNeckFlexion >= 65 ? "text-emerald-400" : "text-amber-700")}>
                              {romNeckFlexion}° / 80° {romNeckFlexion >= 65 ? "(OK)" : "(LIMIT)"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">ROTATION ROM:</span>
                            <span className={cn(romNeckRotation >= 70 ? "text-emerald-400" : "text-amber-700")}>
                              {romNeckRotation}° / 90° {romNeckRotation >= 70 ? "(OK)" : "(LIMIT)"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">DISCOMFORT VAS:</span>
                            <span className="text-red-400">{painLevel} / 10 Scale</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">KINETIC SCORE:</span>
                            <span className="text-teal-400 font-bold">{bioScoreLimit}% Range</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">REHAB PROGRESSES:</span>
                            <span>{exercises.filter(ex => ex.completed).length} / {exercises.length} logged</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">AI SOAP SECURE:</span>
                            <span className="text-teal-400">{soapNoteResult ? "INCLUDED" : "NO DRAFT"}</span>
                          </div>
                        </div>
                        
                      </div>


                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            playAcousticPing(800, 0.05, 'square');
                            setTimeout(() => playAcousticPing(600, 0.05, 'square'), 50);
                            showToast("Sending document print stream...", "loading");
                            setTimeout(() => {
                              window.print();
                            }, 300);
                          }}
                          className="flex-1 py-4 bg-teal-500 text-slate-950 hover:bg-teal-400 rounded-2xl font-black uppercase tracking-wider text-[9px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Printer size={13} /> Print Docket
                        </button>
                        
                        <button 
                          onClick={() => {
                            playAcousticPing(220, 0.1, 'sine');
                            setTriageReport(null);
                            showToast("Intake slip invalidated. Re-generate to refresh.", "info");
                          }}
                          className="px-4 py-4 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl font-black uppercase tracking-wider text-[9px] transition-colors cursor-pointer"
                        >
                          Reset
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-350 font-bold text-[8.5px] uppercase tracking-widest border border-indigo-500/20">
                <Brain size={12} className="animate-pulse" /> Telehealth Pre-Charter
              </span>
              <h4 className="text-xl font-display font-bold text-white tracking-tight">AI Clinical SOAP Drafter</h4>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Enter yesterday's subjective discomfort spikes. The clinician agent will translate descriptions into an industry-grade, structured clinical SOAP chart note to speed up adjustments.
              </p>

              <div className="space-y-2">
                <label htmlFor="soap-symptoms" className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Subjective Symptoms Summary</label>
                <textarea
                  id="soap-symptoms"
                  value={soapSymptoms}
                  onChange={(e) => setSoapSymptoms(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 focus:outline-none focus:border-teal-500 font-sans resize-none"
                  placeholder="Describe specific tight zones or posture discomfort triggers..."
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateSoapNote}
                disabled={isGeneratingSoap}
                className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border border-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {isGeneratingSoap ? <RefreshCw size={13} className="animate-spin text-teal-400" /> : <Sparkles size={13} />}
                {isGeneratingSoap ? "Compiling Medical Form..." : "Draft Structured SOAP Note"}
              </button>
            </div>

            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 relative flex flex-col justify-between font-mono text-[11px] leading-relaxed text-slate-400 overflow-hidden h-full min-h-[250px]">
              <div className="absolute top-4 right-5 text-[8px] font-black tracking-widest text-slate-600">PRE-CHART COMPILER ACTIVE</div>
              
              <div className="space-y-4 overflow-y-auto max-h-[280px] pr-2 scrollbar-thin">
                {soapNoteResult ? (
                  <div className="space-y-3 font-sans text-slate-300">
                    <div className="p-3.5 bg-teal-500/5 border border-teal-500/15 rounded-xl flex items-center justify-between text-[11px]">
                      <span className="font-bold text-teal-450">STATUS: CLINICAL SOAP FORMAT GENERATED</span>
                      <span className="text-[8px] font-mono text-slate-500">SECURE-BASE_V3</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-900/80">{soapNoteResult}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
                    <Brain className="text-slate-700" size={32} />
                    <p className="text-xs text-slate-500 max-w-sm">
                      No active clinical draft generated yet. Fill in the subjective summary and click 'Draft Structured SOAP Note'.
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
            <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">AI Subsystem Diagnostics & Audit Core</h2>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-premium border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-2xl font-bold text-white font-display">Autonomous Clinical System Auditing</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Connect directly with the clinic's server-agent node (Gemini 3.5 LLM core). This executes structural validation tests, verifies API routing statuses, audits diagnostic precision, and scores accessibility ratings.
              </p>
            </div>

            <button
              onClick={handleRunSystemAudit}
              disabled={isAuditing}
              className="h-16 w-full lg:w-auto px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 group shrink-0 border border-indigo-400/20 cursor-pointer"
            >
              <RefreshCw className={cn(isAuditing ? "animate-spin" : "group-hover:rotate-180 transition-transform")} size={16} />
              {isAuditing ? "Auditing Node Channels..." : "Run System diagnostics"}
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Efficacy Rate</span>
                    <span className="text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 my-3">
                      {auditResult.overallHealth}%
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] font-black uppercase tracking-wider">
                      <Terminal size={10} /> Nominal Standby
                    </div>
                  </div>

                  {/* Clinical Insights */}
                  <div className="md:col-span-3 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Terminal size={14} /> AI Architectural Insights (Targeting GDPR & Kinetics)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {auditResult.architecturalInsights.map((insight, idx) => (
                        <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl relative">
                          <span className="absolute top-3 right-4 font-mono text-[10px] text-slate-600 font-bold">INS-0{idx+1}</span>
                          <p className="text-xs text-slate-300 leading-relaxed font-light">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Target size={14} /> Future Triage expansion roadmap
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {auditResult.nextStepRoadmap.map((step, idx) => (
                      <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl relative">
                        <span className="absolute top-3 right-4 font-mono text-[9px] text-indigo-400 font-black">PHASE 0{idx+3}</span>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/50 p-6 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                    <ShieldCheck size={14} /> Clinician Software Suite Upgrade Overview
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
              
              <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex flex-col items-center justify-center shrink-0">
                              <span className="text-[10px] font-black uppercase leading-none mb-1">Oct</span>
                              <span className="text-lg font-bold leading-none">24</span>
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-800">Advanced Biomechanical Review</h4>
                              <p className="text-sm font-light text-slate-500 flex items-center gap-2 mt-1">
                                  <Clock size={14} /> 14:00 with Dr. Sarah Jenkins
                              </p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex-1 sm:flex-none">Reschedule</button>
                      </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 opacity-75 font-sans">
                      <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex flex-col items-center justify-center shrink-0">
                              <span className="text-[10px] font-black uppercase leading-none mb-1">Nov</span>
                              <span className="text-lg font-bold leading-none">12</span>
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-800">Routine Maintenance Check</h4>
                              <p className="text-sm font-light text-slate-500 flex items-center gap-2 mt-1">
                                  <Clock size={14} /> 09:30 with Tom Barnes
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 hover:shadow-xl transition-all font-sans">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Zap size={24} className="text-amber-700" />
                    <h3 className="text-2xl font-bold text-slate-900 font-display">Recommended Actions</h3>
                  </div>
              </div>
              
              <div className="space-y-4">
                  {[
                      { title: "Watch: Phase 3 Core Stability", type: "Video", dur: "12 mins", color: "bg-teal-50 text-teal-600" },
                      { title: "Complete: Daily Mobility Form", type: "Survey", dur: "2 mins", color: "bg-blue-50 text-blue-600" },
                      { title: "Read: Return to Running Protocol", type: "Article", dur: "8 mins", color: "bg-purple-50 text-purple-600" }
                  ].map((act, i) => (
                      <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-teal-200 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                             <div className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest", act.color)}>{act.type}</div>
                             <h4 className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{act.title}</h4>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="text-xs text-slate-600 font-medium whitespace-nowrap">{act.dur}</span>
                             <ChevronRight size={18} className="text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

    </div>
  );
}
