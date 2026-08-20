/* The local engine is not a stub — it is what answers whenever the API
   key is missing, and it cannot be exercised by running the dev server
   because vite serves index.html for /api/*. So it gets tested here. */

import assert from "node:assert/strict";
import { loadTs } from "./loadTs.mjs";

const { parseOptions, localWhatIf } = await loadTs("src/app/lib/whatIf.ts");
const { EMPTY_PROFILE } = await loadTs("src/app/lib/profileTypes.ts");

const dev = {
  ...EMPTY_PROFILE,
  currentRole: "Junior Developer",
  targetRole: "Software Engineer",
  salaryRange: "RM 4,000 – 5,000",
  experience: "1 year",
  scannedAt: "2026-08-20",
};

/* ── Parsing ──────────────────────────────────────────────────── */

assert.deepEqual(
  parseOptions("Software Engineer or Security Engineer?"),
  ["Software Engineer", "Security Engineer"],
);
assert.deepEqual(
  parseOptions("Should I take Backend Engineer vs Data Analyst"),
  ["Backend Engineer", "Data Analyst"],
);
assert.deepEqual(
  parseOptions("What if Company A offers me QA Engineer, Company B offers Frontend Engineer?"),
  ["Company A offers me QA Engineer", "Company B offers Frontend Engineer"],
);
/* A question with only one option must not silently become two. */
assert.equal(parseOptions("Should I become a Software Engineer?").length, 1);

/* ── One option means say so, not invent a rival ──────────────── */

const single = localWhatIf(dev, "Should I become a Software Engineer?");
assert.equal(single.options.length, 0, "a single option must not be padded out to two");
assert.match(single.summary, /one option/i, "it must say why it cannot compare");

/* ── Two options ──────────────────────────────────────────────── */

const answer = localWhatIf(dev, "Software Engineer or Restaurant Manager?");
assert.equal(answer.options.length, 2);

const [se, rm] = answer.options;
assert.ok(
  se.alignment > rm.alignment,
  "the option matching the stated target must align higher than an unrelated one",
);

for (const o of answer.options) {
  assert.ok(o.alignment >= 0 && o.alignment <= 100, `${o.label}: alignment must be a percentage`);
  /* Every option states its downside. An option with no risk reads as
     a sales pitch, which is the failure mode this guards. */
  assert.ok(o.risk.length > 30, `${o.label}: must state a real downside`);
  assert.ok(o.payOutlook.includes("RM"), `${o.label}: pay must be quoted in RM`);
  assert.ok(!/\/(yr|year|annum)/i.test(o.payOutlook), `${o.label}: pay must be monthly, not annual`);
  assert.ok(o.skillGain.length > 20 && o.longTerm.length > 20, `${o.label}: fields must be filled`);
}

assert.ok(answer.recommendation.length > 20, "there must be a recommendation");
assert.ok(answer.wouldChangeTheAnswer.length > 20, "it must name what would flip the answer");

/* ── The answer follows the profile, not the question alone ───── */

const chef = { ...dev, currentRole: "Chef / Cook", targetRole: "Restaurant Manager" };
const chefAnswer = localWhatIf(chef, "Software Engineer or Restaurant Manager?");
assert.ok(
  chefAnswer.options[1].alignment > chefAnswer.options[0].alignment,
  "the same question must answer differently for someone with a different target",
);

/* ── Determinism ──────────────────────────────────────────────── */

assert.deepEqual(
  localWhatIf(dev, "Software Engineer or Restaurant Manager?"),
  answer,
  "the same question and profile must give the same answer",
);

console.log("whatIf tests passed");
