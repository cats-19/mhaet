"use client";

import { useId, useMemo } from "react";

type OrbMode = "idle" | "speaking" | "listening" | "danger";

/** Ribbon families: a lobe count, deformation, colour and a rotation drift. */
type Ribbon = {
  id: string;
  /** Number of lobes in the rosette. */
  lobes: number;
  /** How far the radius swells in and out. */
  amp: number;
  /** Number of fine hatch lines that make up the ribbon. */
  lines: number;
  /** Inner / outer radius of the band, as a fraction of the orb. */
  rInner: number;
  rOuter: number;
  /** Twist applied across the band, and the starting rotation. */
  spread: number;
  twist: number;
  squash: number;
  /** Gradient stops, light mode. */
  from: string;
  via: string;
  to: string;
  /** Gradient stops, dark mode. */
  darkFrom: string;
  darkVia: string;
  darkTo: string;
};

const RIBBONS: Ribbon[] = [
  {
    id: "lavender",
    lobes: 5,
    amp: 0.4,
    lines: 18,
    rInner: 0.46,
    rOuter: 1,
    spread: 1.15,
    twist: 0.04,
    squash: 1,
    from: "#a48ce0",
    via: "#8f74d6",
    to: "#d59fd0",
    darkFrom: "#c0a8f5",
    darkVia: "#a58ce8",
    darkTo: "#e3b2dc",
  },
  {
    id: "rose",
    lobes: 4,
    amp: 0.34,
    lines: 13,
    rInner: 0.42,
    rOuter: 0.9,
    spread: -0.95,
    twist: -0.62,
    squash: 1.05,
    from: "#e79ec4",
    via: "#c391d8",
    to: "#9d86dd",
    darkFrom: "#f0b3d5",
    darkVia: "#d3a4e8",
    darkTo: "#b39aef",
  },
  {
    id: "peach",
    lobes: 3,
    amp: 0.38,
    lines: 12,
    rInner: 0.4,
    rOuter: 0.84,
    spread: 1.35,
    twist: 1.02,
    squash: 0.95,
    from: "#e99668",
    via: "#f2b489",
    to: "#f7d6ab",
    darkFrom: "#f6ab7e",
    darkVia: "#f7c79c",
    darkTo: "#fbe0bb",
  },
  {
    id: "honey",
    lobes: 6,
    amp: 0.22,
    lines: 8,
    rInner: 0.68,
    rOuter: 0.96,
    spread: -0.7,
    twist: -0.3,
    squash: 1,
    from: "#e88f66",
    via: "#e9b98f",
    to: "#c9a7e8",
    darkFrom: "#f4a877",
    darkVia: "#eec39a",
    darkTo: "#cdb0f0",
  },
];

const SIZE = 460;
const CENTER = SIZE / 2;
const SAMPLES = 60;

/**
 * One rosette outline: r(θ) = R · (1 + amp·cos(kθ + φ) + 0.05·cos((k+2)θ − φ)).
 * The second harmonic keeps the silhouette organic rather than geometric.
 */
function rosette(R: number, lobes: number, amp: number, phase: number, twist: number, squash: number) {
  const points: string[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = (i / SAMPLES) * Math.PI * 2;
    const r = R * (1 + amp * Math.cos(lobes * t + phase) + 0.05 * Math.cos((lobes + 2) * t - phase));
    const x = CENTER + r * Math.cos(t + twist);
    const y = CENTER + (r * Math.sin(t + twist)) * squash;
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${points.join(" L")} Z`;
}

/**
 * The voice orb: woven ribbons of lavender, rose and peach hatching that drift
 * through one another, leaving a soft hollow in the middle. Each ribbon rotates,
 * breathes and skews on its own clock (see `.voice-orb__ribbon` in globals.css),
 * so the overlapping shapes keep re-weaving instead of spinning as one rigid disc.
 */
export function VoiceOrb({ mode }: { mode: OrbMode }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  /** Static geometry: generated once, then animated entirely by CSS transforms. */
  const ribbons = useMemo(
    () =>
      RIBBONS.map((ribbon) => {
        const paths: { d: string; width: number; opacity: number; wash: boolean }[] = [];
        for (let i = 0; i < ribbon.lines; i += 1) {
          const t = ribbon.lines === 1 ? 0 : i / (ribbon.lines - 1);
          const R = SIZE * 0.44 * (ribbon.rInner + (ribbon.rOuter - ribbon.rInner) * t);
          const d = rosette(
            R,
            ribbon.lobes,
            ribbon.amp * (1 + 0.05 * Math.sin(i * 1.7)),
            t * 2.5,
            ribbon.twist + t * ribbon.spread,
            ribbon.squash,
          );
          paths.push({ d, width: 0.62, opacity: 0.3, wash: false });
          // Every few lines a faint wide stroke fuses them into a ribbon.
          if (i % 4 === 0) paths.push({ d, width: 10, opacity: 0.05, wash: true });
        }
        return { ...ribbon, paths };
      }),
    [],
  );

  return (
    <div
      aria-hidden="true"
      className={`voice-orb ${
        mode === "listening"
          ? "is-listening"
          : mode === "speaking"
            ? "is-speaking"
            : mode === "danger"
              ? "is-danger"
              : ""
      }`}
      style={{ width: "min(248px, 30vh)", height: "min(248px, 30vh)" }}
    >
      <span className="voice-orb__bloom" />

      <svg className="voice-orb__figure" viewBox={`0 0 ${SIZE} ${SIZE}`} role="presentation">
        <defs>
          {ribbons.map((ribbon) => (
            <linearGradient
              key={ribbon.id}
              id={`${uid}-${ribbon.id}`}
              x1="0.05"
              y1="0.1"
              x2="0.95"
              y2="0.9"
            >
              <stop offset="0" stopColor={ribbon.from} />
              <stop offset="0.55" stopColor={ribbon.via} />
              <stop offset="1" stopColor={ribbon.to} />
            </linearGradient>
          ))}
          {ribbons.map((ribbon) => (
            <linearGradient
              key={`${ribbon.id}-dark`}
              id={`${uid}-${ribbon.id}-dark`}
              x1="0.05"
              y1="0.1"
              x2="0.95"
              y2="0.9"
            >
              <stop offset="0" stopColor={ribbon.darkFrom} />
              <stop offset="0.55" stopColor={ribbon.darkVia} />
              <stop offset="1" stopColor={ribbon.darkTo} />
            </linearGradient>
          ))}
          <radialGradient id={`${uid}-core`}>
            <stop offset="0.28" stopColor="#fffdf8" />
            <stop offset="0.62" stopColor="#fffaf4" stopOpacity="0.94" />
            <stop offset="1" stopColor="#fffaf4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-core-dark`}>
            <stop offset="0.28" stopColor="#3a322a" />
            <stop offset="0.62" stopColor="#2a241d" stopOpacity="0.92" />
            <stop offset="1" stopColor="#2a241d" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={SIZE * 0.475} className="voice-orb__pad" />

        <g className="voice-orb__weave">
          {ribbons.map((ribbon, index) => (
            <g
              key={ribbon.id}
              className="voice-orb__ribbon"
              style={{ ["--ribbon" as string]: index }}
            >
              {ribbon.paths.map((path, pathIndex) => (
                <path
                  key={pathIndex}
                  d={path.d}
                  className={path.wash ? "voice-orb__wash" : "voice-orb__thread"}
                  stroke={`url(#${uid}-${ribbon.id})`}
                  strokeWidth={path.width}
                  opacity={path.opacity}
                />
              ))}
              <path
                key="dark"
                d={ribbon.paths[0].d}
                className="voice-orb__thread-dark"
                stroke={`url(#${uid}-${ribbon.id}-dark)`}
                strokeWidth={ribbon.paths[0].width}
                opacity={0}
              />
            </g>
          ))}
        </g>

        <circle cx={CENTER} cy={CENTER} r={SIZE * 0.3} fill={`url(#${uid}-core)`} className="voice-orb__hollow" />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={SIZE * 0.3}
          fill={`url(#${uid}-core-dark)`}
          className="voice-orb__hollow-dark"
        />
      </svg>

      {/* Speaking: rings leave the orb like spoken words, over a quiet voiceprint. */}
      {mode === "speaking" && (
        <>
          <span className="voice-orb__ripples">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="voice-orb__ripple"
                style={{ animationDelay: `${i * 0.86}s` }}
              />
            ))}
          </span>
          <span className="voice-orb__voiceprint">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="voice-orb__bar"
                style={{ animationDelay: `${i * 0.11}s` }}
              />
            ))}
          </span>
        </>
      )}

      {mode === "danger" && <span className="voice-orb__danger-ring" />}
    </div>
  );
}
