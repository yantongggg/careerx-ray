/* ────────────────────────────────────────────────────────────────
   Compass Tapir — the guide.

   The twelve archetype animals are who you are, and every one of them
   gets assigned to somebody. This one never is: it is the guide that
   walks the journey with you, which is why it had to be a thirteenth
   animal rather than one of the twelve wearing a second hat.

   A Malayan tapir, from the same illustration set as the twelve. It is
   the animal that finds a path through dense forest, which is the job
   this thing actually does — and it is native to Malaysia, which none
   of the twelve are.

   The source render is docs/assets/career-dna-originals/malaimo.png.
   It arrived on an opaque white ground at 1197×1314; the shipped file
   is background-removed, squared and cut to 256px, because this loads
   on every page for an avatar that never renders above 40.
   ──────────────────────────────────────────────────────────────── */

const TAPIR_SRC = "/dna/tapir.png";

interface TapirMarkProps {
  size?: number;
  /** Breathes gently. For the resting launcher and the panel header. */
  idle?: boolean;
  /** Bobs while it is working on an answer. */
  thinking?: boolean;
  className?: string;
}

export function TapirMark({ size = 40, idle = false, thinking = false, className = "" }: TapirMarkProps) {
  const motion = thinking ? "tapir-thinking" : idle ? "tapir-idle" : "";

  return (
    <>
      <style>{`
        @keyframes tapir-breathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-4%) scale(1.02); }
        }
        @keyframes tapir-bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%      { transform: translateY(-11%) rotate(2deg); }
        }
        .tapir-idle     { animation: tapir-breathe 3.6s ease-in-out infinite; }
        .tapir-thinking { animation: tapir-bob 0.85s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .tapir-idle, .tapir-thinking { animation: none; }
        }
      `}</style>
      <img
        src={TAPIR_SRC}
        width={size}
        height={size}
        alt="Compass Tapir"
        /* Decorative wherever it sits beside its own name, which is
           everywhere it currently appears. */
        aria-hidden="true"
        draggable={false}
        className={`${motion} ${className}`}
        style={{ width: size, height: size, objectFit: "contain", userSelect: "none" }}
      />
    </>
  );
}
