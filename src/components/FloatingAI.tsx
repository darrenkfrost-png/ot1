import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Sparkles, Brain, Mic, StopCircle, Loader2, MessageSquare, ChevronRight, Activity, AlertCircle, Stethoscope, Volume2 } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAnalytics } from '../context/AnalyticsContext';
import { useSettings } from '../context/SettingsContext';
import { useCommand } from '../context/CommandContext';
import { usePageContext } from '../context/PageContextContext';
import { useVoice } from '../hooks/useVoice';
import Logo from './Logo';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const { state: voiceState, transcript, finalTranscript, startListening, stopListening, speak, error: voiceError, requestPermission, isSupported, clearTranscripts } = useVoice();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { trackClick } = useAnalytics();
  const { settings } = useSettings();
  const { executeVoicePhrase } = useCommand();
  const { pageContext } = usePageContext();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('floating-ai-history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse history", e);
    }
    return [
      { id: 'msg-init-1', sender: 'ai', text: "Hello! I am your CT6 Clinical Assistant. How can I help you with your health journey today? Use Cmd/Ctrl+K to activate me quickly." }
    ];
  });

  useEffect(() => {
    localStorage.setItem('floating-ai-history', JSON.stringify(messages));
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, transcript]);

  const clearHistory = () => {
    setMessages([
      { id: 'msg-reset-' + Math.random().toString(36).substring(7), sender: 'ai', text: "Neural link reset. Systems standing by for instruction." }
    ]);
  };

  // Handle voice transcript completion
  useEffect(() => {
    if (finalTranscript && finalTranscript.length > 5) {
        const handled = executeVoicePhrase(finalTranscript);
        if (handled) {
            clearTranscripts();
            setIsOpen(false);
            stopListening();
        } else {
            handleSend(undefined, finalTranscript);
        }
    }
  }, [finalTranscript, executeVoicePhrase]);

  // Handle voice triggers from mobile navigation dock
  useEffect(() => {
    const handleVoiceTrigger = () => {
      setIsOpen(true);
      setTimeout(() => {
        startListening();
      }, 150);
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          stopListening();
        } else {
          handleVoiceTrigger();
        }
      }
    };
    
    window.addEventListener('open-voice-consultation', handleVoiceTrigger);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-voice-consultation', handleVoiceTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [startListening, isOpen, stopListening]);

  // Don't show on the actual AI Consultant page to avoid confusion
  if (location.pathname === '/ai-consultant') return null;

   const handleSend = async (e?: React.FormEvent, textOverride?: string, isSimplification: boolean = false) => {
    if (e) e.preventDefault();
    const finalMsg = textOverride || inputValue;
    if (!finalMsg.trim()) return;

    if (voiceState === 'listening') {
      stopListening();
    }
    
    // Clear transcripts immediately to prevent repeat firing
    if (textOverride && !isSimplification) {
      clearTranscripts();
    }

    if (!isSimplification) {
      const userMsg: Message = { id: 'usr-' + Math.random().toString(36).substring(7), sender: 'user', text: finalMsg };
      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
    }
    
    setIsTyping(true);
    trackClick(isSimplification ? "Floating AI Simplify Response" : "Floating AI Message Sent");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: isSimplification ? `Please simplify this clinical response: "${finalMsg}"` : finalMsg,
                context: isSimplification 
                    ? "Explain this clinical content in simple, non-medical language for a patient. Keep it reassuring." 
                    : `User is currently on module: ${pageContext.moduleTitle} (Route: ${pageContext.route}). Description: ${pageContext.moduleDescription}. Provide a helpful, professional clinic-related response. Contextual actions available: ${pageContext.availableActions.join(', ')}.`,
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
        
        setIsTyping(false);
        setMessages(prev => [...prev, { id: 'ai-' + Math.random().toString(36).substring(7), sender: 'ai', text: response }]);
        
        if (settings.aiAutoSpeak) {
             speak(response);
        }

    } catch (error: any) {
        clearTimeout(timeoutId);
        setIsTyping(false);
        const errorMsg = error.name === 'AbortError' ? "Neural link timeout. Please try again." : `Link failure: ${error.message || 'Unknown error'}`;
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: `I'm having trouble connecting to my neural network right now. ${errorMsg}` }]);
    }
  };

  return (
    <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-[calc(var(--z-overlay)-10)] flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
            className="w-[90vw] sm:w-[450px] h-[700px] max-h-[85vh] bg-slate-950/80 backdrop-blur-3xl crystal-glass rounded-[3rem] shadow-glow-teal border border-white/10 overflow-hidden flex flex-col pointer-events-auto holographic-border"
          >
            <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none z-0"></div>
            {/* Header */}
            <div className="p-8 bg-black/40 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10">
               <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>
               <div className="flex items-center gap-5">
                  <div className="relative group/bot">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20 group-hover/bot:scale-110 transition-transform duration-500">
                        <Bot size={28} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-950"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold tracking-tight text-white uppercase tracking-[0.05em]">Neural Matrix</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5 items-end h-3">
                            {[0.4, 0.7, 0.5, 0.9, 0.3].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    animate={{ height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] }}
                                    transition={{ repeat: Infinity, duration: 1 + i*0.2 }}
                                    className="w-0.5 bg-teal-500/60 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                                />
                            ))}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400">Context: {pageContext.moduleTitle.toUpperCase()}</span>
                    </div>
                  </div>
               </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={clearHistory}
                    title="Clear Neural Data"
                    className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"
                  >
                    <Activity size={18} />
                  </button>
                  <button 
                   onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
                 >
                   <X size={20} />
                 </button>
               </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar bg-slate-950/20 relative z-10">
               <div className="flex flex-col items-center justify-center py-6 space-y-4 opacity-40">
                  <Logo size={60} variant="dark" />
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Encrypted Communication Stream</p>
               </div>
               {messages.map(msg => (
                 <motion.div 
                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20, y: 10 }}
                   animate={{ opacity: 1, x: 0, y: 0 }}
                   key={msg.id}
                   className={cn(
                     "flex flex-col gap-2 relative",
                     msg.sender === 'user' ? "items-end ml-12" : "items-start mr-12"
                   )}
                 >
                    <div className={cn(
                      "px-6 py-4 text-[15px] leading-relaxed shadow-2xl relative group/msg overflow-hidden",
                      msg.sender === 'user' 
                        ? "bg-teal-600 text-slate-950 rounded-[2rem] rounded-tr-sm font-medium shadow-teal-500/10" 
                        : "bg-white/5 text-slate-200 border border-white/10 rounded-[2rem] rounded-tl-sm backdrop-blur-md"
                    )}>
                      {msg.sender === 'ai' && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/20"></div>
                      )}
                      {msg.text}
                      {msg.sender === 'ai' && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                             <button 
                               onClick={() => handleSend(undefined, msg.text, true)}
                               disabled={isTyping}
                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-[9px] font-black uppercase tracking-widest text-teal-400 transition-all disabled:opacity-50"
                             >
                               <Stethoscope size={12} /> Simplify
                             </button>
                             <button 
                               onClick={() => speak(msg.text)}
                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all"
                             >
                               <Volume2 size={12} /> Replay
                             </button>
                          </div>
                      )}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                        {msg.sender === 'ai' ? 'Core Intelligence' : 'Authorized User'} • 12:45
                    </span>
                 </motion.div>
               ))}
               
               {isTyping && (
                 <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-full w-24 shadow-sm animate-pulse ml-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-500/60"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-500/30"></div>
                 </div>
               )}

               {voiceState === 'listening' && transcript && (
                 <div className="flex flex-col items-end">
                    <div className="px-6 py-4 bg-teal-500/10 border border-teal-500/20 text-teal-300 rounded-[2rem] text-sm italic shadow-glow-teal">
                        "{transcript}..."
                    </div>
                 </div>
               )}

               {voiceError && (
                 <div className="flex flex-col gap-3 p-4 bg-red-500/10 text-red-400 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} />
                      {voiceError.split(':')[0]}
                    </div>
                    {voiceError.includes('PERMISSION_DENIED') && (
                        <button 
                          onClick={requestPermission}
                          className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-[9px] border border-red-500/30 transition-all font-black"
                        >
                          Retry Permission
                        </button>
                    )}
                 </div>
               )}
            </div>

            {/* Footer / Input */}
            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl relative z-10">
               <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
               <div className="mb-6">
                  <button 
                    onClick={() => {
                        setIsOpen(false);
                        navigate('/ai-consultant');
                    }}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-teal-500 hover:text-slate-950 transition-all group overflow-hidden relative shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                    Neural Consultation Hub
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
               <div className="flex gap-3">
                  <button
                    onClick={() => voiceState === 'listening' ? stopListening() : startListening()}
                    className={cn(
                      "shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative overflow-hidden group/mic",
                      voiceState === 'listening' 
                        ? "bg-red-500 text-white shadow-glow-red" 
                        : "bg-white/5 border border-white/10 text-teal-400 hover:bg-teal-500 hover:text-slate-950"
                    )}
                  >
                    <div className="absolute inset-0 bg-teal-400/20 opacity-0 group-hover/mic:opacity-100 blur-xl transition-opacity"></div>
                    {voiceState === 'listening' ? <StopCircle size={28} /> : <Mic size={28} className="relative z-10" />}
                  </button>
                  <form onSubmit={handleSend} className="flex-1 relative">
                      <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Neural Link Input..."
                        className="w-full h-16 bg-white/5 border border-white/10 p-5 pr-16 rounded-2xl text-[15px] text-white placeholder:text-slate-600 focus:border-teal-500 outline-none transition-all focus:ring-4 focus:ring-teal-500/10"
                      />
                      <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="absolute right-3 top-3 bottom-3 w-10 h-10 rounded-xl bg-teal-600 text-slate-950 flex items-center justify-center hover:bg-teal-400 transition-all disabled:opacity-10 disabled:grayscale shadow-lg shadow-teal-500/20"
                      >
                        <Send size={20} />
                      </button>
                  </form>
               </div>
               <div className="mt-6 flex items-center justify-center gap-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]"></div>
                    <span>Secure Link</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                  <span>Quantum Level Encryption</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
            setIsOpen(!isOpen);
            trackClick("Toggle Floating AI Assistant");
        }}
        className={cn(
          "hidden lg:flex w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] items-center justify-center shadow-premium-lg border-2 transition-all pointer-events-auto group relative",
          isOpen 
            ? "bg-slate-950 border-slate-800 text-white" 
            : "bg-teal-600 border-teal-500 text-slate-950"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
               <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="relative">
               <Bot size={32} className="group-hover:rotate-12 transition-transform duration-500" />
               <div className="absolute -top-1 -right-1">
                  <Sparkles size={16} className="text-white animate-pulse" />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Glow effect */}
        {!isOpen && (
            <div className="absolute inset-0 rounded-[2rem] bg-teal-400/20 blur-xl scale-125 -z-10 animate-pulse"></div>
        )}
      </motion.button>
    </div>
  );
}
