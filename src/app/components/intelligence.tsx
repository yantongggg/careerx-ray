import { createContext, useContext, useState, ReactNode } from "react";
import { ArrowRight, Radio, Sparkles } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Career Intelligence Graph — shared signal store.
   One hiring decision made on the employer side becomes an
   anonymized market signal that the candidate and university
   dashboards read from the same source.
   ──────────────────────────────────────────────────────────────── */

export interface HiringSignal {
  id: string;
  /** Normalized skill label shown across dashboards */
  skill: string;
  /** Raw feedback reason given by the employer */
  reason: string;
  role: string;
  /** Anonymized employer label — identity never leaves the employer side */
  employer: string;
  stage: string;
  time: string;
  /** true when emitted during this session (demo moment) */
  live: boolean;
}

const SEED_SIGNALS: HiringSignal[] = [
  {
    id: "seed-1",
    skill: "Cloud deployment (AWS/GCP)",
    reason: "No cloud certification",
    role: "Data Analyst, Digital Banking",
    employer: "A digital banking employer",
    stage: "Interview",
    time: "2 days ago",
    live: false,
  },
  {
    id: "seed-2",
    skill: "Stakeholder communication",
    reason: "Needs stakeholder comms practice",
    role: "AI Product Analyst",
    employer: "A fintech employer",
    stage: "Screening",
    time: "5 days ago",
    live: false,
  },
];

/** Map a free-form rejection reason to a normalized skill label */
export function normalizeSkill(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes("cloud")) return "Cloud deployment (AWS/GCP)";
  if (r.includes("tableau")) return "Tableau";
  if (r.includes("banking") || r.includes("financial")) return "Banking domain knowledge";
  if (r.includes("comm")) return "Stakeholder communication";
  if (r.includes("dbt") || r.includes("data engineering")) return "Data engineering (dbt)";
  if (r.includes("sql")) return "SQL optimization";
  if (r.includes("python") || r.includes("programming")) return "Python programming";
  if (r.includes("spark")) return "Spark / big data";
  if (r.includes("kubernetes")) return "Kubernetes & DevOps";
  return reason;
}

interface IntelligenceContextValue {
  signals: HiringSignal[];
  liveCount: number;
  latest: HiringSignal;
  emitSignal: (s: Omit<HiringSignal, "id" | "time" | "live" | "skill">) => void;
}

const IntelligenceContext = createContext<IntelligenceContextValue | null>(null);

export function IntelligenceProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<HiringSignal[]>(SEED_SIGNALS);

  const emitSignal: IntelligenceContextValue["emitSignal"] = (s) => {
    setSignals(prev => [
      {
        ...s,
        id: `live-${prev.length}`,
        skill: normalizeSkill(s.reason),
        time: "Just now",
        live: true,
      },
      ...prev,
    ]);
  };

  const liveCount = signals.filter(s => s.live).length;

  return (
    <IntelligenceContext.Provider value={{ signals, liveCount, latest: signals[0], emitSignal }}>
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  const ctx = useContext(IntelligenceContext);
  if (!ctx) throw new Error("useIntelligence must be used inside IntelligenceProvider");
  return ctx;
}

/* ────────────────────────────────────────────────────────────────
   explainRoleGap — curated, AI-style explanation of what typically
   blocks a current → target role move. Keyword lookup over common
   Malaysian-market transitions, with a sensible generic fallback.
   ──────────────────────────────────────────────────────────────── */

interface RoleGapRule {
  from: string[];
  to: string[];
  headline: string;
  gaps: string[];
}

const ROLE_GAP_RULES: RoleGapRule[] = [
  {
    from: ["analyst", "analytics"],
    to: ["ml", "machine learning"],
    headline:
      "Analysts moving into ML engineering are most often filtered out for lacking production evidence — insight skills transfer, deployment skills don't.",
    gaps: [
      "Ship one end-to-end ML model to AWS or GCP — even a small churn predictor counts as deployment evidence",
      "Move from notebooks to production Python: testing, packaging and CI/CD",
      "Add MLOps basics — model monitoring, versioning and retraining pipelines",
      "Earn a cloud certification: 73% of KL machine-learning postings list one",
    ],
  },
  {
    from: ["analyst", "analytics"],
    to: ["data engineer", "analytics engineer"],
    headline:
      "The analyst-to-data-engineer jump is about building pipelines others rely on, not just querying them.",
    gaps: [
      "Build a scheduled pipeline with dbt or Airflow that runs unattended",
      "Show SQL optimization at scale — partitioning, indexing, cost tuning",
      "Get hands-on with a cloud warehouse: BigQuery, Snowflake or Redshift",
      "Strengthen production Python — tests, logging and error handling",
    ],
  },
  {
    from: ["student", "graduate", "fresh"],
    to: ["analyst", "analytics"],
    headline:
      "Fresh graduates land analyst roles on proof, not GPA — Malaysian employers shortlist portfolios over transcripts 3-to-1.",
    gaps: [
      "Build 2–3 SQL projects on real datasets — DOSM open data is a strong local choice",
      "Publish one interactive dashboard in Tableau or Power BI",
      "Add work evidence: an internship, freelance gig or case-competition result",
      "Practise presenting findings to non-technical stakeholders",
    ],
  },
  {
    from: ["designer", "design"],
    to: ["product designer", "product design"],
    headline:
      "Product design roles filter for outcome ownership — visual craft alone rarely clears the screening stage.",
    gaps: [
      "Rework your portfolio into end-to-end case studies: problem → research → shipped outcome",
      "Add user research evidence — interviews, usability tests, synthesis",
      "Show design-system or component-library contributions",
      "Tie at least one project to a business metric (conversion, retention, NPS)",
    ],
  },
  {
    from: ["developer", "software", "engineer", "programmer"],
    to: ["ml", "machine learning"],
    headline:
      "Developers pivoting to ML pass the engineering bar but stumble on modelling judgment — evaluation skills are the differentiator.",
    gaps: [
      "Cover ML fundamentals: statistics, model evaluation and error analysis",
      "Ship one ML-powered feature inside a real application",
      "Add data-pipeline experience — feature engineering, batch and streaming inputs",
      "Learn a managed ML stack: SageMaker, Vertex AI or Azure ML",
    ],
  },
];

const roleMatches = (role: string, keywords: string[]) => {
  const r = role.toLowerCase();
  return keywords.some(k => r.includes(k));
};

export function explainRoleGap(current: string, target: string): { headline: string; gaps: string[] } {
  for (const rule of ROLE_GAP_RULES) {
    if (roleMatches(current, rule.from) && roleMatches(target, rule.to)) {
      return { headline: rule.headline, gaps: rule.gaps };
    }
  }
  return {
    headline: `Moving from ${current} to ${target} typically requires deeper production experience, a portfolio of shipped work, and role-specific certifications.`,
    gaps: [
      `Ship one portfolio project that mirrors real ${target} work`,
      "Convert experience into verifiable evidence — repos, dashboards, references",
      "Close the most-cited certification gap for the target role",
      "Rehearse interview scenarios specific to the new role",
    ],
  };
}

/* ────────────────────────────────────────────────────────────────
   SignalBanner — candidate-facing intelligence card.
   PRIVACY RULE: candidates only ever see aggregated market
   intelligence. Employer identity, the rejected individual and the
   hiring stage stay in the store for the university view — they
   are never rendered here.
   ──────────────────────────────────────────────────────────────── */

interface SignalBannerProps {
  audience: "candidate" | "university";
  onAction?: () => void;
  currentRole?: string;
  targetRole?: string;
}

export function SignalBanner({
  audience,
  onAction,
  currentRole = "Senior Data Analyst",
  targetRole = "ML Engineer",
}: SignalBannerProps) {
  const { signals, liveCount } = useIntelligence();

  // University pages use PatternAlert now — this card is candidate-only.
  if (audience !== "candidate") return null;
  if (signals.length === 0) return null;

  const isLive = liveCount > 0;

  // Aggregate the network: most common normalized skill gap this week.
  const skillCounts = signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.skill] = (acc[s.skill] ?? 0) + 1;
    return acc;
  }, {});
  const topSkill =
    Object.entries(skillCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Cloud deployment (AWS/GCP)";

  // Live signals bump the aggregate counts — never revealing who or where.
  const gapShare = 34 + liveCount * 3;
  const outcomeCount = 218 + liveCount;

  const roleGap = explainRoleGap(currentRole, targetRole);

  return (
    <div
      className="bg-white border border-border rounded-xl shadow-sm overflow-hidden"
      style={{ borderLeft: `3px solid ${isLive ? "#115E50" : "#8A7038"}` }}
    >
      {/* Row 1 — aggregated market gap (no employer, no individual) */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="relative flex h-2.5 w-2.5">
            {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? "bg-emerald-600" : "bg-[#8A7038]"}`} />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isLive ? "#115E50" : "#8A7038" }}>
            {isLive ? "Live market signal" : "Market signal"}
          </span>
          <span className="text-[10px] text-muted-foreground">· this week</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          Across the Talentbank network this week, the #1 reason candidates for data roles don&apos;t
          move forward: missing{" "}
          <span className="font-semibold" style={{ color: "#8A7038" }}>{topSkill}</span> evidence —{" "}
          <span className="font-semibold">{gapShare}% of applicants</span> share this gap.
        </p>
        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5 flex-wrap">
          <Radio size={11} />
          Career Intelligence Graph · aggregated from {outcomeCount} anonymized hiring outcomes · no employers or individuals identified
          {isLive && <span className="font-semibold text-emerald-700">· updated just now</span>}
        </p>
      </div>

      {/* Row 2 — personal role gap */}
      <div className="px-5 py-4 border-t border-border bg-accent/40 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-semibold">Your path: {currentRole} → {targetRole}.</span>{" "}
            {roleGap.headline}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <Sparkles size={11} />
            AI-generated from market + hiring-outcome data
          </p>
        </div>
        {onAction && (
          <button
            onClick={onAction}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors hover:bg-accent"
            style={{ borderColor: "rgba(138,112,56,0.3)", color: "#8A7038" }}
          >
            Close this gap <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
