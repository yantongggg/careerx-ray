import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   A standalone document, served whole.

   The runtime architecture and the 30/90/120 plan are finished pieces
   with their own typography and, in the architecture's case, a running
   simulation. Re-implementing them as React would have meant rewriting
   work that was already done and losing the animation with it, so they
   ship as they were authored and this frames them.

   They live in public/docs and are served as static files. Nothing
   inside them reads application state, so an iframe is the honest
   boundary: they are documents, not screens.
   ──────────────────────────────────────────────────────────────── */

interface EmbeddedDocProps {
  title: string;
  lede: string;
  /** Path under public/ for the English edition. */
  src: string;
  /** Same document in Chinese, when one exists. */
  srcZh?: string;
  /** Frame height. These documents set their own internal scrolling. */
  height?: number;
  onNavigate?: (page: string) => void;
}

export function EmbeddedDoc({ title, lede, src, srcZh, height = 1400, onNavigate }: EmbeddedDocProps) {
  /* Same document, same layout, same numbers — only the language
     differs, so switching is a source swap rather than a second page. */
  const [lang, setLang] = useState<"en" | "zh">("en");
  const active = lang === "zh" && srcZh ? srcZh : src;
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="mx-auto max-w-[1240px] p-6 lg:p-8">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onNavigate?.("profile")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={14} /> Back to profile
          </button>
          <div className="flex items-center gap-3">
            {srcZh && (
              <div className="inline-flex rounded-lg border border-border bg-white p-0.5">
                {([["en", "English"], ["zh", "中文"]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setLang(id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                      lang === id ? "bg-slate-950 text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          <a
            href={active}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Open full screen <ExternalLink size={13} />
          </a>
          </div>
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{lede}</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <iframe
            /* Keyed on the source so a language switch remounts the
               frame — these documents run their intro animation once. */
            key={active}
            src={active}
            title={title}
            className="w-full"
            style={{ height, border: "none", display: "block" }}
            /* No same-origin privileges beyond what a static document
               needs: it runs its own scripts and nothing else. */
            sandbox="allow-scripts"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
