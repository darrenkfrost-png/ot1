import React from 'react';
import { cn } from '../lib/utils';

/**
 * Quiet anatomical detail.
 *
 * A clinic's decoration may as well be about the body. These are drawn as flat
 * SVG at very low opacity — no blur filters, no per-frame work — so they cost
 * essentially nothing to composite, which matters on pages that already carry
 * moving artwork.
 */

type MotifProps = {
  className?: string;
  /** 0–100. Kept deliberately faint; this is texture, not illustration. */
  opacity?: number;
};

/** A column of vertebrae with their discs, seen from behind. */
export const SpineMotif: React.FC<MotifProps> = ({ className, opacity = 6 }) => (
  <svg
    viewBox="0 0 120 460"
    aria-hidden="true"
    className={cn('pointer-events-none select-none', className)}
    style={{ opacity: opacity / 100 }}
    fill="none"
  >
    {Array.from({ length: 11 }).map((_, i) => {
      const y = 24 + i * 38;
      const width = 34 + i * 2.6;
      return (
        <g key={i} stroke="currentColor" strokeWidth="2">
          {/* vertebral body */}
          <rect x={60 - width / 2} y={y} width={width} height="20" rx="7" />
          {/* transverse processes */}
          <line x1={60 - width / 2 - 13} y1={y + 10} x2={60 - width / 2} y2={y + 10} strokeLinecap="round" />
          <line x1={60 + width / 2} y1={y + 10} x2={60 + width / 2 + 13} y2={y + 10} strokeLinecap="round" />
          {/* the disc below it */}
          {i < 10 && <line x1={60 - width / 2 + 4} y1={y + 28} x2={60 + width / 2 - 4} y2={y + 28} strokeLinecap="round" opacity="0.55" />}
        </g>
      );
    })}
  </svg>
);

/** Shoulder, neck and the line of the trapezius. */
export const NeckMotif: React.FC<MotifProps> = ({ className, opacity = 6 }) => (
  <svg
    viewBox="0 0 220 200"
    aria-hidden="true"
    className={cn('pointer-events-none select-none', className)}
    style={{ opacity: opacity / 100 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M110 18c-15 0-24 10-24 24 0 12 6 18 6 26" />
    <path d="M110 18c15 0 24 10 24 24 0 12-6 18-6 26" />
    <path d="M92 68C64 76 34 96 20 128" />
    <path d="M128 68c28 8 58 28 72 60" />
    <path d="M110 70v78" opacity="0.5" />
    <path d="M74 104c22 10 60 10 82 0" opacity="0.5" />
  </svg>
);

/** Hip, femur and knee — the line a leg takes under load. */
export const LegMotif: React.FC<MotifProps> = ({ className, opacity = 6 }) => (
  <svg
    viewBox="0 0 140 420"
    aria-hidden="true"
    className={cn('pointer-events-none select-none', className)}
    style={{ opacity: opacity / 100 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="70" cy="40" r="22" />
    <path d="M70 62c-4 46 2 84 6 118" />
    <circle cx="78" cy="196" r="16" />
    <path d="M78 212c-2 44-6 82-8 118" />
    <path d="M70 330c-6 22-10 40-10 56" />
    <path d="M50 392h40" opacity="0.6" />
  </svg>
);

/** The CT6 emblem, faint, as a watermark. */
export const EmblemWatermark: React.FC<MotifProps> = ({ className, opacity = 4 }) => (
  <svg
    viewBox="0 0 100 100"
    aria-hidden="true"
    className={cn('pointer-events-none select-none', className)}
    style={{ opacity: opacity / 100 }}
  >
    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    <text
      x="50"
      y="50"
      fill="currentColor"
      fontFamily="Outfit, system-ui, sans-serif"
      fontSize="30"
      fontWeight="700"
      textAnchor="middle"
      dominantBaseline="central"
    >
      @6t
    </text>
  </svg>
);
