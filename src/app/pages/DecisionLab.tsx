import { useState, useEffect, useRef } from "react";
import { NextStep } from "../state/stages";
import { useCareerProfile } from "../state/careerProfile";
import { TapirMark } from "../layout/TapirMark";
import { WhatIfSection } from "./WhatIfSection";
import { corpusFor, TIMELINE_LABELS, type CorpusFuture, type LandscapePosition } from "../lib/careerCorpus";
import {
  ChevronRight, Brain, Star, DollarSign, Clock, Zap, ArrowRight,
  TrendingUp, AlertTriangle, CheckCircle, Sparkles, Users,
  BarChart3, Shield, Heart
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

/* The three futures, the salary curves, and the market landscape all
   come from the corpus now. This page used to hold its own copy of them,
   fixed to a data analyst weighing a move into ML engineering — which is
   what everyone saw regardless of what they had scanned as. */

const fmtRM = (n: number) => `RM ${(n / 1000).toFixed(1)}k/mo`;

function riskTone(pct: number): string {
  return pct >= 55 ? "text-red-500" : pct >= 38 ? "text-amber-500" : "text-emerald-500";
}

function riskWord(pct: number): string {
  return pct >= 55 ? "High" : pct >= 38 ? "Moderate" : pct >= 22 ? "Low" : "Very low";
}

const SATISFACTION_TONE: Record<CorpusFuture["satisfactionTone"], string> = {
  good: "text-emerald-500",
  mixed: "text-amber-500",
  poor: "text-red-500",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DecisionLab({ onNavigate, onAskTapir }: { onNavigate?: (page: string) => void; onAskTapir?: (q?: string) => void }) {
  const { profile } = useCareerProfile();
  const corpus = corpusFor(profile);
  const futures = corpus.futures;

  /* Open on the recommended path rather than on standing still. */
  const [selected, setSelected] = useState<string>("target");
  const [showChart, setShowChart] = useState(false);

  const activeFuture = futures.find(f => f.id === selected) ?? futures[1];
  const [stayFuture, targetFuture] = futures;

  /* Recharts keys off the series name, so the legend and the lines both
     read the future's own role — no fixed "ML Eng" label. */
  const series = futures.map(f => ({ key: `${f.label} (${f.role})`, color: f.color }));
  const chartData = TIMELINE_LABELS.map((label, i) => {
    const row: Record<string, string | number> = { label };
    futures.forEach((f, fi) => { row[series[fi].key] = +(f.salaryData[i] / 1000).toFixed(1); });
    return row;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Decision Lab</h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-2xl leading-relaxed">
            Before you make a major career move, understand what your life looks like on the other side of each decision. These are your three possible futures — modeled by AI, grounded in market data.
          </p>
        </div>

        {/* The question this page always provokes, offered rather than
            waited for. It opens the assistant with it already asked. */}
        {onAskTapir && (
          <button
            onClick={() => onAskTapir(`Why these three paths for me and not others?`)}
            className="group flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-left transition hover:border-primary/40 hover:bg-accent"
          >
            <TapirMark size={30} className="flex-shrink-0" />
            <span className="flex-1 text-sm text-foreground">
              <strong className="font-semibold">Why these three paths?</strong>
              <span className="text-muted-foreground"> — ask and I&apos;ll show you what they came from.</span>
            </span>
            <ArrowRight size={15} className="flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        {/* Future selector — card-based */}
        <div className="grid md:grid-cols-3 gap-4">
          {futures.map(f => (
            <button
              key={f.id}
              onClick={() => setSelected(f.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${
                selected === f.id
                  ? `${f.borderColor} ${f.bgColor} shadow-md`
                  : "border-border bg-white hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{f.emoji}</span>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${selected === f.id ? "" : "text-muted-foreground"}`}
                     style={selected === f.id ? { color: f.color } : {}}>
                    {f.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground leading-snug">{f.tagline}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">5-year salary</p>
                  <p className="text-base font-bold text-foreground">{fmtRM(f.salary5yr)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI risk</p>
                  <p className={`text-sm font-bold ${riskTone(f.aiRiskPct)}`}>{riskWord(f.aiRiskPct)} ({f.aiRiskPct}%)</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Future narrative — the main story */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Story header */}
          <div className="px-8 py-6 border-b border-border" style={{ backgroundColor: `${activeFuture.color}08` }}>
            <div className="flex items-start gap-4">
              <span className="text-4xl">{activeFuture.emoji}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: activeFuture.color }}>{activeFuture.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{activeFuture.confidence}% confidence</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{activeFuture.tagline}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">{activeFuture.story}</p>
              </div>
            </div>
          </div>

          {/* Year-by-year story */}
          <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {[
              { label: "Year 1",    icon: Clock, text: activeFuture.oneYear   },
              { label: "Year 3",    icon: TrendingUp, text: activeFuture.threeYear },
              { label: "Year 5",    icon: Star, text: activeFuture.fiveYear   },
            ].map(yr => (
              <div key={yr.label} className="px-6 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                    <yr.icon size={13} className="text-muted-foreground" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{yr.label}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{yr.text}</p>
              </div>
            ))}
          </div>

          {/* Metrics row */}
          <div className="border-t border-border px-8 py-5 grid grid-cols-4 gap-6">
            {[
              { label: "5-year salary",   value: fmtRM(activeFuture.salary5yr),                                  color: "text-foreground" },
              { label: "AI risk",         value: `${riskWord(activeFuture.aiRiskPct)} (${activeFuture.aiRiskPct}%)`, color: riskTone(activeFuture.aiRiskPct) },
              { label: "Promotion odds",  value: `${activeFuture.promotionOddsPct}% over 5 years`,                 color: "text-foreground" },
              { label: "Satisfaction",    value: activeFuture.satisfaction,                                        color: SATISFACTION_TONE[activeFuture.satisfactionTone] },
            ].map(m => (
              <div key={m.label}>
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Pros & Cons */}
          <div className="border-t border-border px-8 py-5 grid lg:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">What works in your favor</p>
              <div className="space-y-2">
                {activeFuture.pros.map(p => (
                  <div key={p} className="flex items-start gap-2.5">
                    <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{p}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">What you need to navigate</p>
              <div className="space-y-2">
                {activeFuture.cons.map(c => (
                  <div key={c} className="flex items-start gap-2.5">
                    <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Verdict */}
          <div className="border-t border-border bg-slate-950 px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain size={17} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">AI assessment of this path</p>
                <p className="text-sm text-slate-200 leading-relaxed">{activeFuture.aiVerdict}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Salary chart — secondary, toggleable */}
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowChart(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">See all 3 salary trajectories compared</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">5-year projection</span>
            </div>
            <ChevronRight size={15} className={`text-muted-foreground transition-transform ${showChart ? "rotate-90" : ""}`} />
          </button>

          {showChart && (
            <div className="border-t border-border px-6 pb-6 pt-4">
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={v => `RM ${v}k`} />
                    <Tooltip formatter={(v: number) => [`RM ${v}k/mo`, ""]} />
                    {series.map(sr => (
                      <Line key={sr.key} type="monotone" dataKey={sr.key} stroke={sr.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-6 mt-2 justify-center">
                {series.map(sr => (
                  <div key={sr.key} className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: sr.color }} />
                    <span className="text-xs text-muted-foreground">{sr.key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Overall AI Recommendation */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-7 text-white">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-2">AI recommendation · {targetFuture.confidence}% confidence</p>
              <p className="text-lg font-bold mb-3">
                {targetFuture.label}: move into {targetFuture.role} within {corpus.transitionMonths[0]}–{corpus.transitionMonths[1]} months.
              </p>
              <p className="text-blue-100 text-sm leading-relaxed max-w-2xl">{targetFuture.aiVerdict}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <DollarSign size={13} /> +{fmtRM(targetFuture.salary5yr - stayFuture.salary5yr)} by year 5 vs. staying
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Shield size={13} /> AI risk: {stayFuture.aiRiskPct}% → {targetFuture.aiRiskPct}%
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Clock size={13} /> {corpus.transitionMonths[0]}–{corpus.transitionMonths[1]} months to transition
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Market Salary Comparison ── */}
        <WhatIfSection />

        <MarketSalaryGraph positions={corpus.salaryLandscape} />

        <NextStep currentPage="decisionlab" onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Market Salary Comparison — animated bar race chart
   ═══════════════════════════════════════════════════════════════════════════════ */

/* Positions and company bands come from the corpus, so this compares
   the three roles the user is actually choosing between rather than a
   fixed trio of data-analytics titles. */

function MarketSalaryGraph({ positions }: { positions: LandscapePosition[] }) {
  const [activePos, setActivePos] = useState(0);
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const animRef = useRef(0);
  const startRef = useRef(0);

  const data = positions[activePos] ?? positions[0];
  const sorted = [...data.companies].sort((a, b) => b.median - a.median);
  const maxVal = Math.max(...sorted.map(c => c.max)) * 1.08;

  useEffect(() => {
    setAnimProgress(0);
    startRef.current = performance.now();
    const dur = 900;
    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimProgress(eased);
      if (t < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [activePos]);

  const W = 780;
  const H = 420;
  const LEFT = 130;
  const RIGHT = 40;
  const TOP = 30;
  const BOT = 30;
  const chartW = W - LEFT - RIGHT;
  const barH = 36;
  const gap = 8;
  const chartH = sorted.length * (barH + gap);

  const xScale = (val: number) => LEFT + (val / maxVal) * chartW;

  const yourPay = data.yourPay;
  const yourX = xScale(yourPay ?? data.marketMedian);
  const medianX = xScale(data.marketMedian);

  /* A fixed 0–16k grid left a service-sector chart with two lines and a
     senior-tech one crowded, so the step follows the range. */
  const gridStep = maxVal > 24000 ? 5000 : maxVal > 12000 ? 2000 : maxVal > 6000 ? 1000 : 500;
  const gridLines = Array.from({ length: Math.floor(maxVal / gridStep) + 1 }, (_, i) => i * gridStep);

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                <DollarSign size={16} className="text-amber-300" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Market Salary Benchmark</h2>
            </div>
            <p className="text-sm text-muted-foreground">Compare salary ranges across companies for each position — powered by market intelligence.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-muted border border-border rounded-xl p-1">
            {positions.map((pos, i) => (
              <button key={pos.id} onClick={() => setActivePos(i)}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                  activePos === i ? "bg-slate-950 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                {pos.position}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 py-5">
        <div className="relative overflow-x-auto">
          <svg width="100%" viewBox={`0 0 ${W} ${TOP + chartH + BOT}`} className="select-none" style={{ minWidth: 600 }}>
            <defs>
              {sorted.map((c, i) => (
                <linearGradient key={`grad-${i}`} id={`salary-grad-${activePos}-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={c.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={c.color} stopOpacity={0.7} />
                </linearGradient>
              ))}
              <linearGradient id="your-offer-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8A7038" />
                <stop offset="100%" stopColor="#B59B4E" />
              </linearGradient>
              <filter id="bar-glow" x="-10%" y="-40%" width="120%" height="180%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid */}
            {gridLines.map(v => {
              const x = xScale(v);
              return (
                <g key={`grid-${v}`}>
                  <line x1={x} y1={TOP - 5} x2={x} y2={TOP + chartH} stroke="rgba(22,40,75,0.06)" strokeWidth={1} />
                  <text x={x} y={TOP - 10} textAnchor="middle" fontSize={10} fill="rgba(22,40,75,0.35)"
                    style={{ fontFamily: "var(--font-mono, monospace)" }}>
                    {v >= 1000 ? `RM ${(v / 1000).toFixed(0)}k` : `RM ${v}`}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {sorted.map((c, i) => {
              const y = TOP + i * (barH + gap);
              const minX = xScale(c.min * animProgress);
              const maxX = xScale(c.max * animProgress);
              const medX = xScale(c.median * animProgress);
              const rangeW = maxX - minX;
              const isHovered = hoveredBar === i;

              return (
                <g key={c.company}
                  onPointerEnter={() => setHoveredBar(i)}
                  onPointerLeave={() => setHoveredBar(null)}
                  style={{ cursor: "pointer" }}>
                  {/* Company label */}
                  <text x={LEFT - 10} y={y + barH / 2 + 1} textAnchor="end" fontSize={12}
                    fontWeight={isHovered ? 700 : 600}
                    fill={isHovered ? c.color : "#16284B"}
                    style={{ fontFamily: "var(--font-sans)", transition: "fill 0.2s" }}>
                    {c.company}
                  </text>

                  {/* Range background */}
                  <rect x={minX} y={y + 4} width={Math.max(rangeW, 0)} height={barH - 8} rx={6}
                    fill={`url(#salary-grad-${activePos}-${i})`}
                    filter={isHovered ? "url(#bar-glow)" : undefined}
                    style={{ transition: "filter 0.2s" }}
                  />

                  {/* Glow on hover */}
                  {isHovered && (
                    <rect x={minX} y={y + 4} width={Math.max(rangeW, 0)} height={barH - 8} rx={6}
                      fill={c.glow} />
                  )}

                  {/* Median dot */}
                  <circle cx={medX} cy={y + barH / 2} r={isHovered ? 7 : 5}
                    fill={c.color} stroke="white" strokeWidth={2}
                    style={{ transition: "r 0.2s" }}
                  />

                  {/* Median label */}
                  {(isHovered || i === 0) && animProgress > 0.5 && (
                    <text x={medX} y={y + 1} textAnchor="middle" fontSize={10} fontWeight={700}
                      fill={c.color} style={{ fontFamily: "var(--font-mono, monospace)" }}>
                      RM {(c.median * animProgress / 1000).toFixed(1)}k
                    </text>
                  )}

                  {/* Min/Max labels on hover */}
                  {isHovered && animProgress > 0.5 && (
                    <>
                      <text x={minX - 4} y={y + barH / 2 + 4} textAnchor="end" fontSize={9}
                        fill="rgba(22,40,75,0.4)" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                        RM {(c.min * animProgress / 1000).toFixed(1)}k
                      </text>
                      <text x={maxX + 4} y={y + barH / 2 + 4} textAnchor="start" fontSize={9}
                        fill="rgba(22,40,75,0.4)" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                        RM {(c.max * animProgress / 1000).toFixed(1)}k
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Your offer line */}
            {yourPay !== null && animProgress > 0.3 && (
              <g style={{ opacity: animProgress }}>
                <line x1={yourX} y1={TOP - 2} x2={yourX} y2={TOP + chartH + 2}
                  stroke="url(#your-offer-grad)" strokeWidth={2.5} strokeDasharray="6,4" />
                <rect x={yourX - 40} y={TOP + chartH + 6} width={80} height={20} rx={10}
                  fill="#8A7038" />
                <text x={yourX} y={TOP + chartH + 19} textAnchor="middle" fontSize={10} fontWeight={700} fill="white"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}>
                  You: RM {(yourPay! / 1000).toFixed(1)}k
                </text>
              </g>
            )}

            {/* Market median line */}
            {animProgress > 0.3 && (
              <g style={{ opacity: animProgress * 0.6 }}>
                <line x1={medianX} y1={TOP - 2} x2={medianX} y2={TOP + chartH + 2}
                  stroke="rgba(22,40,75,0.25)" strokeWidth={1.5} strokeDasharray="3,5" />
                <text x={medianX} y={TOP + chartH + 18} textAnchor="middle" fontSize={9} fill="rgba(22,40,75,0.4)"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}>
                  Mkt RM {(data.marketMedian / 1000).toFixed(1)}k
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Insight cards */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {(() => {
            const highest = sorted[0];
            const lowest = sorted[sorted.length - 1];
            const aboveMarket = yourPay !== null && yourPay > data.marketMedian;
            const diff = yourPay === null ? 0 : Math.abs(yourPay - data.marketMedian);
            const pct = Math.round((diff / data.marketMedian) * 100);
            return [
              /* With no salary stated there is nothing to compare against,
                 so this card reports the market instead of inventing a gap. */
              yourPay === null
                ? {
                    label: "Market median",
                    value: `RM ${(data.marketMedian / 1000).toFixed(1)}k`,
                    desc: `Add your current pay in your profile to see your gap to ${data.position}`,
                    color: "#16284B",
                    bg: "rgba(22,40,75,0.04)",
                  }
                : {
                    label: aboveMarket ? "Above Market" : "Below Market",
                    value: `${aboveMarket ? "+" : "−"}RM ${(diff / 1000).toFixed(1)}k`,
                    desc: `Your pay is ${pct}% ${aboveMarket ? "above" : "below"} the median for ${data.position}`,
                    color: aboveMarket ? "#115E50" : "#C62828",
                    bg: aboveMarket ? "rgba(17,94,80,0.06)" : "rgba(198,40,40,0.06)",
                  },
              {
                label: "Highest Payer",
                value: highest.company,
                desc: `Median RM ${(highest.median / 1000).toFixed(1)}k (range RM ${(highest.min / 1000).toFixed(1)}k–${(highest.max / 1000).toFixed(1)}k)`,
                color: highest.color,
                bg: highest.glow,
              },
              {
                label: "Market Spread",
                value: `RM ${((sorted[0].median - sorted[sorted.length - 1].median) / 1000).toFixed(1)}k`,
                desc: `Between ${highest.company} and ${lowest.company}`,
                color: "#16284B",
                bg: "rgba(22,40,75,0.04)",
              },
            ];
          })().map(card => (
            <div key={card.label} className="rounded-xl p-4 border" style={{ backgroundColor: card.bg, borderColor: "rgba(22,40,75,0.08)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(22,40,75,0.45)" }}>{card.label}</p>
              <p className="text-lg font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(22,40,75,0.5)" }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
