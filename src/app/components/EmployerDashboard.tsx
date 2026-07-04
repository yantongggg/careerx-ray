import { useState } from "react";
import {
  Award, BarChart3, Briefcase, Building2, CheckCircle, Clock,
  MessageSquareWarning, RotateCcw, Shield, Sparkles, UserCheck, Users
} from "lucide-react";

const pipeline = [
  { stage: "Applied", people: ["Aisyah · 88%", "Daniel · 82%", "Wei Lin · 77%"] },
  { stage: "Screening", people: ["Jordan · 91%", "Priya · 85%"] },
  { stage: "Interview", people: ["Faiz · 89%", "Mei Chen · 84%"] },
  { stage: "Offer", people: ["Nadia · 93%"] },
];

const kpis = [
  { label: "Pipeline health", value: "82%", icon: BarChart3 },
  { label: "Avg time to hire", value: "19d", icon: Clock },
  { label: "Acceptance rate", value: "88%", icon: CheckCircle },
  { label: "Candidate engagement", value: "74%", icon: Users },
];

const employerFeatures = [
  {
    label: "Smart Talent Matching",
    icon: UserCheck,
    metric: "34 high-fit grads",
    desc: "Matches candidates by skills, Career DNA, verified evidence, salary range, and response likelihood.",
  },
  {
    label: "Talent Retention Signals",
    icon: BarChart3,
    metric: "12 at-risk hires",
    desc: "Predicts which early-career hires may churn based on role fit, onboarding confidence, and growth stagnation.",
  },
  {
    label: "Talent Re-Engagement",
    icon: RotateCcw,
    metric: "218 warm candidates",
    desc: "Finds silver-medalist candidates and career-fair leads worth re-contacting before competitors do.",
  },
  {
    label: "Onboarding Success Predictor",
    icon: CheckCircle,
    metric: "87% success odds",
    desc: "Forecasts whether a candidate will ramp successfully based on skill gaps and manager support needed.",
  },
  {
    label: "Workforce Resilience Planner",
    icon: Shield,
    metric: "3 fragile teams",
    desc: "Shows which teams depend on scarce skills and recommends graduate pipelines to reduce hiring risk.",
  },
];

const delayedReplies = [
  { candidate: "Jordan Kim", role: "Data Analyst", due: "18h overdue", action: "Send interview outcome" },
  { candidate: "Priya Raman", role: "Analytics Engineer", due: "1d overdue", action: "Confirm screening slot" },
  { candidate: "Wei Lin", role: "BI Associate", due: "2d overdue", action: "Send transparent rejection" },
];

export function EmployerDashboard() {
  const [activeFeature, setActiveFeature] = useState(employerFeatures[0]);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Building2 size={22} className="text-primary" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">Maybank Employer Trust Hub</h1>
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full font-semibold">
                    <Shield size={11} /> Verified Employer
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full font-semibold">
                    <Award size={11} /> Graduate Choice Partner
                  </span>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Employers do more than post jobs. They prove trust, manage hiring performance, and understand which talent signals are converting.
                </p>
              </div>
            </div>
            <button className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
              <Briefcase size={14} /> Post verified role
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <kpi.icon size={17} className="text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground mt-3">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        <section className="bg-white border border-[rgba(22,40,75,0.14)] rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#16284B" }}>Employer Trust Score</h2>
              <p className="text-xs mt-0.5" style={{ color: "#8A7038" }}>Transparency builds talent trust</p>
            </div>
            <Shield size={20} style={{ color: "#8A7038" }} />
          </div>

          <div className="grid lg:grid-cols-[0.4fr_1fr] gap-6 items-start">
            <div className="flex flex-col items-center justify-center p-5 rounded-xl" style={{ backgroundColor: "#EFEDE6" }}>
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(22,40,75,0.08)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#8A7038" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${87 * 3.267} ${100 * 3.267}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: "#16284B" }}>87</span>
                  <span className="text-xs" style={{ color: "#8A7038" }}>/100</span>
                </div>
              </div>
              <p className="text-xs font-semibold mt-2" style={{ color: "#16284B" }}>Overall Trust</p>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Reply Speed", score: 92, detail: "Avg 4.2 hours" },
                  { label: "Review Rate", score: 85, detail: "Applications reviewed" },
                  { label: "Feedback Quality", score: 78, detail: "Candidate feedback" },
                  { label: "Offer Timeline", score: 88, detail: "Days to decision" },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl border" style={{ borderColor: "rgba(22,40,75,0.14)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#16284B" }}>{item.label}</p>
                      <span className="text-sm font-bold" style={{ color: "#8A7038" }}>{item.score}/100</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EFEDE6" }}>
                      <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: "#8A7038" }} />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "rgba(22,40,75,0.55)" }}>{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">Good Standing — Full Visibility</span>
                </div>
                <p className="text-xs text-emerald-600 mt-1">Your job posts are shown with priority ranking</p>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-xs" style={{ color: "rgba(22,40,75,0.45)" }}>Above 80%: Full visibility &amp; priority ranking</p>
                <p className="text-xs" style={{ color: "rgba(22,40,75,0.45)" }}>60-80%: Warning — Reduced exposure in search results</p>
                <p className="text-xs" style={{ color: "rgba(22,40,75,0.45)" }}>Below 60%: Critical — Account under review, listings may be hidden</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Employer AI modules</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Find, engage, retain. Built around trust and measurable hiring behavior.</p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">No sponsored-ad wording</span>
          </div>
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
            <div className="space-y-2">
              {employerFeatures.map(feature => (
                <button
                  key={feature.label}
                  onClick={() => setActiveFeature(feature)}
                  className={`w-full text-left border rounded-xl p-4 transition-all ${
                    activeFeature.label === feature.label ? "bg-blue-50 border-primary" : "bg-white border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <feature.icon size={16} className="text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{feature.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{feature.metric}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-slate-950 text-white rounded-xl p-5">
              <activeFeature.icon size={20} className="text-blue-300 mb-4" />
              <p className="text-xl font-bold">{activeFeature.label}</p>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">{activeFeature.desc}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-slate-400">AI signal</p>
                  <p className="text-lg font-bold mt-1">{activeFeature.metric}</p>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Next action</p>
                  <p className="text-sm font-semibold mt-1">Review today</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Pipeline kanban</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Candidate cards move through hiring stages with fit scores attached.</p>
            </div>
            <span className="text-xs bg-blue-50 text-primary border border-blue-100 px-2.5 py-1 rounded-full font-semibold">21 active candidates</span>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {pipeline.map(col => (
              <div key={col.stage} className="bg-muted/50 border border-border rounded-xl p-3 min-h-[190px]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{col.stage}</p>
                  <span className="text-xs text-muted-foreground">{col.people.length}</span>
                </div>
                <div className="space-y-2">
                  {col.people.map(person => (
                    <div key={person} className="bg-white border border-border rounded-lg p-3 shadow-sm">
                      <p className="text-sm font-semibold text-foreground">{person.split(" · ")[0]}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">CareerX-Ray fit {person.split(" · ")[1]}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-red-50 border border-red-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquareWarning size={18} className="text-red-500" />
            <div>
              <h2 className="font-semibold text-foreground">Candidate transparency SLA</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Solves the common candidate pain: no reply, slow reply, unclear progress.</p>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-3">
            {delayedReplies.map(item => (
              <button key={item.candidate} className="bg-white border border-red-100 rounded-xl p-4 text-left hover:border-red-300 transition-colors">
                <p className="text-sm font-semibold text-foreground">{item.candidate}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.role}</p>
                <p className="text-xs text-red-600 font-semibold mt-3">{item.due}</p>
                <p className="text-xs text-foreground mt-1">{item.action}</p>
              </button>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white border border-border rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-foreground mb-4">Employer brand trust signals</h2>
            <div className="space-y-3">
              {[
                ["Salary transparency", "Roles with salary bands get 31% more strong applicants"],
                ["Graduate engagement", "UM and APU students saved Maybank roles 248 times this month"],
                ["Candidate response time", "Median 1.8 days, better than ecosystem benchmark"],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3 p-3 border border-border rounded-xl">
                  <CheckCircle size={15} className="text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-slate-950 text-white rounded-xl p-5">
            <Sparkles size={18} className="text-blue-300 mb-3" />
            <h2 className="font-bold">Career fair performance</h2>
            <p className="text-sm text-slate-300 leading-relaxed mt-2">Maybank&apos;s booth converted 42% of QR scans into profile follows. Top student skill gaps were cloud, SQL case practice, and stakeholder storytelling.</p>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                ["412", "booth scans"],
                ["173", "follows"],
                ["38", "applications"],
              ].map(([value, label]) => (
                <div key={label} className="bg-white/10 border border-white/10 rounded-xl p-3">
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white border border-[rgba(22,40,75,0.14)] rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold" style={{ color: "#16284B" }}>Top candidates by trust score</h2>
              <p className="text-xs mt-0.5" style={{ color: "#8A7038" }}>Candidates are also rated on response behavior</p>
            </div>
            <UserCheck size={17} style={{ color: "#8A7038" }} />
          </div>
          <div className="space-y-3">
            {[
              { name: "Jordan Kim", trust: 94, reply: "2hrs avg" },
              { name: "Aisha Rahman", trust: 91, reply: "3hrs avg" },
              { name: "Wei Chen", trust: 88, reply: "5hrs avg" },
            ].map(c => (
              <div key={c.name} className="flex items-center gap-4 p-3 rounded-xl border" style={{ borderColor: "rgba(22,40,75,0.14)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#EFEDE6", color: "#8A7038" }}>
                  {c.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#16284B" }}>{c.name}</p>
                  <p className="text-xs" style={{ color: "rgba(22,40,75,0.55)" }}>Reply: {c.reply}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "#8A7038" }}>{c.trust}/100</p>
                  <p className="text-xs" style={{ color: "rgba(22,40,75,0.45)" }}>Trust</p>
                </div>
                <div className="w-16 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EFEDE6" }}>
                  <div className="h-full rounded-full" style={{ width: `${c.trust}%`, backgroundColor: "#8A7038" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
