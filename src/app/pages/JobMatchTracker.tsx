import { useState } from "react";
import { useCareerProfile } from "../state/careerProfile";
import { corpusFor } from "../lib/careerCorpus";
import { ArrowRight, Briefcase, Building2, CheckCircle, Clock, ExternalLink, Globe, MapPin, MessageCircle, Send, Shield, Sparkles, TrendingUp, X, XCircle, Zap } from "lucide-react";

interface JobMatchTrackerProps {
  onPrepareApp?: (jobId: string) => void;
  onCoach?: (jobId: string) => void;
  /** Job id → ISO timestamp of when the application was sent. */
  appliedJobs?: Record<string, string>;
}

interface TimelineEntry {
  stage: string;
  date: string;
  active?: boolean;
}

const TIMELINE_STAGES = ["Saved", "Applied", "Screening", "Recruiter Review", "Interview", "Offer"];

/* ────────────────────────────────────────────────────────────────
   Postings come from the corpus; pipeline state comes from what the
   user has actually done.

   This page used to ship three fixed data-analytics postings with an
   invented application history attached — a Maybank interview booked
   for July 3rd, a Grab screening in progress, and a chat thread that
   opened "Hi Jordan". A person who scanned thirty seconds ago has
   applied to nothing, so a job sits at Saved until they apply and the
   timestamps are their own.
   ──────────────────────────────────────────────────────────────── */

/* Most people freeze at an empty message box with a recruiter on the
   other end. These are the questions worth asking before an interview —
   built from the posting so they are about this job, not generic. */
function hrQuestions(job: { position: string; company: string; gaps: string[]; eta: string }): string[] {
  return [
    `What does the interview process for ${job.position} look like?`,
    job.gaps[0]
      ? `How important is ${job.gaps[0].toLowerCase()} for this role?`
      : `What would make someone stand out for this role?`,
    "Who would I be working with day to day?",
    "Is there anything in my application you'd want me to expand on?",
  ];
}

interface ChatMessage {
  from: "me" | "hr";
  text: string;
  time: string;
}

const fmtBand = (low: number, high: number) =>
  `RM ${(low / 1000).toFixed(1)}k-${(high / 1000).toFixed(1)}k/mo`;

const fmtStamp = (iso: string) => {
  const d = new Date(iso);
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
};

/** How long this employer typically takes to come back, from their reply rate. */
const etaFor = (replyRate: number) =>
  replyRate >= 90 ? "3–5 days" : replyRate >= 75 ? "5–7 days" : "7–10 days";

export function JobMatchTracker({ onPrepareApp, onCoach, appliedJobs }: JobMatchTrackerProps) {
  const { profile } = useCareerProfile();
  const corpus = corpusFor(profile);
  const applied = appliedJobs ?? {};

  const [chatJobId, setChatJobId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

  /* Every posting the corpus ranked, plus whatever the user has done
     with it. Nothing here is authored ahead of the user's own actions. */
  const jobs = corpus.rankedJobs.map(job => {
    const appliedAt = applied[job.id];
    const timeline: TimelineEntry[] = appliedAt
      ? [{ stage: "Applied", date: fmtStamp(appliedAt), active: true }]
      : [];
    return {
      ...job,
      role: job.title,
      salary: fmtBand(job.salaryLow, job.salaryHigh),
      currentStage: appliedAt ? 1 : 0,
      timeline,
      eta: appliedAt ? etaFor(job.hr.replyRate) : "Not applied yet",
      healthDelta: `${job.fit}% → ${Math.min(99, job.fit + Math.round(job.gaps.length * 3))}%`,
      hrName: job.hr.name,
      hrTitle: job.hr.title,
      hrReplyRate: job.hr.replyRate,
      hrAvgReply: job.hr.avgReply,
      hrResponseHours: job.hr.responseHours,
      hrLastSeen: job.hr.lastSeen,
    };
  });

  const appliedCount = jobs.filter(j => applied[j.id]).length;
  const stageCounts = [
    { label: "Matched", count: jobs.length },
    { label: "Applied", count: appliedCount },
    { label: "Screening", count: 0 },
    { label: "Interview", count: 0 },
    { label: "Offer", count: 0 },
  ];

  /* Recommendations from outside the Talentbank network — the next
     tier down on fit, shown as a separate list. */
  const externalJobs = corpus.rankedJobs.slice(1).map(j => ({
    title: j.title,
    company: j.company,
    location: j.location,
    salary: fmtBand(j.salaryLow, j.salaryHigh),
    fit: Math.max(40, j.fit - 6),
  }));

  const topJob = jobs[0];
  const brief = topJob
    ? [
        `Rewrite your resume headline around ${topJob.position}`,
        `Prepare two STAR stories from your ${profile.currentRole || "current"} work`,
        `Have an honest answer ready for ${topJob.gaps[0] ?? "your weakest requirement"}`,
      ]
    : [];

  const chatJob = chatJobId ? jobs.find(j => j.id === chatJobId) : null;
  const messages = chatJobId ? (chatMessages[chatJobId] || []) : [];

  const sendMessage = (text: string) => {
    const body = text.trim();
    if (!body || !chatJobId) return;
    const now = new Date();
    const timeStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setChatMessages(prev => ({
      ...prev,
      [chatJobId]: [...(prev[chatJobId] || []), { from: "me", text: body, time: timeStr }],
    }));
    setChatInput("");
  };

  const handleSendMessage = () => sendMessage(chatInput);

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
              const isApplied = !!applied[job.id];

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
                        onClick={() => onCoach?.(job.id)}
                        className="inline-flex items-center gap-1.5 bg-primary text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-colors"
                      >
                        AI Interview Coach <Sparkles size={12} />
                      </button>
                    )}
                    {isApplied && (
                      <button
                        onClick={() => setChatJobId(job.id)}
                        className="inline-flex items-center gap-1.5 border border-border text-foreground px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-muted transition-colors"
                      >
                        <MessageCircle size={12} /> Chat with HR
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* From the open web */}
            <div className="bg-white border border-border rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={15} className="text-[#0A66C2]" />
                <h2 className="font-semibold text-foreground">From the open web</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                CareerX-Ray also scans public job boards so you never miss a match — external applications are submitted on the employer's site.
              </p>
              <div className="space-y-3">
                {externalJobs.map(ej => (
                  <a
                    key={ej.title}
                    href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(ej.title)}%20Malaysia`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border rounded-xl p-4 hover:border-[#0A66C2]/40 hover:bg-blue-50/40 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground group-hover:text-[#0A66C2] transition-colors">{ej.title}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-[#0A66C2] px-2 py-0.5 rounded-full">
                          LinkedIn · Easy Apply
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="inline-flex items-center gap-1"><Building2 size={11} /> {ej.company}</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={11} /> {ej.location}</span>
                        <span className="inline-flex items-center gap-1"><TrendingUp size={11} /> {ej.salary}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-bold text-primary leading-none">~{ej.fit}%</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">fit estimate</p>
                      </div>
                      <ExternalLink size={14} className="text-muted-foreground group-hover:text-[#0A66C2] transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <aside className="bg-slate-950 text-white rounded-xl p-5 h-fit">
            <Sparkles size={18} className="text-blue-300 mb-3" />
            <h2 className="font-bold">AI application brief</h2>
            <p className="text-sm text-slate-300 leading-relaxed mt-2">
              {topJob
                ? <>Apply to {topJob.company} first — it is your strongest fit at {topJob.fit}%. The gap there is {topJob.gaps[0]?.toLowerCase() ?? "narrow"}, which is closable before they reply.</>
                : <>Finish your scan to see which of these roles you are closest to.</>}
            </p>
            <div className="mt-5 space-y-3">
              {brief.map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle size={14} className="text-emerald-300 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* HR Chat Drawer */}
      {chatJob && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setChatJobId(null)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{chatJob.hrName}</p>
                <p className="text-xs text-muted-foreground truncate">{chatJob.hrTitle} · {chatJob.company}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${chatJob.hrLastSeen.includes("min") ? "bg-emerald-500" : "bg-amber-400"}`} />
                <span className={`text-[10px] font-medium ${chatJob.hrLastSeen.includes("min") ? "text-emerald-600" : "text-amber-600"}`}>
                  {chatJob.hrLastSeen.includes("min") ? "Online" : chatJob.hrLastSeen}
                </span>
              </div>
              <button onClick={() => setChatJobId(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={16} />
              </button>
            </div>

            {/* Job context + reply stats */}
            <div className="px-5 py-3 bg-muted/50 border-b border-border space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <Briefcase size={12} className="text-muted-foreground" />
                <span className="font-medium text-foreground">{chatJob.role}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-primary font-semibold">{chatJob.fit}% match</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white border border-border rounded-lg px-2.5 py-1.5">
                  <Zap size={11} className={chatJob.hrReplyRate >= 90 ? "text-emerald-500" : chatJob.hrReplyRate >= 75 ? "text-amber-500" : "text-red-400"} />
                  <span className="text-[11px] font-semibold text-foreground">{chatJob.hrReplyRate}%</span>
                  <span className="text-[10px] text-muted-foreground">reply rate</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-border rounded-lg px-2.5 py-1.5">
                  <Clock size={11} className="text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-foreground">{chatJob.hrAvgReply}</span>
                  <span className="text-[10px] text-muted-foreground">avg reply</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-border rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] text-muted-foreground">Active</span>
                  <span className="text-[11px] font-semibold text-foreground">{chatJob.hrResponseHours}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                    <MessageCircle size={24} className="text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">Not sure what to ask?</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                    {chatJob.hrName} replies in about {chatJob.hrAvgReply}. Pick one, or write your own.
                  </p>
                  <div className="mt-4 w-full space-y-2">
                    {hrQuestions(chatJob).map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="block w-full rounded-xl border border-border bg-white px-3 py-2.5 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-accent"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${msg.from === "me" ? "order-1" : ""}`}>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.from === "me"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      {msg.text}
                    </div>
                    <p className={`text-[10px] text-muted-foreground mt-1 ${msg.from === "me" ? "text-right" : ""}`}>
                      {msg.from === "hr" ? chatJob.hrName.split(" ")[0] : "You"} · {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  placeholder={`Message ${chatJob.hrName.split(" ")[0]}...`}
                  className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Messages are verified by CareerX-Ray · Avg response {chatJob.hrAvgReply}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
