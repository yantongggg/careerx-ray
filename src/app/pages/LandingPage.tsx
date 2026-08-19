import { ArrowRight, BarChart3 } from "lucide-react";
import { BrandMark } from "../layout/BrandMark";

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

/* The card cycles three of the things a scan actually returns, so it
   demonstrates the product rather than describing it. One panel per pass
   of the beam. Each keeps one thing to fix, one to watch, one already
   working — a card of red reads as a verdict, which is not what a
   diagnostic is for. */
const PANELS = [
  {
    id: "signals",
    label: "Career signals",
    rows: [
      { label: "No cloud credential", note: "Asked for in most ML Engineer postings", value: "Gap",  tone: "#E8927C" },
      { label: "Pay vs market",       note: "Against your level in Kuala Lumpur",     value: "−14%", tone: "#D9C18A" },
      { label: "Communication",       note: "Your strongest calibrated dimension",    value: "84",   tone: "#7BC9A4" },
    ],
  },
  {
    id: "dna",
    label: "Career DNA",
    /* The badge earns its place here: this panel is the archetype. */
    badge: { image: "/dna/eagle.png", role: "Direction Setter", animal: "Crown Eagle" },
    rows: [
      { label: "Work signal",    note: "Build and analyse ↔ explain and connect", value: "62 / 38", tone: "#9FB4CE" },
      { label: "Operating mode", note: "Ship reliably ↔ explore possibilities",   value: "71 / 29", tone: "#9FB4CE" },
      { label: "Influence style", note: "Set direction ↔ mobilise people",        value: "44 / 56", tone: "#9FB4CE" },
    ],
  },
  {
    id: "gap",
    label: "Gap to target",
    rows: [
      { label: "Cloud deployment",  note: "68% of applicants blocked on this", value: "3 mo", tone: "#E8927C" },
      { label: "Team leadership",   note: "Named in senior postings",          value: "6 mo", tone: "#D9C18A" },
      { label: "SQL · Python",      note: "Already transfers to the new role",  value: "Ready", tone: "#7BC9A4" },
    ],
  },
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
        @keyframes xr-arc {
          0%, 34%   { stroke-dashoffset: 151; }
          56%, 88%  { stroke-dashoffset: 41; }
          96%, 100% { stroke-dashoffset: 151; }
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
        @keyframes xr-pulse    { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }

        /* One 12s cycle, three 4s panels. The beam sweeps once per panel. */
        @keyframes xr-panel {
          0%       { opacity: 0; transform: translateY(7px); }
          5%, 29%  { opacity: 1; transform: none; }
          34%, 100%{ opacity: 0; transform: translateY(-7px); }
        }
        @keyframes xr-tick {
          0%, 4%   { width: 0; }
          30%      { width: 100%; }
          34%, 100%{ width: 0; }
        }
        .xr-panel    { animation: xr-panel 12s ease-in-out infinite both; }
        .xr-tick     { animation: xr-tick  12s linear infinite both; }
        .xr-beam     { animation: xr-travel   4s cubic-bezier(.4,0,.2,1) infinite; }
        .xr-arc      { animation: xr-arc      4s cubic-bezier(.3,0,.2,1) infinite both; }
        .xr-num      { animation: xr-num      4s ease-out infinite both; }
        .xr-reticle  { animation: xr-reticle  4s ease-out infinite both; }
        /* The italic's right sidebearing is tight against the roman that
           follows it, so the word carries its own trailing space. */
        .xr-word     { animation: xr-focus 4s ease-out infinite both; display: inline-block; padding-right: .1em; }
        .xr-dot      { animation: xr-pulse 2.4s ease-in-out infinite; }
        @keyframes ls-breathe { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .ls-breathe { animation: ls-breathe 4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .xr-beam { display: none; }
          .xr-word, .xr-num { animation: none; opacity: 1; filter: none; transform: none; }
          .xr-arc     { animation: none; stroke-dashoffset: 41; }
          .xr-reticle { animation: none; opacity: .4; }
          .xr-dot, .ls-breathe { animation: none; }
          /* Stacked panels would pile on top of each other without the
             cycle, so the first one is the one that stays. */
          .xr-panel { animation: none; opacity: 0; }
          .xr-panel:first-child { animation: none; opacity: 1; transform: none; }
          .xr-tick  { animation: none; width: 0; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark size={34} />
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
      {/* Centred question, then the readout under it as a wide plate —
          you read the sentence, then look down at the evidence. */}
      <section className="max-w-[1180px] mx-auto px-6 pt-8 pb-20 lg:pt-10 lg:pb-24">

        <div className="text-center">
          <p
            className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="xr-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Career diagnostics
          </p>

          <h1
            className="mx-auto leading-[0.98] tracking-[-0.038em] max-w-[15ch]"
            style={{ fontSize: "clamp(2.5rem, 5.4vw, 4.5rem)", textWrap: "balance" } as any}
          >
            Are you <span className="xr-word text-primary italic">ready</span> for your next opportunity?
          </h1>

          <p className="mx-auto mt-5 text-base leading-relaxed text-muted-foreground max-w-[32rem]">
            Bring a resume, a project, or just the job you&apos;re aiming at. We read what you have,
            measure it against the role you want, and show you what stands in between.
          </p>

          <button
            onClick={() => onNavigate("register")}
            className="group mt-7 inline-flex items-center gap-2.5 bg-foreground text-background pl-7 pr-6 py-3.5 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Start your scan
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <p
            className="mt-4 text-xs text-muted-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            3 minutes · PDF or portfolio · AI-powered
          </p>
        </div>

        {/* ── The plate, landscape ── */}
        <div className="relative mt-10 lg:mt-11">
          <div
            className="absolute -inset-6 rounded-[1.75rem] blur-2xl pointer-events-none"
            style={{ background: "radial-gradient(50% 60% at 50% 25%, rgba(138,112,56,0.20), transparent 72%)" }}
          />

          <div
            className="relative overflow-hidden rounded-[1.25rem] px-7 py-6 shadow-[0_30px_70px_-35px_rgba(11,18,32,0.8)]"
            style={{ background: "linear-gradient(150deg, #16284B 0%, #0D1A33 55%, #0A1426 100%)" }}
          >
            {/* Header row: label and role on the left, score on the right */}
            <div className="relative flex items-center justify-between gap-6 mb-6">
              <div className="relative h-[46px] flex-1 min-w-0">
                {PANELS.map((panel, i) => (
                  <div key={panel.id} className="xr-panel absolute inset-0" style={{ animationDelay: `${i * 4}s` }}>
                    <p
                      className="text-[10px] uppercase tracking-[0.18em]"
                      style={{ fontFamily: "var(--font-mono)", color: "#8A9BB5" }}
                    >
                      {panel.label}
                    </p>
                    {panel.badge ? (
                      <div className="flex items-center gap-2.5 mt-1.5">
                        <img src={panel.badge.image} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                        <p className="text-[#E8EEF7] text-[15px] leading-tight tracking-tight truncate">
                          {panel.badge.role}
                          <span className="text-[#7186A3]"> · {panel.badge.animal}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-[#E8EEF7] text-[15px] mt-2 tracking-tight truncate">
                        Senior Data Analyst
                        <span className="text-[#7186A3]"> · aiming at ML Engineer</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="relative w-[58px] h-[58px] flex-shrink-0">
                <svg viewBox="0 0 58 58" className="w-full h-full -rotate-90">
                  <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(232,238,247,0.10)" strokeWidth="3.5" />
                  <circle
                    className="xr-arc"
                    cx="29" cy="29" r="24" fill="none"
                    stroke="#D9C18A" strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray="151" strokeDashoffset="151"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="xr-num text-[#E8EEF7] text-base leading-none" style={{ fontFamily: "var(--font-mono)" }}>72</span>
                  <span className="text-[8px] text-[#7186A3] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>/100</span>
                </div>
              </div>
            </div>

            {/* Three readings side by side */}
            <div className="relative h-[246px] sm:h-[92px]">
              {PANELS.map((panel, pi) => (
                <div
                  key={panel.id}
                  className="xr-panel absolute inset-0 grid sm:grid-cols-3 gap-2.5"
                  style={{ animationDelay: `${pi * 4}s` }}
                >
                  {panel.rows.map(row => (
                    <div
                      key={row.label}
                      className="rounded-xl px-4 py-3 flex flex-col justify-center"
                      style={{
                        background: "rgba(232,238,247,0.045)",
                        border: "1px solid rgba(232,238,247,0.08)",
                      }}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[13px] text-[#E8EEF7] leading-tight truncate">{row.label}</p>
                        <span
                          className="text-[13px] flex-shrink-0"
                          style={{ fontFamily: "var(--font-mono)", color: row.tone }}
                        >
                          {row.value}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7186A3] mt-1 leading-tight">{row.note}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Which panel, and how long it has left */}
            <div className="relative flex items-center gap-1.5 mt-5">
              {PANELS.map((panel, i) => (
                <div key={panel.id} className="h-0.5 flex-1 rounded-full overflow-hidden"
                     style={{ background: "rgba(232,238,247,0.10)" }}>
                  <div className="xr-tick h-full rounded-full"
                       style={{ background: "#D9C18A", animationDelay: `${i * 4}s` }} />
                </div>
              ))}
            </div>

            {/* The beam */}
            <div className="xr-beam pointer-events-none absolute inset-x-0 top-0 h-20">
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(217,193,138,0) 0%, rgba(217,193,138,0.04) 60%, rgba(217,193,138,0.13) 94%, rgba(255,245,220,0.18) 100%)",
                }}
              />
              <div
                className="h-px w-full"
                style={{
                  background: "linear-gradient(90deg, rgba(217,193,138,0) 0%, #F0E0B8 22%, #FFF8E6 50%, #F0E0B8 78%, rgba(217,193,138,0) 100%)",
                  boxShadow: "0 0 10px 1px rgba(240,224,184,0.5)",
                }}
              />
            </div>

            {[
              { pos: "top-3 left-3",     b: "border-t border-l" },
              { pos: "top-3 right-3",    b: "border-t border-r" },
              { pos: "bottom-3 left-3",  b: "border-b border-l" },
              { pos: "bottom-3 right-3", b: "border-b border-r" },
            ].map(c => (
              <div
                key={c.pos}
                className={`xr-reticle pointer-events-none absolute ${c.pos} ${c.b} w-3.5 h-3.5`}
                style={{ borderColor: "#D9C18A" }}
              />
            ))}
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
