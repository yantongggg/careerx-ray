import { useState } from "react";
import {
  Shield, Brain, TrendingUp, Award, AlertTriangle, CheckCircle, ChevronDown,
  Info, X, Sparkles, ArrowRight, Zap, Clock
} from "lucide-react";
import { useCareerProfile } from "../state/careerProfile";
import { NextStep } from "../state/stages";

/* Every risk ends in something the user can do, not just a number they
   are told to feel bad about. */
const RISK_ACTION: Record<string, { label: string; page: string }> = {
  readiness:  { label: "Add evidence",   page: "evidence" },
  automation: { label: "See the plan",   page: "prescription" },
  salary:     { label: "Compare paths",  page: "decisionlab" },
  leadership: { label: "See the plan",   page: "prescription" },
};

// ─── Score explanation modals ───────────────────────────────────────────────

type MetricKey = "health" | "ai" | "salary" | "promotion";

const METRIC_TITLE: Record<MetricKey, string> = {
  health: "Career Health Score",
  ai: "AI Exposure",
  salary: "Position vs Market",
  promotion: "Promotion Readiness",
};

/* The modal shows the derivation, not a second hand-written copy of the
   number. The two used to be maintained separately and drifted apart. */
function ScoreModal({ k, value, summary, lines, onClose }: { k: MetricKey; value: string; summary: string; lines: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <p className="text-xs text-muted-foreground">Why this score?</p>
            <h2 className="font-bold text-foreground">{METRIC_TITLE[k]}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X size={15} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-slate-950 text-white rounded-xl p-4">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-slate-300 mt-1 font-medium">{summary}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">How this was worked out</p>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl text-xs bg-muted border border-border">
                  <Info size={12} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-foreground leading-relaxed">{line}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This panel uses deterministic rules and reports missing or inconclusive inputs instead of guessing.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, risks, riskChecks, salaryBenchmark: salary, scorecard, displayName } = useCareerProfile();
  const [modal, setModal] = useState<MetricKey | null>(null);
  /* One category open at a time — the whole point of the accordion is
     that the page is quiet until you ask it something. */
  const [expanded, setExpanded] = useState<string | null>(null);

  /* Every number on this page comes from the one derivation. There used
     to be three separate hardcoded copies — the headline said 4 open
     risks while the footer of the same page said 5. */
  const metricCards = [
    { key: "health"    as MetricKey, label: "Career Health",   value: String(scorecard.careerHealth), unit: "/100",
      summary: "Computed from your scan — same answers, same score.",
      color: scorecard.careerHealth >= 80 ? "text-emerald-600" : "text-amber-500", bg: scorecard.careerHealth >= 80 ? "bg-emerald-50" : "bg-amber-50", icon: Shield },
    { key: "ai"        as MetricKey, label: "AI Exposure",     value: scorecard.aiExposure.label, unit: "",
      summary: "Computed from your scan — same answers, same score.",
      color: scorecard.aiExposure.percent >= 55 ? "text-red-500" : "text-amber-500", bg: scorecard.aiExposure.percent >= 55 ? "bg-red-50" : "bg-amber-50", icon: Brain },
    { key: "salary"    as MetricKey, label: "vs Market",       value: scorecard.vsMarket.label, unit: "",
      summary: scorecard.vsMarket.label === "No data"
        ? "Not calculated — no salary was provided in your scan."
        : scorecard.vsMarket.label === "Inconclusive"
          ? "Calculated, but your open-ended range does not prove which side of the benchmark you are on."
          : "Computed from your scan — same answers, same score.",
      color: !scorecard.vsMarket.conclusive ? "text-amber-600" : scorecard.vsMarket.percent < 0 ? "text-red-500" : "text-emerald-600", bg: !scorecard.vsMarket.conclusive ? "bg-amber-50" : scorecard.vsMarket.percent < 0 ? "bg-red-50" : "bg-emerald-50", icon: TrendingUp },
    { key: "promotion" as MetricKey, label: "Promotion Ready", value: `${scorecard.promotionReady}%`, unit: "",
      summary: "Computed from your scan — same answers, same score.",
      color: scorecard.promotionReady >= 70 ? "text-emerald-600" : "text-amber-500", bg: scorecard.promotionReady >= 70 ? "bg-emerald-50" : "bg-amber-50", icon: Award },
  ];

  /* Two strongest dimensions as measured values, so the left column
     reads as an indicator rather than a sentence with a number in it. */
  const topDimensions = Object.entries(profile.dnaScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([dimension, score]) => ({ dimension, score: Math.round(score) }));

  const verifiedEvidence = profile.evidence.filter(e => e.kind !== "resume").slice(0, 2);

  /* One row per category, always four. Open ones carry their full risk
     record; the rest carry only their status, which is the honest
     answer when a threshold was not breached or could not be measured. */
  const attentionRows = riskChecks.map(check => ({
    check,
    risk: risks.find(r => r.id === check.id),
  }));
  const openCount = attentionRows.filter(r => r.risk).length;

  const firstName = displayName === "Your name" ? "" : displayName.split(" ")[0];
  const activeMetric = modal ? metricCards.find(m => m.key === modal) : undefined;

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      {modal && activeMetric && (
        <ScoreModal k={modal} lines={scorecard.explain[modal]} value={activeMetric.value} summary={activeMetric.summary} onClose={() => setModal(null)} />
      )}
      <div className="p-6 lg:p-8 max-w-[1300px] mx-auto space-y-6">

        {/* ── MRI Header ── */}
        <div className="bg-slate-950 text-white rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Career X-Ray Result</span>
                {profile.scannedAt && (
                  <span className="text-sm bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full">Scanned {profile.scannedAt}</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {firstName ? `${firstName}, your` : "Your"} career has {risks.length} open risk{risks.length === 1 ? "" : "s"}.
              </h1>
              <p className="text-slate-300 text-base mt-2.5 max-w-2xl leading-relaxed">
                Your Career Health Score is <strong className="text-white">{scorecard.careerHealth}/100</strong>
                {scorecard.careerHealth < 80
                  ? " — below the threshold that typically leads to smooth promotion and market salary."
                  : " — comfortably in the range that supports promotion and market pay."}{" "}
                Here&apos;s what we found, why it matters, and what to do about it.
              </p>
            </div>
          </div>
        </div>

        {/* ── Score cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map(m => (
            <div key={m.key} className="bg-white border border-border rounded-xl p-5 shadow-sm group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{m.label}</span>
                <button
                  onClick={() => setModal(m.key)}
                  className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center"
                  title="Why this score?"
                >
                  <Info size={14} className="text-muted-foreground" />
                </button>
              </div>
              <p className={`text-4xl font-bold tabular-nums ${m.color}`}>{m.value}<span className="text-lg font-normal text-muted-foreground">{m.unit}</span></p>
              <button
                onClick={() => setModal(m.key)}
                className="mt-2.5 text-sm text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Why this? <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* ── Strengths & what needs attention ── */}
        {/* What's working — one wide band, read left to right */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            <div className="lg:w-56 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={18} className="text-emerald-600" />
                <h3 className="text-lg font-semibold text-foreground">What&apos;s working for you</h3>
              </div>
              <p className="text-sm text-muted-foreground">Your strongest areas, from your calibration.</p>
            </div>

            {topDimensions.length ? (
              <div className="flex-1 grid sm:grid-cols-2 gap-6 lg:gap-10 min-w-0">
                {topDimensions.map((d, i) => (
                  <div key={d.dimension} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-foreground truncate">{d.dimension}</p>
                        <p className="text-sm text-muted-foreground">
                          {i === 0 ? "Your strongest area" : "Your second strongest"}
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-emerald-700 tabular-nums flex-shrink-0">
                        {d.score}<span className="text-base font-normal text-muted-foreground">/100</span>
                      </p>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${d.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="flex-1 text-sm text-muted-foreground">Finish your scan and your strongest areas appear here.</p>
            )}

            {verifiedEvidence.length > 0 && (
              <div className="lg:w-64 flex-shrink-0 lg:border-l lg:border-border lg:pl-8">
                <p className="text-sm font-semibold text-foreground mb-2">Backed by evidence</p>
                <div className="space-y-1.5">
                  {verifiedEvidence.map(e => (
                    <div key={e.id} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <p className="text-sm text-foreground leading-snug">
                        {e.label} <span className="text-muted-foreground">· {e.trust}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Four categories, full width, one expanded at a time */}
        <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-lg font-semibold text-foreground">Areas that need attention</h3>
              <span className="text-sm font-semibold text-foreground bg-muted border border-border px-2.5 py-1 rounded-md whitespace-nowrap">
                {openCount} of 4
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Tap one to see how it was worked out.</p>

            <div className="space-y-2.5">
              {attentionRows.map(({ check, risk }) => {
                const isOpen = expanded === check.id;
                const priority = risk
                  ? risk.severity === "critical" ? "High" : risk.severity === "high" ? "High" : risk.severity === "medium" ? "Medium" : "Low"
                  : null;

                /* Red is reserved for the genuinely urgent. Everything
                   else is neutral or amber, so the page does not read as
                   "you are failing at everything". */
                const badge = !risk
                  ? "bg-muted text-muted-foreground border-border"
                  : risk.severity === "critical"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-800 border-amber-200";

                return (
                  <div key={check.id} className={`border rounded-xl transition-colors ${isOpen ? "border-foreground/20 bg-muted/40" : "border-border bg-white hover:border-foreground/15"}`}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : check.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        !risk ? "bg-emerald-500" : risk.severity === "critical" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-foreground leading-snug">
                          {risk ? risk.category : check.label}
                        </p>
                        <p className="text-sm text-muted-foreground leading-snug mt-0.5">
                          {risk ? risk.comparison.shortfall : check.summary}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold border px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0 ${badge}`}>
                        {priority ?? (check.status === "clear" ? "Clear" : check.status === "not-measured" ? "No data" : "N/A")}
                      </span>
                      <ChevronDown size={16} className={`text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/70">
                        {risk ? (
                          <>
                            <p className="text-sm text-foreground leading-relaxed mt-3">{risk.headline}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                              {[
                                ["Yours", risk.comparison.current],
                                ["Typical", risk.comparison.benchmark],
                                ["Gap", risk.comparison.shortfall],
                              ].map(([label, value]) => (
                                <div key={label} className="bg-white border border-border rounded-lg p-3 min-w-0">
                                  <p className="text-xs text-muted-foreground">{label}</p>
                                  <p className="text-sm font-semibold text-foreground mt-1 leading-snug break-words">{value}</p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 bg-white border border-border rounded-lg p-3.5">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">How this was worked out</p>
                              {risk.calculation.map(line => (
                                <p key={line} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
                              ))}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm text-foreground leading-snug">
                                  <span className="font-semibold">What closes it:</span> {risk.fix}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Clock size={12} /> Around {risk.timeToFix}
                                </p>
                              </div>
                              <button
                                onClick={() => onNavigate?.(RISK_ACTION[risk.id]?.page ?? "prescription")}
                                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                              >
                                {RISK_ACTION[risk.id]?.label ?? "See the plan"} <ArrowRight size={14} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground leading-relaxed mt-3">{check.summary}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
        </div>

        {/* ── Salary benchmark ── */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-foreground">Salary vs market benchmark</h3>
              <button onClick={() => setModal("salary")} className={`text-xs px-2 py-1 rounded-full font-medium transition-colors inline-flex items-center gap-1 ${!scorecard.vsMarket.conclusive ? "bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100" : scorecard.vsMarket.percent < 0 ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"}`}>
                {scorecard.vsMarket.label} vs market <Info size={11} /> <span className="underline underline-offset-2">why?</span>
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Closed salary and experience ranges use their midpoint. Open-ended salary ranges use the stated boundary, and only produce a gap when that boundary proves which side of the benchmark you are on.</p>
            {salary.current === null ? (
              <div className="border border-dashed border-border rounded-xl p-5 text-sm text-muted-foreground">No salary was provided, so we did not calculate a salary gap.</div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">Your stated {salary.basis.replace("-", " ")}</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">{salary.basis === "upper-bound" ? "<" : salary.basis === "lower-bound" ? "≥" : ""}RM {salary.current.toLocaleString()}<span className="text-xs font-normal">/mo</span></p>
                </div>
                <div className="bg-muted border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">Market median</p>
                  <p className="text-xl font-bold text-foreground mt-1">RM {salary.median.toLocaleString()}<span className="text-xs font-normal">/mo</span></p>
                  <p className="text-[10px] text-muted-foreground mt-1 capitalize">{salary.family} · experience {salary.experienceBasis.replace("-", " ")}</p>
                </div>
                <div className={`${!salary.conclusive ? "bg-amber-50 border-amber-100" : salary.gap! > 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"} border rounded-xl p-4`}>
                  <p className="text-xs text-muted-foreground">{!salary.conclusive ? "Difference" : salary.basis === "midpoint" || salary.basis === "exact" ? "Exact difference" : "Minimum difference"}</p>
                  {!salary.conclusive ? (
                    <><p className="text-base font-bold text-amber-700 mt-1">Cannot determine</p><p className="text-[10px] text-muted-foreground mt-1">Open-ended range crosses the median</p></>
                  ) : (
                    <><p className={`text-xl font-bold mt-1 ${salary.gap! > 0 ? "text-red-600" : "text-emerald-700"}`}>
                      {salary.gap === 0 ? "RM 0" : <>{salary.gap! > 0 ? "−" : "+"}RM {Math.abs(salary.gap!).toLocaleString()}</>}<span className="text-xs font-normal">/mo</span>
                    </p><p className="text-[10px] text-muted-foreground mt-1">{salary.gap === 0 ? "At market median" : `${Math.abs(salary.percent!)}% ${salary.gap! > 0 ? "below" : "above"} median`}</p></>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              {scorecard.explain.salary[0]}
            </p>
          </div>
        </div>

        {/* ── How AI reached these conclusions ── */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">What we used to reach these conclusions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Only what you actually gave us. Nothing here is assumed.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { source: "Career Calibration", items: `${Object.keys(profile.calibrationAnswers).length} of 6 scenario answers` },
              { source: "Resume", items: profile.resume
                  ? `${profile.resume.fileName} · ${profile.resume.skills.length} skills, ${profile.resume.employers.length} employers`
                  : "Not provided" },
              { source: "Evidence added", items: profile.evidence.length
                  ? profile.evidence.map(e => e.label).slice(0, 3).join(", ")
                  : "None yet" },
              { source: "Market reference", items: "Authored Malaysian salary and demand datasets" },
            ].map(e => (
              <div key={e.source} className="bg-muted rounded-xl p-3.5">
                <p className="text-xs font-semibold text-foreground mb-1">{e.source}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{e.items}</p>
              </div>
            ))}
          </div>
        </div>

        <NextStep currentPage="dashboard" onNavigate={onNavigate} />

      </div>
    </div>
  );
}
