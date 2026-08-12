import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, Loader2, Brain } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'system';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{
  showToast: (message: string, type: ToastType) => void;
  clearAll: () => void;
} | null>(null);

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => {
      // Keep only up to 10 entries in state, but UI will show max 3
      const duplicateCount = prev.filter(t => t.message === message).length;
      if (duplicateCount > 0 && type !== 'loading') {
         // Avoid spamming exact same message if not loading
         return prev;
      }
      return [...prev, { id, message, type }].slice(-10);
    });
    
    // Auto-remove after 6s unless it's an error (errors wait longer)
    const timeout = type === 'error' ? 10000 : 6000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Limit to 3 most recent for UI display 
  const visibleToasts = toasts.slice(-3);

  return (
    <ToastContext.Provider value={{ showToast, clearAll }}>
      {children}
      <div className="fixed top-8 right-4 sm:right-12 flex flex-col items-end gap-4 pointer-events-none" style={{ zIndex: 'var(--z-toast, 9999)' }}>
        <AnimatePresence mode="popLayout">
          {toasts.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="pointer-events-auto flex items-center gap-3 mb-2"
            >
              {toasts.length > 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-4 py-2 bg-slate-900/40 border border-slate-700/30 rounded-full flex items-center gap-3 backdrop-blur-2xl shadow-xl"
                >
                   <div className="flex -space-x-2">
                      {[...Array(Math.min(toasts.length - 3, 3))].map((_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-teal-500 border border-slate-950 ring-2 ring-teal-500/20" />
                      ))}
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.15em] text-teal-400">
                     {toasts.length - 3} {toasts.length - 3 === 1 ? 'Message' : 'Messages'} Pending
                   </span>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,1)', color: '#000' }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAll}
                className="px-6 py-2.5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-full shadow-premium border border-white/10 transition-all flex items-center gap-2 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <X size={14} className="group-hover:rotate-90 transition-transform relative z-10" />
                <span className="relative z-10">Dismiss All</span>
              </motion.button>
            </motion.div>
          )}
          
          {visibleToasts.map((toast, index) => {
            const isLatest = index === visibleToasts.length - 1;
            return (
            <motion.div
              layout
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.85, filter: 'blur(12px)' }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1, 
                filter: 'blur(0px)',
                zIndex: index + 10,
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                x: 100, 
                scale: 0.8, 
                filter: 'blur(8px)',
                transition: { duration: 0.25 } 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 30,
                mass: 0.8,
                layout: { duration: 0.3 }
              }}
              className={cn(
                "group relative p-6 rounded-[2.75rem] shadow-premium-lg flex items-start gap-5 text-sm font-medium w-full sm:w-[440px] pointer-events-auto border-2 backdrop-blur-3xl overflow-hidden transition-all hover:translate-x-[-4px]",
                toast.type === 'success' ? "bg-emerald-50/95 border-emerald-200/40 text-emerald-950 shadow-emerald-500/5" :
                toast.type === 'error' ? "bg-red-50/95 border-red-200/40 text-red-950 shadow-red-500/5" : 
                toast.type === 'warning' ? "bg-amber-50/95 border-amber-200/40 text-amber-950 shadow-amber-500/5" :
                toast.type === 'loading' ? "bg-slate-950/95 border-slate-800 text-white shadow-teal-500/10" :
                toast.type === 'system' ? "bg-indigo-950/95 border-indigo-800 text-indigo-50 shadow-indigo-500/10" :
                "bg-white/95 border-slate-200/50 text-slate-900 shadow-slate-500/5"
              )}
            >
              <div className={cn(
                "shrink-0 w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-premium-sm ring-4 ring-white/60 transition-transform group-hover:scale-110",
                toast.type === 'success' ? "bg-emerald-500 text-white" :
                toast.type === 'error' ? "bg-red-500 text-white" :
                toast.type === 'warning' ? "bg-amber-500 text-white" :
                toast.type === 'loading' ? "bg-slate-800 text-teal-400" :
                toast.type === 'system' ? "bg-indigo-600 text-white" :
                "bg-slate-950 text-white"
              )}>
                {toast.type === 'success' && <CheckCircle size={26} strokeWidth={2.5} />}
                {toast.type === 'error' && <AlertCircle size={26} strokeWidth={2.5} />}
                {toast.type === 'warning' && <AlertCircle size={26} strokeWidth={2.5} />}
                {toast.type === 'loading' && <Loader2 size={26} strokeWidth={2.5} className="animate-spin" />}
                {toast.type === 'system' && <Brain size={26} strokeWidth={2.5} />}
                {toast.type === 'info' && <Info size={26} strokeWidth={2.5} />}
              </div>

              <div className="flex-1 pt-2 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full",
                    toast.type === 'loading' ? "bg-teal-500/20 text-teal-400" : 
                    toast.type === 'system' ? "bg-indigo-500/20 text-indigo-400" :
                    "opacity-40"
                  )}>
                    {toast.type}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-current opacity-20" />
                  <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest leading-none">Active</span>
                </div>
                <div className="text-xl font-display font-bold tracking-tight leading-tight truncate-multiline">
                  {toast.message}
                </div>
              </div>

              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="shrink-0 p-2.5 rounded-2xl hover:bg-black/5 transition-all text-slate-400 hover:text-slate-950 active:scale-90 hover:rotate-90"
              >
                <X size={20} strokeWidth={3} />
              </button>

              {/* Enhanced Progress bar */}
              <div className="absolute bottom-0 left-0 h-2 bg-black/5 w-full">
                <motion.div 
                   initial={{ width: '100%' }}
                   animate={{ width: '0%' }}
                   transition={{ duration: toast.type === 'error' ? 10 : 6, ease: "linear" }}
                   className={cn(
                      "h-full rounded-r-full shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                      toast.type === 'success' ? "bg-emerald-500" :
                      toast.type === 'error' ? "bg-red-500" :
                      toast.type === 'warning' ? "bg-amber-500" :
                      toast.type === 'loading' ? "bg-teal-400" : 
                      toast.type === 'system' ? "bg-indigo-400" : "bg-slate-900"
                   )}
                />
              </div>
            </motion.div>
          )})}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
