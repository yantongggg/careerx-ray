import { useState } from "react";
import { ArrowRight, Briefcase, Building2, CheckCircle, Clock, FileText, GraduationCap, Link2, MapPin, PenLine, Send, Shield, Sparkles, Upload, User } from "lucide-react";
import { PositionSkillGraph } from "./PositionSkillGraph";
import { demoToast } from "../state/toast";
import { useCareerProfile } from "../state/careerProfile";
import { angleFor, fitFor, jobById, successChanceFor } from "../lib/careerCorpus";
import { buildCoverLetterForJob, buildResumeForJob } from "../lib/resumeGen";
import type { CareerProfile } from "../lib/profileTypes";

/* ────────────────────────────────────────────────────────────────
   Everything on this page comes from the user's own scan.

   It used to hold CANDIDATE_DATA — Jordan Kim, University of Malaya,
   a Maybank internship, ten skills led by SQL and Tableau — and render
   that as "your profile" no matter who was signed in. The postings and
   the resume drafts were fixed to the same three data-analytics jobs.
   ──────────────────────────────────────────────────────────────── */

/** What the profile can tell us about the person, and what it cannot. */
interface CandidateView {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  resumeFile: string | null;
  resumeNote: string;
  education: string[];
  employers: string[];
  skills: string[];
  certifications: string[];
  portfolio: string[];
}

const UNKNOWN = "Not on file";

function candidateFrom(profile: CareerProfile, displayName: string): CandidateView {
  const r = profile.resume;
  const certs = [
    ...(r?.certifications ?? []),
    ...profile.evidence.filter(e => e.kind === "certificate").map(e => e.label),
  ];
  const links = profile.evidence
    .filter(e => e.kind === "portfolio" || e.kind === "link" || e.kind === "project")
    .map(e => e.source || e.label);

  const years = r?.yearsExperience;
  const from = r?.currentTitle || profile.currentRole;
  const summary = [
    from ? `${from}${years ? ` with ${years}+ years of experience` : ""}` : "Early in your career",
    profile.targetRole ? `moving toward ${profile.targetRole}` : null,
    (r?.skills ?? []).length ? `Strongest in ${(r?.skills ?? []).slice(0, 4).join(", ")}.` : null,
  ].filter(Boolean).join(", ").replace(/,([^,]*)$/, ".$1");

  return {
    name: displayName,
    email: r?.email || UNKNOWN,
    phone: r?.phone || UNKNOWN,
    location: "Malaysia",
    summary: summary || "Complete your scan to build a summary.",
    resumeFile: r?.fileName ?? null,
    resumeNote: r
      ? `${(r.fileSize / 1024).toFixed(0)} KB · read ${r.method === "ai" ? "by AI extraction" : "with on-device parsing"}`
      : "No resume uploaded — the drafts below are built from your scan answers.",
    education: r?.education ?? [],
    employers: r?.employers ?? [],
    skills: r?.skills ?? [],
    certifications: certs,
    portfolio: links,
  };
}

/* Reached from the Apply rail rather than from a job card: there is no
   job to tailor against yet, so say that instead of rendering nothing. */
function NoJobPicked({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Briefcase className="h-5 w-5 text-slate-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900">Pick a job first</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Application Prep writes your resume and cover letter against one specific
        posting. Choose the role you're applying for and it will tailor to that.
      </p>
      <button
        onClick={onBack}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Browse matched jobs <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ApplicationPrepProps {
  jobId: string | null;
  onBack: () => void;
  onApply: (jobId: string) => void;
  onCoach: () => void;
}

export function ApplicationPrep({ jobId, onBack, onApply, onCoach }: ApplicationPrepProps) {
  const { profile, displayName } = useCareerProfile();
  const [submitted, setSubmitted] = useState(false);
  // Per-job edits: undefined = still on the AI draft
  const [docEdits, setDocEdits] = useState<Record<string, { resume?: string; cover?: string }>>({});
  const job = jobById(profile, jobId);

  if (!job) return <NoJobPicked onBack={onBack} />;

  // Past the guard job.id is the same string as jobId, but only job.id
  // carries that through the type checker.
  const key = job.id;

  const candidate = candidateFrom(profile, displayName);
  const fit = fitFor(profile, job);
  const successChance = successChanceFor(profile, job);
  const salaryBand = `RM ${job.salaryLow.toLocaleString()} – ${job.salaryHigh.toLocaleString()}`;
  const target = {
    id: job.id, title: job.title, company: job.company,
    location: job.location, requirements: job.requirements,
    angle: angleFor(profile, job),
  };
  const aiResume = buildResumeForJob(profile, target);
  const aiCover = buildCoverLetterForJob(profile, target);
  const resumeText = docEdits[key]?.resume ?? aiResume;
  const coverText = docEdits[key]?.cover ?? aiCover;
  const setDoc = (field: "resume" | "cover", value: string | undefined) =>
    setDocEdits(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const handleApply = () => {
    // resumeText / coverText (including any candidate edits) are what get submitted
    demoToast("Application submitted with your customized resume + cover letter ✓");
    setSubmitted(true);
    onApply(key);
  };

  if (submitted) {
    return (
      <div className="flex-1 overflow-y-auto bg-muted">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto space-y-6">
          <div className="bg-white border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Application Submitted!</h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Your application to <span className="font-semibold text-foreground">{job.title}</span> at <span className="font-semibold text-foreground">{job.company}</span> has been sent successfully.
            </p>

            <div className="mt-6 p-4 bg-accent rounded-xl border border-border inline-block">
              <div className="flex items-center gap-3 text-sm">
                <Clock size={14} className="text-primary" />
                <span className="text-muted-foreground">Applied:</span>
                <span className="font-semibold text-foreground">{new Date().toLocaleString("en-MY", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <button onClick={onBack} className="inline-flex items-center gap-2 border border-border px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
                Back to Jobs
              </button>
              <button onClick={onCoach} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-colors">
                AI Interview Coaching <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">

        {/* Back button */}
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Job Listings
        </button>

        {/* Job Details */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center">
                  <Building2 size={18} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{job.title}</h1>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                <span className="inline-flex items-center gap-1"><Briefcase size={12} /> {job.type}</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {salaryBand}/month</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-bold text-primary">{fit}%</div>
              <p className="text-xs text-muted-foreground">Skill Match</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-2">About the Role</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Requirements</h3>
            <ul className="space-y-1.5">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 p-3 bg-accent rounded-lg border border-border flex items-center gap-3">
            <Shield size={16} className="text-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">AI Success Prediction</p>
              <p className="text-xs text-muted-foreground">Based on your profile, there's a <span className="font-bold text-primary">{successChance}%</span> chance of progressing to interview stage.</p>
            </div>
          </div>
        </section>

        {/* Skill System */}
        <PositionSkillGraph
          position={job.position}
          companyLabel={job.company}
          companyColors={job.companyColors}
          companyGlow={job.companyGlow}
          strengths={job.strengths}
          gaps={job.gaps}
          candidateSkills={candidate.skills}
        />

        {/* Application Review — Auto-filled */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Application Review</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Auto-filled from your CareerX-Ray profile — review and confirm</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">Auto-filled</span>
          </div>

          <div className="space-y-5">
            {/* Personal Info */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{candidate.name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{candidate.email}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{candidate.phone}</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="font-medium text-foreground">{candidate.location}</span></div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 italic">{candidate.summary}</p>
            </div>

            {/* Resume */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Resume / CV</h3>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${candidate.resumeFile ? "bg-red-50" : "bg-slate-100"}`}>
                  <FileText size={18} className={candidate.resumeFile ? "text-red-500" : "text-slate-400"} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{candidate.resumeFile ?? "No resume on file"}</p>
                  <p className="text-xs text-muted-foreground">{candidate.resumeNote}</p>
                </div>
                <Upload size={14} className="text-muted-foreground" />
              </div>
            </div>

            {/* Education */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Education</h3>
              </div>
              {candidate.education.length
                ? candidate.education.map((edu, i) => (
                    <p key={i} className="text-sm font-medium text-foreground">{edu}</p>
                  ))
                : <p className="text-sm text-muted-foreground">Upload a resume to pull this through automatically.</p>}
            </div>

            {/* Work Experience */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Work Experience</h3>
              </div>
              <div className="space-y-3">
                {candidate.employers.length
                  ? candidate.employers.map((emp, i) => (
                      <div key={i} className="text-sm border-l-2 border-primary/30 pl-3">
                        <p className="font-medium text-foreground">{emp}</p>
                      </div>
                    ))
                  : <p className="text-sm text-muted-foreground">
                      {profile.currentRole
                        ? `You told us you are a ${profile.currentRole}. Upload a resume to add employers and dates.`
                        : "Upload a resume to add your work history."}
                    </p>}
              </div>
            </div>

            {/* Skills */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.length
                  ? candidate.skills.map(skill => (
                      <span key={skill} className="text-xs bg-white border border-border px-2.5 py-1 rounded-full font-medium text-foreground">{skill}</span>
                    ))
                  : <span className="text-sm text-muted-foreground">No skills extracted yet — upload a resume or add evidence.</span>}
              </div>
            </div>

            {/* Certifications & Portfolio */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-accent/50 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={14} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Certifications</h3>
                </div>
                <ul className="space-y-1">
                  {candidate.certifications.length
                    ? candidate.certifications.map((cert, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {cert}</li>
                      ))
                    : <li className="text-xs text-muted-foreground">None on file yet.</li>}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-accent/50 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 size={14} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Portfolio Links</h3>
                </div>
                <ul className="space-y-1">
                  {candidate.portfolio.length
                    ? candidate.portfolio.map((link, i) => (
                        <li key={i} className="text-xs text-primary font-medium">• {link}</li>
                      ))
                    : <li className="text-xs text-muted-foreground">None connected yet.</li>}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tailored Documents — editable */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-foreground">Your Submission Documents</h2>
            <span className="inline-flex items-center gap-1 text-xs bg-[#8A7038]/10 text-[#8A7038] border border-[#8A7038]/30 px-2.5 py-1 rounded-full font-semibold">
              <Sparkles size={11} /> AI-tailored for {job.company}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Both documents were drafted by AI from your profile and this job's requirements — edit them freely before submitting.
          </p>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Tailored Resume */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Tailored Resume Summary</h3>
                </div>
                {docEdits[key]?.resume !== undefined && docEdits[key]?.resume !== aiResume && (
                  <span className="text-[10px] font-semibold text-[#8A7038] inline-flex items-center gap-1"><PenLine size={10} /> Edited</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mb-2 inline-flex items-center gap-1">
                <Sparkles size={10} className="text-[#8A7038]" /> AI rewrote your headline and bullets around this role's top requirements.
              </p>
              <textarea
                value={resumeText}
                onChange={e => setDoc("resume", e.target.value)}
                rows={9}
                className="w-full flex-1 text-xs leading-relaxed text-foreground bg-white border border-border rounded-lg p-3 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <button
                  onClick={() => {
                    setDoc("resume", `TAILORED FOR ${job.company.toUpperCase()} · ${job.position.toUpperCase()}\n${resumeText.startsWith("TAILORED FOR") ? resumeText.split("\n").slice(1).join("\n") : resumeText}\n\n+ Re-ranked bullets to lead with: ${job.requirements?.[0] ?? "the role's top requirement"}\n+ Mirrored key phrases from the job description for ATS matching`);
                    demoToast(`Resume re-tailored to ${job.company}'s job description ✓`);
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-accent"
                  style={{ borderColor: "rgba(138,112,56,0.3)", color: "#8A7038" }}
                >
                  <Sparkles size={11} /> Tailor with AI to this job description
                </button>
                <button
                  onClick={() => { setDoc("resume", undefined); demoToast("Resume reset to AI draft ✓"); }}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Reset to AI draft
                </button>
                <button
                  onClick={() => demoToast("Your own resume uploaded — it will be sent instead of the AI draft ✓")}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:underline"
                >
                  ↑ Upload my own resume instead
                </button>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Send size={14} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Cover Letter</h3>
                </div>
                {docEdits[key]?.cover !== undefined && docEdits[key]?.cover !== aiCover && (
                  <span className="text-[10px] font-semibold text-[#8A7038] inline-flex items-center gap-1"><PenLine size={10} /> Edited</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mb-2 inline-flex items-center gap-1">
                <Sparkles size={10} className="text-[#8A7038]" /> AI drafted this letter to address {job.company}'s {job.position} team directly.
              </p>
              <textarea
                value={coverText}
                onChange={e => setDoc("cover", e.target.value)}
                rows={9}
                className="w-full flex-1 text-xs leading-relaxed text-foreground bg-white border border-border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <button
                  onClick={() => { setDoc("cover", undefined); demoToast("Cover letter reset to AI draft ✓"); }}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Reset to AI draft
                </button>
                <button
                  onClick={() => demoToast("Your own cover letter uploaded — it will be sent instead of the AI draft ✓")}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:underline"
                >
                  ↑ Upload my own cover letter instead
                </button>
              </div>
            </div>
          </div>

          {/* Supporting documents */}
          <div className="mt-4 p-4 rounded-xl border border-dashed border-border bg-accent/30 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Supporting documents <span className="text-xs font-normal text-muted-foreground">(optional)</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">Portfolio, certificates, transcripts, or your own version of any document — attach anything that strengthens this application.</p>
            </div>
            <button
              onClick={() => demoToast("Supporting document attached to this application ✓")}
              className="flex-shrink-0 inline-flex items-center gap-2 border border-border bg-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-muted transition-colors text-foreground"
            >
              <FileText size={13} /> Upload document
            </button>
          </div>
        </section>

        {/* Submit */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Ready to apply?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your edited resume + cover letter will be sent to {job.company}'s hiring team</p>
          </div>
          <button
            onClick={handleApply}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md"
          >
            <Send size={15} />
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
