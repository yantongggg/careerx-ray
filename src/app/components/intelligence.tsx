import { createContext, useContext, useState, ReactNode } from "react";
import { ArrowRight, Radio } from "lucide-react";

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
   SignalBanner — the one consistent visual for the intelligence
   layer. Same card on every dashboard; only the sentence changes
   per audience, so the demo reads as one system, not three UIs.
   ──────────────────────────────────────────────────────────────── */

interface SignalBannerProps {
  audience: "candidate" | "university";
  onAction?: () => void;
}

export function SignalBanner({ audience, onAction }: SignalBannerProps) {
  const { latest, liveCount } = useIntelligence();
  if (!latest) return null;

  const isLive = latest.live;

  return (
    <div
      className="bg-white border border-border rounded-xl shadow-sm overflow-hidden"
      style={{ borderLeft: `3px solid ${isLive ? "#115E50" : "#8A7038"}` }}
    >
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Status dot */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? "bg-emerald-600" : "bg-[#8A7038]"}`} />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isLive ? "#115E50" : "#8A7038" }}>
            {isLive ? "Live signal" : "Network signal"}
          </span>
          <span className="text-[10px] text-muted-foreground">· {latest.time}</span>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          {audience === "candidate" ? (
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-semibold">{latest.employer}</span> rejected a{" "}
              <span className="font-semibold">{latest.role}</span> candidate at {latest.stage} stage —{" "}
              reason: <span className="font-semibold" style={{ color: "#8A7038" }}>&ldquo;{latest.reason}&rdquo;</span>.
              This matches an open gap on your profile.
            </p>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-semibold">{latest.employer}</span> rejected a{" "}
              <span className="font-semibold">{latest.role}</span> candidate —{" "}
              <span className="font-semibold" style={{ color: "#8A7038" }}>&ldquo;{latest.reason}&rdquo;</span>.
              An estimated <span className="font-semibold">34% of your CS graduates</span> share this gap.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
            <Radio size={11} />
            Career Intelligence Graph · anonymized hiring outcomes from the Talentbank network
            {liveCount > 0 && <span className="font-semibold text-emerald-700">· updated just now</span>}
          </p>
        </div>

        {/* Action */}
        {onAction && (
          <button
            onClick={onAction}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors hover:bg-accent"
            style={{ borderColor: "rgba(138,112,56,0.3)", color: "#8A7038" }}
          >
            {audience === "candidate" ? "Close this gap" : "Review curriculum impact"} <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
