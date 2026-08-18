/* ────────────────────────────────────────────────────────────────
   Resume field extraction — the only server-side code in the project.

   The PDF itself never reaches here: text extraction happens in the
   browser and only the extracted text is posted. The API key lives in
   the Vercel environment and is never shipped to the client.

   If ANTHROPIC_API_KEY is not configured, this returns 503 and the
   client falls back to its local rule engine. That is the intended
   behaviour, not a failure — the product must still work offline.
   ──────────────────────────────────────────────────────────────── */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";

const EXTRACTION_TOOL = {
  name: "record_resume_fields",
  description: "Record the fields extracted from a resume.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "The candidate's full name." },
      email: { type: "string" },
      phone: { type: "string" },
      currentTitle: { type: "string", description: "Their most recent job title." },
      yearsExperience: {
        type: "number",
        description: "Total years of professional experience, as a number.",
      },
      employers: {
        type: "array",
        items: { type: "string" },
        description: "Organisations they have worked for, most recent first.",
      },
      skills: {
        type: "array",
        items: { type: "string" },
        description:
          "Concrete skills, tools and competencies. Include non-technical ones (negotiation, customer service, food safety) — not every candidate is in tech.",
      },
      education: {
        type: "array",
        items: { type: "string" },
        description: "Qualifications, including SPM, STPM, diploma and TVET.",
      },
      certifications: {
        type: "array",
        items: { type: "string" },
        description: "Named certifications or licences only. Do not infer any that are not stated.",
      },
    },
    required: ["skills", "employers", "education", "certifications"],
  },
};

const SYSTEM_PROMPT = `You extract structured fields from resume text for a career-diagnostics product used in Malaysia.

Rules:
- Only record what the text actually states. Never invent an employer, a certification or a qualification.
- Leave a field out entirely rather than guessing at it.
- Candidates come from every field, not just technology. Treat retail, hospitality, property, trades and administrative experience as seriously as software experience.
- Malaysian qualifications (SPM, STPM, diploma, TVET, matriculation) are real qualifications. Record them.
- Call record_resume_fields exactly once.`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI analysis is not configured on this deployment." });
    return;
  }

  const text = typeof req.body === "string" ? JSON.parse(req.body).text : req.body?.text;
  if (!text || typeof text !== "string" || text.trim().length < 40) {
    res.status(400).json({ error: "No usable resume text was provided." });
    return;
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools: [EXTRACTION_TOOL],
      tool_choice: { type: "tool", name: EXTRACTION_TOOL.name },
      messages: [{ role: "user", content: `Resume text:\n\n${text.slice(0, 24000)}` }],
    });

    const toolUse = message.content.find(
      (block: any) => block.type === "tool_use" && block.name === EXTRACTION_TOOL.name,
    ) as any;

    if (!toolUse) {
      res.status(502).json({ error: "The model did not return structured fields." });
      return;
    }

    res.status(200).json(toolUse.input);
  } catch (err: any) {
    // The client treats any non-200 as "use the rule engine", so the
    // demo degrades quietly rather than breaking.
    res.status(502).json({ error: err?.message ?? "Extraction failed." });
  }
}
