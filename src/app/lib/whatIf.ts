/* ────────────────────────────────────────────────────────────────
   What-If — comparing two moves someone is weighing.

   Two paths produce the same shape. The Vercel function calls the model
   and returns a structured comparison; when no key is configured — or
   when running locally, where vite's SPA fallback swallows /api/* — the
   rule engine below answers from the same benchmark tables the rest of
   the product uses.

   The local answer is thinner than the model's, and the UI says which
   one produced it. It is never presented as an AI answer when it isn't.
   ──────────────────────────────────────────────────────────────── */

import type { CareerProfile } from "./profileTypes";
import { detectRoleFamily, FAMILY_LABEL } from "./roleFamily";
import { automationBase, marketMedian, seniorityBand } from "./careerRisk";
import { corpusFor } from "./careerCorpus";

export interface WhatIfOption {
  label: string;
  /** 0–100: how well this moves them toward their stated target. */
  alignment: number;
  skillGain: string;
  payOutlook: string;
  distanceToTarget: string;
  longTerm: string;
  risk: string;
}

export interface WhatIfAnswer {
  summary: string;
  options: WhatIfOption[];
  recommendation: string;
  wouldChangeTheAnswer: string;
}

/** Which engine produced the answer. The UI shows this; it is not hidden. */
export type WhatIfSource = "ai" | "local";

export interface WhatIfResult {
  answer: WhatIfAnswer;
  source: WhatIfSource;
  /** Why the local engine was used, when it was. */
  note?: string;
}

/* ── Question parsing ────────────────────────────────────────── */

const SPLITTERS = /\s+(?:or|vs\.?|versus|against|and)\s+|,\s*|;\s*|、|，|\s+还是\s+|\s+或者?\s+|\s+和\s+/i;

/* Everything before the options that is framing rather than a choice.
   "hi how if i get maybank and cimb jobs for data science manager" was
   read as one option called "hi how if i get maybank", because the
   greeting, the framing and the shared role were all still attached. */
const LEAD_NOISE = /^(?:hi|hey|hello|halo|hai)[\s,!.]*/i;
const FRAME_NOISE = /^(?:what if|how if|so what if|should i|would i|is it better to|which is better|i (?:got|have|received|am offered)|if i (?:get|got|receive|have))\s+/i;
const OFFER_NOISE = /^(?:an?\s+)?(?:offers?\s+(?:from|at|by)\s+|jobs?\s+(?:from|at)\s+|roles?\s+at\s+|i\s+get\s+(?:an?\s+)?offers?\s+from\s+|i\s+get\s+)/i;

/* A role named once at the end applies to both options, so it is shared
   context rather than one of the choices. */
const TRAILING_CONTEXT = /\s+(?:for|as)\s+(?:an?\s+)?[a-z][a-z\s/]*$/i;

const TRAIL_NOISE = /[?？.!。]+$/;

/**
 * Pull the options out of a free-text question.
 *
 * Deliberately conservative: when it cannot find two options it returns
 * what it found, and the caller asks the user to rephrase rather than
 * inventing a second option.
 */
export function parseOptions(question: string): string[] {
  let cleaned = question.trim().replace(TRAIL_NOISE, "").replace(LEAD_NOISE, "");
  /* Framing stacks — "so what if I get…" is two layers of it. */
  for (let i = 0; i < 3; i++) cleaned = cleaned.replace(FRAME_NOISE, "");
  cleaned = cleaned.replace(TRAILING_CONTEXT, "");

  return cleaned
    .split(SPLITTERS)
    .map(part =>
      part.trim()
        /* "I take the AirAsia offer" arrived with the pronoun still
           attached, so the comparison read "I take the AirAsia edges
           ahead on…". The subject and any article go with the verb. */
        .replace(/^(?:i|we|you)\s+(?:should\s+|would\s+|do\s+)?/i, "")
        .replace(/^(?:take|accept|join|go with|choose|pick|become an?|get)\s+/i, "")
        .replace(/^(?:the|a|an)\s+/i, "")
        .replace(OFFER_NOISE, "")
        .replace(/\s+(?:jobs?|roles?|offers?|position|one)$/i, "")
        .trim(),
    )
    .filter(part => part.length >= 2 && part.length <= 80);
}

/* ── The local engine ────────────────────────────────────────── */

const round100 = (n: number) => Math.round(n / 100) * 100;
const fmtRM = (n: number) => `RM ${n.toLocaleString()}/mo`;

function overlapScore(a: string, b: string): number {
  const stop = new Set(["the", "and", "for", "with", "role", "job", "offer", "position", "at", "in", "a", "an"]);
  const words = (s: string) => new Set(
    s.toLowerCase().split(/[^a-z0-9+#]+/).filter(w => w.length > 2 && !stop.has(w)),
  );
  const wa = words(a), wb = words(b);
  if (!wa.size || !wb.size) return 0;
  let hits = 0;
  wa.forEach(w => { if (wb.has(w)) hits++; });
  return hits / Math.max(wa.size, wb.size);
}

/** Answer from the benchmark tables when the model is unavailable. */
export function localWhatIf(profile: CareerProfile, question: string): WhatIfAnswer {
  /* People name the employer, not the job title — "the AirAsia offer".
     Scored on the words alone that reads as 0% aligned with the target,
     so the posting that IS the target role came back as "lengthens the
     path". Anything that matches a matched posting is resolved to the
     role it is actually for. */
  const postings = corpusFor(profile).rankedJobs;
  const labels = parseOptions(question).map(label => {
    const hit = postings.find(j => {
      const l = label.toLowerCase();
      return j.company.toLowerCase().includes(l) || l.includes(j.company.toLowerCase());
    });
    return hit ? `${hit.position} at ${hit.company}` : label;
  });
  const target = profile.targetRole || "your target role";
  const targetFamily = detectRoleFamily(profile.targetRole, profile.currentRole);
  const band = seniorityBand(profile);
  const nextBand = band === 2 ? 2 : ((band + 1) as 0 | 1 | 2);

  if (labels.length < 2) {
    return {
      summary: `I could only find one option in that question, so there is nothing to compare it against. Phrase it as two choices — "Company A as a ${target} or Company B as something else" — and I can weigh them.`,
      options: [],
      recommendation: "Rephrase with both options named and ask again.",
      wouldChangeTheAnswer: "Naming the second option.",
    };
  }

  const options: WhatIfOption[] = labels.slice(0, 4).map(label => {
    const family = detectRoleFamily(label);
    const sameFamily = family === targetFamily;
    const titleOverlap = overlapScore(label, profile.targetRole || "");

    const alignment = Math.max(15, Math.min(95, Math.round(
      (sameFamily ? 58 : 30) + titleOverlap * 40,
    )));

    const pay = round100(marketMedian(family === "generic" ? targetFamily : family, nextBand));
    const risk = Math.round(automationBase(family === "generic" ? targetFamily : family) * 100);

    return {
      label,
      alignment,
      skillGain: sameFamily
        ? `Skills that compound directly toward ${target} — the same ${FAMILY_LABEL[family].toLowerCase()} foundation you are already building.`
        : `${FAMILY_LABEL[family]} skills. Genuinely valuable, but they build a different foundation from ${target}.`,
      payOutlook: `Around ${fmtRM(pay)} at this level in the Malaysian market.`,
      distanceToTarget: alignment >= 70
        ? `Shortens the path. This is close enough to ${target} that time here counts as time toward it.`
        : alignment >= 45
          ? `Roughly neutral. You would not go backwards, but you would not be closing the gap to ${target} either.`
          : `Lengthens the path. Expect to add a year or more to reaching ${target} if you take this.`,
      longTerm: `Automation exposure in ${FAMILY_LABEL[family].toLowerCase()} sits near ${risk}%. Five years in, that is the number that decides whether the role still exists in its current shape.`,
      risk: sameFamily
        ? `The risk is not the direction, it is the depth — a title that matches ${target} but with narrow scope leaves you no better positioned than today.`
        : `Taking this means explaining a sideways move at your next interview. That is answerable, but you will have to answer it.`,
    };
  });

  const best = [...options].sort((a, b) => b.alignment - a.alignment)[0];
  const runnerUp = [...options].sort((a, b) => b.alignment - a.alignment)[1];
  const close = runnerUp && best.alignment - runnerUp.alignment <= 8;

  return {
    summary: close
      ? `These two are close enough that alignment does not separate them. ${best.label} edges ahead on how directly it feeds ${target}, but not by enough to decide it on its own.`
      : `${best.label} is the stronger move for where you said you are heading. It aligns more directly with ${target} than the alternative does.`,
    options,
    recommendation: close
      ? `Decide on the things this comparison cannot see — the team, the manager, and what you would actually be doing day to day.`
      : `Take ${best.label}. It is the option where the next two years count toward ${target} rather than around it.`,
    wouldChangeTheAnswer: `If ${runnerUp?.label ?? "the other option"} came with materially more scope — owning something end to end rather than a slice of it — that would outweigh the alignment gap.`,
  };
}

/* ── The call ────────────────────────────────────────────────── */

/**
 * Ask the model, and fall back to the local engine on any failure.
 *
 * Failure includes the local dev server, where vite serves index.html
 * for /api/* and the response parses as HTML rather than JSON.
 */
export async function askWhatIf(profile: CareerProfile, question: string): Promise<WhatIfResult> {
  const payload = {
    question,
    profile: {
      currentRole: profile.currentRole,
      targetRole: profile.targetRole,
      experience: profile.experience,
      salaryRange: profile.salaryRange,
      archetypeName: profile.archetypeName,
      skills: profile.resume?.skills ?? [],
      evidenceCount: profile.evidence.length,
    },
  };

  try {
    const res = await fetch("/api/what-if", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return {
        answer: localWhatIf(profile, question),
        source: "local",
        note: res.status === 503
          ? "No API key is configured on this deployment, so this was worked out on-device."
          : "The AI endpoint did not answer, so this was worked out on-device.",
      };
    }

    const data = await res.json();
    if (!data?.options || !Array.isArray(data.options)) {
      return {
        answer: localWhatIf(profile, question),
        source: "local",
        note: "The AI response did not have the expected shape, so this was worked out on-device.",
      };
    }
    return { answer: data as WhatIfAnswer, source: "ai" };
  } catch {
    return {
      answer: localWhatIf(profile, question),
      source: "local",
      note: "The AI endpoint is not reachable from here, so this was worked out on-device.",
    };
  }
}
