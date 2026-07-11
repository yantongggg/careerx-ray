import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle, ArrowRight, Briefcase, Calendar, CheckCircle, ChevronDown,
  Clock, FileText, Filter, GraduationCap, MapPin, MessageCircle,
  Plus, Radio, Send, Shield, Sparkles, Star, TrendingDown, TrendingUp,
  User, UserCheck, X, XCircle, Zap
} from "lucide-react";
import { demoToast } from "./toast";
import { useIntelligence, normalizeSkill } from "./intelligence";

/* ─── Types ─── */
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
  careerDna: string;
  workStyle: string;
  nextAction: string;
}

interface ChatMsg {
  from: "hr" | "candidate";
  text: string;
  time: string;
}

/* ─── Constants ─── */
const STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired"];

const STAGE_STYLES: Record<string, { text: string; bg: string; border: string; dot: string; barColor: string; ringColor: string; desc: string }> = {
  Applied:   { text: "#16284B",  bg: "rgba(22,40,75,0.04)",   border: "rgba(22,40,75,0.12)", dot: "#94a3b8", barColor: "#94a3b8", ringColor: "", desc: "New applications waiting for initial review" },
  Screening: { text: "#1B5CA3",  bg: "rgba(27,92,163,0.05)",  border: "rgba(27,92,163,0.14)", dot: "#5b92c7", barColor: "#5b92c7", ringColor: "", desc: "Resume & profile screening in progress" },
  Interview: { text: "#6b5b8a",  bg: "rgba(107,91,138,0.06)", border: "rgba(107,91,138,0.15)", dot: "#8b7aaa", barColor: "#8b7aaa", ringColor: "rgba(107,91,138,0.12)", desc: "Scheduled or completed interviews" },
  Offer:     { text: "#8A7038",  bg: "rgba(138,112,56,0.06)", border: "rgba(138,112,56,0.15)", dot: "#b59b4e", barColor: "#b59b4e", ringColor: "rgba(138,112,56,0.12)", desc: "Offer extended, waiting for response" },
  Hired:     { text: "#115E50",  bg: "rgba(17,94,80,0.05)",   border: "rgba(17,94,80,0.14)", dot: "#3d9485", barColor: "#3d9485", ringColor: "", desc: "Offer accepted, onboarding scheduled" },
};

const ROLES = [
  "Data Analyst, Digital Banking",
  "Analytics Engineer",
  "AI Product Analyst",
  "BI Associate",
];

const CANDIDATES: Candidate[] = [
  {
    id: "jordan-kim", name: "Jordan Kim", avatar: "JK",
    role: "Data Analyst, Digital Banking", fit: 91, trust: 94,
    location: "Kuala Lumpur", appliedDate: "Jun 22, 2026",
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
    interviewScore: 88, resumeFile: "Jordan_Kim_Resume.pdf",
    careerDna: "Analyst → Lead", workStyle: "Data-driven · Collaborative",
    nextAction: "Send offer package",
  },
  {
    id: "faiz-ahmad", name: "Faiz Ahmad", avatar: "FA",
    role: "Data Analyst, Digital Banking", fit: 89, trust: 91,
    location: "Petaling Jaya", appliedDate: "Jun 20, 2026",
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
    resumeFile: "Faiz_Ahmad_Resume.pdf",
    careerDna: "Specialist → Expert", workStyle: "Analytical · Detail-oriented",
    nextAction: "Conduct interview Jul 5",
  },
  {
    id: "mei-chen", name: "Mei Chen", avatar: "MC",
    role: "Data Analyst, Digital Banking", fit: 84, trust: 88,
    location: "Shah Alam", appliedDate: "Jun 23, 2026",
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
    resumeFile: "Mei_Chen_Resume.pdf",
    careerDna: "Builder → Architect", workStyle: "Visual thinker · Self-driven",
    nextAction: "Conduct interview Jul 6",
  },
  {
    id: "priya-raman", name: "Priya Raman", avatar: "PR",
    role: "Analytics Engineer", fit: 85, trust: 87,
    location: "Kuala Lumpur", appliedDate: "Jun 21, 2026",
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
    careerDna: "Engineer → Platform Lead", workStyle: "Systematic · Quality-focused",
    nextAction: "Complete screening call",
  },
  {
    id: "aisyah-nor", name: "Aisyah Nor", avatar: "AN",
    role: "Data Analyst, Digital Banking", fit: 88, trust: 90,
    location: "Kuala Lumpur", appliedDate: "Jun 24, 2026",
    education: "BSc Mathematics, Universiti Teknologi MARA",
    skills: ["SQL", "Excel", "Tableau", "Python", "Storytelling"],
    strengths: ["Exceptional storytelling", "Financial modeling experience", "Strong GPA 3.85"],
    gaps: ["No dbt/data engineering", "Limited programming depth"],
    stage: 0,
    timeline: [{ stage: "Applied", date: "Jun 24", done: true }],
    notes: "New applicant. Strong academic record and storytelling skills.",
    resumeFile: "Aisyah_Nor_Resume.pdf",
    careerDna: "Communicator → Strategist", workStyle: "Narrative-driven · Structured",
    nextAction: "Review application",
  },
  {
    id: "daniel-lee", name: "Daniel Lee", avatar: "DL",
    role: "Data Analyst, Digital Banking", fit: 82, trust: 85,
    location: "Penang (willing to relocate)", appliedDate: "Jun 25, 2026",
    education: "BSc Computer Science, Universiti Sains Malaysia",
    skills: ["SQL", "Python", "Power BI", "Tableau"],
    strengths: ["Full-stack analytics", "Project leadership", "E-commerce analytics background"],
    gaps: ["No financial domain", "Needs SQL optimization practice"],
    stage: 0,
    timeline: [{ stage: "Applied", date: "Jun 25", done: true }],
    notes: "Decent technical profile. Evaluate domain transferability.",
    resumeFile: "Daniel_Lee_Resume.pdf",
    careerDna: "Generalist → Manager", workStyle: "Versatile · Leadership-leaning",
    nextAction: "Review application",
  },
  {
    id: "nadia-hassan", name: "Nadia Hassan", avatar: "NH",
    role: "Data Analyst, Digital Banking", fit: 93, trust: 96,
    location: "Kuala Lumpur", appliedDate: "Jun 18, 2026",
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
    interviewScore: 95, resumeFile: "Nadia_Hassan_Resume.pdf",
    careerDna: "Analyst → Principal", workStyle: "Research-driven · Ambitious",
    nextAction: "Prepare onboarding",
  },
  {
    id: "wei-lin", name: "Wei Lin", avatar: "WL",
    role: "BI Associate", fit: 77, trust: 82,
    location: "Johor Bahru", appliedDate: "Jun 26, 2026",
    education: "Diploma in IT, Politeknik Ibrahim Sultan",
    skills: ["Excel", "Power BI", "SQL", "Tableau"],
    strengths: ["Strong Power BI skills", "Self-taught SQL", "Eagerness to learn"],
    gaps: ["No Python", "Limited experience", "No degree"],
    stage: 0,
    timeline: [{ stage: "Applied", date: "Jun 26", done: true }],
    notes: "Entry-level candidate. Consider for BI associate track if no stronger applicants.",
    resumeFile: "Wei_Lin_Resume.pdf",
    careerDna: "Explorer → Specialist", workStyle: "Curious · Hands-on learner",
    nextAction: "Review application",
  },
];

const CHAT_HISTORY: Record<string, ChatMsg[]> = {
  "jordan-kim": [
    { from: "hr", text: "Hi Jordan! Thanks for applying. We've reviewed your profile and would like to schedule a technical interview.", time: "Jun 28, 3:15 PM" },
    { from: "candidate", text: "Thank you! I'm available anytime next week. Looking forward to it.", time: "Jun 28, 4:02 PM" },
    { from: "hr", text: "Your interview is confirmed for July 3rd at 10:00 AM. It will be a 45-min SQL case + behavioral round.", time: "Jun 30, 9:30 AM" },
    { from: "candidate", text: "Confirmed, thank you! Should I prepare anything specific?", time: "Jun 30, 10:15 AM" },
    { from: "hr", text: "Brush up on fraud detection patterns and dashboard storytelling. Good luck!", time: "Jun 30, 11:00 AM" },
  ],
  "faiz-ahmad": [
    { from: "hr", text: "Hi Faiz, we'd like to schedule your interview for Jul 5. Does 10 AM work?", time: "Jul 1, 9:00 AM" },
    { from: "candidate", text: "Yes, 10 AM works perfectly. Thank you for the opportunity!", time: "Jul 1, 10:30 AM" },
  ],
  "mei-chen": [
    { from: "hr", text: "Hi Mei Chen, your screening went well! We'd like to invite you for an interview on Jul 6.", time: "Jun 28, 2:00 PM" },
    { from: "candidate", text: "That's great news! I'll be there. Any specific topics to prepare?", time: "Jun 28, 3:15 PM" },
    { from: "hr", text: "Focus on data visualization storytelling and banking domain knowledge. We'll also do a short SQL exercise.", time: "Jun 29, 9:00 AM" },
  ],
  "priya-raman": [
    { from: "hr", text: "Hi Priya, we're scheduling screening calls this week. Are you available Thursday afternoon?", time: "Jul 2, 11:00 AM" },
  ],
};

/* Historical funnel across this hiring cycle (all roles) */
const FUNNEL = [
  { stage: "Applied", count: 48 },
  { stage: "Screening", count: 29 },
  { stage: "Interview", count: 12 },
  { stage: "Offer", count: 5 },
  { stage: "Hired", count: 3 },
];

/* fit >= 90 hires with minimal ramp-up; below that the gaps are coachable */
const hireReadiness = (c: Candidate) =>
  c.fit >= 90
    ? { label: "Ready now", color: "#115E50", bg: "rgba(17,94,80,0.07)", border: "rgba(17,94,80,0.2)" }
    : { label: "Trainable", color: "#8A7038", bg: "rgba(138,112,56,0.07)", border: "rgba(138,112,56,0.2)" };

const AI_TEMPLATES = [
  { label: "Schedule interview", text: "Hi {name}, we'd like to invite you for an interview. Are you available on {date} at {time}? The session will include a technical assessment and behavioral discussion." },
  { label: "Request documents", text: "Hi {name}, could you please share your latest portfolio and any relevant certifications? This will help us better evaluate your fit for the role." },
  { label: "Send offer", text: "Hi {name}, congratulations! We're pleased to extend an offer for the {role} position. Please check your email for the full offer details. Let us know if you have any questions." },
  { label: "Status update", text: "Hi {name}, thank you for your patience. Your application is currently in the {stage} phase. We'll have an update for you within the next few business days." },
  { label: "Polite rejection", text: "Hi {name}, thank you for your interest in {role}. After careful consideration, we've decided to move forward with other candidates whose experience more closely aligns with our current needs. We encourage you to apply for future openings." },
];

/* ─── Component ─── */
export function HiringPipeline() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [drawerTab, setDrawerTab] = useState<"profile" | "chat">("profile");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMsg[]>>({ ...CHAT_HISTORY });
  const [rejectMode, setRejectMode] = useState<"idle" | "choosing" | "done">("idle");
  const [rejectReason, setRejectReason] = useState<string | null>(null);
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [stageOverrides, setStageOverrides] = useState<Record<string, number>>({});
  const [advanceNote, setAdvanceNote] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { emitSignal, signals } = useIntelligence();

  const stageOf = (c: Candidate) => stageOverrides[c.id] ?? c.stage;

  const filtered = CANDIDATES.filter(c => (c.role === selectedRole || selectedRole === "All Roles") && !rejectedIds.has(c.id));

  /* ── Pipeline Intelligence: aggregate evidence gaps across the whole applicant pool ── */
  const skillCounts = new Map<string, number>();
  CANDIDATES.forEach(c => {
    new Set(c.gaps.map(normalizeSkill)).forEach(s => skillCounts.set(s, (skillCounts.get(s) || 0) + 1));
  });
  const topMissing = [...skillCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const liveSkills = new Set(signals.filter(s => s.live).map(s => s.skill));
  const readyNow = filtered.filter(c => c.fit >= 90).length;
  const drops = FUNNEL.slice(0, -1).map((f, i) => ({
    from: f.stage, to: FUNNEL[i + 1].stage,
    lossPct: Math.round((1 - FUNNEL[i + 1].count / f.count) * 100),
  }));
  const worstDrop = drops.reduce((a, b) => (b.lossPct > a.lossPct ? b : a));
  const stageCounts = STAGES.map((_, i) => filtered.filter(c => stageOf(c) === i).length);
  const total = filtered.length;
  const avgFit = total > 0 ? Math.round(filtered.reduce((s, c) => s + c.fit, 0) / total) : 0;

  const messages = selectedCandidate ? (chatMessages[selectedCandidate.id] || []) : [];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const handleSend = () => {
    if (!chatInput.trim() || !selectedCandidate) return;
    const now = new Date();
    const t = now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setChatMessages(prev => ({
      ...prev,
      [selectedCandidate.id]: [...(prev[selectedCandidate.id] || []), { from: "hr", text: chatInput.trim(), time: t }],
    }));
    setChatInput("");
  };

  const useTemplate = (tpl: string) => {
    if (!selectedCandidate) return;
    const filled = tpl
      .replace("{name}", selectedCandidate.name.split(" ")[0])
      .replace("{role}", selectedCandidate.role)
      .replace("{stage}", STAGES[stageOf(selectedCandidate)])
      .replace("{date}", "Jul 10")
      .replace("{time}", "10:00 AM");
    setChatInput(filled);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F6F2]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-5">

        {/* ── Top Bar ── */}
        <div className="bg-white border border-[rgba(22,40,75,0.1)] rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EFEDE6] border border-[rgba(138,112,56,0.2)] px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ color: "#8A7038" }}>
                <UserCheck size={13} /> Hiring Pipeline
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: "#16284B" }}>Candidate Hiring Pipeline</h1>
              <p className="text-sm mt-1 max-w-xl" style={{ color: "rgba(22,40,75,0.55)" }}>
                Track every candidate from application to hire. Click any card for full profile, chat, and actions.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8A7038" }} />
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="appearance-none rounded-xl pl-9 pr-9 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8A7038]/20 cursor-pointer"
                  style={{ color: "#16284B", backgroundColor: "#EFEDE6", border: "1px solid rgba(138,112,56,0.2)" }}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8A7038" }} />
              </div>
              <button onClick={() => demoToast("Filters: stage, fit score, readiness, university — coming to this demo soon")} className="inline-flex items-center gap-1.5 border border-[rgba(22,40,75,0.14)] px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#EFEDE6] transition-colors" style={{ color: "#16284B" }}>
                <Filter size={13} /> Filter
              </button>
              <button onClick={() => demoToast("Candidate import: paste a Talentbank profile link or upload a resume")} className="inline-flex items-center gap-1.5 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:opacity-90" style={{ backgroundColor: "#8A7038" }}>
                <Plus size={13} /> Add Candidate
              </button>
            </div>
          </div>
        </div>

        {/* ── Pipeline Overview Bar ── */}
        <div className="bg-white border border-[rgba(22,40,75,0.1)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold" style={{ color: "#16284B" }}>{total} candidates</p>
              <span className="text-xs" style={{ color: "rgba(22,40,75,0.45)" }}>Avg fit: <strong style={{ color: "#8A7038" }}>{avgFit}%</strong></span>
            </div>
            <p className="text-[10px]" style={{ color: "rgba(22,40,75,0.4)" }}>AI Fit Score reflects skill match, Career DNA alignment, and verified evidence</p>
          </div>
          {/* Distribution bar */}
          <div className="h-3 rounded-full overflow-hidden flex bg-[#EFEDE6]">
            {STAGES.map((stage, i) => {
              const pct = total > 0 ? (stageCounts[i] / total) * 100 : 0;
              if (pct === 0) return null;
              return <div key={stage} style={{ width: `${pct}%`, backgroundColor: STAGE_STYLES[stage].barColor }} className="transition-all" />;
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_STYLES[stage].dot }} />
                <span className="text-[11px] font-medium" style={{ color: "#16284B" }}>{stage}</span>
                <span className="text-[11px]" style={{ color: "rgba(22,40,75,0.4)" }}>{stageCounts[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pipeline Intelligence ── */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Radio size={14} style={{ color: "#8A7038" }} />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8A7038" }}>Pipeline Intelligence</p>
            <p className="text-[11px]" style={{ color: "rgba(22,40,75,0.45)" }}>
              · what the Career Intelligence Graph sees across your applicant pool — <strong style={{ color: "#115E50" }}>{readyNow} ready now</strong>, {filtered.length - readyNow} trainable
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">

            {/* Where candidates drop off */}
            <div className="bg-white border border-[rgba(22,40,75,0.1)] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: "#16284B" }}>Where candidates drop off</p>
                <TrendingDown size={15} style={{ color: "rgba(22,40,75,0.35)" }} />
              </div>
              <div className="space-y-2">
                {FUNNEL.map((f, i) => {
                  const pct = (f.count / FUNNEL[0].count) * 100;
                  const drop = i > 0 ? drops[i - 1] : null;
                  const isWorst = drop && drop.lossPct === worstDrop.lossPct && drop.from === worstDrop.from;
                  return (
                    <div key={f.stage}>
                      {drop && (
                        <p className="text-[10px] font-semibold pl-24 py-0.5" style={{ color: isWorst ? "#b91c1c" : "rgba(22,40,75,0.4)" }}>
                          ↓ −{drop.lossPct}%{isWorst ? " · biggest loss" : ""}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-medium w-20 flex-shrink-0" style={{ color: "#16284B" }}>{f.stage}</span>
                        <div className="flex-1 h-4 rounded-md overflow-hidden" style={{ backgroundColor: "#EFEDE6" }}>
                          <div className="h-full rounded-md transition-all" style={{ width: `${pct}%`, backgroundColor: STAGE_STYLES[f.stage].barColor }} />
                        </div>
                        <span className="text-xs font-bold w-7 text-right" style={{ color: "#16284B" }}>{f.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t flex items-start gap-2" style={{ borderColor: "rgba(22,40,75,0.08)" }}>
                <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#b91c1c" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(22,40,75,0.6)" }}>
                  Biggest drop-off at <strong style={{ color: "#16284B" }}>{worstDrop.from} → {worstDrop.to}</strong> (−{worstDrop.lossPct}%).
                  Top correlated factor: replies slower than 48h — see <strong style={{ color: "#8A7038" }}>Reply SLA Monitor</strong>.
                </p>
              </div>
            </div>

            {/* Missing skills across applicant pool */}
            <div className="bg-white border border-[rgba(22,40,75,0.1)] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: "#16284B" }}>Missing skills across your applicant pool</p>
                <Zap size={15} style={{ color: "rgba(22,40,75,0.35)" }} />
              </div>
              <div className="space-y-2.5">
                {topMissing.map(([skill, count]) => {
                  const isLive = liveSkills.has(skill);
                  return (
                    <div key={skill} className="flex items-center gap-3">
                      <span className="text-[11px] font-medium flex-1 min-w-0 truncate flex items-center gap-1.5" style={{ color: "#16284B" }}>
                        {skill}
                        {isLive && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5 flex-shrink-0">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
                            </span>
                            your signal
                          </span>
                        )}
                      </span>
                      <div className="w-28 h-2 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: "#EFEDE6" }}>
                        <div className="h-full rounded-full" style={{ width: `${(count / CANDIDATES.length) * 100}%`, backgroundColor: isLive ? "#115E50" : "#b59b4e" }} />
                      </div>
                      <span className="text-[11px] font-semibold w-16 text-right flex-shrink-0" style={{ color: "rgba(22,40,75,0.55)" }}>{count} of {CANDIDATES.length}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t flex items-start gap-2" style={{ borderColor: "rgba(22,40,75,0.08)" }}>
                <Sparkles size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#8A7038" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(22,40,75,0.6)" }}>
                  <strong style={{ color: "#16284B" }}>{topMissing[0]?.[0]}</strong> blocks {topMissing[0]?.[1]} otherwise strong applicants —
                  consider marking it trainable, or partnering a university micro-credential. Your rejection feedback keeps these signals current.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Kanban Columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-2">
          {STAGES.map((stage, si) => {
            const ss = STAGE_STYLES[stage];
            const cards = filtered.filter(c => stageOf(c) === si);
            const isUrgent = stage === "Interview" || stage === "Offer";
            return (
              <div key={stage} className="min-w-[220px] rounded-xl border p-3"
                style={{
                  backgroundColor: isUrgent ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)",
                  borderColor: isUrgent ? ss.border : "rgba(22,40,75,0.08)",
                  boxShadow: isUrgent ? `0 0 0 3px ${ss.ringColor}` : undefined,
                }}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold rounded-md px-1.5 py-0.5" style={{ backgroundColor: "#EFEDE6", color: "rgba(22,40,75,0.4)" }}>0{si + 1}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
                      style={{ backgroundColor: ss.bg, color: ss.text, borderColor: ss.border }}>
                      {stage}
                    </span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "rgba(22,40,75,0.35)" }}>{cards.length}</span>
                </div>
                <p className="text-[10px] mb-3" style={{ color: "rgba(22,40,75,0.4)" }}>{ss.desc}</p>

                {/* Cards */}
                <div className="space-y-2.5">
                  {cards.map(c => {
                    const fitColor = c.fit >= 90 ? "#3d9485" : c.fit >= 80 ? "#8A7038" : "#b59b4e";
                    return (
                      <button key={c.id} onClick={() => { setSelectedCandidate(c); setDrawerTab("profile"); setRejectMode("idle"); setRejectReason(null); setAdvanceNote(false); }}
                        className="w-full text-left bg-white border rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-[rgba(138,112,56,0.35)] transition-all"
                        style={{ borderColor: "rgba(22,40,75,0.1)" }}>
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "#EFEDE6", color: "#8A7038" }}>
                            {c.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate" style={{ color: "#16284B" }}>{c.name}</p>
                            <p className="text-[10px] truncate" style={{ color: "rgba(22,40,75,0.45)" }}>{c.education.split(",")[0]}</p>
                          </div>
                        </div>
                        {/* Fit bar */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#EFEDE6" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${c.fit}%`, backgroundColor: fitColor }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: fitColor }}>{c.fit}%</span>
                        </div>
                        {/* Career DNA + readiness badges */}
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border" style={{ backgroundColor: "#EFEDE6", borderColor: "rgba(138,112,56,0.15)", color: "#8A7038" }}>
                            {c.careerDna}
                          </span>
                          {(() => {
                            const r = hireReadiness(c);
                            return (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: r.bg, borderColor: r.border, color: r.color }}>
                                {r.label}
                              </span>
                            );
                          })()}
                        </div>
                        {/* Bottom row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Shield size={10} style={{ color: "rgba(22,40,75,0.3)" }} />
                            <span className="text-[10px]" style={{ color: "rgba(22,40,75,0.45)" }}>{c.trust}</span>
                          </div>
                          {c.interviewScore !== undefined && (
                            <div className="flex items-center gap-1">
                              <Star size={10} className="text-amber-500" />
                              <span className="text-[10px] font-semibold" style={{ color: "#16284B" }}>{c.interviewScore}</span>
                            </div>
                          )}
                        </div>
                        {/* Next action */}
                        <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(22,40,75,0.06)" }}>
                          <p className="text-[10px] font-medium flex items-center gap-1" style={{ color: isUrgent ? "#8A7038" : "rgba(22,40,75,0.5)" }}>
                            <ArrowRight size={9} /> {c.nextAction}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  {cards.length === 0 && (
                    <div className="border border-dashed rounded-xl p-5 text-center" style={{ borderColor: "rgba(22,40,75,0.1)" }}>
                      <p className="text-[11px]" style={{ color: "rgba(22,40,75,0.3)" }}>No candidates</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Candidate Detail Drawer ── */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">

            {/* Drawer header */}
            <div className="sticky top-0 bg-white z-10 border-b" style={{ borderColor: "rgba(22,40,75,0.1)" }}>
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#EFEDE6", color: "#8A7038" }}>
                    {selectedCandidate.avatar}
                  </div>
                  <div>
                    <h2 className="text-base font-bold" style={{ color: "#16284B" }}>{selectedCandidate.name}</h2>
                    <p className="text-xs" style={{ color: "rgba(22,40,75,0.5)" }}>{selectedCandidate.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="p-1.5 rounded-lg hover:bg-[#EFEDE6]" style={{ color: "rgba(22,40,75,0.4)" }}>
                  <X size={18} />
                </button>
              </div>
              {/* Tabs */}
              <div className="px-6 flex gap-0">
                {(["profile", "chat"] as const).map(tab => (
                  <button key={tab} onClick={() => setDrawerTab(tab)}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      drawerTab === tab ? "border-[#8A7038] text-[#8A7038]" : "border-transparent text-[rgba(22,40,75,0.4)] hover:text-[#16284B]"
                    }`}>
                    {tab === "profile" ? "Profile" : "Chat"}
                    {tab === "chat" && messages.length > 0 && (
                      <span className="ml-1.5 text-[9px] bg-[#8A7038] text-white rounded-full px-1.5 py-0.5">{messages.length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* PROFILE TAB */}
            {drawerTab === "profile" && (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Scores */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl p-3 text-center border" style={{ backgroundColor: "rgba(27,92,163,0.06)", borderColor: "rgba(27,92,163,0.15)" }}>
                    <p className="text-xl font-bold" style={{ color: "#1B5CA3" }}>{selectedCandidate.fit}%</p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: "#1B5CA3" }}>AI Fit Score</p>
                  </div>
                  <div className="rounded-xl p-3 text-center border" style={{ backgroundColor: "#EFEDE6", borderColor: "rgba(138,112,56,0.2)" }}>
                    <p className="text-xl font-bold" style={{ color: "#8A7038" }}>{selectedCandidate.trust}</p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: "#8A7038" }}>Trust Score</p>
                  </div>
                  {selectedCandidate.interviewScore !== undefined ? (
                    <div className="rounded-xl p-3 text-center border" style={{ backgroundColor: "rgba(168,85,247,0.06)", borderColor: "rgba(168,85,247,0.15)" }}>
                      <p className="text-xl font-bold" style={{ color: "#6b5b8a" }}>{selectedCandidate.interviewScore}</p>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: "#8b7aaa" }}>Interview</p>
                    </div>
                  ) : (
                    <div className="rounded-xl p-3 text-center border" style={{ backgroundColor: "#F7F6F2", borderColor: "rgba(22,40,75,0.08)" }}>
                      <p className="text-xl font-bold" style={{ color: "rgba(22,40,75,0.2)" }}>—</p>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(22,40,75,0.3)" }}>Interview</p>
                    </div>
                  )}
                </div>

                {/* Career DNA */}
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const r = hireReadiness(selectedCandidate);
                    return (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full border" style={{ backgroundColor: r.bg, borderColor: r.border, color: r.color }}>
                        {r.label}
                      </span>
                    );
                  })()}
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full border" style={{ backgroundColor: "#EFEDE6", borderColor: "rgba(138,112,56,0.2)", color: "#8A7038" }}>
                    {selectedCandidate.careerDna}
                  </span>
                  <span className="text-xs px-3 py-1.5 rounded-full border" style={{ backgroundColor: "rgba(27,92,163,0.06)", borderColor: "rgba(27,92,163,0.12)", color: "#1B5CA3" }}>
                    {selectedCandidate.workStyle}
                  </span>
                </div>

                {/* Timeline */}
                <div className="rounded-xl p-4 border" style={{ backgroundColor: "#F7F6F2", borderColor: "rgba(22,40,75,0.08)" }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: "#16284B" }}>Hiring Progress</p>
                  <div className="flex items-center gap-0">
                    {STAGES.map((stage, i) => {
                      const entry = selectedCandidate.timeline.find(t => t.stage === stage);
                      const done = entry?.done;
                      const current = i === stageOf(selectedCandidate) && !done;
                      return (
                        <div key={stage} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                              done ? "border-[#8A7038]" : current ? "border-[#8A7038] ring-4 ring-[rgba(138,112,56,0.15)]" : "border-[rgba(22,40,75,0.15)] bg-white"
                            }`} style={done || current ? { backgroundColor: "#8A7038" } : {}} />
                            <span className="text-[9px] mt-1 font-medium" style={{ color: done || current ? "#8A7038" : "rgba(22,40,75,0.3)" }}>{stage}</span>
                            {entry && <span className="text-[8px]" style={{ color: "rgba(22,40,75,0.35)" }}>{entry.date}</span>}
                          </div>
                          {i < STAGES.length - 1 && (
                            <div className="w-full h-[2px] -mx-0.5" style={{ backgroundColor: i < stageOf(selectedCandidate) ? "#8A7038" : "rgba(22,40,75,0.1)" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2.5">
                  {[
                    { icon: MapPin, text: selectedCandidate.location },
                    { icon: GraduationCap, text: selectedCandidate.education },
                    { icon: Calendar, text: `Applied ${selectedCandidate.appliedDate}` },
                    { icon: FileText, text: selectedCandidate.resumeFile, link: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs" style={{ color: "rgba(22,40,75,0.45)" }}>
                      <item.icon size={13} />
                      <span className={`font-medium ${item.link ? "underline cursor-pointer" : ""}`} style={{ color: item.link ? "#1B5CA3" : "#16284B" }}>{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#16284B" }}>Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.skills.map(s => (
                      <span key={s} className="text-[11px] font-medium px-2.5 py-1 rounded-full border" style={{ backgroundColor: "rgba(27,92,163,0.06)", borderColor: "rgba(27,92,163,0.12)", color: "#1B5CA3" }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Strengths & Gaps */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(17,94,80,0.04)", borderColor: "rgba(17,94,80,0.12)" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#115E50" }}>Strengths</p>
                    <div className="space-y-1.5">
                      {selectedCandidate.strengths.map(s => (
                        <p key={s} className="text-[11px] flex items-start gap-1.5" style={{ color: "#16284B" }}>
                          <CheckCircle size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#115E50" }} /> {s}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(138,112,56,0.04)", borderColor: "rgba(138,112,56,0.12)" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#8A7038" }}>Trainable Gaps</p>
                    <div className="space-y-1.5">
                      {selectedCandidate.gaps.map(g => (
                        <p key={g} className="text-[11px] flex items-start gap-1.5" style={{ color: "#16284B" }}>
                          <XCircle size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#8A7038" }} /> {g}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Fit Explanation */}
                <div className="rounded-xl p-4" style={{ backgroundColor: "#16284B" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={13} className="text-amber-300" />
                    <p className="text-xs font-semibold text-slate-300">AI Fit Explanation</p>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed">{selectedCandidate.notes}</p>
                </div>

                {/* Actions */}
                {rejectMode === "idle" && (
                  <div className="space-y-2 pt-1">
                    {stageOf(selectedCandidate) < 4 && (
                      <button
                        onClick={() => {
                          setStageOverrides(prev => ({ ...prev, [selectedCandidate.id]: stageOf(selectedCandidate) + 1 }));
                          setAdvanceNote(true);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:opacity-90" style={{ backgroundColor: "#8A7038" }}>
                        <ArrowRight size={13} /> Advance to {STAGES[stageOf(selectedCandidate) + 1]}
                      </button>
                    )}
                    {advanceNote && (
                      <div className="flex items-start gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: "rgba(17,94,80,0.2)", backgroundColor: "rgba(17,94,80,0.04)" }}>
                        <Radio size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#115E50" }} />
                        <p className="text-[11px] leading-relaxed" style={{ color: "#115E50" }}>
                          <strong>Outcome logged.</strong> This improves future readiness predictions for similar candidates across the Talentbank network.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setDrawerTab("chat")}
                        className="inline-flex items-center justify-center gap-1.5 border px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#EFEDE6] transition-colors"
                        style={{ borderColor: "rgba(22,40,75,0.14)", color: "#16284B" }}>
                        <MessageCircle size={12} /> Chat
                      </button>
                      <button onClick={() => demoToast(`Interview invite sent to ${selectedCandidate.name.split(" ")[0]} \u2713`)} className="inline-flex items-center justify-center gap-1.5 border px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#EFEDE6] transition-colors"
                        style={{ borderColor: "rgba(22,40,75,0.14)", color: "#16284B" }}>
                        <Calendar size={12} /> Schedule
                      </button>
                      <button onClick={() => demoToast(`Opening ${selectedCandidate.resumeFile}\u2026`)} className="inline-flex items-center justify-center gap-1.5 border px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#EFEDE6] transition-colors"
                        style={{ borderColor: "rgba(22,40,75,0.14)", color: "#16284B" }}>
                        <FileText size={12} /> Resume
                      </button>
                    </div>
                    {stageOf(selectedCandidate) < 4 && (
                      <button onClick={() => setRejectMode("choosing")}
                        className="w-full inline-flex items-center justify-center gap-1.5 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors">
                        <XCircle size={12} /> Reject with Feedback
                      </button>
                    )}
                  </div>
                )}

                {/* Reject: choose reason */}
                {rejectMode === "choosing" && (
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "rgba(220,38,38,0.2)", backgroundColor: "rgba(254,242,242,0.5)" }}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#16284B" }}>Why is {selectedCandidate.name.split(" ")[0]} not moving forward?</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(22,40,75,0.5)" }}>
                        The candidate receives this as constructive feedback. The reason is also shared — anonymized — with the Career Intelligence Graph.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[...selectedCandidate.gaps, "Insufficient role experience", "Salary expectations mismatch"].map(reason => (
                        <button key={reason} onClick={() => setRejectReason(reason)}
                          className="text-[11px] font-medium px-2.5 py-1.5 rounded-full border transition-colors"
                          style={rejectReason === reason
                            ? { backgroundColor: "#16284B", borderColor: "#16284B", color: "white" }
                            : { backgroundColor: "white", borderColor: "rgba(22,40,75,0.14)", color: "#16284B" }}>
                          {reason}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { setRejectMode("idle"); setRejectReason(null); }}
                        className="flex-1 border px-3 py-2 rounded-xl text-xs font-semibold hover:bg-white transition-colors"
                        style={{ borderColor: "rgba(22,40,75,0.14)", color: "#16284B" }}>
                        Cancel
                      </button>
                      <button
                        disabled={!rejectReason}
                        onClick={() => {
                          if (!rejectReason) return;
                          emitSignal({
                            reason: rejectReason,
                            role: selectedCandidate.role,
                            employer: "A digital banking employer",
                            stage: STAGES[stageOf(selectedCandidate)],
                          });
                          setRejectMode("done");
                        }}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-red-700 disabled:opacity-40 transition-colors">
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}

                {/* Reject: signal propagated */}
                {rejectMode === "done" && rejectReason && (
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "rgba(17,94,80,0.2)", backgroundColor: "rgba(17,94,80,0.04)" }}>
                    <div className="flex items-center gap-2">
                      <Radio size={14} style={{ color: "#115E50" }} />
                      <p className="text-xs font-bold" style={{ color: "#115E50" }}>Signal shared with the Career Intelligence Graph</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { text: `${selectedCandidate.name.split(" ")[0]} notified with constructive feedback: “${rejectReason}”` },
                        { text: `Anonymized skill signal “${normalizeSkill(rejectReason)}” sent to 1,247 candidates targeting similar roles` },
                        { text: "Gap analysis updated for 3 partner universities' curriculum dashboards" },
                      ].map((item, i) => (
                        <p key={i} className="text-[11px] flex items-start gap-1.5 leading-relaxed" style={{ color: "#16284B" }}>
                          <CheckCircle size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#115E50" }} /> {item.text}
                        </p>
                      ))}
                    </div>
                    <p className="text-[10px] pt-1 border-t" style={{ color: "rgba(22,40,75,0.45)", borderColor: "rgba(22,40,75,0.08)" }}>
                      Switch to the Candidate or University view to see this signal arrive in real time.
                    </p>
                    <button
                      onClick={() => {
                        setRejectedIds(prev => new Set([...prev, selectedCandidate.id]));
                        setSelectedCandidate(null);
                        setRejectMode("idle");
                        setRejectReason(null);
                      }}
                      className="w-full text-white px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-90"
                      style={{ backgroundColor: "#115E50" }}>
                      Done
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CHAT TAB */}
            {drawerTab === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* AI templates */}
                <div className="px-4 py-3 border-b overflow-x-auto flex gap-1.5" style={{ borderColor: "rgba(22,40,75,0.08)" }}>
                  {AI_TEMPLATES.map(tpl => (
                    <button key={tpl.label} onClick={() => useTemplate(tpl.text)}
                      className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-full border hover:bg-[#EFEDE6] transition-colors"
                      style={{ borderColor: "rgba(138,112,56,0.2)", color: "#8A7038" }}>
                      <Sparkles size={9} className="inline mr-1" />{tpl.label}
                    </button>
                  ))}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "#EFEDE6" }}>
                        <MessageCircle size={24} style={{ color: "rgba(22,40,75,0.25)" }} />
                      </div>
                      <p className="text-sm font-semibold" style={{ color: "#16284B" }}>No messages yet</p>
                      <p className="text-xs mt-1 max-w-[240px]" style={{ color: "rgba(22,40,75,0.45)" }}>
                        Use a template above or type a message to start communicating with {selectedCandidate.name.split(" ")[0]}.
                      </p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === "hr" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[80%]">
                        <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed" style={
                          msg.from === "hr"
                            ? { backgroundColor: "#16284B", color: "white", borderBottomRightRadius: 4 }
                            : { backgroundColor: "#EFEDE6", color: "#16284B", borderBottomLeftRadius: 4 }
                        }>
                          {msg.text}
                        </div>
                        <p className={`text-[10px] mt-1 ${msg.from === "hr" ? "text-right" : ""}`} style={{ color: "rgba(22,40,75,0.35)" }}>
                          {msg.from === "hr" ? "You" : selectedCandidate.name.split(" ")[0]} · {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t" style={{ borderColor: "rgba(22,40,75,0.08)" }}>
                  <div className="flex items-end gap-2">
                    <textarea
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder={`Message ${selectedCandidate.name.split(" ")[0]}...`}
                      rows={chatInput.length > 100 ? 3 : 1}
                      className="flex-1 border rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8A7038]/20 focus:border-[#8A7038]"
                      style={{ borderColor: "rgba(22,40,75,0.14)", backgroundColor: "#F7F6F2" }}
                    />
                    <button onClick={handleSend} disabled={!chatInput.trim()}
                      className="w-10 h-10 rounded-xl text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity"
                      style={{ backgroundColor: "#8A7038" }}>
                      <Send size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] mt-2 text-center" style={{ color: "rgba(22,40,75,0.3)" }}>
                    Messages are logged for transparency · Candidate trust score visible
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
