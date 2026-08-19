import { ArrowRight, BarChart3 } from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

/* The three ways into the product. Everything past the landing page
   asks for an account, so App.tsx routes these through auth itself. */
const DOORS = [
  { label: "Candidate", desc: "Your risks, and the way out.", target: "onboarding" },
  { label: "Employer", desc: "Your pipeline, with readiness attached.", target: "emp-pipeline" },
  { label: "University", desc: "Gaps caught before they cost offers.", target: "insights" },
];

/* What the plate exposes, in the order the beam reaches it. */
const FINDINGS = [
  { label: "AI exposure", value: "58%", risk: true },
  { label: "Pay vs market", value: "−14%", risk: true },
  { label: "No credential on file", value: "0", risk: true },
  { label: "Communication", value: "84", risk: false },
];

/* The record the beam reads. Each row is a real line off a CV, so the
   scan is visibly working on evidence rather than on placeholder bars. */
const RECORD: { k: string; v: string; flag?: boolean }[] = [
  { k: "ROLE",   v: "Senior Data Analyst · 5 yrs" },
  { k: "SKILLS", v: "SQL · Python · Tableau · dbt" },
  { k: "PAY",    v: "RM 8,500 / month" },
  { k: "CERTS",  v: "None on file", flag: true },
  { k: "TARGET", v: "ML Engineer" },
];

/* The skill system, as it appears inside the product: the target role is
   the sun, proven skills orbit close in, and what you're missing burns
   on the outer ring. Radius is readiness, size is proficiency.

   `spin` is the orbital period in seconds and `phase` its starting angle,
   fed in as a negative animation start so every planet begins somewhere
   different. */
const ORBITS = [
  { r: 112, spin: 26, planets: [
    { label: "SQL",          size: 13, phase: -3,  from: "#7CC4FF", to: "#1565C0" },
    { label: "Python",       size: 12, phase: -15, from: "#5FD4C6", to: "#00796B" },
  ]},
  { r: 168, spin: 40, planets: [
    { label: "Storytelling", size: 11, phase: -8,  from: "#D9A6E8", to: "#7B1FA2" },
    { label: "Tableau",      size: 10, phase: -27, from: "#FFA07A", to: "#D84315" },
  ]},
  { r: 226, spin: 58, planets: [
    { label: "Power BI",     size: 9,  phase: -6,  from: "#FFE082", to: "#F9A825" },
    { label: "Excel",        size: 8,  phase: -34, from: "#C5E1A5", to: "#558B2F" },
  ]},
];

/* Two things standing between this person and the role. */
const GAPS = [
  { label: "Cloud deployment", size: 10, phase: -4,  spin: 74 },
  { label: "Team leadership",  size: 9,  phase: -40, spin: 74 },
];
const GAP_RING = 284;

/* The orbits are drawn in perspective, so a circular path has to be
   flattened. A planet is put on a rotating arm, counter-rotated so it
   stays upright, then pre-stretched by the inverse of the flattening —
   which leaves it a circle travelling an ellipse. */
const FLATTEN = 0.42;

function Planet({
  r, spin, phase, size, from, to, label, dashed = false,
}: {
  r: number; spin: number; phase: number; size: number;
  from?: string; to?: string; label: string; dashed?: boolean;
}) {
  const id = `p-${label.replace(/\W+/g, "")}`;
  return (
    <g>
      <animateTransform attributeName="transform" type="rotate"
        from="0 0 0" to="360 0 0" dur={`${spin}s`} begin={`${phase}s`} repeatCount="indefinite" />
      <g transform={`translate(${r},0)`}>
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from="0 0 0" to="-360 0 0" dur={`${spin}s`} begin={`${phase}s`} repeatCount="indefinite" />
          <g transform={`scale(1, ${1 / FLATTEN})`}>
            {!dashed && (
              <>
                <defs>
                  <radialGradient id={id} cx="35%" cy="30%">
                    <stop offset="0%" stopColor={from} />
                    <stop offset="100%" stopColor={to} />
                  </radialGradient>
                </defs>
                <circle r={size + 7} fill={from} opacity={0.16} />
                <circle r={size} fill={`url(#${id})`} />
              </>
            )}
            {dashed && (
              <>
                <circle r={size + 8} fill="#FF6B6B" opacity={0.14} />
                <circle r={size} fill="none" stroke="#FF8A8A" strokeWidth="1.6" strokeDasharray="3 3" />
              </>
            )}
            <text
              y={size + 15} textAnchor="middle" fontSize="10.5"
              fill={dashed ? "#FF9E9E" : "#9FB4CE"}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {label}
            </text>
          </g>
        </g>
      </g>
    </g>
  );
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* One 4s exposure drives everything: the beam travels, the record
          under it lights up, findings ignite behind it, and the word the
          whole product is about comes into focus. */}
      <style>{`
        @keyframes xr-travel {
          0%        { transform: translateY(-16%); opacity: 0; }
          4%        { opacity: 1; }
          44%       { transform: translateY(114%); opacity: 1; }
          50%, 100% { transform: translateY(114%); opacity: 0; }
        }
        /* Findings do not fade in — they strike, overshoot, then settle. */
        @keyframes xr-expose {
          0%        { opacity: 0; transform: translateY(7px) scale(.96); filter: brightness(1); }
          5%        { opacity: 1; transform: translateY(0) scale(1.035); filter: brightness(2.4); }
          12%, 80%  { opacity: 1; transform: none; filter: brightness(1); }
          88%, 100% { opacity: 0; transform: translateY(7px) scale(.96); }
        }
        /* Each line of the record flares as the beam crosses it. */
        @keyframes xr-bone {
          0%, 5%    { opacity: .10; }
          13%       { opacity: 1; }
          32%, 80%  { opacity: .48; }
          90%, 100% { opacity: .10; }
        }
        @keyframes xr-arc {
          0%, 34%   { stroke-dashoffset: 190; }
          56%, 82%  { stroke-dashoffset: 52; }
          90%, 100% { stroke-dashoffset: 190; }
        }
        @keyframes xr-num {
          0%, 34%   { opacity: .2; filter: blur(6px); }
          52%, 90%  { opacity: 1;  filter: blur(0); }
          97%, 100% { opacity: .2; filter: blur(6px); }
        }
        @keyframes xr-focus {
          0%, 10%   { filter: blur(10px); opacity: .24; }
          26%, 90%  { filter: blur(0);    opacity: 1; }
          97%, 100% { filter: blur(10px); opacity: .24; }
        }
        /* Corner brackets snap bright the instant the exposure completes. */
        @keyframes xr-reticle {
          0%, 42%   { opacity: .16; }
          49%       { opacity: 1; }
          60%, 82%  { opacity: .4; }
          90%, 100% { opacity: .16; }
        }
        @keyframes xr-read {
          0%, 3%    { opacity: 0; transform: scaleX(0);   transform-origin: left; }
          8%        { opacity: 1; transform: scaleX(1);   transform-origin: left; }
          16%       { opacity: 1; transform: scaleX(1);   transform-origin: right; }
          22%, 100% { opacity: 0; transform: scaleX(0);   transform-origin: right; }
        }
        /* The gap the whole product exists to find, flagged on completion. */
        @keyframes xr-flag {
          0%, 46%          { color: #DCE7F5; text-shadow: 0 0 14px rgba(190,215,255,.35); }
          52%, 58%, 64%    { color: #FF8A8A; text-shadow: 0 0 16px rgba(255,138,138,.9); }
          55%, 61%         { color: #FFC4C4; text-shadow: 0 0 22px rgba(255,138,138,1); }
          72%, 84%         { color: #FF8A8A; text-shadow: 0 0 14px rgba(255,138,138,.5); }
          92%, 100%        { color: #DCE7F5; text-shadow: none; }
        }
        @keyframes xr-scanning { 0%, 42% { opacity: 1; } 48%, 100% { opacity: 0; } }
        @keyframes xr-exposed  { 0%, 44% { opacity: 0; } 52%, 84% { opacity: 1; } 92%, 100% { opacity: 0; } }
        @keyframes xr-pulse    { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }

        .xr-beam     { animation: xr-travel   4s cubic-bezier(.4,0,.2,1) infinite; }
        .xr-find     { animation: xr-expose   4s cubic-bezier(.2,.9,.3,1) infinite both; }
        .xr-bone     { animation: xr-bone     4s ease-out infinite both; }
        .xr-arc      { animation: xr-arc      4s cubic-bezier(.3,0,.2,1) infinite both; }
        .xr-num      { animation: xr-num      4s ease-out infinite both; }
        .xr-reticle  { animation: xr-reticle  4s ease-out infinite both; }
        .xr-read     { animation: xr-read     4s ease-out infinite both; }
        .xr-flag     { animation: xr-flag     4s steps(1,end) infinite both; }
        .xr-scanning { animation: xr-scanning 4s steps(1,end) infinite both; }
        .xr-exposed  { animation: xr-exposed  4s steps(1,end) infinite both; }
        /* The italic's right sidebearing is tight against the roman that
           follows it, so the word carries its own trailing space. */
        .xr-word     { animation: xr-focus 4s ease-out infinite both; display: inline-block; padding-right: .1em; }
        .xr-dot      { animation: xr-pulse 2.4s ease-in-out infinite; }
        @keyframes ls-breathe { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .ls-breathe { animation: ls-breathe 4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .xr-beam, .xr-scanning { display: none; }
          .xr-find, .xr-word, .xr-num, .xr-exposed {
            animation: none; opacity: 1; filter: none; transform: none;
          }
          .xr-bone    { animation: none; opacity: .48; }
          .xr-read    { display: none; }
          .xr-flag    { animation: none; color: #FF8A8A; }
          .xr-arc     { animation: none; stroke-dashoffset: 52; }
          .xr-reticle { animation: none; opacity: .4; }
          .xr-dot, .ls-breathe { animation: none; }
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
      {/* The headline runs the full width and the plate sits under it, so
          the sentence is the thing you remember and the scan is the proof
          you scroll into. */}
      <section className="max-w-[1400px] mx-auto px-6 pt-10 pb-20 lg:pt-12 lg:pb-24">
        <p
          className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-7"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span className="xr-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Career diagnostics
        </p>

        {/* Sized off the viewport so it fills the width at every breakpoint
            without a fixed no-wrap phrase pushing the page sideways. */}
        <h1
          className="leading-[0.9] tracking-[-0.045em]"
          style={{ fontSize: "clamp(2.75rem, 8.4vw, 7.5rem)", textWrap: "balance" } as any}
        >
          Are you <span className="xr-word text-primary italic">ready</span> for your next opportunity?
        </h1>

        <div className="mt-10 lg:mt-12 grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-14 items-center">

          <div>
            <p className="text-xl lg:text-2xl leading-snug text-muted-foreground max-w-[22rem]">
              Upload anything you have. Three minutes later you know.
            </p>

            <button
              onClick={() => onNavigate("register")}
              className="group mt-8 inline-flex items-center gap-2.5 bg-foreground text-background pl-7 pr-6 py-4 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Find out
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
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
                  <p className="relative text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-mono)", color: "#5E738F" }}>
                    <span className="xr-scanning">Scanning</span>
                    <span className="xr-exposed absolute left-0 top-0" style={{ color: "#F2C75A" }}>Exposed</span>
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
                    <span className="xr-num text-[#DCE7F5] text-lg leading-none" style={{ fontFamily: "var(--font-mono)" }}>72</span>
                    <span className="text-[9px] text-[#5E738F] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>/100</span>
                  </div>
                </div>
              </div>

              {/* The record, read line by line as the beam crosses it */}
              <div className="relative mb-6">
                {RECORD.map((r, i) => (
                  <div
                    key={r.k}
                    className="xr-bone relative grid grid-cols-[64px_1fr] items-baseline gap-3 py-[7px]"
                    style={{
                      animationDelay: `${i * 0.07}s`,
                      borderTop: i ? "1px solid rgba(159,180,206,0.12)" : "none",
                    }}
                  >
                    <span className="text-[9.5px] tracking-[0.14em]"
                          style={{ fontFamily: "var(--font-mono)", color: "#5E738F" }}>
                      {r.k}
                    </span>
                    <span
                      className={`text-[13px] ${r.flag ? "xr-flag" : "text-[#DCE7F5]"}`}
                      style={r.flag ? undefined : { textShadow: "0 0 14px rgba(190,215,255,0.35)" }}
                    >
                      {r.v}
                    </span>
                    <span
                      className="xr-read pointer-events-none absolute inset-y-0 -inset-x-2 rounded"
                      style={{
                        animationDelay: `${i * 0.07}s`,
                        background: "linear-gradient(90deg, rgba(242,199,90,0.22), rgba(242,199,90,0.05))",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* What the exposure reveals */}
              <div className="relative space-y-2">
                {FINDINGS.map((f, i) => (
                  <div
                    key={f.label}
                    className="xr-find flex items-center justify-between rounded-lg px-3.5 py-2.5"
                    style={{
                      animationDelay: `${1.7 + i * 0.34}s`,
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
                      "linear-gradient(to bottom, rgba(233,185,73,0) 0%, rgba(233,185,73,0.04) 55%, rgba(233,185,73,0.20) 94%, rgba(255,240,200,0.30) 100%)",
                  }}
                />
                <div
                  className="h-[1.5px] w-full"
                  style={{
                    background: "linear-gradient(90deg, rgba(242,199,90,0) 0%, #FFF3D0 18%, #FFF9E8 50%, #FFF3D0 82%, rgba(242,199,90,0) 100%)",
                    boxShadow: "0 0 6px 1px rgba(255,243,208,0.95), 0 0 26px 6px rgba(242,199,90,0.55)",
                  }}
                />
                <div
                  className="h-6 w-full"
                  style={{ background: "linear-gradient(to bottom, rgba(242,199,90,0.16), rgba(242,199,90,0))" }}
                />
              </div>

              {/* Reticle corners */}
              {[
                { pos: "top-3 left-3",     b: "border-t-2 border-l-2" },
                { pos: "top-3 right-3",    b: "border-t-2 border-r-2" },
                { pos: "bottom-3 left-3",  b: "border-b-2 border-l-2" },
                { pos: "bottom-3 right-3", b: "border-b-2 border-r-2" },
              ].map(c => (
                <div
                  key={c.pos}
                  className={`xr-reticle pointer-events-none absolute ${c.pos} ${c.b} w-4 h-4`}
                  style={{ borderColor: "#F2C75A" }}
                />
              ))}

              {/* Vignette, so the film has edges */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[1.25rem]"
                style={{ boxShadow: "inset 0 0 90px rgba(0,0,0,0.55)" }}
              />
            </div>


          </div>
        </div>
      </section>

      {/* ── The skill system ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0A1120 0%, #0C1626 55%, #070D18 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(50% 55% at 50% 45%, rgba(138,112,56,0.20), transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-24 grid lg:grid-cols-[1fr_1.15fr] gap-12 items-center">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.22em] mb-6"
              style={{ fontFamily: "var(--font-mono)", color: "#7E93AE" }}
            >
              The skill system
            </p>
            <h2 className="text-[2.5rem] sm:text-[3.25rem] leading-[1.02] tracking-[-0.03em] text-[#EDF3FA]">
              The job you want is the{" "}
              <span className="italic" style={{ color: "#F2C75A" }}>sun</span>.
            </h2>
            <p className="mt-6 text-[#9FB4CE] leading-relaxed max-w-md">
              What you can prove orbits close. What&apos;s missing burns on the outer ring.
            </p>
            <button
              onClick={() => onNavigate("register")}
              className="group mt-9 inline-flex items-center gap-2.5 text-[#F2C75A] font-medium"
            >
              See yours
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="relative">
            <svg viewBox="0 66 660 338" className="w-full h-auto" role="img"
                 aria-label="Skill system: proven skills orbit the target role, missing skills sit on an outer ring">
              <defs>
                <radialGradient id="ls-sun" cx="42%" cy="36%">
                  <stop offset="0%" stopColor="#FFE9A8" />
                  <stop offset="55%" stopColor="#F2C75A" />
                  <stop offset="100%" stopColor="#B8862A" />
                </radialGradient>
                <radialGradient id="ls-corona" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#F2C75A" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="#F2C75A" stopOpacity="0" />
                </radialGradient>
              </defs>

              <text x="14" y="92" fontSize="10" fill="#7E93AE"
                    letterSpacing="2" style={{ fontFamily: "var(--font-mono)" }}>
                TARGET ROLE
              </text>
              <text x="14" y="112" fontSize="15" fill="#F2C75A"
                    style={{ fontFamily: "var(--font-mono)" }}>
                ML Engineer
              </text>

              <g transform="translate(330,235)">
                {/* Orbit rings, drawn flat */}
                {ORBITS.map(o => (
                  <ellipse key={o.r} rx={o.r} ry={o.r * FLATTEN} fill="none"
                           stroke="rgba(159,180,206,0.16)" strokeWidth="1" />
                ))}
                <ellipse rx={GAP_RING} ry={GAP_RING * FLATTEN} fill="none"
                         stroke="rgba(255,138,138,0.34)" strokeWidth="1.2" strokeDasharray="5 6" />

                {/* The role at the centre */}
                <circle r="86" fill="url(#ls-corona)" className="ls-breathe" />
<circle r="34" fill="url(#ls-sun)" />

                {/* Everything in orbit is flattened into perspective */}
                <g transform={`scale(1, ${FLATTEN})`}>
                  {ORBITS.flatMap(o =>
                    o.planets.map(p => (
                      <Planet key={p.label} r={o.r} spin={o.spin} phase={p.phase}
                              size={p.size} from={p.from} to={p.to} label={p.label} />
                    )),
                  )}
                  {GAPS.map(g => (
                    <Planet key={g.label} r={GAP_RING} spin={g.spin} phase={g.phase}
                            size={g.size} label={g.label} dashed />
                  ))}
                </g>
              </g>
            </svg>
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
            Three doors
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
            CareerX-Ray · Talentbank
          </p>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            Built in Malaysia
          </p>
        </div>
      </footer>
    </div>
  );
}
