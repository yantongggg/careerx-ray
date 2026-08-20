/* A blind spot needs three things at once: the risk is real, we could
   measure it, and the person does not believe it is their problem.
   The third condition is the whole point — without it we would just be
   renaming risks. These assertions exist to stop that happening. */

import assert from "node:assert/strict";
import { loadTs } from "./loadTs.mjs";

const { deriveBlindSpots, deriveRisks, selfAssessmentLabel } = await loadTs("src/app/lib/careerRisk.ts");
const { EMPTY_PROFILE } = await loadTs("src/app/lib/profileTypes.ts");

const base = {
  ...EMPTY_PROFILE,
  currentRole: "Data Analyst",
  targetRole: "Data Science Manager",
  salaryRange: "RM 5k-8k/mo",
  experience: "3-5 years",
  scannedAt: "2026-08-20",
  dnaScores: { Technical: 92, Execution: 84, Strategic: 70, Innovation: 30, Leadership: 55, Communication: 46 },
};

/* ── No self-assessment means no blind spots, ever ─────────────── */

assert.equal(
  deriveBlindSpots({ ...base, selfAssessment: "" }).length, 0,
  "without knowing what the user believes, nothing can be called a blind spot",
);
assert.ok(deriveRisks({ ...base, selfAssessment: "" }).length > 0,
  "…even though the risks themselves are still there");

/* ── Naming a risk removes it from the blind spots ─────────────── */

const believesLeadership = deriveBlindSpots({ ...base, selfAssessment: "leadership" });
assert.ok(believesLeadership.length > 0, "risks they did not name should surface");
assert.ok(
  !believesLeadership.some(b => b.risk.id === "leadership"),
  "a risk the user named is a concern they already have, not a blind spot",
);

const believesReadiness = deriveBlindSpots({ ...base, selfAssessment: "readiness" });
assert.ok(
  !believesReadiness.some(b => b.risk.id === "readiness"),
  "naming the proof gap must remove it from the blind spots",
);
/* Changing only the belief must change the output — otherwise the
   self-assessment is decorative. */
assert.notDeepEqual(
  believesLeadership.map(b => b.risk.id),
  believesReadiness.map(b => b.risk.id),
  "the same scan with a different belief must produce different blind spots",
);

/* ── Only real risks qualify ───────────────────────────────────── */

for (const b of believesLeadership) {
  assert.ok(["critical", "high"].includes(b.risk.severity),
    `${b.risk.category} is not severe enough to call a blind spot`);
  assert.ok(["high", "moderate"].includes(b.confidence));
  assert.ok(b.believed.length > 3, "a blind spot must say what they believed instead");
}

/* A profile with nothing wrong has nothing to be blind to. */
const healthy = {
  ...base,
  currentRole: "Product Manager", targetRole: "Product Manager",
  salaryRange: "RM 20k+/mo", selfAssessment: "salary",
  dnaScores: { Technical: 88, Execution: 88, Strategic: 88, Innovation: 88, Leadership: 88, Communication: 88 },
  resume: {
    fileName: "cv.pdf", fileSize: 1, method: "ai", employers: [], education: [],
    certifications: ["AWS Certified Solutions Architect"], rawText: "", skills: ["Discovery", "Roadmapping"],
  },
  evidence: [
    { id: "e1", kind: "certificate", label: "AWS Certified Solutions Architect", source: "AWS", trust: "verified", skills: ["cloud"], addedAt: "now" },
    { id: "e2", kind: "project", label: "Shipped product", source: "GitHub", trust: "verified", skills: ["Discovery"], addedAt: "now" },
  ],
};
assert.ok(
  deriveBlindSpots(healthy).every(b => ["critical", "high"].includes(b.risk.severity)),
  "a strong profile must not manufacture blind spots out of minor risks",
);

/* ── Labels are human-readable ─────────────────────────────────── */

for (const id of ["automation", "salary", "readiness", "leadership"]) {
  const label = selfAssessmentLabel(id);
  assert.ok(label && label !== id, `${id} needs a plain-language label`);
}

/* ── Determinism ───────────────────────────────────────────────── */

assert.deepEqual(
  deriveBlindSpots({ ...base, selfAssessment: "leadership" }),
  believesLeadership,
);

console.log("blindSpots tests passed");
