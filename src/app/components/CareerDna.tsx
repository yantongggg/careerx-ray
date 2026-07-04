import {
  ArrowRight, BarChart3, Brain, CheckCircle, Github, Linkedin, Radar,
  ShieldCheck, Sparkles, Target, UserRoundCheck
} from "lucide-react";
import {
  RadarChart, Radar as RadarShape, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import {
  archetypes,
  getArchetypeForScores,
  getTopDimensions,
} from "../careerDna.js";

const dnaScores = {
  Technical: 88,
  Execution: 92,
  Communication: 76,
  Strategic: 60,
  Innovation: 52,
  Leadership: 64,
};

const radarData = Object.entries(dnaScores).map(([subject, A]) => ({ subject, A }));
const primary = getArchetypeForScores(dnaScores);
const topDimensions = getTopDimensions(dnaScores);

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

export function CareerDna() {
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Type</p>
                  <h2 className="text-2xl font-bold mt-0.5">{primary.name}</h2>
                </div>
              </div>
              <p className="text-sm font-semibold text-primary">{primary.type}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">{primary.oneLiner}</p>
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
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Archetype</p>
                    <h2 className="text-2xl font-bold text-foreground mt-1">{primary.name}</h2>
                    <p className="text-primary font-semibold text-sm mt-0.5">{primary.careerStyle}</p>
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

        <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={17} className="text-muted-foreground" />
            <h2 className="font-semibold text-foreground">12 archetypes model</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {archetypes.map(archetype => (
              <div key={archetype.name} className={`border rounded-xl p-4 ${archetype.name === primary.name ? "border-primary bg-blue-50" : "border-border bg-white"}`}>
                <div className="flex items-center gap-3">
                  <img src={archetype.image} alt={archetype.animal} className="w-11 h-11 rounded-lg object-cover shadow-sm flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{archetype.name}</p>
                    <p className="text-xs text-primary font-semibold mt-0.5">{archetype.core.join(" + ")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{archetype.type}</p>
                  </div>
                </div>
              </div>
            ))}
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
          <button className="inline-flex items-center justify-center gap-2 bg-white text-slate-950 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100">
            Use DNA in career plan <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
