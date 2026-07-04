import { ArrowRight, Briefcase, Building2, CheckCircle, Clock, MapPin, Shield, Sparkles, TrendingUp, XCircle } from "lucide-react";

interface JobMatchTrackerProps {
  onPrepareApp?: (jobId: string) => void;
  onCoach?: () => void;
  appliedJobs?: Set<string>;
}

interface TimelineEntry {
  stage: string;
  date: string;
  active?: boolean;
}

const TIMELINE_STAGES = ["Saved", "Applied", "Screening", "Recruiter Review", "Interview", "Offer"];

const jobs = [
  {
    id: "maybank-da",
    company: "Maybank",
    companyId: "maybank",
    role: "Data Analyst, Digital Banking",
    position: "Data Analyst",
    salary: "RM 7.5k-9.5k",
    location: "Kuala Lumpur",
    fit: 91,
    currentStage: 4,
    strengths: ["SQL depth", "FinTech domain", "Fraud analytics"],
    gaps: ["Cloud credential"],
    timeline: [
      { stage: "Saved", date: "2026-06-20 14:30" },
      { stage: "Applied", date: "2026-06-22 09:15" },
      { stage: "Screening", date: "2026-06-25 11:00" },
      { stage: "Recruiter Review", date: "2026-06-28 16:45" },
      { stage: "Interview", date: "2026-07-03 10:00", active: true },
    ] as TimelineEntry[],
    eta: "3–5 days",
    successChance: 82,
    healthDelta: "84 → 91",
  },
  {
    id: "grab-ae",
    company: "Grab",
    companyId: "grab",
    role: "Analytics Engineer",
    position: "Analytics Engineer",
    salary: "RM 9k-12k",
    location: "Petaling Jaya / Hybrid",
    fit: 86,
    currentStage: 2,
    strengths: ["dbt", "Python", "Experimentation"],
    gaps: ["Spark production evidence"],
    timeline: [
      { stage: "Saved", date: "2026-06-18 09:00" },
      { stage: "Applied", date: "2026-06-21 11:20" },
      { stage: "Screening", date: "2026-06-27 14:00", active: true },
    ] as TimelineEntry[],
    eta: "5–7 days",
    successChance: 71,
    healthDelta: "84 → 88",
  },
  {
    id: "petronas-pm",
    company: "Petronas Digital",
    companyId: "petronas",
    role: "AI Product Analyst",
    position: "AI Product Analyst",
    salary: "RM 8k-11k",
    location: "Kuala Lumpur",
    fit: 78,
    currentStage: 0,
    strengths: ["Stakeholder comms", "AI project signal"],
    gaps: ["Product discovery", "Cloud"],
    timeline: [
      { stage: "Saved", date: "2026-06-30 10:45", active: true },
    ] as TimelineEntry[],
    eta: "7–10 days",
    successChance: 65,
    healthDelta: "84 → 86",
  },
];

const stageCounts = [
  { label: "Saved", count: 4 },
  { label: "Applied", count: 3 },
  { label: "Screening", count: 2 },
  { label: "Interview", count: 1 },
  { label: "Offer", count: 0 },
];

export function JobMatchTracker({ onPrepareApp, onCoach, appliedJobs }: JobMatchTrackerProps) {
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
          {stageCounts.map((s, i) => (
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
            {jobs.map(job => {
              const isApplied = appliedJobs?.has(job.id) || job.currentStage >= 1;

              return (
                <div key={job.id} className="bg-white border border-border rounded-xl shadow-sm p-5">
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

                  {/* Why match / What blocks */}
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

                  {/* Application Timeline */}
                  <div className="mt-5 pt-4 border-t border-border">
                    <div className="flex items-center gap-0 overflow-x-auto pb-2">
                      {TIMELINE_STAGES.map((stage, i) => {
                        const entry = job.timeline.find(t => t.stage === stage);
                        const completed = i < job.currentStage;
                        const current = entry?.active;
                        const upcoming = !completed && !current;

                        return (
                          <div key={stage} className="flex items-center flex-shrink-0">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                                completed ? "bg-primary border-primary" :
                                current ? "bg-primary border-primary w-4 h-4 ring-4 ring-primary/20" :
                                "bg-transparent border-slate-300"
                              }`} />
                              <span className={`text-[9px] mt-1.5 font-medium whitespace-nowrap ${
                                completed ? "text-primary" : current ? "text-primary font-bold" : "text-slate-400"
                              }`}>{stage}</span>
                              {entry && (
                                <span className="text-[8px] text-muted-foreground mt-0.5 whitespace-nowrap">
                                  {entry.date.split(" ")[0].slice(5)}
                                </span>
                              )}
                            </div>
                            {i < TIMELINE_STAGES.length - 1 && (
                              <div className={`w-8 sm:w-12 h-[2px] mx-0.5 ${
                                i < job.currentStage ? "bg-primary" : "bg-slate-200"
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Info row */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock size={11} /> ETA: <strong className="text-foreground">{job.eta}</strong></span>
                      <span className="inline-flex items-center gap-1"><Shield size={11} /> Success: <strong className="text-foreground">{job.successChance}%</strong></span>
                      <span className="inline-flex items-center gap-1"><TrendingUp size={11} /> Health: <strong className="text-foreground">{job.healthDelta}</strong></span>
                    </div>
                  </div>

                  {/* Status log */}
                  <div className="mt-4 space-y-1.5">
                    {job.timeline.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${entry.active ? "bg-primary" : "bg-slate-300"}`} />
                        <span className="text-muted-foreground font-mono">{entry.date}</span>
                        <span className={`font-medium ${entry.active ? "text-primary" : "text-foreground"}`}>{entry.stage}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border">
                    <button
                      onClick={() => onPrepareApp?.(job.id)}
                      className="inline-flex items-center gap-1.5 bg-[#16284B] text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-[#1e3a6b] transition-colors"
                    >
                      {isApplied ? "View Application" : "Prepare Application"} <ArrowRight size={12} />
                    </button>
                    {isApplied && (
                      <button
                        onClick={onCoach}
                        className="inline-flex items-center gap-1.5 bg-primary text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-colors"
                      >
                        AI Interview Coach <Sparkles size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
