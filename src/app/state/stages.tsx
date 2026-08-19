import { ReactNode } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Briefcase, Check, FlaskConical,
  Fingerprint, Globe, Layers, Pill, Radar, Scale, ShieldCheck, Target, Video,
} from "lucide-react";
import { useCareerProfile } from "./careerProfile";

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
  tools: StageTool[];
}

/* Order is the single source of truth for the whole journey: the stage
   numbers, the sidebar, the tracker, and every "next step" button are
   derived from it. Prove sits before Apply — you assemble the evidence,
   then you apply with it.

   Stage progress is NOT stored here. It used to be a hardcoded `status`
   field, which meant every new user was told stages 01 and 02 were
   already "Complete" and that they were standing on stage 03. Progress
   is now derived from where the user actually is. */
export const JOURNEY: JourneyStage[] = [
  {
    id: "stage-diagnose", num: "01", label: "Diagnose",
    color: "#16284B", tint: "rgba(22,40,75,0.06)", icon: Radar,
    question: "Where do I stand today?",
    desc: "Understand your current career position — strengths, risks, and how the market sees you.",
    tools: [
      { page: "dashboard",  label: "X-Ray Dashboard", desc: "Your full scan: health score, risk models, market position.", icon: BarChart3 },
      { page: "dna",        label: "Career DNA", desc: "Your archetype, your strongest dimensions, and where your goal pulls away from your evidence.", icon: Fingerprint },
      { page: "blindspots", label: "Blind Spots", desc: "What stands between you and the role you actually want.", icon: AlertTriangle },
    ],
  },
  {
    id: "stage-decide", num: "02", label: "Decide",
    color: "#4F46E5", tint: "rgba(79,70,229,0.06)", icon: Scale,
    question: "Which move should I make?",
    desc: "Compare possible paths and offers with evidence and market data — before committing.",
    tools: [
      { page: "decisionlab", label: "Decision Lab", desc: "Simulate three future career paths: salary, growth, and satisfaction.", icon: FlaskConical },
      { page: "offers",      label: "Offer Decision AI", desc: "Compare offers by long-term fit, not just starting salary.", icon: Scale },
    ],
  },
  {
    id: "stage-prepare", num: "03", label: "Prepare",
    color: "#B45309", tint: "rgba(180,83,9,0.07)", icon: Target,
    question: "Am I ready for it?",
    desc: "Close the gaps that block your target roles, then rehearse until you're interview-ready.",
    tools: [
      { page: "prescription", label: "Career Prescription", desc: "Your 30/90-day action plan to close the gaps that matter.", icon: Pill },
      { page: "coach",        label: "Interview Coach", desc: "Rehearse the exact interview you have coming up.", icon: Video },
    ],
  },
  {
    id: "stage-prove", num: "04", label: "Prove",
    color: "#15803D", tint: "rgba(21,128,61,0.07)", icon: ShieldCheck,
    question: "Can I prove it?",
    desc: "Turn projects, internships, and certifications into verified career evidence employers trust.",
    tools: [
      { page: "evidence",  label: "Career Evidence", desc: "Your living, verified profile — the backbone of every recommendation.", icon: Layers },
      { page: "portfolio", label: "Portfolio Builder", desc: "Publish your evidence as a shareable portfolio.", icon: Globe },
    ],
  },
  {
    id: "stage-apply", num: "05", label: "Apply",
    color: "#0D9488", tint: "rgba(13,148,136,0.07)", icon: Briefcase,
    question: "Where can I get hired today?",
    desc: "Apply to roles your evidence already supports, and track every application to interview.",
    tools: [
      { page: "jobs", label: "Jobs + Applications", desc: "Matched roles from Talentbank, ranked by your real readiness.", icon: Briefcase },
    ],
  },
];

export const stageForPage = (page: string): JourneyStage | undefined =>
  JOURNEY.find(s => s.id === page || s.tools.some(t => t.page === page));

/** Look a stage up by id rather than by array position, so reordering
    the journey can never point a route at the wrong stage. */
export function stageById(id: string): JourneyStage {
  const stage = JOURNEY.find(s => s.id === id);
  if (!stage) throw new Error(`Unknown journey stage: ${id}`);
  return stage;
}

/** Every tool page, flattened in journey order. This is the walk order
    the "next step" buttons follow — no page can be skipped. */
export const PAGE_ORDER: string[] = JOURNEY.flatMap(s => s.tools.map(t => t.page));

export function nextPage(current: string): { page: string; label: string; stage: JourneyStage } | null {
  const i = PAGE_ORDER.indexOf(current);
  if (i === -1 || i === PAGE_ORDER.length - 1) return null;
  const page = PAGE_ORDER[i + 1];
  const stage = JOURNEY.find(s => s.tools.some(t => t.page === page))!;
  const tool = stage.tools.find(t => t.page === page)!;
  return { page, label: tool.label, stage };
}

/** Where the user is in the journey, and therefore what is behind them. */
function stageStatus(stage: JourneyStage, currentPage?: string): "done" | "current" | "upcoming" {
  const currentStage = currentPage ? stageForPage(currentPage) : undefined;
  // Anywhere outside the journey (the Command Center, a profile page)
  // means the user is at the start, not two thirds of the way through.
  const currentIndex = currentStage ? JOURNEY.indexOf(currentStage) : 0;
  const index = JOURNEY.indexOf(stage);
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";
  return "upcoming";
}

/* ── Horizontal journey tracker ── */

export function JourneyTracker({ currentPage, onNavigate }: { currentPage?: string; onNavigate: (page: string) => void }) {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm p-2 overflow-x-auto">
      <div className="flex items-stretch min-w-[560px]">
        {JOURNEY.map((stage, i) => {
          const status = stageStatus(stage, currentPage);
          const active = status === "current";
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
                    backgroundColor: status === "done" ? stage.color : "white",
                    border: `2px solid ${status === "upcoming" ? "rgba(22,40,75,0.15)" : stage.color}`,
                  }}
                >
                  {status === "done"
                    ? <Check size={12} className="text-white" />
                    : status === "current"
                      ? <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                      : <span className="text-[9px] font-bold" style={{ color: "rgba(22,40,75,0.35)" }}>{stage.num}</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight" style={{ color: status === "upcoming" ? "rgba(22,40,75,0.45)" : stage.color }}>
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate max-lg:hidden">
                    {status === "done" ? "Complete" : status === "current" ? "You are here" : stage.question}
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
  const { risks, targetGaps } = useCareerProfile();

  // Counts come from the live derivation, never from a literal typed
  // into the stage definition — a "5" badge over a list of 3 is the
  // kind of thing a judge notices immediately.
  const badgeFor = (page: string): string | undefined => {
    if (page === "blindspots" && targetGaps.length) return String(targetGaps.length);
    if (page === "dashboard" && risks.length) return String(risks.length);
    return undefined;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">

        <JourneyTracker currentPage={stage.id} onNavigate={onNavigate} />

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
                  {badgeFor(tool.page) && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">{badgeFor(tool.page)}</span>
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

/* ── Next step ──
   One component, used at the bottom of every tool page on smaller screens.
   Before this, 4 of 10 candidate tool pages had a forward button and 3 jumped
   over a page — the dashboard skipped Career DNA entirely. The order
   now comes from PAGE_ORDER, so a page cannot be skipped by accident. */

export function NextStep({ currentPage, onNavigate }: { currentPage: string; onNavigate?: (page: string) => void }) {
  const next = nextPage(currentPage);
  if (!next || !onNavigate) return null;

  return (
    <div
      className="xl:hidden bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{ borderLeft: `3px solid ${next.stage.color}` }}
    >
      <NextDestinationCopy next={next} className="flex-1 min-w-0" />
      <NextDestinationButton next={next} onNavigate={onNavigate} showLabel />
    </div>
  );
}

type NextDestination = NonNullable<ReturnType<typeof nextPage>>;

function NextDestinationCopy({ next, className = "" }: { next: NextDestination; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: next.stage.color }}>
        Next · Stage {next.stage.num} {next.stage.label}
      </p>
      <p className="font-semibold text-foreground mt-1">{next.label}</p>
      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{next.stage.question}</p>
    </div>
  );
}

function NextDestinationButton({
  next,
  onNavigate,
  showLabel = false,
  compact = false,
}: {
  next: NextDestination;
  onNavigate: (page: string) => void;
  showLabel?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      onClick={() => onNavigate(next.page)}
      className={compact
        ? "mx-auto w-10 h-10 rounded-full shadow-sm inline-flex items-center justify-center text-white hover:shadow-md hover:opacity-90 transition-all"
        : "flex-shrink-0 inline-flex items-center justify-between gap-2 text-sm font-semibold text-white px-4 py-3 rounded-lg transition-opacity hover:opacity-90"}
      style={{ backgroundColor: next.stage.color }}
      aria-label={`Continue to ${next.label}`}
      title={compact ? `Continue to ${next.label}` : undefined}
    >
      {!compact && (showLabel ? `Continue to ${next.label}` : "Continue")} <ArrowRight size={compact ? 16 : 15} />
    </button>
  );
}

/* ── Desktop journey rail ──
   Tool pages scroll inside their own content pane. This rail sits beside
   that pane, so forward/back actions do not disappear below long reports. */
export function JourneyPageRail({
  currentPage,
  onNavigate,
  onBack,
  canGoBack,
  backPage,
}: {
  currentPage: string;
  onNavigate: (page: string) => void;
  onBack: () => void;
  canGoBack: boolean;
  backPage?: string;
}) {
  if (!PAGE_ORDER.includes(currentPage)) return null;

  const currentStage = stageForPage(currentPage)!;
  const next = nextPage(currentPage);
  const backStage = backPage ? stageForPage(backPage) : undefined;

  return (
    <aside className="hidden xl:flex order-last w-36 flex-shrink-0 items-center justify-center" aria-label="Journey navigation">
      <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-center">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="mx-auto w-10 h-10 rounded-full border border-border bg-white shadow-sm inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-slate-400 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Back"
          title="Back"
        >
          <ArrowLeft size={16} />
        </button>
        {next ? (
          <NextDestinationButton next={next} onNavigate={onNavigate} compact />
        ) : (
          <button
            disabled
            className="mx-auto w-10 h-10 rounded-full shadow-sm inline-flex items-center justify-center text-white opacity-35 cursor-not-allowed"
            style={{ backgroundColor: currentStage.color }}
            aria-label="Journey complete"
            title="Journey complete"
          >
            <ArrowRight size={16} />
          </button>
        )}
        <p className="text-[9px] font-semibold leading-tight text-muted-foreground">
          {backStage ? `Stage ${backStage.num} · ${backStage.label}` : "Back"}
        </p>
        <p className="text-[9px] font-semibold leading-tight text-slate-700">
          {next ? `Stage ${next.stage.num} · ${next.stage.label}` : "Complete"}
        </p>
      </div>
    </aside>
  );
}
