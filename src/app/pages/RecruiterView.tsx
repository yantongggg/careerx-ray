import {
  MapPin, Briefcase, CheckCircle, Star, TrendingUp, Shield,
  ExternalLink, Award, Code2, GitBranch, Trophy, Brain,
  ArrowLeft, Share2, Download, Zap, Users, Clock, BarChart3,
  Globe, Linkedin, Github
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip
} from "recharts";

const radarData = [
  { subject: "Technical Depth",    A: 84 },
  { subject: "Leadership",         A: 62 },
  { subject: "Industry Exposure",  A: 76 },
  { subject: "Innovation",         A: 88 },
  { subject: "Communication",      A: 79 },
  { subject: "Portfolio Strength", A: 91 },
];

const trajectoryData = [
  { year: "2022", score: 58 },
  { year: "2023", score: 68 },
  { year: "2024", score: 74 },
  { year: "2025", score: 80 },
  { year: "2026", score: 88 },
];

const highlights = [
  { emoji: "🏆", title: "SuperAI NEXT Finalist", meta: "Top 5 / 2,400+ applicants · Jun 2026",     verified: true  },
  { emoji: "☁️", title: "AWS Solutions Architect", meta: "Amazon Web Services · Apr 2026",          verified: true  },
  { emoji: "💻", title: "AI Maritime Verification Platform", meta: "LangGraph + GPT-4o · Mar 2026", verified: true  },
  { emoji: "⚡", title: "Stripe ML Hackathon — 1st Place",   meta: "Stripe Internal · Nov 2023",    verified: true  },
  { emoji: "🔧", title: "dbt Metrics OSS Package",           meta: "89★ GitHub · Jul 2023",         verified: true  },
  { emoji: "📝", title: "Fraud Pattern Detection — TDS",     meta: "4,200 reads · Feb 2024",        verified: true  },
];

const dna = [
  { label: "Builder",      pct: 92, color: "bg-blue-500"   },
  { label: "Specialist",   pct: 84, color: "bg-emerald-500" },
  { label: "Entrepreneur", pct: 71, color: "bg-purple-500"  },
  { label: "Leader",       pct: 65, color: "bg-rose-500"    },
];

const skills = [
  "Python", "SQL", "dbt", "LangGraph", "GPT-4o", "AWS",
  "FastAPI", "MLflow", "Looker", "Kafka", "XGBoost", "Spark",
  "Statistics", "Data Modeling", "Technical Writing",
];

const metrics = [
  { label: "Career Health",     value: "84",  unit: "/100", color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-100", icon: Shield    },
  { label: "Future Potential",  value: "91",  unit: "%",    color: "text-blue-600",   bg: "bg-blue-50",     border: "border-blue-100",    icon: TrendingUp },
  { label: "Promotion Ready",   value: "74",  unit: "%",    color: "text-purple-600", bg: "bg-purple-50",   border: "border-purple-100",  icon: Award      },
  { label: "AI Risk Exposure",  value: "Low", unit: "",     color: "text-emerald-600",bg: "bg-emerald-50",  border: "border-emerald-100", icon: Brain      },
];

interface RecruiterViewProps {
  onBack: () => void;
}

export function RecruiterView({ onBack }: RecruiterViewProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">

        {/* Recruiter bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} /> Back to Living Portfolio
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-white border border-border px-3 py-1.5 rounded-lg">
              Recruiter View · Public Link Active
            </span>
            <button className="flex items-center gap-2 border border-border bg-white text-foreground text-sm px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium">
              <Share2 size={14} /> Share Link
            </button>
            <button className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8 mb-5">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              JK
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">Jordan Kim</h1>
                  <p className="text-muted-foreground">Senior Data Analyst → ML Engineer · Stripe</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin size={12} /> San Francisco, CA
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase size={12} /> 6 years experience
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle size={12} /> Verified Profile
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Github size={16} /><Linkedin size={16} /><Globe size={16} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {["AI/ML", "Python", "dbt", "LangGraph", "AWS", "FinTech", "Hackathon Winner", "OSS Author"].map(t => (
                  <span key={t} className="text-xs bg-blue-50 text-primary border border-blue-100 px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            {metrics.map(m => (
              <div key={m.label} className={`${m.bg} border ${m.border} rounded-xl p-4 text-center`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <m.icon size={13} className={m.color} />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}<span className="text-sm font-normal text-muted-foreground">{m.unit}</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Trajectory */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Growth Trajectory</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Career health score progression over time</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
              <TrendingUp size={14} /> +30 pts since 2022
            </div>
          </div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trajectoryData}>
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} domain={[40, 100]} />
                <Tooltip formatter={(v: number) => [`${v}/100`, "Career Health"]} />
                <Area key="area-trajectory" type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} fill="url(#recGrad)" dot={{ r: 4, fill: "#2563EB", stroke: "white", strokeWidth: 2 }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-5 mb-5">
          {/* Verified Highlights */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={16} className="text-amber-500" />
              <h2 className="font-semibold text-foreground">Verified Achievements</h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium ml-auto">All Verified</span>
            </div>
            <div className="space-y-3">
              {highlights.map(h => (
                <div key={h.title} className="flex items-start gap-3 p-3.5 rounded-xl border border-border hover:bg-muted/40 transition-colors group">
                  <span className="text-xl flex-shrink-0">{h.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{h.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{h.meta}</p>
                  </div>
                  {h.verified && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 flex-shrink-0">
                      <CheckCircle size={11} /> Verified
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Career DNA */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Career DNA</h2>
            </div>

            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#94A3B8" }} />
                  <Radar key="radar-recruiter" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {dna.map(d => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-foreground w-20 flex-shrink-0">{d.label}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-foreground w-8 text-right">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={16} className="text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span key={s} className="text-sm bg-muted border border-border text-foreground px-3 py-1.5 rounded-lg font-medium">{s}</span>
            ))}
          </div>
        </div>

        {/* X-Ray Intelligence banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold mb-1">CareerX-Ray Intelligence</p>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">
                This profile is backed by CareerX-Ray's AI analysis — including verified evidence, career health scoring, growth trajectory modeling, and future potential simulation. More signal than any LinkedIn profile.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Shield,    label: "All achievements verified",  detail: "Trust Score: 93% avg"     },
                  { icon: BarChart3, label: "Growth trajectory modeled",  detail: "+30 pts over 4 years"     },
                  { icon: TrendingUp,label: "Future potential: 91%",      detail: "ML Eng path probability"  },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3">
                    <s.icon size={14} className="text-blue-200 mb-2" />
                    <p className="text-white text-xs font-semibold leading-snug">{s.label}</p>
                    <p className="text-blue-200 text-xs mt-0.5">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
