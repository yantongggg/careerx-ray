/* ────────────────────────────────────────────────────────────────
   What-If — argue a career decision both ways.

   Same contract as analyze-resume: the key lives in the Vercel
   environment, and a missing key returns 503 so the client can fall
   back to its local rule engine rather than showing an error. The
   product has to work with no key configured.

   Nothing here is stored. The profile summary is sent with the
   question and discarded when the response returns.
   ──────────────────────────────────────────────────────────────── */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";

const VERDICT_TOOL = {
  name: "record_comparison",
  description: "Record a structured comparison of the options the user is weighing.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string",
        description: "Two or three sentences answering the question directly. Lead with the answer.",
      },
      options: {
        type: "array",
        description: "One entry per option the user is weighing, in the order they raised them.",
        items: {
          type: "object" as const,
          properties: {
            label: { type: "string", description: "The option, named as the user named it." },
            alignment: {
              type: "number",
              description: "0–100: how well this moves them toward their stated target role.",
            },
            skillGain: { type: "string", description: "What they would actually learn." },
            payOutlook: { type: "string", description: "Pay effect, in monthly RM where a figure is sensible." },
            distanceToTarget: {
              type: "string",
              description: "Whether this shortens or lengthens the path to their target role, and by roughly how long.",
            },
            longTerm: { type: "string", description: "Where this leaves them in five years." },
            risk: { type: "string", description: "The honest downside. Never leave this empty." },
          },
          required: ["label", "alignment", "skillGain", "payOutlook", "distanceToTarget", "longTerm", "risk"],
        },
      },
      recommendation: {
        type: "string",
        description: "Which option, and the single reason that decides it.",
      },
      wouldChangeTheAnswer: {
        type: "string",
        description: "The one fact that, if different, would flip the recommendation.",
      },
    },
    required: ["summary", "options", "recommendation", "wouldChangeTheAnswer"],
  },
};

const SYSTEM_PROMPT = `You advise on career decisions for a diagnostics product used in Malaysia.

Rules:
- Answer the question that was asked. Do not broaden it.
- Salary figures are monthly RM, never annual. Malaysian market rates only.
- Be specific about the downside of every option, including the one you recommend. An option with no stated risk reads as a sales pitch.
- Where the user's profile does not tell you something you need, say what is missing rather than assuming it.
- Do not tell them to "follow their passion" or offer motivational filler. They came for a comparison.
- If the options are genuinely close, say so instead of manufacturing a winner.
- Call record_comparison exactly once.`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI comparison is not configured on this deployment." });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const question: string = body?.question ?? "";
  const profile = body?.profile ?? {};

  if (!question || question.trim().length < 8) {
    res.status(400).json({ error: "Ask a question with a bit more in it." });
    return;
  }

  const context = [
    profile.currentRole ? `Current role: ${profile.currentRole}` : null,
    profile.targetRole ? `Target role: ${profile.targetRole}` : null,
    profile.experience ? `Experience: ${profile.experience}` : null,
    profile.salaryRange ? `Current pay: ${profile.salaryRange}` : null,
    profile.archetypeName ? `Career archetype: ${profile.archetypeName}` : null,
    profile.skills?.length ? `Skills on file: ${profile.skills.slice(0, 20).join(", ")}` : null,
    profile.evidenceCount !== undefined ? `Verified evidence items: ${profile.evidenceCount}` : null,
  ].filter(Boolean).join("\n");

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools: [VERDICT_TOOL],
      tool_choice: { type: "tool", name: VERDICT_TOOL.name },
      messages: [{
        role: "user",
        content: `Their profile:\n${context || "(no profile on file)"}\n\nTheir question:\n${question.slice(0, 2000)}`,
      }],
    });

    const toolUse = message.content.find(
      (block: any) => block.type === "tool_use" && block.name === VERDICT_TOOL.name,
    ) as any;

    if (!toolUse) {
      res.status(502).json({ error: "The model did not return a structured comparison." });
      return;
    }

    res.status(200).json(toolUse.input);
  } catch (err: any) {
    res.status(502).json({ error: err?.message ?? "Comparison failed." });
  }
}
