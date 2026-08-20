/* ────────────────────────────────────────────────────────────────
   The shape of everything the scan learns about a person.

   Before this existed, Onboarding handed the rest of the app six
   numbers and four strings and dropped the rest on the floor — the
   uploaded resume, the connected evidence, the raw calibration
   answers. Pages that needed any of it had no choice but to hardcode
   a persona. This is the contract that replaced that.
   ──────────────────────────────────────────────────────────────── */

/** How much we can actually stand behind a piece of evidence. */
export type TrustLevel = "verified" | "corroborated" | "self-declared";

export const TRUST_LABEL: Record<TrustLevel, string> = {
  verified:        "Verified",
  corroborated:    "Corroborated",
  "self-declared": "Self-declared",
};

export const TRUST_NOTE: Record<TrustLevel, string> = {
  verified:        "Confirmed against the issuer's own verification record.",
  corroborated:    "Matches a source you connected, but not issuer-confirmed.",
  "self-declared": "Provided by you. Not independently checked.",
};

export type EvidenceKind =
  | "resume"
  | "certificate"
  | "project"
  | "portfolio"
  | "link"
  | "reference"
  | "record"
  | "other";

export interface EvidenceItem {
  id: string;
  kind: EvidenceKind;
  /** What the user sees — e.g. the real uploaded filename. */
  label: string;
  /** Where it came from — a filename, a URL, an issuer. */
  source: string;
  trust: TrustLevel;
  /** Skills this piece of evidence supports, once extracted. */
  skills: string[];
  addedAt: string;
}

/** What we managed to pull out of an uploaded resume. */
export interface ParsedResume {
  fileName: string;
  fileSize: number;
  /** How the fields below were produced — shown in the UI, never hidden. */
  method: "ai" | "rule-based";
  name?: string;
  email?: string;
  phone?: string;
  yearsExperience?: number;
  currentTitle?: string;
  employers: string[];
  skills: string[];
  education: string[];
  certifications: string[];
  /** Raw extracted text, kept so a later AI pass can re-read it. */
  rawText: string;
}

export interface CareerProfile {
  userType: string;
  currentRole: string;
  targetRole: string;
  salaryRange: string;
  experience: string;
  goals: string[];
  dnaScores: Record<string, number>;
  /* Decided once by calculateCareerDna at scan time. Pages read this;
     none of them re-derive it. */
  archetypeName: string;
  /** Kept so "why is my score this?" can point at the actual answers. */
  calibrationAnswers: Record<string, string>;
  /* What they believe is holding them back, in their own judgement.
     Without this a blind spot cannot be computed: the whole definition
     is a gap between what is measured and what the person believes.
     One of the risk ids, or "none", or "" if never asked. */
  selfAssessment: string;
  resume: ParsedResume | null;
  evidence: EvidenceItem[];
  scannedAt: string;
}

export const EMPTY_PROFILE: CareerProfile = {
  userType: "",
  currentRole: "",
  targetRole: "",
  salaryRange: "",
  experience: "",
  goals: [],
  dnaScores: {},
  archetypeName: "",
  calibrationAnswers: {},
  selfAssessment: "",
  resume: null,
  evidence: [],
  scannedAt: "",
};
