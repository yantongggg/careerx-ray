import { demoToast } from "./toast";
import { useState } from "react";
import {
  CheckCircle, Clock, TrendingUp, Award, Code2, Briefcase,
  Pill, ArrowUpRight, FileText, Sparkles, RefreshCw, AlertTriangle,
  ArrowRight, Shield, Brain, Zap, Star
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ─── Data ────────────────────────────────────────────────────────────────────

const diagnosis = {
  score: 74,
  verdict: "Moderate Career Risk",
  verdictColor: "text-amber-600",
  verdictBg: "bg-amber-50",
  verdictBorder: "border-amber-200",
  summary: "Your career is at a moderate risk of stagnation. You have real strengths — but three structural problems are compounding quietly in the background. Left unaddressed, these risks will become visible regrets within 18–24 months.",
  detectedRisks: [
    { label: "AI automation exposure", severity: "critical", impact: "62% of your daily tasks automatable within 24 months" },
    { label: "Cloud credential gap",   severity: "high",     impact: "Filters you out of 73% of target roles at screening" },
    { label: "Skill stagnation",       severity: "high",     impact: "Python skills plateau — market has moved to modern stack" },
    { label: "Leadership gap",         severity: "medium",   impact: "Promotion blocker for L5 without cross-functional scope" },
    { label: "Salary drift",           severity: "medium",   impact: "Earning RM 1.6k/mo below market — gap compounds each year"     },
  ],
  detectedStrengths: [
    "FinTech domain expertise — top 20% of peers",
    "Communication skills — 88th percentile",
    "Active OSS contributor",
    "Competition track record — SuperAI NEXT Top 5/2,400",
  ],
  prognosis: "With the treatment plan below, your Career Health Score is projected to reach 92/100 within 6 months — moving from moderate risk into the safe zone and positioning you for a significant salary increase or role transition.",
};

const scoreProjection = [
  { period: "Now",  score: 74 },
  { period: "30d",  score: 78 },
  { period: "90d",  score: 85 },
  { period: "6mo",  score: 92 },
];

type Phase = "30day" | "90day" | "6month";

const treatment: Record<Phase, {
  label: string;
  goal: string;
  scoreGain: number;
  color: string;
  bg: string;
  border: string;
  tasks: { id: string; label: string; rationale: string; effort: string; impact: "Critical" | "High" | "Medium"; category: string }[];
}> = {
  "30day": {
    label: "30-Day Sprint",
    goal: "Stop the bleeding. Close the fastest-to-fix gaps and create immediate market visibility.",
    scoreGain: 4,
    color: "#2563EB",
    bg: "bg-blue-50",
    border: "border-blue-200",
    tasks: [
      { id: "t1", label: "Request salary review with your manager", rationale: "You're RM 1.6k/mo below market. Every month you wait, you lose leverage and compound the deficit.", effort: "1 hr",  impact: "Critical", category: "Salary"      },
      { id: "t2", label: "Complete AWS Cloud Practitioner exam",    rationale: "8 hours. Free. Immediately changes your ATS screening outcome for 73% of target roles.",          effort: "8 hrs", impact: "Critical", category: "Certification"},
      { id: "t3", label: "Rewrite your LinkedIn summary",           rationale: "Your current summary describes what you do. It should describe the decisions you enable.",          effort: "2 hrs", impact: "High",     category: "Visibility"   },
      { id: "t4", label: "Reconnect with 5 dormant network contacts",rationale: "80% of senior roles are filled through networks. Your reach has declined 22% in 6 months.",       effort: "2 hrs", impact: "Medium",   category: "Network"      },
      { id: "t5", label: "Install Polars and rebuild one Pandas project", rationale: "Signal to the market that your skills are current. One portfolio update changes the conversation.", effort: "4 hrs", impact: "Medium", category: "Skills" },
    ],
  },
  "90day": {
    label: "90-Day Transformation",
    goal: "Build the evidence that makes your next career move credible, not just hopeful.",
    scoreGain: 11,
    color: "#A855F7",
    bg: "bg-purple-50",
    border: "border-purple-200",
    tasks: [
      { id: "t6",  label: "Pass AWS Solutions Architect Associate",            rationale: "This credential alone unlocks 73% of target roles and raises your average salary offer by RM 12k.",                 effort: "40 hrs",  impact: "Critical", category: "Certification" },
      { id: "t7",  label: "Build ML portfolio project #1 — fraud detection",  rationale: "Demonstrates ML engineering depth beyond your analyst background. One project changes how interviewers see you.", effort: "30 hrs",  impact: "Critical", category: "Portfolio"     },
      { id: "t8",  label: "Complete fast.ai Practical Deep Learning course",   rationale: "Bridges the theory-to-practice gap. Fast.ai is how ML engineers actually learn the craft.",                      effort: "20 hrs",  impact: "High",     category: "Skills"        },
      { id: "t9",  label: "Lead one cross-functional project at Stripe",       rationale: "Your promotion is blocked by scope, not performance. One visible leadership contribution changes the calculus.",   effort: "Ongoing", impact: "High",     category: "Leadership"    },
      { id: "t10", label: "Apply to 3 roles via warm referral",                rationale: "Referrals have a 3× higher interview rate. You need market signal, not just internal advocacy.",                   effort: "4 hrs",   impact: "High",     category: "Job Search"    },
    ],
  },
  "6month": {
    label: "6-Month Outcome",
    goal: "Reach the target: a new role, a promotion, or a salary reset that reflects your actual market value.",
    scoreGain: 18,
    color: "#22C55E",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    tasks: [
      { id: "t11", label: "Land ML Engineer role or earn promotion",              rationale: "This is the goal. Everything in the 30 and 90-day plan is designed to make this moment achievable.",        effort: "Ongoing", impact: "Critical", category: "Career Move"   },
      { id: "t12", label: "Achieve RM 11.7k+/mo salary",                               rationale: "Market rate for your profile with AWS cert + ML projects. This is not aspirational — it's attainable.",      effort: "Ongoing", impact: "Critical", category: "Salary"       },
      { id: "t13", label: "Build ML portfolio project #2 — recommendation system",rationale: "Two ML projects in your portfolio creates a pattern, not a fluke. Pattern is what gets you hired.",          effort: "40 hrs",  impact: "High",     category: "Portfolio"    },
      { id: "t14", label: "Complete GCP Professional Data Engineer cert",         rationale: "Multi-cloud credentialing differentiates you from the 80% of candidates with only AWS.",                     effort: "50 hrs",  impact: "High",     category: "Certification"},
      { id: "t15", label: "Speak or present at one industry event",              rationale: "Thought leadership is a force multiplier. One talk generates inbound connections and interview requests.",     effort: "10 hrs",  impact: "Medium",   category: "Visibility"   },
    ],
  },
};

const expectedOutcome = {
  score: 92,
  salary: "RM 140k–RM 155k",
  aiRisk: "Low (28%)",
  promotionReady: "81%",
  summary: "With consistent execution of this plan, you move from moderate risk to strong positioning within 6 months. The Career Health Score of 92 reflects a professional who is not just performing well — but building in a direction that compounds.",
};

const certifications = [
  { name: "AWS Cloud Practitioner",                priority: 1, effort: "1 week",    salaryImpact: "Gate-opener",  urgency: "This week" },
  { name: "AWS Solutions Architect Associate",      priority: 2, effort: "6–8 weeks", salaryImpact: "+RM 12k avg",    urgency: "By Day 60" },
  { name: "GCP Professional Data Engineer",         priority: 3, effort: "8–10 weeks",salaryImpact: "+RM 10k avg",    urgency: "Month 4–5" },
  { name: "Databricks ML Associate",                priority: 4, effort: "4–5 weeks", salaryImpact: "+RM 8k avg",     urgency: "Month 5–6" },
];

const recommendedRoles = [
  { title: "Analytics Engineer",           salary: "RM 130k–RM 155k", fit: 91, match: "Best immediate fit — minimal gap, AWS cert closes the remaining blocker"       },
  { title: "ML Engineer",                  salary: "RM 145k–RM 175k", fit: 82, match: "Best 12-month target — 2 ML projects + AWS cert makes you credible"            },
  { title: "Data Science Manager",         salary: "RM 155k–RM 190k", fit: 68, match: "Strong ceiling — requires 12–18 months of leadership positioning first"        },
  { title: "Staff Data Scientist",         salary: "RM 180k–RM 240k", fit: 54, match: "Aspirational — plan for 18–24 months of deliberate preparation"                },
];

const impactColors: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High:     "bg-blue-100 text-blue-700",
  Medium:   "bg-amber-100 text-amber-700",
};

const severityColors: Record<string, string> = {
  critical: "text-red-500",
  high:     "text-amber-500",
  medium:   "text-yellow-600",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CareerPrescription() {
  const [activePhase, setActivePhase] = useState<Phase>("30day");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggleCheck = (id: string) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const phase = treatment[activePhase];
  const done = phase.tasks.filter(t => checked[t.id]).length;
  const pct  = Math.round((done / phase.tasks.length) * 100);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">

        {/* ── Current Diagnosis ── */}
        <div className="bg-slate-950 text-white rounded-2xl p-7">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Pill size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Career Prescription</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${diagnosis.verdictBg} ${diagnosis.verdictBorder} ${diagnosis.verdictColor}`}>
                  {diagnosis.verdict}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Current Diagnosis</h1>
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{diagnosis.summary}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Detected Risks */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle size={12} className="text-red-400" /> Detected Risks
              </p>
              <div className="space-y-2">
                {diagnosis.detectedRisks.map(r => (
                  <div key={r.label} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${r.severity === "critical" ? "bg-red-500" : r.severity === "high" ? "bg-amber-400" : "bg-yellow-400"}`} />
                    <div>
                      <span className={`text-xs font-semibold ${severityColors[r.severity]}`}>{r.label}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{r.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Detected Strengths */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-400" /> Confirmed Strengths
              </p>
              <div className="space-y-2.5">
                {diagnosis.detectedStrengths.map(s => (
                  <div key={s} className="flex items-start gap-2.5">
                    <CheckCircle size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prognosis */}
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Prognosis</p>
            <p className="text-sm text-slate-200 leading-relaxed">{diagnosis.prognosis}</p>
          </div>
        </div>

        {/* ── Score projection ── */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground">Expected Recovery Trajectory</h3>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
              <TrendingUp size={14} /> 74 → 92 · +18 points in 6 months
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Projected if you follow the treatment plan consistently.</p>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={scoreProjection}>
                <defs>
                  <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} domain={[65, 100]} />
                <Tooltip formatter={(v: number) => [`${v}/100`, "Career Health"]} />
                <ReferenceLine y={80} stroke="#E2E8F0" strokeDasharray="4 4" label={{ value: "Safe zone (80+)", position: "right", fontSize: 10, fill: "#94A3B8" }} />
                <Area key="area-rx" type="monotone" dataKey="score" stroke="#22C55E" strokeWidth={2.5} fill="url(#rxGrad)" isAnimationActive={false}
                  dot={{ r: 5, fill: "#22C55E", stroke: "white", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Treatment Plan ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-foreground">Treatment Plan</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">3 phases · 53 weeks</span>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {(Object.entries(treatment) as [Phase, typeof treatment[Phase]][]).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setActivePhase(key)}
                className={`text-left p-5 rounded-xl border transition-all ${activePhase === key ? `${p.bg} ${p.border} shadow-sm` : "bg-white border-border hover:bg-muted/50"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-foreground">{p.label}</span>
                  <span className="text-xs font-semibold" style={{ color: p.color }}>+{p.scoreGain} pts</span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{p.goal}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Active phase tasks */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{phase.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{phase.goal}</p>
            </div>
            <span className="text-xs text-muted-foreground">{done}/{phase.tasks.length} done</span>
          </div>
          <div className="h-1 bg-muted">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="divide-y divide-border">
            {phase.tasks.map(task => {
              const isDone = !!checked[task.id];
              return (
                <div
                  key={task.id}
                  onClick={() => toggleCheck(task.id)}
                  className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition-colors ${isDone ? "bg-emerald-50/60" : "hover:bg-muted/40"}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isDone ? "bg-emerald-500 border-emerald-500" : "border-border hover:border-primary"}`}>
                    {isDone && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-semibold leading-snug ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.label}</p>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${impactColors[task.impact]}`}>{task.impact}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{task.rationale}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} /> {task.effort}</span>
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{task.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recommended Certifications ── */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Award size={16} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Prescribed Certifications</h3>
          </div>
          <div className="space-y-3">
            {certifications.map(c => (
              <div key={c.name} className="flex items-center gap-5 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <div className="w-7 h-7 rounded-full border-2 border-border bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                  {c.priority}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} /> {c.effort}</span>
                    <span className="text-xs text-muted-foreground">Salary impact: <strong className="text-foreground">{c.salaryImpact}</strong></span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">{c.urgency}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recommended Roles ── */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase size={16} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Recommended Target Roles</h3>
            <span className="text-xs text-muted-foreground ml-auto">Ranked by fit · based on your career evidence</span>
          </div>
          <div className="space-y-3">
            {recommendedRoles.map(r => (
              <div key={r.title} className="flex items-center gap-5 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke={r.fit >= 85 ? "#22C55E" : r.fit >= 70 ? "#3B82F6" : "#F59E0B"}
                      strokeWidth="3" strokeDasharray={`${r.fit} ${100 - r.fit}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground">{r.fit}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{r.match}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">{r.salary}</p>
                  <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors ml-auto mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Expected Outcome ── */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-7">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Expected Outcome at 6 Months</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-2xl">{expectedOutcome.summary}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Career Health",      value: `${expectedOutcome.score}/100`, color: "text-emerald-600" },
              { label: "Target Salary",      value: expectedOutcome.salary,         color: "text-foreground"  },
              { label: "AI Risk",            value: expectedOutcome.aiRisk,         color: "text-emerald-600" },
              { label: "Promotion Ready",    value: expectedOutcome.promotionReady, color: "text-blue-600"    },
            ].map(m => (
              <div key={m.label} className="bg-white border border-emerald-100 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Resume Gen ── */}
        <ResumeFromPortfolio />
      </div>
    </div>
  );
}

function ResumeFromPortfolio() {
  const [target, setTarget] = useState("ML Engineer");
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");
  const targets = ["ML Engineer", "Analytics Engineer", "Data Science Manager", "AI Security Engineer"];

  return (
    <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
          <FileText size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Generate Resume From Career Evidence</h3>
          <p className="text-xs text-muted-foreground mt-0.5">AI tailors your verified evidence record to your target role. Not a builder — a generator.</p>
        </div>
      </div>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-5 leading-relaxed">
        AI reads your Career Evidence and rewrites it for your target role — reordering experiences, reframing impact statements, and surfacing the right signals automatically.
      </p>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Target Role</label>
          <select value={target} onChange={e => { setTarget(e.target.value); setState("idle"); }}
            className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            {targets.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={() => { setState("generating"); setTimeout(() => setState("done"), 2200); }}
          disabled={state === "generating"}
          className="flex items-center gap-2 bg-primary text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium">
          {state === "generating"
            ? <><RefreshCw size={14} className="animate-spin" /> Generating…</>
            : <><Sparkles size={14} /> Generate</>}
        </button>
      </div>
      {state === "done" && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Resume ready for {target}</p>
            <p className="text-xs text-muted-foreground mt-0.5">8 entries reordered · 3 impact statements rewritten · role-specific summary generated</p>
          </div>
          <button onClick={() => demoToast(`Tailored resume for ${target} downloaded ✓`)} className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            <FileText size={12} /> Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
