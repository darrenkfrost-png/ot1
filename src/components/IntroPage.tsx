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
  // Only the first screenful needs to be present immediately; the rest of the
  // cascade scrolls into place over the following seconds.
  const EAGER_TILES = 4;

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
      {/*
        This cascade is the clinic's own artwork, so it should read as artwork.
        It was previously set at 15% opacity behind a 2px blur and a further 4px
        backdrop blur, in narrow 3:4 tiles that cropped the portrait guides -
        legible as texture, but not as anything branded.
      */}
      <div className="absolute inset-x-0 w-full h-[200%] -top-[50%] flex justify-center gap-4 sm:gap-8 opacity-[0.5] pointer-events-none select-none overflow-hidden transform rotate-[-4deg] scale-110">
        {[0, 1, 2, 3].map((colIndex) => (
          <motion.div
            key={colIndex}
            className="w-1/4 max-w-[340px] flex flex-col gap-4 sm:gap-8"
            animate={{ y: colIndex % 2 === 0 ? [0, -1500] : [-1500, 0] }}
            transition={{
              repeat: Infinity,
              duration: 40 + (colIndex * 5),
              ease: "linear",
            }}
          >
            {/* Array doubled for seamless looping */}
            {[...cascadingImages, ...cascadingImages, ...cascadingImages].map((img, index) => (
              /* shrink-0 is load-bearing: these are flex children in a fixed
                 height column, so without it every tile is squashed down to a
                 short bar and the artwork is unrecognisable. */
              <div key={`${colIndex}-${index}`} className="w-full shrink-0 aspect-[788/1400] rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/5 crystal-glass">
                <img
                  src={img}
                  className="w-full h-full object-cover opacity-90"
                  alt=""
                  /* The opening tiles must be on screen the moment the door
                     appears; lazy-loading them left the cascade empty, because
                     this column is twice the height of the viewport. */
                  loading={index < EAGER_TILES ? 'eager' : 'lazy'}
                  fetchPriority={index < EAGER_TILES ? 'high' : 'low'}
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/60 to-transparent" />
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* A pool of shadow behind the headline, so the artwork can stay bright at
          the edges without the type fighting it. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_center,_rgba(2,6,23,0.92)_0%,_rgba(2,6,23,0.55)_55%,_transparent_100%)] pointer-events-none" />
      {/* Darkened top and bottom keep the headline readable without washing the
          artwork out across the whole screen. */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/70 backdrop-blur-[1px]" />

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
          <h1 className="text-4xl md:text-7xl font-display font-medium text-white tracking-tighter leading-[0.95]">
            Look after the body
            <br />
            <span className="text-teal-300">you live in.</span>
          </h1>
        </motion.div>

        {/*
          Three tiers: what care here actually consists of, in the order a
          patient moves through it. Each states something the clinic can stand
          behind — no figures, no outcome promises.
        */}
        <motion.ol
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.18, delayChildren: 1 } },
          }}
          className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-14 text-left"
        >
          {[
            {
              step: '01',
              title: 'Understand it',
              body: 'A proper assessment, and a plain explanation of what is actually going on.',
            },
            {
              step: '02',
              title: 'Ease it',
              body: 'Hands-on treatment matched to the problem, at a pace your body accepts.',
            },
            {
              step: '03',
              title: 'Keep it away',
              body: 'The movement, habits and strength that stop it returning once you feel well.',
            },
          ].map((tier) => (
            <motion.li
              key={tier.step}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="relative rounded-[1.75rem] border border-white/10 bg-slate-950/55 backdrop-blur-md p-6 shadow-2xl"
            >
              <span className="block text-[10px] font-black tracking-[0.35em] text-teal-400 mb-3">
                {tier.step}
              </span>
              <h2 className="text-xl md:text-2xl font-display font-medium text-white mb-2 tracking-tight">
                {tier.title}
              </h2>
              <p className="text-sm text-slate-300/85 font-light leading-relaxed">{tier.body}</p>
            </motion.li>
          ))}
        </motion.ol>

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
