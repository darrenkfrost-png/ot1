import { useState } from 'react';
import { Bot, Sparkles, Brain, Loader2, Award, Zap, HeartPulse, Stethoscope, ChevronRight, Activity } from 'lucide-react';
import { Practitioner } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAnalytics } from '../context/AnalyticsContext';

export default function PractitionerAIAnalytics({ practitioner }: { practitioner: Practitioner }) {
    const [analyzing, setAnalyzing] = useState(false);
    const { trackClick } = useAnalytics();
    const [analysis, setAnalysis] = useState<{ 
        text: string, 
        metrics: { impactScore: number, patientFocus: string, averageRecoveryTime: string, satisfactionScore: number },
        testimonialSummary: string
    } | null>(null);

    const runAnalysis = async () => {
        setAnalyzing(true);
        trackClick("Run AI Clinical Deep-Dive");
        try {
            const response = await fetch("/api/analyze-practitioner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ practitioner }),
            });
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            setAnalysis({ text: data.analysis, metrics: data.metrics, testimonialSummary: data.testimonialSummary });
        } catch (error) {
            console.error("AI error:", error);
            setAnalysis({ 
                text: "The clinical AI system is currently synchronizing patient outcome data. Please try again later.", 
                metrics: { impactScore: 0, patientFocus: "N/A", averageRecoveryTime: "N/A", satisfactionScore: 0 },
                testimonialSummary: "N/A"
            });
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <section className="bg-slate-900 p-8 sm:p-10 md:p-12 text-white rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 border-b border-slate-800 pb-8">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="p-4 bg-teal-500/20 rounded-2xl text-teal-400 border border-teal-500/30">
                            <Bot size={28} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center animate-pulse">
                            <Sparkles size={10} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-3xl font-display font-medium text-white tracking-tight">AI Clinical Insights</h3>
                            <span className="px-2.5 py-1 bg-teal-500 text-teal-50 text-[10px] font-bold uppercase tracking-widest rounded-lg">BETA</span>
                        </div>
                        <p className="text-slate-400 font-light text-sm sm:text-base">Advanced analysis of patient outcomes and specializations.</p>
                    </div>
                </div>
                
                {analysis && (
                    <button 
                        onClick={() => setAnalysis(null)} 
                        className="text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Reset Analysis
                    </button>
                )}
            </div>
            
            <div className="relative z-10">
                <AnimatePresence mode="wait">
                    {!analysis ? (
                        <motion.button 
                            key="button"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={runAnalysis}
                            disabled={analyzing}
                            className="w-full py-10 flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/30 text-white rounded-[2rem] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 group hover:shadow-premium"
                        >
                            {analyzing ? (
                                <>
                                    <div className="relative">
                                        <Loader2 className="animate-spin text-teal-400" size={32} />
                                        <div className="absolute inset-0 bg-teal-400 blur-lg opacity-50 rounded-full animate-pulse"></div>
                                        {/* Scanner Line */}
                                        <motion.div 
                                          animate={{ y: [-20, 20, -20] }}
                                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                          className="absolute left-1/2 -translate-x-1/2 w-12 h-0.5 bg-teal-400 shadow-[0_0_10px_#2dd4bf] z-20"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center">
                                       <span className="font-bold tracking-widest text-lg uppercase font-mono">Synthesizing Clinic Data...</span>
                                       <div className="flex gap-1 mt-2">
                                          {[...Array(5)].map((_, i) => (
                                              <motion.div 
                                                key={i}
                                                animate={{ opacity: [0.2, 1, 0.2] }}
                                                transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
                                                className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                                              />
                                          ))}
                                       </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-teal-500/20 group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                                        <Brain size={28} className="relative z-10" />
                                        <div className="absolute inset-0 border-t-2 border-white/30 rounded-full animate-spin-slow"></div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xl font-bold tracking-tight">Run Deep-Dive Assessment</span>
                                        <span className="text-slate-400 font-light text-sm">Discover hidden treatment patterns and outcome statistics.</span>
                                    </div>
                                </>
                            )}
                        </motion.button>
                    ) : (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }}
                            className="space-y-10"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Impact Score', value: analysis.metrics.impactScore + '/100', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                                    { label: 'Patient Focus', value: analysis.metrics.patientFocus, icon: HeartPulse, color: 'text-rose-400', bg: 'bg-rose-400/10', textLg: true },
                                    { label: 'Avg Recovery', value: analysis.metrics.averageRecoveryTime, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-400/10', textLg: true }
                                ].map((m, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={i} 
                                        className="relative p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 flex flex-col justify-center overflow-hidden hover:bg-slate-800 transition-colors"
                                    >
                                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${m.bg}`}></div>
                                        
                                        {/* Technical Corner Brackets */}
                                        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20"></div>
                                        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20"></div>
                                        
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-xl ${m.bg} ${m.color} shadow-lg shadow-black/20`}>
                                                <m.icon size={16} />
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{m.label}</div>
                                        </div>
                                        <div className={cn("font-display font-medium tracking-tight text-white", m.textLg ? "text-xl sm:text-2xl mt-1" : "text-4xl")}>
                                            {m.value}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <Brain size={14} className="animate-pulse" /> Clinical Evaluation Logic
                                        </h4>
                                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <span>Model: Gemini 3 Flash</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                            <span>Tokens: Optimized</span>
                                        </div>
                                    </div>
                                    <div className="p-8 sm:p-10 rounded-[2.5rem] bg-slate-950/40 border border-white/5 backdrop-blur-md relative group/box overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover/box:opacity-10 transition-opacity">
                                            <Activity size={100} />
                                        </div>
                                        <div className="absolute top-0 left-8 h-px w-48 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>
                                        <div className="absolute bottom-0 right-8 h-px w-48 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                                        
                                        <p className="text-slate-300 leading-relaxed text-lg sm:text-xl font-light relative z-10 first-letter:text-4xl first-letter:font-display first-letter:mr-3 first-letter:float-left first-letter:text-teal-400">
                                            {analysis.text}
                                        </p>
                                    </div>
                                </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="relative group"
                            >
                                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Stethoscope size={14} /> Consolidated Patient Perspective
                                </h4>
                                <div className="bg-gradient-to-br from-teal-900 to-slate-900 border border-teal-800 p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-1000">
                                        <Sparkles size={120} />
                                    </div>
                                    <p className="text-xl sm:text-2xl leading-relaxed text-teal-50 font-light italic relative z-10 font-display">
                                        "{analysis.testimonialSummary}"
                                    </p>
                                    <div className="mt-8 flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-widest relative z-10">
                                       Based on Verified Success Stories <ChevronRight size={14} />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
