/** The leaf mark, traced after the calla-bud reference photo (32 × 32 box). */
const BUD =
  "M16.6 26.6C13.1 24.2 10.7 20.4 10.6 16.2C10.5 11.4 12.1 7.4 14.6 5.1"
    "C18 6.4 20.6 10 21.5 14.9C22.3 19.6 20.2 23.7 16.6 26.6Z";
const STEM = "M15.7 26.1c.2 1.3.2 2.5.1 3.7h1.3c-.1-1.3-.1-2.5.2-3.7Z";
const FOLD = "M15.6 6.6c.7 6.5.5 13.3-.3 19.4";
const VEINS = [
  "M16 12.4c1.7-1.2 3.1-2 4.1-2.4",
  "M15.9 16.8c1.4-1.5 2.7-2.5 3.8-3.1",
  "M15.8 21c1.05-1.15 2-2 2.9-2.55",
  "M15.5 14.6c-1.5-.9-2.7-1.5-3.7-1.8",
  "M15.4 19.2c-1.2-.95-2.3-1.65-3.2-2.05",
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
        strokeWidth={1.1}
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
