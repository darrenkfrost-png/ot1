import { useEffect, useRef, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { speak, stop, speechSupported } from '../utils/readAloud';

/**
 * The listen chip. Rest a pointer or finger on any passage - the same gesture
 * that turns the text gold - and a small speaker button appears beside it.
 * Pressing it reads that passage aloud with the browser's own free voice;
 * highlighting a few words first reads just those words. Pressing again stops.
 *
 * The chip is one fixed-position button, moved rather than re-created, and it
 * stays on screen for the whole reading so Stop is always within reach.
 */

const TEXT_SELECTOR =
  '#main-content p, #main-content li, #main-content blockquote, #main-content dd, ' +
  '#main-content dt, #main-content figcaption, #main-content h1, #main-content h2, ' +
  '#main-content h3, #main-content h4, #main-content h5, #main-content h6';

const HINT_KEY = 'ct6-listen-hint-seen';

export default function ListenButton() {
  const { settings } = useSettings();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [hint, setHint] = useState(false);
  const anchorRef = useRef<Element | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const frame = useRef(0);
  const speakingRef = useRef(false);
  speakingRef.current = speaking;

  const enabled = settings.readAloudEnabled && speechSupported();

  useEffect(() => {
    if (!enabled) return;

    const placeBeside = (el: Element) => {
      const r = el.getBoundingClientRect();
      // Just outside the block's top-right corner, clamped to the LAYOUT
      // viewport. clientWidth, not innerWidth: on phones the two can disagree,
      // and the first phone test put the chip at x=463 on a 375px screen -
      // visible in the tree, untappable in reality.
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      setPos({
        x: Math.max(52, Math.min(vw - 8, r.right + 8)),
        y: Math.max(56, Math.min(vh - 30, r.top + 2)),
      });
    };

    const showFor = (el: Element | null) => {
      if (speakingRef.current) return; // pinned while reading
      window.clearTimeout(hideTimer.current);
      if (!el) {
        hideTimer.current = window.setTimeout(() => setPos(null), 700);
        return;
      }
      if (el !== anchorRef.current) {
        anchorRef.current = el;
        placeBeside(el);
      }
      try {
        if (!localStorage.getItem(HINT_KEY)) {
          localStorage.setItem(HINT_KEY, '1');
          setHint(true);
          window.setTimeout(() => setHint(false), 6000);
        }
      } catch { /* private windows can refuse storage; the hint is optional */ }
    };

    const onMove = (e: MouseEvent) => {
      if (frame.current) return;
      const { clientX, clientY } = e;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const el = document.elementFromPoint(clientX, clientY);
        if (el?.closest('[data-listen-chip]')) return; // hovering the chip itself
        showFor(el?.closest(TEXT_SELECTOR) ?? null);
      });
    };

    // On touch, ReadingHighlight has already marked the passage gold - anchor
    // to that mark when the finger lifts, and linger long enough to be tapped.
    const onTouchEnd = () => {
      window.setTimeout(() => {
        const marked = document.querySelector('.reading-touch-active');
        if (marked) {
          anchorRef.current = marked;
          placeBeside(marked);
          window.clearTimeout(hideTimer.current);
          hideTimer.current = window.setTimeout(() => {
            if (!speakingRef.current) setPos(null);
          }, 4500);
        }
      }, 50);
    };

    // Leaving the page mid-sentence must not leave the voice reading a page
    // that is no longer on screen.
    const onNavigate = () => {
      stop();
      setPos(null);
      anchorRef.current = null;
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('hashchange', onNavigate);
    window.addEventListener('popstate', onNavigate);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('hashchange', onNavigate);
      window.removeEventListener('popstate', onNavigate);
      if (frame.current) cancelAnimationFrame(frame.current);
      window.clearTimeout(hideTimer.current);
      stop();
    };
  }, [enabled]);

  if (!enabled || !pos) return null;

  const onPress = () => {
    if (speaking) {
      stop(); // stop() fires the done callback, which resets the state below
      return;
    }
    // A live selection wins: highlight three words, hear three words.
    const sel = window.getSelection();
    const selected = sel && !sel.isCollapsed ? sel.toString().trim() : '';
    const text = selected.length > 2
      ? selected
      : ((anchorRef.current as HTMLElement | null)?.innerText ?? '').trim();
    if (!text) return;
    const ok = speak(text, settings.readAloudRate, () => setSpeaking(false));
    if (ok) setSpeaking(true);
  };

  return (
    <div
      data-listen-chip
      className="fixed z-[9000] flex items-center gap-2"
      /*
       * The RIGHT edge sits at the anchor point, not the centre: the first-run
       * hint bubble widens this container leftward, and centring it pushed the
       * button itself off the right of a phone screen (measured at x=459 on a
       * 375px viewport). Growing leftward keeps the button under the thumb.
       */
      style={{ left: pos.x, top: pos.y, transform: 'translate(-100%, -50%)' }}
    >
      {hint && !speaking && (
        <span className="order-first px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-medium shadow-lg whitespace-nowrap">
          Tap to hear this read aloud — free, no sign-up
        </span>
      )}
      <button
        type="button"
        onClick={onPress}
        aria-label={speaking ? 'Stop reading aloud' : 'Read this passage aloud'}
        title={speaking ? 'Stop' : 'Listen'}
        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-colors ${
          speaking
            ? 'bg-teal-700 border-teal-600 text-white'
            : 'bg-white/95 border-slate-200 text-teal-700 hover:bg-teal-50'
        }`}
      >
        {speaking ? <Square size={16} className="fill-current" /> : <Volume2 size={19} />}
      </button>
    </div>
  );
}
