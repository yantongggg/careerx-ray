/* The handle parser is the part that runs before any network call, so
   it is the part worth testing — a bad parse sends someone a 404 for an
   account that exists. */

import assert from "node:assert/strict";
import { loadTs } from "./loadTs.mjs";

const { parseGithubHandle, repoEvidence, signalCaveat, yearsActive } =
  await loadTs("src/app/lib/githubSignal.ts");

/* ── Whatever they paste ──────────────────────────────────────── */

for (const input of [
  "yantongggg",
  "@yantongggg",
  "github.com/yantongggg",
  "https://github.com/yantongggg",
  "https://github.com/yantongggg/",
  "https://www.github.com/yantongggg/careerx-ray",
]) {
  assert.equal(parseGithubHandle(input), "yantongggg", `failed to parse: ${input}`);
}

for (const bad of ["", "   ", "not a url at all!", "https://linkedin.com/in/someone"]) {
  assert.equal(parseGithubHandle(bad), null, `should have rejected: ${bad}`);
}

/* ── Repositories become evidence, at the right trust level ───── */

const signal = {
  handle: "yantongggg", name: null, url: "https://github.com/yantongggg", bio: null,
  publicRepos: 23, followers: 8, createdAt: "2023-01-01T00:00:00Z",
  languages: [{ name: "TypeScript", count: 9 }],
  topRepos: [
    { name: "careerx-ray", description: "Career diagnostics", language: "TypeScript", stars: 0, pushedAt: new Date().toISOString(), url: "https://github.com/yantongggg/careerx-ray" },
    { name: "portfolio", description: null, language: "HTML", stars: 0, pushedAt: new Date().toISOString(), url: "https://github.com/yantongggg/portfolio" },
  ],
  activeCount: 3, fetchedAt: new Date().toISOString(),
};

const evidence = repoEvidence(signal);
assert.equal(evidence.length, 2);
assert.ok(
  evidence.every(e => e.trust === "corroborated"),
  "a public repo is corroborated — checkable by anyone, confirmed by nobody",
);
assert.ok(
  evidence.every(e => e.source.startsWith("https://github.com/")),
  "every item must carry the URL that makes it checkable",
);
assert.ok(evidence[0].label.includes("careerx-ray"));
/* A repo with no description still needs a usable label. */
assert.ok(evidence[1].label.length > 0);
assert.deepEqual(evidence[0].skills, ["TypeScript"]);

/* ── The caveat travels with the number ───────────────────────── */

assert.match(signalCaveat(signal), /not ability/i,
  "an activity count must never be presented as a measure of ability");
assert.match(signalCaveat({ ...signal, activeCount: 0 }), /not a verdict|private/i,
  "silence must not read as a verdict — private work is invisible here");

assert.ok(yearsActive(signal) >= 2, "years on GitHub should count from the join date");

console.log("githubSignal tests passed");
