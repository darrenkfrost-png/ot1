import { useEffect } from 'react';

/**
 * Touch half of the reading highlight.
 *
 * On a desktop the highlight is pure CSS :hover. A phone has no hover, so the
 * passage under the reader's finger is marked here instead: as they drag down
 * the page, whatever text is beneath the finger lights up, and it clears when
 * they lift off.
 *
 * Listeners are passive and the work is throttled to one lookup per animation
 * frame, so this cannot make scrolling stutter - elementFromPoint on every
 * raw touchmove would fire far more often than the screen refreshes.
 */

const TEXT_SELECTOR =
  '#main-content p, #main-content li, #main-content blockquote, #main-content dd, ' +
  '#main-content dt, #main-content figcaption, #main-content h1, #main-content h2, ' +
  '#main-content h3, #main-content h4, #main-content h5, #main-content h6';

const ACTIVE_CLASS = 'reading-touch-active';

export default function ReadingHighlight() {
  useEffect(() => {
    // Devices that have a real pointer are already covered by CSS :hover.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let current: Element | null = null;
    let frame = 0;
    let clearTimer: number | undefined;

    const clear = () => {
      if (current) {
        current.classList.remove(ACTIVE_CLASS);
        current = null;
      }
    };

    const markAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      const target = el?.closest(TEXT_SELECTOR) ?? null;

      // Gradient headings need no special case here: the stylesheet leaves
      // .text-transparent alone, so they highlight on touch exactly as they
      // do on hover.
      if (target === current) return;

      clear();
      if (target) {
        target.classList.add(ACTIVE_CLASS);
        current = target;
      }
    };

    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      window.clearTimeout(clearTimer);

      if (frame) return; // already scheduled for this frame
      const { clientX, clientY } = touch;
      frame = requestAnimationFrame(() => {
        frame = 0;
        markAt(clientX, clientY);
      });
    };

    const onTouchEnd = () => {
      // Held briefly after the finger lifts so the passage the reader just
      // stopped on does not vanish the instant they let go.
      clearTimer = window.setTimeout(clear, 900);
    };

    document.addEventListener('touchstart', onTouch, { passive: true });
    document.addEventListener('touchmove', onTouch, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouch);
      document.removeEventListener('touchmove', onTouch);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(clearTimer);
      clear();
    };
  }, []);

  return null;
}
