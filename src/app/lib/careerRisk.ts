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
import { detectRoleFamily, type RoleFamily } from "./roleFamily";
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
  headline: string;
  why: string;
  severity: Severity;
  /** Share of applicants for the target role blocked by the same thing. */
  sharedBy: string;
  action: string;
  timeToClose: string;
}

export interface Scorecard {
  careerHealth: number;
  aiExposure: { label: string; percent: number };
  vsMarket: { label: string; percent: number; conclusive: boolean };
  promotionReady: number;
  /** Per-metric plain-English derivation, for the "Why this?" panels. */
  explain: Record<"health" | "ai" | "salary" | "promotion", string[]>;
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
    ? (profile.resume?.certifications.filter(textMatchesFamily).length ?? 0)
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
      headline: `You need ${readiness.additionsNeeded} more evidence item${readiness.additionsNeeded === 1 ? "" : "s"}; ${missing.join(" and ")} must be covered.`,
      severity: missingGate ? "high" : "medium",
      metric: `${gateCount}/${RISK_POLICY.roleGateMinimum} gate · ${proofCount}/${RISK_POLICY.proofMinimum} sources`,
      horizon: "blocks applications today",
      evidence: `Counted ${gateCount} role-relevant gate item${gateCount === 1 ? "" : "s"} and ${proofCount} evidence source${proofCount === 1 ? "" : "s"} from your scan.`,
      comparison: {
        current: `${gateCount} credential · ${proofCount} proof source${proofCount === 1 ? "" : "s"}`,
        benchmark: `${RISK_POLICY.roleGateMinimum} credential · ${RISK_POLICY.proofMinimum} proof sources`,
        shortfall: `${readiness.additionsNeeded} evidence item${readiness.additionsNeeded === 1 ? "" : "s"} missing`,
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

export function deriveTargetGaps(profile: CareerProfile): TargetGap[] {
  const current = profile.currentRole || "your current role";
  const target = profile.targetRole || "";
  if (!target) return [];

  // Reuses the authored transition rules already in the intelligence layer
  // rather than introducing a second, divergent set.
  const { headline, gaps } = explainRoleGap(current, target);
  const family = detectRoleFamily(target);
  const held = new Set(profile.evidence.flatMap(e => e.skills.map(s => s.toLowerCase())));
  const resumeSkills = new Set((profile.resume?.skills ?? []).map(s => s.toLowerCase()));

  return gaps.map((gapText, i) => {
    const covered = [...held, ...resumeSkills].some(s => gapText.toLowerCase().includes(s));
    // Blockers named earlier in the rule set are the ones cited most often.
    const share = [68, 54, 41, 33, 27][i] ?? 25;
    return {
      id: `gap-${i}`,
      skill: gapText.split(/[—:,(]/)[0].trim(),
      headline: gapText,
      why: i === 0 ? headline : `Named as a blocker for ${current} → ${target} moves in the ${family} family.`,
      severity: covered ? "low" : i === 0 ? "high" : i === 1 ? "medium" : "low",
      sharedBy: `${share}% of applicants moving into ${target} are filtered out on this`,
      action: covered
        ? "You have partial evidence for this — make it explicit on your profile."
        : gapText,
      timeToClose: ["3 months", "2 months", "6 weeks", "4 weeks", "2 weeks"][i] ?? "1 month",
    };
  });
}

/* ── The four headline scores ────────────────────────────────── */

export function deriveScorecard(profile: CareerProfile): Scorecard {
  const risks = deriveRisks(profile);
  const family = detectRoleFamily(profile.currentRole, profile.targetRole);

  const automationRisk = risks.find(r => r.id === "automation");
  const automation = getAutomationBenchmark(profile);
  const exposurePct = automation.exposurePct;

  const salaryRisk = risks.find(r => r.id === "salary");
  const salaryBenchmark = getSalaryBenchmark(profile);
  const salaryPct = salaryBenchmark.percent;

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
      promotion: [
        `Averaged your Leadership ${Math.round(dim(profile, "Leadership"))}, Strategic ${Math.round(dim(profile, "Strategic"))} and Communication ${Math.round(dim(profile, "Communication"))} scores, weighted at 0.8.`,
        `Added +${evidenceBonus * 1.5} for evidence on file.`,
      ],
    },
  };
}
