import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { motion, useReducedMotion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark' | 'gradient';
  /** Render the still frame instead of the film. */
  still?: boolean;
}

/**
 * The CT6 emblem, played as the studio logo animation.
 *
 * The clip is silent, loops seamlessly (forward then reversed) and pauses
 * whenever it scrolls out of view, so the copy in the footer costs nothing
 * while the visitor is at the top of the page.
 */
export const Logo: React.FC<LogoProps> = ({
  className,
  size = 40,
  variant = 'gradient',
  still = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [inView, setInView] = useState(true);

  const showStill = still || prefersReducedMotion;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || showStill) return;
    if (inView) {
      video.play().catch(() => { /* poster stands in */ });
    } else {
      video.pause();
    }
  }, [inView, showStill]);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative flex items-center justify-center cursor-pointer group", className)}
      style={{ width: size, height: size, perspective: '1000px' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full h-full flex items-center justify-center relative"
      >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl scale-150 animate-pulse" />

          <div className={cn(
            "w-full h-full rounded-[28%] overflow-hidden flex items-center justify-center shadow-xl border-2 transition-all duration-500",
            variant === 'light' ? "bg-white border-white/20" :
            variant === 'dark' ? "bg-slate-900 border-slate-800" :
            "bg-slate-950 border-teal-500/30 shadow-teal-500/10"
          )}>
            {showStill ? (
              <img
                src="/video/logo-mark.jpg"
                alt=""
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/video/logo-mark.jpg"
                aria-hidden="true"
                className="w-full h-full object-cover"
              >
                {/* MP4 first: the host serves .webm as text/plain, which makes
                    the browser discard that source. MP4 plays everywhere. */}
                <source src="/video/logo-mark.mp4" type="video/mp4" />
                <source src="/video/logo-mark.webm" type="video/webm" />
              </video>
            )}
          </div>
      </motion.div>

      {/* Interaction Ripple */}
      <div className="absolute inset-0 rounded-full border border-teal-500/0 group-hover:border-teal-500/20 group-hover:scale-125 transition-all duration-700 pointer-events-none" />
    </div>
  );
};

export default Logo;
