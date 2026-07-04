import { ArrowRight, Briefcase, Building2, CheckCircle, Clock, MapPin, Shield, Sparkles, TrendingUp, XCircle } from "lucide-react";

const jobs = [
  {
    company: "Maybank",
    role: "Data Analyst, Digital Banking",
    salary: "RM 7.5k-9.5k",
    location: "Kuala Lumpur",
    fit: 91,
    status: "Interview",
    strengths: ["SQL depth", "FinTech domain", "Fraud analytics"],
    gaps: ["Cloud credential"],
  },
  {
    company: "Grab",
    role: "Analytics Engineer",
    salary: "RM 9k-12k",
    location: "Petaling Jaya / Hybrid",
    fit: 86,
    status: "Screening",
    strengths: ["dbt", "Python", "Experimentation"],
    gaps: ["Spark production evidence"],
  },
  {
    company: "Petronas Digital",
    role: "AI Product Analyst",
    salary: "RM 8k-11k",
    location: "Kuala Lumpur",
    fit: 78,
    status: "Saved",
    strengths: ["Stakeholder comms", "AI project signal"],
    gaps: ["Product discovery", "Cloud"],
  },
];

const stages = [
  { label: "Saved", count: 4 },
  { label: "Applied", count: 3 },
  { label: "Screening", count: 2 },
  { label: "Interview", count: 1 },
  { label: "Offer", count: 0 },
];

export function JobMatchTracker() {
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Briefcase size={13} /> Job Match + Apply Tracker
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Recommended roles, ranked by hire readiness.</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            CareerX-Ray explains why a role fits, what will block you, and how each application is moving through the pipeline.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-3">
          {stages.map((s, i) => (
            <div key={s.label} className="bg-white border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
                <span className="text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{s.count}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_330px] gap-6">
          <section className="space-y-4">
            {jobs.map(job => (
              <div key={`${job.company}-${job.role}`} className="bg-white border border-border rounded-xl shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-semibold text-foreground">{job.role}</h2>
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Shield size={10} /> Verified employer
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Building2 size={12} /> {job.company}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                      <span className="inline-flex items-center gap-1"><TrendingUp size={12} /> {job.salary}</span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-2xl font-bold text-primary">{job.fit}%</p>
                    <p className="text-xs text-muted-foreground">hire readiness</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-5">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-emerald-700 mb-2">Why you match</p>
                    <div className="space-y-1.5">
                      {job.strengths.map(s => <p key={s} className="text-xs text-foreground flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500" /> {s}</p>)}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-700 mb-2">What may block you</p>
                    <div className="space-y-1.5">
                      {job.gaps.map(g => <p key={g} className="text-xs text-foreground flex items-center gap-2"><XCircle size={12} className="text-amber-500" /> {g}</p>)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock size={12} /> Current status: <strong className="text-foreground">{job.status}</strong></span>
                  <button className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                    Prepare application <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </section>

          <aside className="bg-slate-950 text-white rounded-xl p-5 h-fit">
            <Sparkles size={18} className="text-blue-300 mb-3" />
            <h2 className="font-bold">AI application brief</h2>
            <p className="text-sm text-slate-300 leading-relaxed mt-2">
              Apply to Maybank first. Your FinTech evidence is stronger than your cloud gap, but rehearse a SQL product case before the interview.
            </p>
            <div className="mt-5 space-y-3">
              {["Rewrite resume headline around fraud analytics", "Prepare 2 STAR stories from Stripe", "Explain cloud learning plan honestly"].map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle size={14} className="text-emerald-300 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
