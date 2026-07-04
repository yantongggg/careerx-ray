import { Brain, CheckCircle, MessageSquareText, Mic, Play, Sparkles, Star, Video, Wand2 } from "lucide-react";

const questions = [
  "Walk me through a dashboard you built that changed a business decision.",
  "How would you detect unusual transaction behavior in SQL?",
  "Tell me about a time you influenced stakeholders without authority.",
  "Why do you want to move from analyst work into ML-adjacent analytics?",
];

const feedback = [
  { label: "Evidence quality", score: 82, note: "Good metrics. Add before/after business impact." },
  { label: "Technical depth", score: 74, note: "Explain trade-offs, not just tools used." },
  { label: "Conciseness", score: 68, note: "Answer is strong but 40 seconds too long." },
  { label: "Confidence", score: 79, note: "Clear structure. Stronger closing sentence needed." },
];

export function InterviewCoach() {
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1180px] mx-auto space-y-6">
        <div className="bg-white border border-border rounded-2xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Video size={13} /> Live Coaching / Interview Rehearsal
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Practice for Maybank&apos;s Data Analyst interview.</h1>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 max-w-2xl">
                The coach turns your resume, job description, and X-Ray gaps into likely questions, then scores your answer like a hiring panel.
              </p>
            </div>
            <div className="bg-slate-950 text-white rounded-xl p-4 min-w-[210px]">
              <p className="text-xs text-slate-400">Interview readiness</p>
              <p className="text-3xl font-bold mt-1">71<span className="text-base text-slate-400">%</span></p>
              <p className="text-xs text-amber-300 mt-1">Ready after 2 focused rehearsals</p>
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
              {questions.map((q, i) => (
                <button key={q} className={`w-full flex gap-3 px-5 py-4 text-left hover:bg-muted/50 ${i === 1 ? "bg-blue-50/70" : ""}`}>
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
                <p className="text-xs text-muted-foreground mt-0.5">Question 2 · SQL case interview</p>
              </div>
              <button className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
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
                  <p className="text-sm text-slate-100 leading-relaxed mt-1">How would you detect unusual transaction behavior in SQL?</p>
                </div>
              </div>
              <button className="mt-5 inline-flex items-center gap-2 bg-white text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold">
                <Play size={14} /> Play sample answer
              </button>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {feedback.map(f => (
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
                Start with the business goal, define baseline behavior by segment, use rolling windows and z-scores to flag anomalies, then explain how you would validate false positives with fraud ops.
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
