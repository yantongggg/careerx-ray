/* ────────────────────────────────────────────────────────────────
   Real resume intake.

   The old drop zone was a plain <div> whose onDrop never looked at
   e.dataTransfer.files — clicking it printed "resume_jordan_kim.pdf ·
   42 KB" regardless of what you did. Nothing was read, nothing was
   parsed, nothing reached the rest of the app.

   This reads the actual file. Text extraction runs in the browser, so
   the PDF itself never leaves the device. Field extraction then tries
   the AI endpoint and falls back to the rule engine below if the
   endpoint is unavailable — which keeps a live demo working on a bad
   conference network. Whichever path ran is recorded on `method` and
   shown in the UI; we never present rule output as AI output.
   ──────────────────────────────────────────────────────────────── */

import type { ParsedResume } from "./profileTypes";

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

/**
 * PDF only — one format supported properly beats five supported badly.
 * Returns the reason the file was rejected, or null when it is fine.
 */
export function rejectReasonFor(file: File): string | null {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "That file isn't a PDF. Export your resume as PDF and try again.";
  if (file.size > MAX_RESUME_BYTES) return `That file is ${formatBytes(file.size)}. The limit is 10 MB.`;
  if (file.size === 0) return "That file is empty.";
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Pull the text layer out of the PDF, in the browser. */
export async function extractPdfText(file: File): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const buffer = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: true });
  return (Array.isArray(text) ? text.join("\n") : text) ?? "";
}

/* ── Rule engine ─────────────────────────────────────────────── */

/* Deliberately not tech-only. A property agent and a restaurant
   supervisor have skills worth extracting too. */
const SKILL_VOCAB = [
  // data & engineering
  "SQL", "Python", "R", "Excel", "Power BI", "Tableau", "Looker", "dbt", "Airflow",
  "Spark", "Snowflake", "BigQuery", "Pandas", "TensorFlow", "PyTorch", "Scikit-learn",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Git", "JavaScript", "TypeScript",
  "React", "Node.js", "Java", "C++", "Go", "PHP", "Laravel", "Django",
  // design
  "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign", "After Effects",
  "Premiere Pro", "Canva", "Blender", "AutoCAD", "SketchUp", "Wireframing", "Prototyping",
  "User Research", "Design Systems",
  // marketing
  "SEO", "SEM", "Google Ads", "Google Analytics", "Meta Ads", "HubSpot", "Mailchimp",
  "Copywriting", "Content Strategy", "Social Media", "Email Marketing", "CRM",
  // business, property, service
  "Negotiation", "Sales", "Business Development", "Account Management", "Salesforce",
  "Property Valuation", "Tenancy Agreements", "Lead Generation", "Cold Calling",
  "Customer Service", "Inventory Management", "POS Systems", "Food Safety", "Barista",
  "Scheduling", "Cash Handling", "Merchandising", "Team Supervision",
  // cross-cutting
  "Project Management", "Stakeholder Management", "Agile", "Scrum", "Jira",
  "Presentation", "Data Analysis", "Reporting", "Budgeting", "Training",
];

const DEGREE_PATTERNS =
  /\b(bachelor|master|diploma|degree|bsc|b\.sc|ba\b|beng|mba|msc|m\.sc|phd|spm|stpm|foundation|certificate in|tvet|sijil)\b[^\n]{0,80}/gi;

const CERT_PATTERNS =
  /\b(aws certified|google (cloud |data |ads )?certified|microsoft certified|azure|comptia|cisco|ccna|pmp|prince2|scrum master|cfa|acca|cima|hubspot|meta blueprint|coursera|udacity|professional certificate)\b[^\n]{0,70}/gi;

function cleanList(matches: RegExpMatchArray | null, limit: number): string[] {
  if (!matches) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of matches) {
    const value = raw.replace(/\s+/g, " ").trim().replace(/[·•|,;]+$/, "");
    const key = value.toLowerCase();
    if (value.length < 4 || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= limit) break;
  }
  return out;
}

export function parseResumeRuleBased(
  text: string,
  fileName: string,
  fileSize: number,
): ParsedResume {
  const flat = text.replace(/\r/g, "");
  const lines = flat.split("\n").map(l => l.trim()).filter(Boolean);

  const email = flat.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/)?.[0];
  const phone = flat.match(/(\+?6?01[0-9][-\s]?\d{3,4}[-\s]?\d{4})|(\+\d{1,3}[\s-]?\d[\d\s-]{6,})/)?.[0]?.trim();

  /* The name is almost always the first line that looks like a name and
     isn't a heading, an email, or a phone number. */
  const name = lines
    .slice(0, 8)
    .find(l =>
      /^[A-Z][A-Za-z'.-]+(\s+[A-Z][A-Za-z'.-]+){1,3}$/.test(l) &&
      !/resume|curriculum|vitae|profile|contact/i.test(l),
    );

  /* Years of experience: prefer an explicit claim, else infer from the
     earliest 4-digit year that looks like a work start date. */
  const explicitYears = flat.match(/(\d{1,2})\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i);
  let yearsExperience: number | undefined = explicitYears
    ? parseInt(explicitYears[1], 10)
    : undefined;
  if (yearsExperience === undefined) {
    const years = [...flat.matchAll(/\b(19[89]\d|20[0-4]\d)\b/g)]
      .map(m => parseInt(m[1], 10))
      .filter(y => y >= 1990 && y <= new Date().getFullYear());
    if (years.length) {
      const earliest = Math.min(...years);
      const span = new Date().getFullYear() - earliest;
      if (span > 0 && span < 45) yearsExperience = span;
    }
  }

  const skills = SKILL_VOCAB.filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^A-Za-z])${escaped}([^A-Za-z]|$)`, "i").test(flat);
  });

  /* Employers: lines containing a company suffix, or an "at X" construction. */
  const employers = cleanList(
    flat.match(
      /\b[A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*){0,4}\s+(?:Sdn\.?\s*Bhd\.?|Bhd\.?|Berhad|Pte\.?\s*Ltd\.?|Ltd\.?|Inc\.?|LLC|Group|Holdings|Technologies|Solutions|Bank|Digital)\b/g,
    ),
    6,
  );

  const currentTitle = lines
    .slice(0, 12)
    .find(l =>
      /\b(analyst|engineer|designer|manager|executive|specialist|developer|consultant|officer|assistant|coordinator|supervisor|agent|associate|intern)\b/i.test(l) &&
      l.length < 70 &&
      !/@|\d{4}/.test(l),
    );

  return {
    fileName,
    fileSize,
    method: "rule-based",
    name,
    email,
    phone,
    yearsExperience,
    currentTitle,
    employers,
    skills,
    education: cleanList(flat.match(DEGREE_PATTERNS), 4),
    certifications: cleanList(flat.match(CERT_PATTERNS), 5),
    rawText: flat.slice(0, 20000),
  };
}

/* ── AI path, with the rule engine as the floor ──────────────── */

/**
 * Which path produced the fields, and why — so the UI can explain
 * itself in plain language instead of leaking an HTTP status at
 * someone who just uploaded their CV.
 */
export type AiStatus =
  | "ok"              // the model ran
  | "not-configured"  // no API key on this deployment
  | "unavailable"     // offline, rate limited, or the model failed
  | "no-text";        // the PDF has no text layer, probably a scan

export interface AnalyzeResult {
  resume: ParsedResume;
  aiStatus: AiStatus;
}

/**
 * Extract text locally, then try to enrich it via the serverless
 * endpoint. Any failure — no API key configured, offline, rate limit,
 * malformed response — falls back to the rule engine rather than
 * surfacing an error to someone mid-demo.
 */
export async function analyzeResume(file: File): Promise<AnalyzeResult> {
  const text = await extractPdfText(file);
  const baseline = parseResumeRuleBased(text, file.name, file.size);

  if (!text.trim()) {
    return { resume: baseline, aiStatus: "no-text" };
  }

  try {
    const res = await fetch("/api/analyze-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 24000) }),
    });
    // 503 is the endpoint telling us it has no API key — a configuration
    // state, not a failure, and worth saying differently.
    if (res.status === 503) return { resume: baseline, aiStatus: "not-configured" };
    if (!res.ok) return { resume: baseline, aiStatus: "unavailable" };
    const data = await res.json();
    if (!data || typeof data !== "object") return { resume: baseline, aiStatus: "unavailable" };

    return {
      aiStatus: "ok",
      resume: {
        ...baseline,
        method: "ai",
        name: data.name || baseline.name,
        email: data.email || baseline.email,
        phone: data.phone || baseline.phone,
        yearsExperience:
          typeof data.yearsExperience === "number" ? data.yearsExperience : baseline.yearsExperience,
        currentTitle: data.currentTitle || baseline.currentTitle,
        employers: Array.isArray(data.employers) && data.employers.length ? data.employers : baseline.employers,
        skills: Array.isArray(data.skills) && data.skills.length ? data.skills : baseline.skills,
        education: Array.isArray(data.education) && data.education.length ? data.education : baseline.education,
        certifications: Array.isArray(data.certifications) && data.certifications.length
          ? data.certifications
          : baseline.certifications,
      },
    };
  } catch {
    // Offline, blocked, or no endpoint at all (local dev serves the SPA
    // shell here). The rule engine already has a full result.
    return { resume: baseline, aiStatus: "unavailable" };
  }
}
