import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { TapirMark } from "./TapirMark";
import { useCareerProfile } from "../state/careerProfile";
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
  /* Open state lives in the shell so the sidebar entry and the floating
     launcher drive the same panel rather than two of them. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CareerChat({ page, open, onOpenChange }: CareerChatProps) {
  const { profile, risks, targetGaps, scorecard } = useCareerProfile();
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
          aria-label="Ask the Compass Tapir"
          className="fixed bottom-5 right-5 xl:right-28 z-40 flex items-center gap-2.5 rounded-full border border-border bg-white py-2 pl-2 pr-4 shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
        >
          <TapirMark size={36} idle />
          <span className="text-sm font-semibold text-foreground">Ask Tapir</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-40 flex h-[min(620px,100dvh)] w-full flex-col border-l border-t border-border bg-white shadow-2xl sm:bottom-5 sm:right-5 xl:right-28 sm:h-[620px] sm:w-[400px] sm:rounded-2xl sm:border">

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
