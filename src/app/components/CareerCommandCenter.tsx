import {
  ArrowRight, BarChart3, Briefcase, CalendarClock, CheckCircle, FileText,
  GraduationCap, MessageSquareText, Shield, Sparkles, Target, TrendingUp,
  Video, Zap
} from "lucide-react";

interface CareerCommandCenterProps {
  onNavigate: (page: string) => void;
}

const nextActions = [
  { title: "Tailor resume for Maybank Data Analyst", impact: "+11% interview chance", page: "jobs", icon: FileText },
  { title: "Rehearse SQL case interview", impact: "Interview in 2 days", page: "coach", icon: Video },
  { title: "Close cloud skill gap", impact: "Blocks 3 target roles", page: "prescription", icon: GraduationCap },
];

const applications = [
  { company: "Maybank", role: "Data Analyst", stage: "Interview", fit: 91, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { company: "Grab", role: "Analytics Engineer", stage: "Screening", fit: 86, tone: "bg-blue-50 text-blue-700 border-blue-200" },
  { company: "Petronas Digital", role: "AI Product Analyst", stage: "Applied", fit: 78, tone: "bg-amber-50 text-amber-700 border-amber-200" },
];

const marketSignals = [
  { label: "Analytics roles in Malaysia", value: "+18%", caption: "posting growth this quarter" },
  { label: "Median target salary", value: "RM 8.5k", caption: "Klang Valley, 2-4 yrs" },
  { label: "Most requested missing skill", value: "Cloud", caption: "AWS / GCP appears in 61%" },
];

export function CareerCommandCenter({ onNavigate }: CareerCommandCenterProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        <div className="bg-slate-950 text-white rounded-2xl p-6 lg:p-7 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.28),transparent_58%)]" />
          <div className="relative grid lg:grid-cols-[1.3fr_0.7fr] gap-6 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-slate-200">
                  <Sparkles size={12} /> Career Command Center
                </span>
                <span className="text-xs text-slate-400">Malaysia graduate journey demo</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Jordan, your next best move is interview preparation.</h1>
              <p className="text-sm text-slate-300 leading-relaxed mt-2 max-w-2xl">
                You are close to employable for your target path. CareerX-Ray connects diagnosis, job matching, applications, coaching, and long-term growth in one loop.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <button onClick={() => onNavigate("coach")} className="inline-flex items-center gap-2 bg-white text-slate-950 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100">
                  Start Rehearsal <ArrowRight size={14} />
                </button>
                <button onClick={() => onNavigate("jobs")} className="inline-flex items-center gap-2 border border-white/15 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10">
                  View Job Matches <Briefcase size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Employability", value: "82", unit: "/100", icon: Shield, tone: "text-emerald-300" },
                { label: "Open gaps", value: "4", unit: "", icon: Zap, tone: "text-amber-300" },
                { label: "Active apps", value: "3", unit: "", icon: Briefcase, tone: "text-blue-300" },
                { label: "Interview ready", value: "71", unit: "%", icon: MessageSquareText, tone: "text-purple-300" },
              ].map(m => (
                <div key={m.label} className="bg-white/8 border border-white/10 rounded-xl p-4">
                  <m.icon size={15} className={m.tone} />
                  <p className="text-2xl font-bold mt-2">{m.value}<span className="text-sm text-slate-400">{m.unit}</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
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
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center text-sm font-bold">{i + 1}</div>
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

        <div className="grid md:grid-cols-3 gap-4">
          {marketSignals.map(signal => (
            <div key={signal.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={15} className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{signal.label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{signal.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{signal.caption}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Why this beats a normal job board</p>
              <p className="text-sm text-muted-foreground mt-0.5">Every recommendation is connected to verified evidence, market demand, skill gaps, and interview readiness.</p>
            </div>
          </div>
          <button onClick={() => onNavigate("dashboard")} className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
            Open X-Ray <TrendingUp size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
