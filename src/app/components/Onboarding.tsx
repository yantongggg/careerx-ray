import { useState, useEffect } from "react";
import {
  Upload, Linkedin, Github, ChevronRight, ChevronLeft,
  BarChart3, Check, Loader2, Briefcase, Target, DollarSign,
  Sparkles, FileText, Globe, Zap, Brain, GraduationCap,
  Trophy, FolderOpen, Palette, Dribbble
} from "lucide-react";
import { dimensions, getArchetypeForScoresSafe } from "../careerDna.js";
import { demoToast } from "./toast";

interface OnboardingProps {
  onComplete: (
    dnaScores: Record<string, number>,
    profile: { userType: string; currentRole: string; targetRole: string; salaryRange: string }
  ) => void;
}

/* Each calibration option contributes to one or two Career DNA dimensions
   (indexed to match the option order in calibrationQuestions below).
   Columns are balanced so no single archetype dominates positional answering:
   all-1st → Technical+Execution (Forge Beaver), all-2nd → Strategic+Leadership
   (Crown Eagle), all-3rd → Communication+Leadership (Bridge Dolphin),
   all-4th → Innovation+Execution (Nova Otter). */
const OPTION_DIMS: Record<string, string[][]> = {
  ambiguity:     [["Technical", "Execution"], ["Strategic"], ["Communication"], ["Innovation"]],
  team:          [["Technical", "Execution"], ["Leadership", "Strategic"], ["Communication", "Leadership"], ["Innovation"]],
  problem:       [["Technical"], ["Strategic"], ["Communication"], ["Innovation", "Execution"]],
  motivation:    [["Execution", "Technical"], ["Leadership"], ["Communication", "Strategic"], ["Innovation"]],
  communication: [["Technical"], ["Strategic"], ["Communication", "Innovation"], ["Execution", "Leadership"]],
  environment:   [["Execution"], ["Technical"], ["Communication", "Leadership"], ["Innovation", "Execution"]],
};

const USER_TYPES = [
  "Student / learner",
  "Early career",
  "Working professional",
  "Changing direction",
  "Exploring / not sure",
];

type EvidenceGroup = "starter" | "professional";

const evidenceGroupFor = (userType: string): EvidenceGroup => {
  if (userType === "Working professional" || userType === "Changing direction") return "professional";
  return "starter"; // students, early career, freelancers, explorers — no CV required
};

interface EvidenceSource {
  id: string;
  name: string;
  optional?: boolean;
  icon: typeof Upload;
  brand: string; // Tailwind bg class for icon tile + connect button
  hover: string;
  desc: string;
  connectedDesc: string;
  action: string;
}

/* One inclusive evidence menu — the order shifts by journey stage, but nobody
   is asked for something they may not have. */
const CARD_RESUME: EvidenceSource = {
  id: "resume", name: "Upload resume", icon: FileText,
  brand: "bg-[#16284B]", hover: "hover:bg-[#1e3560]", action: "Upload",
  desc: "Have one? Great. Don't? Every other card below works just as well",
  connectedDesc: "Uploaded · Parsing roles, skills, achievements",
};
const CARD_LINKS: EvidenceSource = {
  id: "links", name: "Add LinkedIn / portfolio", icon: Linkedin,
  brand: "bg-[#0077B5]", hover: "hover:bg-[#006097]", action: "Add link",
  desc: "LinkedIn, personal site, Behance, Dribbble — any link that shows your work",
  connectedDesc: "Added · Scanning your public work and profile",
};
const CARD_PROJECT: EvidenceSource = {
  id: "project", name: "Add a project", icon: FolderOpen,
  brand: "bg-[#115E50]", hover: "hover:bg-[#0d4a3f]", action: "Upload",
  desc: "Class assignments, final-year builds, freelance gigs, side projects — anything you made",
  connectedDesc: "Uploaded · Analyzing project scope, tools, and outcomes",
};
const CARD_CERT: EvidenceSource = {
  id: "certificate", name: "Add a certificate", icon: Trophy,
  brand: "bg-[#8A7038]", hover: "hover:bg-[#75602f]", action: "Upload",
  desc: "SPM, diploma, TVET, competitions, micro-credentials, professional certs — all count",
  connectedDesc: "Uploaded · Verifying credentials and skill signals",
};

const EVIDENCE_SOURCES: Record<EvidenceGroup, EvidenceSource[]> = {
  starter: [CARD_PROJECT, CARD_CERT, CARD_LINKS, { ...CARD_RESUME, optional: true }],
  professional: [CARD_RESUME, CARD_LINKS, CARD_PROJECT, CARD_CERT],
};

const SOMETHING_ELSE: EvidenceSource = {
  id: "other", name: "Something else", icon: Upload,
  brand: "bg-slate-500", hover: "hover:bg-slate-600", action: "Upload",
  desc: "Upload anything that proves your skills — certificates, slides, videos, code, or artwork",
  connectedDesc: "Received · Extracting skill signals from your evidence",
};

const roles = [
  "Data Analyst", "Senior Data Analyst", "Analytics Engineer", "Data Engineer",
  "ML Engineer", "Data Science Manager", "Senior ML Engineer", "Staff Data Scientist",
  "Product Manager", "Software Engineer", "Senior Software Engineer", "Engineering Manager",
  "UX Designer", "Marketing Manager", "Financial Analyst", "Strategy Consultant",
];

const targetRoles = [
  "ML Engineer", "Senior ML Engineer", "Staff ML Engineer", "Principal Data Scientist",
  "Data Science Manager", "Head of Data", "VP of Data", "Chief Data Officer",
  "Analytics Engineer", "Data Engineer", "Product Manager", "Senior SWE",
  "Engineering Manager", "CTO / VP Engineering", "Independent Consultant",
];

const goals = [
  { id: "salary", label: "Maximize Salary", icon: DollarSign },
  { id: "promo", label: "Get Promoted Fast", icon: Target },
  { id: "pivot", label: "Career Pivot", icon: Zap },
  { id: "balance", label: "Work-Life Balance", icon: Globe },
  { id: "impact", label: "Increase Impact", icon: Sparkles },
  { id: "stability", label: "Career Stability", icon: Briefcase },
];

const scanSteps = [
  { id: "dna", label: "Generating Career DNA", detail: "Combining profile evidence with your Career Calibration answers", duration: 1800 },
  { id: "market", label: "Benchmarking Market Demand", detail: "Comparing your profile against 240,000+ job postings and 12,000+ career trajectories", duration: 2200 },
  { id: "blind", label: "Detecting Blind Spots", detail: "Running 50+ career risk models: automation exposure, stagnation signals, demand shifts", duration: 2000 },
  { id: "scenarios", label: "Generating Decision Scenarios", detail: "Simulating 4 future career paths with salary, promotion, and satisfaction projections", duration: 1900 },
  { id: "prescription", label: "Building Career Prescription", detail: "Synthesizing findings into a personalized 30/90-day action plan", duration: 1600 },
];

const calibrationQuestions = [
  {
    id: "ambiguity",
    question: "When you receive a vague task, what do you usually do first?",
    options: [
      "Break it into technical steps and start building",
      "Ask what outcome matters most before acting",
      "Talk to people to understand expectations",
      "Explore different creative directions first",
    ],
  },
  {
    id: "team",
    question: "In a group project, which role do you naturally take?",
    options: [
      "Build the main solution",
      "Organize everyone and set direction",
      "Explain, present, or align the team",
      "Bring new ideas when the team is stuck",
    ],
  },
  {
    id: "problem",
    question: "When solving a difficult problem, what feels most natural?",
    options: [
      "Research deeply until I understand the system",
      "Step back and rethink the whole approach",
      "Discuss with others to find a practical answer",
      "Try a quick prototype and improve from there",
    ],
  },
  {
    id: "motivation",
    question: "Which outcome makes work feel most meaningful to you?",
    options: [
      "Building something that actually works",
      "Leading a team toward a bigger goal",
      "Helping people make better decisions",
      "Creating something new",
    ],
  },
  {
    id: "communication",
    question: "When explaining your work, what do you focus on most?",
    options: [
      "The technical logic behind it",
      "The business or career impact",
      "The story and user experience",
      "The next action people should take",
    ],
  },
  {
    id: "environment",
    question: "Which work environment would you prefer?",
    options: [
      "A stable team with clear tasks and systems",
      "A deep technical role with complex problems",
      "A people-facing role with lots of collaboration",
      "A fast-moving startup where things change often",
    ],
  },
];

type Step = "upload" | "connect" | "profile" | "calibration" | "scan" | "done";

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>("upload");
  const [userType, setUserType] = useState("");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [connectedSources, setConnectedSources] = useState<Record<string, boolean>>({});
  const [currentRole, setCurrentRole] = useState("Senior Data Analyst");
  const [customCurrentRole, setCustomCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("ML Engineer");
  const [customTargetRole, setCustomTargetRole] = useState("");
  const [experience, setExperience] = useState("5-7");
  const [salaryRange, setSalaryRange] = useState("RM 100k-150k");
  const [customSalary, setCustomSalary] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["salary", "pivot"]);
  /* No preset answers — the archetype must reflect the user's own calibration */
  const [calibrationAnswers, setCalibrationAnswers] = useState<Record<string, string>>({});
  const [scanProgress, setScanProgress] = useState<Record<string, "pending" | "running" | "done">>({});
  const [currentScanStep, setCurrentScanStep] = useState(0);
  /* Shuffle option display order once per session so straight-line clicking
     doesn't always land on the same dimensions (scoring matches by text). */
  const [optionOrders] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(
      calibrationQuestions.map(q => {
        const idx = q.options.map((_, i) => i);
        for (let i = idx.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [idx[i], idx[j]] = [idx[j], idx[i]];
        }
        return [q.id, idx];
      })
    )
  );
  const [isDragging, setIsDragging] = useState(false);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  /* Career DNA scores derived from calibration answers.
     Every answer contributes 2 points total, so single-dimension options
     weigh the same as dual-dimension ones. */
  const dnaCounts: Record<string, number> = Object.fromEntries(dimensions.map((d: string) => [d, 0]));
  calibrationQuestions.forEach(q => {
    const idx = q.options.indexOf(calibrationAnswers[q.id]);
    if (idx >= 0) {
      const dims = OPTION_DIMS[q.id][idx];
      dims.forEach(d => { dnaCounts[d] += 2 / dims.length; });
    }
  });
  const dnaScores: Record<string, number> = Object.fromEntries(
    Object.entries(dnaCounts).map(([d, n]) => [d, Math.min(95, 42 + Math.round(n * 6))])
  );
  const archetype = getArchetypeForScoresSafe(dnaScores);

  const startScan = () => {
    setStep("scan");
    setScanProgress({});
    setCurrentScanStep(0);
  };

  useEffect(() => {
    if (step !== "scan") return;
    let idx = 0;
    const runNext = () => {
      if (idx >= scanSteps.length) {
        setTimeout(() => setStep("done"), 600);
        return;
      }
      const s = scanSteps[idx];
      setScanProgress(prev => ({ ...prev, [s.id]: "running" }));
      setCurrentScanStep(idx);
      setTimeout(() => {
        setScanProgress(prev => ({ ...prev, [s.id]: "done" }));
        idx++;
        setTimeout(runNext, 200);
      }, s.duration);
    };
    const t = setTimeout(runNext, 300);
    return () => clearTimeout(t);
  }, [step]);

  const answeredCount = calibrationQuestions.filter(q => calibrationAnswers[q.id]).length;
  const stepIndex = ["upload", "connect", "profile", "calibration"].indexOf(step);
  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Nav */}
      <nav className="h-16 border-b border-border bg-white/80 backdrop-blur-md flex items-center px-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">CareerX-Ray</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">

          {/* Progress indicator */}
          {step !== "scan" && step !== "done" && (
            <div className="flex items-center gap-2 mb-8 justify-center">
              {["Upload", "Connect", "Profile", "Calibration"].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 ${i <= stepIndex ? "text-primary" : "text-muted-foreground"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                      i < stepIndex ? "bg-primary border-primary text-white" :
                      i === stepIndex ? "border-primary text-primary bg-blue-50" :
                      "border-border text-muted-foreground"
                    }`}>
                      {i < stepIndex ? <Check size={12} /> : i + 1}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{label}</span>
                  </div>
                  {i < totalSteps - 1 && <div className={`w-12 h-0.5 rounded ${i < stepIndex ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Step: Upload Resume */}
          {step === "upload" && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText size={24} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Start with what you have. A resume is optional.</h1>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Everything here is optional — a few quick questions alone can generate your starting Career DNA.</p>
              </div>

              {/* User type */}
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-1 text-center">Where are you in your career journey?</p>
                <p className="text-xs text-muted-foreground mb-2.5 text-center">Choose the closest option. You can change this later.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {USER_TYPES.map(t => {
                    const active = userType === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setUserType(t)}
                        className={`px-3.5 py-2 rounded-full border text-xs font-medium transition-all ${
                          active
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white text-foreground border-border hover:border-primary/40 hover:bg-blue-50/50"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  setResumeUploaded(true);
                }}
                onClick={() => setResumeUploaded(true)}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-4 ${
                  isDragging ? "border-primary bg-blue-50" :
                  resumeUploaded ? "border-emerald-300 bg-emerald-50" :
                  "border-border hover:border-primary/50 hover:bg-blue-50/30"
                }`}
              >
                {resumeUploaded ? (
                  <div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check size={22} className="text-emerald-600" />
                    </div>
                    <p className="font-semibold text-emerald-700">resume_jordan_kim.pdf uploaded</p>
                    <p className="text-sm text-emerald-600 mt-1">42 KB · Ready to analyze</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload size={20} className="text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">Drop your resume here, or click to upload</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, or TXT · Max 10MB</p>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground mb-2">
                Your resume is processed securely and never shared. <span className="text-primary cursor-pointer hover:underline">Privacy Policy →</span>
              </p>
              <p className="text-center text-sm mb-8">
                <button onClick={() => setStep("profile")} className="text-primary font-semibold hover:underline">
                  No resume yet? Answer a few questions instead →
                </button>
              </p>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("connect")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => setStep("connect")}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step: Connect accounts */}
          {step === "connect" && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe size={24} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Add your career evidence</h1>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  {userType ? <>For someone <strong className="text-foreground">{userType.toLowerCase()}</strong>, this evidence matters most — pick what you have, skip what you don't.</> : <>Pick what you have, skip what you don't — every card is optional.</>}
                </p>
              </div>

              <div className="space-y-4 mb-4">
                {[...EVIDENCE_SOURCES[evidenceGroupFor(userType)], SOMETHING_ELSE].map(src => {
                  const connected = !!connectedSources[src.id];
                  const Icon = src.icon;
                  return (
                    <div key={src.id} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${connected ? "bg-emerald-50/60 border-emerald-200" : "bg-white border-border"}`}>
                      <div className={`w-12 h-12 ${src.brand} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon size={22} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {src.name}
                          {src.optional && <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground bg-muted border border-border rounded-full px-2 py-0.5 align-middle">Optional</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {connected ? src.connectedDesc : src.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (src.id === "other" && !connected) demoToast("Evidence received — extracting skill signals ✓");
                          setConnectedSources(prev => ({ ...prev, [src.id]: !connected }));
                        }}
                        className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                          connected
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : `${src.brand} ${src.hover} text-white`
                        }`}
                      >
                        {connected ? <span className="flex items-center gap-1.5"><Check size={13} /> Added</span> : src.action}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setStep("profile")}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 text-primary rounded-2xl px-5 py-4 text-sm font-semibold hover:bg-blue-50/60 transition-colors mb-4"
              >
                <Sparkles size={15} /> Nothing to upload? Answer quick questions instead →
              </button>

              <p className="text-center text-xs text-muted-foreground mb-8">
                No GitHub, LinkedIn, or resume? No problem — nobody gets blocked here. Evidence only sharpens the scan.
              </p>

              <div className="mb-8 bg-slate-950 text-white rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="text-blue-300 mt-0.5" />
                  <div>
                    <p className="font-semibold">AI Signal Scan preview</p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Your evidence shows what you have done. Next, Career Calibration captures how you think, work, communicate, and grow before we assign your animal archetype.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[
                    "Technical depth: High",
                    "Execution: High",
                    "Leadership: Low confidence",
                    "Communication: Needs calibration",
                  ].map(signal => (
                    <div key={signal} className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200">
                      {signal}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep("upload")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep("profile")}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step: Profile */}
          {step === "profile" && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={24} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Tell us about your career</h1>
                <p className="text-muted-foreground text-sm">This helps us calibrate your X-Ray score and simulation models.</p>
              </div>

              <div className="space-y-5 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Current Role</label>
                    <select
                      value={currentRole}
                      onChange={e => setCurrentRole(e.target.value)}
                      className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {[...roles, "Student", "Other…"].map(r => <option key={r}>{r}</option>)}
                    </select>
                    {currentRole === "Other…" && (
                      <input
                        type="text"
                        value={customCurrentRole}
                        onChange={e => setCustomCurrentRole(e.target.value)}
                        placeholder="Type your current role"
                        autoFocus
                        className="mt-2 w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Target Role</label>
                    <select
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {[...targetRoles, "Other…"].map(r => <option key={r}>{r}</option>)}
                    </select>
                    {targetRole === "Other…" && (
                      <input
                        type="text"
                        value={customTargetRole}
                        onChange={e => setCustomTargetRole(e.target.value)}
                        placeholder="Type your target role"
                        autoFocus
                        className="mt-2 w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Years of Experience</label>
                    <select
                      value={experience}
                      onChange={e => setExperience(e.target.value)}
                      className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {["0-1", "1-3", "3-5", "5-7", "7-10", "10-15", "15+"].map(v => <option key={v}>{v} years</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Current Salary Range</label>
                    <select
                      value={salaryRange}
                      onChange={e => setSalaryRange(e.target.value)}
                      className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {["<RM 60k", "RM 60k-80k", "RM 80k-100k", "RM 100k-150k", "RM 150k-200k", "RM 200k+", "Other…"].map(v => <option key={v}>{v}</option>)}
                    </select>
                    {salaryRange === "Other…" && (
                      <input
                        type="text"
                        value={customSalary}
                        onChange={e => setCustomSalary(e.target.value)}
                        placeholder="e.g. RM 3.5k/mo"
                        autoFocus
                        className="mt-2 w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-3">Primary Career Goal <span className="text-muted-foreground font-normal">(select all that apply)</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {goals.map((g) => {
                      const active = selectedGoals.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          onClick={() => toggleGoal(g.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            active
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-white text-foreground border-border hover:border-primary/40 hover:bg-blue-50/50"
                          }`}
                        >
                          <g.icon size={14} />
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep("connect")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep("calibration")}
                  disabled={selectedGoals.length === 0}
                  className="flex items-center gap-2 bg-primary text-white px-7 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-lg shadow-blue-200"
                >
                  Continue to Calibration <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step: Career Calibration */}
          {step === "calibration" && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain size={24} className="text-purple-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Career Calibration</h1>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Your profiles show evidence. These quick scenarios add the human signal layer before we generate your Career DNA animal.
                </p>
              </div>

              <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Calibration progress</p>
                  <span className="text-xs font-bold text-primary">{answeredCount}/6 answered</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(answeredCount / calibrationQuestions.length) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">No animal archetype is assigned until this layer is complete.</p>
              </div>

              <div className="space-y-4 mb-8">
                {calibrationQuestions.map((item, index) => (
                  <div key={item.id} className="bg-white border border-border rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.question}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Scenario-based calibration, not a personality label.</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {(optionOrders[item.id] ?? item.options.map((_, i) => i)).map(oi => item.options[oi]).map(option => {
                        const active = calibrationAnswers[item.id] === option;
                        return (
                          <button
                            key={option}
                            onClick={() => setCalibrationAnswers(prev => ({ ...prev, [item.id]: option }))}
                            className={`text-left rounded-xl border px-3 py-3 text-xs transition-all ${
                              active
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white text-foreground border-border hover:border-primary/40 hover:bg-blue-50"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep("profile")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={startScan}
                  disabled={answeredCount < calibrationQuestions.length}
                  className="flex items-center gap-2 bg-primary text-white px-7 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-lg shadow-blue-200"
                >
                  <Sparkles size={16} /> Generate Career DNA
                </button>
              </div>
            </div>
          )}

          {/* Step: Scanning */}
          {step === "scan" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 size={28} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Scanning your career…</h1>
              <p className="text-muted-foreground text-sm mb-10 max-w-sm mx-auto">Our AI models are analyzing your profile across 50+ career dimensions. This takes about 10 seconds.</p>

              <div className="space-y-3 text-left mb-8">
                {scanSteps.map((s, i) => {
                  const status = scanProgress[s.id] || "pending";
                  return (
                    <div
                      key={s.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                        status === "done" ? "bg-emerald-50 border-emerald-100" :
                        status === "running" ? "bg-blue-50 border-blue-200 shadow-sm" :
                        "bg-white border-border opacity-50"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        status === "done" ? "bg-emerald-500" :
                        status === "running" ? "bg-primary" :
                        "bg-muted"
                      }`}>
                        {status === "done" ? (
                          <Check size={14} className="text-white" />
                        ) : status === "running" ? (
                          <Loader2 size={14} className="text-white animate-spin" />
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">{i + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${status === "done" ? "text-emerald-700" : status === "running" ? "text-primary" : "text-muted-foreground"}`}>
                          {s.label}
                        </p>
                        {status === "running" && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={36} className="text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Your Career DNA is ready</h1>
              <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">After combining profile evidence with your Career Calibration answers, we found your primary archetype: <strong className="text-foreground">{archetype.name} — {archetype.type}</strong>.</p>

              <div className="bg-slate-950 text-white rounded-2xl p-5 mb-6 text-left">
                <div className="flex items-start gap-4">
                  <img src={archetype.image} alt={archetype.animal} className="w-16 h-16 rounded-xl object-cover shadow-md flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Primary Career DNA Animal</p>
                    <h2 className="text-2xl font-bold mt-1">{archetype.name}</h2>
                    <p className="text-sm text-blue-200 font-semibold mt-1">{archetype.core.join(" + ")}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mt-3">{archetype.copy}</p>
                <p className="text-sm text-slate-300 leading-relaxed mt-2"><span className="text-blue-200 font-semibold">Growth move:</span> {archetype.move}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "DNA Confidence", value: "82%", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                  { label: "Career Health Score", value: "78/100", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                  { label: "Open Skill Gaps", value: "4", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
                ].map(m => (
                  <div key={m.label} className={`${m.bg} border ${m.border} rounded-xl p-4 text-center`}>
                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onComplete(dnaScores, {
                  userType: userType || "Exploring / not sure",
                  currentRole: currentRole === "Other…" ? (customCurrentRole.trim() || "Other") : currentRole,
                  targetRole: targetRole === "Other…" ? (customTargetRole.trim() || "Other") : targetRole,
                  salaryRange: salaryRange === "Other…" ? (customSalary.trim() || "Other") : salaryRange,
                })}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm shadow-lg shadow-blue-200"
              >
                View My Career Dashboard <ChevronRight size={16} />
              </button>
              <p className="text-xs text-muted-foreground mt-4">Your scan results are saved and update weekly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
