import { ArrowLeft, X } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   30 / 90 / 120 days, gated.

   The answer to "what comes next" that is not "more AI agents". Three
   phases, each with what has to be collected and what has to be true
   before the next one starts — and what happens when it is not true,
   which is the part most roadmaps leave out.

   Targets are proposed baselines, not industry standards, and the page
   says so at the bottom rather than letting them read as established.
   ──────────────────────────────────────────────────────────────── */

interface Phase {
  window: string;
  gate: string;
  title: string;
  lede: string;
  work: string[];
  collect: { label: string; value: string }[];
  thresholds: { label: string; value: string }[];
  rollback: string;
  accent: string;
  tint: string;
}

const PHASES: Phase[] = [
  {
    window: "Day 0–30",
    gate: "Gate 1",
    title: "Validate the engines",
    lede: "No new features. Only evidence. What comes out is a test suite that can be run again.",
    work: [
      "150 hand-labelled résumés — 100 for tuning, 50 held out and never used for it",
      "Sources: consented Talentbank samples plus campus recruitment, consent recorded per résumé",
      "A Malaysian source registry: every source with its licence, its age and its sample size",
      "Eval harness plus a model and prompt registry, so any past score can be replayed",
    ],
    collect: [
      { label: "Labelled résumés", value: "150" },
      { label: "Labelled claims", value: "~2,200" },
      { label: "Official sources", value: "6" },
    ],
    thresholds: [
      { label: "Citation accuracy", value: "≥99%" },
      { label: "Field F1", value: "≥.85" },
      { label: "Claim precision", value: "≥.90" },
    ],
    rollback: "Citation accuracy below 99% sends us back to extraction. Not one score is published in this phase.",
    accent: "#16284B",
    tint: "rgba(22,40,75,0.05)",
  },
  {
    window: "Day 31–90",
    gate: "Gate 2",
    title: "Partner beta",
    lede: "Real employers, and the loop turns for the first time. Scope locked to three role families.",
    work: [
      "Talentbank employer feed plus five employers signed for the trial",
      "Job descriptions and outcomes both from approved feeds — nothing scraped",
      "Reason codes finalised, 8 to 12 of them, plus certificate verification",
      "Queue autoscaling and a dead-letter queue: a failure resumes from the last good stage",
    ],
    collect: [
      { label: "Signed employers", value: "≥5" },
      { label: "Real job descriptions", value: "≥200" },
      { label: "Candidates", value: "≥300" },
      { label: "Outcomes", value: "≥150" },
    ],
    thresholds: [
      { label: "Employers who use it twice", value: "3 of 5" },
      { label: "Certificate parsing", value: "≥90%" },
      { label: "Salary band coverage", value: "≥80%" },
    ],
    rollback: "Under 50 outcomes and no aggregate is published — the beta extends instead. The cohort threshold is never lowered to manufacture signal.",
    accent: "#8A7038",
    tint: "rgba(138,112,56,0.07)",
  },
  {
    window: "Day 91–120",
    gate: "Gate 3",
    title: "Calibrate and harden",
    lede: "The first time real outcomes are used to look back at the scores, and the system is made to hold.",
    work: [
      "A first calibration reading from the outcomes collected — a reading, not a conclusion",
      "Drift monitoring, and a de-identified warehouse with zero PII columns",
      "A real disaster-recovery rehearsal in ap-southeast-5, not a documented one",
    ],
    collect: [
      { label: "People with a follow-up result", value: "≥150" },
      { label: "Cumulative outcomes", value: "≥250" },
    ],
    thresholds: [
      { label: "Calibration error", value: "≤10pp" },
      { label: "DR rehearsals run", value: "≥1" },
      { label: "PII columns", value: "0" },
    ],
    rollback: "Error above 15pp pulls the numeric scores entirely. What stays is a qualitative range and the evidence list behind it.",
    accent: "#115E50",
    tint: "rgba(17,94,80,0.06)",
  },
];

const NOT_DOING = [
  "Add more AI agents",
  "Cover every occupation in Malaysia",
  "Scrape LinkedIn or JobStreet",
  "Split into microservices",
  "Claim Career DNA is validated",
  "Lower a threshold to get signal",
];

export function NextPlan({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="mx-auto max-w-[980px] p-6 pb-16 lg:p-8">

        <button
          onClick={() => onNavigate?.("profile")}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back to profile
        </button>

        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A7038]">
          Next plan · 30 / 90 / 120 days
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground">
          What comes next is not<br />more AI agents.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          It is turning one chain — evidence to score to explanation to outcome — into
          something that can be verified. Three phases. Each one has to pass its gate
          before the next begins.
        </p>

        <div className="mt-10 space-y-6">
          {PHASES.map(p => (
            <section key={p.window} className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="px-6 py-5" style={{ background: p.tint }}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold" style={{ color: p.accent }}>{p.window}</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-xs font-bold text-white"
                    style={{ background: p.accent }}
                  >
                    {p.gate}
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{p.title}</h2>
                <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-muted-foreground">{p.lede}</p>
              </div>

              <div className="border-t border-border px-6 py-5">
                <ul className="space-y-2">
                  {p.work.map(w => (
                    <li key={w} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: p.accent }} />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-0 border-t border-border md:grid-cols-2 md:divide-x md:divide-border">
                <div className="px-6 py-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Collect · how much
                  </p>
                  <div className="mt-3 space-y-2">
                    {p.collect.map(c => (
                      <div key={c.label} className="flex items-baseline justify-between gap-4">
                        <span className="text-sm text-muted-foreground">{c.label}</span>
                        <span className="font-mono text-base font-bold tabular-nums text-foreground">{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border px-6 py-5 md:border-t-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Gate · what has to be true
                  </p>
                  <div className="mt-3 space-y-2">
                    {p.thresholds.map(t => (
                      <div key={t.label} className="flex items-baseline justify-between gap-4">
                        <span className="text-sm text-muted-foreground">{t.label}</span>
                        <span className="font-mono text-base font-bold tabular-nums" style={{ color: p.accent }}>{t.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-amber-50/50 px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">If it does not pass</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-900">{p.rollback}</p>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-border bg-white p-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            What these four months deliberately do not include
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Asked about any of these, this is the answer.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {NOT_DOING.map(n => (
              <div key={n} className="flex items-center gap-2.5 rounded-lg border border-border px-4 py-3">
                <X size={14} className="flex-shrink-0 text-red-500" />
                <span className="text-sm text-foreground">{n}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-white p-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Two things stated plainly</h2>
          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              <span className="font-mono text-sm font-bold text-[#8A7038]">01</span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The target numbers above are <strong className="text-foreground">proposed baselines</strong>.
                They need the team to confirm them before work starts and to commit them to
                the repository. They are not industry standards and we are not presenting
                them as such.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-mono text-sm font-bold text-[#8A7038]">02</span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Day 120 produces <strong className="text-foreground">three months of calibration readings</strong>,
                not a calibrated system. Doing it properly needs 6 to 12 months of
                outcomes. That is the round after this one.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 border-t border-border pt-6 font-mono text-xs leading-relaxed text-muted-foreground">
          Plan · 30 / 90 / 120 days · gated · CareerX-Ray Malaysia validation ·
          time axis linear in days · targets are proposed baselines
        </p>
      </div>
    </div>
  );
}
