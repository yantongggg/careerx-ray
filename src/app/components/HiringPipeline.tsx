import { useState } from "react";
import {
  ArrowRight, Briefcase, Calendar, CheckCircle, ChevronDown, ChevronUp,
  Clock, FileText, GraduationCap, MapPin, MessageCircle, Shield, Sparkles,
  Star, TrendingUp, User, UserCheck, X, XCircle
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  role: string;
  fit: number;
  trust: number;
  location: string;
  appliedDate: string;
  education: string;
  skills: string[];
  strengths: string[];
  gaps: string[];
  stage: number;
  timeline: { stage: string; date: string; done: boolean }[];
  notes: string;
  interviewScore?: number;
  resumeFile: string;
}

const STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired"];

const CANDIDATES: Candidate[] = [
  {
    id: "jordan-kim",
    name: "Jordan Kim",
    avatar: "JK",
    role: "Data Analyst, Digital Banking",
    fit: 91,
    trust: 94,
    location: "Kuala Lumpur",
    appliedDate: "Jun 22, 2026",
    education: "BSc Computer Science, University of Malaya",
    skills: ["SQL", "Python", "Tableau", "dbt", "Storytelling"],
    strengths: ["SQL depth matches role needs", "FinTech domain experience", "Strong communication"],
    gaps: ["No cloud certification"],
    stage: 3,
    timeline: [
      { stage: "Applied", date: "Jun 22", done: true },
      { stage: "Screening", date: "Jun 25", done: true },
      { stage: "Interview", date: "Jul 3", done: true },
      { stage: "Offer", date: "Pending", done: false },
    ],
    notes: "Top candidate. Interview went well — strong SQL case answer. Waiting on offer approval.",
    interviewScore: 88,
    resumeFile: "Jordan_Kim_Resume.pdf",
  },
  {
    id: "faiz-ahmad",
    name: "Faiz Ahmad",
    avatar: "FA",
    role: "Data Analyst, Digital Banking",
    fit: 89,
    trust: 91,
    location: "Petaling Jaya",
    appliedDate: "Jun 20, 2026",
    education: "BSc Statistics, Universiti Kebangsaan Malaysia",
    skills: ["SQL", "Python", "Power BI", "Excel", "R"],
    strengths: ["Strong statistical background", "Power BI dashboards", "Bilingual reporting"],
    gaps: ["No Tableau experience", "Limited cloud exposure"],
    stage: 2,
    timeline: [
      { stage: "Applied", date: "Jun 20", done: true },
      { stage: "Screening", date: "Jun 24", done: true },
      { stage: "Interview", date: "Jul 5", done: false },
    ],
    notes: "Interview scheduled. Prepare SQL case + behavioral round.",
    interviewScore: undefined,
    resumeFile: "Faiz_Ahmad_Resume.pdf",
  },
  {
    id: "mei-chen",
    name: "Mei Chen",
    avatar: "MC",
    role: "Data Analyst, Digital Banking",
    fit: 84,
    trust: 88,
    location: "Shah Alam",
    appliedDate: "Jun 23, 2026",
    education: "BSc Data Science, Asia Pacific University",
    skills: ["SQL", "Python", "Tableau", "BigQuery"],
    strengths: ["BigQuery experience", "Clean data viz portfolio", "Certified Google Data Analytics"],
    gaps: ["Limited banking domain knowledge", "Needs stakeholder comms practice"],
    stage: 2,
    timeline: [
      { stage: "Applied", date: "Jun 23", done: true },
      { stage: "Screening", date: "Jun 26", done: true },
      { stage: "Interview", date: "Jul 6", done: false },
    ],
    notes: "Good technical fit. Interview focus: domain knowledge + communication.",
    interviewScore: undefined,
    resumeFile: "Mei_Chen_Resume.pdf",
  },
  {
    id: "priya-raman",
    name: "Priya Raman",
    avatar: "PR",
    role: "Analytics Engineer",
    fit: 85,
    trust: 87,
    location: "Kuala Lumpur",
    appliedDate: "Jun 21, 2026",
    education: "BSc Information Systems, Universiti Malaya",
    skills: ["SQL", "dbt", "Python", "Airflow", "BigQuery"],
    strengths: ["dbt production experience", "CI/CD awareness", "Data quality focus"],
    gaps: ["No Spark experience", "Limited Kubernetes exposure"],
    stage: 1,
    timeline: [
      { stage: "Applied", date: "Jun 21", done: true },
      { stage: "Screening", date: "Jul 4", done: false },
    ],
    notes: "Strong dbt background. Screening call to assess pipeline scale experience.",
    resumeFile: "Priya_Raman_Resume.pdf",
  },
  {
    id: "aisyah-nor",
    name: "Aisyah Nor",
    avatar: "AN",
    role: "Data Analyst, Digital Banking",
    fit: 88,
    trust: 90,
    location: "Kuala Lumpur",
    appliedDate: "Jun 24, 2026",
    education: "BSc Mathematics, Universiti Teknologi MARA",
    skills: ["SQL", "Excel", "Tableau", "Python", "Storytelling"],
    strengths: ["Exceptional storytelling", "Financial modeling experience", "Strong GPA 3.85"],
    gaps: ["No dbt/data engineering", "Limited programming depth"],
    stage: 0,
    timeline: [
      { stage: "Applied", date: "Jun 24", done: true },
    ],
    notes: "New applicant. Strong academic record and storytelling skills.",
    resumeFile: "Aisyah_Nor_Resume.pdf",
  },
  {
    id: "daniel-lee",
    name: "Daniel Lee",
    avatar: "DL",
    role: "Data Analyst, Digital Banking",
    fit: 82,
    trust: 85,
    location: "Penang (willing to relocate)",
    appliedDate: "Jun 25, 2026",
    education: "BSc Computer Science, Universiti Sains Malaysia",
    skills: ["SQL", "Python", "Power BI", "Tableau"],
    strengths: ["Full-stack analytics", "Project leadership", "E-commerce analytics background"],
    gaps: ["No financial domain", "Needs SQL optimization practice"],
    stage: 0,
    timeline: [
      { stage: "Applied", date: "Jun 25", done: true },
    ],
    notes: "Decent technical profile. Evaluate domain transferability.",
    resumeFile: "Daniel_Lee_Resume.pdf",
  },
  {
    id: "nadia-hassan",
    name: "Nadia Hassan",
    avatar: "NH",
    role: "Data Analyst, Digital Banking",
    fit: 93,
    trust: 96,
    location: "Kuala Lumpur",
    appliedDate: "Jun 18, 2026",
    education: "BSc Finance & Analytics, Universiti Malaya",
    skills: ["SQL", "Python", "Tableau", "dbt", "Power BI", "Storytelling"],
    strengths: ["Finance + analytics dual degree", "3 internships in banking", "Published research on fraud detection"],
    gaps: ["Cloud deployment experience"],
    stage: 4,
    timeline: [
      { stage: "Applied", date: "Jun 18", done: true },
      { stage: "Screening", date: "Jun 20", done: true },
      { stage: "Interview", date: "Jun 25", done: true },
      { stage: "Offer", date: "Jun 30", done: true },
      { stage: "Hired", date: "Jul 1", done: true },
    ],
    notes: "Offer accepted. Start date: Jul 15. Onboarding package sent.",
    interviewScore: 95,
    resumeFile: "Nadia_Hassan_Resume.pdf",
  },
  {
    id: "wei-lin",
    name: "Wei Lin",
    avatar: "WL",
    role: "BI Associate",
    fit: 77,
    trust: 82,
    location: "Johor Bahru",
    appliedDate: "Jun 26, 2026",
    education: "Diploma in IT, Politeknik Ibrahim Sultan",
    skills: ["Excel", "Power BI", "SQL", "Tableau"],
    strengths: ["Strong Power BI skills", "Self-taught SQL", "Eagerness to learn"],
    gaps: ["No Python", "Limited experience", "No degree"],
    stage: 0,
    timeline: [
      { stage: "Applied", date: "Jun 26", done: true },
    ],
    notes: "Entry-level candidate. Consider for BI associate track if no stronger applicants.",
    resumeFile: "Wei_Lin_Resume.pdf",
  },
];

const stageCandidates = STAGES.map((stage, i) => ({
  stage,
  candidates: CANDIDATES.filter(c => c.stage === i),
}));

const stageColors: Record<string, string> = {
  Applied: "bg-slate-100 text-slate-700 border-slate-200",
  Screening: "bg-blue-50 text-blue-700 border-blue-200",
  Interview: "bg-purple-50 text-purple-700 border-purple-200",
  Offer: "bg-amber-50 text-amber-700 border-amber-200",
  Hired: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function HiringPipeline() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const totalCandidates = CANDIDATES.length;
  const avgFit = Math.round(CANDIDATES.reduce((s, c) => s + c.fit, 0) / totalCandidates);
  const hiredCount = CANDIDATES.filter(c => c.stage === 4).length;
  const interviewCount = CANDIDATES.filter(c => c.stage >= 2).length;

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <UserCheck size={13} /> Hiring Pipeline
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Candidate Hiring Pipeline</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Track every candidate's progress from application to hire. See fit scores, trust ratings, and timeline at a glance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-muted border border-border rounded-lg p-1">
                <button onClick={() => setView("kanban")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${view === "kanban" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>
                  Kanban
                </button>
                <button onClick={() => setView("list")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${view === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Candidates", value: totalCandidates, icon: User, tone: "text-primary" },
            { label: "Avg Fit Score", value: `${avgFit}%`, icon: TrendingUp, tone: "text-emerald-600" },
            { label: "In Interview+", value: interviewCount, icon: MessageCircle, tone: "text-purple-600" },
            { label: "Hired", value: hiredCount, icon: CheckCircle, tone: "text-emerald-600" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white border border-border rounded-xl p-4 shadow-sm">
              <kpi.icon size={16} className={`${kpi.tone}`} />
              <p className="text-2xl font-bold text-foreground mt-2">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Kanban View */}
        {view === "kanban" && (
          <div className="grid grid-cols-5 gap-3 overflow-x-auto">
            {stageCandidates.map(col => (
              <div key={col.stage} className="min-w-[200px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${stageColors[col.stage]}`}>
                      {col.stage}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">{col.candidates.length}</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {col.candidates.map(c => (
                    <button key={c.id} onClick={() => setSelectedCandidate(c)}
                      className="w-full text-left bg-white border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {c.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{c.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${c.fit}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary">{c.fit}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Shield size={10} className="text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Trust {c.trust}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{c.appliedDate.split(",")[0]}</span>
                      </div>
                      {c.interviewScore !== undefined && (
                        <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5">
                          <Star size={10} className="text-amber-500" />
                          <span className="text-[10px] font-semibold text-foreground">Interview: {c.interviewScore}/100</span>
                        </div>
                      )}
                    </button>
                  ))}
                  {col.candidates.length === 0 && (
                    <div className="bg-muted/30 border border-dashed border-border rounded-xl p-6 text-center">
                      <p className="text-xs text-muted-foreground">No candidates</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Candidate</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Role</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Stage</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Fit</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Trust</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Applied</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {CANDIDATES.sort((a, b) => b.stage - a.stage || b.fit - a.fit).map(c => (
                    <tr key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{c.avatar}</div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">{c.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-foreground">{c.role}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${stageColors[STAGES[c.stage]]}`}>
                          {STAGES[c.stage]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-primary">{c.fit}%</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold" style={{ color: "#8A7038" }}>{c.trust}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.appliedDate}</td>
                      <td className="px-5 py-3.5">
                        <ArrowRight size={14} className="text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Detail Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {selectedCandidate.avatar}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedCandidate.name}</h2>
                    <p className="text-xs text-muted-foreground">{selectedCandidate.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Scores */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-primary">{selectedCandidate.fit}%</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">CareerX-Ray Fit</p>
                </div>
                <div className="rounded-xl p-3 text-center border" style={{ backgroundColor: "#EFEDE6", borderColor: "rgba(138,112,56,0.2)" }}>
                  <p className="text-xl font-bold" style={{ color: "#8A7038" }}>{selectedCandidate.trust}</p>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color: "#8A7038" }}>Trust Score</p>
                </div>
                {selectedCandidate.interviewScore !== undefined ? (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-purple-700">{selectedCandidate.interviewScore}</p>
                    <p className="text-[10px] text-purple-600 font-medium mt-0.5">Interview Score</p>
                  </div>
                ) : (
                  <div className="bg-muted border border-border rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-muted-foreground">—</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Interview Score</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-muted/50 border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-foreground mb-3">Hiring Progress</p>
                <div className="flex items-center gap-0">
                  {STAGES.map((stage, i) => {
                    const entry = selectedCandidate.timeline.find(t => t.stage === stage);
                    const done = entry?.done;
                    const current = i === selectedCandidate.stage && !done;
                    return (
                      <div key={stage} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                            done ? "bg-primary border-primary" :
                            current ? "bg-primary border-primary ring-4 ring-primary/20" :
                            "bg-white border-slate-300"
                          }`} />
                          <span className={`text-[9px] mt-1 font-medium ${
                            done ? "text-primary" : current ? "text-primary font-bold" : "text-slate-400"
                          }`}>{stage}</span>
                          {entry && <span className="text-[8px] text-muted-foreground">{entry.date}</span>}
                        </div>
                        {i < STAGES.length - 1 && (
                          <div className={`w-full h-[2px] -mx-0.5 ${i < selectedCandidate.stage ? "bg-primary" : "bg-slate-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <MapPin size={13} /> <span className="text-foreground font-medium">{selectedCandidate.location}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <GraduationCap size={13} /> <span className="text-foreground font-medium">{selectedCandidate.education}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Calendar size={13} /> <span className="text-foreground font-medium">Applied {selectedCandidate.appliedDate}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <FileText size={13} /> <span className="text-primary font-medium underline cursor-pointer">{selectedCandidate.resumeFile}</span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map(s => (
                    <span key={s} className="text-[11px] font-medium bg-blue-50 text-primary border border-blue-100 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-700 mb-2">Strengths</p>
                  <div className="space-y-1.5">
                    {selectedCandidate.strengths.map(s => (
                      <p key={s} className="text-[11px] text-foreground flex items-start gap-1.5">
                        <CheckCircle size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {s}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-2">Gaps</p>
                  <div className="space-y-1.5">
                    {selectedCandidate.gaps.map(g => (
                      <p key={g} className="text-[11px] text-foreground flex items-start gap-1.5">
                        <XCircle size={11} className="text-amber-500 mt-0.5 flex-shrink-0" /> {g}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* HR Notes */}
              <div className="bg-slate-950 text-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} className="text-blue-300" />
                  <p className="text-xs font-semibold text-slate-300">Recruiter Notes</p>
                </div>
                <p className="text-sm text-slate-100 leading-relaxed">{selectedCandidate.notes}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedCandidate.stage < 4 && (
                  <button className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:opacity-90">
                    <ArrowRight size={13} /> Advance to {STAGES[selectedCandidate.stage + 1]}
                  </button>
                )}
                <button className="inline-flex items-center gap-1.5 border border-border text-foreground px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-muted">
                  <MessageCircle size={13} /> Message Candidate
                </button>
                <button className="inline-flex items-center gap-1.5 border border-border text-foreground px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-muted">
                  <FileText size={13} /> View Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
