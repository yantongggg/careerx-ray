import { useState } from "react";
import {
  Shield, Brain, TrendingUp, Award, AlertTriangle, CheckCircle,
  Info, X, Sparkles, ArrowRight, Zap, Clock
} from "lucide-react";
import { useCareerProfile } from "../state/careerProfile";
import { NextStep } from "../state/stages";

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
  const { profile, risks, riskChecks, salaryBenchmark: salary, scorecard } = useCareerProfile();
  const [modal, setModal] = useState<MetricKey | null>(null);

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

  const strengths = Object.entries(profile.dnaScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([dimension, score]) => `${dimension} — ${score}/100, your strongest calibrated dimension`)
    .concat(profile.evidence.filter(e => e.kind !== "resume").slice(0, 2).map(e => `${e.label} — ${e.trust} evidence on file`));

  const firstName = profile.resume?.name?.split(" ")[0];
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
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Career X-Ray Result</span>
                {profile.scannedAt && (
                  <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">Scanned {profile.scannedAt}</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white">
                {firstName ? `${firstName}, your` : "Your"} career has {risks.length} open risk{risks.length === 1 ? "" : "s"}.
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 max-w-xl leading-relaxed">
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
                <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                <button
                  onClick={() => setModal(m.key)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center"
                  title="Why this score?"
                >
                  <Info size={12} className="text-muted-foreground" />
                </button>
              </div>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}<span className="text-base font-normal text-muted-foreground">{m.unit}</span></p>
              <button
                onClick={() => setModal(m.key)}
                className="mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:underline flex items-center gap-1"
              >
                Why this? <ArrowRight size={10} />
              </button>
            </div>
          ))}
        </div>

        {/* ── Strengths & Risks narrative ── */}
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-emerald-500" />
              <h3 className="font-semibold text-foreground">What's working for you</h3>
            </div>
            <div className="space-y-3">
              {strengths.length ? strengths.map(s => (
                <div key={s} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{s}</p>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Add evidence on a re-scan and your confirmed strengths will show up here.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <div>
                  <h3 className="font-semibold text-foreground">Open risk categories</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Up to four categories. Only breached thresholds appear.</p>
                </div>
              </div>
              <span className="text-xs font-semibold bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-md whitespace-nowrap">{risks.length} open</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {riskChecks.map(check => {
                const tone = check.status === "open"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : check.status === "clear"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-muted border-border text-muted-foreground";
                return (
                  <div key={check.id} className={`border rounded-lg p-2.5 ${tone}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold">{check.label}</p>
                      <span className="text-[9px] uppercase font-bold whitespace-nowrap">{check.status.replace("-", " ")}</span>
                    </div>
                    <p className="text-[10px] mt-1 leading-snug opacity-80">{check.summary}</p>
                  </div>
                );
              })}
            </div>
            <div className="space-y-4">
              {risks.map(r => (
                <div key={r.id} className="p-4 bg-red-50/60 border border-red-100 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">{r.category}</p>
                      <p className="text-sm font-medium text-foreground mt-1">{r.headline}</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-red-700 border border-red-200 bg-white px-2 py-1 rounded-md">{r.severity}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                    {[
                      ["Your current", r.comparison.current],
                      ["Benchmark", r.comparison.benchmark],
                      ["Shortfall", r.comparison.shortfall],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-white border border-red-100 rounded-lg p-2.5 min-w-0">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-xs font-semibold text-foreground mt-1 leading-snug break-words">{value}</p>
                      </div>
                    ))}
                  </div>
                  <details className="mt-3 group">
                    <summary className="cursor-pointer list-none text-xs font-semibold text-primary flex items-center gap-1.5">
                      <Info size={12} /> How this was calculated
                    </summary>
                    <div className="mt-2 bg-white border border-red-100 rounded-lg p-3 space-y-2">
                      {r.calculation.map(line => (
                        <p key={line} className="text-xs text-muted-foreground leading-relaxed">{line}</p>
                      ))}
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-foreground"><span className="font-semibold">What closes it:</span> {r.fix}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Clock size={11} /> Estimated {r.timeToFix}</p>
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Salary benchmark ── */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground">Salary vs market benchmark</h3>
              <button onClick={() => setModal("salary")} className={`text-xs px-2 py-1 rounded-full font-medium transition-colors inline-flex items-center gap-1 ${!scorecard.vsMarket.conclusive ? "bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100" : scorecard.vsMarket.percent < 0 ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"}`}>
                {scorecard.vsMarket.label} vs market <Info size={11} /> <span className="underline underline-offset-2">why?</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Closed salary and experience ranges use their midpoint. Open-ended salary ranges use the stated boundary, and only produce a gap when that boundary proves which side of the benchmark you are on.</p>
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
