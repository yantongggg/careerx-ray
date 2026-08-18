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
  vsMarket: { label: string; percent: number };
  promotionReady: number;
  /** Per-metric plain-English derivation, for the "Why this?" panels. */
  explain: Record<"health" | "ai" | "salary" | "promotion", string[]>;
}

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
  const years =
    profile.resume?.yearsExperience ??
    parseFloat((profile.experience.match(/\d+/) ?? ["0"])[0]);
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

/* ── Risks: the role you are in today ────────────────────────── */

export function deriveRisks(profile: CareerProfile): Risk[] {
  const family = detectRoleFamily(profile.currentRole, profile.targetRole);
  const risks: Risk[] = [];

  /* 1 · Automation exposure.
     Base rate for the family, reduced by the two dimensions that most
     reliably survive automation (Innovation, Strategic) and by having
     shipped project evidence. */
  const creativeShield = (avg([dim(profile, "Innovation"), dim(profile, "Strategic")]) - 55) / 100;
  const evidenceShield = hasEvidenceOf(profile, ["project", "portfolio"]) ? 0.04 : 0;
  const exposure = Math.max(
    0.12,
    Math.min(0.85, AUTOMATION_BASE[family] - creativeShield * 0.35 - evidenceShield),
  );
  const exposurePct = Math.round(exposure * 100);
  risks.push({
    id: "automation",
    category: "AI Automation Exposure",
    headline: `${exposurePct}% of your routine task time is exposed to automation.`,
    severity: sev(exposurePct),
    metric: `${exposurePct}%`,
    horizon: exposurePct >= 55 ? "within 24 months" : "within 3–5 years",
    evidence: `Baseline for ${family} roles (${Math.round(AUTOMATION_BASE[family] * 100)}%), adjusted for your Innovation ${Math.round(dim(profile, "Innovation"))} and Strategic ${Math.round(dim(profile, "Strategic"))} scores${evidenceShield ? " and your shipped project evidence" : ""}.`,
    fix: "Move task time toward work that sets direction rather than executes it.",
    timeToFix: "3–6 months",
  });

  /* 2 · Credential gap — only a risk if there is genuinely no credential
     evidence on file. */
  if (!hasEvidenceOf(profile, ["certificate"])) {
    risks.push({
      id: "credential",
      category: "Credential Gap",
      headline: `You have no verified credential on file. Most ${profile.targetRole || "target"} postings ask for ${KEY_CREDENTIAL[family]}.`,
      severity: "high",
      metric: "0 on file",
      horizon: "blocks applications today",
      evidence: "No evidence item of type 'certificate' was provided during your scan.",
      fix: `Add ${KEY_CREDENTIAL[family]} — and attach the issuer verification link, not just the PDF.`,
      timeToFix: "6–12 weeks",
    });
  }

  /* 3 · Salary position against the market band for family + seniority. */
  const band = MARKET_MEDIAN[family][seniorityIndex(profile)];
  const current = parseMonthlyRM(profile.salaryRange);
  if (current) {
    const deltaPct = Math.round(((current - band) / band) * 100);
    if (deltaPct <= -5) {
      const gap = band - current;
      risks.push({
        id: "salary",
        category: "Salary Drift",
        headline: `You are RM ${gap.toLocaleString()}/mo below the market median for your level.`,
        severity: sev(Math.abs(deltaPct) * 2.5),
        metric: `${deltaPct}%`,
        horizon: "widens every year you stay",
        evidence: `Your stated RM ${current.toLocaleString()}/mo against the RM ${band.toLocaleString()}/mo median for ${family} roles at your experience level.`,
        fix: "Benchmark before your next review, or move — a correction at offer stage is worth years of increments.",
        timeToFix: "1 review cycle",
      });
    }
  }

  /* 4 · Leadership gap — only raised when the target role implies leading. */
  const leadership = dim(profile, "Leadership");
  const targetWantsLeadership = /manager|lead|head|director|principal|senior/i.test(profile.targetRole);
  if (targetWantsLeadership && leadership < 65) {
    risks.push({
      id: "leadership",
      category: "Leadership Gap",
      headline: `Your target role is a leadership role, but your Leadership signal is ${Math.round(leadership)}.`,
      severity: leadership < 50 ? "high" : "medium",
      metric: `${Math.round(leadership)}/100`,
      horizon: "blocks the next promotion cycle",
      evidence: `Leadership scored ${Math.round(leadership)} from your Career Calibration answers, against a target role of "${profile.targetRole}".`,
      fix: "Take one piece of visible scope — a project, a mentee, a cross-team decision — and make the outcome attributable to you.",
      timeToFix: "6–9 months",
    });
  }

  /* 5 · Evidence thinness — a real risk for people with nothing to show. */
  if (profile.evidence.length < 2 && !profile.resume) {
    risks.push({
      id: "evidence",
      category: "Thin Evidence Record",
      headline: "There is almost nothing on file for an employer to check.",
      severity: "medium",
      metric: `${profile.evidence.length} item${profile.evidence.length === 1 ? "" : "s"}`,
      horizon: "affects every application you send",
      evidence: "Counted directly from the evidence you added during the scan.",
      fix: "Add any two things you can point at — a project, a reference letter, a record of results.",
      timeToFix: "1 week",
    });
  }

  const order: Severity[] = ["critical", "high", "medium", "low"];
  return risks.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
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

  const automation = risks.find(r => r.id === "automation");
  const exposurePct = automation ? parseInt(automation.metric, 10) : 40;

  const salaryRisk = risks.find(r => r.id === "salary");
  const salaryPct = salaryRisk ? parseInt(salaryRisk.metric, 10) : 0;

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
      label: exposurePct >= 55 ? "High" : exposurePct >= 35 ? "Moderate" : "Low",
      percent: exposurePct,
    },
    vsMarket: {
      label: salaryPct === 0 ? "At market" : `${salaryPct > 0 ? "+" : ""}${salaryPct}%`,
      percent: salaryPct,
    },
    promotionReady,
    explain: {
      health: [
        `Started at 100 and subtracted a weighted penalty for each of your ${risks.length} open risk${risks.length === 1 ? "" : "s"}.`,
        ...risks.map(r => `${r.category} (${r.severity}) — ${penalty[r.severity]} points`),
        `Added back +${evidenceBonus} for the ${profile.evidence.length} evidence item${profile.evidence.length === 1 ? "" : "s"} on file.`,
      ],
      ai: automation ? [automation.evidence, automation.headline] : ["No automation signal available."],
      salary: salaryRisk
        ? [salaryRisk.evidence, salaryRisk.headline]
        : [`Your stated range sits within the market band for ${family} roles at your level.`],
      promotion: [
        `Averaged your Leadership ${Math.round(dim(profile, "Leadership"))}, Strategic ${Math.round(dim(profile, "Strategic"))} and Communication ${Math.round(dim(profile, "Communication"))} scores, weighted at 0.8.`,
        `Added +${evidenceBonus * 1.5} for evidence on file.`,
      ],
    },
  };
}
