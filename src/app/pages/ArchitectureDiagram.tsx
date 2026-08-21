import { useState } from "react";
import { ArrowLeft, Cpu, Layers, Server, ShieldCheck } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   The system, drawn.

   Two layers on one canvas: solid is what runs in this build and can
   be opened in the repo; dashed is what the Malaysia blueprint adds
   before this is a production system. Keeping both on one diagram is
   the point — a judge asking "is this real or a mock" gets the answer
   from the line style rather than from a claim.

   Hand-authored SVG rather than a chart library: the shapes are fixed,
   there is no data behind them, and a 40KB dependency to draw sixteen
   rectangles would be the wrong trade.
   ──────────────────────────────────────────────────────────────── */

type Layer = "all" | "today" | "planned";

const INK = "#16284B";
const GOLD = "#8A7038";
const MUTED = "#7C87A0";
const LINE = "rgba(22,40,75,0.28)";

interface Node {
  id: string;
  x: number; y: number; w: number; h: number;
  title: string;
  sub: string;
  /** Where it runs. */
  zone: "client" | "edge" | "vendor" | "derive" | "store";
  planned?: boolean;
}

const NODES: Node[] = [
  // ── Client ──
  { id: "onboard",  x: 40,  y: 92,  w: 168, h: 54, title: "Onboarding", sub: "résumé · evidence · 6 questions", zone: "client" },
  { id: "unpdf",    x: 40,  y: 164, w: 168, h: 54, title: "unpdf", sub: "PDF → text, in-browser", zone: "client" },
  { id: "pages",    x: 40,  y: 236, w: 168, h: 54, title: "20 candidate pages", sub: "+ employer · university", zone: "client" },
  { id: "ctx",      x: 40,  y: 308, w: 168, h: 54, title: "React contexts", sub: "CareerProfile · Intelligence", zone: "client" },

  // ── Derivation (pure, client-side) ──
  { id: "risk",     x: 268, y: 92,  w: 176, h: 54, title: "careerRisk", sub: "4 risks · scorecard · gaps", zone: "derive" },
  { id: "corpus",   x: 268, y: 164, w: 176, h: 54, title: "careerCorpus", sub: "jobs · futures · salary bands", zone: "derive" },
  { id: "dna",      x: 268, y: 236, w: 176, h: 54, title: "careerDna", sub: "12 archetypes · z-score baseline", zone: "derive" },
  { id: "family",   x: 268, y: 308, w: 176, h: 54, title: "roleFamily", sub: "8 families · one classifier", zone: "derive" },

  // ── Edge functions ──
  { id: "fn1",      x: 504, y: 92,  w: 168, h: 54, title: "/api/analyze-resume", sub: "tool-use extraction", zone: "edge" },
  { id: "fn2",      x: 504, y: 164, w: 168, h: 54, title: "/api/what-if", sub: "structured comparison", zone: "edge" },
  { id: "fn3",      x: 504, y: 236, w: 168, h: 54, title: "/api/chat", sub: "assistant", zone: "edge" },
  { id: "fallback", x: 504, y: 308, w: 168, h: 54, title: "Rule engines", sub: "answer when no key is set", zone: "derive" },

  // ── Vendor ──
  { id: "claude",   x: 732, y: 164, w: 152, h: 54, title: "Anthropic API", sub: "claude-sonnet-5", zone: "vendor" },

  // ── Planned ──
  { id: "obj",      x: 268, y: 424, w: 176, h: 54, title: "Object storage", sub: "file + hash, URI only in DB", zone: "store", planned: true },
  { id: "queue",    x: 504, y: 424, w: 168, h: 54, title: "Queue workers", sub: "OCR · verify · score", zone: "edge", planned: true },
  { id: "trust",    x: 732, y: 424, w: 152, h: 54, title: "Trust engine", sub: "issuer · registry checks", zone: "store", planned: true },
  { id: "db",       x: 40,  y: 424, w: 168, h: 54, title: "Five databases", sub: "identity · evidence · market", zone: "store", planned: true },
];

interface Edge {
  from: string; to: string;
  label?: string;
  planned?: boolean;
  /** Route around the boxes rather than through them. */
  bend?: "down" | "up";
}

const EDGES: Edge[] = [
  { from: "onboard",  to: "unpdf",  label: "file" },
  { from: "unpdf",    to: "fn1",    label: "text only" },
  { from: "fn1",      to: "claude", label: "tool call" },
  { from: "onboard",  to: "ctx",    label: "CareerProfile" },
  { from: "ctx",      to: "risk",   label: "read" },
  { from: "ctx",      to: "corpus" },
  { from: "ctx",      to: "dna" },
  { from: "corpus",   to: "family", label: "family" },
  { from: "risk",     to: "pages",  label: "derived" },
  { from: "corpus",   to: "pages" },
  { from: "pages",    to: "fn2" },
  { from: "pages",    to: "fn3",    label: "question" },
  { from: "fn2",      to: "claude" },
  { from: "fn3",      to: "claude" },
  { from: "fallback", to: "pages",  label: "503 → local" },

  { from: "obj",      to: "queue",  label: "async", planned: true },
  { from: "queue",    to: "trust",  label: "verify", planned: true },
  { from: "db",       to: "obj",    label: "URI + hash", planned: true },
  { from: "queue",    to: "risk",   label: "versioned JSON", planned: true },
];

const ZONE_FILL: Record<Node["zone"], string> = {
  client: "#FFFFFF",
  derive: "rgba(217,193,138,0.16)",
  edge:   "rgba(22,40,75,0.06)",
  vendor: "#16284B",
  store:  "rgba(124,135,160,0.10)",
};

const ZONE_STROKE: Record<Node["zone"], string> = {
  client: "rgba(22,40,75,0.22)",
  derive: "rgba(138,112,56,0.45)",
  edge:   "rgba(22,40,75,0.30)",
  vendor: "#16284B",
  store:  "rgba(124,135,160,0.45)",
};

/* The seven stages of one scan, and the two points a model touches it.
   Timings describe the shape of the design — they are illustrative, not
   measured benchmarks, and the page says so. */
const PIPELINE = [
  { id: "01", title: "Intake",      detail: "Consent, signed URL, MIME check, malware scan, file hash", ms: "240ms", model: false },
  { id: "02", title: "Extract",     detail: "OCR, layout, semantic units, claims as JSON with page citations", ms: "1.9s", model: true },
  { id: "03", title: "Verify",      detail: "Issuer and registry checks, cross-source match, confidence status", ms: "620ms", model: false },
  { id: "04", title: "Normalize",   detail: "Title to MASCO, skills to canonical IDs, taxonomy version stored", ms: "310ms", model: false },
  { id: "05", title: "Snapshot",    detail: "Freeze evidence, market and rubric versions so the run can be replayed", ms: "90ms", model: false },
  { id: "06", title: "Orchestrate", detail: "Fan out to five independent scoring engines", ms: "60ms", model: false },
  { id: "07", title: "Explain",     detail: "Structured JSON in, citations and uncertainty out, output checked", ms: "1.4s", model: true },
];

const ENGINES = [
  { name: "Salary",      out: "P25 · P50 · P75 with a confidence band", ms: "140ms", example: "RM 8.4k–11.2k · n=612 · DOSM anchored" },
  { name: "Demand",      out: "Posting frequency and growth",           ms: "210ms", example: "−7% postings 12m · Selangor" },
  { name: "Skill gap",   out: "Required against proven",                ms: "480ms", example: "3 gaps · cloud evidence missing" },
  { name: "AI exposure", out: "Task-level exposure",                    ms: "350ms", example: "0.61 exposure — not job-loss probability" },
  { name: "Promotion",   out: "Next-role competency",                   ms: "260ms", example: "unknown · insufficient evidence, not a low score" },
];

const byId = (id: string) => NODES.find(n => n.id === id)!;

/** Anchor on the edge of a box facing the other box. */
function anchors(a: Node, b: Node) {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const horizontal = Math.abs(bc.x - ac.x) > Math.abs(bc.y - ac.y);

  if (horizontal) {
    const right = bc.x > ac.x;
    return {
      x1: right ? a.x + a.w : a.x,
      y1: ac.y,
      x2: right ? b.x : b.x + b.w,
      y2: bc.y,
    };
  }
  const down = bc.y > ac.y;
  return {
    x1: ac.x,
    y1: down ? a.y + a.h : a.y,
    x2: bc.x,
    y2: down ? b.y : b.y + b.h,
  };
}

export function ArchitectureDiagram({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [layer, setLayer] = useState<Layer>("all");

  const visible = (planned?: boolean) =>
    layer === "all" || (layer === "planned" ? !!planned : !planned);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="mx-auto max-w-[1160px] p-6 lg:p-8">

        <button
          onClick={() => onNavigate?.("profile")}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back to profile
        </button>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">Technical architecture</h1>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Two views. First what one scan does in five seconds — seven stages, five
          deterministic engines in parallel, and the only two places a model is allowed to
          touch it. Then the components underneath.
        </p>

        {/* ── One scan, stage by stage ── */}
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground">One scan, end to end</h2>
            <p className="font-mono text-xs text-muted-foreground">~5s · 7 stages · 5 engines · 2 model calls</p>
          </div>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Every stage is idempotent and retryable — a failure resumes from the last one
            that succeeded rather than re-running the scan. Timings describe the design,
            not measured benchmarks.
          </p>

          <div className="mt-5 space-y-2.5">
            {PIPELINE.map(st => (
              <div key={st.id} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 sm:w-52 sm:flex-shrink-0">
                  <span className="font-mono text-xs font-bold text-[#8A7038]">{st.id}</span>
                  <span className="text-base font-semibold text-foreground">{st.title}</span>
                </div>
                <p className="min-w-0 flex-1 text-sm text-muted-foreground">{st.detail}</p>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  {st.model && (
                    <span className="rounded-md border border-dashed border-[#8A7038]/50 bg-[#8A7038]/10 px-2 py-1 font-mono text-xs text-[#8A7038]">
                      model call
                    </span>
                  )}
                  <span className="w-14 text-right font-mono text-xs tabular-nums text-muted-foreground">{st.ms}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-base font-semibold text-foreground">Five engines, in parallel, no model involved</p>
              <p className="font-mono text-xs text-muted-foreground">stage 06 fan-out</p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Each is deterministic: same inputs, same output, every time. This is the part
              that has to be reproducible, so it is the part a model never touches.
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {ENGINES.map(e => (
                <div key={e.name} className="rounded-lg border border-border p-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{e.name}</p>
                    <span className="font-mono text-xs text-muted-foreground">{e.ms}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{e.out}</p>
                  <p className="mt-1.5 font-mono text-xs leading-relaxed text-[#8A7038]">{e.example}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-5">
              <p className="text-base font-semibold text-foreground">Where a model is allowed</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Twice, both marked above. Once to read a document into structured claims,
                once to put finished numbers into sentences. Both pass a gateway that strips
                identifying detail first, and the second only ever consumes JSON the engines
                produced — it cannot introduce a number of its own.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-5">
              <p className="text-base font-semibold text-foreground">The reason-code firewall</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                An employer&apos;s rejection reason becomes an anonymised code before it
                leaves their side. It reaches the candidate and the university as a signal
                about a skill, never as anything traceable to a person on either end.
              </p>
            </div>
          </div>
        </section>

        <h2 className="mt-12 border-t border-border pt-10 text-xl font-bold tracking-tight text-foreground">
          What is built, and what is planned
        </h2>
        <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Solid is what runs in this build and can be opened in the repository. Dashed is
          what the plan adds before this is production. Both on one canvas on purpose.
        </p>

        <div className="mt-5 inline-flex rounded-xl border border-border bg-white p-1">
          {([["all", "Both"], ["today", "Shipped"], ["planned", "Planned"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setLayer(id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                layer === id ? "bg-slate-950 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-white p-4 shadow-sm">
          <svg viewBox="0 0 924 500" className="min-w-[900px]" role="img" aria-label="CareerX-Ray technical architecture">
            <defs>
              <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill={LINE} />
              </marker>
            </defs>

            {/* Zone bands, drawn first so boxes sit on top */}
            {[
              { x: 28,  w: 192, label: "BROWSER" },
              { x: 256, w: 200, label: "DERIVATION · PURE" },
              { x: 492, w: 192, label: "VERCEL FUNCTIONS" },
              { x: 720, w: 176, label: "VENDOR" },
            ].map(z => (
              <g key={z.label}>
                <rect x={z.x} y={68} width={z.w} height={404} rx={12} fill="rgba(22,40,75,0.025)" />
                <text x={z.x + 10} y={58} fontSize={10} fontWeight={700} fill={MUTED} letterSpacing="0.1em">{z.label}</text>
              </g>
            ))}

            {/* Edges */}
            {EDGES.filter(e => visible(e.planned)).map((e, i) => {
              const a = byId(e.from), b = byId(e.to);
              if (!visible(a.planned) || !visible(b.planned)) return null;
              const { x1, y1, x2, y2 } = anchors(a, b);
              const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
              return (
                <g key={i}>
                  <path
                    d={`M${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                    stroke={LINE}
                    strokeWidth={1.4}
                    strokeDasharray={e.planned ? "5 4" : undefined}
                    fill="none"
                    markerEnd="url(#arw)"
                  />
                  {e.label && (
                    <>
                      <rect x={mx - e.label.length * 2.9 - 4} y={my - 8} width={e.label.length * 5.8 + 8} height={15} rx={4} fill="#FFFFFF" opacity={0.92} />
                      <text x={mx} y={my + 3} textAnchor="middle" fontSize={9.5} fill={MUTED}>{e.label}</text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.filter(n => visible(n.planned)).map(n => {
              const dark = n.zone === "vendor";
              return (
                <g key={n.id}>
                  <rect
                    x={n.x} y={n.y} width={n.w} height={n.h} rx={9}
                    fill={ZONE_FILL[n.zone]}
                    stroke={ZONE_STROKE[n.zone]}
                    strokeWidth={1.3}
                    strokeDasharray={n.planned ? "5 4" : undefined}
                  />
                  <text x={n.x + 12} y={n.y + 22} fontSize={12.5} fontWeight={700} fill={dark ? "#FFFFFF" : INK}>
                    {n.title}
                  </text>
                  <text x={n.x + 12} y={n.y + 39} fontSize={10.5} fill={dark ? "rgba(255,255,255,0.72)" : MUTED}>
                    {n.sub}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* What the drawing does not say */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "The file never leaves the device",
              body: "PDF text is extracted in the browser by unpdf. Only the extracted text is posted to the function, and nothing is stored once the response returns.",
            },
            {
              icon: Cpu,
              title: "Every score is computed, not prompted",
              body: "The four risks, the salary position, the archetype and the three futures are pure functions over the scan. The model extracts and explains; it does not decide.",
            },
            {
              icon: Layers,
              title: "It works with the key removed",
              body: "Each function returns 503 when ANTHROPIC_API_KEY is unset and the client falls back to a rule engine. That is the intended behaviour, not a failure path.",
            },
          ].map(c => (
            <div key={c.title} className="rounded-xl border border-border bg-white p-5">
              <c.icon size={17} className="text-[#8A7038]" />
              <p className="mt-3 text-base font-semibold text-foreground">{c.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-white p-5">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-muted-foreground" />
            <p className="text-base font-semibold text-foreground">What is deliberately not here</p>
          </div>
          <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
            <li>· No scraping of LinkedIn, JobStreet or any platform without a route that permits it.</li>
            <li>· No personal data in the aggregate market tables — names and contact details never cross that boundary.</li>
            <li>· No single score standing in for six different risks.</li>
            <li>· No job-loss probability. Task exposure is a different claim and we only make that one.</li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Colour follows the app: gold is our own derivation, navy is a vendor boundary,
          grey is storage that does not exist yet.
        </p>
      </div>
    </div>
  );
}
