/* The corpus decides what six pages show. Before it existed those pages
   held a hardcoded data analyst, so the assertions that matter here are
   the ones proving no persona leaks across a family boundary. */

import assert from "node:assert/strict";
import { loadTs } from "./loadTs.mjs";

const { corpusFor, jobById, fitFor, TIMELINE_LABELS } = await loadTs("src/app/lib/careerCorpus.ts");
const { EMPTY_PROFILE } = await loadTs("src/app/lib/profileTypes.ts");

const profile = (over) => ({ ...EMPTY_PROFILE, ...over, scannedAt: "2026-08-20" });

/* ── The demo persona ─────────────────────────────────────────── */

const dev = profile({
  currentRole: "Junior Developer",
  targetRole: "Software Engineer",
  salaryRange: "RM 4,000 – 5,000",
  experience: "1 year",
});

const devCorpus = corpusFor(dev);

assert.equal(devCorpus.family, "software", "Junior Developer must classify as software");
assert.ok(devCorpus.rankedJobs.length >= 3, "software family needs a real job list");

/* Nothing from the old hardcoded persona may reach a software profile.
   The salary landscape is excluded on purpose: it lists what the whole
   Malaysian market pays for the role, and Maybank hiring engineers is a
   fact about the market, not a persona leak. */
const BANNED = ["Data Analyst", "Analytics Engineer", "Maybank", "Jordan Kim", "dbt", "Tableau", "AI Product Analyst"];
const personaOf = (c) => JSON.stringify({
  jobs: c.rankedJobs, futures: c.futures, evidence: c.evidenceSamples,
  cert: c.certification, adjacent: c.adjacentRole, lead: c.leadRole,
  foundation: c.foundationSkills, target: c.targetSkills,
});
const devText = personaOf(devCorpus);
for (const term of BANNED) {
  assert.ok(
    !devText.includes(term),
    `a software profile must not surface "${term}" — that is the old hardcoded persona`,
  );
}

/* Futures must run from where they are to where they said they want to go. */
const [stay, target, adjacent] = devCorpus.futures;
assert.equal(devCorpus.futures.length, 3);
assert.match(stay.tagline, /Junior Developer/, "Future A must name the actual current role");
assert.match(target.tagline, /Software Engineer/, "Future B must name the actual target role");
assert.ok(adjacent.role && adjacent.role !== target.role, "Future C must be a distinct third path");

assert.ok(target.salary5yr > stay.salary5yr, "moving to the target should out-earn standing still");
assert.ok(target.aiRiskPct < stay.aiRiskPct, "software should carry less automation risk than staying junior");

for (const f of devCorpus.futures) {
  assert.equal(f.salaryData.length, TIMELINE_LABELS.length, `${f.id} needs one point per timeline label`);
  assert.ok(f.salaryData.every(n => Number.isFinite(n) && n > 0), `${f.id} salary curve must be real numbers`);
  const monotonic = f.salaryData.every((n, i) => i === 0 || n >= f.salaryData[i - 1]);
  assert.ok(monotonic, `${f.id} salary curve must not go backwards`);
  assert.ok(f.aiRiskPct >= 0 && f.aiRiskPct <= 100, `${f.id} AI risk must be a percentage`);
}

/* ── Other families must not see software content ─────────────── */

const analyst = corpusFor(profile({
  currentRole: "Data Analyst", targetRole: "Analytics Engineer",
  salaryRange: "RM 6,000", experience: "3 years",
}));
assert.equal(analyst.family, "data");
assert.ok(!personaOf(analyst).includes("Software Engineer, Payments"),
  "a data profile must not see software postings");

const server = corpusFor(profile({
  currentRole: "Restaurant Server", targetRole: "Restaurant Manager",
  salaryRange: "RM 2,200", experience: "2 years",
}));
assert.equal(server.family, "service", "Restaurant Server must classify as service");
const serverText = personaOf(server);
for (const term of [...BANNED, "Software Engineer", "Backend Engineer", "Kafka", "dbt"]) {
  assert.ok(!serverText.includes(term),
    `a restaurant profile must not surface "${term}"`);
}
/* The generic fallback templates titles from the user's own target. */
assert.ok(server.rankedJobs.every(j => j.position === "Restaurant Manager"),
  "generic postings must be titled from the user's target role");
assert.match(server.futures[1].tagline, /Restaurant Manager/);

/* ── Salaries stay believable ─────────────────────────────────── */

for (const fam of [devCorpus, analyst, server]) {
  for (const job of fam.rankedJobs) {
    assert.ok(job.salaryLow > 0 && job.salaryHigh > job.salaryLow,
      `${job.company} ${job.title} has an impossible salary band`);
    assert.ok(job.salaryHigh < 60000, `${job.company} ${job.title} salary is not a monthly RM figure`);
  }
}
/* Service work must not be quoted at software money. */
assert.ok(server.rankedJobs.every(j => j.salaryHigh < 12000),
  "service-family pay must stay in a service-family band");

/* ── Fit is derived, not fixed ────────────────────────────────── */

const noEvidence = fitFor(dev, devCorpus.rankedJobs[0]);
const withEvidence = fitFor(
  { ...dev, evidence: [{ id: "e1", kind: "certificate", title: "AWS", source: "aws", trust: "Verified", addedAt: "now" }] },
  devCorpus.rankedJobs[0],
);
assert.ok(withEvidence > noEvidence, "adding evidence must raise fit");

const mismatch = fitFor(server.rankedJobs[0] ? profile({ currentRole: "Barista", targetRole: "Barista" }) : dev, devCorpus.rankedJobs[0]);
assert.ok(mismatch < withEvidence, "an unrelated profile must not fit a software posting as well");

assert.ok(devCorpus.rankedJobs[0].fit >= devCorpus.rankedJobs.at(-1).fit, "jobs must be ranked best fit first");

/* ── Lookup by id ─────────────────────────────────────────────── */

assert.equal(jobById(dev, devCorpus.rankedJobs[0].id)?.id, devCorpus.rankedJobs[0].id);
assert.equal(jobById(dev, "does-not-exist"), undefined);
assert.equal(jobById(dev, null), undefined);

/* Every posting carries the interview set the coach needs. */
for (const fam of [devCorpus, analyst, server]) {
  for (const job of fam.rankedJobs) {
    assert.equal(job.interview.questions.length, 4, `${job.title} needs four interview questions`);
    assert.ok(job.interview.aiFrame.length > 40, `${job.title} needs a real framing note`);
    assert.ok(job.interview.activeQ < job.interview.questions.length);
    assert.ok(job.requirements.length >= 3, `${job.title} needs stated requirements`);
  }
}

/* ── Determinism ──────────────────────────────────────────────── */

assert.deepEqual(corpusFor(dev), devCorpus, "the same profile must produce the same corpus");

console.log("careerCorpus tests passed");

/* ── The six pages must not re-grow a persona ─────────────────── */

/* These pages each used to hold their own hardcoded candidate. The
   corpus removed it; this catches it coming back. Comments are stripped
   first so the notes explaining what was removed do not trip the check. */

import { readFile } from "node:fs/promises";

const WIRED_PAGES = [
  "src/app/pages/DecisionLab.tsx",
  "src/app/pages/JobMatchTracker.tsx",
  "src/app/pages/ApplicationPrep.tsx",
  "src/app/pages/InterviewCoach.tsx",
  "src/app/pages/CareerEvidence.tsx",
];

const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const PERSONA = ["Jordan Kim", "jordan.kim", "University of Malaya", "Stripe", "SuperAI"];

for (const page of WIRED_PAGES) {
  const src = stripComments(await readFile(page, "utf8"));
  for (const term of PERSONA) {
    assert.ok(!src.includes(term), `${page} must not hardcode "${term}"`);
  }
  assert.ok(
    src.includes("useCareerProfile"),
    `${page} must read the scanned profile rather than a local constant`,
  );
}

/* PositionSkillGraph takes its orbit from the posting it is given, so it
   must no longer carry a table of company-position keys. */
const graph = stripComments(await readFile("src/app/pages/PositionSkillGraph.tsx", "utf8"));
assert.ok(!graph.includes("maybank|Data Analyst"), "PositionSkillGraph must not key off fixed postings");

console.log("page-wiring assertions passed");
