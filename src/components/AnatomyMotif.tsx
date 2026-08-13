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

/** Foot in profile — arch, heel and the line of the toes. */
export const FootMotif: React.FC<MotifProps> = ({ className, opacity = 6 }) => (
  <svg
    viewBox="0 0 260 180"
    aria-hidden="true"
    className={cn('pointer-events-none select-none', className)}
    style={{ opacity: opacity / 100 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    {/* ankle down into the heel */}
    <path d="M74 18c-4 26-2 44 4 58" />
    <path d="M110 18c2 28 0 46-6 60" />
    <path d="M78 76c-16 12-26 26-26 44 0 20 16 34 42 34" />
    {/* the arch, which is the whole point of a foot */}
    <path d="M94 154c34 0 62-6 88-16" opacity="0.75" />
    <path d="M78 120c26 14 62 18 104 12" opacity="0.5" />
    {/* toes */}
    <path d="M182 138c14-2 26-6 36-12" />
    <path d="M186 150c12-1 22-4 30-8" opacity="0.7" />
    <circle cx="226" cy="126" r="7" opacity="0.65" />
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

/**
 * Which part of the body each treatment is actually about.
 *
 * Mapped by hand rather than guessed from the name: a Thai *foot* massage and a
 * Thai *oil body* massage share a word and share nothing else. Where a treatment
 * has no single region — hypnotherapy, acupuncture, digestive work — it takes
 * the emblem instead of being forced onto a limb it has nothing to do with.
 */
export type MotifKind = 'spine' | 'neck' | 'leg' | 'foot' | 'emblem';

const TREATMENT_MOTIFS: Record<string, MotifKind> = {
  osteopathy: 'spine',
  'therapeutic-massage': 'spine',
  'swedish-massage': 'spine',
  'thai-oil-massage': 'spine',
  'hot-stone-massage': 'spine',
  'pregnancy-massage': 'spine',
  'indian-head-massage': 'neck',
  'natural-face-lift': 'neck',
  'sports-massage': 'leg',
  physiotherapy: 'leg',
  'thai-foot-massage': 'foot',
  footcare: 'foot',
  acupuncture: 'emblem',
  hypnotherapy: 'emblem',
  'digestive-massage': 'emblem',
};

export const motifKindFor = (treatmentId?: string): MotifKind =>
  (treatmentId && TREATMENT_MOTIFS[treatmentId]) || 'emblem';

/** Renders whichever motif belongs to a treatment. */
export const TreatmentMotif: React.FC<MotifProps & { treatmentId?: string }> = ({
  treatmentId,
  className,
  opacity = 6,
}) => {
  const kind = motifKindFor(treatmentId);
  if (kind === 'spine') return <SpineMotif className={className} opacity={opacity} />;
  if (kind === 'neck') return <NeckMotif className={className} opacity={opacity} />;
  if (kind === 'leg') return <LegMotif className={className} opacity={opacity} />;
  if (kind === 'foot') return <FootMotif className={className} opacity={opacity} />;
  return <EmblemWatermark className={className} opacity={opacity} />;
};
