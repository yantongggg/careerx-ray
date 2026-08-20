import { demoToast } from "../state/toast";
import { useState } from "react";
import {
  CheckCircle, Clock, TrendingUp, Award, Code2, Briefcase,
  Pill, ArrowUpRight, FileText, Sparkles, RefreshCw, AlertTriangle,
  ArrowRight, Shield, Brain, Zap, Star
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useCareerProfile } from "../state/careerProfile";
import { NextStep } from "../state/stages";
import { corpusFor, credentialDemand, type Corpus } from "../lib/careerCorpus";
import type { CareerProfile } from "../lib/profileTypes";
import type { Risk, Scorecard } from "../lib/careerRisk";

// ─── Data ────────────────────────────────────────────────────────────────────

/* ────────────────────────────────────────────────────────────────
   The diagnosis is the same one the dashboard shows.

   It used to be typed in — a fixed 74/100, five named risks including a
   "SuperAI NEXT Top 5/2,400" strength, and a 62% automation figure — so
   this page could contradict the dashboard on the same person. Both now
   read deriveRisks() and deriveScorecard().
   ──────────────────────────────────────────────────────────────── */

const VERDICT_BANDS: { floor: number; verdict: string; color: string; bg: string; border: string }[] = [
  { floor: 80, verdict: "Low Career Risk",      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { floor: 65, verdict: "Moderate Career Risk", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"   },
  { floor: 0,  verdict: "High Career Risk",     color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200"     },
];

function buildDiagnosis(risks: Risk[], scorecard: Scorecard) {
  const band = VERDICT_BANDS.find(b => scorecard.careerHealth >= b.floor)!;
  const critical = risks.filter(r => r.severity === "critical" || r.severity === "high").length;

  /* Six months of consistent execution is worth roughly this much, and
     it is capped so the projection cannot promise a perfect score. */
  const projected = Math.min(94, scorecard.careerHealth + 8 + critical * 3);

  return {
    band,
    score: scorecard.careerHealth,
    projected,
    projection: [
      { period: "Now", score: scorecard.careerHealth },
      { period: "30d", score: Math.round(scorecard.careerHealth + (projected - scorecard.careerHealth) * 0.3) },
      { period: "90d", score: Math.round(scorecard.careerHealth + (projected - scorecard.careerHealth) * 0.7) },
      { period: "6mo", score: projected },
    ],
  };
}

type Phase = "30day" | "90day" | "6month";

interface TreatmentPhase {
  label: string;
  goal: string;
  scoreGain: number;
  color: string;
  bg: string;
  border: string;
  tasks: { id: string; label: string; rationale: string; effort: string; impact: string; category: string }[];
}

/* ────────────────────────────────────────────────────────────────
   The plan follows the person's own target and their own open risks.

   Fifteen tasks used to be typed in here, all of them steps toward ML
   Engineering: pass AWS Solutions Architect, build a fraud-detection
   model, do fast.ai, lead a cross-functional project at Stripe. A
   restaurant supervisor aiming at restaurant manager was handed the
   same fifteen.
   ──────────────────────────────────────────────────────────────── */

function buildTreatment(profile: CareerProfile, corpus: Corpus, risks: Risk[], gate: string): Record<Phase, TreatmentPhase> {
  const target = profile.targetRole || "your target role";
  const cert = gate;
  const skill1 = corpus.targetSkills[0] ?? "the core skill of the role";
  const skill2 = corpus.targetSkills[1] ?? "a second core skill";
  const targetFuture = corpus.futures[1];
  const payGoal = `RM ${(Math.round(targetFuture.salary5yr * 0.72) / 1000).toFixed(1)}k/mo`;

  const salaryRisk = risks.find(r => r.category.toLowerCase().includes("salary"));
  const hasEvidence = profile.evidence.length > 0;

  return {
    "30day": {
      label: "30-Day Sprint",
      goal: `Stop the bleeding. Fix what is costing you money or opportunities right now.`,
      scoreGain: 4,
      color: "#3B82F6", bg: "bg-blue-50", border: "border-blue-200",
      tasks: [
        salaryRisk
          ? { id: "t1", label: "Open a pay conversation with your manager", rationale: `${salaryRisk.comparison.shortfall} Every month you wait compounds the deficit and costs you leverage.`, effort: "1 hr", impact: "Critical", category: "Salary" }
          : { id: "t1", label: "Write down what you want from the next 12 months", rationale: "Your pay is not the current problem, so direction is. A target you have not written down is a wish.", effort: "1 hr", impact: "High", category: "Direction" },
        { id: "t2", label: `Start on: ${cert}`, rationale: `This is what ${target} postings screen on hardest. Putting a date on it is what makes it real.`, effort: "1 hr", impact: "Critical", category: "Certification" },
        { id: "t3", label: `Rewrite your résumé headline around ${target}`, rationale: "Your current headline describes what you have done. It should describe what you are moving toward — screeners read it in four seconds.", effort: "2 hrs", impact: "High", category: "Visibility" },
        hasEvidence
          ? { id: "t4", label: "Get one self-declared item verified", rationale: "A verified claim counts in full; a self-declared one barely counts at all. Verification is the cheapest score you will get.", effort: "2 hrs", impact: "High", category: "Evidence" }
          : { id: "t4", label: "Add your first piece of evidence", rationale: "Your record is empty, which means every recommendation here rests on your word alone. One verified item changes that.", effort: "2 hrs", impact: "Critical", category: "Evidence" },
        { id: "t5", label: "Reconnect with five people who have seen you work", rationale: "Most roles at this level are filled through people who can vouch for you. Reach decays quietly if you never use it.", effort: "2 hrs", impact: "Medium", category: "Network" },
      ],
    },
    "90day": {
      label: "90-Day Transformation",
      goal: `Build the evidence that makes ${target} credible rather than hopeful.`,
      scoreGain: 11,
      color: "#A855F7", bg: "bg-purple-50", border: "border-purple-200",
      tasks: [
        { id: "t6", label: `Have ${cert}`, rationale: `This alone moves you past the filter that currently stops you before a human reads anything.`, effort: "40 hrs", impact: "Critical", category: "Certification" },
        { id: "t7", label: `Ship one piece of work that demonstrates ${skill1}`, rationale: `${skill1} is the first thing ${target} interviews probe. A shipped example ends that conversation in your favour.`, effort: "30 hrs", impact: "Critical", category: "Portfolio" },
        { id: "t8", label: `Close your gap in ${skill2}`, rationale: "The second gap is what separates a shortlist from an offer once the first one is closed.", effort: "20 hrs", impact: "High", category: "Skills" },
        { id: "t9", label: "Take ownership of something end to end", rationale: "Scope, not performance, is what usually blocks the next level. One visibly owned piece of work changes how you are read.", effort: "Ongoing", impact: "High", category: "Leadership" },
        { id: "t10", label: "Apply to three roles through a warm introduction", rationale: "A referred application converts several times better than a cold one. You need market signal, not just internal advocacy.", effort: "4 hrs", impact: "High", category: "Job Search" },
      ],
    },
    "6month": {
      label: "6-Month Outcome",
      goal: `Reach the target: ${target}, a promotion, or a pay reset that reflects your actual market value.`,
      scoreGain: 18,
      color: "#22C55E", bg: "bg-emerald-50", border: "border-emerald-200",
      tasks: [
        { id: "t11", label: `Land ${target} or the promotion into it`, rationale: "This is the goal. Everything in the first two phases exists to make this moment reachable.", effort: "Ongoing", impact: "Critical", category: "Career Move" },
        { id: "t12", label: `Reach ${payGoal}`, rationale: `Market rate for this profile once ${cert} and shipped evidence are behind you. Attainable, not aspirational.`, effort: "Ongoing", impact: "Critical", category: "Salary" },
        { id: "t13", label: `Ship a second piece of ${skill1} work`, rationale: "Two examples is a pattern; one is a fluke. Pattern is what gets you hired.", effort: "40 hrs", impact: "High", category: "Portfolio" },
        { id: "t14", label: `Go one step past it`, rationale: "Depth past the entry bar separates you from everyone else who cleared the same one.", effort: "50 hrs", impact: "High", category: "Certification" },
        { id: "t15", label: "Talk publicly about your work once", rationale: "A talk, a write-up, a meetup. Visibility generates inbound conversations that applications never will.", effort: "10 hrs", impact: "Medium", category: "Visibility" },
      ],
    },
  };
}

/* Certifications and target roles follow the user's family and their
   own three futures, rather than a fixed AWS-to-Databricks ladder aimed
   at one data-analytics career. */


function buildRecommendedRoles(corpus: Corpus) {
  const fmt = (n: number) => `RM ${(n / 1000).toFixed(1)}k/mo`;
  return corpus.futures.map(f => ({
    title: f.role,
    salary: `${fmt(Math.round(f.salary5yr * 0.72))}–${fmt(f.salary5yr)}`,
    fit: f.confidence,
    match: f.id === "target"
      ? `Your stated target. ${f.pros[0]}.`
      : f.id === "promotion"
        ? `${f.pros[0]}. The same first move as Future B, then one more.`
        : `Staying put. ${f.cons[0]}.`,
  }));
}

function buildExpectedOutcome(corpus: Corpus, projected: number) {
  const target = corpus.futures[1];
  const fmt = (n: number) => `RM ${(n / 1000).toFixed(1)}k/mo`;
  return {
    score: projected,
    salary: `${fmt(Math.round(target.salary5yr * 0.72))}–${fmt(target.salary5yr)}`,
    aiRisk: `${target.aiRiskPct}%`,
    promotionReady: `${target.promotionOddsPct}%`,
    summary: `Working this plan moves you from where you are today into position for ${target.role}. The projected score of ${projected} reflects someone building in a direction that compounds, not just performing well where they already are.`,
  };
}

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

export function CareerPrescription({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { profile, risks, scorecard } = useCareerProfile();
  const corpus = corpusFor(profile);
  const diagnosis = buildDiagnosis(risks, scorecard);
  const scoreProjection = diagnosis.projection;
  const credential = credentialDemand(corpus, profile.targetRole);
  const recommendedRoles = buildRecommendedRoles(corpus);
  const expectedOutcome = buildExpectedOutcome(corpus, diagnosis.projected);
  const treatment = buildTreatment(profile, corpus, risks, credential.credential);

  const [activePhase, setActivePhase] = useState<Phase>("30day");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggleCheck = (id: string) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const phase = treatment[activePhase];
  const done = phase.tasks.filter(t => checked[t.id]).length;
  const pct  = Math.round((done / phase.tasks.length) * 100);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">

        {/* ── Current diagnosis ──
             This used to restate the whole dashboard: four risks with their
             metrics, three strengths, and a prognosis paragraph, all inside
             one dark card. The Dashboard already says all of that. A
             prescription's job is the plan, so this is now the score, the
             verdict, and where the plan takes you. */}
        <div className="bg-slate-950 text-white rounded-2xl p-7">
          <div className="flex flex-col lg:flex-row lg:items-center gap-7">

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Pill size={17} className="text-white" />
                </div>
                <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Career Prescription</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${diagnosis.band.bg} ${diagnosis.band.border} ${diagnosis.band.color}`}>
                  {diagnosis.band.verdict}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {risks.length
                  ? <>Close {risks.length} thing{risks.length === 1 ? "" : "s"} and you move from {diagnosis.score} to {diagnosis.projected}.</>
                  : <>Nothing structural is in your way. This plan extends the lead.</>}
              </h1>
              <p className="text-base text-slate-300 leading-relaxed mt-3 max-w-xl">
                {risks.length
                  ? <>Biggest first: <strong className="text-white">{risks[0].category}</strong>. The plan below is ordered by what costs you most, not by what is easiest.</>
                  : <>Keep your evidence current and re-scan when the market shifts.</>}
              </p>
            </div>

            {/* Where you are, where this takes you */}
            <div className="flex items-center gap-5 lg:gap-7 flex-shrink-0">
              <div className="text-center">
                <p className="text-5xl font-bold tabular-nums leading-none">{diagnosis.score}</p>
                <p className="text-sm text-slate-400 mt-2">today</p>
              </div>
              <TrendingUp size={22} className="text-emerald-400 flex-shrink-0" />
              <div className="text-center">
                <p className="text-5xl font-bold tabular-nums leading-none text-emerald-400">{diagnosis.projected}</p>
                <p className="text-sm text-slate-400 mt-2">in 6 months</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Score projection ── */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-foreground">Expected recovery trajectory</h3>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-base">
              <TrendingUp size={16} /> {diagnosis.score} → {diagnosis.projected} · +{diagnosis.projected - diagnosis.score} points in 6 months
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

        {/* ── The one credential that opens the most doors ──
             This was "Prescribed Certifications": three rows, of which
             two were not certifications at all, with hand-written
             "salary impact" labels and every item already stated in the
             plan above with better reasoning. One gate now, counted
             against the postings the user can go and read on the next
             page — which is the part the plan does not tell them. */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">What opens the most doors</h3>
          </div>

          <p className="text-xl font-semibold text-foreground leading-snug max-w-2xl">
            {credential.credential}
          </p>

          {credential.requiredBy.length ? (
            <>
              <p className="text-base text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                <strong className="text-foreground tabular-nums">
                  {credential.requiredBy.length} of your {credential.total}
                </strong>{" "}
                matched postings screen on it. That is not our opinion — it is
                written into the requirements you can go and read.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {credential.requiredBy.map(job => (
                  <span key={job} className="text-sm text-foreground bg-muted border border-border px-3 py-1.5 rounded-lg">
                    {job}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-base text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              None of your matched postings name it outright, which means it is
              worth having but is not what is stopping you. The plan above is the
              better use of your next month.
            </p>
          )}

          <button
            onClick={() => onNavigate?.("jobs")}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            See the postings <ArrowRight size={14} />
          </button>
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

        <NextStep currentPage="prescription" onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/* The general-purpose resume: aimed at where you want to go, built from
   what is on your profile. The job-specific version lives in
   Application Prep, which tailors this to one posting. */
