"use client";

import { useId } from "react";

/**
 * Aurelia brand mark — the calla-lily bud.
 *
 * One continuous silhouette: a broad left shoulder, a tapered stem, and the
 * softly rolled opening on the right where the spathe overlaps itself. The form
 * is carried by light rather than line work — a glow across the lit face, a soft
 * shade gathering on the folded right side.
 *
 * Painted entirely with `currentColor` and black/white at low opacity, so the
 * same mark reads on the ink badge in light mode, the gold badge in dark mode,
 * and the cream mat behind the share QR code — no per-theme colours to keep in
 * sync. (The original drawing's vein fan is kept behind the `veins` flag but off
 * by default: at badge size the lines only muddied the silhouette.)
 */

/** Petal: broad left shoulder, tapered right, rolled opening at the top right. */
const PETAL =
  "M98 252C82 248 68 236 60 218C50 196 52 170 55 148C58 122 68 96 86 74C104 51 126 30 152 14C148 36 141 60 139 86C137 110 140 130 140 152C140 178 136 204 128 222C120 240 110 248 98 252Z";

/** The rolled seam where the spathe overlaps itself. */
const SEAM =
  "M147 25C142 48 136 72 136 96C136 118 139 134 139 154C139 178 135 202 127 220C121 234 112 244 99 250";

const STEM = "M98 250C96 258 95 266 96 278";

/** The lit face, sitting behind the glow. */
const HIGHLIGHT =
  "M92 248C76 242 62 228 55 208C46 184 48 156 55 130C62 102 74 74 92 52C106 35 124 20 142 12C126 34 114 62 110 90C106 118 116 146 121 172C126 198 122 224 108 238C103 243 98 247 92 248Z";

/** Fine ribs converging at the base. Off by default — see `veins`. */
const VEINS = [
  "M99 250C91 216,75 179 60 132",
  "M99 250C91 216,79 168 67 114",
  "M99 250C92 216,83 158 74 97",
  "M99 250C92 216,87 150 81 83",
  "M99 250C92 216,91 141 89 69",
  "M99 250C93 216,96 135 98 58",
  "M99 250C93 216,101 129 107 49",
  "M99 250C94 216,107 127 116 45",
  "M99 250C95 216,112 129 125 48",
  "M99 250C95 216,116 135 133 58",
  "M99 250C95 216,119 146 139 76",
  "M99 250C96 216,123 159 145 98",
];

export function LeafMark({
  className = "h-[26px] w-auto",
  veins = false,
}: {
  className?: string;
  /** The original vein fan. Off by default: it muddies the badge sizes. */
  veins?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const petalId = `bud-petal-${uid}`;
  const stemId = `bud-stem-${uid}`;
  const glowId = `bud-glow-${uid}`;
  const shadeId = `bud-shade-${uid}`;
  const clipId = `bud-clip-${uid}`;

  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`leaf-mark ${className}`.trim()}
    >
      <defs>
        {/* light down the petal: open at the shoulder, deepening to the base */}
        <linearGradient id={petalId} x1="0.16" y1="0.02" x2="0.84" y2="0.98">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.34" stopColor="currentColor" stopOpacity="0.94" />
          <stop offset="0.72" stopColor="currentColor" stopOpacity="0.84" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={stemId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.78" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.62" />
        </linearGradient>
        {/* the glow sits on the lit face */}
        <radialGradient id={glowId} cx="0.34" cy="0.22" r="0.66">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        {/* soft directional shade down the folded right side */}
        <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0.18">
          <stop offset="0.52" stopColor="#1b2211" stopOpacity="0" />
          <stop offset="0.86" stopColor="#1b2211" stopOpacity="0.16" />
          <stop offset="1" stopColor="#1b2211" stopOpacity="0.26" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={PETAL} />
        </clipPath>
      </defs>

      <path d={STEM} stroke={`url(#${stemId})`} strokeWidth={5.6} strokeLinecap="round" />
      <path d={PETAL} fill={`url(#${petalId})`} />

      {/* the rolled seam — never removed */}
      <path
        d={SEAM}
        stroke="currentColor"
        strokeWidth={0.9}
        strokeLinecap="round"
        opacity={0.26}
      />

      <g clipPath={`url(#${clipId})`}>
        <ellipse
          cx="74"
          cy="118"
          rx="58"
          ry="112"
          fill={`url(#${glowId})`}
          transform="rotate(-11 74 118)"
        />
        <path d={HIGHLIGHT} fill="currentColor" opacity={0.1} />
        {veins && (
          <g
            stroke="currentColor"
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0.28}
          >
            {VEINS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        )}
        <rect width="200" height="280" fill={`url(#${shadeId})`} />
      </g>

      <path d={PETAL} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" opacity={0.14} />
    </svg>
  );
}
