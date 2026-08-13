import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/images';
import Logo from './Logo';

const QUOTES = [
  "Healing is a matter of time, but it is sometimes also a matter of opportunity.",
  "The body heals with play, the mind heals with laughter and the spirit heals with joy.",
  "Movement is a medicine for creating change in a person's physical, emotional, and mental states.",
  "Osteopathy is the law of mind, matter, and motion."
];

interface IntroPageProps {
  onComplete: () => void;
}

const IntroPage = ({ onComplete }: IntroPageProps) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000); // 6 second window
    return () => clearInterval(interval);
  }, []);

  // Use a subset of gallery images for the cascading background
  const cascadingImages = GALLERY_IMAGES.slice(0, 12);

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-slate-950"
      style={{ zIndex: 'var(--z-intro)' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none" />

      {/* Background Cascading Images */}
      <div className="absolute inset-x-0 w-full h-[200%] -top-[50%] flex justify-center gap-4 sm:gap-8 opacity-[0.15] blur-[2px] pointer-events-none select-none overflow-hidden transform rotate-[-4deg] scale-110">
        {[0, 1, 2, 3, 4].map((colIndex) => (
          <motion.div
            key={colIndex}
            className="w-1/5 max-w-[280px] flex flex-col gap-4 sm:gap-8"
            animate={{ y: colIndex % 2 === 0 ? [0, -1500] : [-1500, 0] }}
            transition={{
              repeat: Infinity,
              duration: 40 + (colIndex * 5),
              ease: "linear",
            }}
          >
            {/* Array doubled for seamless looping */}
            {[...cascadingImages, ...cascadingImages, ...cascadingImages].map((img, index) => (
              <div key={`${colIndex}-${index}`} className="w-full aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/5 crystal-glass">
                <img src={img} className="w-full h-full object-cover opacity-80" alt="" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 to-transparent" />
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--color-brand-slate)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/50 backdrop-blur-[4px]" />

      {/* Ultra subtle background logo watermark */}
      <Logo size={800} variant="dark" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-150 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center text-center">
        {/* Boot Sequence Overlay */}
        <div className="absolute -top-40 -left-64 hidden xl:block text-left font-mono text-[10px] space-y-1 text-teal-500/40 select-none">
           <div>{">"} INITIALIZING NEURAL UPLINK...</div>
           <div>{">"} OS_VERSION: CT6_GEN_NEXT (4K_OPT)</div>
           <div>{">"} SYSTEM_ENTROPY: NOMINAL</div>
           <div>{">"} BIOMETRIC_SYNC: AUTO_TUNING</div>
           <div>{">"} VISION_SYSTEM: ACTIVE</div>
           <div>{">"} CORE_TEMP: 32.4K</div>
           <div>{">"} MODULE_X: LOADED</div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 1 }}
           className="mb-16 flex flex-col items-center"
        >
          <div className="relative mb-8 group">
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-teal-500/20 blur-3xl rounded-full opacity-50"></div>
             <Logo size={88} variant="gradient" className="relative z-10 shadow-glow-teal cinematic-glow" />
          </div>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-md mb-8 shadow-2xl cinematic-glow">
            <Sparkles size={14} className="animate-pulse" /> Clinical Matrix Online
          </span>
          <h1 className="text-5xl md:text-8xl font-display font-medium text-white tracking-tighter leading-[0.9]">
            The evolution of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-500 animate-gradient-x">osteopathy.</span>
          </h1>
        </motion.div>

        <div className="h-32 sm:h-24 flex items-center justify-center w-full mb-16">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
              transition={{ duration: 0.8 }}
              className="text-xl md:text-3xl text-slate-300 font-light italic leading-relaxed max-w-3xl"
            >
              "{QUOTES[quoteIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          onClick={onComplete}
          className="group relative px-10 py-5 bg-teal-600 hover:bg-teal-500 text-slate-950 rounded-2xl font-black text-lg uppercase tracking-widest overflow-hidden transition-all shadow-glow-teal active:scale-[0.98] flex items-center gap-4 focus-visible:outline-teal-400 outline-offset-4 cinematic-glow"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          <span className="relative z-10">Enter to begin</span>
          <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
        </motion.button>
      </div>

      {/* Decorative Particles / Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    </motion.div>
  );
};

export default IntroPage;
