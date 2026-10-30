/** The leaf mark, traced after the calla-bud reference photo (32 × 32 box). */
const BUD =
  "M16.1 27.1C13.7 24.7 12.2 21.6 12 18.2C11.7 13.6 12.6 9 14.4 5.7C16.7 7.3 18.8 10.6 19.9 15C21 19.6 19.7 24 16.1 27.1Z";
const STEM = "M15.5 26.6c.1 1.1.2 2.1.1 3.2h1.1c-.1-1.1 0-2.1.2-3.2Z";
const FOLD = "M15.5 7.2c.5 6.6.4 13.4-.1 19.4";
const VEINS = [
  "M15.7 12.2c1.5-1 2.7-1.7 3.6-2",
  "M15.6 16.2c1.25-1.25 2.4-2.15 3.4-2.7",
  "M15.5 20.2c1-1.05 1.9-1.85 2.75-2.4",
  "M15.4 15.2c-1.2-.75-2.2-1.3-3-1.6",
  "M15.4 19.4c-1-.85-1.9-1.5-2.7-1.9",
];

/**
 * Aurelia brand mark — a single leaf bud, its fold and veins cut out of the
 * shape so the badge colour shows through (the "light through the leaf" idea
 * from the reference photograph).
 *
 * The solid silhouette keeps it legible all the way down to ~20px, unlike a
 * thin-line drawing. It inherits `currentColor` for the leaf, and the veins use
 * a CSS variable so they always match the surface they sit on — pass `cut` when
 * the badge isn't one of the standard ink/gold circles.
 */
export function BrandMark({
  className = "h-[18px] w-[18px]",
  cut,
}: {
  className?: string;
  /** Colour of the cut-out veins; defaults to the badge background. */
  cut?: string;
}) {
  const cutColor = cut ?? "var(--brand-mark-cut, #3b3226)";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`brand-mark ${className}`.trim()}
    >
      <g fill="currentColor">
        <path d={BUD} />
        <path d={STEM} />
      </g>
      <g
        fill="none"
        stroke={cutColor}
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.9}
      >
        <path d={FOLD} />
        {VEINS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
