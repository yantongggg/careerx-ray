import { ArrowRight, BarChart3 } from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

/* The three ways into the product. Everything past the landing page
   asks for an account, so App.tsx routes these through auth itself. */
const DOORS = [
  { label: "Candidate", desc: "Find the risks in your career, and the fastest way out of them.", target: "onboarding" },
  { label: "Employer", desc: "See your hiring pipeline with readiness intelligence attached.", target: "emp-pipeline" },
  { label: "University", desc: "Catch graduate readiness gaps before they cost offers.", target: "insights" },
];

/* What the scan surfaces, in the order the beam reaches them. */
const FINDINGS = [
  { label: "AI exposure", value: "58%", tone: "risk" },
  { label: "Pay vs market", value: "−14%", tone: "risk" },
  { label: "No credential on file", value: "0", tone: "risk" },
  { label: "Communication", value: "84", tone: "good" },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* One 7s clock drives the whole scan: the beam sweeps, each finding
          fades in behind it on its own delay, and the record underneath
          dims as it is read. */}
      <style>{`
        @keyframes xr-sweep {
          0%       { transform: translateY(-14%); opacity: 0; }
          5%       { opacity: 1; }
          52%      { transform: translateY(112%); opacity: 1; }
          58%,100% { transform: translateY(112%); opacity: 0; }
        }
        @keyframes xr-reveal {
          0%       { opacity: 0; transform: translateY(6px); }
          7%, 84%  { opacity: 1; transform: none; }
          92%,100% { opacity: 0; transform: translateY(6px); }
        }
        @keyframes xr-dim {
          0%, 8%   { opacity: .45; }
          46%, 88% { opacity: .16; }
          96%,100% { opacity: .45; }
        }
        @keyframes xr-count {
          0%, 44%  { opacity: 0; }
          58%, 88% { opacity: 1; }
          96%,100% { opacity: 0; }
        }
        .xr-beam  { animation: xr-sweep 7s cubic-bezier(.4,0,.2,1) infinite; }
        .xr-find  { animation: xr-reveal 7s ease-out infinite both; }
        .xr-skel  { animation: xr-dim 7s ease-in-out infinite; }
        .xr-score { animation: xr-count 7s ease-out infinite both; }
        @media (prefers-reduced-motion: reduce) {
          .xr-beam { display: none; }
          .xr-find, .xr-score { animation: none; opacity: 1; transform: none; }
          .xr-skel { animation: none; opacity: .16; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="font-semibold tracking-tight">CareerX-Ray</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("login")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Sign in
            </button>
            <button
              onClick={() => onNavigate("register")}
              className="text-sm bg-foreground text-background px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity font-medium"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-28 lg:pt-24 lg:pb-36">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-20 items-center">

          <div>
            <h1
              className="text-[2.75rem] leading-[1.08] tracking-[-0.02em] sm:text-6xl sm:leading-[1.05]"
              style={{ textWrap: "balance" } as any}
            >
              Discover hidden career risks
              <span className="text-primary"> before they become regrets.</span>
            </h1>

            <p className="mt-7 text-lg leading-relaxed text-muted-foreground max-w-md">
              Upload what you already have. In three minutes you get the risks in your
              career today, the gaps between you and the job you want, and what to do
              about each one.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate("register")}
                className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Get your X-Ray <ArrowRight size={16} />
              </button>
              <span className="text-sm text-muted-foreground">Free to start · No credit card</span>
            </div>
          </div>

          {/* ── The scan, running ── */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-[0_24px_70px_-30px_rgba(22,40,75,0.35)] p-7">

              <div className="flex items-center justify-between mb-6">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                  Career X-Ray
                </p>
                <p className="xr-score text-xs text-primary" style={{ fontFamily: "var(--font-mono)" }}>72 / 100</p>
              </div>

              {/* The plain record, before anything is read into it */}
              <div className="xr-skel space-y-2.5 mb-7">
                {[92, 74, 84, 62, 78].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full bg-foreground" style={{ width: `${w}%` }} />
                ))}
              </div>

              {/* What the scan finds */}
              <div className="space-y-2.5">
                {FINDINGS.map((f, i) => (
                  <div
                    key={f.label}
                    className="xr-find flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                    style={{ animationDelay: `${2 + i * 0.42}s` }}
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: f.tone === "risk" ? "#B3261E" : "#115E50" }}
                      />
                      {f.label}
                    </span>
                    <span
                      className="text-sm"
                      style={{ fontFamily: "var(--font-mono)", color: f.tone === "risk" ? "#B3261E" : "#115E50" }}
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* The beam */}
              <div className="xr-beam pointer-events-none absolute inset-x-0 top-0 h-24">
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(138,112,56,0) 0%, rgba(138,112,56,0.10) 55%, rgba(138,112,56,0.22) 88%, rgba(138,112,56,0) 100%)",
                  }}
                />
                <div className="h-px w-full bg-primary/70" />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Every number here is traced back to something you gave us.
            </p>
          </div>
        </div>
      </section>

      {/* ── Three doors ── */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-8" style={{ fontFamily: "var(--font-mono)" }}>
            One intelligence layer · three doors
          </p>
          <div className="grid sm:grid-cols-3 gap-x-10 gap-y-8">
            {DOORS.map(door => (
              <button
                key={door.label}
                onClick={() => onNavigate(door.target)}
                className="group text-left"
              >
                <p className="text-2xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{door.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{door.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            CareerX-Ray — Talentbank&apos;s career intelligence layer
          </p>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>Built in Malaysia</p>
        </div>
      </footer>
    </div>
  );
}
