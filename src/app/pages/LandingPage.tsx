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

/* What the plate exposes, in the order the beam reaches it. */
const FINDINGS = [
  { label: "AI exposure", value: "58%", risk: true },
  { label: "Pay vs market", value: "−14%", risk: true },
  { label: "No credential on file", value: "0", risk: true },
  { label: "Communication", value: "84", risk: false },
];

/* The record underneath, before anything has been read into it. */
const BONES = [88, 62, 74, 46, 80, 55];

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* One 9s exposure drives everything: the beam travels, the record
          under it lights up, findings ignite behind it, and the word the
          whole product is about comes into focus. */}
      <style>{`
        @keyframes xr-travel {
          0%        { transform: translateY(-18%); opacity: 0; }
          6%        { opacity: 1; }
          48%       { transform: translateY(116%); opacity: 1; }
          54%, 100% { transform: translateY(116%); opacity: 0; }
        }
        @keyframes xr-expose {
          0%        { opacity: 0; transform: translateY(8px); filter: blur(3px); }
          6%, 82%   { opacity: 1; transform: none; filter: blur(0); }
          90%, 100% { opacity: 0; transform: translateY(8px); filter: blur(3px); }
        }
        @keyframes xr-bone {
          0%, 6%    { opacity: .13; }
          44%, 82%  { opacity: .55; }
          92%, 100% { opacity: .13; }
        }
        @keyframes xr-arc {
          0%, 40%   { stroke-dashoffset: 190; }
          62%, 84%  { stroke-dashoffset: 52; }
          93%, 100% { stroke-dashoffset: 190; }
        }
        @keyframes xr-focus {
          0%, 14%   { filter: blur(9px); opacity: .28; }
          30%, 84%  { filter: blur(0);   opacity: 1; }
          94%, 100% { filter: blur(9px); opacity: .28; }
        }
        @keyframes xr-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: .25; }
        }
        .xr-beam  { animation: xr-travel 9s cubic-bezier(.45,0,.25,1) infinite; }
        .xr-find  { animation: xr-expose 9s ease-out infinite both; }
        .xr-bone  { animation: xr-bone   9s ease-in-out infinite both; }
        .xr-arc   { animation: xr-arc    9s cubic-bezier(.3,0,.2,1) infinite both; }
        /* The italic's right sidebearing is tight against the roman that
           follows it, so the word carries its own trailing space. */
        .xr-word  { animation: xr-focus 9s ease-out infinite both; display: inline-block; padding-right: .1em; }
        .xr-dot   { animation: xr-pulse  2.4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .xr-beam { display: none; }
          .xr-find, .xr-word { animation: none; opacity: 1; filter: none; transform: none; }
          .xr-bone { animation: none; opacity: .5; }
          .xr-arc  { animation: none; stroke-dashoffset: 52; }
          .xr-dot  { animation: none; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
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
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-24 lg:pt-16 lg:pb-32">
        <div className="grid lg:grid-cols-[1.08fr_1fr] gap-14 lg:gap-16 items-center">

          <div>
            <p
              className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-8"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="xr-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Career diagnostics · Malaysia
            </p>

            <h1
              className="text-[3.25rem] leading-[0.98] tracking-[-0.035em] sm:text-[4.5rem] sm:leading-[0.95]"
              style={{ textWrap: "balance" } as any}
            >
              Your career has{" "}
              <span className="xr-word text-primary italic">hidden</span>{" "}
              fractures.
              <span className="block mt-2 text-muted-foreground/70">See them first.</span>
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-muted-foreground max-w-[27rem]">
              Upload what you already have. Three minutes later you have the risks in the
              job you hold, the gaps to the one you want, and what to do about each.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                onClick={() => onNavigate("register")}
                className="group inline-flex items-center gap-2.5 bg-foreground text-background pl-7 pr-6 py-4 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Expose my career
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <span className="text-sm text-muted-foreground">Free · No credit card · 3 minutes</span>
            </div>
          </div>

          {/* ── The plate ── */}
          <div className="relative">
            {/* Light leaking out from behind the film */}
            <div
              className="absolute -inset-8 rounded-[2rem] blur-2xl pointer-events-none"
              style={{ background: "radial-gradient(60% 50% at 65% 20%, rgba(138,112,56,0.28), transparent 70%)" }}
            />

            <div
              className="relative overflow-hidden rounded-[1.25rem] p-7 shadow-[0_40px_90px_-40px_rgba(11,18,32,0.85)]"
              style={{ background: "linear-gradient(165deg, #142033 0%, #0A1120 55%, #070D18 100%)" }}
            >
              {/* Radiograph texture: fine scan lines, held well back */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.16]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, rgba(220,231,245,0.25) 0px, rgba(220,231,245,0.25) 1px, transparent 1px, transparent 4px)",
                }}
              />

              <div className="relative flex items-start justify-between mb-7">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-mono)", color: "#5E738F" }}>
                    Plate 01 · exposure
                  </p>
                  <p className="text-[#DCE7F5] text-lg mt-1 tracking-tight">Senior Data Analyst</p>
                </div>

                {/* Health score, drawn as the beam finishes */}
                <div className="relative w-[72px] h-[72px] flex-shrink-0">
                  <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(220,231,245,0.12)" strokeWidth="5" />
                    <circle
                      className="xr-arc"
                      cx="36" cy="36" r="30" fill="none"
                      stroke="#E9B949" strokeWidth="5" strokeLinecap="round"
                      strokeDasharray="190" strokeDashoffset="190"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[#DCE7F5] text-lg leading-none" style={{ fontFamily: "var(--font-mono)" }}>72</span>
                    <span className="text-[9px] text-[#5E738F] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>/100</span>
                  </div>
                </div>
              </div>

              {/* The record, lighting up as it is read */}
              <div className="relative space-y-2 mb-7">
                {BONES.map((w, i) => (
                  <div
                    key={i}
                    className="xr-bone h-2 rounded-full"
                    style={{
                      width: `${w}%`,
                      background: "linear-gradient(90deg, #DCE7F5, rgba(220,231,245,0.35))",
                      boxShadow: "0 0 12px rgba(190,215,255,0.35)",
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>

              {/* What the exposure reveals */}
              <div className="relative space-y-2">
                {FINDINGS.map((f, i) => (
                  <div
                    key={f.label}
                    className="xr-find flex items-center justify-between rounded-lg px-3.5 py-2.5"
                    style={{
                      animationDelay: `${2.6 + i * 0.5}s`,
                      background: f.risk ? "rgba(255,107,107,0.09)" : "rgba(91,227,176,0.09)",
                      border: `1px solid ${f.risk ? "rgba(255,107,107,0.28)" : "rgba(91,227,176,0.28)"}`,
                    }}
                  >
                    <span className="flex items-center gap-2.5 text-[13px] text-[#C6D4E6]">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: f.risk ? "#FF6B6B" : "#5BE3B0",
                          boxShadow: `0 0 8px ${f.risk ? "rgba(255,107,107,0.8)" : "rgba(91,227,176,0.8)"}`,
                        }}
                      />
                      {f.label}
                    </span>
                    <span
                      className="text-[13px]"
                      style={{ fontFamily: "var(--font-mono)", color: f.risk ? "#FF8A8A" : "#5BE3B0" }}
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* The beam */}
              <div className="xr-beam pointer-events-none absolute inset-x-0 top-0 h-32">
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(233,185,73,0) 0%, rgba(233,185,73,0.05) 60%, rgba(233,185,73,0.16) 92%, rgba(233,185,73,0) 100%)",
                  }}
                />
                <div
                  className="h-[2px] w-full"
                  style={{ background: "#F2C75A", boxShadow: "0 0 18px 3px rgba(242,199,90,0.6)" }}
                />
              </div>

              {/* Vignette, so the film has edges */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[1.25rem]"
                style={{ boxShadow: "inset 0 0 90px rgba(0,0,0,0.55)" }}
              />
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Every number traces back to something you gave us.
            </p>
          </div>
        </div>
      </section>

      {/* ── Three doors ── */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p
            className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-8"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            One intelligence layer · three doors
          </p>
          <div className="grid sm:grid-cols-3 gap-x-10 gap-y-8">
            {DOORS.map(door => (
              <button key={door.label} onClick={() => onNavigate(door.target)} className="group text-left">
                <p className="text-2xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {door.label}
                </p>
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
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            Built in Malaysia
          </p>
        </div>
      </footer>
    </div>
  );
}
