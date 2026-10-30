"use client";

import { useId } from "react";

/**
 * Aurelia brand mark — the calla bud from the reference photograph.
 *
 * Shaped, not drawn: one soft asymmetric silhouette (right shoulder high, left
 * belly sagging lower) filled with a flat `currentColor`, and the form carried
 * entirely by shadow — a soft ramp deepening into the fold on the right, plus a
 * faint fall-off towards the base. The apex and the base are capped with short
 * curves so there is no sharp corner anywhere. No lines inside.
 *
 * Because everything is `currentColor`, the same mark reads on the ink badge
 * (light mode), the gold badge (dark mode) and the cream mat behind the share QR
 * code.
 */

/** Soft asymmetric bud; apex and base rounded off rather than pointed. */
const OUTLINE =
  "M16.1 2.4Q16.9 1.2 17.7 2.4C19.9 4.3 22.3 7.6 22.4 12.4C22.5 18.2 21 24.2 17.6 26.4C17.3 27.6 15.9 27.4 15.5 26.6C11.6 25.4 8.4 22.4 8.5 19C8.7 13 12.4 6.2 16.1 2.4Z";

/** Rounded stem, starting inside the body so it grows out of it. */
const STEM = "M16.1 24.4c.4 2 .5 3.7.4 5.1";

export function LeafMark({ className = "h-[25px] w-[25px]" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const bodyId = `bud-body-${uid}`;
  const shadeId = `bud-shade-${uid}`;
  const baseId = `bud-base-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`leaf-mark ${className}`.trim()}
    >
      <defs>
        <clipPath id={bodyId}>
          <path d={OUTLINE} />
        </clipPath>
        {/* shadow gathering where the face folds away on the right */}
        <linearGradient id={shadeId} x1="0.1" y1="0.08" x2="1" y2="0.62">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.48" stopColor="#000" stopOpacity="0.04" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0.3" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        {/* and a soft fall-off into the base */}
        <linearGradient id={baseId} x1="0" y1="0.6" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <path
        d={STEM}
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
        opacity={0.85}
      />
      <path d={OUTLINE} fill="currentColor" />
      <g clipPath={`url(#${bodyId})`}>
        <path d={OUTLINE} fill={`url(#${shadeId})`} opacity={0.6} />
        <path d={OUTLINE} fill={`url(#${baseId})`} opacity={0.2} />
      </g>
    </svg>
  );
}
