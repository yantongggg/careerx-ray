import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { TapirMark } from "./TapirMark";
import { useCareerProfile } from "../state/careerProfile";
import { useIntelligence } from "../state/intelligence";
import { corpusFor } from "../lib/careerCorpus";
import {
  askChat, starterQuestions,
  type ChatSource, type ChatTurn,
} from "../lib/careerChat";

/* ────────────────────────────────────────────────────────────────
   The assistant, available from anywhere.

   Every other AI surface in the product is bound to one page and one
   question shape: What-If compares two named options, Interview Coach
   rehearses one posting. This is the one that is always there and takes
   anything — which is why it lives in the shell rather than on a page.

   It answers from the scan. A model reply is marked as one; the
   on-device fallback goes unmarked rather than announcing that the
   deployment has no key configured.
   ──────────────────────────────────────────────────────────────── */

interface DisplayTurn extends ChatTurn {
  source?: ChatSource;
}

interface CareerChatProps {
  page: string;
  /* A question to open with, set when something on a page offers to
     explain itself. Cleared once asked so reopening does not re-ask. */
  seed?: string | null;
  onSeedConsumed?: () => void;
  /* Open state lives in the shell so the sidebar entry and the floating
     launcher drive the same panel rather than two of them. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CareerChat({ page, open, onOpenChange, seed, onSeedConsumed }: CareerChatProps) {
  const { profile, risks, targetGaps, scorecard } = useCareerProfile();
  const { liveCount, latest } = useIntelligence();
  const [dismissedNudge, setDismissedNudge] = useState(false);

  /* A mentor who only ever answers when spoken to is a search box. This
     is the one thing worth interrupting for: a live rejection signal
     naming a skill, which is new information the user cannot see from
     any page they are on. Nothing else raises it. */
  const nudge = !open && !dismissedNudge && liveCount > 0 && latest
    ? {
        skill: latest.skill,
        question: `An employer just rejected someone for ${latest.skill}. Does that affect me?`,
      }
    : null;
  const setOpen = onOpenChange;
  const [turns, setTurns] = useState<DisplayTurn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const starters = starterQuestions(profile);

  /* Keep the newest message in view as the thread grows. */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, pending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /* Opened from a page that handed us a question — ask it immediately
     rather than making the user retype what they just clicked. */
  useEffect(() => {
    if (!open || !seed) return;
    onSeedConsumed?.();
    void send(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seed]);

  /* Escape closes the panel, which is what every other overlay does. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || pending) return;

    const next: DisplayTurn[] = [...turns, { role: "user", content: question }];
    setTurns(next);
    setInput("");
    setPending(true);

    const ctx = { profile, corpus: corpusFor(profile), risks, targetGaps, scorecard, page };
    const answer = await askChat(ctx, next.map(({ role, content }) => ({ role, content })));

    setTurns(prev => [...prev, {
      role: "assistant", content: answer.reply, source: answer.source,
    }]);
    setPending(false);
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask Tapir"
          title="Ask Tapir"
          className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
        >
          <TapirMark size={38} idle />
          {nudge && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500" />
            </span>
          )}
          <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:hidden">
            Ask Tapir
          </span>
        </button>
      )}

      {/* What it wants to say, offered once and dismissible. It never
          speaks twice about the same thing. */}
      {nudge && (
        <div className="fixed bottom-24 right-5 z-40 w-[min(300px,calc(100vw-2.5rem))] rounded-2xl rounded-br-sm border border-border bg-white p-4 shadow-xl">
          <button
            onClick={() => setDismissedNudge(true)}
            aria-label="Dismiss"
            className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X size={13} />
          </button>
          <p className="pr-5 text-sm leading-relaxed text-foreground">
            An employer just rejected someone for <strong>{nudge.skill}</strong>.
          </p>
          <button
            onClick={() => { setDismissedNudge(true); setOpen(true); void send(nudge.question); }}
            className="mt-3 text-sm font-semibold text-primary hover:underline"
          >
            Does that affect me? →
          </button>
        </div>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-40 flex h-[min(620px,100dvh)] w-full flex-col border-l border-t border-border bg-white shadow-2xl sm:bottom-5 sm:right-5 sm:h-[620px] sm:w-[400px] sm:rounded-2xl sm:border">

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <TapirMark size={36} idle thinking={pending} className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground leading-tight">Compass Tapir</p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.scannedAt
                  ? `Reading your scan · ${profile.currentRole || "your role"} → ${profile.targetRole || "your target"}`
                  : "No scan yet — run one and I can be specific"}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close the assistant"
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          {/* Thread */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {turns.length === 0 && (
              <div className="space-y-4">
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                  <p className="text-sm leading-relaxed text-foreground">
                    I read your scan — your risks, your gaps, your matched roles — and answer
                    questions about it. I will not make anything up about you; if it is not in
                    your scan, I will say so.
                  </p>
                </div>
                <div className="space-y-2">
                  {starters.map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-accent"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((t, i) => (
              t.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-slate-950 px-4 py-2.5">
                    <p className="text-sm leading-relaxed text-white">{t.content}</p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-2.5">
                  <TapirMark size={26} className="mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{t.content}</p>
                    </div>
                    {t.source === "ai" && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles size={10} /> Answered by the model, from your scan
                      </p>
                    )}
                  </div>
                </div>
              )
            ))}

            {pending && (
              <div className="flex gap-2.5">
                <TapirMark size={26} thinking className="mt-0.5 flex-shrink-0" />
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3.5">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={e => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-border px-3 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your scan…"
              className="flex-1 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
