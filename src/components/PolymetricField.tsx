import React from 'react';
import { cn } from '../lib/utils';

/**
 * POLYMETRIC FIELD — the geometry of alignment.
 *
 * Four drawn layouts on a chiropractic theme: a spinal column measured against
 * its own axis, a lattice of joint nodes, radiating range-of-motion arcs, and
 * a symmetry grid reading left against right. They are what a clinic's idle
 * screen should be about — the body, measured — rather than generic motion.
 *
 * Everything here is flat SVG with CSS/SMIL-free animation driven by CSS
 * keyframes on transforms and opacity only. No filters, no per-frame
 * JavaScript, no canvas: the screensaver may sit running for an hour on a
 * waiting-room display, and it must not heat the machine to do it.
 *
 * Every layout is aria-hidden. This is decoration, and a screen reader
 * announcing "spinal lattice" would be describing wallpaper.
 */

export type PolymetricLayout = 'column' | 'lattice' | 'radius' | 'symmetry';

export const POLYMETRIC_LAYOUTS: { id: PolymetricLayout; label: string }[] = [
  { id: 'column', label: 'Column' },
  { id: 'lattice', label: 'Lattice' },
  { id: 'radius', label: 'Range' },
  { id: 'symmetry', label: 'Symmetry' },
];

type Props = {
  layout: PolymetricLayout;
  /** The clinic's accent, so the field matches whatever theme is set. */
  colour?: string;
  className?: string;
  /** Stillness for anyone who needs it. */
  still?: boolean;
};

const VERTEBRAE = 14;

export const PolymetricField: React.FC<Props> = ({
  layout,
  colour = '#2dd4bf',
  className,
  still = false,
}) => {
  const anim = (name: string, secs: number, delay = 0) =>
    still ? undefined : { animation: `${name} ${secs}s ease-in-out ${delay}s infinite` };

  return (
    <svg
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={cn('absolute inset-0 w-full h-full pointer-events-none select-none', className)}
      fill="none"
      stroke={colour}
    >
      {layout === 'column' && (
        <g strokeWidth="1.1">
          {/* the axis the column is measured against */}
          <line x1="500" y1="40" x2="500" y2="580" strokeOpacity="0.28" strokeDasharray="3 7" />
          {Array.from({ length: VERTEBRAE }).map((_, i) => {
            const y = 60 + i * 37;
            const w = 46 + Math.sin(i * 0.7) * 16;
            return (
              <g key={i} style={anim('poly-drift', 9 + (i % 4), i * 0.28)} opacity={0.5}>
                <rect x={500 - w / 2} y={y} width={w} height="20" rx="6" strokeOpacity="0.55" />
                <line x1={500 - w / 2 - 26} y1={y + 10} x2={500 - w / 2 - 6} y2={y + 10} strokeOpacity="0.3" />
                <line x1={500 + w / 2 + 6} y1={y + 10} x2={500 + w / 2 + 26} y2={y + 10} strokeOpacity="0.3" />
                <circle cx={500 - w / 2 - 34} cy={y + 10} r="2.2" strokeOpacity="0.45" />
                <circle cx={500 + w / 2 + 34} cy={y + 10} r="2.2" strokeOpacity="0.45" />
              </g>
            );
          })}
        </g>
      )}

      {layout === 'lattice' && (
        <g strokeWidth="1">
          {Array.from({ length: 7 }).map((_, r) =>
            Array.from({ length: 11 }).map((__, c) => {
              const x = 60 + c * 88;
              const y = 70 + r * 80;
              return (
                <g key={`${r}-${c}`} style={anim('poly-pulse', 7 + ((r + c) % 5), (r + c) * 0.18)}>
                  <circle cx={x} cy={y} r="4" strokeOpacity="0.5" />
                  {c < 10 && <line x1={x + 4} y1={y} x2={x + 84} y2={y} strokeOpacity="0.14" />}
                  {r < 6 && <line x1={x} y1={y + 4} x2={x} y2={y + 76} strokeOpacity="0.14" />}
                  {c < 10 && r < 6 && (
                    <line x1={x + 4} y1={y + 4} x2={x + 84} y2={y + 76} strokeOpacity="0.07" />
                  )}
                </g>
              );
            })
          )}
        </g>
      )}

      {layout === 'radius' && (
        <g strokeWidth="1.1">
          {/* range-of-motion arcs sweeping out from a single joint */}
          {Array.from({ length: 9 }).map((_, i) => {
            const r = 60 + i * 46;
            return (
              <circle
                key={i}
                cx="500"
                cy="330"
                r={r}
                strokeOpacity={0.34 - i * 0.03}
                strokeDasharray={`${8 + i * 3} ${16 + i * 5}`}
                style={anim('poly-spin', 40 + i * 9, i * 0.4)}
                transform-origin="500 330"
              />
            );
          })}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={`s${i}`}
                x1={500 + Math.cos(a) * 60}
                y1={330 + Math.sin(a) * 60}
                x2={500 + Math.cos(a) * 470}
                y2={330 + Math.sin(a) * 470}
                strokeOpacity="0.08"
              />
            );
          })}
          <circle cx="500" cy="330" r="7" strokeOpacity="0.6" style={anim('poly-pulse', 5)} />
        </g>
      )}

      {layout === 'symmetry' && (
        <g strokeWidth="1.1">
          <line x1="500" y1="20" x2="500" y2="600" strokeOpacity="0.3" strokeDasharray="2 9" />
          {Array.from({ length: 12 }).map((_, i) => {
            const y = 50 + i * 46;
            const spread = 90 + Math.sin(i * 0.9) * 55;
            return (
              <g key={i} style={anim('poly-sway', 11 + (i % 3) * 2, i * 0.3)} opacity={0.55}>
                <line x1={500 - spread} y1={y} x2={500 - 24} y2={y} strokeOpacity="0.4" />
                <line x1={500 + 24} y1={y} x2={500 + spread} y2={y} strokeOpacity="0.4" />
                <circle cx={500 - spread} cy={y} r="3" strokeOpacity="0.55" />
                <circle cx={500 + spread} cy={y} r="3" strokeOpacity="0.55" />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};

export default PolymetricField;
