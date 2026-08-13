import { useState, useEffect, useRef } from 'react';
import { GALLERY_IMAGES } from '../data/images';
import { motion } from 'motion/react';
import { CLINIC } from '../data/clinic';

export default function Screensaver({ onDismiss }: { onDismiss: () => void }) {
  const idleTimer = useRef<number | undefined>(undefined);
  const [isIdle, setIsIdle] = useState(false);

  const resetTimer = () => {
    setIsIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIsIdle(true), 300000); // 5 minutes
  };

  const handleDismiss = () => {
    setIsIdle(false);
    resetTimer();
    if (onDismiss) onDismiss();
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(idleTimer.current);
    };
  }, []);

  if (!isIdle) return null;

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden" style={{ zIndex: 'var(--z-screensaver)' }} onClick={handleDismiss}>
      {/* Cascading Images */}
      {GALLERY_IMAGES.slice(0, 30).map((src, i) => {
        // Create randomized properties for variety
        const size = 100 + Math.random() * 150; // Size between 100px and 250px
        const speed = 10 + Math.random() * 15; // Duration between 10s and 25s for parallax
        const xPos = Math.random() * 95; // Random horizontal position
        const delay = Math.random() * 20; // Random delay

        return (
          <motion.img
            key={i}
            src={src}
            className="absolute object-cover rounded-xl shadow-xl shadow-black/50"
            style={{ width: size, height: size }}
            initial={{ top: -300, left: `${xPos}%` }}
            animate={{ top: "110vh" }}
            transition={{
              duration: speed,
              repeat: Infinity,
              delay: delay,
              ease: "linear"
            }}
          />
        );
      })}

      {/* Centered Button */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <button 
          className="px-12 py-6 bg-white text-slate-900 rounded-3xl text-3xl font-display font-bold shadow-2xl hover:scale-105 transition-transform"
          onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        >
          {CLINIC.name}
        </button>
      </div>
    </div>
  );
}
