import { useState } from "react";
import { demoToast } from "./toast";
import { Brain, CheckCircle, MessageSquareText, Mic, Play, Sparkles, Star, Video, Wand2 } from "lucide-react";

interface RoleCoachData {
  title: string;
  company: string;
  readiness: number;
  readyAfter: string;
  questions: string[];
  feedback: { label: string; score: number; note: string }[];
  aiFrame: string;
  activeQ: number;
  promptLabel: string;
}

const ROLE_DATA: Record<string, RoleCoachData> = {
  "maybank-da": {
    title: "Data Analyst, Digital Banking",
    company: "Maybank",
    readiness: 71,
    readyAfter: "Ready after 2 focused rehearsals",
    questions: [
      "Walk me through a dashboard you built that changed a business decision.",
      "How would you detect unusual transaction behavior in SQL?",
      "Tell me about a time you influenced stakeholders without authority.",
      "Why do you want to move from analyst work into ML-adjacent analytics?",
    ],
    feedback: [
      { label: "Evidence quality", score: 82, note: "Good metrics. Add before/after business impact." },
      { label: "Technical depth", score: 74, note: "Explain trade-offs, not just tools used." },
      { label: "Conciseness", score: 68, note: "Answer is strong but 40 seconds too long." },
      { label: "Confidence", score: 79, note: "Clear structure. Stronger closing sentence needed." },
    ],
    aiFrame: "Start with the business goal, define baseline behavior by segment, use rolling windows and z-scores to flag anomalies, then explain how you would validate false positives with fraud ops.",
    activeQ: 1,
    promptLabel: "Question 2 · SQL case interview",
  },
  "grab-ae": {
    title: "Analytics Engineer",
    company: "Grab",
    readiness: 58,
    readyAfter: "Ready after 3 focused rehearsals",
    questions: [
      "How do you ensure data quality in a dbt pipeline?",
      "Explain your approach to designing a star schema for ride-hailing metrics.",
      "Tell me about a time you debugged a data pipeline under production pressure.",
      "How would you handle conflicting metric definitions between product and finance?",
    ],
    feedback: [
      { label: "Evidence quality", score: 70, note: "Add specific pipeline scale numbers (rows/day)." },
      { label: "Technical depth", score: 81, note: "Strong dbt knowledge. Add BigQuery optimization." },
      { label: "Conciseness", score: 72, note: "Good structure but needs tighter transitions." },
      { label: "Confidence", score: 65, note: "Hesitation on Spark questions. Practice those." },
    ],
    aiFrame: "Lead with the business metric the pipeline serves, walk through your dbt model layers (staging → marts), then explain testing strategy: schema tests, freshness checks, and how you alert on failures.",
    activeQ: 0,
    promptLabel: "Question 1 · dbt pipeline design",
  },
  "petronas-pm": {
    title: "AI Product Analyst",
    company: "Petronas Digital",
    readiness: 44,
    readyAfter: "Ready after 4 focused rehearsals",
    questions: [
      "How would you measure whether an ML model is delivering business value?",
      "Walk us through how you'd prioritize features for an AI-powered dashboard.",
      "Describe a time you translated technical findings for non-technical stakeholders.",
      "What's your approach to running A/B tests on an AI recommendation engine?",
    ],
    feedback: [
      { label: "Evidence quality", score: 55, note: "Need concrete AI product metrics examples." },
      { label: "Technical depth", score: 62, note: "Strengthen ML evaluation vocabulary." },
      { label: "Conciseness", score: 75, note: "Good brevity. Add more STAR structure." },
      { label: "Confidence", score: 58, note: "Product sense is emerging. Practice case studies." },
    ],
    aiFrame: "Frame around business KPIs the model impacts (not just accuracy), explain your monitoring approach for model drift, and describe how you'd communicate trade-offs between precision and recall to stakeholders.",
    activeQ: 0,
    promptLabel: "Question 1 · ML product evaluation",
  },
};

const DEFAULT_DATA: RoleCoachData = ROLE_DATA["maybank-da"];

interface InterviewCoachProps {
  jobId?: string;
}

export function InterviewCoach({ jobId }: InterviewCoachProps) {
  const [pickedQ, setPickedQ] = useState<number | null>(null);
  const data = (jobId && ROLE_DATA[jobId]) || DEFAULT_DATA;

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1180px] mx-auto space-y-6">
        <div className="bg-white border border-border rounded-2xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Video size={13} /> Live Coaching / Interview Rehearsal
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Practice for {data.company}&apos;s {data.title.split(",")[0]} interview.</h1>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 max-w-2xl">
                The coach turns your resume, job description, and X-Ray gaps into likely questions, then scores your answer like a hiring panel.
              </p>
            </div>
            <div className="bg-slate-950 text-white rounded-xl p-4 min-w-[210px]">
              <p className="text-xs text-slate-400">Interview readiness</p>
              <p className="text-3xl font-bold mt-1">{data.readiness}<span className="text-base text-slate-400">%</span></p>
              <p className="text-xs text-amber-300 mt-1">{data.readyAfter}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-6">
          <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Brain size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Likely questions</h2>
            </div>
            <div className="divide-y divide-border">
              {data.questions.map((q, i) => (
                <button key={q} onClick={() => setPickedQ(i)} className={`w-full flex gap-3 px-5 py-4 text-left hover:bg-muted/50 ${i === (pickedQ ?? data.activeQ) ? "bg-blue-50/70" : ""}`}>
                  <span className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                  <span className="text-sm font-medium text-foreground">{q}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-border rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-foreground">Rehearsal room</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{data.promptLabel}</p>
              </div>
              <button onClick={() => demoToast("Recording… answer aloud — AI scores structure, clarity, and confidence")} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                <Mic size={14} /> Record answer
              </button>
            </div>

            <div className="bg-slate-950 text-white rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <MessageSquareText size={17} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Prompt</p>
                  <p className="text-sm text-slate-100 leading-relaxed mt-1">{data.questions[pickedQ ?? data.activeQ]}</p>
                </div>
              </div>
              <button onClick={() => demoToast("Playing a top-scoring sample answer for this question\u2026")} className="mt-5 inline-flex items-center gap-2 bg-white text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold">
                <Play size={14} /> Play sample answer
              </button>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {data.feedback.map(f => (
                <div key={f.label} className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-foreground">{f.label}</p>
                    <p className="text-sm font-bold text-primary">{f.score}</p>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${f.score}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-2">
                <Wand2 size={13} /> AI suggested answer frame
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {data.aiFrame}
              </p>
            </div>
          </section>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {["Resume story alignment", "Behavioral STAR bank", "Technical drill set"].map((item, i) => (
            <div key={item} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              {i === 0 ? <CheckCircle size={17} className="text-emerald-500" /> : i === 1 ? <Star size={17} className="text-amber-500" /> : <Sparkles size={17} className="text-primary" />}
              <p className="font-semibold text-foreground mt-3">{item}</p>
              <p className="text-xs text-muted-foreground mt-1">Generated from your profile, target job, and verified career evidence.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
