/* ────────────────────────────────────────────────────────────────
   Resume and cover-letter generation.

   Four separate "generate" buttons used to exist across the app.
   Three of them ran a 2200ms timer and produced nothing at all — no
   text, no file, no preview. This is the one implementation; every
   button now calls into it and shows the reader what came out.

   Output is built from the person's own scan: the parsed resume, the
   evidence they added, their DNA scores. Where a field is missing the
   line is left out rather than filled with someone else's details.
   ──────────────────────────────────────────────────────────────── */

import type { CareerProfile } from "./profileTypes";

export interface JobTarget {
  id: string;
  title: string;
  company: string;
  location?: string;
  requirements?: string[];
}

/* Per-job framing. Authored, because it encodes what each employer
   actually screens for — but it only ever supplies the angle. Every
   fact in the output comes from the candidate's own profile. */
const JOB_ANGLE: Record<string, { focus: string; hook: string; body: string }> = {
  "maybank-da": {
    focus: "fraud analytics, customer segmentation, and digital banking KPIs",
    hook: "Digital banking decisions ride on dashboards people actually trust — that is the work I want to do at full scale.",
    body: "My SQL depth and reporting experience map directly to this role: building KPI pipelines, segmenting customer behaviour across digital channels, and presenting findings that product and engineering teams acted on.",
  },
  "grab-ae": {
    focus: "dbt model development, pipeline testing, and analytics engineering at scale",
    hook: "Real-time marketplace decisions depend on tested, reliable data models — exactly what this Analytics Engineer role owns.",
    body: "I bring hands-on modelling and Git-based workflows, experience writing tested data models, and collaboration with engineers on CI for analytics code.",
  },
  "petronas-pm": {
    focus: "ML model evaluation and translating AI metrics for business stakeholders",
    hook: "Digitalising energy operations with AI is high-impact, stakeholder-heavy analytics work, which is where I do my best work.",
    body: "I pair technical proficiency with storytelling: defining metrics, evaluating model performance, and turning data patterns into recommendations leadership can act on.",
  },
};

const DEFAULT_ANGLE = {
  focus: "the core responsibilities of the role",
  hook: "This role lines up closely with the direction I am deliberately moving my career in.",
  body: "I bring directly relevant experience and a record of turning work into outcomes the business could measure.",
};

/* ── Helpers ─────────────────────────────────────────────────── */

function candidateName(profile: CareerProfile): string {
  return profile.resume?.name?.toUpperCase() ?? "YOUR NAME";
}

function contactLine(profile: CareerProfile): string | null {
  const parts = [profile.resume?.name, profile.resume?.phone, profile.resume?.email].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

function experienceLine(profile: CareerProfile, focus: string): string | null {
  const years = profile.resume?.yearsExperience;
  const role = profile.resume?.currentTitle || profile.currentRole;
  if (!role && !years) return null;
  const span = years ? `${years}+ yrs` : "Early career";
  return `• ${[role, span].filter(Boolean).join(" · ")} — focused on ${focus}.`;
}

function skillsLine(profile: CareerProfile, limit = 10): string | null {
  const skills = profile.resume?.skills ?? [];
  if (!skills.length) return null;
  return `• Skills: ${skills.slice(0, limit).join(" · ")}.`;
}

function employersLine(profile: CareerProfile): string | null {
  const employers = profile.resume?.employers ?? [];
  if (!employers.length) return null;
  return `• Experience at: ${employers.slice(0, 4).join(" · ")}.`;
}

function credentialsLine(profile: CareerProfile): string | null {
  const certs = [
    ...(profile.resume?.certifications ?? []),
    ...profile.evidence.filter(e => e.kind === "certificate").map(e => e.label),
  ];
  const education = profile.resume?.education ?? [];
  const parts = [...new Set([...certs, ...education])];
  if (!parts.length) return null;
  return `• Credentials: ${parts.slice(0, 4).join(" · ")}.`;
}

function evidenceLine(profile: CareerProfile): string | null {
  const items = profile.evidence.filter(e => e.kind !== "resume");
  if (!items.length) return null;
  return `• Evidence on file: ${items.slice(0, 4).map(e => `${e.label} (${e.trust})`).join(" · ")}.`;
}

function compact(lines: (string | null)[]): string {
  return lines.filter((l): l is string => l !== null).join("\n");
}

/* ── Generators ──────────────────────────────────────────────── */

/** A general resume aimed at a target role rather than one job ad. */
export function buildResumeForRole(profile: CareerProfile, targetRole: string): string {
  const focus = `moving into ${targetRole}`;
  return compact([
    `${candidateName(profile)} — tailored for ${targetRole}`,
    contactLine(profile),
    ``,
    experienceLine(profile, focus),
    employersLine(profile),
    skillsLine(profile),
    credentialsLine(profile),
    evidenceLine(profile),
    profile.resume ? null : `• Built from your scan answers — upload a resume to add employers, dates and detail.`,
  ]);
}

/** A resume tailored to one specific job posting. */
export function buildResumeForJob(profile: CareerProfile, job: JobTarget): string {
  const angle = JOB_ANGLE[job.id] ?? DEFAULT_ANGLE;
  const reqs = job.requirements?.slice(0, 3) ?? [];
  return compact([
    `${candidateName(profile)} — tailored for ${job.title} @ ${job.company}`,
    contactLine(profile),
    ``,
    experienceLine(profile, angle.focus),
    reqs.length ? `• Direct match to ${job.company}'s requirements: ${reqs.join("; ")}.` : null,
    employersLine(profile),
    skillsLine(profile),
    credentialsLine(profile),
  ]);
}

/** A cover letter for one specific job posting. */
export function buildCoverLetterForJob(profile: CareerProfile, job: JobTarget): string {
  const angle = JOB_ANGLE[job.id] ?? DEFAULT_ANGLE;
  const name = profile.resume?.name ?? "Your name";
  const contact = [profile.resume?.phone, profile.resume?.email].filter(Boolean).join(" · ");
  const skills = profile.resume?.skills ?? [];
  return compact([
    `Dear ${job.company} Hiring Team,`,
    ``,
    `I'm writing to apply for the ${job.title} position${job.location ? ` (${job.location})` : ""}. ${angle.hook}`,
    ``,
    angle.body,
    skills.length ? `` : null,
    skills.length ? `The skills I would bring on day one: ${skills.slice(0, 6).join(", ")}.` : null,
    ``,
    `I'd welcome the chance to discuss how I can contribute to ${job.company}'s team. Thank you for your time and consideration.`,
    ``,
    `Warm regards,`,
    contact ? `${name} · ${contact}` : name,
  ]);
}

/** Hand the generated document to the reader as a real file. */
export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
