/* ────────────────────────────────────────────────────────────────
   Career risk engine — the single source of every risk number.

   Previously the same risks were hardcoded three times (Dashboard,
   CareerCommandCenter, BlindSpots) and disagreed with each other:
   the dashboard headline said 4 open risks while its own footer said
   5, AI exposure was 62%/24-months on one page and 42%/5-years on
   another, and the salary gap was RM 1.6k here and RM 1.2k there.
   Every one of those numbers now comes from this file.

   Two deliberately separate views:
     deriveRisks()      — what threatens the role you are in TODAY
     deriveTargetGaps() — what stands between you and the role you WANT

   Everything here is a pure function of the profile. Same input, same
   output, every time — which is what makes "why this score?"
   answerable at all.
   ──────────────────────────────────────────────────────────────── */

import type { CareerProfile } from "./profileTypes";
import { detectRoleFamily, FAMILY_LABEL, type RoleFamily } from "./roleFamily";
import { explainRoleGap } from "../state/intelligence";

export type Severity = "critical" | "high" | "medium" | "low";

export interface Risk {
  id: string;
  category: string;
  headline: string;
  severity: Severity;
  /** The single number this risk is about, pre-formatted. */
  metric: string;
  horizon: string;
  /** Which inputs produced it — shown verbatim in "why this score?". */
  evidence: string;
  /** The comparison shown on the dashboard: observed value, bar, and distance to it. */
  comparison: {
    current: string;
    benchmark: string;
    shortfall: string;
  };
  /** A short, auditable derivation. No hidden model reasoning. */
  calculation: string[];
  fix: string;
  timeToFix: string;
}

export interface TargetGap {
  id: string;
  skill: string;
  /** "Missing Experience" / "Missing Skill" / "Missing Technical Skill" */
  kind: string;
  /** The short noun the eye lands on: "Team Leadership". */
  title: string;
  /** The conversational line, now a subtitle rather than the headline. */
  headline: string;
  /** Why this one matters, in terms of this move specifically. */
  why: string;
  severity: Severity;
  /** What happens if it stays open. Different for every gap — a shared
      sentence here is how four cards came to read identically. */
  ifIgnored: string;
  action: string;
  timeToClose: string;
  /** What was actually checked to reach this, shown verbatim. */
  basis: string;
}

/** What the caller can tell us about the market for this target. */
export interface GapContext {
  /** Matched postings that screen on a given skill, by title. */
  askedBy?: (skill: string) => string[];
  /** How many postings were matched in total. */
  postingCount?: number;
}

export interface Scorecard {
  careerHealth: number;
  aiExposure: { label: string; percent: number };
  vsMarket: { label: string; percent: number; conclusive: boolean };
  promotionReady: number;
  /** Whether the record can clear a screen, and what is short if not. */
  proof: { label: string; unit: string; gateCount: number; proofCount: number; ok: boolean };
  /** Per-metric plain-English derivation, for the "Why this?" panels. */
  explain: Record<"health" | "ai" | "salary" | "promotion" | "proof", string[]>;
}

export type RiskCheckStatus = "open" | "clear" | "not-measured" | "not-applicable";

export interface RiskCategoryCheck {
  id: "automation" | "salary" | "readiness" | "leadership";
  label: string;
  status: RiskCheckStatus;
  summary: string;
}

const RISK_POLICY = {
  automationLowRiskCeiling: 35,
  automationHighRiskFloor: 55,
  leadershipReady: 65,
  roleGateMinimum: 1,
  proofMinimum: 2,
  salaryRiskFloorPct: -5,
} as const;

/* ── Authored reference data ─────────────────────────────────────
   These are the only magic numbers in this file, and they are all in
   one place so they can be swapped for a live corpus later. Sources
   are documented in docs/data-sources.md. */

/** Baseline share of routine task time exposed to automation, by family. */
const AUTOMATION_BASE: Record<RoleFamily, number> = {
  data: 0.58, service: 0.54, marketing: 0.46, business: 0.42,
  generic: 0.40, design: 0.34, software: 0.30, product: 0.24,
};

/** Median monthly pay in RM by family and seniority band. */
const MARKET_MEDIAN: Record<RoleFamily, [junior: number, mid: number, senior: number]> = {
  data:      [4500, 8200, 13000],
  software:  [5000, 9500, 15000],
  design:    [3800, 6800, 11000],
  marketing: [3500, 6200, 10500],
  product:   [5200, 9800, 15500],
  business:  [3200, 6500, 12000],
  service:   [2200, 3400, 5200],
  generic:   [3500, 6500, 11000],
};

/** The credential that most often blocks a move into each family. */
const KEY_CREDENTIAL: Record<RoleFamily, string> = {
  data:      "a cloud or data-platform certification",
  software:  "a cloud or security certification",
  design:    "a published end-to-end case study",
  marketing: "a platform certification (Google Ads, Meta, HubSpot)",
  product:   "a shipped-product case study",
  business:  "a professional licence or registration",
  service:   "a recognised trade or safety certification",
  generic:   "a role-relevant certification",
};

/** Evidence kinds that satisfy the main hiring gate for each role family. */
const ROLE_GATE_KINDS: Record<RoleFamily, string[]> = {
  data: ["certificate"],
  software: ["certificate"],
  design: ["portfolio", "project"],
  marketing: ["certificate"],
  product: ["portfolio", "project"],
  business: ["certificate"],
  service: ["certificate"],
  generic: ["certificate"],
};

const ROLE_GATE_TERMS: Record<RoleFamily, string[]> = {
  data: ["aws", "azure", "gcp", "cloud", "data", "snowflake", "databricks", "dbt", "cka"],
  software: ["aws", "azure", "gcp", "cloud", "security", "cyber", "kubernetes", "cka", "cissp", "comptia"],
  design: [],
  marketing: ["google ads", "meta", "hubspot", "marketing", "analytics"],
  product: [],
  business: ["licence", "license", "registration", "professional", "chartered"],
  service: ["food", "safety", "first aid", "hospitality", "barista", "training"],
  generic: [],
};

/* The skills a role in each family screens on. Authored, and the only
   place they are written down — the gap list and the corpus both read
   from here so they cannot disagree about what a role asks for. */
const TARGET_SKILLS: Record<RoleFamily, string[]> = {
  software:  ["System design", "Automated testing", "CI/CD", "Cloud deployment", "Code review"],
  /* "MLOps" and "Enterprise cloud" rather than "Machine learning" and
     "Cloud warehouse": this persona has shipped a model and has ML on
     the résumé, so a gap named "machine learning" would be contradicted
     by their own timeline. What is missing is the part that keeps a
     model alive after launch, and any cloud platform evidence at all. */
  data:      ["Data modelling", "Pipeline orchestration", "MLOps", "Enterprise cloud", "Experiment design"],
  design:    ["Design systems", "User research", "Prototyping", "Accessibility", "Case studies"],
  marketing: ["Paid acquisition", "Analytics", "Copywriting", "Campaign planning", "Marketing automation"],
  product:   ["Discovery", "Roadmapping", "Metrics", "Stakeholder management", "Prioritisation"],
  business:  ["Pipeline management", "Negotiation", "CRM discipline", "Forecasting", "Account planning"],
  service:   ["Team scheduling", "Service standards", "Stock control", "Cost control", "Training others"],
  generic:   ["Planning", "Communication", "Ownership", "Problem solving", "Working with data"],
};

interface SkillCoverage {
  required: string[];
  covered: string[];
  missing: string[];
}

/** What the target asks for, against what this person can show. */
function getSkillCoverage(profile: CareerProfile): SkillCoverage {
  const family = detectRoleFamily(profile.targetRole, profile.currentRole);
  const required = profile.targetRole ? TARGET_SKILLS[family] : [];
  const held = [
    ...(profile.resume?.skills ?? []),
    ...profile.evidence.flatMap(e => e.skills),
    ...profile.evidence.map(e => e.label),
  ].map(x => x.toLowerCase());

  const covered = required.filter(req => {
    const words = req.toLowerCase().split(/\s+/);
    return held.some(h => words.some(w => w.length > 3 && h.includes(w)) || req.toLowerCase().includes(h));
  });
  return { required, covered, missing: required.filter(r => !covered.includes(r)) };
}

/* ── Benchmark accessors ─────────────────────────────────────
   The corpus layer builds its salary trajectories and AI-risk figures
   from these same tables, so a number shown in Decision Lab cannot
   disagree with the same number on the dashboard. */

export type SeniorityBand = 0 | 1 | 2;

/** Median monthly RM for a family at a seniority band. */
export function marketMedian(family: RoleFamily, band: SeniorityBand): number {
  return MARKET_MEDIAN[family][band];
}

/** Baseline share of a family's tasks exposed to automation, 0–1. */
export function automationBase(family: RoleFamily): number {
  return AUTOMATION_BASE[family];
}

/** Which of the three seniority bands this profile sits in. */
export function seniorityBand(profile: CareerProfile): SeniorityBand {
  return seniorityIndex(profile);
}

/** The credential that most often gates entry into a family. */
export function keyCredential(family: RoleFamily): string {
  return KEY_CREDENTIAL[family];
}

/* ── Helpers ─────────────────────────────────────────────────── */

const avg = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0);

/** Pull a monthly RM figure out of whatever the user picked or typed. */
export function parseMonthlyRM(input: string | undefined): number | null {
  if (!input) return null;
  const cleaned = input.toLowerCase().replace(/,/g, "");
  const nums = [...cleaned.matchAll(/(\d+(?:\.\d+)?)\s*k?/g)].map(m => {
    const n = parseFloat(m[1]);
    // "8k" and "8" in a salary context both mean 8,000; "8000" means itself.
    return m[0].includes("k") || n < 100 ? n * 1000 : n;
  });
  if (!nums.length) return null;
  return Math.round(avg(nums));
}

/** junior | mid | senior, from years of experience. */
function seniorityIndex(profile: CareerProfile): 0 | 1 | 2 {
  const statedYears = [...profile.experience.matchAll(/\d+(?:\.\d+)?/g)].map(m => parseFloat(m[0]));
  const years = profile.resume?.yearsExperience ?? avg(statedYears);
  if (!years || years < 2) return 0;
  if (years < 6) return 1;
  return 2;
}

function dim(profile: CareerProfile, name: string): number {
  return profile.dnaScores[name] ?? 55;
}

function hasEvidenceOf(profile: CareerProfile, kinds: string[]): boolean {
  return profile.evidence.some(e => kinds.includes(e.kind));
}

function sev(score: number): Severity {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export interface SalaryBenchmark {
  current: number | null;
  median: number;
  gap: number | null;
  percent: number | null;
  family: RoleFamily;
  basis: "midpoint" | "upper-bound" | "lower-bound" | "exact";
  conclusive: boolean;
  experienceBasis: "resume" | "range-midpoint" | "stated";
}

interface AutomationBenchmark {
  family: RoleFamily;
  baselinePct: number;
  dimensionAverage: number;
  dimensionAdjustmentPct: number;
  evidenceAdjustmentPct: number;
  exposurePct: number;
}

function getAutomationBenchmark(profile: CareerProfile): AutomationBenchmark {
  const family = detectRoleFamily(profile.currentRole, profile.targetRole);
  const dimensionAverage = avg([dim(profile, "Innovation"), dim(profile, "Strategic")]);
  const dimensionAdjustment = ((dimensionAverage - 55) / 100) * 0.35;
  const evidenceAdjustment = hasEvidenceOf(profile, ["project", "portfolio"]) ? 0.04 : 0;
  const exposure = Math.max(
    0.12,
    Math.min(0.85, AUTOMATION_BASE[family] - dimensionAdjustment - evidenceAdjustment),
  );
  return {
    family,
    baselinePct: Math.round(AUTOMATION_BASE[family] * 100),
    dimensionAverage,
    dimensionAdjustmentPct: Math.round(dimensionAdjustment * 100),
    evidenceAdjustmentPct: Math.round(evidenceAdjustment * 100),
    exposurePct: Math.round(exposure * 100),
  };
}

/** The exact salary comparison used by both the risk and the dashboard. */
export function getSalaryBenchmark(profile: CareerProfile): SalaryBenchmark {
  const family = detectRoleFamily(profile.currentRole, profile.targetRole);
  const median = MARKET_MEDIAN[family][seniorityIndex(profile)];
  const current = parseMonthlyRM(profile.salaryRange);
  const salaryInput = profile.salaryRange.toLowerCase();
  const numberCount = [...salaryInput.matchAll(/\d+(?:\.\d+)?/g)].length;
  const basis: SalaryBenchmark["basis"] = /<|below|under|less than|up to|maximum|max\b/.test(salaryInput)
    ? "upper-bound"
    : /\+|above|over|more than|at least|minimum|min\b/.test(salaryInput)
      ? "lower-bound"
      : numberCount > 1
        ? "midpoint"
        : "exact";
  const gap = current === null ? null : median - current;
  const boundaryPercent = current === null ? null : Math.round(((current - median) / median) * 100);
  const conclusive = current !== null && (
    basis === "midpoint" || basis === "exact" ||
    (basis === "upper-bound" && boundaryPercent! <= RISK_POLICY.salaryRiskFloorPct) ||
    (basis === "lower-bound" && boundaryPercent! > RISK_POLICY.salaryRiskFloorPct)
  );
  const experienceNumbers = [...profile.experience.matchAll(/\d+(?:\.\d+)?/g)];
  return {
    current,
    median,
    gap,
    percent: current === null ? null : Math.round(((current - median) / median) * 100),
    family,
    basis,
    conclusive,
    experienceBasis: profile.resume?.yearsExperience !== undefined
      ? "resume"
      : experienceNumbers.length > 1
        ? "range-midpoint"
        : "stated",
  };
}

interface ReadinessBenchmark {
  family: RoleFamily;
  gateCount: number;
  proofCount: number;
  missingGate: boolean;
  missingProof: boolean;
  additionsNeeded: number;
}

function getReadinessBenchmark(profile: CareerProfile): ReadinessBenchmark {
  // Readiness is about the role being pursued, unlike automation and salary,
  // which describe the role held today.
  const family = detectRoleFamily(profile.targetRole || profile.currentRole);
  const gateKinds = ROLE_GATE_KINDS[family];
  const terms = ROLE_GATE_TERMS[family];
  const textMatchesFamily = (text: string) => !terms.length || terms.some(term => text.toLowerCase().includes(term));
  const uploadedGateCount = profile.evidence.filter(e => {
    if (!gateKinds.includes(e.kind)) return false;
    return textMatchesFamily([e.label, e.source, ...e.skills].join(" "));
  }).length;
  const resumeCredentialCount = gateKinds.includes("certificate")
    /* The optional chain guarded the résumé but not the array on it, so
       an extraction that returned no certifications key at all took the
       whole dashboard down rather than counting zero. */
    ? (profile.resume?.certifications?.filter(textMatchesFamily).length ?? 0)
    : 0;
  const gateCount = uploadedGateCount + resumeCredentialCount;
  const proofCount = profile.evidence.length;
  const missingGate = gateCount < RISK_POLICY.roleGateMinimum;
  const missingProof = proofCount < RISK_POLICY.proofMinimum;
  // A new gate item is also a new proof source, so these requirements overlap.
  const additionsNeeded = Math.max(
    missingGate ? RISK_POLICY.roleGateMinimum - gateCount : 0,
    missingProof ? RISK_POLICY.proofMinimum - proofCount : 0,
  );
  return { family, gateCount, proofCount, missingGate, missingProof, additionsNeeded };
}

/* ── Risks: the role you are in today ────────────────────────── */

export function deriveRisks(profile: CareerProfile): Risk[] {
  const family = detectRoleFamily(profile.currentRole, profile.targetRole);
  const risks: Risk[] = [];

  /* 1 · Automation exposure.
     Base rate for the family, reduced by the two dimensions that most
     reliably survive automation (Innovation, Strategic) and by having
     shipped project evidence. */
  const automation = getAutomationBenchmark(profile);
  const exposurePct = automation.exposurePct;
  if (exposurePct >= RISK_POLICY.automationLowRiskCeiling) risks.push({
    id: "automation",
    category: "AI Automation Exposure",
    headline: `${exposurePct}% of your routine task time is exposed to automation.`,
    severity: sev(exposurePct),
    metric: `${exposurePct}%`,
    horizon: exposurePct >= 55 ? "within 24 months" : "within 3–5 years",
    evidence: `Baseline for ${family} roles (${automation.baselinePct}%), adjusted for your Innovation ${Math.round(dim(profile, "Innovation"))} and Strategic ${Math.round(dim(profile, "Strategic"))} scores${automation.evidenceAdjustmentPct ? " and your shipped project evidence" : ""}.`,
    comparison: {
      current: `${exposurePct}% exposed`,
      benchmark: `Under ${RISK_POLICY.automationLowRiskCeiling}% recommended`,
      shortfall: `${exposurePct - (RISK_POLICY.automationLowRiskCeiling - 1)} points above recommended range`,
    },
    calculation: [
      `${automation.baselinePct}% baseline for ${family} roles`,
      `Innovation ${Math.round(dim(profile, "Innovation"))} and Strategic ${Math.round(dim(profile, "Strategic"))} average to ${Math.round(automation.dimensionAverage)}; adjustment: ${automation.dimensionAdjustmentPct >= 0 ? "−" : "+"}${Math.abs(automation.dimensionAdjustmentPct)} points`,
      automation.evidenceAdjustmentPct ? `Reduced ${automation.evidenceAdjustmentPct} points for shipped project or portfolio evidence` : "No shipped project shield applied",
      `${automation.baselinePct} ${automation.dimensionAdjustmentPct >= 0 ? "−" : "+"} ${Math.abs(automation.dimensionAdjustmentPct)} − ${automation.evidenceAdjustmentPct} = ${exposurePct}% exposure`,
    ],
    fix: "Move task time toward work that sets direction rather than executes it.",
    timeToFix: "3–6 months",
  });

  /* 2 · Proof and credential readiness. A role-specific hiring gate and
     general evidence depth are one market-readiness category, not two risks. */
  const readiness = getReadinessBenchmark(profile);
  const { gateCount, proofCount, missingGate, missingProof } = readiness;
  if (missingGate || missingProof) {
    const missing: string[] = [];
    if (missingGate) missing.push(`a role-relevant gate (${KEY_CREDENTIAL[readiness.family]})`);
    if (missingProof) missing.push(`proof depth of ${RISK_POLICY.proofMinimum} sources`);
    risks.push({
      id: "readiness",
      category: "Proof & Credentials",
      headline: missingGate && !missingProof
        ? `Your record has depth but no ${KEY_CREDENTIAL[readiness.family]} — that is the item postings gate on.`
        : `You need ${readiness.additionsNeeded} more evidence item${readiness.additionsNeeded === 1 ? "" : "s"}; ${missing.join(" and ")} must be covered.`,
      severity: missingGate ? "high" : "medium",
      metric: `${gateCount}/${RISK_POLICY.roleGateMinimum} gate · ${proofCount}/${RISK_POLICY.proofMinimum} sources`,
      horizon: "blocks applications today",
      evidence: `Counted ${gateCount} role-relevant gate item${gateCount === 1 ? "" : "s"} and ${proofCount} evidence source${proofCount === 1 ? "" : "s"} from your scan.`,
      comparison: {
        current: `${gateCount} credential · ${proofCount} proof source${proofCount === 1 ? "" : "s"}`,
        benchmark: `${RISK_POLICY.roleGateMinimum} credential · ${RISK_POLICY.proofMinimum} proof sources`,
        /* Counting was misleading once a profile had depth: someone
           with sixteen evidence items was told "1 evidence item
           missing" when what is missing is one specific credential, not
           quantity. Name the thing instead of counting it. */
        /* KEY_CREDENTIAL entries start with their own article, so
           prefixing them reads as "No a cloud certification on file". */
        shortfall: missingGate
          ? `Missing ${KEY_CREDENTIAL[readiness.family]}`
          : `${readiness.additionsNeeded} more proof source${readiness.additionsNeeded === 1 ? "" : "s"} needed`,
      },
      calculation: [
        `Role gate for target ${readiness.family}: ${KEY_CREDENTIAL[readiness.family]}`,
        `Accepted gate evidence on file: ${gateCount}`,
        `All evidence sources on file: ${proofCount}; minimum useful depth: ${RISK_POLICY.proofMinimum}`,
        "A gate item also counts as a proof source, so overlapping requirements are not double-counted.",
      ],
      fix: missingGate
        ? `Add ${KEY_CREDENTIAL[readiness.family]} and attach a source an employer can check.`
        : "Add one more distinct source that proves an outcome, qualification, or responsibility.",
      timeToFix: missingGate ? "6–12 weeks" : "1 week",
    });
  }

  /* 3 · Salary position against the market band for family + seniority. */
  const salary = getSalaryBenchmark(profile);
  const band = salary.median;
  const current = salary.current;
  if (current && salary.conclusive) {
    const deltaPct = salary.percent!;
    if (deltaPct <= RISK_POLICY.salaryRiskFloorPct) {
      const gap = band - current;
      risks.push({
        id: "salary",
        category: "Salary Drift",
        headline: `You are ${salary.basis === "upper-bound" ? "at least " : ""}RM ${gap.toLocaleString()}/mo below the market median for your level.`,
        severity: sev(Math.abs(deltaPct) * 2.5),
        metric: `${deltaPct}%`,
        horizon: "widens every year you stay",
        evidence: `Your stated RM ${current.toLocaleString()}/mo against the RM ${band.toLocaleString()}/mo median for ${family} roles at your experience level.`,
        comparison: {
          current: `${salary.basis === "upper-bound" ? "<" : salary.basis === "lower-bound" ? "≥" : ""}RM ${current.toLocaleString()}/mo`,
          benchmark: `RM ${band.toLocaleString()}/mo typical`,
          shortfall: `RM ${gap.toLocaleString()}/mo below${salary.basis === "upper-bound" ? " at least" : ""} (${Math.abs(deltaPct)}%)`,
        },
        calculation: [
          `Used the ${salary.basis.replace("-", " ")} of your stated salary range: RM ${current.toLocaleString()}/mo`,
          `Matched ${family} role family and experience band to RM ${band.toLocaleString()}/mo`,
          `Shortfall = RM ${band.toLocaleString()} − RM ${current.toLocaleString()} = RM ${gap.toLocaleString()}/mo`,
        ],
        fix: "Benchmark before your next review, or move — a correction at offer stage is worth years of increments.",
        timeToFix: "1 review cycle",
      });
    }
  }

  /* 4 · Leadership gap — only raised when the target role implies leading. */
  const leadership = dim(profile, "Leadership");
  const targetWantsLeadership = /manager|lead|head|director|principal|senior/i.test(profile.targetRole);
  if (targetWantsLeadership && leadership < RISK_POLICY.leadershipReady) {
    risks.push({
      id: "leadership",
      category: "Leadership Gap",
      headline: `Your target role is a leadership role, but your Leadership signal is ${Math.round(leadership)}.`,
      severity: leadership < 50 ? "high" : "medium",
      metric: `${Math.round(leadership)}/100`,
      horizon: "blocks the next promotion cycle",
      evidence: `Leadership scored ${Math.round(leadership)} from your Career Calibration answers, against a target role of "${profile.targetRole}".`,
      comparison: {
        current: `${Math.round(leadership)}/100`,
        benchmark: `${RISK_POLICY.leadershipReady}/100 needed`,
        shortfall: `${Math.ceil(RISK_POLICY.leadershipReady - leadership)} points short`,
      },
      calculation: [
        `Target title "${profile.targetRole}" matched a leadership-level role`,
        `Leadership signal from Career Calibration: ${Math.round(leadership)}/100`,
        `Readiness threshold: ${RISK_POLICY.leadershipReady}/100; shortfall: ${Math.ceil(RISK_POLICY.leadershipReady - leadership)} points`,
      ],
      fix: "Take one piece of visible scope — a project, a mentee, a cross-team decision — and make the outcome attributable to you.",
      timeToFix: "6–9 months",
    });
  }

  const order: Severity[] = ["critical", "high", "medium", "low"];
  return risks.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
}

export function deriveRiskCategoryChecks(profile: CareerProfile): RiskCategoryCheck[] {
  const risks = deriveRisks(profile);
  const byId = new Map(risks.map(r => [r.id, r]));
  const automation = getAutomationBenchmark(profile);
  const salary = getSalaryBenchmark(profile);
  const readiness = getReadinessBenchmark(profile);
  const leadership = dim(profile, "Leadership");
  const leadershipApplies = /manager|lead|head|director|principal|senior/i.test(profile.targetRole);

  return [
    {
      id: "automation", label: "AI exposure",
      status: byId.has("automation") ? "open" : "clear",
      summary: byId.get("automation")?.comparison.shortfall ?? `${automation.exposurePct}% · below ${RISK_POLICY.automationLowRiskCeiling}% threshold`,
    },
    {
      id: "salary", label: "Salary position",
      status: salary.current === null || !salary.conclusive ? "not-measured" : byId.has("salary") ? "open" : "clear",
      summary: salary.current === null
        ? "Salary not provided"
        : !salary.conclusive
          ? "Open-ended range crosses the benchmark"
          : byId.get("salary")?.comparison.shortfall ?? `${salary.percent! >= 0 ? "+" : ""}${salary.percent}% vs median`,
    },
    {
      id: "readiness", label: "Proof & credential",
      status: byId.has("readiness") ? "open" : "clear",
      summary: byId.get("readiness")?.comparison.shortfall ?? `${readiness.gateCount}/${RISK_POLICY.roleGateMinimum} gate · ${readiness.proofCount}/${RISK_POLICY.proofMinimum} proof`,
    },
    {
      id: "leadership", label: "Leadership progression",
      status: leadershipApplies ? (byId.has("leadership") ? "open" : "clear") : "not-applicable",
      summary: leadershipApplies
        ? byId.get("leadership")?.comparison.shortfall ?? `${Math.round(leadership)}/100 · threshold met`
        : "Target role does not require a leadership gate",
    },
  ];
}

/* ── Target gaps: the role you want ──────────────────────────── */

/* What the rung asks for beyond the field. A lead role is not a bigger
   version of the job below it, and the gap list should not read as if
   it were. */
interface LevelDemand {
  skill: string;
  severity?: Severity;
  kind: string;
  title: string;
  headline: string;
  why: string;
  ifIgnored: string;
  action: string;
  time: string;
}

const LEVEL_DEMANDS: Record<string, LevelDemand[]> = {
  lead: [
    {
      skill: "People leadership",
      kind: "Missing Experience",
      title: "Team Leadership",
      headline: "You have not led anyone yet, and every posting at this level asks for it.",
      why: "This is the one thing that separates the job you have from the job you want. Nothing else on this list matters if this stays empty.",
      ifIgnored:
        "You keep being read as the strongest technical contributor in the room. That is how people get handed more complex models to build — not a team to run.",
      action:
        "Ask to be responsible for one person: an intern, a new joiner, or a junior on a single project. Then write down what changed for them, not for you.",
      time: "6 months",
    },
    {
      skill: "Owning a roadmap",
      kind: "Missing Skill",
      title: "Project Prioritization",
      headline: "Deciding what the team does not work on — not only what it does.",
      why: "Managers are hired on judgement about priorities. Being excellent at the work is what got you considered; choosing the work is the job.",
      ifIgnored:
        "Interviews keep testing what you built, and you do well. Then the manager questions arrive — what did you kill, what did you refuse — and there is nothing to answer with.",
      action:
        "At the next planning round, put one thing on the not-doing list and put the reason in writing. One documented no is worth more here than ten delivered yeses.",
      time: "3 months",
    },
  ],
  senior: [
    {
      skill: "Mentoring",
      kind: "Missing Experience",
      title: "Mentoring Others",
      headline: "Someone else's work getting better because of you.",
      why: "Senior is the rung where you stop being measured on your own output alone.",
      ifIgnored:
        "You stay the person who does the hard piece personally. That is valuable and it is also why the promotion keeps going to someone else.",
      action:
        "Pick one person and one thing they are stuck on. Review their work weekly for a month, and keep a note of what improved.",
      time: "3 months",
    },
  ],
  entry: [],
  mid: [],
};

/* ── How a gap is labelled ───────────────────────────────────
   The card used to lead with a full sentence, so every one of them
   took a moment to parse and they all looked alike at a glance. The
   eye now lands on two or three words, and the sentence moves down to
   the subtitle where it belongs. */

/* Words that mark a skill as technical rather than behavioural. Applied
   only in families where the distinction holds — "Pipeline management"
   in sales is a book of deals, not a data pipeline. */
const TECHNICAL_MARKER = /(cloud|pipeline|warehouse|ci\/cd|deploy|test|code|data|sql|orchestrat|model|prototyp|accessib|automation|analytics|metric|system)/i;
const TECHNICAL_FAMILIES: RoleFamily[] = ["software", "data", "design", "product"];

/* Where the internal name is not what a person would call it. */
const GAP_TITLE_OVERRIDE: Record<string, string> = {
  "Cloud warehouse": "Cloud Data Warehousing",
  "CI/CD": "CI/CD Pipelines",
  "Working with data": "Working With Data",
};

/* Capitalises each word without flattening names that are already
   uppercase — plain title-casing turns "CI/CD" into "Ci/cd". */
const asTitle = (skill: string) =>
  GAP_TITLE_OVERRIDE[skill] ?? skill.replace(/\b[a-z]/g, c => c.toUpperCase());

/* Some gaps are worth writing by hand. The derived version says a skill
   is missing and which postings ask for it, which is true and thin —
   for the two or three that actually decide a move, the card should say
   what the difference between the two jobs really is. Anything not in
   here still gets the derived treatment. */
interface AuthoredGap {
  kind: string;
  title: string;
  headline: string;
  why: string;
  ifIgnored: string;
  action: string;
  time: string;
  severity: Severity;
}

const AUTHORED_GAP: Record<string, AuthoredGap> = {
  MLOps: {
    kind: "Missing Technical Skill",
    title: "Machine Learning & Production (MLOps)",
    headline:
      "You have built models and shipped one. Nothing on your record keeps running, retrains, or gets watched after launch.",
    why:
      "Data Analysts look at what happened. Data Science Managers own systems that predict what happens next and keep them alive in production — monitored, retrained, and trusted by an app that depends on them. Shipping a model once and running one are different jobs.",
    ifIgnored:
      "The technical interview goes fine until they ask what happened to the model after launch. Managers are hired to own systems that stay up, not projects that ended.",
    action:
      "Build a small machine-learning project that retrains and runs by itself on a schedule — sales, churn, anything. Put the link in your portfolio.",
    time: "3–6 months",
    severity: "high",
  },
  "Enterprise cloud": {
    kind: "Missing Technical Skill",
    title: "Enterprise Cloud Experience",
    headline:
      "Nothing on your record shows you have worked on AWS, Google Cloud or Azure.",
    why:
      "An analyst pulls data out of a cloud database. A manager owns the architecture and the bill that comes with it. Employers screen for people who can use these platforms without spending a fortune on compute by accident.",
    ifIgnored:
      "Cloud platforms are a keyword filter as much as a skill. Applications can be screened out on the missing term before a person reads the rest.",
    action:
      "Take an entry-level cloud certificate — AWS Cloud Practitioner or the Google Cloud equivalent. It is the cheapest item on this list and it closes the credential gate too.",
    time: "30–60 days",
    severity: "high",
  },
};

function labelFor(skill: string, family: RoleFamily): { kind: string; title: string } {
  const technical = TECHNICAL_FAMILIES.includes(family) && TECHNICAL_MARKER.test(skill);
  return { kind: technical ? "Missing Technical Skill" : "Missing Skill", title: asTitle(skill) };
}

/**
 * The distance between the role they hold and the role they want.
 *
 * This used to read the transition rule set, which has entries for a
 * handful of moves and a generic fallback for everything else. Anyone
 * outside those few got the same four lines — "ship one portfolio
 * project", "convert experience into verifiable evidence" — which are
 * process advice, not gaps, and identical no matter what they were
 * aiming at.
 *
 * Gaps are the skills the target role actually asks for that this
 * person cannot evidence, plus what the rung demands on top. Specific,
 * different for every target, and checkable against their own record.
 */
export function deriveTargetGaps(profile: CareerProfile, ctx: GapContext = {}): TargetGap[] {
  const target = profile.targetRole || "";
  if (!target) return [];

  const family = detectRoleFamily(target, profile.currentRole);
  const coverage = getSkillCoverage(profile);
  const level = /manager|lead\b|head of|director|principal|chief/i.test(target)
    ? "lead"
    : /senior|staff\b/i.test(target)
      ? "senior"
      : /junior|intern|graduate|trainee/i.test(target)
        ? "entry"
        : "mid";

  const evidenced = new Set([
    ...profile.evidence.flatMap(e => e.skills.map(sk => sk.toLowerCase())),
    ...profile.evidence.map(e => e.label.toLowerCase()),
  ]);
  const skillsChecked = (profile.resume?.skills ?? []).length;

  /* What the rung demands comes first — it is the reason the move is a
     move rather than a promotion that happens on its own. */
  const fromLevel = (LEVEL_DEMANDS[level] ?? []).map(d => ({ ...d, fromLevel: true }));

  /* Skill gaps are written against the postings that actually screen on
     them, so each card says something checkable and different. The
     alternative — one sentence with the skill name swapped in — is what
     made four cards read as one card printed four times. */
  const familyLabel = FAMILY_LABEL[family].toLowerCase();

  /* A skill the matched postings actually name outranks one that only
     appears on the standard list for the family. Without this the order
     was whatever the authored array happened to be in, and a gap nobody
     is screening on could sit above one three employers ask for. */
  const cited = (skill: string) => (ctx.askedBy?.(skill) ?? []).length;
  const missingByDemand = [...coverage.missing].sort((a, b) => cited(b) - cited(a));

  const fromSkills: (LevelDemand & { fromLevel: boolean; cited: number; severity?: Severity })[] = missingByDemand.map((skill, i) => {
    const asked = ctx.askedBy?.(skill) ?? [];
    const total = ctx.postingCount ?? 0;

    /* Written by hand where the difference between the two jobs needs
       saying properly. Everything else takes the derived version. */
    const authored = AUTHORED_GAP[skill];
    if (authored) return { skill, ...authored, fromLevel: false, cited: asked.length };

    const why = asked.length
      ? `${asked[0]} names it outright. It is a screening line for this move, not a nice-to-have.`
      : `This is on the standard skill list for ${target} in ${familyLabel}, and it is the kind of thing an interview opens with.`;

    const ifIgnored = asked.length && total
      ? `${asked.length} of the ${total} ${target} postings we matched you to screen on it${asked.length > 1 ? ` — ${asked.slice(0, 2).join(" and ")} among them` : `: ${asked[0]}`}. A screener reading your profile has nothing to tick.`
      : `Nothing in your record mentions it, so the first person to ask about it will be an interviewer rather than your own profile.`;

    return {
      skill,
      ...labelFor(skill, family),
      headline: `Nothing on your record shows it.`,
      why,
      ifIgnored,
      action: asked.length
        ? `Ship one piece of work that uses ${skill.toLowerCase()} and put the link on your profile. ${asked[0]} is the posting it would unlock first.`
        : `Ship one piece of work that uses ${skill.toLowerCase()} and put the link on your profile.`,
      time: ["3 months", "2 months", "6 weeks", "4 weeks", "1 month"][i] ?? "1 month",
      fromLevel: false,
      cited: asked.length,
    };
  });

  const all = [...fromLevel, ...fromSkills].slice(0, 5);

  return all.map((gap, i) => {
    const covered = evidenced.has(gap.skill.toLowerCase());
    return {
      id: `gap-${i}`,
      skill: gap.skill,
      kind: gap.kind,
      title: gap.title,
      headline: gap.headline,
      why: gap.why,
      /* Nobody we matched them to is asking for it, so we have less
         reason to call it a blocker than the ones that are cited. */
      severity: covered
        ? "low"
        : gap.severity ?? (gap.fromLevel ? "high" : "cited" in gap && !gap.cited ? "low" : "medium"),
      ifIgnored: covered
        ? `It is on your record but not where anyone reads it, so in practice it counts for nothing.`
        : gap.ifIgnored,
      action: covered
        ? `You have something for this already — say it plainly on your profile rather than leaving it implied.`
        : gap.action,
      timeToClose: covered ? "1 week" : gap.time,
      basis: gap.fromLevel
        ? `"${target}" reads as a ${level}-level title, and this is what that rung asks for on top of the field.`
        : `Checked ${skillsChecked} skills from your résumé and ${profile.evidence.length} evidence ${profile.evidence.length === 1 ? "item" : "items"} against what ${target} postings screen on.`,
    };
  });
}

/* ── The four headline scores ────────────────────────────────── */

/* ── Blind spots ─────────────────────────────────────────────
   A blind spot is not just a risk. It needs three things at once:
   the risk is real, we could actually measure it, and the person does
   not believe it is their problem. The third condition is why this
   needs `selfAssessment` — without it we would be renaming risks, not
   detecting blind spots. */

export interface BlindSpot {
  risk: Risk;
  /** What they said was holding them back instead. */
  believed: string;
  /** Highest when the risk is severe and they named something else. */
  confidence: "high" | "moderate";
}

const RISK_LABEL: Record<string, string> = {
  automation: "AI taking over your work",
  salary:     "Being underpaid",
  readiness:  "Not enough proof of your skills",
  leadership: "Not enough leadership experience",
  none:       "nothing in particular",
};

/** How a risk id reads when the user picks it in their own words. */
export function selfAssessmentLabel(id: string): string {
  return RISK_LABEL[id] ?? id;
}

export function deriveBlindSpots(profile: CareerProfile): BlindSpot[] {
  /* Never asked, so there is nothing to compare against. We do not
     guess at what someone believes. */
  if (!profile.selfAssessment) return [];

  const risks = deriveRisks(profile);
  const believed = RISK_LABEL[profile.selfAssessment] ?? "something else";

  return risks
    /* They already know about the one they named — that is a concern,
       not a blind spot. */
    .filter(r => r.id !== profile.selfAssessment)
    .filter(r => r.severity === "critical" || r.severity === "high")
    .map(r => ({
      risk: r,
      believed,
      confidence: r.severity === "critical" ? "high" as const : "moderate" as const,
    }));
}

export function deriveScorecard(profile: CareerProfile): Scorecard {
  const risks = deriveRisks(profile);
  const family = detectRoleFamily(profile.currentRole, profile.targetRole);

  const automationRisk = risks.find(r => r.id === "automation");
  const automation = getAutomationBenchmark(profile);
  const exposurePct = automation.exposurePct;

  const salaryRisk = risks.find(r => r.id === "salary");
  const salaryBenchmark = getSalaryBenchmark(profile);
  const salaryPct = salaryBenchmark.percent;
  const readiness = getReadinessBenchmark(profile);

  // Career health: start at 100, subtract a weighted penalty per open risk.
  const penalty: Record<Severity, number> = { critical: 14, high: 9, medium: 5, low: 2 };
  const evidenceBonus = Math.min(8, profile.evidence.length * 2);
  const careerHealth = Math.max(
    20,
    Math.min(98, 100 - risks.reduce((sum, r) => sum + penalty[r.severity], 0) + evidenceBonus),
  );

  // Promotion readiness: the DNA dimensions a promotion actually tests,
  // plus credit for having evidence on file.
  const promotionReady = Math.round(
    Math.max(
      5,
      Math.min(
        98,
        avg([dim(profile, "Leadership"), dim(profile, "Strategic"), dim(profile, "Communication")]) *
          0.8 +
          evidenceBonus * 1.5,
      ),
    ),
  );

  return {
    careerHealth: Math.round(careerHealth),
    aiExposure: {
      label: exposurePct >= RISK_POLICY.automationHighRiskFloor ? "High" : exposurePct >= RISK_POLICY.automationLowRiskCeiling ? "Moderate" : "Low",
      percent: exposurePct,
    },
    vsMarket: {
      label: salaryPct === null ? "No data" : !salaryBenchmark.conclusive ? "Inconclusive" : Math.abs(salaryPct) < Math.abs(RISK_POLICY.salaryRiskFloorPct) ? "At market" : `${Math.abs(salaryPct)}% ${salaryPct > 0 ? "above" : "below"}`,
      percent: salaryPct ?? 0,
      conclusive: salaryBenchmark.conclusive,
    },
    promotionReady,
    /* Career Health was on the dashboard twice — as the headline of the
       black panel and again as the first of the four cards. This took
       its place: the record's depth is not the same question as whether
       it clears a gate, and the gate is what actually stops an
       application. */
    proof: {
      label: readiness.additionsNeeded > 0 ? String(readiness.additionsNeeded) : "Solid",
      unit: readiness.additionsNeeded > 0 ? (readiness.additionsNeeded === 1 ? " gap" : " gaps") : "",
      gateCount: readiness.gateCount,
      proofCount: readiness.proofCount,
      ok: readiness.additionsNeeded === 0,
    },
    explain: {
      health: [
        `Started at 100 and subtracted a weighted penalty for each of your ${risks.length} open risk${risks.length === 1 ? "" : "s"}.`,
        ...risks.map(r => `${r.category} (${r.severity}) — ${penalty[r.severity]} points`),
        `Added back +${evidenceBonus} for the ${profile.evidence.length} evidence item${profile.evidence.length === 1 ? "" : "s"} on file.`,
      ],
      ai: automationRisk
        ? [automationRisk.evidence, automationRisk.headline]
        : [
            `${automation.baselinePct}% ${automation.family} baseline adjusted to ${automation.exposurePct}% by your Innovation, Strategic and project evidence signals.`,
            "This is below the 35% threshold, so it is not counted as an open risk.",
          ],
      salary: salaryRisk
        ? [salaryRisk.evidence, salaryRisk.headline]
        : salaryPct === null
          ? ["No salary was provided, so no salary-position conclusion was calculated."]
          : !salaryBenchmark.conclusive
            ? ["The open-ended salary range crosses the benchmark, so an exact salary-position conclusion cannot be calculated."]
          : [`Your stated range sits within 5% of, or above, the market median for ${family} roles at your level.`],
      proof: [
        `Counted ${readiness.proofCount} evidence source${readiness.proofCount === 1 ? "" : "s"} on file, and ${readiness.gateCount} of them count as a role gate for ${readiness.family}.`,
        `The gate for this family is ${KEY_CREDENTIAL[readiness.family]}; minimum useful depth is ${RISK_POLICY.proofMinimum} sources.`,
        readiness.additionsNeeded > 0
          ? `Short by ${readiness.additionsNeeded}. Depth is not the constraint here — the gate is, and one item can close it.`
          : `Both the gate and the depth minimum are met, so nothing here is blocking an application.`,
      ],
      promotion: [
        `Averaged your Leadership ${Math.round(dim(profile, "Leadership"))}, Strategic ${Math.round(dim(profile, "Strategic"))} and Communication ${Math.round(dim(profile, "Communication"))} scores, weighted at 0.8.`,
        `Added +${evidenceBonus * 1.5} for evidence on file.`,
      ],
    },
  };
}
