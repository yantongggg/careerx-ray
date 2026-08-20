/* ────────────────────────────────────────────────────────────────
   Compass Tapir — the general career assistant.

   What-If Lab compares two named options and returns a structured
   verdict. This is the open-ended one: any career question, answered
   in plain prose against whatever the scan already knows.

   Same contract as the other two functions: the key lives in the Vercel
   environment, and a missing key returns 503 so the client can answer
   from its own on-device engine instead of showing an error.

   Nothing is stored. The profile summary travels with the request and
   is discarded when the response returns.
   ──────────────────────────────────────────────────────────────── */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";
const MAX_TURNS = 12;

const SYSTEM_PROMPT = `You are the Compass Tapir, the career assistant inside CareerX-Ray, a career-diagnostics product used in Malaysia.

Who you are talking to: a Malaysian jobseeker, often a fresh graduate or someone in their first few roles. Their scan results are given to you below. Use them — a generic answer they could have got anywhere is a failure.

How to answer:
- Answer in 2–5 sentences unless they ask for detail. This is a chat panel, not a report.
- Salary figures are monthly RM, never annual. Malaysian market rates only.
- Ground the answer in their actual scan. If they ask "am I ready?", answer against their real gaps, not in general.
- When their scan does not contain what you need, say so and ask the one question that would let you answer.
- Never invent a fact about them — an employer, a certification, a score. If it is not in the profile below, you do not know it.
- No motivational filler. No "follow your passion". They came for a straight answer.
- Malaysian qualifications (SPM, STPM, diploma, TVET) are real qualifications. Never treat them as lesser.
- If they ask something outside careers, answer briefly and steer back.

Point them at the right page when it helps: X-Ray Dashboard (current risks), Career DNA (their archetype), Blind Spots (gap to target), Decision Lab (three futures), What-If Lab (compare two specific offers), Career Prescription (30/90-day plan), Career Evidence (proof), Jobs (matched roles), Interview Coach (rehearsal), Offer Decision AI (comparing offers in hand).`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "The assistant is not configured on this deployment." });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const turns = Array.isArray(body?.messages) ? body.messages : [];
  const profile = body?.profile ?? {};
  const page = typeof body?.page === "string" ? body.page : "";

  if (!turns.length) {
    res.status(400).json({ error: "No message was sent." });
    return;
  }

  const context = [
    profile.name ? `Name: ${profile.name}` : null,
    profile.currentRole ? `Current role: ${profile.currentRole}` : null,
    profile.targetRole ? `Target role: ${profile.targetRole}` : null,
    profile.experience ? `Experience: ${profile.experience}` : null,
    profile.salaryRange ? `Current pay: ${profile.salaryRange}` : null,
    profile.archetypeName ? `Career archetype: ${profile.archetypeName}` : null,
    profile.dna ? `DNA dimensions: ${profile.dna}` : null,
    profile.careerHealth !== undefined ? `Career Health Score: ${profile.careerHealth}/100` : null,
    profile.risks?.length ? `Open risks: ${profile.risks.join("; ")}` : "Open risks: none recorded",
    profile.gaps?.length ? `Gaps to target: ${profile.gaps.join("; ")}` : null,
    profile.skills?.length ? `Skills on file: ${profile.skills.slice(0, 25).join(", ")}` : "Skills on file: none extracted",
    profile.evidenceCount !== undefined ? `Evidence items: ${profile.evidenceCount}` : null,
    profile.topJob ? `Strongest job match: ${profile.topJob}` : null,
    page ? `They are currently on the ${page} page.` : null,
  ].filter(Boolean).join("\n");

  const messages = turns
    .slice(-MAX_TURNS)
    .filter((m: any) => m?.role && typeof m?.content === "string" && m.content.trim())
    .map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 4000),
    }));

  if (!messages.length || messages[0].role !== "user") {
    res.status(400).json({ error: "The conversation must start with a message from the user." });
    return;
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      system: `${SYSTEM_PROMPT}\n\nTheir scan:\n${context || "(no scan on file yet)"}`,
      messages,
    });

    const text = message.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
      .trim();

    if (!text) {
      res.status(502).json({ error: "The assistant returned nothing." });
      return;
    }

    res.status(200).json({ reply: text });
  } catch (err: any) {
    res.status(502).json({ error: err?.message ?? "The assistant failed to answer." });
  }
}
