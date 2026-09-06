import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Images, Grid3x3, Film, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/images';
import { VIDEOS } from '../data/resources';
import { CLINIC } from '../data/clinic';
import { Logo } from './Logo';
import { PolymetricField, POLYMETRIC_LAYOUTS, type PolymetricLayout } from './PolymetricField';
import { cn } from '../lib/utils';

/**
 * THE IDLE SCREEN.
 *
 * After a quiet minute the clinic's screen becomes something worth looking
 * at: the patient guides drifting down, a drawn field of chiropractic geometry
 * behind them, or one of the clinic's own films — with the emblem holding the
 * centre.
 *
 * THE EMBLEM IS THE DOOR, AND THE ONLY ONE.
 * The old version dismissed on the first mousemove, which meant a waiting-room
 * screen was destroyed by anyone walking past the desk, and a patient who
 * nudged the mouse never really saw it. Nothing passive dismisses this now:
 * the emblem in the middle must be pressed. Escape also works, because a
 * keyboard user needs a way out that does not involve hunting for a target —
 * and pressing Escape is a deliberate act, not an accident.
 *
 * WHY MOVEMENT STILL MATTERS WHILE THE SCREEN IS AWAKE.
 * The idle countdown is fed by movement, keys, touch, scroll and wheel. Scroll
 * was missing before, so reading a long page while sitting still could raise
 * the screensaver over the very words being read. Once the screen IS showing,
 * those listeners stand down — they would only be re-arming a timer for a
 * screen that is already up.
 */

const IDLE_MS = 60000; // one minute
const IMAGE_COUNT = 26;
const LAYOUT_ROTATE_MS = 45000;

type Mode = 'images' | 'polymetric' | 'film';

const MODES: { id: Mode; label: string; Icon: typeof Images }[] = [
  { id: 'images', label: 'Guides', Icon: Images },
  { id: 'polymetric', label: 'Geometry', Icon: Grid3x3 },
  { id: 'film', label: 'Films', Icon: Film },
];

export default function Screensaver({ onDismiss }: { onDismiss: () => void }) {
  const idleTimer = useRef<number | undefined>(undefined);
  const [isIdle, setIsIdle] = useState(false);
  const [mode, setMode] = useState<Mode>('images');
  const [layout, setLayout] = useState<PolymetricLayout>('column');
  const [videoIndex, setVideoIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const still = !!prefersReducedMotion;

  /*
   * The countdown is re-armed only while the screen is awake. `isIdle` is read
   * through a ref so the listeners can be bound once and still see the truth —
   * re-binding six window listeners on every state change is how a screensaver
   * ends up fighting the page it is sitting on.
   */
  const idleRef = useRef(false);
  idleRef.current = isIdle;

  const resetTimer = useCallback(() => {
    if (idleRef.current) return;
    clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIsIdle(true), IDLE_MS);
  }, []);

  const wake = useCallback(() => {
    setIsIdle(false);
    setMuted(true); // never leave sound playing behind the app
    clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIsIdle(true), IDLE_MS);
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = [
      'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel',
    ];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(idleTimer.current);
    };
  }, [resetTimer]);

  // Escape is the keyboard's door, bound only while the screen is up.
  useEffect(() => {
    if (!isIdle) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') wake();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isIdle, wake]);

  // The geometry changes its mind now and then, so a long sit is not one picture.
  useEffect(() => {
    if (!isIdle || mode !== 'polymetric' || still) return;
    const t = window.setInterval(() => {
      setLayout((cur) => {
        const i = POLYMETRIC_LAYOUTS.findIndex((l) => l.id === cur);
        return POLYMETRIC_LAYOUTS[(i + 1) % POLYMETRIC_LAYOUTS.length].id;
      });
    }, LAYOUT_ROTATE_MS);
    return () => clearInterval(t);
  }, [isIdle, mode, still]);

  if (!isIdle) return null;

  const film = VIDEOS[videoIndex % VIDEOS.length];

  /*
   * Muted autoplay is the only kind a browser will start by itself. Sound
   * arrives when the viewer asks for it — and pressing that button is itself
   * the gesture the browser requires, so it works on the first press.
   */
  const filmSrc =
    `https://www.youtube-nocookie.com/embed/${film.youtubeId}` +
    `?autoplay=1&mute=${muted ? 1 : 0}&controls=0&loop=1&playlist=${film.youtubeId}` +
    `&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3`;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="screensaver-field fixed inset-0 bg-slate-950 overflow-hidden"
      style={{ zIndex: 'var(--z-screensaver)' }}
      role="dialog"
      aria-modal="true"
      aria-label={`${CLINIC.name} idle screen. Select the emblem to return to the site.`}
    >
      {/* --------------------------------------------- the falling guides */}
      {mode === 'images' &&
        GALLERY_IMAGES.slice(0, IMAGE_COUNT).map((src, i) => {
          /*
           * Deterministic from the index rather than Math.random: a random
           * layout is a different picture on every re-render, so pressing a
           * control made the whole cascade jump.
           */
          const size = 110 + ((i * 47) % 140);
          const speed = 16 + ((i * 13) % 16);
          const xPos = (i * 37) % 94;
          const delay = (i * 1.7) % 20;
          return (
            <motion.img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute object-cover rounded-2xl shadow-2xl shadow-black/60 opacity-70"
              style={{ width: size, height: size }}
              initial={{ top: -320, left: `${xPos}%` }}
              animate={still ? { top: `${(i * 7) % 80}vh` } : { top: '112vh' }}
              transition={
                still
                  ? { duration: 0 }
                  : { duration: speed, repeat: Infinity, delay, ease: 'linear' }
              }
            />
          );
        })}

      {/* ------------------------------------------------ the drawn geometry */}
      {mode === 'polymetric' && (
        <>
          <PolymetricField layout={layout} still={still} className="opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />
        </>
      )}

      {/* ------------------------------------------------------- the films */}
      {mode === 'film' && (
        <>
          <iframe
            key={`${film.youtubeId}-${muted}`}
            src={filmSrc}
            title={film.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] h-[56.25vw] min-w-full min-h-full border-0 pointer-events-none"
          />
          {/* Held back so the emblem stays the brightest thing on the screen. */}
          <div className="absolute inset-0 bg-slate-950/45" />
        </>
      )}

      {/* ------------------------------------------------------- the emblem */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        {/*
          * THE HIT AREA NEVER MOVES. Only the emblem inside it drifts. Floating
          * the button itself made the one way out of this screen a moving
          * target — hard for anyone with a tremor, and provably unclickable:
          * the automated pass could not land on it either, failing for exactly
          * the reason a person would. The look is unchanged; the target is now
          * a fixed rectangle.
          */}
        <button
          type="button"
          onClick={wake}
          className="pointer-events-auto group flex flex-col items-center gap-6 rounded-[3rem] px-10 sm:px-14 py-10 sm:py-12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
          aria-label={`Return to ${CLINIC.name}`}
        >
          <motion.span
            animate={still ? undefined : { y: [0, -14, 0] }}
            transition={still ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center justify-center rounded-[2.5rem] p-5 sm:p-6 bg-white/5 backdrop-blur-md border border-white/15 transition-transform group-hover:scale-105"
            style={{
              boxShadow:
                '0 0 90px -20px rgba(45,212,191,0.55), 0 0 40px -12px rgba(255,255,255,0.18)',
            }}
          >
            <Logo size={112} variant="gradient" still={still} />
          </motion.span>
          <span className="text-white/90 font-display font-medium text-xl sm:text-2xl tracking-tight drop-shadow text-center">
            {CLINIC.name}
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] font-black text-teal-300/80 text-center">
            Touch the emblem to continue
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------ the controls */}
      <div
        onClick={stop}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2 px-3 py-3 rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-white/10 max-w-[calc(100vw-2rem)]"
      >
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300',
              mode === id ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}

        {mode === 'polymetric' && (
          <>
            <span className="w-px h-6 bg-white/15 mx-1" />
            {POLYMETRIC_LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLayout(l.id)}
                aria-pressed={layout === l.id}
                className={cn(
                  'px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300',
                  layout === l.id ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                {l.label}
              </button>
            ))}
          </>
        )}

        {mode === 'film' && (
          <>
            <span className="w-px h-6 bg-white/15 mx-1" />
            <button
              type="button"
              onClick={() => setVideoIndex((i) => (i - 1 + VIDEOS.length) % VIDEOS.length)}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
              aria-label="Previous film"
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="text-[11px] text-slate-200 font-bold max-w-[42vw] sm:max-w-xs truncate"
              title={film.title}
            >
              {film.title}
            </span>
            <button
              type="button"
              onClick={() => setVideoIndex((i) => (i + 1) % VIDEOS.length)}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
              aria-label="Next film"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={!muted}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300',
                muted ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'bg-teal-600 text-white'
              )}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />} {muted ? 'Sound off' : 'Sound on'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
