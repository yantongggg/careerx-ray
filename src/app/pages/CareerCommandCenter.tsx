import {
  ArrowRight, CalendarClock, FileText, GraduationCap, Shield, Sparkles, Target,
  Video
} from "lucide-react";
import { SignalBanner, explainRoleGap } from "../state/intelligence";
import { JourneyTracker } from "../state/stages";
import { useCareerProfile } from "../state/careerProfile";
import { corpusFor, type Corpus } from "../lib/careerCorpus";
import type { CareerProfile } from "../lib/profileTypes";
import type { Risk } from "../lib/careerRisk";

interface CareerCommandCenterProps {
  onNavigate: (page: string) => void;
  /** Job id → when the application was sent. Empty until they apply. */
  appliedJobs?: Record<string, string>;
}

const SEVERITY_TONE = {
  critical: "red",
  high: "red",
  medium: "amber",
  low: "amber",
} as const;

/* ────────────────────────────────────────────────────────────────
   The three panels below follow the user's own state.

   They used to be constants: rehearse a SQL case, tailor a résumé for
   a Maybank analyst role, three applications at Maybank, Grab and
   Petronas, and four skill bars led by SQL. None of it moved when the
   person changed.
   ──────────────────────────────────────────────────────────────── */

const STAGE_TONE = [
  "bg-slate-50 text-slate-700 border-slate-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-amber-50 text-amber-700 border-amber-200",
];

/** The next three things worth doing, ordered by what is costing most. */
function buildNextActions(profile: CareerProfile, risks: Risk[], corpus: Corpus) {
  const top = corpus.rankedJobs[0];
  const worstRisk = risks[0];
  const actions: { title: string; impact: string; page: string; icon: typeof Video }[] = [];

  if (profile.evidence.length === 0) {
    actions.push({
      title: "Add your first piece of evidence",
      impact: "Every score here rests on your word until you do",
      page: "evidence", icon: FileText,
    });
  }
  if (top) {
    actions.push({
      title: `Tailor your résumé for ${top.company}`,
      impact: `Your strongest match at ${top.fit}% fit`,
      page: "jobs", icon: FileText,
    });
    actions.push({
      title: `Rehearse the ${top.position} interview`,
      impact: `${top.gaps[0] ?? "Their hardest requirement"} is what they will probe`,
      page: "coach", icon: Video,
    });
  }
  if (worstRisk) {
    actions.push({
      title: worstRisk.fix,
      impact: worstRisk.comparison.shortfall || worstRisk.metric,
      page: "prescription", icon: GraduationCap,
    });
  }
  return actions.slice(0, 3);
}

/** What the user has actually applied to — empty until they do. */
function buildApplications(profile: CareerProfile, corpus: Corpus, applied: Record<string, string>) {
  return corpus.rankedJobs
    .filter(j => applied[j.id])
    .map((j, i) => ({
      company: j.company,
      role: j.position,
      stage: "Applied",
      fit: j.fit,
      tone: STAGE_TONE[(i + 1) % STAGE_TONE.length],
    }));
}

/**
 * Where the evidence is strong and where it is missing.
 *
 * Strength here means corroboration, not proficiency: a skill the
 * target roles ask for and something independent backs is strong; one
 * nobody has backed is weak; one nothing mentions at all is missing.
 */
function buildEvidenceStrength(profile: CareerProfile, corpus: Corpus) {
  const evidenced = new Map<string, number>();
  profile.evidence.forEach(e => e.skills.forEach(sk => {
    evidenced.set(sk.toLowerCase(), (evidenced.get(sk.toLowerCase()) ?? 0) + 1);
  }));
  const onResume = new Set((profile.resume?.skills ?? []).map(sk => sk.toLowerCase()));

  return corpus.targetSkills.slice(0, 4).map(skill => {
    const key = skill.toLowerCase();
    const backing = [...evidenced.entries()].filter(([k]) => k.includes(key) || key.includes(k));
    const count = backing.reduce((sum, [, n]) => sum + n, 0);
    const claimed = [...onResume].some(sk => sk.includes(key) || key.includes(sk));

    if (count > 0) {
      return { skill, level: "strong" as const, note: `${count} verified item${count > 1 ? "s" : ""}` };
    }
    if (claimed) {
      return { skill, level: "weak" as const, note: "On your résumé, nothing backing it" };
    }
    return { skill, level: "missing" as const, note: "No evidence yet" };
  });
}

export function CareerCommandCenter({ onNavigate, appliedJobs = {} }: CareerCommandCenterProps) {
  const { profile, risks, targetGaps, scorecard } = useCareerProfile();
  const corpus = corpusFor(profile);
  const nextActions = buildNextActions(profile, risks, corpus);
  const applications = buildApplications(profile, corpus, appliedJobs);
  const evidenceStrength = buildEvidenceStrength(profile, corpus);
  const firstName = profile.resume?.name?.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const topGap = targetGaps[0]?.skill ?? risks[0]?.category.toLowerCase() ?? "your evidence record";
  const currentRole = profile.currentRole || "your current role";
  const targetRole = profile.targetRole || "your target role";
  const roleGap = explainRoleGap(currentRole, targetRole);

  /* Read from the shared derivation rather than a local list. The two
     used to disagree on the same screen — this page said AI risk was
     42% over 5 years where the dashboard said 62% over 24 months. */
  const topRisks = risks.slice(0, 3).map(risk => ({
    title: risk.category,
    detail: risk.headline,
    evidence: risk.evidence,
    severity: SEVERITY_TONE[risk.severity],
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        <div className="bg-slate-950 text-white rounded-2xl p-6 lg:p-7 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(217,193,138,0.25),transparent_58%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-sm bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-slate-200">
                  <Sparkles size={13} /> {greeting}
                </span>
              </div>
              {/* This opened on "Rehearse now", which pushed an interview
                  at someone who had not applied to anything yet. The
                  Command Center is where you arrive, so it greets you
                  and says where you stand. */}
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                {firstName ? `${firstName}, here's where you stand.` : "Here's where you stand."}
              </h1>
              <p className="text-base text-slate-300 leading-relaxed mt-3 max-w-2xl">
                You&apos;re moving from <strong className="text-white">{currentRole}</strong> to{" "}
                <strong className="text-white">{targetRole}</strong>.{" "}
                {risks.length
                  ? <>We found <strong className="text-white">{risks.length} thing{risks.length === 1 ? "" : "s"}</strong> standing in the way — the biggest is {topGap}.</>
                  : <>Nothing structural is standing in your way right now.</>}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <button onClick={() => onNavigate("dashboard")} className="inline-flex items-center gap-2 bg-white text-slate-950 px-5 py-3 rounded-xl text-base font-semibold hover:bg-slate-100">
                  See the full scan <ArrowRight size={16} />
                </button>
                <button onClick={() => onNavigate("jobs")} className="text-sm text-slate-400 hover:text-white transition-colors underline underline-offset-4">
                  Job matches
                </button>
                <button onClick={() => onNavigate("onboarding")} className="text-sm text-slate-400 hover:text-white transition-colors underline underline-offset-4">
                  Re-scan
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 bg-white/8 border border-white/10 rounded-xl px-6 py-5 text-center">
              <p className="text-4xl font-bold">{scorecard.careerHealth}<span className="text-lg text-slate-400">/100</span></p>
              <p className="text-xs text-slate-400 mt-1">Career Health</p>
              <p className="text-[10px] text-slate-400 mt-1.5">Scanned {profile.scannedAt || "just now"}</p>
            </div>
          </div>
        </div>

        <JourneyTracker currentPage="command" onNavigate={onNavigate} />

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">Market + role signals</p>
          <div className="space-y-3">
            <SignalBanner
              audience="candidate"
              onAction={() => onNavigate("prescription")}
            />

            {/* Role gap — what typically blocks this exact move */}
            <section className="bg-white border border-border rounded-xl shadow-sm px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Your role gap · {currentRole} <span className="text-muted-foreground">→</span> {targetRole}
                  </p>
                  <ul className="mt-2.5 grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {roleGap.gaps.slice(0, 2).map(gap => (
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
                  View plan <ArrowRight size={12} />
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
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Top 3 risks */}
          <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Top 3 risks</h2>
              </div>
              <button onClick={() => onNavigate("dashboard")} className="text-xs font-semibold text-primary hover:underline">All {risks.length} →</button>
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
                <span className="font-semibold text-foreground">Next:</span> add one measurable cloud project to unlock 3 roles.
              </p>
            </div>
          </section>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
          <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Today&apos;s next best actions</h2>
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
              </div>
              <CalendarClock size={17} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {applications.length === 0 && (
                <div className="border border-dashed border-border rounded-xl p-5 text-center">
                  <p className="text-sm text-foreground font-medium">No applications yet</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {corpus.rankedJobs[0]
                      ? `Your strongest match right now is ${corpus.rankedJobs[0].position} at ${corpus.rankedJobs[0].company}.`
                      : "Finish your scan to see matched roles."}
                  </p>
                  <button onClick={() => onNavigate("jobs")} className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1">
                    See matched roles <ArrowRight size={12} />
                  </button>
                </div>
              )}
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
