/* ────────────────────────────────────────────────────────────────
   Does this person have what this posting asks for?

   One question, asked in three places — the fit percentage on a job
   card, the coverage line above the skill graph, and the colour of each
   body in the orbit. It had three implementations, which is why the
   Analytics Engineer posting could read "5 of 6 covered" in the graph
   and "50% covered" on the card directly above it.

   Every word rule lives here now, so those numbers move together.
   ──────────────────────────────────────────────────────────────── */

/* Words that say nothing about a skill. Left in, "Strong SQL" matches on
   "strong" and "Excellent communication" matches on "excel" — against a
   candidate's spreadsheet skill, which is how Excel came to satisfy a
   communication requirement. */
const STOP = new Set([
  "and", "or", "the", "a", "an", "of", "in", "on", "at", "to", "for", "with", "plus",
  "strong", "advanced", "excellent", "excellence", "good", "solid", "proven", "deep",
  "preferred", "equivalent", "experience", "background", "understanding", "knowledge",
  "able", "comfortable", "working", "work", "skills", "relevant", "some",
]);

/* Real words, but so common across postings in one family that a shared
   one proves nothing. Two labels overlapping only on "data" or "team"
   are not the same requirement — "Managed or led a data team" and "Team
   leadership at scale" are the difference between the job someone holds
   and the job they want. */
const GENERIC = new Set(["team", "data", "led", "role", "job", "this", "your", "new", "management"]);

const wordsOf = (text: string) => text.split(/[^a-z0-9+#]+/);

/**
 * The words in a requirement that carry meaning.
 *
 * This used to keep only tokens of four letters or more — a stopword
 * filter that also deletes SQL, dbt, ML, BI, Git and R, the most
 * decisive words in a data posting. "Strong SQL" reduced to "strong"
 * and could never match, so the product told a working SQL analyst to
 * go and learn SQL.
 */
export function tokensOf(label: string): string[] {
  return label.toLowerCase().split(/[^a-z0-9+#]+/).filter(w => w.length >= 2 && !STOP.has(w));
}

/**
 * Whether one word and one skill name refer to the same thing.
 *
 * Substring matching is right for long words — "communication" inside
 * "stakeholder communication" — and wrong for short ones, where "git"
 * sits inside "digital" and "excel" inside "excellent". Short names are
 * compared whole-word.
 */
export function pairs(token: string, skill: string): boolean {
  return token.length >= 4 && skill.length >= 4
    ? skill.includes(token) || token.includes(skill)
    : wordsOf(skill).includes(token) || wordsOf(token).includes(skill);
}

/** Whether anything in `held` satisfies the requirement `label` names. */
export function satisfies(label: string, held: string[]): boolean {
  const lowered = held.filter(h => typeof h === "string" && h.length > 0).map(h => h.toLowerCase());
  return tokensOf(label).some(w => lowered.some(h => pairs(w, h)));
}

/** The words that distinguish one requirement from another. */
export function distinguishing(label: string): string[] {
  return tokensOf(label).filter(w => !GENERIC.has(w));
}

/**
 * Collapse labels that name the same requirement in different words.
 *
 * A posting says "Mentoring experience" in its requirements and
 * "Mentoring" in its strengths; two bodies in one orbit for one idea
 * reads as noise. `against` lets the gap list be measured against what
 * already matched, so the same requirement cannot appear as a strength
 * on one side and a gap on the other.
 */
export function dedupeLabels(labels: string[], against: string[] = []): string[] {
  const kept = [...against];
  const out: string[] = [];
  for (const label of labels) {
    const words = distinguishing(label);
    if (kept.some(k => distinguishing(k).some(w => words.includes(w)))) continue;
    kept.push(label);
    out.push(label);
  }
  return out;
}
