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

/* ── What the product is ─────────────────────────────────────
   The assistant used to answer only about the user's own numbers, so
   "what is Career DNA" or "how do you know my salary" fell through to
   "that is outside what I can answer" — questions about the product
   itself, which it should be the best thing in the app at answering.

   One entry per surface and per concept. Written once here rather than
   scraped from the pages, so it says what the thing is for rather than
   repeating its heading. */

interface KbEntry {
  /** Words that mean the user is asking about this. */
  match: RegExp;
  answer: string;
}

const SYSTEM_KB: KbEntry[] = [
  {
    match: /command cent(er|re)|home page|dashboard.*home/i,
    answer: "Command Center is where you land. It shows where you stand, the three things worth doing next, and any live hiring signal that affects your target role. Everything else hangs off the five stages in the sidebar.",
  },
  {
    match: /x.?ray dashboard|career health|health score/i,
    answer: "The X-Ray Dashboard is stage one. Four numbers — Career Health, AI exposure, position against the market, promotion readiness — and four risk categories. Every one of them opens up to show the arithmetic behind it, including where a number could not be measured.",
  },
  {
    match: /gap to target|blind ?spot/i,
    answer: "Gap to Target is the distance between the role you hold and the role you want: what the target asks for, what your evidence covers, and what closes each gap. It was called Blind Spot Detection, but a blind spot needs you to be underestimating something, and we do not measure that — so we renamed it to what it does.",
  },
  {
    match: /decision lab|three (paths|futures)|career path/i,
    answer: "Decision Lab models three futures from your scan: staying where you are, reaching your target role, and the rung past it. Year-by-year pay and automation exposure for each. Below it you can ask about a move we did not model — two specific offers, a pay cut, a detour.",
  },
  {
    match: /prescription|30.?day|90.?day|action plan|treatment/i,
    answer: "Career Prescription is your 30, 90 and 180-day plan, built from your own open risks and ordered by what costs you most. Each task carries the reason it is there. It also names the one credential your matched postings screen on hardest.",
  },
  {
    match: /career evidence|evidence page|timeline/i,
    answer: "Career Evidence is your record. Anything you upload or connect is unpacked into a timeline automatically — employers, qualifications, certifications. Each entry carries how far we can vouch for it, and you can add more by hand.",
  },
  {
    match: /living portfolio|portfolio/i,
    answer: "Living Portfolio writes your CV and a shareable portfolio page from your evidence, and rewrites them whenever the evidence changes. It does not ask you to import anything — it reads what Career Evidence already holds.",
  },
  {
    match: /job match|jobs page|matched (roles|jobs)|apply tracker/i,
    answer: "Jobs ranks matched roles by readiness weighted against how far each one moves you toward your target — so the job you already hold does not sit at the top. From a job you can tailor an application and rehearse that job's interview.",
  },
  {
    match: /application prep|tailor|cover letter|resume draft/i,
    answer: "Application Prep writes a résumé and cover letter against one specific posting, built from your scan rather than a template with the company name swapped in. You reach it by picking a job on the Jobs page.",
  },
  {
    match: /interview coach|rehears/i,
    answer: "Interview Coach rehearses the interview for a specific posting, with questions built from that job's stated requirements. It also scores how you come across before you say anything — evidence quality, technical depth, conciseness, confidence — from your scan.",
  },
  {
    match: /offer (decision|ai)|compare offers/i,
    answer: "Offer Decision AI compares offers you have in hand on five factors — DNA alignment, skill growth, pay, employer trust, life fit — weighted. The DNA part is computed from your own dimensions, which is why the same three offers rank differently for two people.",
  },
  {
    match: /trust|verified|corroborated|self.?declared/i,
    answer: "Three levels. Verified means confirmed against the issuer's own record. Corroborated means publicly checkable — a link anyone can open, or a letter from an employer. Self-declared means your word alone. Verified counts in full; self-declared barely counts at all.",
  },
  {
    match: /how.*(work out|calculat|derive|compute)|where.*number.*from|is this made up|trust.*number/i,
    answer: "Everything on screen is derived from your scan and opens to show its working. No score is a black box: each risk lists the inputs, the threshold and the shortfall. Where we cannot measure something we say so rather than filling the gap — the salary check reads \"not measured\" if you did not give a figure.",
  },
  {
    match: /employer|recruiter|hiring pipeline|company side/i,
    answer: "There is an employer side. When an employer rejects a candidate we ask for one reason, and that reason becomes an anonymised signal — no names on either end. It reaches the next candidate as something to fix before they apply, and the university as something their graduates keep failing on.",
  },
  {
    match: /universit|curriculum|graduate outcome/i,
    answer: "Universities see the aggregated rejection reasons for their graduates, which tells them what to teach rather than what to advertise. It is the same signal the candidate sees, from the other end.",
  },
  {
    match: /privacy|my data|store|pdpa|safe|upload.*safe/i,
    answer: "Your résumé is read in the browser — the file itself never leaves your device. Only the extracted text is sent, and nothing is stored after the response returns. Names and contact details never enter the aggregate market tables.",
  },
  {
    match: /who (made|built)|talentbank|competitor|different from/i,
    answer: "CareerX-Ray is built for the Malaysian market. What makes it different is not the animals — it is that every number opens to show its working, and that a rejection teaches three parties instead of being thrown away.",
  },
  {
    match: /tapir|who are you|what animal are you/i,
    answer: "A Malayan tapir — the animal that finds paths through dense forest, which is roughly the job. The twelve archetype animals are who you are; I am not one of them, I am the guide.",
  },
];

/* "What is Living Portfolio" and "how are my evidence items doing" are
   different questions that share a word. The shape of the sentence is
   what separates them: asking what a thing is, or how it works, or
   whether it is safe, is a question about the product. */
const ASKING_ABOUT_THE_PRODUCT =
  /^\s*(what|which|how|why|who)\b.*\b(is|are|does|do|mean|means|work|works|come from|different)\b|^\s*(explain|tell me about)\b|\bsafe\b|\bprivacy\b|\bwhat is this\b/i;

function kbAnswer(question: string): string | null {
  return SYSTEM_KB.find(e => e.match.test(question))?.answer ?? null;
}

/* ── Intents ─────────────────────────────────────────────────── */

type Intent =
  | "greeting" | "capability"
  | "archetype" | "risk" | "salary" | "gap" | "plan"
  | "jobs" | "evidence" | "interview" | "switch" | "score" | "paths" | "signal"
  | "unknown";

/* Ordered: the first pattern that matches wins, so the more specific
   questions are tested before the broad ones. */
const INTENT_PATTERNS: { intent: Intent; test: RegExp }[] = [
  { intent: "greeting",   test: /^(hi|hey|hello|yo|halo|hai|helo)\b|^(good )?(morning|afternoon|evening)\b/i },
  { intent: "capability", test: /what can you|who are you|what are you|how do you work|apa yang|你是谁|你能|你可以做/i },
  { intent: "signal",     test: /rejected someone|does that affect me|affect me|just rejected|live signal|信号|影响我/i },
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

  /* A question about the product is answered from the knowledge base
     even when it shares a word with a personal intent. Anything else
     falls to the KB only after the personal intents have passed. */
  if (ASKING_ABOUT_THE_PRODUCT.test(question)) {
    const aboutProduct = kbAnswer(question);
    if (aboutProduct) return aboutProduct;
  }
  if (intent === "unknown") {
    const fromKb = kbAnswer(question);
    if (fromKb) return fromKb;
  }

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

    case "signal": {
      /* Answered against their own record rather than repeating the
         signal back at them — the only useful question is whether the
         thing that sank someone else is covered on their profile. */
      const skills = [
        ...(profile.resume?.skills ?? []),
        ...profile.evidence.flatMap(e => e.skills),
      ].map(sk => sk.toLowerCase());
      const words = question.toLowerCase().split(/[^a-z0-9+#]+/).filter(w => w.length > 3);
      const covered = skills.some(sk => words.some(w => sk.includes(w) || w.includes(sk)));

      return covered
        ? `You have that on your profile, so the same reason should not sink you — but check what backs it. If it is self-declared, an employer reading your record sees a claim, not proof, which is close to not having it at all.`
        : `Nothing on your record covers it. That does not mean it will sink you, but it is the reason someone applying for the kind of role you want was turned down this week, and you have nothing to point at. Career Evidence is where you fix that.`;
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
