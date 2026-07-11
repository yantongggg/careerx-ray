import { useState } from "react";
import {
  AlertTriangle, CheckCircle, RefreshCw, ChevronDown, ChevronUp,
  ArrowRight, Clock, TrendingDown, Zap, Users, Cloud, BookOpen, BarChart3,
  Radar, Bot, TrendingUp, Globe
} from "lucide-react";

interface BlindSpot {
  id: number;
  icon: typeof Zap;
  category: string;
  severity: "critical" | "high" | "medium";
  headline: string;
  humanContext: string;         // The "what you have done / haven't done" framing
  whyItMatters: string;         // Why this matters
  ifIgnored: string;            // What happens if ignored
  recommendedAction: string;    // What to do next
  actionSteps: string[];
  timeToFix: string;
  evidence: string;
}

const blindSpots: BlindSpot[] = [
  {
    id: 1,
    icon: Zap,
    category: "AI Automation Risk",
    severity: "critical",
    headline: "62% of what you do every day will be automated within 24 months.",
    humanContext: "You spend roughly 18 hours a week pulling data, writing SQL queries, and generating dashboards. These are the exact tasks that AI and automation tools are replacing first — and fastest.",
    whyItMatters: "Your current role is built on execution work. But execution work is a shrinking moat. Companies are consolidating analyst headcount as AI handles the output layer, while simultaneously hiring for the oversight and decision layer. If your value is in the doing, not the deciding, you are in the most exposed position.",
    ifIgnored: "Within 2 years, your role is at 74% probability of restructure, consolidation, or elimination. Similar analyst profiles in 2022–2024 saw 28% involuntary exits during automation transitions. This isn't alarmism — it's the pattern playing out across FinTech right now.",
    recommendedAction: "Shift from being a data executor to a decision intelligence operator. The goal is to own the questions, not the queries. Start framing your work in terms of decisions enabled, not reports produced.",
    actionSteps: [
      "Reframe every deliverable as a decision recommendation, not a data export",
      "Build one ML project that automates part of your current job — then own the automation",
      "Transition toward model oversight, AI tool evaluation, and strategy translation",
      "Complete one LLM/AI course this quarter — target practical, not theoretical",
    ],
    timeToFix: "3–6 months to reframe identity; 9–12 months to fully pivot",
    evidence: "Based on job description analysis, LinkedIn activity patterns, and comparison against 240k job postings in your role category.",
  },
  {
    id: 2,
    icon: Cloud,
    category: "Certification Gap",
    severity: "high",
    headline: "You have zero cloud credentials. 73% of your target roles require one.",
    humanContext: "You have a dbt certification and a Tableau cert — both solid. But when hiring managers and ATS systems screen for Sr. Data or ML roles at your target companies (Stripe, Databricks, Anthropic), cloud certification is a gate, not a preference.",
    whyItMatters: "Cloud certification functions as a credibility shortcut. Without it, your resume can be automatically deprioritized before a human reads it — particularly at companies that require infrastructure ownership at the senior level. It signals you can own a production system end-to-end, not just query one.",
    ifIgnored: "An estimated 40–55% of your target job applications are filtered out at screening stage. More critically: any promotion into a data engineering, ML, or platform-adjacent role at Stripe will require this competency as a baseline.",
    recommendedAction: "Start with AWS Cloud Practitioner as a fast credibility signal, then immediately begin Solutions Architect Associate. It's an 8-week investment that changes your screening outcome across 73% of roles you'd actually want.",
    actionSteps: [
      "Complete AWS Cloud Practitioner (8 hours, free tier — do this week)",
      "Enroll in AWS Solutions Architect Associate — 6-week study plan",
      "Add certification to LinkedIn immediately upon passing",
      "Build one AWS-hosted project to convert the credential into a portfolio signal",
    ],
    timeToFix: "AWS Cloud Practitioner in 1 week. Solutions Architect in 6–8 weeks.",
    evidence: "Analysis of 240 job postings matching your target roles at Stripe, Databricks, Anthropic, and Scale AI.",
  },
  {
    id: 3,
    icon: BookOpen,
    category: "Skill Stagnation",
    severity: "high",
    headline: "Your Python skills haven't grown in 14 months. The market has moved on without you.",
    humanContext: "You have strong foundational Python — you're in the top 25% for your role. But your GitHub shows no new library adoption, no async patterns, no Polars, no DuckDB. Meanwhile, job postings for your target roles now cite Polars (+340% demand YoY), FastAPI, and modern data stack proficiency as baseline expectations.",
    whyItMatters: "In technical fields, a 14-month skills plateau is functionally equivalent to regression. Candidates who are 1–2 years junior to you are often interviewing with newer skills. Hiring managers use stack currency as a proxy for learning velocity — which is what they're actually hiring for at senior levels.",
    ifIgnored: "Within 6 months, you risk being filtered out of 40–60% of target job postings. Your salary negotiating power weakens when your toolkit appears dated relative to candidates applying for the same roles.",
    recommendedAction: "You don't need to learn everything — you need to learn the one thing that signals momentum. Pick Polars or DuckDB (both are fast, relevant, and Pandas-adjacent). Build one project with it. That single portfolio signal will update how you're perceived.",
    actionSteps: [
      "Install Polars and replicate one existing Pandas project this week",
      "Build a DuckDB-powered analytics pipeline for your portfolio",
      "Complete one async Python module (FastAPI or similar)",
      "Contribute to a modern data stack OSS project — even a docs fix counts",
    ],
    timeToFix: "4–6 hours to start. 3 weeks to have a portfolio signal.",
    evidence: "GitHub activity analysis, job posting keyword tracking, peer cohort benchmarking.",
  },
  {
    id: 4,
    icon: Users,
    category: "Leadership Gap",
    severity: "medium",
    headline: "You have completed 8 technical projects but have never formally led a team.",
    humanContext: "Your technical depth is real. But when you look at your career record, every project is an individual contribution. There's no moment where you were responsible for a team's outcome, not just your own output.",
    whyItMatters: "Leadership experience becomes the deciding factor for promotion into senior and management roles — not because the work changes, but because the proof changes. Companies don't just want to know you can do the work; they want evidence you can multiply others doing the work.",
    ifIgnored: "You could continue performing at a high level technically and still be passed over for L5 promotion in favor of someone with lower technical depth but visible leadership scope. This is one of the most common — and most preventable — career frustrations we see.",
    recommendedAction: "You don't need a title to lead. Lead a project, run a hackathon team, mentor a junior analyst formally, or organize a knowledge-sharing initiative. Any of these creates the evidence gap you need to close before your next review.",
    actionSteps: [
      "Volunteer to lead the next cross-team data project at Stripe",
      "Formally mentor one junior analyst — document it as a career artifact",
      "Organize or lead a knowledge-sharing session for the analytics guild",
      "Include leadership scope explicitly in your next manager 1:1",
    ],
    timeToFix: "One deliberate leadership contribution in the next 8 weeks.",
    evidence: "Resume analysis, LinkedIn endorsements, GitHub contribution patterns, career trajectory modeling.",
  },
  {
    id: 5,
    icon: TrendingDown,
    category: "Salary Drift",
    severity: "medium",
    headline: "You earned an 8% raise last year. The market paid your peers 12%. The gap is growing.",
    humanContext: "Your last salary review was 14 months ago. You got an 8% increase — which felt like progress. But the SF data market grew 12% over the same period. You didn't lose ground in absolute terms, but you lost ground in relative terms, and that gap compounds.",
    whyItMatters: "Compensation isn't just about right now. It's your base for future raises, equity refreshes, and offers. Every year you're below market, you're negotiating from a weaker anchor point. Companies rarely volunteer a correction — you have to create the moment.",
    ifIgnored: "At current trajectory, you'll be RM 30k+ below market by end of year. After 3 years of compounding, the cumulative deficit reaches RM 58k+ — money you will never recover without a deliberate salary reset (usually requiring a new offer or a confrontational negotiation).",
    recommendedAction: "Request a compensation review now. You don't need a new job to get a market correction — but you do need to come with market data and a competing signal. Even a preliminary offer in your pocket changes the conversation.",
    actionSteps: [
      "Pull current market data from Levels.fyi and LinkedIn Salary for your exact role + YoE",
      "Schedule a compensation review with your manager this month",
      "Take at least 2 exploratory recruiter calls to build a competing signal",
      "Frame your ask around market data, not personal need",
    ],
    timeToFix: "Request review within 2 weeks. Outcome within 4–8 weeks.",
    evidence: "Salary data from Levels.fyi, LinkedIn Salary, Glassdoor, and peer cohort analysis.",
  },
];

const cleared = [
  { label: "Communication & presentation skills",  detail: "88th percentile vs peer cohort — a genuine differentiator"           },
  { label: "FinTech domain expertise",             detail: "Payments and fraud analytics depth — top 20%, rare and valued"        },
  { label: "SQL proficiency",                      detail: "Top 15% of data professionals — consistently high signal in interviews" },
  { label: "Open source contribution",             detail: "dbt package with 89 stars — signals software engineering mindset"      },
];

/* ── Market reality check ─────────────────────────────────────────────── */

type RoleFamily = "data" | "design" | "software" | "marketing" | "generic";

interface MarketTrend {
  kind: "displacement" | "demand-shift" | "rising";
  tag: string;
  headline: string;
  detail: string;
  stat: string;
  statLabel: string;
}

const trendKindStyles = {
  displacement: { icon: Bot,           card: "border-red-200",     header: "bg-red-50",     iconColor: "text-red-500",     stat: "text-red-600",     tag: "bg-red-100 text-red-700"         },
  "demand-shift": { icon: TrendingDown, card: "border-amber-200",   header: "bg-amber-50",   iconColor: "text-amber-500",   stat: "text-amber-600",   tag: "bg-amber-100 text-amber-700"     },
  rising:       { icon: TrendingUp,    card: "border-emerald-200", header: "bg-emerald-50", iconColor: "text-[#115E50]",   stat: "text-[#115E50]",   tag: "bg-emerald-100 text-emerald-800" },
} as const;

const marketTrends: Record<RoleFamily, { familyLabel: string; trends: MarketTrend[] }> = {
  data: {
    familyLabel: "Data & Analytics — Malaysia",
    trends: [
      {
        kind: "displacement",
        tag: "AI displacement",
        headline: "Automation now handles 40–60% of routine reporting tasks.",
        detail: "Junior data-analyst postings in Malaysia are down 18% YoY as AI copilots absorb dashboard-building and ad-hoc SQL work. Roles that survive are shifting up the stack — from producing reports to owning the decisions behind them.",
        stat: "-18%",
        statLabel: "junior analyst postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Demand signal",
        headline: "Analytics teams are consolidating — and re-hiring differently.",
        detail: "Two regional tech employers reduced analytics headcount this quarter. But the same firms opened analytics-engineering and AI-literate analyst reqs within weeks — the demand didn't vanish, it moved. Candidates who reposition early inherit those seats.",
        stat: "2",
        statLabel: "regional team reductions this quarter",
      },
      {
        kind: "rising",
        tag: "Rising demand",
        headline: "AI engineering, data platform, and risk analytics are your growth lanes.",
        detail: "Postings for AI engineering, data platform, and risk analytics roles in KL and Penang are up 31% YoY — median offers RM 9–14k/mo. These are your fastest adjacent moves: 70%+ skill overlap with what you already do.",
        stat: "+31%",
        statLabel: "adjacent role postings, YoY",
      },
    ],
  },
  design: {
    familyLabel: "Design & UX — Malaysia",
    trends: [
      {
        kind: "displacement",
        tag: "AI displacement",
        headline: "Generative tools now draft 50–70% of production design assets.",
        detail: "Entry-level graphic and production design postings in Malaysia are down 22% YoY as AI tooling handles first-draft visuals and asset resizing. The roles holding value are research-led product design and design systems ownership.",
        stat: "-22%",
        statLabel: "production design postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Demand signal",
        headline: "Agencies are trimming execution roles, hiring strategy roles.",
        detail: "Two regional agencies restructured creative teams this quarter; briefs now ask for AI-fluent designers who direct tools rather than compete with them. Portfolios showing process and decision-making now outperform pure visual craft.",
        stat: "2",
        statLabel: "regional team restructures this quarter",
      },
      {
        kind: "rising",
        tag: "Rising demand",
        headline: "Product design, design systems, and UX research are expanding fast.",
        detail: "Product design and UX research openings across KL fintech and e-commerce are up 27% YoY — median offers RM 7–11k/mo. Design-systems specialists are the scarcest profile in the local market right now.",
        stat: "+27%",
        statLabel: "product design postings, YoY",
      },
    ],
  },
  software: {
    familyLabel: "Software Engineering — Malaysia",
    trends: [
      {
        kind: "displacement",
        tag: "AI displacement",
        headline: "AI coding assistants now write 40–55% of routine implementation code.",
        detail: "Junior developer postings in Malaysia are down 15% YoY as teams expect AI-assisted output from smaller headcounts. The premium is moving to system design, code review judgment, and AI tool orchestration — not raw line-writing speed.",
        stat: "-15%",
        statLabel: "junior developer postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Demand signal",
        headline: "Hiring bars are rising even as total openings hold steady.",
        detail: "Two regional tech employers slowed engineering hiring this quarter, but reqs for AI-integration and platform engineers at the same firms grew. Interview loops increasingly test AI-augmented workflows — engineers who show that fluency clear the bar.",
        stat: "2",
        statLabel: "regional hiring slowdowns this quarter",
      },
      {
        kind: "rising",
        tag: "Rising demand",
        headline: "AI engineering, platform, and DevSecOps roles are the growth engine.",
        detail: "AI engineering, cloud platform, and DevSecOps postings in Malaysia are up 34% YoY — median offers RM 10–16k/mo. These sit one deliberate upskill away from a mid-level engineering base.",
        stat: "+34%",
        statLabel: "AI/platform postings, YoY",
      },
    ],
  },
  marketing: {
    familyLabel: "Marketing & Growth — Malaysia",
    trends: [
      {
        kind: "displacement",
        tag: "AI displacement",
        headline: "AI now produces 50–65% of routine campaign copy and creative variants.",
        detail: "Content-executive and campaign-coordinator postings in Malaysia are down 20% YoY as AI handles first-draft copy, A/B variants, and scheduling. Value is consolidating around strategy, brand judgment, and performance analytics.",
        stat: "-20%",
        statLabel: "content exec postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Demand signal",
        headline: "Marketing teams are getting smaller — and more technical.",
        detail: "Two regional consumer brands consolidated marketing teams this quarter; replacement hires skew toward growth marketers who can read data, run experiments, and direct AI tooling. Generalist coordinator roles are the most exposed.",
        stat: "2",
        statLabel: "regional team consolidations this quarter",
      },
      {
        kind: "rising",
        tag: "Rising demand",
        headline: "Growth marketing, marketing analytics, and lifecycle/CRM are surging.",
        detail: "Growth and marketing-analytics postings across KL and Selangor are up 29% YoY — median offers RM 6.5–10k/mo. Marketers who pair creative instinct with measurement fluency are commanding the premium.",
        stat: "+29%",
        statLabel: "growth marketing postings, YoY",
      },
    ],
  },
  generic: {
    familyLabel: "Professional roles — Malaysia",
    trends: [
      {
        kind: "displacement",
        tag: "AI displacement",
        headline: "Automation now absorbs 35–50% of routine administrative and reporting work.",
        detail: "Across Malaysian white-collar roles, postings emphasizing routine coordination and reporting are down 16% YoY. Roles anchored in judgment, stakeholder management, and domain expertise remain the most resilient.",
        stat: "-16%",
        statLabel: "routine-task postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Demand signal",
        headline: "Employers are restructuring around AI-literate teams.",
        detail: "Two regional employers restructured operations teams this quarter; new reqs consistently list AI-tool fluency as a baseline expectation rather than a bonus. Early movers on that skill are absorbing the redistributed headcount.",
        stat: "2",
        statLabel: "regional restructures this quarter",
      },
      {
        kind: "rising",
        tag: "Rising demand",
        headline: "Hybrid roles that pair domain depth with AI fluency are growing fastest.",
        detail: "Postings that blend domain expertise with AI or data literacy are up 26% YoY across Malaysia — typically offering an RM 1.5–3k/mo premium over traditional equivalents. That combination is your fastest repositioning lane.",
        stat: "+26%",
        statLabel: "hybrid-skill postings, YoY",
      },
    ],
  },
};

function detectRoleFamily(...roles: (string | undefined)[]): RoleFamily {
  const text = roles.filter(Boolean).join(" ").toLowerCase();
  if (/data|analyst|analytics|bi\b|scientist|machine learning|\bml\b/.test(text)) return "data";
  if (/design|ux|ui\b|product design|creative/.test(text)) return "design";
  if (/software|developer|engineer|programmer|full.?stack|backend|frontend|devops/.test(text)) return "software";
  if (/marketing|growth|brand|content|seo|social media/.test(text)) return "marketing";
  return "generic";
}

const severityStyles = {
  critical: { badge: "bg-red-500 text-white",    card: "border-red-200",   header: "bg-red-50",   icon: "text-red-500",   label: "Critical" },
  high:     { badge: "bg-amber-500 text-white",  card: "border-amber-200", header: "bg-amber-50", icon: "text-amber-500", label: "High"     },
  medium:   { badge: "bg-yellow-400 text-white", card: "border-yellow-200",header: "bg-yellow-50",icon: "text-yellow-600",label: "Medium"   },
};

export function BlindSpots({
  onNavigate,
  currentRole = "Data Analyst",
  targetRole,
}: {
  onNavigate?: (page: string) => void;
  currentRole?: string;
  targetRole?: string;
}) {
  const [open, setOpen] = useState<number | null>(1);
  const family = detectRoleFamily(currentRole, targetRole);
  const market = marketTrends[family];

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1050px] mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Blind Spot Detection</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl leading-relaxed">
            These are the career risks you wouldn't have seen coming. Each one is explained with evidence, context, and a specific fix — because knowing the problem without understanding it doesn't help.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Critical",  value: "1", color: "text-red-500",    bg: "bg-red-50",    border: "border-red-100"    },
            { label: "High Risk", value: "2", color: "text-amber-500",  bg: "bg-amber-50",  border: "border-amber-100"  },
            { label: "Medium",    value: "2", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" },
            { label: "Strengths", value: "4", color: "text-emerald-500",bg: "bg-emerald-50",border: "border-emerald-100"},
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Blind Spot Cards */}
        <div className="space-y-3 mb-8">
          {blindSpots.map(spot => {
            const s = severityStyles[spot.severity];
            const isOpen = open === spot.id;
            return (
              <div key={spot.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${s.card}`}>

                {/* Header row — always visible */}
                <button
                  onClick={() => setOpen(isOpen ? null : spot.id)}
                  className="w-full flex items-start gap-4 px-6 py-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl ${s.header} border ${s.card} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <spot.icon size={16} className={s.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
                      <span className="text-xs text-muted-foreground">{spot.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">{spot.headline}</p>
                    {!isOpen && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{spot.humanContext}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    {isOpen
                      ? <ChevronUp size={16} className="text-muted-foreground" />
                      : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div className="border-t border-border">

                    {/* Context */}
                    <div className="px-6 py-5">
                      <p className="text-sm text-foreground leading-relaxed">{spot.humanContext}</p>
                    </div>

                    <div className="border-t border-border grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">

                      {/* Why it matters */}
                      <div className="px-6 py-5">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-xs">?</span>
                          Why this matters
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">{spot.whyItMatters}</p>
                      </div>

                      {/* If ignored */}
                      <div className={`px-6 py-5 ${s.header}`}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 text-muted-foreground">
                          <AlertTriangle size={12} className={s.icon} />
                          If you ignore this
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">{spot.ifIgnored}</p>
                      </div>

                      {/* What to do */}
                      <div className="px-6 py-5">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <CheckCircle size={12} className="text-emerald-500" />
                          What to do next
                        </p>
                        <p className="text-sm text-foreground leading-relaxed mb-4">{spot.recommendedAction}</p>
                        <div className="space-y-2">
                          {spot.actionSteps.map((step, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                              <p className="text-xs text-foreground leading-snug">{step}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
                          <Clock size={11} /> Time to fix: <strong className="text-foreground">{spot.timeToFix}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Evidence footer */}
                    <div className="border-t border-border px-6 py-3 flex items-center gap-2 bg-muted/40">
                      <BarChart3 size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Evidence: {spot.evidence}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Market Reality Check */}
        <div className="bg-white border border-border rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between gap-4 mb-1.5 flex-wrap">
            <div className="flex items-center gap-2">
              <Radar size={16} className="text-[#8A7038]" />
              <h3 className="font-semibold text-foreground">Market reality check — your role vs the market</h3>
            </div>
            <span className="text-xs font-semibold text-[#8A7038] bg-[#8A7038]/10 px-2.5 py-1 rounded-full">{market.familyLabel}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl leading-relaxed">
            What the market is doing around {targetRole ? `${currentRole} → ${targetRole}` : `your role as a ${currentRole}`} — the shifts most candidates only notice once it's already cost them. None of this is destiny; all of it is actionable.
          </p>

          <div className="grid lg:grid-cols-3 gap-3 mb-5">
            {market.trends.map(trend => {
              const t = trendKindStyles[trend.kind];
              return (
                <div key={trend.kind} className={`border rounded-xl overflow-hidden ${t.card}`}>
                  <div className={`px-4 py-3 flex items-center justify-between gap-2 ${t.header}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <t.icon size={14} className={`${t.iconColor} flex-shrink-0`} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.tag}`}>{trend.tag}</span>
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <div className="mb-3">
                      <p className={`text-2xl font-bold ${t.stat}`}>{trend.stat}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{trend.statLabel}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug mb-2">{trend.headline}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{trend.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe size={12} className="flex-shrink-0" />
              <span>Aggregated from public job boards, LinkedIn hiring data, and news signals · refreshed weekly</span>
            </div>
            <button
              onClick={() => onNavigate?.("decisionlab")}
              className="flex-shrink-0 flex items-center gap-2 bg-[#115E50] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#0d4a3f] transition-colors font-semibold"
            >
              See how to reposition <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle size={16} className="text-emerald-500" />
            <h3 className="font-semibold text-foreground">What's genuinely strong — no risk detected</h3>
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            {cleared.map(c => (
              <div key={c.label} className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next step */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Now that you can see the risks — what do you do?</p>
            <p className="text-sm text-muted-foreground mt-1">The Decision Lab simulates your future so you can act with confidence, not guesswork.</p>
          </div>
          <button
            onClick={() => onNavigate?.("decisionlab")}
            className="flex-shrink-0 flex items-center gap-2 bg-primary text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Open Decision Lab <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
