import {
  ArrowRight, BarChart3, Briefcase, CalendarClock, CheckCircle, FileText,
  GraduationCap, MessageSquareText, Shield, Sparkles, Target, TrendingUp,
  Video, Zap
} from "lucide-react";
import { SignalBanner, explainRoleGap } from "./intelligence";
import { JourneyTracker } from "./stages";

interface CareerCommandCenterProps {
  onNavigate: (page: string) => void;
  profile?: { currentRole: string; targetRole: string } | null;
}

const nextActions = [
  { title: "Rehearse SQL case interview", impact: "Interview in 2 days", page: "coach", icon: Video },
  { title: "Tailor resume for Maybank Data Analyst", impact: "+11% interview chance", page: "jobs", icon: FileText },
  { title: "Close cloud skill gap", impact: "Blocks 3 target roles", page: "prescription", icon: GraduationCap },
];

const applications = [
  { company: "Maybank", role: "Data Analyst", stage: "Interview", fit: 91, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { company: "Grab", role: "Analytics Engineer", stage: "Screening", fit: 86, tone: "bg-blue-50 text-blue-700 border-blue-200" },
  { company: "Petronas Digital", role: "AI Product Analyst", stage: "Applied", fit: 78, tone: "bg-amber-50 text-amber-700 border-amber-200" },
];

const topRisks = [
  {
    title: "AI disruption risk: Medium",
    detail: "42% of your current tasks are automatable within 5 years",
    evidence: "Based on your verified skill evidence",
    severity: "amber" as const,
  },
  {
    title: "No cloud deployment evidence",
    detail: "Blocks 3 of your target roles",
    evidence: "Flagged by live hiring signals this week",
    severity: "red" as const,
  },
  {
    title: "Salary below market",
    detail: "RM 1.2k under the Klang Valley median for your level",
    evidence: "Benchmarked against real offer outcomes",
    severity: "amber" as const,
  },
];

const evidenceStrength = [
  { skill: "SQL", level: "strong" as const, note: "3 verified projects" },
  { skill: "Data storytelling", level: "strong" as const, note: "Portfolio + interview score" },
  { skill: "Leadership", level: "weak" as const, note: "1 unverified signal" },
  { skill: "Cloud deployment", level: "missing" as const, note: "No evidence yet" },
];

export function CareerCommandCenter({ onNavigate, profile }: CareerCommandCenterProps) {
  const currentRole = profile?.currentRole ?? "Senior Data Analyst";
  const targetRole = profile?.targetRole ?? "ML Engineer";
  const roleGap = explainRoleGap(currentRole, targetRole);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        <div className="bg-slate-950 text-white rounded-2xl p-6 lg:p-7 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(217,193,138,0.25),transparent_58%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-slate-200">
                  <Sparkles size={12} /> Your next best move
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Jordan, rehearse your Maybank interview.</h1>
              <p className="text-sm text-slate-300 leading-relaxed mt-2 max-w-2xl">
                It's in 2 days. Your SQL evidence is strong — and live hiring signals show the interview stage is where candidates like you drop off most.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-5">
                <button onClick={() => onNavigate("coach")} className="inline-flex items-center gap-2 bg-white text-slate-950 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100">
                  Start rehearsal <ArrowRight size={14} />
                </button>
                <button onClick={() => onNavigate("jobs")} className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4">
                  View job matches
                </button>
                <button onClick={() => onNavigate("onboarding")} className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4">
                  Re-scan my X-Ray
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 bg-white/8 border border-white/10 rounded-xl px-6 py-5 text-center">
              <p className="text-4xl font-bold">82<span className="text-lg text-slate-400">/100</span></p>
              <p className="text-xs text-slate-400 mt-1">Career Readiness</p>
              <p className="text-[10px] text-emerald-300 font-semibold mt-1.5">▲ +6 since last scan</p>
            </div>
          </div>
        </div>

        <JourneyTracker onNavigate={onNavigate} />

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">Why this matters · powered by Talentbank intelligence</p>
          <div className="space-y-3">
            <SignalBanner
              audience="candidate"
              onAction={() => onNavigate("prescription")}
              currentRole={currentRole}
              targetRole={targetRole}
            />

            {/* Role gap — what typically blocks this exact move */}
            <section className="bg-white border border-border rounded-xl shadow-sm px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Your role gap · {currentRole} <span className="text-muted-foreground">→</span> {targetRole}
                  </p>
                  <ul className="mt-2.5 grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {roleGap.gaps.map(gap => (
                      <li key={gap} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "#8A7038" }} />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => onNavigate("prescription")}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors hover:bg-accent"
                  style={{ borderColor: "rgba(138,112,56,0.3)", color: "#8A7038" }}
                >
                  Close these gaps <ArrowRight size={12} />
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Application Readiness Section */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Application Readiness</h2>
              <p className="text-xs text-muted-foreground mt-0.5">How ready your applications look to employers — you're doing great</p>
            </div>
            <Shield size={17} className="text-primary" />
          </div>
          <div className="grid sm:grid-cols-[180px_1fr] gap-5">
            <div className="flex flex-col items-center p-4 rounded-xl bg-accent border border-border">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(22,40,75,0.08)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#115E50" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${94 * 3.14} ${100 * 3.14}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">94</span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">Good Standing</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Reply Speed", score: 96, desc: "Avg 2.1 hrs" },
                  { label: "Interview Attendance", score: 100, desc: "Never missed" },
                  { label: "Document Timeliness", score: 90, desc: "Submitted on time" },
                  { label: "Communication", score: 88, desc: "Clear & professional" },
                ].map(item => (
                  <div key={item.label} className="p-2.5 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{item.label}</span>
                      <span className="text-xs font-bold text-primary">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${item.score}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 pt-2 border-t border-border text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Fast, consistent replies keep you fully visible to employers — keep it up.</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Top 3 risks */}
          <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Top 3 risks</h2>
                <p className="text-xs text-muted-foreground mt-0.5">From your latest X-Ray scan.</p>
              </div>
              <button onClick={() => onNavigate("blindspots")} className="text-xs font-semibold text-primary hover:underline">All 5 →</button>
            </div>
            <div className="divide-y divide-border">
              {topRisks.map(risk => (
                <button key={risk.title} onClick={() => onNavigate("blindspots")} className="w-full px-5 py-3.5 flex items-start gap-3 text-left hover:bg-muted/50">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${risk.severity === "red" ? "bg-red-500" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{risk.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{risk.detail}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1 italic">{risk.evidence}</p>
                  </div>
                  <ArrowRight size={13} className="text-muted-foreground mt-1" />
                </button>
              ))}
            </div>
          </section>

          {/* Evidence strength */}
          <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Evidence strength</h2>
                <p className="text-xs text-muted-foreground mt-0.5">What your profile can prove — recommendations are built on this.</p>
              </div>
              <button onClick={() => onNavigate("evidence")} className="text-xs font-semibold text-primary hover:underline">Add evidence →</button>
            </div>
            <div className="divide-y divide-border">
              {evidenceStrength.map(item => (
                <div key={item.skill} className="px-5 py-3 flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border flex-shrink-0 w-[72px] text-center ${
                    item.level === "strong" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : item.level === "weak" ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-600 border-red-200"
                  }`}>
                    {item.level}
                  </span>
                  <p className="text-sm font-medium text-foreground flex-1">{item.skill}</p>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-accent/60 border-t border-border">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Next best evidence:</span> one cloud project with measurable impact — unblocks 3 target roles.
              </p>
            </div>
          </section>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
          <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Today&apos;s next best actions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Ranked by impact on getting hired.</p>
              </div>
              <Target size={17} className="text-muted-foreground" />
            </div>
            <div className="divide-y divide-border">
              {nextActions.map((action, i) => (
                <button key={action.title} onClick={() => onNavigate(action.page)} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center text-sm font-bold">{i + 1}</div>
                  <action.icon size={17} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.impact}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-border rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">Application snapshot</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Planning to interview, not just apply.</p>
              </div>
              <CalendarClock size={17} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {applications.map(app => (
                <div key={`${app.company}-${app.role}`} className="border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{app.role}</p>
                      <p className="text-xs text-muted-foreground">{app.company}</p>
                    </div>
                    <span className={`text-xs font-semibold border px-2 py-1 rounded-full ${app.tone}`}>{app.stage}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${app.fit}%` }} />
                    </div>
                    <span className="text-xs font-bold text-foreground">{app.fit}% fit</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
