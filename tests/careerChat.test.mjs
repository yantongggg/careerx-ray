/* The on-device engine is what answers whenever no API key is set, and
   it cannot be exercised by running the dev server because vite serves
   index.html for /api/*. So it gets tested here.

   The assertions that matter are the honesty ones: it must not invent
   a fact about someone, and it must admit when a question is outside
   what the scan contains. */

import assert from "node:assert/strict";
import { loadTs } from "./loadTs.mjs";

const { localChatReply, starterQuestions } = await loadTs("src/app/lib/careerChat.ts");
const { corpusFor } = await loadTs("src/app/lib/careerCorpus.ts");
const { deriveRisks, deriveScorecard, deriveTargetGaps } = await loadTs("src/app/lib/careerRisk.ts");
const { EMPTY_PROFILE } = await loadTs("src/app/lib/profileTypes.ts");

const ctxFor = (over) => {
  const profile = { ...EMPTY_PROFILE, ...over };
  return {
    profile,
    corpus: corpusFor(profile),
    risks: deriveRisks(profile),
    targetGaps: deriveTargetGaps(profile),
    scorecard: deriveScorecard(profile),
  };
};

const dev = ctxFor({
  currentRole: "Junior Developer",
  targetRole: "Software Engineer",
  salaryRange: "RM 4,000 – 5,000",
  experience: "1 year",
  archetypeName: "Forge Beaver",
  scannedAt: "2026-08-20",
  dnaScores: { Technical: 78, Execution: 71, Strategic: 52, Innovation: 60, Leadership: 44, Communication: 63 },
});

const ask = (ctx, q) => localChatReply(ctx, q);

/* ── It must not answer about a scan that does not exist ──────── */

const blank = ctxFor({});
const blankAnswer = ask(blank, "What's my biggest risk?");
assert.match(blankAnswer, /not run a scan|nothing about you/i,
  "with no scan it must say so rather than answer generically");
/* But it still greets and explains itself. */
assert.doesNotMatch(ask(blank, "hi"), /not run a scan/i, "a greeting must not be refused");
assert.ok(ask(blank, "what can you do?").length > 40, "it must be able to explain itself unscanned");

/* ── Intents route to real derived data ──────────────────────── */

const cases = [
  ["What's my biggest risk right now?", /risk/i],
  ["am I underpaid?", /RM/],
  ["what skills am I missing?", /Software Engineer|gap/i],
  ["what should I do first?", /Prescription|evidence|register/i],
  ["which job am I closest to?", /%/],
  ["what's my archetype?", /Forge Beaver/],
  ["how do I prepare for interviews?", /Interview Coach/],
  ["should I switch careers?", /Software Engineer/],
  ["what's my score?", /100/],
  ["do I have enough evidence?", /evidence|verified|word alone/i],
];

for (const [q, expect] of cases) {
  const answer = ask(dev, q);
  assert.ok(answer.length > 40, `"${q}" produced too short an answer`);
  assert.match(answer, expect, `"${q}" did not route to the right data`);
}

/* ── It must never leak another persona ───────────────────────── */

const BANNED = ["Jordan Kim", "Maybank", "Stripe", "dbt", "Tableau", "Data Analyst"];
for (const [q] of cases) {
  const answer = ask(dev, q);
  for (const term of BANNED) {
    assert.ok(!answer.includes(term), `"${q}" leaked "${term}" to a software profile`);
  }
}

/* ── The answer follows the person, not the question ──────────── */

const chef = ctxFor({
  currentRole: "Chef / Cook",
  targetRole: "Restaurant Manager",
  salaryRange: "RM 2,600",
  experience: "4 years",
  archetypeName: "Signal Owl",
  scannedAt: "2026-08-20",
});
const chefAnswer = ask(chef, "should I switch careers?");
assert.match(chefAnswer, /Restaurant Manager/, "it must name this person's own target");
assert.ok(!/Software Engineer/.test(chefAnswer), "it must not offer a software path to a chef");

/* Service-sector pay must not be quoted at software rates. */
const chefPay = ask(chef, "am I paid enough?");
const figures = [...chefPay.matchAll(/RM ([\d,]+)/g)].map(m => Number(m[1].replace(/,/g, "")));
assert.ok(figures.every(n => n < 15000), `service pay quoted too high: ${figures.join(", ")}`);

/* ── Out-of-scope questions are admitted, not guessed ─────────── */

const offTopic = ask(dev, "what's the weather in Penang tomorrow?");
assert.match(offTopic, /on-device|outside it/i, "it must admit an out-of-scope question");
assert.ok(!/sunny|rain|forecast|\d+°/i.test(offTopic), "it must not invent an answer it cannot have");

/* ── Determinism ──────────────────────────────────────────────── */

assert.equal(ask(dev, "What's my biggest risk right now?"), ask(dev, "What's my biggest risk right now?"));

/* ── Starters are real questions ──────────────────────────────── */

const starters = starterQuestions(dev.profile);
assert.equal(starters.length, 4);
assert.ok(starters.some(s => s.includes("Software Engineer")), "a starter must name their target role");
for (const s of starters) {
  assert.ok(s.endsWith("?"), `starter is not a question: ${s}`);
  /* Every offered starter must actually be answerable. */
  assert.ok(ask(dev, s).length > 40, `starter has no real answer: ${s}`);
}

/* ── It must know the product, not only the person ────────────── */

const productQuestions = [
  ["What is Living Portfolio?", /portfolio/i],
  ["Is my resume safe?", /browser|never leaves/i],
  ["What does verified mean?", /issuer/i],
  ["How does Gap to Target work?", /target|gap/i],
  ["What is Decision Lab?", /three futures|futures/i],
  ["How do you calculate this?", /derived|working|arithmetic|inputs/i],
  ["What is the employer side?", /employer|signal/i],
];
for (const [q, expect] of productQuestions) {
  const answer = ask(dev, q);
  assert.match(answer, expect, `"${q}" was not answered from the product knowledge`);
  assert.doesNotMatch(answer, /outside it|on-device right now/i,
    `"${q}" fell through to the fallback — the assistant should know its own product`);
}

/* Questions about the user must not be hijacked by a shared word.
   "portfolio" appears in both a product question and an evidence one. */
assert.match(ask(dev, "do I have enough evidence?"), /evidence|word alone|verified/i);
assert.match(ask(dev, "what are my gaps?"), /Data Science Manager|gap/i);
assert.match(ask(dev, "am I underpaid?"), /RM/);

console.log("careerChat tests passed");
