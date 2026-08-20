import { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Malaysia Validation Blueprint.

   The methodology document, in English and in the app's own language.
   It is the answer to the question a judge asks after the demo — not
   "what does it do" but "how would you know if it were wrong".

   Nothing here is a promise. Where the current build cannot support a
   claim, the page says which claim it is and what would have to be
   true instead. That is the whole reason it exists.
   ──────────────────────────────────────────────────────────────── */

const FLOW = [
  { n: "01", stage: "Collect",   title: "Candidate-authorised data",   body: "Résumé, portfolio, certificates, calibration, goals and constraints. Nothing is taken that was not handed over." },
  { n: "02", stage: "Evidence",  title: "Parse and verify",            body: "Every claim keeps its source, its page, a confidence and a verification status." },
  { n: "03", stage: "Normalize", title: "One vocabulary for work",     body: "Job title to MASCO/ISCO; skills to canonical IDs, with the mapping version stored." },
  { n: "04", stage: "Diagnose",  title: "Risks computed separately",   body: "Task exposure, demand, salary position, skill gap and promotion blocker are five different questions with five different answers." },
  { n: "05", stage: "Decide",    title: "Compare futures",             body: "Stay, move sideways, move up — each with its assumptions and its range shown, not a single number." },
  { n: "06", stage: "Prepare",   title: "Prescription with evidence",  body: "Actions ordered by impact against time and cost, and every one of them provable when done." },
  { n: "07", stage: "Apply",     title: "Applications and outcomes",   body: "Partner submission, rehearsal, outcome event, anonymised feedback back into the loop." },
];

const RISKS = [
  {
    n: "01", name: "AI task exposure",
    formula: "0.65 × ILO task exposure + 0.20 × routine-task share + 0.15 × (1 − AI-complement evidence)",
    note: "Break the person's actual work into tasks first, then map exposure. A fall in posting volume cannot be used here to prove AI caused it — that belongs to demand risk.",
  },
  {
    n: "02", name: "Market demand risk",
    formula: "trend(posting volume 3/6/12m) + regional shortage flag + vacancy-to-candidate pressure",
    note: "Compared by MASCO occupation, state and sector with seasonality accounted for. Where the sample is too small it reads “insufficient sample” rather than guessing.",
  },
  {
    n: "03", name: "Salary position",
    formula: "candidate salary vs P25 / P50 / P75 (role, state, sector, seniority) + confidence band",
    note: "DOSM is the baseline; partner postings and real offers add resolution. It returns a range, never one “correct” wage, and separates base from gross from total compensation.",
  },
  {
    n: "04", name: "Skill freshness gap",
    formula: "Σ demandWeight(skill) × max(0, requiredLevel − provenLevel) × recencyDecay",
    note: "Required skills come from local job descriptions and employer rubrics. A proven skill needs project, work or assessment evidence — a keyword on a CV is not proficiency.",
  },
  {
    n: "05", name: "Promotion blocker",
    formula: "next-role competency importance × evidence gap × confidence",
    note: "Soft skills cannot be inferred from their absence on a CV. Without situational judgement, structured interview or peer evidence, the answer is unknown rather than low.",
  },
  {
    n: "06", name: "Awareness gap",
    formula: "risk severity × evidence confidence × (1 − self-awareness)",
    note: "Only a risk that is high, well-evidenced and underestimated by the person is a blind spot. All three have to hold.",
  },
];

const VALIDATION = [
  { area: "Evidence", measure: "Extraction accuracy", how: "100–200 hand-labelled résumés across Bahasa Malaysia, English and Chinese. Field F1, claim precision, page-citation accuracy." },
  { area: "Skill",    measure: "Employer agreement",  how: "Hiring managers re-check the skills and levels read out of job descriptions. Compare extractor against human." },
  { area: "Salary",   measure: "Coverage and error",  how: "Predicted bands against held-out real offers. Band coverage, not only mean error." },
  { area: "Risk",     measure: "Calibration",         how: "Predicted intervals against 6–12 month outcomes, reporting false alarms and differences between subgroups." },
  { area: "Action",   measure: "Outcome uplift",      how: "Evidence gained, interview rate, offer rate and salary change after a treatment plan, against a matched control." },
];

const QA = [
  {
    q: "Where does your data come from, and do you have permission?",
    a: "Official baselines: DOSM, ILMIA, MASCO, TalentCorp MyCOL. Live job descriptions and hiring outcomes come only from Talentbank or employer partnerships, or approved feeds. Third-party platforms are not scraped by default.",
  },
  {
    q: "Why not just use ChatGPT?",
    a: "A model can write advice. It cannot guarantee a salary snapshot, evidence provenance, a score version, or an employer outcome loop. What is here is the structured graph, Malaysian data, repeatable engines and an audit trail behind each number.",
  },
  {
    q: "Is Career DNA scientifically grounded?",
    a: "No, and the method page says so. Six questions is a product hypothesis, not a validated instrument. Validating it means construct mapping against MyNext, O*NET and NOSS, 24 or more situational-judgement items, a Malaysian pilot, and reliability and fairness testing — and even then it stays exploratory rather than a gate.",
  },
  {
    q: "How do you know the AI risk figure is real?",
    a: "We call it task exposure, not job-loss probability, because those are different claims. It uses the ILO task methodology against the person's actual task mix. Falling posting volume is counted separately as demand risk. Calibration against employer workflow change and real employment outcomes comes next.",
  },
  {
    q: "Is the salary data granular enough?",
    a: "DOSM is a reliable baseline but does not resolve to job title and seniority. The current build returns wide ranges. Partner job descriptions, real offers and market references narrow them. Without enough sample we do not show a precise figure at all.",
  },
  {
    q: "Can you scrape LinkedIn or social platforms?",
    a: "Not by assumption. The LinkedIn API is gated by approval, consent and permitted use. What a portfolio can use today is what the candidate submits themselves — an export, a screenshot, a URL — or what an official OAuth route provides.",
  },
  {
    q: "What if someone uploads a fake certificate?",
    a: "Status is shown in layers: self-claimed, pending, programme-accredited, registry-confirmed, issuer-confirmed. MQA verifies programme accreditation only; an individual qualification needs the issuer, the institution or an authorised checker.",
  },
  {
    q: "If the model is wrong, who is accountable?",
    a: "This is decision support, not a hiring or career decision. The user can see the evidence, correct their data and ask for human review. Every score keeps its version and its audit trail.",
  },
  {
    q: "How do you avoid race, gender and university bias?",
    a: "Protected attributes are never scoring inputs. They are used only inside a consented evaluation set, to measure whether error differs between subgroups. Institution prestige, language quality and unequal access to portfolio-building are monitored as proxies.",
  },
];

const STOP_CONDITIONS = [
  "The sample is too small to support a number.",
  "The source is too old to describe the current market.",
  "Confidence falls below the publishing threshold.",
  "Subgroup error exceeds its limit.",
  "There is no evidence that can be shown alongside the score.",
];

function Section({ n, title, lede, children }: { n: string; title: string; lede?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A7038]">{n}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      {lede && <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{lede}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function ValidationBlueprint({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [openQa, setOpenQa] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="mx-auto max-w-[900px] p-6 pb-16 lg:p-8">

        <button
          onClick={() => onNavigate?.("profile")}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back to profile
        </button>

        {/* Masthead */}
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A7038]">
          Malaysia validation blueprint
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground">
          Prove it is trustworthy<br />before predicting anything.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          The MVP does not need to know the whole world. It needs to connect evidence,
          MASCO occupations, the local labour market and hiring outcomes into one
          verifiable loop — in Malaysia, first.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-800">What we are validating now</p>
            <p className="mt-2 text-sm leading-relaxed text-emerald-900">
              Whether documents parse correctly. Whether a risk can be explained.
              Whether a recommendation is actionable. Whether one employer outcome can
              safely improve the signal for everyone else.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
            <p className="text-sm font-bold uppercase tracking-wider text-amber-800">What we are not claiming</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              That anyone will definitely succeed. That we know every company's real
              salaries. That we read LinkedIn or JobStreet in real time. That six
              questions are a scientific personality assessment.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Malaysia first", "MASCO · DOSM · ILMIA · MyCOL"],
            ["Evidence first", "Missing is unknown, not weak"],
            ["Human accountable", "AI explains. It never decides."],
          ].map(([t, s]) => (
            <div key={t} className="rounded-xl border border-border bg-white p-4">
              <p className="text-sm font-bold text-foreground">{t}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-12">

          <Section
            n="01 · Complete flow"
            title="From input to outcome, every step answerable"
            lede="What a reviewer actually wants is not a count of agents. It is: where did the input come from, how was it computed, what happens when it is wrong, and who is accountable."
          >
            <div className="space-y-2.5">
              {FLOW.map(f => (
                <div key={f.n} className="flex gap-4 rounded-xl border border-border bg-white p-4">
                  <span className="w-8 flex-shrink-0 font-mono text-sm font-bold text-[#8A7038]">{f.n}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{f.stage}</p>
                    <p className="mt-0.5 text-base font-semibold text-foreground">{f.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
              <p className="text-sm font-bold text-amber-900">The boundary that matters most</p>
              <p className="mt-1.5 text-sm leading-relaxed text-amber-900">
                A fall in the number of postings is a demand signal. It does not mean AI has
                replaced the occupation. Task exposure is computed separately, at task level,
                and written down as exposure or transformation risk — never as a probability
                of losing a job.
              </p>
            </div>
          </Section>

          <Section
            n="02 · Diagnose"
            title="One score is not enough. Risks are computed apart."
            lede="These are implementable, explainable hypothesis formulas. The weights have to be calibrated against a Malaysian pilot — they are not being presented as established fact."
          >
            <div className="space-y-3">
              {RISKS.map(r => (
                <div key={r.n} className="rounded-xl border border-border bg-white p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm font-bold text-[#8A7038]">{r.n}</span>
                    <p className="text-base font-bold text-foreground">{r.name}</p>
                  </div>
                  <p className="mt-3 overflow-x-auto rounded-lg bg-muted px-3 py-2.5 font-mono text-sm leading-relaxed text-foreground">
                    {r.formula}
                  </p>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{r.note}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section
            n="03 · Validation plan"
            title="Validation is not asking users whether they liked it"
            lede="Every engine needs its own ground truth, a baseline, human review and an error metric."
          >
            <div className="overflow-x-auto rounded-xl border border-border bg-white">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Engine</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Measure</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">How</th>
                  </tr>
                </thead>
                <tbody>
                  {VALIDATION.map(v => (
                    <tr key={v.area} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-semibold text-foreground">{v.area}</td>
                      <td className="px-4 py-3 text-foreground">{v.measure}</td>
                      <td className="px-4 py-3 leading-relaxed text-muted-foreground">{v.how}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-5">
                <p className="text-base font-semibold text-foreground">Pilot cohort</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Three role families first — data and AI, software, marketing and design.
                  Employer-validated job descriptions, résumés and outcomes for each,
                  rather than trying to cover every Malaysian job at once.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white p-5">
                <p className="text-base font-semibold text-foreground">Disagreement becomes data</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  When HR, a career coach and the engine disagree, the reason is recorded and
                  the taxonomy or rubric is updated. The prompt is not quietly edited until
                  the answer looks better.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-white p-5">
              <p className="text-base font-semibold text-foreground">When a score must not be published</p>
              <ul className="mt-3 space-y-1.5">
                {STOP_CONDITIONS.map(c => (
                  <li key={c} className="text-sm leading-relaxed text-muted-foreground">· {c}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-medium text-foreground">
                In any of these cases the product shows &ldquo;needs more information&rdquo; instead of a number.
              </p>
            </div>
          </Section>

          <Section
            n="04 · Questions we expect"
            title="What a reviewer asks is not about the UI"
            lede="Each answer follows the same shape: what can be proven today, what the limit is, and how it gets validated next."
          >
            <div className="space-y-2">
              {QA.map((item, i) => {
                const open = openQa === i;
                return (
                  <div key={item.q} className={`rounded-xl border bg-white transition-colors ${open ? "border-foreground/20" : "border-border"}`}>
                    <button
                      onClick={() => setOpenQa(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left"
                    >
                      <span className="flex-1 text-base font-semibold text-foreground">{item.q}</span>
                      <ChevronDown size={16} className={`flex-shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <p className="mt-12 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
          Sources: Department of Statistics Malaysia, ILMIA, MASCO occupational
          classification, TalentCorp MyNext and MyCOL, ILO task-level exposure research,
          O*NET work-style research. Employer job descriptions and hiring outcomes come
          from partnerships, not from scraping.
        </p>
      </div>
    </div>
  );
}
