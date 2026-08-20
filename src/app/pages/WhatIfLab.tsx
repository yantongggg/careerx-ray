import { useState } from "react";
import {
  AlertTriangle, ArrowRight, Bot, CheckCircle, Clock, Cpu, MessagesSquare,
  Send, Sparkles, Target, TrendingUp,
} from "lucide-react";
import { useCareerProfile } from "../state/careerProfile";
import { NextStep } from "../state/stages";
import { askWhatIf, type WhatIfOption, type WhatIfResult } from "../lib/whatIf";

/* ────────────────────────────────────────────────────────────────
   What-If Lab — the questions that do not fit a dashboard.

   Decision Lab models the three paths X-Ray can see from the scan.
   This is for the ones it cannot: a specific offer, a specific pair of
   companies, a move nobody planned for. The answer is argued both
   ways and always names its own downside.

   Where the answer came from — the model or the on-device rule engine
   — is stated on the answer itself rather than implied.
   ──────────────────────────────────────────────────────────────── */

function suggestionsFor(currentRole: string, targetRole: string): string[] {
  const from = currentRole || "where I am";
  const to = targetRole || "my target role";
  return [
    `A startup offers me ${to} or a bank offers me a more senior ${from} — which?`,
    `Should I take a pay cut to move into ${to}, or stay and build evidence first?`,
    `Is a master's degree or two years of ${to} work worth more to me?`,
    `Contract role at higher pay, or permanent role with training — which gets me to ${to} faster?`,
  ];
}

function AlignmentBar({ value }: { value: number }) {
  const tone = value >= 70 ? "#15803D" : value >= 45 ? "#B45309" : "#B91C1C";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: tone }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color: tone }}>{value}%</span>
    </div>
  );
}

function OptionCard({ option, best }: { option: WhatIfOption; best: boolean }) {
  const rows: { icon: typeof Target; label: string; text: string }[] = [
    { icon: Sparkles,   label: "What you'd learn",    text: option.skillGain },
    { icon: TrendingUp, label: "Pay",                 text: option.payOutlook },
    { icon: Target,     label: "Distance to target",  text: option.distanceToTarget },
    { icon: Clock,      label: "Five years out",      text: option.longTerm },
  ];

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${best ? "border-emerald-300 ring-1 ring-emerald-100" : "border-border"}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground leading-snug">{option.label}</h3>
        {best && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle size={10} /> Stronger
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted-foreground mb-1.5">Alignment with your target</p>
        <AlignmentBar value={option.alignment} />
      </div>

      <div className="mt-4 space-y-3">
        {rows.map(r => (
          <div key={r.label} className="flex gap-2.5">
            <r.icon size={13} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold text-foreground">{r.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{r.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <AlertTriangle size={11} /> The downside
        </p>
        <p className="text-xs leading-relaxed text-amber-900">{option.risk}</p>
      </div>
    </div>
  );
}

export function WhatIfLab({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { profile } = useCareerProfile();
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [pending, setPending] = useState(false);

  const suggestions = suggestionsFor(profile.currentRole, profile.targetRole);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || pending) return;
    setPending(true);
    setAsked(q);
    setResult(null);
    const answer = await askWhatIf(profile, q);
    setResult(answer);
    setPending(false);
  };

  const bestAlignment = result?.answer.options.length
    ? Math.max(...result.answer.options.map(o => o.alignment))
    : -1;

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="mx-auto max-w-[1100px] space-y-6 p-4 sm:p-6 lg:p-8">

        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <MessagesSquare size={13} /> What-If Lab
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Ask about a move X-Ray hasn&apos;t modelled.
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Decision Lab covers the three paths your scan can see. This is for the
            specific one in front of you — two offers, a pay cut, a detour. Name both
            options and it will argue them against each other.
          </p>
        </div>

        {/* Ask */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <form
            onSubmit={e => { e.preventDefault(); ask(question); }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Company A offers me Software Engineer, Company B offers Security Engineer — which?"
              className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="submit"
              disabled={pending || !question.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? <>Thinking<span className="animate-pulse">…</span></> : <>Compare <Send size={14} /></>}
            </button>
          </form>

          {!asked && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Or start from one of these
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setQuestion(s); ask(s); }}
                    className="rounded-lg border border-border bg-white px-3 py-2 text-left text-xs text-foreground transition hover:border-primary/40 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {pending && (
          <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
            <Bot size={20} className="mx-auto mb-3 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">
              Weighing both options against {profile.targetRole || "your target role"}…
            </p>
          </div>
        )}

        {result && !pending && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                  {result.source === "ai" ? <Sparkles size={17} /> : <Cpu size={17} />}
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {result.source === "ai" ? "AI comparison" : "On-device comparison"}
                    </p>
                    {result.source === "local" && (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-300">
                        No model used
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-100">{result.answer.summary}</p>
                  {result.note && (
                    <p className="mt-2 text-xs text-slate-400">{result.note}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Options */}
            {result.answer.options.length > 0 && (
              <div className={`grid gap-4 ${result.answer.options.length > 1 ? "md:grid-cols-2" : ""}`}>
                {result.answer.options.map(o => (
                  <OptionCard key={o.label} option={o} best={o.alignment === bestAlignment} />
                ))}
              </div>
            )}

            {/* Verdict */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  <CheckCircle size={12} /> Recommendation
                </p>
                <p className="text-sm leading-relaxed text-emerald-900">{result.answer.recommendation}</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ArrowRight size={12} /> What would change the answer
                </p>
                <p className="text-sm leading-relaxed text-foreground">{result.answer.wouldChangeTheAnswer}</p>
              </div>
            </div>

            <button
              onClick={() => { setAsked(null); setResult(null); setQuestion(""); }}
              className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Ask something else
            </button>
          </div>
        )}

        <NextStep currentPage="whatif" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
