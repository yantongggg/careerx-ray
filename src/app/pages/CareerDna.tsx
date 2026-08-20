import {
  ArrowRight, BarChart3, Brain, CheckCircle, Github, Linkedin, Radar,
  ShieldCheck, Sparkles, Target, UserRoundCheck
} from "lucide-react";
import {
  RadarChart, Radar as RadarShape, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
} from "recharts";
import {
  archetypes,
  getArchetypeForScores,
  archetypeFor,
  getTopDimensions,
} from "../lib/careerDna.js";
import { useCareerProfile } from "../state/careerProfile";
import { NextStep } from "../state/stages";
import { detectRoleFamily, type RoleFamily } from "../lib/roleFamily";
import { levelOf, type JobLevel } from "../lib/careerCorpus";

const defaultDnaScores = {
  Technical: 88,
  Execution: 92,
  Communication: 76,
  Strategic: 60,
  Innovation: 52,
  Leadership: 64,
};

/* What the role you're aiming at actually leans on.

   This used to be one hardcoded set of numbers, identical for every
   user, so "conflict detection" produced the same four conflicts for a
   restaurant supervisor and a machine-learning engineer. The profile
   below is picked from the target role, so the comparison is against
   the job you want rather than against a fixed persona. */
/* The profile a role in this family usually leans on, at mid level.
   Authored, not measured — the page says so. */
const ASPIRATION_BY_FAMILY: Record<RoleFamily, Record<string, number>> = {
  data:      { Technical: 88, Strategic: 82, Execution: 74, Communication: 72, Innovation: 66, Leadership: 60 },
  software:  { Technical: 90, Execution: 82, Innovation: 74, Strategic: 70, Communication: 64, Leadership: 58 },
  design:    { Innovation: 90, Communication: 84, Strategic: 74, Execution: 70, Technical: 62, Leadership: 60 },
  marketing: { Communication: 88, Innovation: 82, Strategic: 78, Execution: 72, Leadership: 64, Technical: 56 },
  product:   { Strategic: 88, Communication: 84, Leadership: 78, Innovation: 74, Execution: 70, Technical: 64 },
  business:  { Communication: 90, Strategic: 78, Execution: 76, Leadership: 72, Innovation: 62, Technical: 52 },
  service:   { Communication: 86, Execution: 84, Leadership: 70, Strategic: 62, Innovation: 58, Technical: 50 },
  generic:   { Communication: 78, Execution: 78, Strategic: 74, Technical: 70, Innovation: 68, Leadership: 66 },
};

/* ────────────────────────────────────────────────────────────────
   Family alone was not enough.

   The benchmark was keyed only by family, so Data Analyst and Data
   Science Manager returned the same profile — and it put Leadership
   last at 60. The chart was telling someone aiming at a manager's job
   that leadership was the least of what the role needed.

   What a job asks for moves with the rung as much as with the field:
   a lead role wants judgement and people, an entry role wants
   execution, and the technical bar stops rising somewhere in between.
   ──────────────────────────────────────────────────────────────── */
const LEVEL_SHIFT: Record<JobLevel, Record<string, number>> = {
  entry:  { Technical:  +2, Execution:  +8, Strategic: -12, Leadership: -18, Communication:  -4, Innovation:  -2 },
  mid:    { Technical:   0, Execution:   0, Strategic:   0, Leadership:   0, Communication:   0, Innovation:   0 },
  senior: { Technical:  +4, Execution:  -2, Strategic:  +8, Leadership: +10, Communication:  +6, Innovation:  +2 },
  lead:   { Technical: -14, Execution: -10, Strategic: +14, Leadership: +30, Communication: +14, Innovation:  -2 },
};

/** The profile a specific role leans on — its field and its rung. */
function aspirationFor(targetRole: string): Record<string, number> {
  const base = ASPIRATION_BY_FAMILY[detectRoleFamily(targetRole)];
  const shift = LEVEL_SHIFT[levelOf(targetRole)];
  return Object.fromEntries(
    Object.entries(base).map(([dim, v]) =>
      [dim, Math.max(35, Math.min(95, v + (shift[dim] ?? 0)))],
    ),
  );
}

/* A dimension only counts as a conflict once the gap is wide enough to
   act on. Below this it is noise in a six-question calibration. */
const CONFLICT_THRESHOLD = 15;

const conflictInsights: Record<string, { rising: string; falling: string }> = {
  Technical: {
    rising: "You're building toward deeper technical mastery — your ambition exceeds your current evidence.",
    falling: "You've outgrown pure technical work. Your evidence says 'builder' but your mind says 'leader'.",
  },
  Execution: {
    rising: "You want to be more hands-on than your current role allows.",
    falling: "You're done being the doer. You want to be the one who decides what gets done.",
  },
  Strategic: {
    rising: "You're thinking bigger than your current role. The gap between doing and directing is where your next move lives.",
    falling: "You've moved past strategy into execution — you want to build, not just plan.",
  },
  Innovation: {
    rising: "You crave creative freedom your current work doesn't offer. This isn't restlessness — it's a signal.",
    falling: "You've shifted from experimenting to shipping. Your creative phase is maturing into craft.",
  },
  Leadership: {
    rising: "You're ready to lead but haven't had the chance to prove it yet. Seek ownership, not permission.",
    falling: "You've realized leadership isn't your goal — influence is. You'd rather shape ideas than manage people.",
  },
  Communication: {
    rising: "You want your work to speak louder. The gap says: learn to narrate, not just deliver.",
    falling: "You're pulling back from the spotlight to focus on depth. That's a valid strategic choice.",
  },
};

const signalLayers = [
  {
    title: "Past Evidence",
    subtitle: "What you have done",
    icon: Github,
    signals: ["12 projects scanned", "6 technical skills detected", "Consistent delivery evidence"],
  },
  {
    title: "Human Signal",
    subtitle: "How you work",
    icon: UserRoundCheck,
    signals: ["6 scenario answers", "Builder-first work style", "Moderate communication confidence"],
  },
  {
    title: "Future Fit",
    subtitle: "Where you can go next",
    icon: Target,
    signals: ["Best fit: builder paths", "Growth gaps: strategy, innovation", "Market aligned to tech execution"],
  },
];

const calibrationQuestions = [
  {
    q: "When you receive a vague task, what do you usually do first?",
    selected: "Break it into technical steps and start building",
    mapsTo: "Execution + Technical",
  },
  {
    q: "In a group project, which role do you naturally take?",
    selected: "The person who builds the main solution",
    mapsTo: "Technical + Execution",
  },
  {
    q: "When solving a difficult problem, what feels most natural?",
    selected: "Try a quick prototype and improve from there",
    mapsTo: "Innovation + Execution",
  },
];

const confidenceRows = [
  { dimension: "Technical", source: "GitHub projects, skills, resume", confidence: "High" },
  { dimension: "Execution", source: "Project completion, role history, answers", confidence: "High" },
  { dimension: "Communication", source: "LinkedIn descriptions, calibration", confidence: "Medium" },
  { dimension: "Leadership", source: "Role titles, team signals, answers", confidence: "Low" },
  { dimension: "Innovation", source: "Project variety, hackathon signals", confidence: "Medium" },
];

export function CareerDna({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { profile } = useCareerProfile();
  const dnaScores = Object.keys(profile.dnaScores).length ? profile.dnaScores : defaultDnaScores;
  const targetRole = profile.targetRole;
  const aspirationScores = aspirationFor(targetRole);

  const radarData = Object.entries(dnaScores).map(([subject, A]) => ({ subject, A }));
  const conflictRadarData = Object.entries(dnaScores).map(([subject, A]) => ({
    subject,
    evidence: A,
    aspiration: aspirationScores[subject] ?? 70,
  }));
  const conflicts = Object.entries(dnaScores)
    .map(([dim, evidenceVal]) => {
      const aspVal = aspirationScores[dim] ?? 70;
      const gap = aspVal - evidenceVal;
      return { dimension: dim, evidence: evidenceVal, aspiration: aspVal, gap, absGap: Math.abs(gap) };
    })
    .filter(c => c.absGap >= CONFLICT_THRESHOLD)
    .sort((a, b) => b.absGap - a.absGap);
  const primary = archetypeFor(profile);
  const aspirationPrimary = getArchetypeForScores(aspirationScores);
  const topDimensions = getTopDimensions(dnaScores);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        <div className="bg-slate-950 text-white rounded-2xl p-6 lg:p-7">
          <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-slate-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Sparkles size={13} /> Career DNA Archetype
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Not a personality test. A career direction map.</h1>
              <p className="text-sm text-slate-300 leading-relaxed mt-2 max-w-2xl">
                Career DNA combines professional evidence with scenario-based calibration, then maps your strongest dimensions to one of 12 career archetypes.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {topDimensions.map(d => (
                  <span key={d} className="text-xs bg-blue-500/15 text-blue-100 border border-blue-400/20 px-3 py-1 rounded-full font-semibold">{d}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-slate-950">
              <div className="flex items-center gap-4 mb-3">
                <img src={primary.image} alt={primary.animal} className="w-16 h-16 rounded-xl object-cover shadow-md" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Career DNA</p>
                  <h2 className="text-2xl font-bold mt-0.5">{primary.type}</h2>
                </div>
              </div>
              <p className="text-sm font-semibold text-primary">{primary.name} · {primary.core.join(" + ")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">{primary.oneLiner}</p>
              <button
                onClick={() => onNavigate?.("dna-method")}
                className="group mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                How was this worked out?
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">Your Career DNA result</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Generated from profile evidence + work-style calibration.</p>
              </div>
              <Radar size={18} className="text-muted-foreground" />
            </div>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <RadarShape dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.16} strokeWidth={2.5} isAnimationActive={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {Object.entries(dnaScores).map(([label, value]) => (
                <div key={label} className="border border-border rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{label}</span>
                    <span className="text-xs font-bold text-primary">{value}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={primary.image} alt={primary.animal} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Career DNA</p>
                    <h2 className="text-2xl font-bold text-foreground mt-1">{primary.type}</h2>
                    <p className="text-primary font-semibold text-sm mt-0.5">{primary.name}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">{primary.copy}</p>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top strengths</p>
                <div className="space-y-2">
                  {primary.strengths.map((s) => (
                    <p key={s} className="text-sm text-foreground flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" /> {s}
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Growth area</p>
                <p className="text-sm text-foreground leading-relaxed">{primary.blindSpot}</p>
              </div>
            </div>
            <div className="p-5 border-t border-border bg-blue-50/60">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Your career move</p>
              <p className="text-sm text-foreground leading-relaxed">{primary.move}</p>
            </div>
          </section>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {signalLayers.map(layer => (
            <section key={layer.title} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <layer.icon size={18} className="text-primary" />
              <h2 className="font-semibold text-foreground mt-3">{layer.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{layer.subtitle}</p>
              <div className="space-y-2 mt-4">
                {layer.signals.map(signal => (
                  <p key={signal} className="text-xs text-foreground flex items-start gap-2">
                    <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {signal}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6">
          <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={17} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Career Calibration sample</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Short scenario questions reduce over-reliance on GitHub and LinkedIn, especially for non-technical users.
            </p>
            <div className="space-y-3">
              {calibrationQuestions.map((item, i) => (
                <div key={item.q} className="border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Q{i + 1}</p>
                  <p className="text-sm font-semibold text-foreground">{item.q}</p>
                  <p className="text-xs text-primary mt-2">Selected: {item.selected}</p>
                  <p className="text-xs text-muted-foreground mt-1">Maps to: {item.mapsTo}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={17} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Career DNA confidence</h2>
            </div>
            <div className="space-y-3">
              {confidenceRows.map(row => (
                <div key={row.dimension} className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="text-sm font-semibold text-foreground">{row.dimension}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      row.confidence === "High"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : row.confidence === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}>{row.confidence}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{row.source}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <button
          onClick={() => onNavigate?.("dna-method")}
          className="group w-full bg-white border border-border rounded-xl p-5 shadow-sm text-left hover:border-primary/40 transition-colors flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <BarChart3 size={17} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">See the full 12-role model</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The three axes, all twelve roles, and how this was worked out.
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <h2 className="font-semibold text-foreground">Where you are vs. where you&apos;re headed</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              The blue shape is how you answered. The gold shape is the profile{" "}
              {targetRole ? <><strong className="text-foreground">{targetRole}</strong> usually leans on</> : "your target role usually leans on"} —
              its field and its level, written down rather than measured. Where they pull apart by
              more than {CONFLICT_THRESHOLD} points, that gap is your next move.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
            <div className="p-5">
              <div className="flex items-center justify-center gap-6 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#2563EB" }} />
                  <span className="text-xs font-semibold text-muted-foreground">You · what your answers show</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#8A7038" }} />
                  <span className="text-xs font-semibold text-muted-foreground">{targetRole || "Target role"} · typical profile</span>
                </div>
              </div>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={conflictRadarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
                    <RadarShape dataKey="evidence" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} strokeWidth={2.5} isAnimationActive={false} name="Evidence" />
                    <RadarShape dataKey="aspiration" stroke="#8A7038" fill="#8A7038" fillOpacity={0.10} strokeWidth={2.5} strokeDasharray="6 3" isAnimationActive={false} name="Target role" />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-3 text-center">
                  <img src={primary.image} alt={primary.animal} className="w-10 h-10 rounded-lg object-cover shadow-sm mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-foreground">{primary.type}</p>
                  <p className="text-xs text-blue-600 font-semibold">How you work now</p>
                </div>
                <div className="border border-amber-100 bg-amber-50/50 rounded-lg p-3 text-center">
                  <img src={aspirationPrimary.image} alt={aspirationPrimary.animal} className="w-10 h-10 rounded-lg object-cover shadow-sm mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-foreground">{aspirationPrimary.type}</p>
                  <p className="text-xs text-amber-700 font-semibold">Who you're becoming</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">
                {conflicts.length} gap{conflicts.length !== 1 ? "s" : ""} worth acting on
              </p>
              <div className="space-y-3">
                {conflicts.map(c => {
                  const direction = c.gap > 0 ? "rising" : "falling";
                  const insight = conflictInsights[c.dimension]?.[direction] || "";
                  return (
                    <div key={c.dimension} className="border border-border rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: c.gap > 0 ? "#8A7038" : "#2563EB" }} />
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-foreground">{c.dimension}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          c.gap > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {c.gap > 0 ? "↑" : "↓"} {c.absGap} pt gap
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Evidence: {c.evidence}</span>
                            <span>Target role: {c.aspiration}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                            <div className="absolute h-full bg-blue-400 rounded-full" style={{ width: `${c.evidence}%` }} />
                            <div className="absolute h-full border-2 border-amber-500 rounded-full" style={{ width: `${c.aspiration}%`, background: "transparent" }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">{insight}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 bg-slate-950 text-white rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Sparkles size={14} className="text-amber-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-200 uppercase tracking-wider mb-1">AI Insight</p>
                    <p className="text-sm leading-relaxed text-slate-200">
                      You read as a <span className="text-blue-300 font-semibold">{primary.type}</span> moving toward <span className="text-amber-300 font-semibold">{aspirationPrimary.type}</span>.
                      This isn't confusion — it's evolution. Your strongest conflicts ({conflicts.slice(0, 2).map(c => c.dimension).join(", ")}) point to a career identity that's outgrowing its current container.
                      The move: seek roles that reward {conflicts[0]?.gap > 0 ? "your emerging" : "your proven"} {conflicts[0]?.dimension.toLowerCase()} while giving you room to grow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-slate-950 text-white rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Linkedin size={18} className="text-blue-300 mt-0.5" />
            <div>
              <p className="font-semibold">Explainable, adaptive, actionable.</p>
              <p className="text-sm text-slate-300 mt-0.5">We do not treat this as a fixed identity. It updates every 6 months as evidence, work style, and market fit change.</p>
            </div>
          </div>
        </div>

        <NextStep currentPage="dna" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
