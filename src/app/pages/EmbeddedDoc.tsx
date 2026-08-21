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
  /** Path under public/. */
  src: string;
  /** Frame height. These documents set their own internal scrolling. */
  height?: number;
  onNavigate?: (page: string) => void;
}

export function EmbeddedDoc({ title, lede, src, height = 1400, onNavigate }: EmbeddedDocProps) {
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
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Open full screen <ExternalLink size={13} />
          </a>
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{lede}</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <iframe
            src={src}
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
