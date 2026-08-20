import { useState } from "react";
import { demoToast } from "../state/toast";
import { Brain, CheckCircle, MessageSquareText, Mic, Play, Sparkles, Star, Video, Wand2 } from "lucide-react";
import { NextStep } from "../state/stages";
import { useCareerProfile } from "../state/careerProfile";
import { corpusFor, fitFor, type CorpusJob } from "../lib/careerCorpus";
import type { CareerProfile } from "../lib/profileTypes";

/* ────────────────────────────────────────────────────────────────
   The rehearsal is built from the posting the user picked.

   ROLE_DATA used to key three fixed data-analytics jobs, so anyone
   rehearsing for anything else was asked about dbt pipelines and star
   schemas. Questions now come from the corpus posting, and the panel
   scores come from the user's own DNA and evidence rather than four
   numbers typed into the file.
   ──────────────────────────────────────────────────────────────── */

interface PanelScore {
  label: string;
  score: number;
  note: string;
}

const clamp = (n: number) => Math.max(35, Math.min(95, Math.round(n)));

/** What a panel would say about this person before they open their mouth. */
function panelScores(profile: CareerProfile): PanelScore[] {
  const dim = (name: string) => profile.dnaScores[name] ?? 55;
  const evidence = profile.evidence.length;

  const evidenceScore = clamp(48 + evidence * 8 + (profile.resume ? 10 : 0));
  const technical = clamp(dim("Technical") * 0.7 + dim("Execution") * 0.3);
  const conciseness = clamp(dim("Communication") * 0.8 + 12);
  const confidence = clamp(dim("Leadership") * 0.5 + dim("Communication") * 0.5);

  return [
    {
      label: "Evidence quality", score: evidenceScore,
      note: evidence === 0
        ? "Nothing verified yet — every claim currently rests on your word."
        : `${evidence} item${evidence > 1 ? "s" : ""} on file. Name the before and after, not just the tool.`,
    },
    {
      label: "Technical depth", score: technical,
      note: technical >= 75
        ? "Strong. Spend your airtime on trade-offs rather than tool lists."
        : "Explain why you chose an approach over the alternative — that is what gets probed.",
    },
    {
      label: "Conciseness", score: conciseness,
      note: conciseness >= 75
        ? "Well structured. Land the closing sentence rather than trailing off."
        : "Answer, then stop. Most rejected answers are right but forty seconds too long.",
    },
    {
      label: "Confidence", score: confidence,
      note: confidence >= 75
        ? "Reads as assured. Keep the hedging out of the first sentence."
        : "Open with the answer, then the reasoning. Leading with caveats reads as uncertainty.",
    },
  ];
}

/** How ready this person is for this specific posting. */
function readinessFor(profile: CareerProfile, job: CorpusJob): number {
  return clamp(fitFor(profile, job) * 0.85 + profile.evidence.length * 3);
}

function readyAfter(readiness: number): string {
  const rehearsals = readiness >= 78 ? 1 : readiness >= 62 ? 2 : readiness >= 48 ? 3 : 4;
  return `Ready after ${rehearsals} focused rehearsal${rehearsals > 1 ? "s" : ""}`;
}

interface InterviewCoachProps {
  jobId?: string | null;
  onNavigate?: (page: string) => void;
}

export function InterviewCoach({ jobId, onNavigate }: InterviewCoachProps) {
  const { profile } = useCareerProfile();
  const jobs = corpusFor(profile).rankedJobs;

  const [pickedQ, setPickedQ] = useState<number | null>(null);
  /* Arriving from a job card preselects that job, but the coach is also
     a sidebar destination — landing here with no job used to silently
     show one company's questions with no way to change them. */
  const [roleId, setRoleId] = useState<string>(
    jobId && jobs.some(j => j.id === jobId) ? jobId : jobs[0]?.id ?? "",
  );

  const job = jobs.find(j => j.id === roleId) ?? jobs[0];
  const feedback = panelScores(profile);

  const selectRole = (id: string) => {
    setRoleId(id);
    setPickedQ(null);
  };

  if (!job) return null;

  const readiness = readinessFor(profile, job);
  const data = {
    company: job.company,
    title: job.title,
    readiness,
    readyAfter: readyAfter(readiness),
    questions: job.interview.questions,
    aiFrame: job.interview.aiFrame,
    feedback,
  };
  const activeQ = pickedQ ?? job.interview.activeQ;

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
              <div className="flex flex-wrap gap-2 mt-4">
                {jobs.map(j => {
                  const id = j.id;
                  const active = id === roleId;
                  return (
                    <button
                      key={id}
                      onClick={() => selectRole(id)}
                      className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        active
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      {j.company}
                      <span className={`ml-2 tabular-nums ${active ? "text-blue-200" : "text-muted-foreground"}`}>{readinessFor(profile, j)}%</span>
                    </button>
                  );
                })}
              </div>
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
                <button key={q} onClick={() => setPickedQ(i)} className={`w-full flex gap-3 px-5 py-4 text-left hover:bg-muted/50 ${i === activeQ ? "bg-blue-50/70" : ""}`}>
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
                <p className="text-xs text-muted-foreground mt-0.5">Question {activeQ + 1} of {data.questions.length} · {data.company}</p>
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
                  <p className="text-sm text-slate-100 leading-relaxed mt-1">{data.questions[activeQ]}</p>
                </div>
              </div>
              <button onClick={() => demoToast("Playing a top-scoring sample answer for this question\u2026")} className="mt-5 inline-flex items-center gap-2 bg-white text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold">
                <Play size={14} /> Play sample answer
              </button>
            </div>

            {/* These are the baseline the panel would start you at from
                your evidence — not a score of an answer you haven't given
                yet. Saying so is the difference between a coach and a prop. */}
            <p className="text-xs text-muted-foreground mt-5 mb-2">
              Your expected starting profile for {data.company}, from your evidence. Record an answer and these update.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
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

        <NextStep currentPage="coach" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
