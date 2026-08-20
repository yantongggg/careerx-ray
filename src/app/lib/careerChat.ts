/* ────────────────────────────────────────────────────────────────
   Compass Tapir — the client half.

   Two engines, one shape. The Vercel function answers with the model;
   when no key is configured — or on localhost, where vite's SPA
   fallback swallows /api/* — the on-device engine below answers from
   the same derived data the pages render.

   The on-device engine does not pretend to be general. It answers
   questions about this person's own scan, and when a question is
   outside that it says so rather than guessing. The panel labels which
   engine replied, every time.
   ──────────────────────────────────────────────────────────────── */

import type { CareerProfile } from "./profileTypes";
import type { Corpus } from "./careerCorpus";
import type { Risk, Scorecard, TargetGap } from "./careerRisk";
import { FAMILY_LABEL } from "./roleFamily";

export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export type ChatSource = "ai" | "local";

export interface ChatReply {
  reply: string;
  source: ChatSource;
  /** Why the on-device engine answered, when it did. */
  note?: string;
}

/** Everything the on-device engine is allowed to know. */
export interface ChatContext {
  profile: CareerProfile;
  corpus: Corpus;
  risks: Risk[];
  targetGaps: TargetGap[];
  scorecard: Scorecard;
  /** The page the user is looking at, for "what is this?" questions. */
  page?: string;
}

/* ── Intents ─────────────────────────────────────────────────── */

type Intent =
  | "greeting" | "capability"
  | "archetype" | "risk" | "salary" | "gap" | "plan"
  | "jobs" | "evidence" | "interview" | "switch" | "score" | "paths"
  | "unknown";

/* Ordered: the first pattern that matches wins, so the more specific
   questions are tested before the broad ones. */
const INTENT_PATTERNS: { intent: Intent; test: RegExp }[] = [
  { intent: "greeting",   test: /^(hi|hey|hello|yo|halo|hai|helo)\b|^(good )?(morning|afternoon|evening)\b/i },
  { intent: "capability", test: /what can you|who are you|what are you|how do you work|apa yang|你是谁|你能|你可以做/i },
  { intent: "paths",      test: /why these|three paths|why those|three futures|where.*(paths|futures).*(from|come)|这三条|为什么.*(路|三条)/i },
  { intent: "archetype",  test: /archetype|career dna|\bdna\b|personality|what animal|my type|我的类型|动物/i },
  { intent: "interview",  test: /interview|rehears|mock|apa soalan|面试/i },
  { intent: "salary",     test: /salary|pay|gaji|paid|earn|worth|underpaid|raise|rm ?\d|money|薪水|工资/i },
  { intent: "evidence",   test: /evidence|proof|certificat|cert\b|portfolio|verify|verified|证据|证书/i },
  { intent: "jobs",       test: /job|role|vacanc|apply|applic|hiring|where.*(work|apply)|kerja|工作|职位/i },
  { intent: "switch",     test: /switch|change career|pivot|move into|transition|should i become|转行|转/i },
  { intent: "gap",        test: /gap|missing|lack|weak|what.*(learn|study|improve)|skill|不足|技能|学什么/i },
  { intent: "plan",       test: /plan|next step|what should i do|where.*start|first thing|roadmap|计划|下一步/i },
  { intent: "risk",       test: /risk|\bai\b|automat|replac|safe|danger|future.?proof|风险|被取代/i },
  { intent: "score",      test: /score|health|how am i doing|rating|分数|评分/i },
];

function classify(question: string): Intent {
  for (const { intent, test } of INTENT_PATTERNS) {
    if (test.test(question)) return intent;
  }
  return "unknown";
}

/* ── Answer construction ─────────────────────────────────────── */

const fmtRM = (n: number) => `RM ${n.toLocaleString()}/mo`;

function nothingScanned(): string {
  return "You have not run a scan yet, so I have nothing about you to work from — anything I said would be generic. Run the scan first and then ask me again; it takes about three minutes.";
}

/** Answer from what the app has actually derived about this person. */
export function localChatReply(ctx: ChatContext, question: string): string {
  const { profile, corpus, risks, targetGaps, scorecard } = ctx;
  const scanned = !!profile.scannedAt;
  const current = profile.currentRole || "your current role";
  const target = profile.targetRole || "your target role";
  const intent = classify(question);

  if (!scanned && intent !== "greeting" && intent !== "capability") return nothingScanned();

  switch (intent) {
    case "greeting":
      return scanned
        ? `Hello. I have your scan in front of me — ${current} heading toward ${target}. Ask me about your risks, your gaps, what to do next, or which roles you are closest to.`
        : "Hello. I have not seen your scan yet, so I cannot tell you anything specific about you. Run it and I will have your risks, gaps and matched roles to work from.";

    case "capability":
      return "I am the Compass Tapir. I read your scan — your archetype, your open risks, the gap to your target role, your evidence and your matched jobs — and answer questions about it. I will not invent anything that is not in there; if I do not know, I will say so and tell you what to add.";

    case "archetype": {
      const name = profile.archetypeName;
      return name
        ? `Your archetype is ${name}. It comes from the six dimensions your calibration answers scored, compared against every other archetype's baseline — not from a single question. Career DNA has the full breakdown, and the "How was this worked out?" button there shows the actual method.`
        : "Your archetype has not been decided yet — that happens at the end of the scan.";
    }

    case "risk": {
      if (!risks.length) return `Nothing structural is currently working against you. Your automation exposure sits at ${scorecard.aiExposure.percent}%, which is inside the safe band for ${current}.`;
      const worst = risks[0];
      return `You have ${risks.length} open ${risks.length === 1 ? "risk" : "risks"}. The one that costs you most is ${worst.headline.toLowerCase()} — ${worst.comparison.shortfall || worst.metric}. The fix is: ${worst.fix} The Dashboard shows the full arithmetic behind each one.`;
    }

    case "salary": {
      const b = corpus.futures[1];
      const stated = profile.salaryRange;
      if (!stated) return `You have not told me what you earn, so I cannot say whether you are underpaid. What I can say is that ${target} pays around ${fmtRM(Math.round(b.salary5yr * 0.72))} entering, reaching about ${fmtRM(b.salary5yr)} after five years. Add your current pay to your profile and I will give you the gap.`;
      const salaryRisk = risks.find(r => r.category.toLowerCase().includes("salary"));
      return salaryRisk
        ? `${salaryRisk.comparison.shortfall} ${salaryRisk.fix} For reference, ${target} reaches about ${fmtRM(b.salary5yr)} at the five-year mark.`
        : `Your pay is not the problem — it sits within the band for where you are. The bigger lever is the move to ${target}, which reaches about ${fmtRM(b.salary5yr)} after five years.`;
    }

    case "gap": {
      if (!targetGaps.length) return `Nothing is standing between you and ${target} that the scan can see. That usually means the next step is evidence rather than skills — proof that you can do what you say.`;
      const list = targetGaps.slice(0, 3).map(g => g.skill).join(", ");
      return `The gaps between ${current} and ${target} are: ${list}. The one to close first is ${targetGaps[0].skill} — it is what the postings you match screen on hardest. Blind Spots has the detail on each.`;
    }

    case "plan": {
      const cert = corpus.certification;
      const first = profile.evidence.length === 0
        ? "add one piece of real evidence, because right now every claim on your profile rests on your word alone"
        : `register for ${cert}`;
      return `Start here: ${first}. After that, ship one piece of work that shows ${corpus.targetSkills[0]}, and get one self-declared item verified. Career Prescription lays this out as a 30/90-day plan with the reasoning on each step.`;
    }

    case "jobs": {
      const top = corpus.rankedJobs[0];
      if (!top) return "I do not have matched roles for you yet — that needs a completed scan.";
      return `Your strongest match is ${top.position} at ${top.company}, at ${top.fit}% fit, paying ${fmtRM(top.salaryLow)}–${fmtRM(top.salaryHigh)}. What they will probe hardest is ${top.gaps[0]?.toLowerCase() ?? "your weakest requirement"}. Jobs + Applications has the full ranked list.`;
    }

    case "evidence": {
      const n = profile.evidence.length;
      const verified = profile.evidence.filter(e => e.trust === "verified").length;
      if (n === 0) return `You have nothing on file. That matters more than it sounds: a self-declared skill barely moves your score, so every recommendation you are reading is running on your word alone. The highest-impact thing you could add is ${corpus.evidenceSamples[0]?.title ?? "a verified certificate"}.`;
      return `You have ${n} item${n === 1 ? "" : "s"} on file, ${verified} of them verified. Verified counts in full; self-declared barely counts at all — so verifying what you already have is cheaper than adding more. Career Evidence shows which is which.`;
    }

    case "interview": {
      const top = corpus.rankedJobs[0];
      return top
        ? `For ${top.company}, expect them to open on: "${top.interview.questions[0]}" The thing they will push on is ${top.gaps[0]?.toLowerCase() ?? "your weakest requirement"}, so have an honest answer ready rather than a deflection. Interview Coach runs the full set.`
        : "I need a completed scan before I can tell you what your interviews will look like.";
    }

    case "switch": {
      const t = corpus.futures[1];
      const a = corpus.futures[2];
      return `Moving from ${current} into ${target} takes ${corpus.transitionMonths[0]}–${corpus.transitionMonths[1]} months of real effort, and your ${corpus.foundationSkills[0]} carries over. If the direct move stalls at interview stage, ${a.role} is the easier door into the same place. Decision Lab models all three paths year by year — and if you are weighing two specific offers, What-If Lab compares them properly.`;
    }

    case "paths": {
      const f = corpus.futures;
      if (f.length === 2) {
        return `You have two, not three, because there is no job for you to stay in yet. ${f[0].role} is going straight at it; ${f[1].role} is buying depth first at the cost of two years of earning. Both are generated from the role you said you want — nothing here is a menu we picked for everyone.`;
      }
      return `They come from what you told us, not from a list. ${f[0].role} is you staying where you are — it is on the board because standing still is a real choice with a real cost, ${f[0].aiRiskPct}% automation exposure. ${f[1].role} is the target you set. ${f[2].role} is one rung past it, because most people compare the next job and not the one after. The pay curves come from the Malaysian median for ${FAMILY_LABEL[corpus.family] ?? corpus.family} at your experience band; the automation numbers from your family baseline adjusted for seniority.`;
    }

    case "score":
      return `Your Career Health Score is ${scorecard.careerHealth}/100, automation exposure ${scorecard.aiExposure.percent}%, promotion readiness ${scorecard.promotionReady}%. None of those are opinions — the Dashboard shows the inputs behind each one, and you can argue with the arithmetic.`;

    default:
      return `I am answering on-device right now, which means I can only work from your scan — your risks, gaps, archetype, evidence and matched roles. That question is outside it. Ask me about any of those and I will give you a real answer; or try What-If Lab if you are weighing two specific options.`;
  }
}

/* ── The call ────────────────────────────────────────────────── */

function summarise(ctx: ChatContext) {
  const { profile, corpus, risks, targetGaps, scorecard } = ctx;
  const top = corpus.rankedJobs[0];
  return {
    name: profile.resume?.name,
    currentRole: profile.currentRole,
    targetRole: profile.targetRole,
    experience: profile.experience,
    salaryRange: profile.salaryRange,
    archetypeName: profile.archetypeName,
    dna: Object.entries(profile.dnaScores).map(([k, v]) => `${k} ${Math.round(v)}`).join(", "),
    careerHealth: scorecard.careerHealth,
    risks: risks.map(r => `${r.headline} (${r.comparison.shortfall || r.metric})`),
    gaps: targetGaps.map(g => g.skill),
    skills: profile.resume?.skills ?? [],
    evidenceCount: profile.evidence.length,
    topJob: top ? `${top.position} at ${top.company}, ${top.fit}% fit` : undefined,
  };
}

/**
 * Ask the model, falling back to the on-device engine on any failure.
 *
 * Failure includes the local dev server, where vite returns index.html
 * for /api/* and the body parses as HTML rather than JSON.
 */
export async function askChat(ctx: ChatContext, turns: ChatTurn[]): Promise<ChatReply> {
  const last = [...turns].reverse().find(t => t.role === "user")?.content ?? "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: turns, profile: summarise(ctx), page: ctx.page }),
    });

    if (!res.ok) {
      return {
        reply: localChatReply(ctx, last),
        source: "local",
        note: res.status === 503
          ? "Answered on-device — no API key is configured on this deployment."
          : "Answered on-device — the assistant endpoint did not respond.",
      };
    }

    const data = await res.json();
    if (typeof data?.reply !== "string" || !data.reply.trim()) {
      return {
        reply: localChatReply(ctx, last),
        source: "local",
        note: "Answered on-device — the assistant returned nothing usable.",
      };
    }
    return { reply: data.reply, source: "ai" };
  } catch {
    return {
      reply: localChatReply(ctx, last),
      source: "local",
      note: "Answered on-device — the assistant endpoint is not reachable from here.",
    };
  }
}

/** Openers offered before the user types anything. */
export function starterQuestions(profile: CareerProfile): string[] {
  const target = profile.targetRole || "my target role";
  return [
    "What's my biggest risk right now?",
    `What's stopping me getting ${target}?`,
    "What should I do first?",
    "Which job am I closest to?",
  ];
}
