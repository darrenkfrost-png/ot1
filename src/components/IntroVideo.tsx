import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';

interface IntroVideoProps {
  onComplete: () => void;
}

/**
 * The brand film that opens the application.
 * Starts muted because browsers refuse to autoplay audio, with a control to
 * turn sound on. Always skippable — by button, Escape, or Enter.
 */
const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onComplete();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Browsers reject play() for reasons that are often temporary — a backgrounded
  // tab, power saving, a pending autoplay decision. Retry rather than treating it
  // as failure, or visitors get the film skipped out from under them.
  useEffect(() => {
    const attemptPlay = () => {
      const video = videoRef.current;
      if (!video || finished.current || document.hidden) return;
      video.play().catch(() => { /* the poster holds; Skip is always available */ });
    };
    attemptPlay();
    document.addEventListener('visibilitychange', attemptPlay);
    window.addEventListener('pointerdown', attemptPlay);
    return () => {
      document.removeEventListener('visibilitychange', attemptPlay);
      window.removeEventListener('pointerdown', attemptPlay);
    };
  }, []);

  // A stalled video must never trap anyone at the door. The allowance counts only
  // time the tab is actually on screen, so a film paused in a background tab is
  // still waiting when the visitor returns.
  useEffect(() => {
    let visibleMs = 0;
    const tick = setInterval(() => {
      if (document.hidden) return;
      visibleMs += 500;
      if (visibleMs >= 20000) finish();
    }, 500);
    return () => clearInterval(tick);
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) video.play().catch(() => { /* keep playing muted */ });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-slate-950 flex items-center justify-center"
      style={{ zIndex: 'var(--z-screensaver)' }}
      role="dialog"
      aria-label="Introduction film"
    >
      <video
        ref={videoRef}
        src="/video/intro.mp4"
        poster="/video/intro.jpg"
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress((v.currentTime / v.duration) * 100);
        }}
        className="w-full h-full object-cover"
      />

      {/* Edge vignette so the controls stay readable over bright frames */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
        <div
          className="h-full bg-teal-400 transition-[width] duration-200 ease-linear shadow-[0_0_12px_rgba(45,212,191,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="absolute bottom-8 right-6 sm:right-10 flex items-center gap-3">
        <button
          onClick={toggleSound}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 focus-visible:outline-teal-400"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <button
          onClick={finish}
          className="group flex items-center gap-3 px-6 h-12 rounded-2xl bg-white/10 hover:bg-teal-700 backdrop-blur-xl border border-white/20 hover:border-teal-500 text-white text-[11px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 focus-visible:outline-teal-400"
        >
          Skip intro
          <SkipForward size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default IntroVideo;
