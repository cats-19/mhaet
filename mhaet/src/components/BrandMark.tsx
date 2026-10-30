/**
 * Aurelia brand mark — a seed resting in a cradle.
 *
 * A single soft cup cradles an almond seed: new life held with care. It reads
 * clearly down to ~20px, and because it is drawn with `currentColor` it inherits
 * the ink / gold pairing of whatever circular badge it sits inside.
 */
export function BrandMark({
  className = "h-[18px] w-[18px]",
  strokeWidth = 1.7,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M6.4 16.9c1 5.1 4.6 7.9 9.6 7.9s8.6-2.8 9.6-7.9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 7.9c3.2 3.4 3.2 8.4 0 11.8-3.2-3.4-3.2-8.4 0-11.8Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
