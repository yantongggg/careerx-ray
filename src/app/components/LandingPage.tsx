import { useState, useEffect } from "react";
import {
  AlertTriangle, ChevronRight, BarChart3, ArrowRight,
  CheckCircle, Shield, Brain, FlaskConical, Pill,
  TrendingDown, Clock, Zap, ArrowDown, Users
} from "lucide-react";
// Semicircle health arc — no recharts, no duplicate-key risk
function ScoreArc({ score }: { score: number }) {
  const r = 72, cx = 96, cy = 96;
  const circ = Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width="100%" height="100%" viewBox="0 0 192 112" preserveAspectRatio="xMidYMid meet">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#EFEDE6" strokeWidth={14} strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#8A7038" strokeWidth={14} strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`} style={{ transition: "stroke-dasharray 0.9s ease" }} />
      <text x={cx - r} y={cy + 20} textAnchor="middle" fontSize={11} fill="#94A3B8">0</text>
      <text x={cx + r} y={cy + 20} textAnchor="middle" fontSize={11} fill="#94A3B8">100</text>
      <text x={cx} y={cy - 6}  textAnchor="middle" fontSize={12} fill="#94A3B8">Career Health</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={30} fontWeight={700} fill="#1E293B">{score}</text>
    </svg>
  );
}

// Static SVG comparison chart — avoids recharts multi-series duplicate-key bug
function SalaryComparisonChart() {
  // Data points: [stay, pivot] salary in $k, mapped to SVG coords
  const W = 480, H = 160, PAD_L = 40, PAD_R = 16, PAD_T = 12, PAD_B = 28;
  const labels = ["Now", "Q2", "Q3", "Q4", "Y2"];
  const stay  = [110, 112, 113, 114, 116];
  const pivot = [110, 118, 128, 138, 148];
  const allVals = [...stay, ...pivot];
  const minV = 105, maxV = 155;
  const n = labels.length;

  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const px = (i: number) => PAD_L + (i / (n - 1)) * chartW;
  const py = (v: number) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const polyline = (vals: number[]) =>
    vals.map((v, i) => `${px(i)},${py(v)}`).join(" ");

  const areaPath = (vals: number[]) => {
    const pts = vals.map((v, i) => `${px(i)},${py(v)}`).join(" L ");
    const base = `${px(n - 1)},${py(minV)} L ${px(0)},${py(minV)}`;
    return `M ${pts} L ${base} Z`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="svg-stay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#D9C18A" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#D9C18A" stopOpacity={0}    />
        </linearGradient>
        <linearGradient id="svg-pivot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#115E50" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#115E50" stopOpacity={0}   />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[110, 120, 130, 140, 150].map(v => (
        <g key={v}>
          <line x1={PAD_L} y1={py(v)} x2={W - PAD_R} y2={py(v)} stroke="#F1F5F9" strokeWidth={1} />
          <text x={PAD_L - 6} y={py(v) + 4} textAnchor="end" fontSize={9} fill="#CBD5E1">${v}k</text>
        </g>
      ))}

      {/* Area fills */}
      <path d={areaPath(stay)}  fill="url(#svg-stay)"  />
      <path d={areaPath(pivot)} fill="url(#svg-pivot)" />

      {/* Lines */}
      <polyline points={polyline(stay)}  fill="none" stroke="#8A7038" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={polyline(pivot)} fill="none" stroke="#115E50" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {stay.map((v, i)  => <circle key={`sd-${i}`} cx={px(i)} cy={py(v)} r={3.5} fill="#8A7038" stroke="white" strokeWidth={1.5} />)}
      {pivot.map((v, i) => <circle key={`pd-${i}`} cx={px(i)} cy={py(v)} r={3.5} fill="#115E50" stroke="white" strokeWidth={1.5} />)}

      {/* End labels */}
      <text x={px(n-1) + 6} y={py(stay[n-1])  + 4} fontSize={10} fill="#8A7038" fontWeight={600}>${stay[n-1]}k</text>
      <text x={px(n-1) + 6} y={py(pivot[n-1]) + 4} fontSize={10} fill="#115E50" fontWeight={600}>${pivot[n-1]}k</text>

      {/* X labels */}
      {labels.map((l, i) => (
        <text key={l} x={px(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#94A3B8">{l}</text>
      ))}
    </svg>
  );
}

const journeySteps = [
  {
    num: "01",
    icon: Zap,
    label: "Career X-Ray Scan",
    desc: "AI extracts your Career DNA, benchmarks you against the market, and calculates your Career Health Score.",
    color: "text-[#8A7038]",
    bg: "bg-[rgba(184,154,94,0.1)]",
    border: "border-[rgba(184,154,94,0.3)]",
  },
  {
    num: "02",
    icon: AlertTriangle,
    label: "Blind Spot Detection",
    desc: "Surface the risks you can't see — AI automation exposure, stagnation signals, market demand decay.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    num: "03",
    icon: FlaskConical,
    label: "Decision Lab",
    desc: "Simulate up to 4 career paths. Compare salary, promotion probability, AI risk, and satisfaction across 5 years.",
    color: "text-[#1B5CA3]",
    bg: "bg-[rgba(27,92,163,0.08)]",
    border: "border-[rgba(27,92,163,0.25)]",
  },
  {
    num: "04",
    icon: Pill,
    label: "Career Prescription",
    desc: "Receive a personalized 30/90-day action plan — ranked actions, certifications, and moves to prevent regret.",
    color: "text-[#115E50]",
    bg: "bg-[rgba(17,94,80,0.08)]",
    border: "border-[rgba(17,94,80,0.25)]",
  },
];

const regretSignals = [
  { label: "62% of tasks automatable within 24 months",   severity: "critical" },
  { label: "Salary 14% below market for your experience", severity: "high"     },
  { label: "Core skills haven't grown in 14 months",      severity: "high"     },
  { label: "Promotion probability declining each quarter", severity: "medium"  },
];

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      let n = 0;
      const iv = setInterval(() => { n += 2; setAnimScore(n); if (n >= 74) clearInterval(iv); }, 16);
      return () => clearInterval(iv);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">CareerX-Ray</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Sign in</button>
            <button
              onClick={() => onNavigate("onboarding")}
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              Get Your X-Ray
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 pb-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[5fr_7fr] gap-12 items-center">

            {/* ── Left: Copy ── */}
            <div className="max-w-sm">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3.5 py-1.5 mb-5">
                <AlertTriangle size={12} className="text-red-500" />
                <span className="text-xs text-red-600 font-medium">Career mistakes are invisible until it's too late</span>
              </div>

              <h1 className="text-4xl font-bold text-foreground leading-snug tracking-tight mb-4">
                Discover hidden<br />
                career risks<br />
                <span className="text-primary">before they become</span><br />
                <span className="text-primary">career regrets.</span>
              </h1>

              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                CareerX-Ray scans your career, surfaces blind spots, simulates your future decisions, and prescribes a clear path — before you make the wrong move.
              </p>

              <p className="text-sm font-semibold text-foreground mb-7">Stop guessing. Start navigating.</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onNavigate("onboarding")}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90 transition-all font-medium shadow-md shadow-[rgba(138,112,56,0.2)] text-sm"
                >
                  Run My Career X-Ray <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => onNavigate("command")}
                  className="flex items-center justify-center gap-2 border border-border text-foreground px-5 py-3 rounded-xl hover:bg-muted transition-colors font-medium text-sm"
                >
                  See a Demo <ChevronRight size={15} />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">No credit card · 3 minutes · Free to start</p>
            </div>

            {/* ── Right: Product showcase ── */}
            <div>
              <div className="bg-white rounded-2xl border border-border shadow-2xl shadow-[rgba(22,40,75,0.08)] overflow-hidden">

                {/* Card top bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                      <BarChart3 size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Career X-Ray Result</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Jordan Kim · Jun 2026</span>
                  </div>
                  <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                    Needs Attention
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_1px_1fr]">

                  {/* Left panel: Score */}
                  <div className="flex flex-col items-center justify-center px-8 py-8">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Career Health Score</p>
                    {/* Score arc */}
                    <div style={{ width: "100%", maxWidth: 220, height: 140 }}>
                      <ScoreArc score={animScore} />
                    </div>
                    {/* 4-metric grid */}
                    <div className="grid grid-cols-2 gap-2 w-full mt-5">
                      {[
                        { label: "AI Exposure",        value: "High",  color: "text-red-500",    dot: "bg-red-400"    },
                        { label: "Salary Gap",          value: "–14%",  color: "text-amber-500",  dot: "bg-amber-400"  },
                        { label: "Skill Growth",        value: "Flat",  color: "text-amber-500",  dot: "bg-amber-400"  },
                        { label: "Promotion Ready",     value: "65%",   color: "text-[#1B5CA3]",  dot: "bg-[#1B5CA3]"  },
                      ].map(m => (
                        <div key={m.label} className="bg-muted rounded-xl px-3 py-3">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.dot}`} />
                            <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vertical divider */}
                  <div className="bg-border" />

                  {/* Right panel: Blind spots */}
                  <div className="px-6 py-8 flex flex-col">
                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={12} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none">4 Hidden Risks Detected</p>
                        <p className="text-xs text-muted-foreground mt-0.5">AI identified these blind spots</p>
                      </div>
                    </div>

                    {/* Risk list */}
                    <div className="space-y-2.5 flex-1">
                      {[
                        { icon: Brain,         label: "High AI Exposure",       detail: "62% of tasks automatable within 24 months", severity: "critical" },
                        { icon: TrendingDown,  label: "Salary Below Market",    detail: "Earning $20k below your peer cohort",        severity: "high"     },
                        { icon: Shield,        label: "Skill Stagnation",       detail: "Python skills haven't grown in 14 months",   severity: "high"     },
                        { icon: Users,         label: "Leadership Gap",         detail: "No team-lead record — promotion blocker",    severity: "medium"   },
                      ].map(r => {
                        const badgeStyle =
                          r.severity === "critical" ? "bg-red-100 text-red-600"    :
                          r.severity === "high"     ? "bg-amber-100 text-amber-600" :
                          "bg-yellow-100 text-yellow-700";
                        const iconColor =
                          r.severity === "critical" ? "text-red-500"   :
                          r.severity === "high"     ? "text-amber-500"  :
                          "text-yellow-600";
                        return (
                          <div key={r.label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors">
                            <r.icon size={14} className={`${iconColor} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground">{r.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{r.detail}</p>
                            </div>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 capitalize ${badgeStyle}`}>
                              {r.severity}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* CTA inside card */}
                    <button
                      onClick={() => onNavigate("onboarding")}
                      className="mt-5 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-xl hover:opacity-90 transition-colors"
                    >
                      <Zap size={13} /> Get My Career X-Ray
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── The core problem ── */}
      <section className="py-16 px-6 bg-[#16284B] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#D9C18A] text-sm font-semibold uppercase tracking-wider mb-4">The problem</p>
          <h2 className="text-3xl font-bold text-white leading-tight mb-5">
            Most professionals only realize they made the wrong career decision <span className="text-[#D9C18A]">years later.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mb-10">
            By the time you notice stagnation, automation, or a salary gap — the compounding damage has already been done. You needed this information 18 months ago.
          </p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { stat: "67%",  label: "of professionals have experienced a major career regret"     },
              { stat: "2.4yr",label: "average time to notice a bad career decision was wrong"      },
              { stat: "$84k", label: "average cumulative salary loss from a single delayed switch" },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-white mb-2">{s.stat}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The 4-step journey ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">How CareerX-Ray works</p>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Understand the long-term impact of<br />your career decisions before you make them.</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {journeySteps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < journeySteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 w-8 h-px bg-border translate-x-4 z-10" />
                )}
                <div className={`p-6 rounded-2xl border ${s.bg} ${s.border} h-full`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-bold ${s.color} opacity-50`}>{s.num}</span>
                    <div className={`w-8 h-8 bg-white border ${s.border} rounded-xl flex items-center justify-center`}>
                      <s.icon size={15} className={s.color} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{s.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blind spot preview ── */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Blind Spot Detection</p>
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-4">
                See what's damaging your<br />career before it's obvious.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
                CareerX-Ray scans your career profile against 50+ risk models — AI automation exposure, skill stagnation, market demand decay, salary drift, and network decay. Most of these signals are invisible without the data.
              </p>
              <button
                onClick={() => onNavigate("onboarding")}
                className="flex items-center gap-2 text-sm text-primary font-semibold hover:gap-3 transition-all"
              >
                Scan my blind spots <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {regretSignals.map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    s.severity === "critical" ? "bg-red-50 border-red-200"  :
                    s.severity === "high"     ? "bg-amber-50 border-amber-200" :
                    "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <AlertTriangle size={15} className={
                    s.severity === "critical" ? "text-red-500 flex-shrink-0" :
                    s.severity === "high"     ? "text-amber-500 flex-shrink-0" :
                    "text-yellow-500 flex-shrink-0"
                  } />
                  <span className="text-sm text-foreground font-medium">{s.label}</span>
                  <span className={`ml-auto text-xs font-bold flex-shrink-0 ${
                    s.severity === "critical" ? "text-red-500" :
                    s.severity === "high"     ? "text-amber-500" :
                    "text-yellow-600"
                  }`}>{s.severity === "critical" ? "Critical" : s.severity === "high" ? "High" : "Medium"}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">Communication & leadership — strong, no risk</span>
                <span className="ml-auto text-xs font-bold text-emerald-600">Clear</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Decision Lab preview ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Decision Lab</p>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Simulate career decisions before<br />you live with the consequences.
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
              Compare paths side-by-side with salary, promotion probability, AI risk, and satisfaction scores — across best, realistic, and worst case scenarios.
            </p>
          </div>

          <div className="bg-white border border-border rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              {[
                { label: "Stay → Senior Analyst",  color: "bg-[#8A7038]"  },
                { label: "Switch → ML Engineer",   color: "bg-[#115E50]"  },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  {s.label}
                </div>
              ))}
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Realistic case · 5-year projection</span>
            </div>

            <SalaryComparisonChart />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">5-year salary delta (realistic case)</p>
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                <TrendingDown size={14} className="rotate-180" /> +$38k/yr by switching · 84% confidence
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#16284B] rounded-2xl p-12 text-center">
            <div className="w-12 h-12 bg-[rgba(217,193,138,0.15)] rounded-xl flex items-center justify-center mx-auto mb-6">
              <Shield size={22} className="text-[#D9C18A]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Run your Career X-Ray.</h2>
            <p className="text-slate-300 mb-2">Discover hidden risks. Simulate your next move.</p>
            <p className="text-slate-300 mb-8">Prevent the career regret you won't see coming.</p>
            <button
              onClick={() => onNavigate("onboarding")}
              className="bg-[#D9C18A] text-[#16284B] px-8 py-3.5 rounded-xl font-semibold hover:bg-[#B89A5E] transition-colors shadow-lg text-sm"
            >
              Start My Free X-Ray Scan
            </button>
            <p className="text-slate-500 text-xs mt-4">Free · No credit card · 3 minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <BarChart3 size={11} className="text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">CareerX-Ray</span>
            <span className="text-xs text-muted-foreground ml-2">Career Decision Intelligence</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 CareerX-Ray, Inc.</p>
        </div>
      </footer>
    </div>
  );
}

