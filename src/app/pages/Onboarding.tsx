import { useState, useEffect, useRef } from "react";
import { BrandMark } from "../layout/BrandMark";
import {
  Upload, Linkedin, ChevronRight, ChevronLeft,
  BarChart3, Check, Loader2, Briefcase, Target, DollarSign,
  Sparkles, FileText, Globe, Zap, Brain, GraduationCap,
  Trophy, FolderOpen, AlertCircle, ShieldCheck, X,
} from "lucide-react";
import { calculateCareerDna, calibrationQuestions, dimensions } from "../lib/careerDna.js";
import { demoToast } from "../state/toast";
import { detectRoleFamily, FAMILY_LABEL, type RoleFamily } from "../lib/roleFamily";
import { analyzeResume, formatBytes, rejectReasonFor, type AiStatus } from "../lib/resumeParse";
import { TRUST_LABEL, type CareerProfile, type EvidenceItem, type ParsedResume, type TrustLevel } from "../lib/profileTypes";
import { deriveRisks, deriveScorecard } from "../lib/careerRisk";

interface OnboardingProps {
  onComplete: (profile: CareerProfile) => void;
  /** Leaving the wizard from its first step. */
  onBack?: () => void;
}

/* Reading a file is either a success or a different kind of success —
   never an error code shown to someone who just uploaded their CV. */
const AI_STATUS_NOTE: Record<AiStatus, string | null> = {
  ok: null,
  "not-configured":
    "Deep AI analysis isn't switched on for this deployment, so we read your resume on your own device instead. Everything below is real — just extracted by rules rather than by a model.",
  unavailable:
    "We couldn't reach the AI service just now, so we read your resume on your own device instead. Everything below is real — just extracted by rules rather than by a model.",
  "no-text":
    "This PDF has no text layer, so it's probably a scan or a photo. We couldn't read anything from it — the questions ahead will do the work instead.",
};

const USER_TYPES = [
  "Student / learner",
  "Early career",
  "Working professional",
  "Changing direction",
  "Exploring / not sure",
];

/* ── Evidence doors ──
   A property agent and a data analyst do not have the same things to
   show. Asking everyone for "a project or a certificate" gets you a
   blank stare from most of the workforce, so the doors are written per
   role family and named in the words that family actually uses.

   Everything file-based takes PDF only. Supporting five formats badly
   is worse than supporting one properly: PDF is the one format every
   phone, scanner and office suite can produce, and it is the only one
   we can actually read text out of. */

interface EvidenceDoor {
  id: string;
  name: string;
  icon: typeof Upload;
  brand: string; // Tailwind bg class for the icon tile + action button
  hover: string;
  desc: string;
  /** What the door collects. Files are always PDF. */
  input: "pdf" | "link";
  kind: EvidenceItem["kind"];
  /** The most we can claim about this evidence without further checks. */
  trust: TrustLevel;
  /** Shown under a credential door — how it could be raised to Verified. */
  verifyHint?: string;
}

const DOOR_RESUME: EvidenceDoor = {
  id: "resume", name: "Resume or CV", icon: FileText,
  brand: "bg-[#16284B]", hover: "hover:bg-[#1e3560]",
  desc: "One PDF. We read it in your browser — the file never leaves your device.",
  input: "pdf", kind: "resume", trust: "self-declared",
};
const DOOR_LINK: EvidenceDoor = {
  id: "links", name: "LinkedIn or personal site", icon: Linkedin,
  brand: "bg-[#0077B5]", hover: "hover:bg-[#006097]",
  desc: "Paste the URL. We record it as a source you can point an employer at.",
  input: "link", kind: "link", trust: "self-declared",
};

const DOORS_BY_FAMILY: Record<RoleFamily, EvidenceDoor[]> = {
  data: [
    { id: "project", name: "A piece of analysis you built", icon: FolderOpen, brand: "bg-[#115E50]", hover: "hover:bg-[#0d4a3f]",
      desc: "A dashboard, a report, a model write-up — export it as PDF.", input: "pdf", kind: "project", trust: "self-declared" },
    { id: "certificate", name: "A data or cloud certificate", icon: Trophy, brand: "bg-[#8A7038]", hover: "hover:bg-[#75602f]",
      desc: "AWS, Google Cloud, Azure, Coursera — or a university transcript.", input: "pdf", kind: "certificate", trust: "self-declared",
      verifyHint: "Add the issuer's verification link and this becomes Verified." },
    DOOR_LINK, DOOR_RESUME,
  ],
  software: [
    { id: "project", name: "Something you shipped", icon: FolderOpen, brand: "bg-[#115E50]", hover: "hover:bg-[#0d4a3f]",
      desc: "A project write-up, an architecture doc, a final-year build — as PDF.", input: "pdf", kind: "project", trust: "self-declared" },
    { id: "certificate", name: "A technical certificate", icon: Trophy, brand: "bg-[#8A7038]", hover: "hover:bg-[#75602f]",
      desc: "Cloud, security, or a completed course. Diplomas and TVET count.", input: "pdf", kind: "certificate", trust: "self-declared",
      verifyHint: "Add the issuer's verification link and this becomes Verified." },
    DOOR_LINK, DOOR_RESUME,
  ],
  design: [
    { id: "portfolio", name: "A case study from your portfolio", icon: FolderOpen, brand: "bg-[#115E50]", hover: "hover:bg-[#0d4a3f]",
      desc: "One project, start to finish — the problem, your work, the outcome. PDF.", input: "pdf", kind: "portfolio", trust: "self-declared" },
    { id: "certificate", name: "A design qualification", icon: Trophy, brand: "bg-[#8A7038]", hover: "hover:bg-[#75602f]",
      desc: "A diploma, a course certificate, a competition result.", input: "pdf", kind: "certificate", trust: "self-declared",
      verifyHint: "Add the issuer's verification link and this becomes Verified." },
    { ...DOOR_LINK, name: "Behance, Dribbble or your site", desc: "Paste the URL where your work lives." },
    DOOR_RESUME,
  ],
  marketing: [
    { id: "record", name: "Results you owned", icon: FolderOpen, brand: "bg-[#115E50]", hover: "hover:bg-[#0d4a3f]",
      desc: "A campaign report, a growth deck, a performance summary. PDF.", input: "pdf", kind: "record", trust: "self-declared" },
    { id: "certificate", name: "A platform certification", icon: Trophy, brand: "bg-[#8A7038]", hover: "hover:bg-[#75602f]",
      desc: "Google Ads, Meta Blueprint, HubSpot — or a marketing diploma.", input: "pdf", kind: "certificate", trust: "self-declared",
      verifyHint: "Add the issuer's verification link and this becomes Verified." },
    { ...DOOR_LINK, name: "Published work or your profile", desc: "A campaign page, an article, a LinkedIn URL." },
    DOOR_RESUME,
  ],
  product: [
    { id: "project", name: "A product you helped ship", icon: FolderOpen, brand: "bg-[#115E50]", hover: "hover:bg-[#0d4a3f]",
      desc: "A spec, a launch summary, a case study — as PDF.", input: "pdf", kind: "project", trust: "self-declared" },
    { id: "certificate", name: "A qualification", icon: Trophy, brand: "bg-[#8A7038]", hover: "hover:bg-[#75602f]",
      desc: "A degree, a diploma, or a product or agile certification.", input: "pdf", kind: "certificate", trust: "self-declared",
      verifyHint: "Add the issuer's verification link and this becomes Verified." },
    DOOR_LINK, DOOR_RESUME,
  ],
  business: [
    { id: "certificate", name: "Your licence or registration", icon: ShieldCheck, brand: "bg-[#8A7038]", hover: "hover:bg-[#75602f]",
      desc: "REN or REA registration, an insurance or financial licence, a professional body number.", input: "pdf", kind: "certificate", trust: "self-declared",
      verifyHint: "Registrations can be checked against the public register — add the number to verify." },
    { id: "record", name: "A record of what you closed", icon: FolderOpen, brand: "bg-[#115E50]", hover: "hover:bg-[#0d4a3f]",
      desc: "Sales figures, transactions handled, targets met. A PDF summary is enough.", input: "pdf", kind: "record", trust: "self-declared" },
    { id: "reference", name: "A letter from an employer", icon: GraduationCap, brand: "bg-[#4F46E5]", hover: "hover:bg-[#4338ca]",
      desc: "A reference or confirmation of employment, on company letterhead.", input: "pdf", kind: "reference", trust: "corroborated" },
    DOOR_RESUME,
  ],
  service: [
    { id: "reference", name: "A letter from where you worked", icon: GraduationCap, brand: "bg-[#4F46E5]", hover: "hover:bg-[#4338ca]",
      desc: "A reference letter, a confirmation of employment, or a payslip with the dates on it.", input: "pdf", kind: "reference", trust: "corroborated" },
    { id: "certificate", name: "Training you've completed", icon: Trophy, brand: "bg-[#8A7038]", hover: "hover:bg-[#75602f]",
      desc: "Food handling, first aid, safety, barista or hospitality training. SPM counts too.", input: "pdf", kind: "certificate", trust: "self-declared",
      verifyHint: "Add the issuer's verification link and this becomes Verified." },
    { id: "record", name: "Proof of responsibility", icon: FolderOpen, brand: "bg-[#115E50]", hover: "hover:bg-[#0d4a3f]",
      desc: "A promotion letter, a shift-lead roster, anything showing what you ran.", input: "pdf", kind: "record", trust: "self-declared" },
    DOOR_RESUME,
  ],
  generic: [
    { id: "record", name: "Proof of what you've done", icon: FolderOpen, brand: "bg-[#115E50]", hover: "hover:bg-[#0d4a3f]",
      desc: "A project, a report, a work record — whatever shows your actual output. PDF.", input: "pdf", kind: "record", trust: "self-declared" },
    { id: "certificate", name: "A qualification or certificate", icon: Trophy, brand: "bg-[#8A7038]", hover: "hover:bg-[#75602f]",
      desc: "SPM, STPM, diploma, TVET, a short course — all of it counts.", input: "pdf", kind: "certificate", trust: "self-declared",
      verifyHint: "Add the issuer's verification link and this becomes Verified." },
    { id: "reference", name: "A letter from an employer", icon: GraduationCap, brand: "bg-[#4F46E5]", hover: "hover:bg-[#4338ca]",
      desc: "A reference or confirmation of employment.", input: "pdf", kind: "reference", trust: "corroborated" },
    DOOR_LINK, DOOR_RESUME,
  ],
};

/* The role lists reach well beyond tech on purpose. Most of Malaysia's
   underemployed graduates are not analysts, and a career product that
   only lists engineering titles tells everyone else it isn't for them. */
const roles = [
  "Student / no job yet",
  "Data Analyst", "Senior Data Analyst", "Analytics Engineer", "Data Engineer",
  "ML Engineer", "Data Scientist",
  "Software Engineer", "Senior Software Engineer", "QA Engineer", "IT Support",
  "Product Manager", "Business Analyst", "Project Coordinator",
  "Graphic Designer", "UX/UI Designer", "Content Creator", "Videographer",
  "Marketing Executive", "Digital Marketing Specialist", "Social Media Executive",
  "Sales Executive", "Account Manager", "Business Development Executive",
  "Real Estate Negotiator", "Property Agent", "Insurance Agent",
  "Accountant", "Audit Associate", "Finance Executive", "Bank Officer",
  "Admin Executive", "Human Resources Executive", "Customer Service Officer",
  "Retail Supervisor", "Restaurant Server", "Barista", "Chef / Cook",
  "Hotel Front Desk", "Nurse", "Technician", "Logistics Coordinator",
];

const targetRoles = [
  "Data Analyst", "Senior Data Analyst", "Analytics Engineer", "Data Engineer",
  "ML Engineer", "Data Scientist", "Data Science Manager", "Head of Data",
  "Software Engineer", "Senior Software Engineer", "Engineering Manager",
  "Product Manager", "Senior Product Manager", "Business Analyst",
  "UX/UI Designer", "Senior Designer", "Design Lead", "Art Director",
  "Marketing Manager", "Growth Manager", "Brand Manager", "Content Lead",
  "Sales Manager", "Key Account Manager", "Business Development Manager",
  "Real Estate Agent", "Property Manager", "Financial Advisor",
  "Finance Manager", "Chartered Accountant", "HR Manager",
  "Operations Manager", "Restaurant Manager", "Hotel Supervisor",
  "Team Lead", "Independent Consultant", "Starting my own business",
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
  { id: "market", label: "Benchmarking Market Demand", detail: "Comparing your profile against our Malaysian role, salary and demand datasets", duration: 2200 },
  { id: "blind", label: "Detecting Blind Spots", detail: "Running 50+ career risk models: automation exposure, stagnation signals, demand shifts", duration: 2000 },
  { id: "scenarios", label: "Generating Decision Scenarios", detail: "Simulating 4 future career paths with salary, promotion, and satisfaction projections", duration: 1900 },
  { id: "prescription", label: "Building Career Prescription", detail: "Synthesizing findings into a personalized 30/90-day action plan", duration: 1600 },
];

type Step = "upload" | "connect" | "profile" | "calibration" | "scan" | "done";

export function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [step, setStep] = useState<Step>("upload");
  const [userType, setUserType] = useState("");
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [resumeState, setResumeState] = useState<"idle" | "reading" | "done" | "error">("idle");
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeNote, setResumeNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [linkDraft, setLinkDraft] = useState("");
  const [openDoor, setOpenDoor] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState("");
  const [customCurrentRole, setCustomCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [customTargetRole, setCustomTargetRole] = useState("");
  const [experience, setExperience] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [customSalary, setCustomSalary] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
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

  /* ── Career DNA scoring ──
     Career DNA now uses a psychometric-style preference matrix. Each
     answer contributes evidence to three opposing axes:
     Technical ↔ Communication, Execution ↔ Innovation, and Strategic ↔
     Leadership. The result is deterministic, but no dimension is left
     at an artificial floor simply because a question missed it. */
  const dnaResult = calculateCareerDna(calibrationAnswers);
  const dnaScores: Record<string, number> = dnaResult.scores;
  const archetype = dnaResult.archetype;
  const dnaConfidence = dnaResult.confidence;

  const profileFieldsComplete = Boolean(
    currentRole &&
    targetRole &&
    experience &&
    salaryRange &&
    (currentRole !== "Other…" || customCurrentRole.trim()) &&
    (targetRole !== "Other…" || customTargetRole.trim()) &&
    (salaryRange !== "Other…" || customSalary.trim())
  );

  /* The completed scan, assembled once and handed to the app whole.
     The summary tiles below read from exactly the same object the rest
     of the product will, so what the user is shown here is what they
     get on the dashboard. */
  const builtProfile: CareerProfile = {
    userType: userType || "Exploring / not sure",
    currentRole: currentRole === "Other…" ? (customCurrentRole.trim() || "Other") : currentRole,
    targetRole: targetRole === "Other…" ? (customTargetRole.trim() || "Other") : targetRole,
    salaryRange: salaryRange === "Other…" ? (customSalary.trim() || "Other") : salaryRange,
    experience,
    goals: selectedGoals,
    dnaScores,
    archetypeName: archetype.name,
    calibrationAnswers,
    resume: parsedResume,
    evidence,
    scannedAt: new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }),
  };
  const risks = deriveRisks(builtProfile);
  const scorecard = deriveScorecard(builtProfile);

  const startScan = () => {
    setStep("scan");
    setScanProgress({});
    setCurrentScanStep(0);
  };

  useEffect(() => {
    if (step !== "scan") return;
    let idx = 0;
    // Every timer in the chain is tracked, not just the first — leaving
    // the scan mid-run used to keep firing state updates afterwards.
    const timers: ReturnType<typeof setTimeout>[] = [];
    const runNext = () => {
      if (idx >= scanSteps.length) {
        timers.push(setTimeout(() => setStep("done"), 600));
        return;
      }
      const s = scanSteps[idx];
      setScanProgress(prev => ({ ...prev, [s.id]: "running" }));
      setCurrentScanStep(idx);
      timers.push(setTimeout(() => {
        setScanProgress(prev => ({ ...prev, [s.id]: "done" }));
        idx++;
        timers.push(setTimeout(runNext, 200));
      }, s.duration));
    };
    timers.push(setTimeout(runNext, 300));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  /* ── Evidence intake ── */

  const roleFamily: RoleFamily = detectRoleFamily(
    currentRole === "Other…" ? customCurrentRole : currentRole,
    targetRole === "Other…" ? customTargetRole : targetRole,
  );
  const doors = DOORS_BY_FAMILY[roleFamily];
  const hasEvidence = (id: string) => evidence.some(e => e.id.startsWith(id));

  const addEvidenceItem = (door: EvidenceDoor, label: string, source: string, skills: string[] = []) => {
    setEvidence(prev =>
      prev.some(e => e.id.startsWith(door.id) && e.source === source)
        ? prev
        : [...prev, {
            id: `${door.id}-${prev.length + 1}`,
            kind: door.kind,
            label,
            source,
            trust: door.trust,
            skills,
            addedAt: "Just now",
          }],
    );
  };

  const handleResumeFile = async (file: File | undefined | null) => {
    if (!file) return;
    const rejection = rejectReasonFor(file);
    if (rejection) {
      setResumeState("error");
      setResumeError(rejection);
      setParsedResume(null);
      return;
    }
    setResumeState("reading");
    setResumeError(null);
    setResumeNote(null);
    try {
      const { resume, aiStatus } = await analyzeResume(file);
      setParsedResume(resume);
      setResumeState("done");
      setResumeNote(AI_STATUS_NOTE[aiStatus]);
      addEvidenceItem(DOOR_RESUME, resume.fileName, resume.fileName, resume.skills);
    } catch (err) {
      setResumeState("error");
      setResumeError(
        err instanceof Error ? `We couldn't read that PDF — ${err.message}` : "We couldn't read that PDF.",
      );
    }
  };

  const handleDoorFile = (door: EvidenceDoor, file: File | undefined | null) => {
    if (!file) return;
    if (door.id === "resume") { void handleResumeFile(file); return; }
    const rejection = rejectReasonFor(file);
    if (rejection) { demoToast(rejection); return; }
    addEvidenceItem(door, file.name, file.name);
    setOpenDoor(null);
    demoToast(`${file.name} added · ${formatBytes(file.size)}`);
  };

  const handleDoorLink = (door: EvidenceDoor) => {
    const url = linkDraft.trim();
    if (!/^https?:\/\/.+\..+/.test(url)) {
      demoToast("That doesn't look like a full URL — include https://");
      return;
    }
    addEvidenceItem(door, new URL(url).hostname.replace(/^www\./, ""), url);
    setLinkDraft("");
    setOpenDoor(null);
  };

  const answeredCount = calibrationQuestions.filter(q => calibrationAnswers[q.id]).length;
  /* Single source for the wizard order, so the progress bar, the Back
     buttons and the Continue buttons can never disagree about what
     comes next. */
  const STEP_ORDER: Step[] = ["upload", "profile", "connect", "calibration"];
  const STEP_LABELS = ["Resume", "Your career", "Evidence", "Calibration"];
  const stepIndex = STEP_ORDER.indexOf(step);
  const totalSteps = STEP_ORDER.length;
  const goPrev = () => {
    if (stepIndex > 0) setStep(STEP_ORDER[stepIndex - 1]);
    else onBack?.();
  };
  const goNext = () => {
    if (stepIndex >= 0 && stepIndex < totalSteps - 1) setStep(STEP_ORDER[stepIndex + 1]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Nav */}
      <nav className="h-16 border-b border-border bg-white/80 backdrop-blur-md flex items-center px-8">
        <div className="flex items-center gap-2.5">
          <BrandMark size={32} />
        </div>
      </nav>

      <div className={`flex-1 flex items-center justify-center px-6 ${step === "calibration" || step === "connect" ? "py-4" : "py-12"}`}>
        <div className={`w-full ${step === "calibration" || step === "connect" ? "max-w-[1380px]" : "max-w-2xl"}`}>

          {/* Progress indicator */}
          {step !== "scan" && step !== "done" && (
            <div className={`flex items-center gap-2 justify-center ${step === "calibration" || step === "connect" ? "mb-4" : "mb-8"}`}>
              {STEP_LABELS.map((label, i) => (
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

              {/* Drop zone — a real file input. The PDF is read in this
                  browser; only the extracted text is ever sent anywhere. */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={e => { void handleResumeFile(e.target.files?.[0]); e.target.value = ""; }}
              />
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  void handleResumeFile(e.dataTransfer.files?.[0]);
                }}
                onClick={() => resumeState !== "reading" && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-4 ${
                  isDragging ? "border-primary bg-blue-50" :
                  resumeState === "done" ? "border-emerald-300 bg-emerald-50" :
                  resumeState === "error" ? "border-red-300 bg-red-50" :
                  "border-border hover:border-primary/50 hover:bg-blue-50/30"
                }`}
              >
                {resumeState === "reading" ? (
                  <div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Loader2 size={20} className="text-primary animate-spin" />
                    </div>
                    <p className="font-medium text-foreground">Reading your resume…</p>
                    <p className="text-sm text-muted-foreground mt-1">Extracting text, then pulling out your experience.</p>
                  </div>
                ) : resumeState === "done" && parsedResume ? (
                  <div className="text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={18} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-emerald-700 truncate">{parsedResume.fileName}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          {formatBytes(parsedResume.fileSize)} · {parsedResume.method === "ai" ? "Analyzed by AI" : "Rule-based extraction"}
                        </p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-xs">
                      {parsedResume.name && <p><span className="text-muted-foreground">Name</span> · <span className="font-medium text-foreground">{parsedResume.name}</span></p>}
                      {parsedResume.currentTitle && <p><span className="text-muted-foreground">Most recent</span> · <span className="font-medium text-foreground">{parsedResume.currentTitle}</span></p>}
                      {parsedResume.yearsExperience !== undefined && <p><span className="text-muted-foreground">Experience</span> · <span className="font-medium text-foreground">{parsedResume.yearsExperience} years</span></p>}
                      {!!parsedResume.employers.length && <p className="truncate"><span className="text-muted-foreground">Worked at</span> · <span className="font-medium text-foreground">{parsedResume.employers.slice(0, 2).join(", ")}</span></p>}
                      {!!parsedResume.education.length && <p className="sm:col-span-2 truncate"><span className="text-muted-foreground">Education</span> · <span className="font-medium text-foreground">{parsedResume.education[0]}</span></p>}
                    </div>
                    {!!parsedResume.skills.length && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {parsedResume.skills.slice(0, 12).map(s => (
                          <span key={s} className="text-[11px] bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {parsedResume.skills.length > 12 && (
                          <span className="text-[11px] text-emerald-600 px-1 py-0.5">+{parsedResume.skills.length - 12} more</span>
                        )}
                      </div>
                    )}
                    {!parsedResume.skills.length && (
                      <p className="text-xs text-muted-foreground mt-3">No recognisable skills found in this file — the calibration questions will do the work instead.</p>
                    )}
                    <p className="text-xs text-primary font-medium mt-3">Click to replace this file</p>
                  </div>
                ) : (
                  <div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${resumeState === "error" ? "bg-red-100" : "bg-muted"}`}>
                      {resumeState === "error"
                        ? <AlertCircle size={20} className="text-red-500" />
                        : <Upload size={20} className="text-muted-foreground" />}
                    </div>
                    <p className="font-medium text-foreground">
                      {resumeState === "error" ? "That didn't work" : "Drop your resume here, or click to upload"}
                    </p>
                    <p className={`text-sm mt-1 ${resumeState === "error" ? "text-red-600" : "text-muted-foreground"}`}>
                      {resumeState === "error" ? resumeError : "PDF only · Max 10 MB"}
                    </p>
                  </div>
                )}
              </div>

              {resumeNote && (
                <p className="text-xs text-muted-foreground bg-muted border border-border rounded-lg px-3 py-2.5 mb-3 leading-relaxed">
                  {resumeNote}
                </p>
              )}

              <p className="text-center text-xs text-muted-foreground mb-2">
                Your PDF is read in your browser and never uploaded. Only the extracted text is analysed.
              </p>
              <p className="text-center text-sm mb-8">
                <button onClick={() => setStep("profile")} className="text-primary font-semibold hover:underline">
                  No resume yet? Answer a few questions instead →
                </button>
              </p>

              <div className="flex items-center justify-between">
                <button onClick={goPrev} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <div className="flex items-center gap-5">
                  <button
                    onClick={goNext}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={goNext}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Connect accounts */}
          {step === "connect" && (
            <div>
              <div className="flex items-start gap-2.5 mb-5">
                <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe size={17} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground tracking-tight">What can you show for it?</h1>
                  <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                    What carries weight for {FAMILY_LABEL[roleFamily].toLowerCase()} work. Add what you have, skip what you don&apos;t — none of it is required.
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-3 mb-5 items-start">
                {doors.map(door => {
                  const added = hasEvidence(door.id);
                  const isOpen = openDoor === door.id;
                  const Icon = door.icon;
                  const mine = evidence.filter(e => e.id.startsWith(door.id));
                  return (
                    <div key={door.id} className={`rounded-2xl border transition-all ${added ? "bg-emerald-50/60 border-emerald-200" : "bg-white border-border"}`}>
                      <div className="flex items-center gap-4 p-5">
                        <div className={`w-12 h-12 ${door.brand} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon size={22} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{door.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{door.desc}</p>
                          {mine.map(item => (
                            <p key={item.id} className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1.5 truncate">
                              <Check size={12} className="flex-shrink-0" />
                              <span className="truncate">{item.label}</span>
                              <span className="text-[10px] uppercase tracking-wide bg-white border border-emerald-200 rounded-full px-1.5 py-0.5 flex-shrink-0">
                                {TRUST_LABEL[item.trust]}
                              </span>
                            </p>
                          ))}
                          {added && door.verifyHint && (
                            <p className="text-[11px] text-muted-foreground mt-1.5">{door.verifyHint}</p>
                          )}
                        </div>
                        {door.input === "pdf" ? (
                          <label className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${added ? "bg-white text-emerald-700 border border-emerald-200" : `${door.brand} ${door.hover} text-white`}`}>
                            {added ? "Add another" : "Upload PDF"}
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              className="hidden"
                              onChange={e => { handleDoorFile(door, e.target.files?.[0]); e.target.value = ""; }}
                            />
                          </label>
                        ) : (
                          <button
                            onClick={() => setOpenDoor(isOpen ? null : door.id)}
                            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${added ? "bg-white text-emerald-700 border border-emerald-200" : `${door.brand} ${door.hover} text-white`}`}
                          >
                            {isOpen ? "Cancel" : added ? "Add another" : "Add link"}
                          </button>
                        )}
                      </div>
                      {isOpen && door.input === "link" && (
                        <div className="px-5 pb-5 flex gap-2">
                          <input
                            autoFocus
                            value={linkDraft}
                            onChange={e => setLinkDraft(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleDoorLink(door); }}
                            placeholder="https://linkedin.com/in/yourname"
                            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            onClick={() => handleDoorLink(door)}
                            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* We tell people what we can and cannot stand behind rather
                  than letting an uploaded file imply it was checked. */}
              <div className="mb-5 bg-accent border border-border rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck size={16} className="text-[#8A7038] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">How much we can vouch for this</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Anything you upload starts as <strong className="text-foreground">Self-declared</strong> — we have read it, but nobody has checked it.
                    A letter from an employer counts as <strong className="text-foreground">Corroborated</strong>.
                    Only a credential we can confirm against the issuer's own record becomes <strong className="text-foreground">Verified</strong>.
                    Employers see which is which.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep("calibration")}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 text-primary rounded-2xl px-5 py-4 text-sm font-semibold hover:bg-blue-50/60 transition-colors mb-4"
              >
                <Sparkles size={15} /> Nothing to upload? Answer quick questions instead →
              </button>

              <p className="text-center text-xs text-muted-foreground mb-8">
                Nobody gets blocked here. Evidence sharpens the scan — the calibration questions alone are enough to start.
              </p>

              <div className="flex justify-between">
                <button onClick={goPrev} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={goNext}
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
                      <option value="" disabled>Select current role</option>
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
                      <option value="" disabled>Select target role</option>
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
                      <option value="" disabled>Select experience</option>
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
                      <option value="" disabled>Select salary range</option>
                      {["<RM 3k/mo", "RM 3k-5k/mo", "RM 5k-8k/mo", "RM 8k-12k/mo", "RM 12k-20k/mo", "RM 20k+/mo", "Other…"].map(v => <option key={v}>{v}</option>)}
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
                <button onClick={goPrev} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={goNext}
                  disabled={!profileFieldsComplete || selectedGoals.length === 0}
                  className="flex items-center gap-2 bg-primary text-white px-7 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-lg shadow-blue-200"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step: Career Calibration */}
          {step === "calibration" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain size={17} className="text-purple-600" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight">Career Calibration</h1>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2 max-w-lg">
                    Six scenarios. No archetype is assigned until all six are answered.
                  </p>
                </div>

                <div className="sm:w-56 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-bold text-primary">{answeredCount}/{calibrationQuestions.length}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(answeredCount / calibrationQuestions.length) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 mb-4 lg:grid-cols-2 lg:auto-rows-[196px] items-stretch">
                {calibrationQuestions.map((item, index) => (
                  <div key={item.id} className="bg-white border border-border rounded-2xl p-[18px] flex flex-col overflow-hidden">
                    <div className="flex items-start gap-2.5 lg:h-11 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-px">
                        {index + 1}
                      </div>
                      <p className="font-semibold text-foreground text-base leading-[1.3]">{item.question}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(optionOrders[item.id] ?? item.options.map((_, i) => i)).map(oi => item.options[oi]).map(option => {
                        const active = calibrationAnswers[item.id] === option;
                        return (
                          <button
                            key={option}
                            onClick={() => setCalibrationAnswers(prev => ({ ...prev, [item.id]: option }))}
                            className={`text-left rounded-xl border px-3.5 py-2.5 lg:py-0 lg:h-12 flex items-center text-sm leading-[1.25] transition-all ${
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
                <button onClick={goPrev} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
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

              {/* Nobody should be stuck watching a progress bar they can't leave. */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setStep("calibration")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={16} /> Cancel and change my answers
                </button>
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
              <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">After combining profile evidence with your Career Calibration answers, your career reads as a <strong className="text-foreground">{archetype.type}</strong>.</p>

              <div className="bg-slate-950 text-white rounded-2xl p-5 mb-6 text-left">
                <div className="flex items-start gap-4">
                  <img src={archetype.image} alt={archetype.animal} className="w-16 h-16 rounded-xl object-cover shadow-md flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Your Career DNA</p>
                    <h2 className="text-2xl font-bold mt-1">{archetype.type}</h2>
                    <p className="text-sm text-blue-200 font-semibold mt-1">{archetype.name} · {archetype.core.join(" + ")}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mt-3">{archetype.copy}</p>
                <p className="text-sm text-slate-300 leading-relaxed mt-2"><span className="text-blue-200 font-semibold">Growth move:</span> {archetype.move}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "DNA confidence", value: `${dnaConfidence}%`, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                  { label: "Career Health", value: `${scorecard.careerHealth}/100`, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                  { label: risks.length === 1 ? "Open risk" : "Open risks", value: String(risks.length), color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
                ].map(m => (
                  <div key={m.label} className={`${m.bg} border ${m.border} rounded-xl p-4 text-center`}>
                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Showing the arithmetic is the whole point of the product —
                  a score nobody can interrogate is just a number. */}
              <details className="text-left bg-white border border-border rounded-xl mb-8 group">
                <summary className="cursor-pointer list-none px-5 py-3.5 flex items-center justify-between text-sm font-semibold text-foreground">
                  How this was calculated
                  <ChevronRight size={15} className="text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Career DNA uses three opposing preference axes, similar to a workplace psychometric model:
                    work signal, operating mode, and influence style. Each answer contributes to all three axes,
                    then the strongest two dimensions select the animal. Same answers, same result — every time.
                  </p>
                  {dnaResult.axisRows.map(axis => (
                    <div key={axis.id} className="bg-muted border border-border rounded-lg px-3 py-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-xs font-semibold text-foreground">{axis.label}</span>
                        <span className="text-xs font-bold text-primary">{axis.winner}</span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-xs">
                        <span className="text-muted-foreground">{axis.leftLabel}</span>
                        <span className="text-foreground font-semibold tabular-nums">
                          {axis.leftPercent}% / {axis.rightPercent}%
                        </span>
                        <span className="text-muted-foreground text-right">{axis.rightLabel}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${axis.leftPercent}%` }} />
                      </div>
                    </div>
                  ))}
                  {/* The six scores, plainly. Which question contributed
                      what is the engine's business, not the reader's. */}
                  <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2 pt-1">
                    {(dimensions as string[]).map(d => (
                      <div key={d} className="flex items-center gap-2.5">
                        <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{d}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${dnaScores[d]}%` }} />
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-foreground w-6 text-right">
                          {dnaScores[d]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep("calibration")}
                  className="flex items-center justify-center gap-1.5 border border-border text-muted-foreground hover:text-foreground hover:bg-muted px-5 py-3.5 rounded-xl transition-colors font-medium text-sm flex-shrink-0"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => onComplete(builtProfile)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm shadow-lg shadow-blue-200"
                >
                  View My Career Dashboard <ChevronRight size={16} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Re-scan any time — your Career Health moves as the market does.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
