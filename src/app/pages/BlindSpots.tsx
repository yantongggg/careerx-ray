import { useState } from "react";
import {
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ArrowRight, Clock,
  Target, TrendingDown, BarChart3, Radar, Bot, TrendingUp, Globe
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCareerProfile } from "../state/careerProfile";
import { NextStep } from "../state/stages";
import { detectRoleFamily, toMarketFamily, type MarketFamily } from "../lib/roleFamily";
import { TRUST_NOTE } from "../lib/profileTypes";
import type { Severity } from "../lib/careerRisk";

/* ────────────────────────────────────────────────────────────────
   Gap to Target — the distance between the role you are in and the
   role you want.

   The Dashboard owns the other half of the story: what threatens the
   role you hold today. This page never repeats it. Every gap below is
   derived from the current → target transition, so a marketing
   graduate and a restaurant supervisor each get their own, rather
   than a data analyst's.
   ──────────────────────────────────────────────────────────────── */

/* What a strong score on each dimension is actually worth in an
   application. Only the wording is authored — which dimensions appear,
   and whether any appear at all, comes from the user's own scan. */
const STRENGTH_NOTE: Record<string, string> = {
  Technical:     "Technical depth is the part of this move you don't have to build from nothing.",
  Execution:     "You finish what you start — the easiest thing to evidence, the hardest to fake.",
  Strategic:     "You already frame work around outcomes, which is what target-role interviews probe for.",
  Innovation:    "You reach for new approaches — the part of any job automation takes longest to reach.",
  Leadership:    "You carry scope beyond your own output, which is what promotion panels look for.",
  Communication: "You can explain your work to people who don't do your job — rarer than it sounds.",
};

/* Below this, a dimension is a middling score rather than a strength,
   and calling it out would dilute the ones that are real. */
const STRENGTH_FLOOR = 70;

/* ── Market reality check ─────────────────────────────────────────────── */

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

const marketTrends: Record<MarketFamily, { familyLabel: string; trends: MarketTrend[] }> = {
  data: {
    familyLabel: "Data & Analytics — Malaysia",
    trends: [
      {
        kind: "displacement",
        tag: "Routine work shrinking",
        headline: "Automation now handles 40–60% of routine reporting tasks.",
        detail: "Junior data-analyst postings in Malaysia are down 18% YoY as AI copilots absorb dashboard-building and ad-hoc SQL work. Roles that survive are shifting up the stack — from producing reports to owning the decisions behind them.",
        stat: "-18%",
        statLabel: "junior analyst postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Hiring pattern changing",
        headline: "Analytics teams are consolidating — and re-hiring differently.",
        detail: "Two regional tech employers reduced analytics headcount this quarter. But the same firms opened analytics-engineering and AI-literate analyst reqs within weeks — the demand didn't vanish, it moved. Candidates who reposition early inherit those seats.",
        stat: "2",
        statLabel: "regional team reductions this quarter",
      },
      {
        kind: "rising",
        tag: "Growth lanes",
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
        tag: "Routine work shrinking",
        headline: "Generative tools now draft 50–70% of production design assets.",
        detail: "Entry-level graphic and production design postings in Malaysia are down 22% YoY as AI tooling handles first-draft visuals and asset resizing. The roles holding value are research-led product design and design systems ownership.",
        stat: "-22%",
        statLabel: "production design postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Hiring pattern changing",
        headline: "Agencies are trimming execution roles, hiring strategy roles.",
        detail: "Two regional agencies restructured creative teams this quarter; briefs now ask for AI-fluent designers who direct tools rather than compete with them. Portfolios showing process and decision-making now outperform pure visual craft.",
        stat: "2",
        statLabel: "regional team restructures this quarter",
      },
      {
        kind: "rising",
        tag: "Growth lanes",
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
        tag: "Routine work shrinking",
        headline: "AI coding assistants now write 40–55% of routine implementation code.",
        detail: "Junior developer postings in Malaysia are down 15% YoY as teams expect AI-assisted output from smaller headcounts. The premium is moving to system design, code review judgment, and AI tool orchestration — not raw line-writing speed.",
        stat: "-15%",
        statLabel: "junior developer postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Hiring pattern changing",
        headline: "Hiring bars are rising even as total openings hold steady.",
        detail: "Two regional tech employers slowed engineering hiring this quarter, but reqs for AI-integration and platform engineers at the same firms grew. Interview loops increasingly test AI-augmented workflows — engineers who show that fluency clear the bar.",
        stat: "2",
        statLabel: "regional hiring slowdowns this quarter",
      },
      {
        kind: "rising",
        tag: "Growth lanes",
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
        tag: "Routine work shrinking",
        headline: "AI now produces 50–65% of routine campaign copy and creative variants.",
        detail: "Content-executive and campaign-coordinator postings in Malaysia are down 20% YoY as AI handles first-draft copy, A/B variants, and scheduling. Value is consolidating around strategy, brand judgment, and performance analytics.",
        stat: "-20%",
        statLabel: "content exec postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Hiring pattern changing",
        headline: "Marketing teams are getting smaller — and more technical.",
        detail: "Two regional consumer brands consolidated marketing teams this quarter; replacement hires skew toward growth marketers who can read data, run experiments, and direct AI tooling. Generalist coordinator roles are the most exposed.",
        stat: "2",
        statLabel: "regional team consolidations this quarter",
      },
      {
        kind: "rising",
        tag: "Growth lanes",
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
        tag: "Routine work shrinking",
        headline: "Automation now absorbs 35–50% of routine administrative and reporting work.",
        detail: "Across Malaysian white-collar roles, postings emphasizing routine coordination and reporting are down 16% YoY. Roles anchored in judgment, stakeholder management, and domain expertise remain the most resilient.",
        stat: "-16%",
        statLabel: "routine-task postings, MY, YoY",
      },
      {
        kind: "demand-shift",
        tag: "Hiring pattern changing",
        headline: "Employers are restructuring around AI-literate teams.",
        detail: "Two regional employers restructured operations teams this quarter; new reqs consistently list AI-tool fluency as a baseline expectation rather than a bonus. Early movers on that skill are absorbing the redistributed headcount.",
        stat: "2",
        statLabel: "regional restructures this quarter",
      },
      {
        kind: "rising",
        tag: "Growth lanes",
        headline: "Hybrid roles that pair domain depth with AI fluency are growing fastest.",
        detail: "Postings that blend domain expertise with AI or data literacy are up 26% YoY across Malaysia — typically offering an RM 1.5–3k/mo premium over traditional equivalents. That combination is your fastest repositioning lane.",
        stat: "+26%",
        statLabel: "hybrid-skill postings, YoY",
      },
    ],
  },
};

/* ── Role shift map + reposition paths + 12-month trend lines ── */

interface ShiftEntry { role: string; change: string }
interface RepositionPath { role: string; demand: string; overlap: number; missing: string[]; time: string }
interface TrendSeries { name: string; color: string; start: number; slope: number }

const marketMoves: Record<MarketFamily, { declining: ShiftEntry[]; growing: ShiftEntry[]; paths: RepositionPath[]; series: TrendSeries[] }> = {
  data: {
    declining: [
      { role: "Junior Data Analyst", change: "-18%" },
      { role: "Report Analyst", change: "-24%" },
      { role: "Manual QA", change: "-15%" },
    ],
    growing: [
      { role: "AI Analyst", change: "+31%" },
      { role: "Data Platform Analyst", change: "+28%" },
      { role: "ML Engineer", change: "+22%" },
    ],
    paths: [
      { role: "Risk Analytics Specialist", demand: "+31%", overlap: 74, missing: ["Credit risk domain", "Model governance"], time: "~3 months" },
      { role: "Data Platform Analyst", demand: "+28%", overlap: 72, missing: ["dbt at scale", "Airflow"], time: "~3 months" },
      { role: "AI Product Analyst", demand: "+24%", overlap: 68, missing: ["LLM fundamentals", "Prompt evaluation"], time: "~4 months" },
    ],
    series: [
      { name: "Junior Data Analyst", color: "#DC2626", start: 100, slope: -1.7 },
      { name: "BI Analyst", color: "#1B5CA3", start: 100, slope: -0.1 },
      { name: "Data Engineer", color: "#15803D", start: 100, slope: 1.9 },
      { name: "AI Engineer", color: "#115E50", start: 100, slope: 2.6 },
    ],
  },
  design: {
    declining: [
      { role: "Production Designer", change: "-22%" },
      { role: "Graphic Artist", change: "-19%" },
      { role: "Asset Retoucher", change: "-25%" },
    ],
    growing: [
      { role: "Product Designer", change: "+27%" },
      { role: "Design Systems Lead", change: "+30%" },
      { role: "UX Researcher", change: "+21%" },
    ],
    paths: [
      { role: "Design Systems Specialist", demand: "+30%", overlap: 74, missing: ["Tokens & theming", "Figma libraries at scale"], time: "~3 months" },
      { role: "Product Designer", demand: "+27%", overlap: 78, missing: ["Research ops", "Journey mapping"], time: "~2 months" },
      { role: "UX Researcher", demand: "+21%", overlap: 65, missing: ["Research methods", "Usability testing"], time: "~4 months" },
    ],
    series: [
      { name: "Production Designer", color: "#DC2626", start: 100, slope: -1.9 },
      { name: "Visual Designer", color: "#1B5CA3", start: 100, slope: -0.2 },
      { name: "Product Designer", color: "#15803D", start: 100, slope: 1.8 },
      { name: "Design Systems", color: "#115E50", start: 100, slope: 2.3 },
    ],
  },
  software: {
    declining: [
      { role: "Junior Developer", change: "-15%" },
      { role: "Manual QA Engineer", change: "-21%" },
      { role: "CRUD Maintainer", change: "-12%" },
    ],
    growing: [
      { role: "AI Engineer", change: "+34%" },
      { role: "Platform Engineer", change: "+28%" },
      { role: "DevSecOps Engineer", change: "+25%" },
    ],
    paths: [
      { role: "AI Engineer", demand: "+34%", overlap: 70, missing: ["LLM APIs & agents", "Eval pipelines"], time: "~4 months" },
      { role: "Platform Engineer", demand: "+28%", overlap: 75, missing: ["Kubernetes", "IaC (Terraform)"], time: "~3 months" },
      { role: "DevSecOps Engineer", demand: "+25%", overlap: 68, missing: ["Security scanning", "Zero-trust basics"], time: "~4 months" },
    ],
    series: [
      { name: "Junior Developer", color: "#DC2626", start: 100, slope: -1.4 },
      { name: "Full-stack Developer", color: "#1B5CA3", start: 100, slope: 0.1 },
      { name: "Platform Engineer", color: "#15803D", start: 100, slope: 2.0 },
      { name: "AI Engineer", color: "#115E50", start: 100, slope: 2.8 },
    ],
  },
  marketing: {
    declining: [
      { role: "Content Executive", change: "-20%" },
      { role: "Campaign Coordinator", change: "-17%" },
      { role: "Social Media Exec", change: "-14%" },
    ],
    growing: [
      { role: "Growth Marketer", change: "+29%" },
      { role: "Marketing Analyst", change: "+26%" },
      { role: "Lifecycle / CRM Specialist", change: "+23%" },
    ],
    paths: [
      { role: "Growth Marketer", demand: "+29%", overlap: 76, missing: ["Experiment design", "GA4 / attribution"], time: "~2 months" },
      { role: "Marketing Analyst", demand: "+26%", overlap: 70, missing: ["SQL basics", "Dashboarding"], time: "~3 months" },
      { role: "Lifecycle / CRM Specialist", demand: "+23%", overlap: 72, missing: ["CRM automation", "Segmentation strategy"], time: "~3 months" },
    ],
    series: [
      { name: "Content Executive", color: "#DC2626", start: 100, slope: -1.6 },
      { name: "Brand Executive", color: "#1B5CA3", start: 100, slope: 0.0 },
      { name: "Growth Marketer", color: "#15803D", start: 100, slope: 1.9 },
      { name: "Marketing Analyst", color: "#115E50", start: 100, slope: 2.2 },
    ],
  },
  generic: {
    declining: [
      { role: "Admin Coordinator", change: "-16%" },
      { role: "Reporting Officer", change: "-19%" },
      { role: "Data Entry Clerk", change: "-28%" },
    ],
    growing: [
      { role: "AI-literate Ops Analyst", change: "+26%" },
      { role: "Process Automation Lead", change: "+24%" },
      { role: "Domain Specialist", change: "+18%" },
    ],
    paths: [
      { role: "AI-literate Ops Analyst", demand: "+26%", overlap: 71, missing: ["AI tool fluency", "Basic data literacy"], time: "~2 months" },
      { role: "Process Automation Lead", demand: "+24%", overlap: 66, missing: ["Workflow automation", "Change management"], time: "~4 months" },
      { role: "Domain Specialist", demand: "+18%", overlap: 80, missing: ["Certification in your domain"], time: "~3 months" },
    ],
    series: [
      { name: "Routine Coordinator", color: "#DC2626", start: 100, slope: -1.5 },
      { name: "Generalist Officer", color: "#1B5CA3", start: 100, slope: -0.1 },
      { name: "Ops Analyst", color: "#15803D", start: 100, slope: 1.6 },
      { name: "Automation Lead", color: "#115E50", start: 100, slope: 2.1 },
    ],
  },
};

const TREND_MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const buildTrendData = (series: TrendSeries[]) =>
  TREND_MONTHS.map((month, i) => {
    const row: Record<string, number | string> = { month };
    series.forEach(sr => { row[sr.name] = Math.round((sr.start + sr.slope * i + Math.sin(i * 1.7) * 1.2) * 10) / 10; });
    return row;
  });

const severityStyles: Record<Severity, { badge: string; card: string; header: string; icon: string; label: string }> = {
  critical: { badge: "bg-red-500 text-white",    card: "border-red-200",   header: "bg-red-50",   icon: "text-red-500",   label: "Critical" },
  high:     { badge: "bg-amber-500 text-white",  card: "border-amber-200", header: "bg-amber-50", icon: "text-amber-500", label: "High"     },
  medium:   { badge: "bg-yellow-400 text-white", card: "border-yellow-200",header: "bg-yellow-50",icon: "text-yellow-600",label: "Medium"   },
  low:      { badge: "bg-slate-400 text-white",  card: "border-border",    header: "bg-muted",    icon: "text-muted-foreground", label: "Worth knowing" },
};

const severityIcon: Record<Severity, typeof AlertTriangle> = {
  critical: Bot, high: Target, medium: TrendingDown, low: Radar,
};

export function BlindSpots({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { profile, targetGaps } = useCareerProfile();
  const [open, setOpen] = useState<number | null>(0);

  const currentRole = profile.currentRole || "your current role";
  const targetRole = profile.targetRole;

  const family = toMarketFamily(detectRoleFamily(profile.currentRole, profile.targetRole));
  const market = marketTrends[family];
  const moves = marketMoves[family];
  const trendData = buildTrendData(moves.series);

  /* Blind spots are about the role you WANT. The risks on your current
     role live on the dashboard — this page would just restate them
     otherwise, which is exactly what it used to do. */
  const spots = targetGaps.map((gap, i) => ({
    id: i,
    severity: gap.severity,
    icon: severityIcon[gap.severity],
    headline: gap.headline,
    humanContext: gap.why,
    whyItMatters: gap.sharedBy + ".",
    ifIgnored: `Applications for ${targetRole} keep reaching the same filter, and nothing in your record changes the outcome.`,
    /* Only worth showing when it says something the headline did not.
       The rule set often makes the gap and the action the same sentence. */
    recommendedAction: gap.action.trim() === gap.headline.trim() ? null : gap.action,
    timeToFix: gap.timeToClose,
    evidence: `Derived from the ${currentRole} → ${targetRole} transition rules and the evidence on your profile.`,
  }));

  const counts = {
    critical: spots.filter(s => s.severity === "critical").length,
    high: spots.filter(s => s.severity === "high").length,
    medium: spots.filter(s => s.severity === "medium").length,
  };

  /* Strengths are read off the DNA scores and the evidence actually on
     file, so they cannot contradict what the dashboard shows. */
  const strengths = Object.entries(profile.dnaScores)
    .filter(([, score]) => score >= STRENGTH_FLOOR)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([dimension, score]) => ({
      label: `${dimension} — ${score}/100`,
      detail: STRENGTH_NOTE[dimension] ?? `One of your strongest calibrated dimensions.`,
    }))
    .concat(
      profile.evidence.slice(0, 2).map(item => ({
        label: item.label,
        detail: TRUST_NOTE[item.trust],
      })),
    );

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1050px] mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
            {targetRole ? `What stands between you and ${targetRole}` : "Gap to Target"}
          </h1>
          <p className="text-muted-foreground text-base mt-3 max-w-2xl leading-relaxed">
            {targetRole
              ? <>Your dashboard covers the risks in the role you have today. This is the other half — the things that quietly filter you out of <strong className="text-foreground">{targetRole}</strong> applications, and what closes each one.</>
              : <>Set a target role and this page shows exactly what stands between you and it: what the role asks for, what your evidence already covers, and where applicants like you get filtered out.</>}
          </p>
        </div>

        {!targetRole || spots.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-8 text-center mb-8">
            <Target size={22} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground">{targetRole ? "Nothing is blocking you right now" : "No target role set yet"}</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
              {targetRole
                ? "Your evidence already covers the usual filters for this move. Keep it current and re-scan when the market shifts."
                : "We won't invent a set of gaps for a role you haven't chosen. Re-scan, pick where you want to go, and this fills in."}
            </p>
            {!targetRole && (
              <button
                onClick={() => onNavigate?.("onboarding")}
                className="mt-4 inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Set a target role <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
        <>
        {/* Start here — one gap named, with the action. Four equal number
            tiles used to sit here, which told you the totals and nothing
            about where to begin. */}
        {spots[0] && (
          <div className="bg-slate-950 text-white rounded-2xl p-6 lg:p-7 mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Start here</p>
            <h2 className="text-2xl lg:text-[1.75rem] font-bold leading-tight">{spots[0].headline}</h2>
            <p className="text-base text-slate-300 leading-relaxed mt-3 max-w-2xl">{spots[0].whyItMatters}</p>
            <div className="flex flex-wrap items-center gap-4 mt-5">
              <button
                onClick={() => { setOpen(0); }}
                className="inline-flex items-center gap-2 bg-white text-slate-950 px-5 py-2.5 rounded-xl text-base font-semibold hover:bg-slate-100 transition-colors"
              >
                See what closes it <ArrowRight size={16} />
              </button>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                <Clock size={14} /> Around {spots[0].timeToFix}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-base">
          <span className="text-muted-foreground">
            <strong className="text-foreground tabular-nums">{spots.length}</strong> gap{spots.length === 1 ? "" : "s"} to close
          </span>
          {counts.critical + counts.high > 0 && (
            <span className="text-muted-foreground">
              <strong className="text-amber-700 tabular-nums">{counts.critical + counts.high}</strong> high priority
            </span>
          )}
          {strengths.length > 0 && (
            <span className="text-muted-foreground">
              <strong className="text-emerald-700 tabular-nums">{strengths.length}</strong> already working for you
            </span>
          )}
        </div>

        {/* Gap cards */}
        <div className="space-y-3 mb-8">
          {spots.map(spot => {
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
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.badge}`}>{s.label}</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground leading-snug">{spot.headline}</p>
                    {!isOpen && (
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">{spot.humanContext}</p>
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
                      <p className="text-base text-foreground leading-relaxed">{spot.humanContext}</p>
                    </div>

                    <div className="border-t border-border grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">

                      {/* Why it matters */}
                      <div className="px-6 py-5">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-xs">?</span>
                          Why this matters
                        </p>
                        <p className="text-base text-foreground leading-relaxed">{spot.whyItMatters}</p>
                      </div>

                      {/* If ignored */}
                      <div className={`px-6 py-5 ${s.header}`}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 text-muted-foreground">
                          <AlertTriangle size={12} className={s.icon} />
                          If you ignore this
                        </p>
                        <p className="text-base text-foreground leading-relaxed">{spot.ifIgnored}</p>
                      </div>

                      {/* What to do */}
                      <div className="px-6 py-5">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <CheckCircle size={12} className="text-emerald-500" />
                          What to do next
                        </p>
                        <p className="text-base text-foreground leading-relaxed">
                          {spot.recommendedAction ?? spot.headline}
                        </p>
                        <div className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground">
                          <Clock size={13} /> Time to fix: <strong className="text-foreground">{spot.timeToFix}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Evidence footer */}
                    <div className="border-t border-border px-6 py-3 flex items-center gap-2 bg-muted/40">
                      <BarChart3 size={12} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Evidence: {spot.evidence}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </>
        )}

        {/* Market Reality Check */}
        <div className="bg-white border border-border rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between gap-4 mb-1.5 flex-wrap">
            <div className="flex items-center gap-2">
              <Radar size={16} className="text-[#8A7038]" />
              <h3 className="text-lg font-semibold text-foreground">Market reality check — your role vs the market</h3>
            </div>
            <span className="text-xs font-semibold text-[#8A7038] bg-[#8A7038]/10 px-2.5 py-1 rounded-full">{market.familyLabel}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl leading-relaxed">
            What the market is doing around {targetRole ? `${currentRole} → ${targetRole}` : `your role as a ${currentRole}`} — the shifts most candidates only notice once it's already cost them. None of this is destiny; all of it is actionable.
          </p>

          {/* 1 · Market movement snapshot — small cards, not walls of text */}
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {market.trends.map(trend => {
              const t = trendKindStyles[trend.kind];
              return (
                <div key={trend.kind} className={`border rounded-xl px-4 py-3.5 ${t.card}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <t.icon size={13} className={`${t.iconColor} flex-shrink-0`} />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.tag}`}>{trend.tag}</span>
                  </div>
                  <p className={`text-2xl font-bold ${t.stat}`}>{trend.stat}</p>
                  <p className="text-[11px] text-muted-foreground">{trend.statLabel}</p>
                  <p className="text-xs font-medium text-foreground leading-snug mt-2">{trend.headline}</p>
                </div>
              );
            })}
          </div>

          {/* 2 · Role shift map */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Role shift map</p>
            <div className="grid md:grid-cols-[1fr_auto_1.1fr_auto_1fr] gap-3 items-stretch">
              <div className="rounded-xl border border-red-200 bg-red-50/40 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-2.5">Routine work shrinking</p>
                <div className="space-y-2">
                  {moves.declining.map(r => (
                    <div key={r.role} className="flex items-center justify-between gap-2 bg-white border border-red-100 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-foreground truncate">{r.role}</span>
                      <span className="text-xs font-bold text-red-600 flex-shrink-0">{r.change}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex items-center text-muted-foreground/40"><ArrowRight size={16} /></div>
              <div className="rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center" style={{ borderColor: "#1B5CA3", backgroundColor: "rgba(27,92,163,0.05)" }}>
                <span className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1B5CA3" }}>You are here</span>
                <p className="text-base font-bold text-foreground leading-snug">{currentRole}</p>
                <span className="mt-2 text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-white" style={{ color: "#1B5CA3", borderColor: "rgba(27,92,163,0.3)" }}>
                  Stable core · routine parts shrinking
                </span>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">Your skills transfer to every role on the right.</p>
              </div>
              <div className="hidden md:flex items-center text-muted-foreground/40"><ArrowRight size={16} /></div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#115E50] mb-2.5">Growth lanes</p>
                <div className="space-y-2">
                  {moves.growing.map(r => (
                    <div key={r.role} className="flex items-center justify-between gap-2 bg-white border border-emerald-100 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-foreground truncate">{r.role}</span>
                      <span className="text-xs font-bold text-[#115E50] flex-shrink-0">{r.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3 · Reposition paths */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Reposition paths — where you can move with the skills you already have</p>
            <div className="space-y-2">
              {moves.paths.map((path, i) => (
                <button
                  key={path.role}
                  onClick={() => onNavigate?.("decisionlab")}
                  className="w-full flex flex-col lg:flex-row lg:items-center gap-3 border border-border rounded-xl px-4 py-3 text-left hover:border-[#115E50]/40 hover:shadow-sm transition-all bg-white"
                >
                  <div className="flex items-center gap-3 lg:w-[28%] min-w-0">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-[#115E50] flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <span className="text-sm font-semibold text-foreground truncate">{path.role}</span>
                  </div>
                  <div className="flex items-center gap-1.5 lg:w-[14%]">
                    <TrendingUp size={12} className="text-[#115E50] flex-shrink-0" />
                    <span className="text-xs font-bold text-[#115E50] whitespace-nowrap">{path.demand} demand</span>
                  </div>
                  <div className="flex items-center gap-2 lg:w-[19%]">
                    <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      <div className="h-full rounded-full" style={{ width: `${path.overlap}%`, backgroundColor: "#1B5CA3" }} />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap"><strong className="text-foreground">{path.overlap}%</strong> overlap</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap lg:flex-1 min-w-0">
                    {path.missing.map(m => (
                      <span key={m} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">+ {m}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{path.time}</span>
                    <ArrowRight size={13} className="text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4 · 12-month demand trend */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">12-month hiring demand — key roles compared</p>
            <p className="text-[11px] text-muted-foreground mb-2">Modelled demand index, 12 months ago = 100 · Malaysian market</p>
            <div className="flex items-center gap-4 flex-wrap mb-1">
              {moves.series.map(sr => (
                <span key={sr.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: sr.color }} /> {sr.name}
                </span>
              ))}
            </div>
            <div style={{ width: "100%", height: 190 }}>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={trendData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8" }} domain={[75, 135]} />
                  <Tooltip />
                  {moves.series.map(sr => (
                    <Line key={sr.name} type="monotone" dataKey={sr.name} stroke={sr.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe size={12} className="flex-shrink-0" />
              <span>Modelled from authored Malaysian market datasets · see docs/data-sources.md</span>
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
        {strengths.length > 0 && (
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle size={16} className="text-emerald-500" />
              <h3 className="text-lg font-semibold text-foreground">What you already have going for you</h3>
            </div>
            <div className="grid lg:grid-cols-2 gap-3">
              {strengths.map(c => (
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
        )}

        <div className="mt-6">
          <NextStep currentPage="blindspots" onNavigate={onNavigate} />
        </div>

      </div>
    </div>
  );
}
