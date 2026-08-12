import React, { useEffect, useState, useRef } from 'react';
import { useCommand } from '../context/CommandContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from './ToastSystem';
import { Mic, MicOff, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function VoiceController() {
    const { settings } = useSettings();
    const { executeVoicePhrase } = useCommand();
    const { showToast } = useToast();
    
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    const lastProcessedRef = useRef<string>('');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition API not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-GB';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const finalTranscript = event.results[i][0].transcript.trim();
                    if (finalTranscript !== lastProcessedRef.current) {
                        lastProcessedRef.current = finalTranscript;
                        const handled = executeVoicePhrase(finalTranscript);
                        if (!handled) {
                            showToast(`Voice: "${finalTranscript}" (Unrecognized Command)`, 'info');
                        }
                    }
                } else {
                    currentTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error !== 'no-speech') {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            if (settings.enableVoiceWake) {
                // Keep listening if Voice Wake is enabled globally
                try {
                   recognition.start();
                } catch(e) {}
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [settings.enableVoiceWake, executeVoicePhrase, showToast]);

    useEffect(() => {
        if (settings.enableVoiceWake && recognitionRef.current && !isListening) {
             try {
                recognitionRef.current.start();
             } catch(e) {}
        } else if (!settings.enableVoiceWake && recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [settings.enableVoiceWake, isListening]);

    const toggleManualListen = () => {
        if (!recognitionRef.current) {
            showToast('Voice Recognition not supported on this device/browser.', 'error');
            return;
        }
        
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch(e) {
                showToast('Could not start voice recognition.', 'error');
            }
        }
    };

    // If disabled and not actively manually listening, don't show the persistent UI unless requested
    // But since it's an elite app, we should provide a subtle mic trigger or integration into FloatingAI
    // For now we will provide a small floating subtle dock bottom left.

    return (
        <div className="fixed bottom-6 left-6 z-[var(--z-toast)] hidden lg:flex flex-col gap-2 items-start pointer-events-none">
            <AnimatePresence>
                {transcript && isListening && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="bg-slate-900/90 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-xl max-w-[200px]"
                    >
                        <p className="text-xs font-mono text-teal-400 truncate">{transcript}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <button 
                onClick={toggleManualListen}
                className={cn(
                    "pointer-events-auto p-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-xl flex items-center justify-center",
                    isListening 
                      ? "bg-teal-500/20 border-teal-500/50 text-teal-400 shadow-glow-teal" 
                      : "bg-white/10 border-white/20 text-slate-400 hover:text-slate-200 hover:bg-white/20"
                )}
            >
                {isListening ? (
                    <div className="relative">
                        <Waves size={20} className="animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-400 rounded-full animate-ping"></span>
                    </div>
                ) : (
                    <Mic size={20} />
                )}
            </button>
        </div>
    );
}
