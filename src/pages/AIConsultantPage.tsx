import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, Globe, PlayCircle, Bot, Cpu, Sparkles, StopCircle, CheckCircle2, ChevronRight, Hash, AudioLines, Settings2, Share2, ClipboardList, ScanFace, Activity, Brain, ShieldCheck, Zap, ZapOff, AlertCircle, TrendingUp, Users, Calendar, Stethoscope } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { useAnalytics } from '../context/AnalyticsContext';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';
import { usePageContext } from '../context/PageContextContext';
import { BOOKING_URL } from '../constants';
import { useToast } from '../components/ToastSystem';

interface LogEntry {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: Date;
}

export default function AIConsultantPage() {
  const { trackClick } = useAnalytics();
  const { settings, updateSetting } = useSettings();
  const { pageContext } = usePageContext();
  const { showToast } = useToast();
  const { state: voiceState, transcript, finalTranscript, startListening, stopListening, speak, stopSpeaking, error: voiceError, clearTranscripts, requestPermission } = useVoice();
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([{
    id: 'sys-start',
    sender: 'system',
    text: 'Clinical AI initialization sequence complete. Voice interface ready.',
    timestamp: new Date()
  }]);
  const [isProcessing, setIsProcessing] = useState(false);
   const [aiAnalysisSummary, setAiAnalysisSummary] = useState<string[]>([]);
   const [complexityScore, setComplexityScore] = useState<number>(0);
   const [riskStatus, setRiskStatus] = useState<'low' | 'moderate' | 'elevated'>('low');
   const [detectedAnatomy, setDetectedAnatomy] = useState<string[]>([]);
   const [inputValue, setInputValue] = useState('');
   const logsRef = useRef<HTMLDivElement>(null);

   // ==========================================
   // ACTIVE UPGRADE: APG Breathing Coach & Audio Synth
   // ==========================================
   const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Idle'>('Idle');
   const [breatheSeconds, setBreatheSeconds] = useState(4);
   const [isResonatorActive, setIsResonatorActive] = useState(false);
   
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef2 = useRef<OscillatorNode | null>(null);
  const oscRef3 = useRef<OscillatorNode | null>(null);
  const [resonatorMode, setResonatorMode] = useState<'binaural' | 'tibetan' | 'schumann'>('binaural');
   const oscRef = useRef<OscillatorNode | null>(null);
   const gainRef = useRef<GainNode | null>(null);
   const canvasRef = useRef<HTMLCanvasElement | null>(null);
   const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

   // Hotspot click handler
   const handleHotspotClick = (zone: string, description: string) => {
     trackClick(`Body Hotspot Click: ${zone}`);
     showToast(`Anatomical target set: ${zone}. Description loaded.`, "success");
     
     setInputValue(`I have severe tension and discomfort focus in my ${zone}. It feels like ${description}.`);
     setDetectedAnatomy(prev => Array.from(new Set([...prev, zone])));
     
     if (!isConsultationActive) {
       setIsConsultationActive(true);
       addLog('system', `Bypassed standard startup protocol. Targetted anatomical analysis: ${zone}`);
       const quickGreeting = `Focus pinpointed on the ${zone} joint area. Please go ahead and share how it limits your extension and flexibility, or send your symptom profile.`;
       addLog('ai', quickGreeting);
       if (settings.aiAutoSpeak) {
         speak(quickGreeting);
       }
     }
   };

   // Web Audio synth controller
   const startOscillator = () => {
     try {
       if (!audioCtxRef.current) {
         const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
         audioCtxRef.current = new AudioCtxClass();
       }
       
       const ctx = audioCtxRef.current;
       if (ctx.state === 'suspended') {
         ctx.resume();
       }

       // Clean existing oscillators
       if (oscRef.current) { try { oscRef.current.stop(); } catch(e){} }
       if (oscRef2.current) { try { oscRef2.current.stop(); } catch(e){} }
       if (oscRef3.current) { try { oscRef3.current.stop(); } catch(e){} }

       const gain = ctx.createGain();
       gain.gain.setValueAtTime(0, ctx.currentTime);
       gainRef.current = gain;

       if (resonatorMode === 'binaural') {
         // Dual oscillators (108Hz + 112Hz) producing a beautiful 4Hz Alpha beat
         const osc1 = ctx.createOscillator();
         const osc2 = ctx.createOscillator();

         osc1.type = 'sine';
         osc1.frequency.setValueAtTime(108, ctx.currentTime);

         osc2.type = 'sine';
         osc2.frequency.setValueAtTime(112, ctx.currentTime);

         osc1.connect(gain);
         osc2.connect(gain);

         osc1.start();
         osc2.start();

         oscRef.current = osc1;
         oscRef2.current = osc2;
       } else if (resonatorMode === 'tibetan') {
         // Multi-harmonic singing bowl sum (Fundamental 140Hz + detuned overlay peaks)
         const fundamental = ctx.createOscillator();
         const partial1 = ctx.createOscillator();
         const partial2 = ctx.createOscillator();

         fundamental.type = 'triangle'; // Warm brass harmonic
         fundamental.frequency.setValueAtTime(140, ctx.currentTime);

         partial1.type = 'sine';
         partial1.frequency.setValueAtTime(280.5, ctx.currentTime); // 0.5Hz vibration beat

         partial2.type = 'sine';
         partial2.frequency.setValueAtTime(420, ctx.currentTime);

         fundamental.connect(gain);
         partial1.connect(gain);
         partial2.connect(gain);

         fundamental.start();
         partial1.start();
         partial2.start();

         oscRef.current = fundamental;
         oscRef2.current = partial1;
         oscRef3.current = partial2;
       } else {
         // Schumann earth grounding resonance scale (78.3Hz deep sub-carrier)
         const subOsc = ctx.createOscillator();
         const fifthOsc = ctx.createOscillator();

         subOsc.type = 'sine';
         subOsc.frequency.setValueAtTime(78.3, ctx.currentTime);

         fifthOsc.type = 'sine';
         fifthOsc.frequency.setValueAtTime(117.45, ctx.currentTime);

         subOsc.connect(gain);
         fifthOsc.connect(gain);

         subOsc.start();
         fifthOsc.start();

         oscRef.current = subOsc;
         oscRef2.current = fifthOsc;
       }

       gain.connect(ctx.destination);
     } catch (err) {
       console.warn("Web Audio failed to load:", err);
     }
   };

   const stopOscillator = () => {
     try {
       if (oscRef.current) { try { oscRef.current.stop(); } catch(e){} oscRef.current = null; }
       if (oscRef2.current) { try { oscRef2.current.stop(); } catch(e){} oscRef2.current = null; }
       if (oscRef3.current) { try { oscRef3.current.stop(); } catch(e){} oscRef3.current = null; }
       if (gainRef.current) { gainRef.current = null; }
     } catch(e){}
   };

   // Visual procedural sine wave drawing inside a canvas
   useEffect(() => {
     let animationId: number;
     const canvas = canvasRef.current;
     if (!canvas) return;

     const ctx = canvas.getContext('2d');
     if (!ctx) return;

     let phaseShift = 0;

     const renderWave = () => {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       ctx.beginPath();
       ctx.lineWidth = 3;

       // Shift frequencies based on breathPhase swells
       let amplitude = 12;
       let freqRatio = 0.015;
       let strokeColor = 'rgba(20, 184, 166, 0.4)';

       if (breathePhase === 'Inhale') {
         amplitude = 25;
         freqRatio = 0.025;
         strokeColor = '#14b8a6';
       } else if (breathePhase === 'Hold') {
         amplitude = 15;
         freqRatio = 0.01;
         strokeColor = '#3b82f6';
       } else if (breathePhase === 'Exhale') {
         amplitude = 8;
         freqRatio = 0.035;
         strokeColor = '#10b981';
       }

       ctx.strokeStyle = strokeColor;

       for (let x = 0; x < canvas.width; x++) {
         const y = (canvas.height / 2) + Math.sin(x * freqRatio + phaseShift) * amplitude;
         if (x === 0) ctx.moveTo(x, y);
         else ctx.lineTo(x, y);
       }

       ctx.stroke();
       phaseShift += 0.05;
       animationId = requestAnimationFrame(renderWave);
     };

     renderWave();
     return () => cancelAnimationFrame(animationId);
   }, [breathePhase]);

   // Breathing Interval cycle implementation (4-7-8 loop)
   useEffect(() => {
     if (!isResonatorActive) {
       setBreathePhase('Idle');
       stopOscillator();
       if (breathTimerRef.current) clearInterval(breathTimerRef.current);
       return;
     }

     startOscillator();
     setBreathePhase('Inhale');
     setBreatheSeconds(4);

     let currentSecs = 4;
     let curPhase: 'Inhale' | 'Hold' | 'Exhale' = 'Inhale';

     breathTimerRef.current = setInterval(() => {
       currentSecs -= 1;
       
       if (currentSecs <= 0) {
         // Cycle state machines
         if (curPhase === 'Inhale') {
           curPhase = 'Hold';
           currentSecs = 7;
           showToast("HOLD BREATH (Vagal calming in progress...)", "info");
           if (gainRef.current && audioCtxRef.current) {
             gainRef.current.gain.exponentialRampToValueAtTime(0.12, audioCtxRef.current.currentTime + 1);
           }
         } else if (curPhase === 'Hold') {
           curPhase = 'Exhale';
           currentSecs = 8;
           showToast("EXHALE SLOWLY", "info");
           if (gainRef.current && audioCtxRef.current) {
             gainRef.current.gain.exponentialRampToValueAtTime(0.04, audioCtxRef.current.currentTime + 1);
           }
         } else {
           curPhase = 'Inhale';
           currentSecs = 4;
           showToast("INHALE DEEPLY", "info");
           if (gainRef.current && audioCtxRef.current) {
             gainRef.current.gain.exponentialRampToValueAtTime(0.2, audioCtxRef.current.currentTime + 1);
           }
         }
       }

       setBreathePhase(curPhase);
       setBreatheSeconds(currentSecs);
     }, 1000);

     return () => {
       if (breathTimerRef.current) clearInterval(breathTimerRef.current);
       stopOscillator();
     };
   }, [isResonatorActive]);

   const addLog = (sender: 'ai' | 'user' | 'system', text: string) => {
     setLogs(prev => [...prev, { id: Math.random().toString(36).substring(7), sender, text, timestamp: new Date() }]);
   };

   const processUserInput = async (text: string, isSimplification: boolean = false) => {
     if (!text || text.trim().length < 2 || isProcessing) return;
     
     setIsProcessing(true);
     if (!isSimplification) clearTranscripts();
     
     trackClick(isSimplification ? "AI Simplify Response" : "AI Processing User Query");
     console.log(isSimplification ? "Simplifying response:" : "Processing user input:", text);

     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 35000);

     try {
         const res = await fetch('/api/chat', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ 
                 message: isSimplification ? `Please simplify this clinical response and explain it in plain English for a patient: "${text}"` : text,
                 context: isSimplification 
                    ? "ACT AS A PATIENT ADVOCATE. Translate complex medical jargon into simple, reassuring terms for a patient. Keep the core health advice but remove technical barrier words." 
                    : `ACT AS A CLINICAL ASSISTANT. User is currently on module: ${pageContext.moduleTitle}. Analyze the user's symptoms. Be professional and brief. If symptoms suggest back, knee, shoulder, head, or hip issues, call them out specifically.`,
                 pageContext,
                 detailLevel: settings.aiResponseDetail,
                persona: settings.aiAssistantPersona
             }),
             signal: controller.signal
         });
         
         clearTimeout(timeoutId);
         
         if (!res.ok) {
             const errorData = await res.json().catch(() => ({}));
             throw new Error(errorData.error || `API Error: ${res.status}`);
         }
         
         const data = await res.json();
         const rawResponse = data.text || 'I apologize, but I am unable to process that at the moment.';
         const response = rawResponse.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');

         setIsProcessing(false);
         
         if (!isSimplification) {
            const userText = text.toLowerCase();
            let scoreIncrement = 0;
            
            if (userText.includes('back')) {
               setAiAnalysisSummary(prev => Array.from(new Set([...prev, 'Spinal Integrity', 'Neurological Screening Required'])));
               setDetectedAnatomy(prev => Array.from(new Set([...prev, 'Lumbar', 'Cervical'])));
               scoreIncrement += 15;
            }
            if (userText.includes('knee') || userText.includes('leg')) {
               setAiAnalysisSummary(prev => Array.from(new Set([...prev, 'Kinetics Analysis', 'Joint Stability Analysis'])));
               setDetectedAnatomy(prev => Array.from(new Set([...prev, 'Meniscus', 'ACL/PCL Zone'])));
               scoreIncrement += 10;
            }
            if (userText.includes('shoulder')) {
               setAiAnalysisSummary(prev => Array.from(new Set([...prev, 'Glenohumeral Mechanics', 'Ergonomic Stress Patterns'])));
               setDetectedAnatomy(prev => Array.from(new Set([...prev, 'Rotator Cuff', 'Labrum'])));
               scoreIncrement += 12;
            }
            if (userText.includes('head') || userText.includes('migraine')) {
               setAiAnalysisSummary(prev => Array.from(new Set([...prev, 'Craniofacial', 'Cervicogenic Screening'])));
               setDetectedAnatomy(prev => Array.from(new Set([...prev, 'Upper Cervical', 'Temporomandibular'])));
               scoreIncrement += 20;
            }
            
            if (scoreIncrement > 0) {
               setComplexityScore(prev => {
                   const newScore = Math.min(prev + scoreIncrement, 100);
                   if (newScore > 75) setRiskStatus('elevated');
                   else if (newScore > 40) setRiskStatus('moderate');
                   return newScore;
               });
            }
         }

         addLog('ai', response);
         if (settings.aiAutoSpeak) {
             speak(response);
         }
     } catch (error: any) {
         clearTimeout(timeoutId);
         console.error("AI Error:", error);
         const errorMsg = error.name === 'AbortError' ? "TIMEOUT: Neural link took too long." : `COMM_FAILURE: ${error.message || 'Link Interrupted'}`;
         addLog('system', errorMsg);
         setIsProcessing(false);
     }
   };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    
    addLog('user', inputValue);
    processUserInput(inputValue);
    setInputValue('');
  };

  useEffect(() => {
    if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs, transcript]);

  const toggleConsultation = () => {
    if (isConsultationActive) {
       trackClick("End AI Consultation");
       setIsConsultationActive(false);
       stopListening();
       if (stopSpeaking) stopSpeaking();
       addLog('system', 'Consultation session terminated by user.');
    } else {
       trackClick("Start AI Consultation");
       setIsConsultationActive(true);
       addLog('system', 'Consultation active. Monitoring voice/text input...');
       
       const greetingOptions = [
          "Hello. I am the Clinical AI Consultant. Please describe the symptoms or issues you are experiencing.",
          "Welcome. As your virtual clinical guide, I am ready to listen. Where are you feeling pain or discomfort today?",
          "Connection established. Let's begin the preliminary diagnosis. What brings you to CT6 Wellbeing today?"
       ];
       
       const greeting = settings.aiAssistantPersona === 'clinical' ? greetingOptions[2] : settings.aiAssistantPersona === 'friendly' ? greetingOptions[1] : greetingOptions[0];
       
       addLog('ai', greeting);
       if (settings.aiAutoSpeak) {
           speak(greeting);
       }
       setTimeout(() => {
          startListening();
       }, 3000); 
    }
  };

  // Handle voice transcript completion
  useEffect(() => {
    if (finalTranscript && isConsultationActive && !isProcessing) {
        console.log("Auto-processing final transcript:", finalTranscript);
        addLog('user', finalTranscript);
        stopListening(); 
        processUserInput(finalTranscript);
    }
  }, [finalTranscript, isConsultationActive, isProcessing]);

  // Unified effect to restart listening when AI is done speaking or idle
  useEffect(() => {
    if (isConsultationActive && voiceState === 'idle' && !isProcessing && !finalTranscript) {
        const timer = setTimeout(() => {
            console.log("Restarting listening mode...");
            startListening();
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [isConsultationActive, voiceState, isProcessing, startListening, finalTranscript]);

  useEffect(() => {
      return () => {
          stopListening();
          if (stopSpeaking) stopSpeaking();
      }
  }, []);

  // Handle voice triggers from mobile navigation dock
  useEffect(() => {
    const handleVoiceTrigger = () => {
      const greetingOptions = [
         "Hello. I am the Clinical AI Consultant. Please describe the symptoms or issues you are experiencing.",
         "Welcome. As your virtual clinical guide, I am ready to listen. Where are you feeling pain or discomfort today?",
         "Connection established. Let's begin the preliminary diagnosis. What brings you to CT6 Wellbeing today?"
      ];
      const greeting = settings.aiAssistantPersona === 'clinical' ? greetingOptions[2] : settings.aiAssistantPersona === 'friendly' ? greetingOptions[1] : greetingOptions[0];
      
      if (!isConsultationActive) {
        setIsConsultationActive(true);
        addLog('system', 'Direct consultation link established via navigation dock. Initializing voice monitoring...');
        addLog('ai', greeting);
        if (settings.aiAutoSpeak) {
            speak(greeting);
        }
        setTimeout(() => {
           startListening();
        }, 1500);
      } else {
        setTimeout(() => {
           startListening();
        }, 100);
      }
    };
    window.addEventListener('open-voice-consultation', handleVoiceTrigger);
    return () => window.removeEventListener('open-voice-consultation', handleVoiceTrigger);
  }, [isConsultationActive, startListening, settings.aiAssistantPersona, settings.aiAutoSpeak, speak]);

  return (
    <div className="min-h-screen pt-[var(--layout-header-height)] bg-slate-950 text-slate-300">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-8 lg:p-12 space-y-12">
        
        <header className="relative p-12 md:p-20 bg-slate-900 rounded-[4rem] border border-slate-800 shadow-premium-lg overflow-hidden group holographic-border">
          <div className="absolute inset-0 z-0 opacity-20">
             <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none"></div>
             <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[30s]" alt="Cyber" />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-8 max-w-3xl">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-black uppercase tracking-[0.3em] mb-4 shadow-[0_0_30px_rgba(45,212,191,0.2)] backdrop-blur-md">
                <ScanFace size={18} className="animate-pulse" /> Clinical Neuro-Engine v4.2
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-medium text-white tracking-tighter mb-4 leading-[0.85] drop-shadow-2xl">
                Intelligent <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-500 animate-gradient-x">Diagnosis Core</span>
              </h1>
              <p className="text-2xl text-slate-300 font-light max-w-2xl leading-relaxed border-l-4 border-teal-500 pl-8 drop-shadow-md">
                Engage with our state-of-the-art clinical reasoning engine. Speak naturally to undergo a deep-layer structural assessment before your physical visit.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 shrink-0">
               <div className={cn("px-8 py-5 rounded-[2.5rem] flex items-center gap-4 border-2 shadow-2xl backdrop-blur-3xl transition-all duration-700 relative overflow-hidden", isConsultationActive ? "bg-teal-500/10 border-teal-500/30 text-teal-400 ring-8 ring-teal-500/5 cinematic-glow" : "bg-slate-950/80 border-slate-800 text-slate-500 hover:border-slate-700")}>
                  {isConsultationActive && <div className="absolute inset-0 bg-teal-500/5 shimmer pointer-events-none" />}
                  <div className="relative flex items-center justify-center z-10">
                      <Activity size={28} className={cn(isConsultationActive && !isProcessing && voiceState === 'listening' ? "animate-pulse drop-shadow-[0_0_15px_rgba(45,212,191,0.8)]" : "")} />
                      {isConsultationActive && <span className="absolute w-3 h-3 rounded-full bg-teal-400 bottom-0 right-0 shadow-[0_0_20px_4px_rgba(45,212,191,0.6)] animate-ping"></span>}
                  </div>
                  <div className="flex flex-col min-w-[140px] z-10">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60">
                       {voiceState === 'listening' ? (transcript ? 'Signal Detected' : 'Listening...') : 
                        voiceState === 'speaking' ? 'AI Vocalizing' : 
                        voiceState === 'error' ? 'Link Interrupted' : 'Engine Status'}
                    </span>
                    <span className={cn("text-lg font-bold tracking-tight", voiceState === 'error' ? 'text-red-400' : '')}>
                       {isConsultationActive ? (isProcessing ? "Analyzing Core..." : (voiceState === 'error' ? "Mic Blocked" : "Neural Link Online")) : "System Standby"}
                    </span>
                  </div>
               </div>
               
               <button
                 onClick={toggleConsultation}
                 className={cn(
                   "h-20 px-12 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs transition-all duration-500 flex items-center justify-center gap-4 shadow-xl hover:-translate-y-2 hover:scale-[1.02] active:scale-95 group relative overflow-hidden",
                   isConsultationActive 
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-glow-red" 
                      : "bg-teal-600 hover:bg-teal-500 text-slate-950 shadow-glow-teal"
                 )}
               >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-4">
                    {isConsultationActive ? <StopCircle size={24} className="group-hover:rotate-90 transition-transform" /> : <PlayCircle size={24} className="group-hover:scale-125 transition-transform" />}
                    {isConsultationActive ? 'Terminate Session' : 'Begin Deep Consult'}
                  </span>
               </button>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        </header>

        {/* Feature Grid for AI Consultant */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[
            { icon: Brain, title: "Neural Logic", desc: "Advanced algorithmic reasoning trained on 10,000+ musculoskeletal cases." },
            { icon: ShieldCheck, title: "Data Privacy", desc: "All voice data is encrypted and processed locally for maximum privacy." },
            { icon: Zap, title: "Instant Analysis", desc: "Real-time extraction of clinical markers for immediate health feedback." },
            { icon: ClipboardList, title: "Smart Referrals", desc: "Directly syncs findings to our human practitioners for your visit." }
          ].map((feature, i) => (
            <div key={i} className="p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] crystal-glass flex flex-col gap-6 group hover:border-teal-500/30 transition-all">
               <div className="w-16 h-16 rounded-[1.5rem] bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-500 shadow-lg ring-4 ring-teal-500/5">
                 <feature.icon size={28} />
               </div>
               <div>
                 <h4 className="text-xl font-bold text-white tracking-tight leading-none mb-3">{feature.title}</h4>
                 <p className="text-sm text-slate-500 font-light leading-relaxed">{feature.desc}</p>
               </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 supports-[backdrop-filter]:bg-slate-900/30 backdrop-blur-2xl">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Cpu size={14} /> Diagnostic Parameters</h3>
                 <ul className="space-y-4">
                    <li className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
                       <span className="text-slate-400">Persona Profile</span>
                       <span className="text-white font-medium capitalize">{settings.aiAssistantPersona}</span>
                    </li>
                    <li className="flex flex-col gap-3 text-sm border-b border-slate-800 pb-3">
                       <div className="flex justify-between items-center w-full">
                          <span className="text-slate-400">Response Detail</span>
                          <span className="text-white font-medium capitalize text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{settings.aiResponseDetail}</span>
                       </div>
                       <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                          {(['concise', 'standard', 'verbose'] as const).map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => updateSetting('aiResponseDetail', level)}
                              className={cn(
                                "flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
                                settings.aiResponseDetail === level 
                                  ? "bg-teal-600 text-slate-950 shadow-lg shadow-teal-500/20" 
                                  : "text-slate-500 hover:text-slate-300"
                              )}
                            >
                              {level}
                            </button>
                          ))}
                       </div>
                    </li>
                    <li className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
                       <span className="text-slate-400">Response Engine</span>
                       <span className={cn("font-medium", settings.aiAutoSpeak ? "text-teal-400" : "text-amber-500")}>
                           {settings.aiAutoSpeak ? 'Interactive Voice' : 'Text Fallback'}
                       </span>
                    </li>
                    <li className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
                       <span className="text-slate-400">Clinical Load</span>
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-white font-medium">Nominal</span>
                       </div>
                    </li>
                 </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-premium space-y-8">
                 <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Case Complexity</h4>
                    <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                          className={cn("h-full rounded-full transition-all duration-1000", complexityScore > 60 ? "bg-red-500" : "bg-teal-500")}
                          initial={{ width: 0 }}
                          animate={{ width: `${complexityScore}%` }}
                       />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-black text-white mix-blend-difference">{complexityScore}%</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Risk Assessment</h4>
                    <div className={cn(
                      "px-4 py-2 rounded-xl border flex items-center gap-3 transition-colors",
                      riskStatus === 'elevated' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      riskStatus === 'moderate' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    )}>
                       <div className={cn("w-2 h-2 rounded-full", riskStatus === 'elevated' ? "bg-red-500" : riskStatus === 'moderate' ? "bg-amber-500" : "bg-emerald-500")} />
                       <span className="text-xs font-bold uppercase tracking-widest">{riskStatus} Priority</span>
                    </div>
                 </div>

                 {detectedAnatomy.length > 0 && (
                   <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Anatomical Focus</h4>
                      <div className="flex flex-wrap gap-2">
                         {detectedAnatomy.map((zone, i) => (
                           <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">{zone}</span>
                         ))}
                      </div>
                   </div>
                 )}
              </div>

              {aiAnalysisSummary.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/80 border border-teal-900/50 rounded-[2.5rem] p-8 shadow-[0_0_40px_-10px_rgba(20,184,166,0.15)]"
                  >
                     <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-6 flex items-center gap-2"><ClipboardList size={14} /> Neural Inference Results</h3>
                     <div className="flex flex-wrap gap-2">
                        {aiAnalysisSummary.map((tag, idx) => (
                           <span key={idx} className="px-3 py-2 bg-teal-950/50 text-teal-300 border border-teal-800/50 rounded-xl text-xs font-medium flex items-center gap-2">
                              <Hash size={12} className="opacity-50" /> {tag}
                           </span>
                        ))}
                     </div>
                  </motion.div>
              )}
           </div>

           <div className="lg:col-span-5 relative flex flex-col">
              <div className="flex-1 bg-gradient-to-b from-slate-800/20 to-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden flex flex-col items-center justify-center min-h-[400px] relative">
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                      <Globe size={400} className="text-teal-900/20" strokeWidth={0.5} />
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                     <div className="relative mb-12 group cursor-pointer" onClick={isConsultationActive ? () => { stopListening(); if(stopSpeaking) stopSpeaking(); setIsConsultationActive(false); } : toggleConsultation}>
                         <div className={cn(
                            "absolute inset-0 rounded-full blur-3xl transition-all duration-[3000ms] pointer-events-none",
                            isConsultationActive ? (isProcessing ? "bg-amber-500/40 blur-3xl scale-150 animate-pulse" : "bg-teal-500/30 scale-125") : "bg-slate-700/20"
                         )}></div>
                         <div className={cn(
                            "w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-700 relative overflow-hidden backdrop-blur-md shadow-2xl border-4",
                            isConsultationActive 
                               ? (isProcessing ? "bg-amber-900/40 border-amber-500/50 shadow-amber-500/20" : "bg-teal-900/30 border-teal-500/50 shadow-teal-500/30") 
                               : "bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700"
                         )}>
                              {isConsultationActive && !isProcessing && voiceState === 'listening' && (
                                  <div className="absolute inset-0 flex items-center justify-center gap-1 px-4 opacity-50">
                                      <div className="w-1 h-8 bg-teal-400 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                                      <div className="w-1 h-16 bg-teal-400 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                                      <div className="w-1 h-12 bg-teal-400 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                                      <div className="w-1 h-20 bg-teal-400 rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                                      <div className="w-1 h-10 bg-teal-400 rounded-full animate-[bounce_1s_infinite_300ms]"></div>
                                  </div>
                              )}

                              {isProcessing ? (
                                  <Cpu size={48} className="text-amber-400 animate-pulse relative z-10" />
                              ) : isConsultationActive ? (
                                  <Mic size={48} className={cn("text-teal-400 relative z-10", voiceState === 'listening' ? "" : "opacity-80 scale-90 transition-transform")} />
                              ) : (
                                  <Bot size={48} className="text-slate-500 relative z-10 group-hover:text-slate-300 transition-colors" />
                              )}
                         </div>
                     </div>

                     <div className="text-center space-y-3 z-10 px-6">
                        <h2 className={cn("text-2xl font-display font-medium tracking-tight transition-colors", isProcessing ? "text-amber-400" : isConsultationActive ? "text-white" : "text-slate-500")}>
                           {isProcessing ? "Synthesizing Reply..." : isConsultationActive ? (voiceState === 'listening' ? "Listening..." : voiceState === 'speaking' ? "Consultant Speaking..." : voiceState === 'error' ? "Interface Halted" : "Processing Audio...") : "Consultant Offline"}
                        </h2>
                        <div className="h-24 text-slate-400 text-sm font-light w-full max-w-sm mx-auto flex flex-col items-center justify-center text-center gap-3">
                            {voiceError ? (
                                <>
                                  <span className="text-red-400 font-bold flex items-center gap-2"><AlertCircle size={16} /> {voiceError.split(':')[0]}</span>
                                  <p className="text-[10px] opacity-70 leading-tight">{voiceError.split(':')[1] || 'Unknown diagnostic failure.'}</p>
                                  {voiceError.includes('PERMISSION_DENIED') && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); requestPermission(); }}
                                      className="px-4 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-teal-500/30 transition-all"
                                    >
                                      Enable Microphone
                                    </button>
                                  )}
                                  {voiceError.includes('NETWORK_ERROR') && (
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); window.open(window.location.href, '_blank'); }}
                                       className="px-4 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-teal-500/30 transition-all"
                                     >
                                       Open in New Tab
                                     </button>
                                  )}
                                </>
                            ) : isConsultationActive && transcript ? (
                                <span className="italic fade-in">"{transcript}"</span>
                            ) : isConsultationActive && !isProcessing ? (
                                <span>Speak clearly into your microphone...</span>
                            ) : null}
                        </div>
                    </div>
                 </div>

              </div>
           </div>

           <div className="lg:col-span-4 bg-[#0a0f1c]/80 backdrop-blur-3xl crystal-glass rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] relative holographic-border z-0">
               <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none mix-blend-screen mix-blend-lighten z-[-1]"></div>
               <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md relative z-10">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-800 rounded-xl text-slate-400">
                           <AudioLines size={16} />
                       </div>
                       <h3 className="font-display font-medium text-white tracking-tight">Real-Time Transcript</h3>
                   </div>
                   <button className="text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-slate-300 transition-colors" onClick={() => setLogs([])}>Clear</button>
               </div>
               
               <div ref={logsRef} className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar relative z-0">
                  <AnimatePresence initial={false}>
                      {logs.map((log) => (
                         <motion.div
                           initial={{ opacity: 0, y: 10, scale: 0.98 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           key={log.id}
                           className={cn(
                              "flex flex-col gap-1.5",
                              log.sender === 'user' ? "items-end ml-4" : log.sender === 'system' ? "items-center my-4" : "items-start mr-4"
                           )}
                         >
                            {log.sender === 'system' ? (
                                <span className="bg-slate-800 text-slate-400 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold border border-slate-700 shadow-sm text-center">
                                    {log.text}
                                </span>
                            ) : (
                                <div className={cn(
                                    "px-4 py-3 text-sm leading-relaxed",
                                    log.sender === 'user' 
                                        ? "bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl rounded-tr-sm"
                                        : "bg-teal-900/30 text-teal-100 border border-teal-800/50 rounded-2xl rounded-tl-sm shadow-[0_4px_20px_-10px_rgba(20,184,166,0.3)]"
                                )}>
                                    {log.text}
                                    {log.sender === 'ai' && (
                                      <div className="mt-2 pt-2 border-t border-teal-800/30 flex gap-2">
                                         <button 
                                           onClick={() => processUserInput(log.text, true)}
                                           disabled={isProcessing}
                                           className="flex items-center gap-1.5 px-2 py-1 rounded bg-teal-800/20 hover:bg-teal-800/40 text-[9px] font-black uppercase tracking-widest text-teal-400/80 hover:text-teal-300 transition-all disabled:opacity-50"
                                           aria-label="Simplify medical language"
                                         >
                                           <Stethoscope size={12} /> Simplify
                                         </button>
                                         <button 
                                           onClick={() => speak(log.text)}
                                           className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/20 hover:bg-slate-700/40 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all"
                                           aria-label="Play response audio"
                                         >
                                           <Volume2 size={12} /> Repeat
                                         </button>
                                      </div>
                                    )}
                                </div>
                            )}
                            {log.sender !== 'system' && (
                                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-600 px-1">
                                    {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            )}
                         </motion.div>
                      ))}
                  </AnimatePresence>
               </div>

               <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 relative z-10">
                   <form onSubmit={handleSendMessage} className="relative group">
                     <input 
                       type="text"
                       value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}
                       disabled={!isConsultationActive || isProcessing}
                       placeholder={isConsultationActive ? "Type your symptoms here..." : "Activate engine to type..."}
                       className="w-full bg-slate-950/50 border border-slate-800 p-4 pr-16 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:border-teal-500 outline-none transition-all focus:ring-4 focus:ring-teal-500/5 disabled:opacity-50"
                     />
                     <button 
                       type="submit"
                       disabled={!isConsultationActive || isProcessing || !inputValue.trim()}
                       className="absolute right-2 top-2 bottom-2 px-4 bg-teal-600 text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-500 transition-all disabled:opacity-0 disabled:scale-95"
                     >
                       Send
                     </button>
                   </form>
                   <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-600 px-2 py-3">
                      <Settings2 size={12} className="shrink-0" /> Multi-modal interface initialized. 
                   </div>
               </div>
           </div>

        </div>

         {/* Recommendations Logic - Expanded Module */}
        <AnimatePresence>
          {aiAnalysisSummary.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pt-12"
            >
               <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-800" />
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-teal-500 whitespace-nowrap">Suggested Clinical Pathways</h3>
                  <div className="h-px flex-1 bg-slate-800" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <motion.div 
                    whileHover={{ y: -10 }}
                    className="p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-premium flex flex-col gap-8 group"
                  >
                     <div className="flex items-center justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                           <TrendingUp size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">92% Match</span>
                     </div>
                     <div>
                        <h4 className="text-2xl font-display font-medium text-white mb-2 tracking-tight">Targeted Rehabilitation</h4>
                        <p className="text-slate-500 font-light text-sm leading-relaxed">Based on your reported symptoms of <span className="text-teal-400 font-bold">{detectedAnatomy[0] || 'structural'}</span> discomfort, we recommend a focused mechanical assessment.</p>
                     </div>
                     <Link to="/treatments" className="w-full py-5 bg-slate-800 hover:bg-teal-600 hover:text-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center">
                        Explore Treatment Protocols
                     </Link>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -10 }}
                    className="p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-premium flex flex-col gap-8 group"
                  >
                     <div className="flex items-center justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                           <Users size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Expert Lead</span>
                     </div>
                     <div>
                        <h4 className="text-2xl font-display font-medium text-white mb-2 tracking-tight">Consult Specialist</h4>
                        <p className="text-slate-500 font-light text-sm leading-relaxed">A senior clinical lead specialized in <span className="text-indigo-400 font-bold">{aiAnalysisSummary[0] || 'diagnostics'}</span> can perform a hands-on verification.</p>
                     </div>
                     <Link to="/practitioners" className="w-full py-5 bg-slate-800 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center">
                        Request Practitioner Match
                     </Link>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -10 }}
                    className="p-10 bg-slate-950 border border-teal-500/30 rounded-[3rem] shadow-premium flex flex-col gap-8 group relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
                     <div className="flex items-center justify-between relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center">
                           <Calendar size={24} />
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Slots Available</span>
                        </div>
                     </div>
                     <div className="relative z-10">
                        <h4 className="text-2xl font-display font-medium text-white mb-2 tracking-tight">Priority Booking</h4>
                        <p className="text-slate-400 font-light text-sm leading-relaxed">Direct clinical integration. Your AI-extracted findings will be shared with the clinic for a faster triage process.</p>
                     </div>
                     <button 
                        onClick={() => {
                           trackClick("AI Priority Booking Clicked");
                           window.open(BOOKING_URL, '_blank');
                        }}
                        className="w-full py-6 bg-teal-500 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-400 hover:-translate-y-1 transition-all relative z-10 shadow-2xl shadow-teal-500/20"
                     >
                        Finalize Priority Booking
                     </button>
                  </motion.div>
               </div>
            </motion.section>
          )}
        </AnimatePresence>

         {/* ==========================================
             ACTIVE UPGRADES: HUMAN BODY HOTSPOTS & VAGUS DEEP BREATH COACH
             ========================================== */}
         <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-12 border-t border-slate-900 font-sans">
           
           {/* Visual Hotspots Map Card */}
           <div className="xl:col-span-5 bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 backdrop-blur-3xl flex flex-col justify-between gap-8 h-full">
             <div className="space-y-4">
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 font-bold text-[9px] uppercase tracking-widest border border-teal-500/20">
                 <ScanFace size={12} /> Somatotopic Pre-Screening
               </span>
               <h3 className="text-3xl font-display font-medium text-white tracking-tight leading-none">
                 Human Body Hotspots
               </h3>
               <p className="text-sm text-slate-500 font-light leading-relaxed">
                 Select an active anatomical zone directly on this diagnostic schematic to instantly feed symptom contexts into the clinical AI core.
               </p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
               {/* Clickable SVG Diagram */}
               <div className="sm:col-span-5 flex justify-center py-4 bg-slate-950/40 rounded-3xl border border-slate-900 relative">
                 <svg className="w-40 h-64 text-slate-500" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                   {/* Head & Neck */}
                   <circle cx="50" cy="25" r="12" className="stroke-slate-800 fill-slate-900" strokeWidth="2" />
                   <path d="M48,37 L52,47" className="stroke-slate-800" strokeWidth="3" />
                   {/* Shoulders */}
                   <path d="M25,50 L75,50 L65,90 L35,90 Z" className="stroke-slate-800 fill-slate-900/40" strokeWidth="2" />
                   {/* Arms */}
                   <path d="M25,50 L15,100" className="stroke-slate-800" strokeWidth="2" />
                   <path d="M75,50 L85,100" className="stroke-slate-800" strokeWidth="2" />
                   {/* Spine/Center Line */}
                   <path d="M50,47 L50,110" className="stroke-slate-700" strokeDasharray="3" strokeWidth="2" />
                   {/* Spine/Lumbar */}
                   <path d="M35,90 L65,90 L60,120 L40,120 Z" className="stroke-slate-800 fill-slate-900/40" strokeWidth="2" />
                   {/* Legs */}
                   <path d="M40,120 L35,185" className="stroke-slate-800" strokeWidth="2" />
                   <path d="M60,120 L65,185" className="stroke-slate-800" strokeWidth="2" />

                   {/* Hotspot Pulse Indicators */}
                   {/* Cervical (C1-C7) */}
                   <circle cx="50" cy="38" r="4" className="fill-teal-500 animate-ping opacity-75 cursor-pointer" onClick={() => handleHotspotClick('Upper Cervical Spine', 'chronic localized stiffness at C1-C3 with occipital tension headaches')} />
                   <circle cx="50" cy="38" r="3" className="fill-teal-400 cursor-pointer" onClick={() => handleHotspotClick('Upper Cervical Spine', 'chronic localized stiffness at C1-C3 with occipital tension headaches')} />

                   {/* Shoulder Rotator Cuff */}
                   <circle cx="28" cy="52" r="4" className="fill-indigo-500 animate-ping opacity-75 cursor-pointer" onClick={() => handleHotspotClick('Rotator Cuff / Shoulder Joint', 'sharp catching muscle pinch during high arm abductions')} />
                   <circle cx="28" cy="52" r="3" className="fill-indigo-400 cursor-pointer" onClick={() => handleHotspotClick('Rotator Cuff / Shoulder Joint', 'sharp catching muscle pinch during high arm abductions')} />

                   {/* Lumbar Spine */}
                   <circle cx="50" cy="100" r="4" className="fill-teal-500 animate-ping opacity-75 cursor-pointer" onClick={() => handleHotspotClick('Lumbar Vertebrae / L4-S1', 'aching tightness and compression when sitting for more than 20 minutes')} />
                   <circle cx="50" cy="100" r="3" className="fill-teal-400 cursor-pointer" onClick={() => handleHotspotClick('Lumbar Vertebrae / L4-S1', 'aching tightness and compression when sitting for more than 20 minutes')} />

                   {/* Pelvis/Hip */}
                   <circle cx="38" cy="122" r="4" className="fill-indigo-500 animate-ping opacity-75 cursor-pointer" onClick={() => handleHotspotClick('Pelvic Joint (SI Joint)', 'unilateral joint lock and pulling sensation during walking')} />
                   <circle cx="38" cy="122" r="3" className="fill-indigo-400 cursor-pointer" onClick={() => handleHotspotClick('Pelvic Joint (SI Joint)', 'unilateral joint lock and pulling sensation during walking')} />

                   {/* Knee Meniscus */}
                   <circle cx="62" cy="155" r="4" className="fill-teal-500 animate-ping opacity-75 cursor-pointer" onClick={() => handleHotspotClick('Knee Articulation (Meniscus)', 'frequent knee joint cracking and soreness during loaded squats')} />
                   <circle cx="62" cy="155" r="3" className="fill-teal-400 cursor-pointer" onClick={() => handleHotspotClick('Knee Articulation (Meniscus)', 'frequent knee joint cracking and soreness during loaded squats')} />
                 </svg>
                 <div className="absolute top-2 left-3 text-[8px] font-mono text-slate-600 uppercase tracking-widest font-black">Interactive Landmark Map</div>
               </div>

               {/* Landmark Hotspot Hot links */}
               <div className="sm:col-span-7 space-y-2.5">
                 {[
                   { name: "Cervical Neck spine", desc: "Pain at base of skull, upper neck clicks", note: "Occipital tension group", target: "Upper Cervical Spine", phrase: "chronic localized stiffness at C1-C3 with occipital tension headaches" },
                   { name: "Shoulder Rotator Cuff", desc: "Pain raising arm sideways beyond 90°", note: "Subacromial mechanics", target: "Rotator Cuff / Shoulder Joint", phrase: "sharp catching muscle pinch during high arm abductions" },
                   { name: "Lumbar Spinal region (L4-S1)", desc: "Low back compression when seated", note: "Erector group decompression", target: "Lumbar Vertebrae / L4-S1", phrase: "aching tightness and compression when sitting for more than 20 minutes" },
                   { name: "Pelvic / SI Alignment", desc: "Hip lock when loading or twisting", note: "Sacroiliac joint restriction", target: "Pelvic Joint (SI Joint)", phrase: "unilateral joint lock and pulling sensation during walking" },
                   { name: "ACL / Knee Patella joint", desc: "Soreness under knee cap after loading", note: "Tibiofemoral gliding", target: "Knee Articulation (Meniscus)", phrase: "frequent knee joint cracking and soreness during loaded squats" }
                 ].map((hot, idx) => (
                   <button
                     key={idx}
                     onClick={() => handleHotspotClick(hot.target, hot.phrase)}
                     className="w-full text-left p-2.5 hover:p-3 rounded-xl bg-slate-900 hover:bg-teal-950/20 border border-slate-800 hover:border-teal-500/30 class-transition flex items-center justify-between group cursor-pointer"
                   >
                     <div>
                       <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-teal-400 tracking-wider block leading-none mb-1">{hot.name}</span>
                       <span className="text-[11px] text-slate-400 font-light leading-none">{hot.desc}</span>
                     </div>
                     <ChevronRight size={14} className="text-slate-700 group-hover:text-teal-400 group-hover:translate-x-1 class-transition" />
                   </button>
                 ))}
               </div>
             </div>
           </div>

           {/* Audio Resonant Breath Coach Card */}
           <div className="xl:col-span-7 bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 backdrop-blur-3xl flex flex-col justify-between gap-8 h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
             
             <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
               <div className="space-y-4">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-505/10 text-indigo-300 font-bold text-[9px] uppercase tracking-widest border border-indigo-500/20">
                   <AudioLines size={12} className="animate-pulse" /> Acoustic Vagus Decompression
                 </span>
                 <h3 className="text-3xl font-display font-medium text-white tracking-tight leading-none">
                   Resonant Acoustic Breath Coach
                 </h3>
                 <p className="text-sm text-slate-500 font-light leading-relaxed max-w-xl">
                   Somatic protective guarding locks muscles. Activate this bi-physio trainer. It emits soft, low-frequency 110Hz resonant acoustic waves synchronized with clinical 4-7-8 vagus regulation timings (Inhale, Hold, Exhale).
                 </p>
               </div>

               <button
                 type="button"
                 onClick={() => {
                   trackClick("Toggle Vagus Breath Resonator");
                   setIsResonatorActive(!isResonatorActive);
                 }}
                 className={cn(
                   "h-14 px-8 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all shrink-0 active:scale-95 flex items-center justify-center gap-2 border cursor-pointer",
                   isResonatorActive 
                     ? "bg-emerald-600 text-slate-950 border-emerald-400 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20" 
                     : "bg-slate-950 text-indigo-400 border-indigo-500/25 hover:border-indigo-400"
                 )}
               >
                 {isResonatorActive ? <StopCircle size={16} /> : <PlayCircle size={16} />}
                 {isResonatorActive ? "Active: Halt Coach" : "Engage Resonator"}
               </button>
             </div>

             {/* Dynamic Live Procedural Wave Canvas */}
             <div className="relative bg-slate-950 border border-slate-850 rounded-[2.5rem] p-8 overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
               <canvas 
                 ref={canvasRef} 
                 width="600" 
                 height="120" 
                 className="w-full h-[120px] relative z-10 opacity-80"
               />
               
               <AnimatePresence mode="wait">
                 {isResonatorActive ? (
                   <motion.div 
                     key={breathePhase}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 z-20"
                   >
                     <span className={cn(
                       "text-4xl font-display font-black tracking-tight",
                       breathePhase === 'Inhale' ? "text-teal-400" : breathePhase === 'Hold' ? "text-indigo-400" : "text-emerald-400"
                     )}>
                       {breathePhase.toUpperCase()}
                     </span>
                     <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-2">
                       {breatheSeconds} SECONDS REMAINING
                     </span>
                   </motion.div>
                 ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/10 z-20 pointer-events-none">
                     <span className="text-slate-600 text-xs uppercase tracking-widest font-black">Waveform Cooled Grid</span>
                     <span className="text-[9px] text-slate-700 uppercase mt-1">Oscillatory circuit closed</span>
                   </div>
                 )}
               </AnimatePresence>
             </div>

             {/* Vagal Downregulation Status Indicators */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 text-center">
                 <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Tympanic Frequency</div>
                 <div className="text-lg font-bold text-slate-300 font-mono mt-1">110 Hz</div>
               </div>
               <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 text-center">
                 <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Nervous Target</div>
                 <div className="text-lg font-bold text-teal-400 font-mono mt-1">Vagus Nerve (X)</div>
               </div>
               <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 text-center">
                 <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Sync Rhythm</div>
                 <div className="text-lg font-bold text-slate-300 font-mono mt-1">4 : 7 : 8</div>
               </div>
             </div>
           </div>

         </section>

      </div>
    </div>
  );
}
