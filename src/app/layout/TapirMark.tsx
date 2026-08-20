/* ────────────────────────────────────────────────────────────────
   Compass Tapir — the guide.

   The twelve archetype animals are who you are. This one is not an
   archetype and is never assigned to anyone: it is the guide that walks
   the journey with you, so it had to be a thirteenth animal rather than
   one of the twelve wearing a second hat.

   A Malayan tapir, drawn in the same language as the archetype set:
   flat fills, no outlines, rounded silhouette, one warm accent. It is
   the animal that finds a path through dense forest, which is the job
   this thing actually does — and it is native to Malaysia, which none
   of the twelve are.
   ──────────────────────────────────────────────────────────────── */

interface TapirMarkProps {
  size?: number;
  /** Eyes close briefly on a loop. Off for static contexts. */
  blink?: boolean;
  /** Ear tips forward while it is working on an answer. */
  thinking?: boolean;
  className?: string;
}

const DARK = "#3D3A42";
const PUPIL = "#2A272E";
const SADDLE = "#F4EDE3";
const ACCENT = "#D9C18A";
const ACCENT_DEEP = "#B99C63";

/* One id per instance would be ideal, but the clip path is identical
   everywhere and SVG ids are global, so sharing one is correct here. */
const CLIP_ID = "tapir-saddle-clip";

export function TapirMark({ size = 40, blink = false, thinking = false, className = "" }: TapirMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Compass Tapir"
    >
      <defs>
        {/* The saddle is painted over the body and clipped to it, so the
            marking follows the silhouette instead of sitting on top of it. */}
        <clipPath id={CLIP_ID}>
          <rect x="70" y="100" width="150" height="96" rx="48" />
        </clipPath>
      </defs>

      <style>{`
        @keyframes tapir-blink {
          0%, 93%, 100% { transform: scaleY(1); }
          96%, 97.5%    { transform: scaleY(0.08); }
        }
        @keyframes tapir-listen {
          0%, 100% { transform: rotate(-12deg); }
          50%      { transform: rotate(-26deg); }
        }
        .tapir-eye { transform-origin: 82px 130px; }
        .tapir-ear { transform-origin: 92px 116px; }
        .tapir-is-blinking .tapir-eye { animation: tapir-blink 5.5s ease-in-out infinite; }
        .tapir-is-thinking .tapir-ear { animation: tapir-listen 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .tapir-is-blinking .tapir-eye,
          .tapir-is-thinking .tapir-ear { animation: none; }
        }
      `}</style>

      <g className={`${blink ? "tapir-is-blinking" : ""} ${thinking ? "tapir-is-thinking" : ""}`}>
        {/* Ground shadow */}
        <ellipse cx="142" cy="218" rx="72" ry="8" fill={DARK} opacity="0.10" />

        {/* Body */}
        <rect x="70" y="100" width="150" height="96" rx="48" fill={DARK} />

        {/* The saddle — the marking every Malayan tapir is known by */}
        <g clipPath={`url(#${CLIP_ID})`}>
          <rect x="126" y="92" width="74" height="114" fill={SADDLE} />
        </g>

        {/* Legs, with the brand's warm gold at the hooves */}
        <rect x="104" y="180" width="26" height="32" rx="13" fill={DARK} />
        <rect x="170" y="180" width="26" height="32" rx="13" fill={DARK} />
        <rect x="104" y="198" width="26" height="14" rx="7" fill={ACCENT} />
        <rect x="170" y="198" width="26" height="14" rx="7" fill={ACCENT} />

        {/* Ear */}
        <g className="tapir-ear" transform="rotate(-12 92 116)">
          <ellipse cx="86" cy="100" rx="14" ry="17" fill={DARK} />
          <ellipse cx="86" cy="102" rx="7" ry="10" fill={ACCENT_DEEP} />
        </g>

        {/* Head */}
        <circle cx="94" cy="136" r="40" fill={DARK} />

        {/* Snout — the whole identity of the animal is in this shape */}
        <path
          d="M62 120c-15 1-28 7-34 18-5 9-1 19 10 22 10 3 22 1 31-5l12-9-4-27-15 1z"
          fill={DARK}
        />
        <circle cx="35" cy="142" r="4.5" fill={PUPIL} />

        {/* Eye */}
        <g className="tapir-eye">
          <circle cx="80" cy="130" r="10.5" fill="#FFFFFF" />
          <circle cx="82" cy="131" r="6.2" fill={PUPIL} />
          <circle cx="84.5" cy="128" r="2.3" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );
}
