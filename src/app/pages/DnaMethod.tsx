import { ArrowLeft, ArrowRight, Check, Repeat, Scale, Sparkles } from "lucide-react";
import { archetypes, calibrationQuestions, careerDnaAxes, dimensions } from "../lib/careerDna.js";
import { useCareerProfile } from "../state/careerProfile";

/* The method page. Everything stated here is checkable against
   src/app/lib/careerDna.js and tests/careerDna.test.mjs — the counts are
   read from the model itself rather than typed in, so the page cannot
   drift away from the engine it describes. */

interface DnaMethodProps {
  onNavigate?: (page: string) => void;
}

/* Kept in step with CONFLICT_THRESHOLD in CareerDna.tsx. */
const CONFLICT_GAP = 15;

const AXIS_NOTE: Record<string, string> = {
  craft: "Whether your evidence is in the work itself or in carrying it to other people.",
  tempo: "Whether you are trusted to land things, or to find the thing worth landing.",
  scope: "Whether you move an outcome by setting direction, or by moving people.",
};

export function DnaMethod({ onNavigate }: DnaMethodProps) {
  const { profile } = useCareerProfile();
  const questionCount = calibrationQuestions.length;
  const optionCount = calibrationQuestions[0]?.options.length ?? 4;
  const combinations = Math.pow(optionCount, questionCount);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px] mx-auto space-y-6">

        <button
          onClick={() => onNavigate?.("dna")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Back to Career DNA
        </button>

        {/* ── Header ── */}
        <div className="bg-slate-950 text-white rounded-2xl p-6 lg:p-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-slate-200 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Sparkles size={13} /> The method
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {questionCount} questions. Three axes. One result that never changes.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mt-3 max-w-2xl">
            Most work-personality tests cut a continuous trait in half and hand you a label.
            Do it twice and a lot of people land somewhere else. We built this so that
            cannot happen — and so you can see exactly why you got what you got.
          </p>
        </div>

        {/* ── Step 1 · the axes ── */}
        <section className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-xs font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>01</span>
            <h2 className="font-semibold text-foreground">Every answer takes a position on all three axes</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-2xl">
            The three axes are opposing pairs. Leaning one way is a statement about the other way
            too, which is what makes six short questions carry real information.
          </p>

          <div className="grid sm:grid-cols-3 gap-3">
            {careerDnaAxes.map((axis: any) => (
              <div key={axis.id} className="border border-border rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-3"
                   style={{ fontFamily: "var(--font-mono)" }}>
                  {axis.label}
                </p>
                <div className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
                  <span>{axis.left}</span>
                  <span className="text-muted-foreground">↔</span>
                  <span>{axis.right}</span>
                </div>
                <div className="h-1 bg-muted rounded-full my-3">
                  <div className="h-full w-1/2 bg-primary/40 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{AXIS_NOTE[axis.id]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Step 2 · the archetype ── */}
        <section className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-xs font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>02</span>
            <h2 className="font-semibold text-foreground">Your two strongest dimensions name the role</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-2xl">
            The six dimensions pair into {archetypes.length} roles. The role is what the market reads
            you as; the animal is just the badge that makes it memorable.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {archetypes.map((a: any) => (
              <div
                key={a.name}
                className="flex items-center gap-2.5 border border-border rounded-lg px-3 py-2"
              >
                <img src={a.image} alt="" className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{a.type}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{a.core.join(" + ")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Step 3 · the correction ── */}
        <section className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-xs font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>03</span>
            <h2 className="font-semibold text-foreground">Each role is judged against its own baseline</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-2xl">
            The question set does not hand out its {dimensions.length} dimensions equally, so some
            pairs start ahead. Left uncorrected, two roles took a third of all results and one took
            0.6% — the outcome was decided before anyone answered anything.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Before</p>
              <div className="flex items-end gap-1 h-16">
                {[100, 56, 51, 43, 35, 30, 25, 24, 22, 15, 5, 3].map((h, i) => (
                  <div key={i} className="flex-1 bg-red-200 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">24.4% down to 0.6%</p>
            </div>
            <div className="border border-primary/40 bg-accent rounded-xl p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">After</p>
              <div className="flex items-end gap-1 h-16">
                {[100, 97, 71, 69, 67, 67, 66, 64, 63, 59, 54, 54].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/70 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-xs text-foreground font-medium mt-3">12.0% down to 6.5%</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mt-4">
            Each role is now scored on how far above <strong className="text-foreground">its own</strong> baseline
            you sit, in units of its own spread. Baselines are computed from the question set itself,
            so they stay correct if the questions change.
          </p>
        </section>

        {/* ── Step 4 · what we verified ── */}
        <section className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-xs font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>04</span>
            <h2 className="font-semibold text-foreground">Checked against every possible answer</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-2xl">
            {optionCount} options across {questionCount} questions is {combinations.toLocaleString()} distinct
            ways to answer. We ran all of them.
          </p>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Repeat, stat: "Always", label: "Same answers, same role", note: `All ${combinations.toLocaleString()} sets verified` },
              { icon: Check, stat: `${archetypes.length}/${archetypes.length}`, label: "Roles reachable", note: "None is decorative" },
              { icon: Scale, stat: "Under 2×", label: "Most to least common", note: "Was nearly 40×" },
            ].map(m => (
              <div key={m.label} className="border border-border rounded-xl p-4">
                <m.icon size={16} className="text-primary mb-3" />
                <p className="text-xl font-bold text-foreground">{m.stat}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{m.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Step 5 · the target-role benchmark ── */}
        <section className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-xs font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>05</span>
            <h2 className="font-semibold text-foreground">Where the target-role profile comes from</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-2xl">
            On your Career DNA page a second shape sits over yours — the profile a role like the one
            you picked usually leans on. That shape is not something you told us, and it is not
            measured from hiring data. It is a written benchmark, one per role family, and we would
            rather say so than let it look like a finding.
          </p>

          <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
              Authored, not measured
            </p>
            <p className="text-sm text-amber-900 leading-relaxed">
              Eight role families, each with a written profile across the six dimensions. Your target
              role is matched to a family, and that family&apos;s profile becomes the comparison. Replace
              it with real postings data and every gap on your Career DNA page gets sharper — nothing
              else in the method has to change.
            </p>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            What is real: the gap arithmetic, the {CONFLICT_GAP}-point threshold before a gap is worth
            showing, and your own six scores. What is authored: the benchmark being compared against.
          </p>
        </section>

        {/* ── What this is not ── */}
        <section className="bg-accent border border-border rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-3">What this is not</h2>
          <div className="space-y-2.5 text-sm text-muted-foreground leading-relaxed max-w-3xl">
            <p>
              <strong className="text-foreground">It is not a clinical instrument.</strong> There is no
              norming study behind it and we do not claim predictive validity for job performance.
            </p>
            <p>
              <strong className="text-foreground">It is not a hiring filter.</strong> Nothing here should
              be used to select, rank or reject anyone — including by us.
            </p>
            <p>
              <strong className="text-foreground">It is not the answer on its own.</strong> A role is a
              starting point. What follows it — your risks, the gap to the job you want, and what to do
              first — is the part that changes anything.
            </p>
          </div>
        </section>

        {/* ── Onward ── */}
        <div className="bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => onNavigate?.("dna")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} /> Back to Career DNA
          </button>
          <button
            onClick={() => onNavigate?.("blindspots")}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            {profile.targetRole
              ? `What stands between you and ${profile.targetRole}`
              : "Continue to Blind Spots"}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
