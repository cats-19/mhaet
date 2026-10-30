"use client";

import { useId } from "react";

/**
 * Aurelia brand mark — the calla bud from the reference photograph.
 *
 * What makes the photograph itself, and what this reproduces:
 *  - a tall, asymmetric bud: the right shoulder rides high while the left belly
 *    sags lower, so the outline is never symmetrical;
 *  - fine hairs that gather at the neck and sweep up the lit face, fading out
 *    before they reach the belly (they're cut out of the body, so each badge
 *    colour shows through them);
 *  - light falling across the bract — brightest along the lit left face,
 *    deepening into the fold on the right, and cooling towards the stem.
 *
 * Painted with `currentColor` throughout, so the same mark reads on the ink
 * badge (light mode), the gold badge (dark mode) and the cream mat behind the
 * share QR code.
 */

/** Silhouette: asymmetric bud, right shoulder high, left belly lower. */
const OUTLINE =
  "M16.8 1.6C19.6 3.4 22.3 7.6 22.4 12.4C22.5 18.2 21 24.2 17.2 27.1C16.5 27.5 15.9 27.4 15.5 27C11.6 25.4 8.4 22.4 8.5 19C8.7 13 12.4 6.2 16.8 1.6Z";

/** The soft crease down the folded right-hand face. */
const FOLD = "M16.8 1.6C19.2 5.6 20.8 10.4 21 15.6C21.2 20.1 20.1 24.4 17.4 27.1";

const STEM = "M14.9 27.1c.7 1.4.9 2.9.6 4.2h1.7c-.3-1.3-.1-2.8.6-4.2Z";

/** Hairs: out of the neck, up the lit face, along the belly's curve. */
const HAIRS = Array.from({ length: 18 }, (_, i) => {
  const t = i / 17;
  const bx = 15 + 1.5 * t;
  const by = 26.9 - 3.4 * t;
  const tx = 10 + 8 * Math.pow(t, 0.68);
  const ty = 20.8 - 17 * Math.pow(t, 0.55);
  const cx = (bx + tx) / 2 - 2.2 * (1 - 0.5 * t);
  const cy = (by + ty) / 2 + 1.9;
  return `M${bx.toFixed(2)} ${by.toFixed(2)}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${tx.toFixed(2)} ${ty.toFixed(2)}`;
});

export function LeafMark({ className = "h-[25px] w-[25px]" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const lightId = `bud-light-${uid}`;
  const shadeId = `bud-shade-${uid}`;
  const hairMaskId = `bud-hairs-${uid}`;
  const hairFadeId = `bud-hair-fade-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`leaf-mark ${className}`.trim()}
    >
      <defs>
        {/* light across the bract: open on the lit face, deeper towards the fold */}
        <linearGradient id={lightId} x1="0.12" y1="0.02" x2="0.8" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.97" />
          <stop offset="0.45" stopColor="currentColor" stopOpacity="0.84" />
          <stop offset="0.8" stopColor="currentColor" stopOpacity="0.62" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
        </linearGradient>
        {/* shadow gathering where the face folds away */}
        <linearGradient id={shadeId} x1="0.45" y1="0.15" x2="1" y2="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        {/* the hairs thin out as they approach the belly */}
        <linearGradient id={hairFadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.04" stopColor="#000" stopOpacity="1" />
          <stop offset="0.62" stopColor="#000" stopOpacity="0.7" />
          <stop offset="0.92" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        {/* subtractive mask: white keeps the body, the hairs cut through it */}
        <mask id={hairMaskId}>
          <rect width="32" height="32" fill="#fff" />
          <g
            fill="none"
            stroke={`url(#${hairFadeId})`}
            strokeWidth={0.16}
            strokeLinecap="round"
          >
            {HAIRS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </mask>
      </defs>

      {/* body and its shading share the hair mask, so the grooves stay open */}
      <g mask={`url(#${hairMaskId})`}>
        <path d={OUTLINE} fill={`url(#${lightId})`} />
        <path d={OUTLINE} fill={`url(#${shadeId})`} />
      </g>
      <path d={STEM} fill="currentColor" opacity={0.72} />
      <path
        d={FOLD}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.28}
        strokeLinecap="round"
        opacity={0.22}
      />
    </svg>
  );
}
