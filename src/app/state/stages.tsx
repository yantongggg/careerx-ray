import { ReactNode } from "react";
import {
  AlertTriangle, ArrowRight, BarChart3, Briefcase, Check, FlaskConical,
  Fingerprint, Globe, Layers, Pill, Radar, Scale, ShieldCheck, Target, Video,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   The candidate journey: five color-coded stages.
   Sidebar, journey tracker, and stage hub pages all read from here
   so the product tells one story everywhere.
   ──────────────────────────────────────────────────────────────── */

export interface StageTool {
  page: string;
  label: string;
  desc: string;
  icon: any;
  badge?: string;
}

export interface JourneyStage {
  id: string;
  num: string;
  label: string;
  color: string;
  tint: string;
  icon: any;
  question: string;
  desc: string;
  status: "done" | "current" | "upcoming";
  tools: StageTool[];
}

export const JOURNEY: JourneyStage[] = [
  {
    id: "stage-diagnose", num: "01", label: "Diagnose",
    color: "#16284B", tint: "rgba(22,40,75,0.06)", icon: Radar,
    question: "Where do I stand today?",
    desc: "Understand your current career position — strengths, risks, and how the market sees you.",
    status: "done",
    tools: [
      { page: "dashboard",  label: "X-Ray Dashboard", desc: "Your full scan: health score, risk models, market position.", icon: BarChart3 },
      { page: "dna",        label: "Career DNA", desc: "Your archetype, strongest dimensions, and evidence-aspiration conflicts.", icon: Fingerprint },
      { page: "blindspots", label: "Blind Spots", desc: "Career risks you can't see from inside your own career.", icon: AlertTriangle, badge: "5" },
    ],
  },
  {
    id: "stage-decide", num: "02", label: "Decide",
    color: "#4F46E5", tint: "rgba(79,70,229,0.06)", icon: Scale,
    question: "Which move should I make?",
    desc: "Compare possible paths and offers with evidence and market data — before committing.",
    status: "done",
    tools: [
      { page: "decisionlab", label: "Decision Lab", desc: "Simulate 4 future career paths: salary, growth, and satisfaction.", icon: FlaskConical },
      { page: "offers",      label: "Offer Decision AI", desc: "Compare offers by long-term fit, not just starting salary.", icon: Scale },
    ],
  },
  {
    id: "stage-prepare", num: "03", label: "Prepare",
    color: "#B45309", tint: "rgba(180,83,9,0.07)", icon: Target,
    question: "Am I ready for it?",
    desc: "Close the gaps that block your target roles, then rehearse until you're interview-ready.",
    status: "current",
    tools: [
      { page: "prescription", label: "Career Prescription", desc: "Your 30/90-day action plan to close the gaps that matter.", icon: Pill },
      { page: "coach",        label: "Interview Coach", desc: "Rehearse the exact interview you have coming up.", icon: Video },
    ],
  },
  {
    id: "stage-apply", num: "04", label: "Apply",
    color: "#0D9488", tint: "rgba(13,148,136,0.07)", icon: Briefcase,
    question: "Where can I get hired today?",
    desc: "Apply to roles your evidence already supports, and track every application to interview.",
    status: "upcoming",
    tools: [
      { page: "jobs", label: "Jobs + Applications", desc: "Matched roles from Talentbank, ranked by your real readiness.", icon: Briefcase },
    ],
  },
  {
    id: "stage-prove", num: "05", label: "Prove",
    color: "#15803D", tint: "rgba(21,128,61,0.07)", icon: ShieldCheck,
    question: "Can I prove it?",
    desc: "Turn projects, internships, and certifications into verified career evidence employers trust.",
    status: "upcoming",
    tools: [
      { page: "evidence",  label: "Career Evidence", desc: "Your living, verified profile — the backbone of every recommendation.", icon: Layers },
      { page: "portfolio", label: "Portfolio Builder", desc: "Publish your evidence as a shareable portfolio.", icon: Globe },
    ],
  },
];

export const stageForPage = (page: string): JourneyStage | undefined =>
  JOURNEY.find(s => s.id === page || s.tools.some(t => t.page === page));

/* ── Horizontal journey tracker ── */

export function JourneyTracker({ currentStageId, onNavigate }: { currentStageId?: string; onNavigate: (page: string) => void }) {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm p-2 overflow-x-auto">
      <div className="flex items-stretch min-w-[560px]">
        {JOURNEY.map((stage, i) => {
          const active = stage.id === currentStageId || (!currentStageId && stage.status === "current");
          return (
            <div key={stage.id} className="flex items-center flex-1">
              <button
                onClick={() => onNavigate(stage.id)}
                className={`flex-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-muted ${active ? "ring-1" : ""}`}
                style={active ? { backgroundColor: stage.tint, ["--tw-ring-color" as any]: stage.color } : {}}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: stage.status === "done" ? stage.color : "white",
                    border: `2px solid ${stage.status === "upcoming" ? "rgba(22,40,75,0.15)" : stage.color}`,
                  }}
                >
                  {stage.status === "done"
                    ? <Check size={12} className="text-white" />
                    : stage.status === "current"
                      ? <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                      : <span className="text-[9px] font-bold" style={{ color: "rgba(22,40,75,0.35)" }}>{stage.num}</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight" style={{ color: stage.status === "upcoming" ? "rgba(22,40,75,0.45)" : stage.color }}>
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate max-lg:hidden">
                    {stage.status === "done" ? "Complete" : stage.status === "current" ? "You are here" : stage.question}
                  </p>
                </div>
              </button>
              {i < JOURNEY.length - 1 && (
                <div className="w-4 h-px flex-shrink-0" style={{ backgroundColor: "rgba(22,40,75,0.12)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Stage hub page ── */

export function StageHub({ stage, onNavigate, children }: { stage: JourneyStage; onNavigate: (page: string) => void; children?: ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">

        <JourneyTracker currentStageId={stage.id} onNavigate={onNavigate} />

        {/* Stage hero */}
        <div className="bg-white border border-border rounded-2xl shadow-sm p-6 lg:p-7" style={{ borderTop: `3px solid ${stage.color}` }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stage.tint }}>
              <stage.icon size={22} style={{ color: stage.color }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: stage.color }}>Stage {stage.num} · {stage.label}</p>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">{stage.question}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 max-w-2xl">{stage.desc}</p>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stage.tools.map(tool => (
            <button
              key={tool.page}
              onClick={() => onNavigate(tool.page)}
              className="bg-white border border-border rounded-xl p-5 shadow-sm text-left hover:shadow-md transition-all group"
              style={{ borderLeft: `3px solid ${stage.color}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: stage.tint }}>
                  <tool.icon size={16} style={{ color: stage.color }} />
                </div>
                <div className="flex items-center gap-2">
                  {tool.badge && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">{tool.badge}</span>
                  )}
                  <ArrowRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              <p className="font-semibold text-foreground mt-4">{tool.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">{tool.desc}</p>
            </button>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
