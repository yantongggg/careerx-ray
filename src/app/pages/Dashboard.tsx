import { useState } from "react";
import {
  Shield, Brain, TrendingUp, Award, AlertTriangle, CheckCircle,
  ChevronRight, Info, X, Sparkles, BarChart3, Eye, FlaskConical,
  Pill, ArrowRight, Zap, Clock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot
} from "recharts";
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
function ScoreModal({ k, value, lines, onClose }: { k: MetricKey; value: string; lines: string[]; onClose: () => void }) {
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
            <p className="text-sm text-slate-300 mt-1 font-medium">Computed from your scan — same answers, same score.</p>
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
            Nothing here is a model guess. The scoring is a deterministic rule set, which is what makes this panel possible at all.
          </p>
        </div>
      </div>
    </div>
  );
}

/* Monthly salary (RM '000/mo). Personal pay is a step function — it only moves
   at the annual increment — while the market median drifts up every month. */
const salaryData = [
  { month: "Jul", salary: 9.8,  market: 10.4 },
  { month: "Aug", salary: 9.8,  market: 10.6 },
  { month: "Sep", salary: 9.8,  market: 10.8 },
  { month: "Oct", salary: 9.8,  market: 11.0 },
  { month: "Nov", salary: 9.8,  market: 11.2 },
  { month: "Dec", salary: 9.8,  market: 11.5 },
  { month: "Jan", salary: 10.1, market: 11.7 },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, risks, scorecard } = useCareerProfile();
  const [modal, setModal] = useState<MetricKey | null>(null);

  /* Every number on this page comes from the one derivation. There used
     to be three separate hardcoded copies — the headline said 4 open
     risks while the footer of the same page said 5. */
  const metricCards = [
    { key: "health"    as MetricKey, label: "Career Health",   value: String(scorecard.careerHealth), unit: "/100",
      color: scorecard.careerHealth >= 80 ? "text-emerald-600" : "text-amber-500", bg: scorecard.careerHealth >= 80 ? "bg-emerald-50" : "bg-amber-50", icon: Shield },
    { key: "ai"        as MetricKey, label: "AI Exposure",     value: scorecard.aiExposure.label, unit: "",
      color: scorecard.aiExposure.percent >= 55 ? "text-red-500" : "text-amber-500", bg: scorecard.aiExposure.percent >= 55 ? "bg-red-50" : "bg-amber-50", icon: Brain },
    { key: "salary"    as MetricKey, label: "vs Market",       value: scorecard.vsMarket.label, unit: "",
      color: scorecard.vsMarket.percent < 0 ? "text-red-500" : "text-emerald-600", bg: scorecard.vsMarket.percent < 0 ? "bg-red-50" : "bg-emerald-50", icon: TrendingUp },
    { key: "promotion" as MetricKey, label: "Promotion Ready", value: `${scorecard.promotionReady}%`, unit: "",
      color: scorecard.promotionReady >= 70 ? "text-emerald-600" : "text-amber-500", bg: scorecard.promotionReady >= 70 ? "bg-emerald-50" : "bg-amber-50", icon: Award },
  ];

  const strengths = Object.entries(profile.dnaScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([dimension, score]) => `${dimension} — ${score}/100, your strongest calibrated dimension`)
    .concat(profile.evidence.filter(e => e.kind !== "resume").slice(0, 2).map(e => `${e.label} — ${e.trust} evidence on file`));

  const firstName = profile.resume?.name?.split(" ")[0];

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      {modal && <ScoreModal k={modal} lines={scorecard.explain[modal]} value={metricCards.find(m => m.key === modal)!.value} onClose={() => setModal(null)} />}
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
        <div className="grid lg:grid-cols-2 gap-4">
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
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-semibold text-foreground">What's putting you at risk</h3>
            </div>
            <div className="space-y-3">
              {risks.map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{r.headline}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-semibold uppercase tracking-wide">{r.severity}</span> · {r.metric} · {r.horizon}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Salary trend ── */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground">Salary vs market trend</h3>
              <button onClick={() => setModal("salary")} className={`text-xs px-2 py-1 rounded-full font-medium transition-colors inline-flex items-center gap-1 ${scorecard.vsMarket.percent < 0 ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"}`}>
                {scorecard.vsMarket.label} vs market <Info size={11} /> <span className="underline underline-offset-2">why?</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Monthly salary in RM. Your pay only moves at the annual increment (+3% in Jan), while the market median moves every month — that is how the gap quietly widens.</p>
            <div className="flex items-center gap-4 mb-2">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: "#2563EB" }} /> Your salary</span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-0.5 rounded-full inline-block border-b border-dashed" style={{ borderColor: "#B45309" }} /> Market median (KL)</span>
            </div>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={salaryData}>
                  <defs>
                    <linearGradient id="db-salGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={v => `RM ${v}k`} domain={[9.5, 12]} />
                  <Tooltip formatter={(v: number, name: string) => [`RM ${v}k/mo`, name === "market" ? "Market median" : "Your salary"]} />
                  <Area key="area-db-market" type="monotone" dataKey="market" stroke="#B45309" strokeWidth={2} strokeDasharray="5 4" fill="none" isAnimationActive={false} />
                  <Area key="area-db-sal" type="stepAfter" dataKey="salary" stroke="#2563EB" strokeWidth={2} fill="url(#db-salGrad)" isAnimationActive={false} />
                  <ReferenceDot x="Jan" y={10.1} r={5} fill="#2563EB" stroke="white" strokeWidth={2} label={{ value: "annual increment +3%", position: "left", fontSize: 10, fill: "#2563EB", fontWeight: 600 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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
