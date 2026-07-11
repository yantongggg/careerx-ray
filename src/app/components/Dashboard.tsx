import { useState } from "react";
import {
  Shield, Brain, TrendingUp, Award, AlertTriangle, CheckCircle,
  ChevronRight, Info, X, Sparkles, BarChart3, Eye, FlaskConical,
  Pill, ArrowRight, Zap, Clock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

// ─── Score explanation modals ───────────────────────────────────────────────

const scoreExplanations = {
  health: {
    title: "Career Health Score",
    value: "74", unit: "/100",
    verdict: "Your career is at moderate risk.",
    summary: "Three structural problems are holding your score below 80 — and without action, they compound. The good news: all three are fixable within 90 days.",
    confidence: 91,
    evidence: [
      { label: "Salary 14% below peer median (RM 10.1k/mo vs RM 11.7k/mo)",         positive: false },
      { label: "No cloud certification — 73% of target roles require one", positive: false },
      { label: "Core Python skills untouched for 14 months",             positive: false },
      { label: "Strong FinTech domain expertise — top 20%",              positive: true  },
      { label: "Communication & presentation — 88th percentile",         positive: true  },
      { label: "Career velocity: 0.4 promotions/yr vs 0.6 peer avg",     positive: false },
    ],
    impact: "A score below 80 correlates with 2× higher pass-over risk at your next review cycle and a 34% higher probability of stagnation by year 3.",
  },
  ai: {
    title: "AI Exposure Risk",
    value: "High", unit: "",
    verdict: "62% of your daily work is automatable within 24 months.",
    summary: "The tasks that define your current role — data pulling, report generation, SQL query writing — are the exact tasks being automated first. This isn't a future risk. It's happening now.",
    confidence: 86,
    evidence: [
      { label: "Report generation (~8 hrs/wk) — 95% automatable",  positive: false },
      { label: "SQL queries & dashboards (~6 hrs/wk) — 82% auto.", positive: false },
      { label: "Statistical modeling (~3 hrs/wk) — 32% auto.",     positive: true  },
      { label: "Stakeholder communication (~5 hrs/wk) — 15% auto.",positive: true  },
    ],
    impact: "Roles with >40% automation exposure have seen 18% annual job posting decline since 2024. Without pivoting toward oversight, design, or decision-science work, your role faces structural elimination within 2–3 years.",
  },
  salary: {
    title: "Salary vs Market",
    value: "–14%", unit: "",
    verdict: "You are earning RM 1.6k/mo below what the market would pay you today.",
    summary: "Your 8% raise last year felt like progress — but the market for your peer cohort grew 12%. Every year this gap compounds, and it gets harder to close without a role change.",
    confidence: 88,
    evidence: [
      { label: "Your current salary: RM 10.1k/mo",                        positive: false },
      { label: "Market median for 5–7yr data professionals: RM 11.7k/mo", positive: false },
      { label: "Last negotiation: 14 months ago — overdue",         positive: false },
      { label: "Top performers at your level: RM 13–14k/mo via switch", positive: false },
    ],
    impact: "Compounding 3 years of underperformance means a RM 58k+ cumulative deficit. This is money you are leaving on the table right now.",
  },
  promotion: {
    title: "Promotion Readiness",
    value: "65%", unit: "",
    verdict: "You have the technical depth — but not the scope.",
    summary: "Your skills are strong enough for L5. The blocker isn't performance — it's that your impact is contained to your team. Senior roles require cross-functional visibility.",
    confidence: 79,
    evidence: [
      { label: "Technical performance: Meets expectations (3/5)",          positive: false },
      { label: "Impact scope: Team-level, not cross-functional",            positive: false },
      { label: "26 months at current level — within promotion window",     positive: true  },
      { label: "Domain expertise: Strong differentiator",                   positive: true  },
      { label: "No cloud credentials — missing L5 competency requirement", positive: false },
    ],
    impact: "At 65% readiness, one competing candidate or a soft cycle can delay your promotion 12–18 months. Closing the cloud cert gap alone raises this to ~81%.",
  },
};

type MetricKey = keyof typeof scoreExplanations;

function ScoreModal({ k, onClose }: { k: MetricKey; onClose: () => void }) {
  const e = scoreExplanations[k];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <p className="text-xs text-muted-foreground">Why this score?</p>
            <h2 className="font-bold text-foreground">{e.title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X size={15} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-slate-950 text-white rounded-xl p-4">
            <p className="text-2xl font-bold">{e.value}<span className="text-base font-normal text-slate-400 ml-1">{e.unit}</span></p>
            <p className="text-sm text-slate-300 mt-1 font-medium">{e.verdict}</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{e.summary}</p>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Evidence the AI used</p>
            <div className="space-y-2">
              {e.evidence.map(ev => (
                <div key={ev.label} className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${ev.positive ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
                  {ev.positive
                    ? <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    : <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />}
                  <span className="text-foreground">{ev.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5">What happens if nothing changes</p>
            <p className="text-sm text-amber-900 leading-relaxed">{e.impact}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${e.confidence >= 85 ? "bg-emerald-500" : "bg-amber-400"}`} />
            AI confidence: {e.confidence}% · Based on your resume, LinkedIn, GitHub, and market data
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Data ───────────────────────────────────────────────────────────────────

/* Monthly salary (RM '000/mo) — your pay vs the market median for the same cohort */
const salaryData = [
  { month: "Jul", salary: 9.8,  market: 10.4 },
  { month: "Aug", salary: 9.9,  market: 10.6 },
  { month: "Sep", salary: 9.9,  market: 10.8 },
  { month: "Oct", salary: 10.0, market: 11.0 },
  { month: "Nov", salary: 10.0, market: 11.2 },
  { month: "Dec", salary: 10.1, market: 11.5 },
  { month: "Jan", salary: 10.1, market: 11.7 },
];

const dnaData = [
  { subject: "Technical",     A: 82 },
  { subject: "Leadership",    A: 62 },
  { subject: "Communication", A: 88 },
  { subject: "Strategic",     A: 61 },
  { subject: "Innovation",    A: 55 },
  { subject: "Execution",     A: 79 },
];

const metricCards = [
  { key: "health"   as MetricKey, label: "Career Health",     value: "74",   unit: "/100", color: "text-amber-500",  bg: "bg-amber-50",   icon: Shield    },
  { key: "ai"       as MetricKey, label: "AI Exposure",       value: "High", unit: "",     color: "text-red-500",    bg: "bg-red-50",     icon: Brain     },
  { key: "salary"   as MetricKey, label: "vs Market",         value: "–14%", unit: "",     color: "text-red-500",    bg: "bg-red-50",     icon: TrendingUp},
  { key: "promotion"as MetricKey, label: "Promotion Ready",   value: "65%",  unit: "",     color: "text-amber-500",  bg: "bg-amber-50",   icon: Award     },
];

const strengthsAndRisks = {
  strengths: [
    "FinTech domain expertise — top 20% of peers",
    "Communication & storytelling with data — 88th percentile",
    "Active OSS contributor — dbt package with 89 GitHub stars",
    "Competition track record — SuperAI NEXT Top 5/2,400",
  ],
  risks: [
    "62% of daily tasks are automatable within 24 months",
    "Salary RM 1.6k/mo below what the market would pay you today",
    "Core skills haven't evolved in 14 months",
    "No cross-functional leadership record — promotion blocker",
  ],
};

const evidenceUsed = [
  { source: "Resume",         items: "6 yrs experience, 3 roles, 8 projects" },
  { source: "LinkedIn",       items: "Endorsements, connections, activity score" },
  { source: "GitHub",         items: "4 repos, dbt OSS package, commit frequency" },
  { source: "Market Data",    items: "240,000 job postings, 12,000 peer trajectories" },
  { source: "AWS Portal",     items: "1 active certification verified" },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [modal, setModal] = useState<MetricKey | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      {modal && <ScoreModal k={modal} onClose={() => setModal(null)} />}
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
                <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">Scanned Jun 13, 2026</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Jordan, your career has 4 open risks.</h1>
              <p className="text-slate-400 text-sm mt-1.5 max-w-xl leading-relaxed">
                Your Career Health Score is <strong className="text-white">74/100</strong> — below the threshold that typically leads to smooth promotion and market salary. Here's what we found, why it matters, and what to do about it.
              </p>
            </div>
            <button
              onClick={() => onNavigate("blindspots")}
              className="flex-shrink-0 flex items-center gap-2 bg-white text-slate-900 text-sm px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors font-semibold"
            >
              View Blind Spots <ChevronRight size={14} />
            </button>
          </div>

          {/* Journey progress */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { step: "01", label: "X-Ray Scan",        icon: Zap,         done: true,  page: "dashboard"    },
              { step: "02", label: "Blind Spots",        icon: Eye,         done: false, page: "blindspots"   },
              { step: "03", label: "Decision Lab",       icon: FlaskConical,done: false, page: "decisionlab"  },
              { step: "04", label: "Prescription",       icon: Pill,        done: false, page: "prescription" },
            ].map((s, i) => (
              <button
                key={s.step}
                onClick={() => onNavigate(s.page)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  s.done
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? "bg-primary" : "bg-white/10"}`}>
                  {s.done ? <CheckCircle size={13} className="text-white" /> : <span className="text-xs font-bold text-slate-400">{i + 1}</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{s.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.done ? "Complete" : "Up next"}</p>
                </div>
              </button>
            ))}
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
              {strengthsAndRisks.strengths.map(s => (
                <div key={s} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-semibold text-foreground">What's putting you at risk</h3>
            </div>
            <div className="space-y-3">
              {strengthsAndRisks.risks.map(r => (
                <div key={r} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Career DNA + Salary trend ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-1">Your Career DNA</h3>
            <p className="text-xs text-muted-foreground mb-4">How AI mapped your professional identity</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={dnaData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                  <Radar key="radar-dna" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Primary type: <strong className="text-foreground">Technical Executor</strong> · Low: Strategic, Innovation
            </p>
          </div>

          <div className="lg:col-span-2 bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground">Salary vs Market Trend</h3>
              <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-full font-medium">–14% below market</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Monthly salary, RM &apos;000. Your pay grew 4% — the market for your role grew 12%. The gap is widening.</p>
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={v => `RM${v}k`} domain={[9.5, 12]} />
                  <Tooltip formatter={(v: number, name: string) => [`RM ${v}k/mo`, name === "market" ? "Market median" : "Your salary"]} />
                  <Area key="area-db-market" type="monotone" dataKey="market" stroke="#B45309" strokeWidth={2} strokeDasharray="5 4" fill="none" isAnimationActive={false} />
                  <Area key="area-db-sal" type="monotone" dataKey="salary" stroke="#2563EB" strokeWidth={2} fill="url(#db-salGrad)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Market median for your cohort (5–7yr, FinTech, KL): <strong className="text-foreground">RM 11.7k/mo</strong> vs your <strong className="text-foreground">RM 10.1k/mo</strong>.
              That&apos;s a RM 1.6k/mo gap — RM 19k+ per year left on the table if nothing changes.
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
              <h3 className="font-semibold text-foreground">How we reached these conclusions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Every finding is grounded in verified evidence — not assumptions.</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Overall confidence: 89%
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {evidenceUsed.map(e => (
              <div key={e.source} className="bg-muted rounded-xl p-3.5">
                <p className="text-xs font-semibold text-foreground mb-1">{e.source}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{e.items}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Next step CTA ── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Your X-Ray scan is complete. Next: see your blind spots in detail.</p>
            <p className="text-sm text-muted-foreground mt-1">5 hidden career risks have been identified. Each one has a fix.</p>
          </div>
          <button
            onClick={() => onNavigate("blindspots")}
            className="flex-shrink-0 flex items-center gap-2 bg-primary text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            View My Blind Spots <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
