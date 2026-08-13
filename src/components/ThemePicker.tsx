import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { cn } from '../lib/utils';

type ThemeId =
  | 'clinical'
  | 'midnight'
  | 'sand'
  | 'contrast'
  | 'ocean'
  | 'forest'
  | 'graphite'
  | 'blush'
  | 'ice';

/**
 * The four looks, with a swatch of each so the choice is visible rather than
 * a word you have to try. Each theme sets its own text colours as well as its
 * surfaces, so no combination can end up unreadable.
 */
const THEMES: { id: ThemeId; name: string; note: string; panel: string; ground: string; ink: string }[] = [
  {
    id: 'clinical',
    name: 'Clinical',
    note: 'The original — light panels, teal accents',
    panel: '#ffffff',
    ground: '#0f172a',
    ink: '#0f172a',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    note: 'Dark panels, easier at night',
    panel: '#020617',
    ground: '#020617',
    ink: '#f8fafc',
  },
  {
    id: 'sand',
    name: 'Sand',
    note: 'Warm paper, softer than white',
    panel: '#faf7f2',
    ground: '#1c1917',
    ink: '#2c2622',
  },
  {
    id: 'contrast',
    name: 'High contrast',
    note: 'Strong edges, maximum legibility',
    panel: '#ffffff',
    ground: '#000000',
    ink: '#0f172a',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    note: 'Deep blue, calm and cool',
    panel: '#081b31',
    ground: '#04101d',
    ink: '#eaf2fb',
  },
  {
    id: 'forest',
    name: 'Forest',
    note: 'Deep green, quiet and grounded',
    panel: '#071c16',
    ground: '#04140f',
    ink: '#eaf5f0',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    note: 'Neutral dark, no colour cast',
    panel: '#18181b',
    ground: '#09090b',
    ink: '#fafafa',
  },
  {
    id: 'blush',
    name: 'Blush',
    note: 'Warm and gentle, softer than white',
    panel: '#fdf6f6',
    ground: '#2b1d1f',
    ink: '#3a2a2c',
  },
  {
    id: 'ice',
    name: 'Ice',
    note: 'Cool daylight, crisp and clean',
    panel: '#f4f9fc',
    ground: '#0b1b23',
    ink: '#10212b',
  },
];

export default function ThemePicker() {
  const { settings, updateSetting } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on an outside click or Escape, as any menu should.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const current = THEMES.find((t) => t.id === settings.appTheme) ?? THEMES[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Appearance — currently ${current.name}`}
        title="Appearance"
        className="p-3 rounded-full hover:bg-[var(--panel-hover)] text-[var(--panel-text-muted)] hover:text-[var(--panel-text)] relative transition-all cursor-pointer focus-visible:outline-teal-500 group"
      >
        <Palette size={21} className="group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            aria-label="Appearance"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            /* Nine of them, so the list scrolls rather than running off the
               bottom of a laptop screen. */
            className="absolute right-0 mt-3 w-72 max-h-[70vh] overflow-y-auto rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] backdrop-blur-3xl shadow-premium-lg p-2 z-50"
          >
            <p className="sticky top-0 bg-[var(--panel-bg)] px-3 pt-2 pb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--panel-text-muted)]">
              Appearance
            </p>

            {THEMES.map((theme) => {
              const isCurrent = settings.appTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  role="menuitemradio"
                  aria-checked={isCurrent}
                  onClick={() => {
                    updateSetting('appTheme', theme.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all focus-visible:outline-teal-500',
                    isCurrent ? 'bg-[var(--panel-hover)]' : 'hover:bg-[var(--panel-hover)]'
                  )}
                >
                  {/* Two squares: the panel colour over the ground behind it. */}
                  <span
                    className="relative w-10 h-10 rounded-xl shrink-0 border border-black/10 overflow-hidden shadow-inner"
                    style={{ background: theme.ground }}
                    aria-hidden="true"
                  >
                    <span
                      className="absolute inset-x-1 bottom-1 top-3 rounded-lg border border-black/10"
                      style={{ background: theme.panel }}
                    />
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-[var(--panel-text)] truncate">
                      {theme.name}
                      {theme.id === 'clinical' && (
                        <span className="ml-2 text-[9px] font-black uppercase tracking-[0.2em] text-teal-500">
                          Default
                        </span>
                      )}
                    </span>
                    <span className="block text-[11px] font-light text-[var(--panel-text-muted)] truncate">
                      {theme.note}
                    </span>
                  </span>

                  {isCurrent && <Check size={16} className="text-teal-500 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
