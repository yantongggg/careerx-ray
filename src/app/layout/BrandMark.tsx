/* The CX monogram, in one place. Five screens carried their own copy of
   the old lockup, which is five places to miss when the brand changes. */

interface BrandMarkProps {
  /** Pixel size of the mark. The wordmark scales with it. */
  size?: number;
  /** Set on dark grounds, where the navy wordmark would disappear. */
  onDark?: boolean;
  /** Mark only, for tight spaces. */
  hideWordmark?: boolean;
  className?: string;
}

export function BrandMark({
  size = 32,
  onDark = false,
  hideWordmark = false,
  className = "",
}: BrandMarkProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="CareerX-Ray"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain flex-shrink-0"
      />
      {!hideWordmark && (
        <span
          className={`font-semibold tracking-tight ${onDark ? "text-white" : "text-foreground"}`}
          style={{ fontSize: size * 0.5 }}
        >
          CareerX-Ray
        </span>
      )}
    </span>
  );
}
