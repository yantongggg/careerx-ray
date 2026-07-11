import { useState, useEffect, useRef } from "react";
import {
  ChevronRight, Brain, Star, DollarSign, Clock, Zap, ArrowRight,
  TrendingUp, AlertTriangle, CheckCircle, Sparkles, Users,
  BarChart3, Shield, Heart
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

// ─── Future Self data ────────────────────────────────────────────────────────

interface Future {
  id: string;
  label: string;
  tagline: string;
  color: string;
  dotColor: string;
  borderColor: string;
  bgColor: string;
  emoji: string;
  story: string;         // The narrative "If you choose this path..."
  oneYear: string;       // What year 1 looks like
  threeYear: string;     // What year 3 looks like
  fiveYear: string;      // What year 5 looks like
  salary5yr: string;
  aiRisk: string;
  aiRiskColor: string;
  promotionOdds: string;
  satisfaction: string;
  satisfactionColor: string;
  salaryData: number[];
  pros: string[];
  cons: string[];
  aiVerdict: string;
  confidence: number;
}

const futures: Future[] = [
  {
    id: "stay",
    label: "Future A",
    tagline: "You stay on your current path.",
    color: "#3B82F6",
    dotColor: "bg-blue-500",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    emoji: "⏸️",
    story: "You continue as Senior Data Analyst at Stripe. No dramatic changes. Reasonable raises. Familiar work. On the surface, it's safe.",
    oneYear: "Salary grows to RM 125k with a standard review cycle. The work feels manageable. You're good at it. But the AI tools your team adopted are now handling 40% of what you used to own.",
    threeYear: "Your role has been quietly restructured. The BI function consolidated. You're still employed — but your title hasn't changed, your scope has narrowed, and two analysts junior to you were promoted into different tracks.",
    fiveYear: "You're earning RM 128k. The market rate for your peers who made moves is RM 162k+. You're good at your job — but you're no longer growing. And you know it.",
    salary5yr: "RM 128k",
    aiRisk: "High (62%)",
    aiRiskColor: "text-red-500",
    promotionOdds: "22% over 5 years",
    satisfaction: "Declining",
    satisfactionColor: "text-amber-500",
    salaryData: [110, 113, 116, 120, 123, 125, 126, 127, 127, 128],
    pros: ["Zero transition risk", "Familiar environment", "Strong team relationships"],
    cons: ["AI exposure keeps compounding", "Salary gap widens every year", "Promotion ceiling becomes clearer"],
    aiVerdict: "This path is not as safe as it feels. Stability is an illusion in a role with 62% automation exposure. The career regret risk is highest here — because the decline is gradual, invisible, and hard to reverse once it's obvious.",
    confidence: 88,
  },
  {
    id: "ml",
    label: "Future B",
    tagline: "You transition into ML Engineering.",
    color: "#22C55E",
    dotColor: "bg-emerald-500",
    borderColor: "border-emerald-200",
    bgColor: "bg-emerald-50",
    emoji: "🚀",
    story: "You spend the next 9–12 months closing the skill gap. It's uncomfortable at first. Then it accelerates. Your Python + SQL foundation reduces the learning curve by months.",
    oneYear: "You complete the AWS cert and two ML portfolio projects. You start applying. The interviews are harder than your current role. You get rejected twice. Then you get an offer at RM 138k — an ML Engineer role at a fintech company.",
    threeYear: "You're 18 months into the new role. Your skills are compounding faster than they ever did as an analyst. You're building things that ship. Your salary is RM 155k. You're being sponsored for a Staff role.",
    fiveYear: "You're earning RM 162k, with equity. AI Risk exposure is 28% — you're building the automation, not being replaced by it. Career satisfaction is at its highest point in your professional life.",
    salary5yr: "RM 162k",
    aiRisk: "Low (28%)",
    aiRiskColor: "text-emerald-500",
    promotionOdds: "68% over 5 years",
    satisfaction: "High",
    satisfactionColor: "text-emerald-500",
    salaryData: [110, 114, 120, 128, 136, 142, 148, 154, 158, 162],
    pros: ["Highest long-term earnings", "AI-proof skill set", "RM 34k salary jump potential"],
    cons: ["9–14 months of transition investment", "Rejection risk in interviews", "Imposter syndrome is real and temporary"],
    aiVerdict: "This is the highest risk-adjusted path. Your Python and SQL foundation means your transition timeline is 4 months shorter than average. The skill gap is real but closable. This is the path where career regret is least likely.",
    confidence: 84,
  },
  {
    id: "manager",
    label: "Future C",
    tagline: "You pursue promotion to Data Science Manager.",
    color: "#A855F7",
    dotColor: "bg-purple-500",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50",
    emoji: "📈",
    story: "You decide the technical ladder isn't where you want to go long-term. You want to lead. You spend the next 12–18 months building leadership scope — deliberately, visibly, strategically.",
    oneYear: "You lead a cross-functional project that ships. You formally mentor two analysts. Your manager starts including you in planning conversations you weren't in before. No title change yet. But the narrative is shifting.",
    threeYear: "You're promoted to Data Science Manager. Your salary jumps to RM 155k. You manage a team of 4. It's harder than you expected. You have less time for the technical work you love — but more influence than you've ever had.",
    fiveYear: "You're earning RM 175k as a senior manager overseeing a team of 8. AI Risk exposure is 18% — leadership roles are highly protected. But you sometimes miss the craft of building things yourself.",
    salary5yr: "RM 175k",
    aiRisk: "Very Low (18%)",
    aiRiskColor: "text-emerald-500",
    promotionOdds: "74% over 5 years",
    satisfaction: "Mixed",
    satisfactionColor: "text-amber-500",
    salaryData: [110, 113, 118, 126, 134, 141, 148, 158, 165, 175],
    pros: ["Highest salary ceiling", "Very low AI displacement risk", "Leadership creates compounding career capital"],
    cons: ["Requires 12–18 months of deliberate positioning", "Less hands-on technical work", "Management is a different job — not just a promotion"],
    aiVerdict: "This path has the highest ceiling but the longest runway. It requires you to be strategic — not just competent. Your technical depth is a real asset in management. The risk is that most people underestimate how different managing is from doing.",
    confidence: 79,
  },
];

const timelineLabels = ["Now", "6mo", "1yr", "18mo", "2yr", "2.5yr", "3yr", "3.5yr", "4yr", "5yr"];

// ─── Component ───────────────────────────────────────────────────────────────

export function DecisionLab({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [selected, setSelected] = useState<string>("ml");
  const [showChart, setShowChart] = useState(false);

  const activeFuture = futures.find(f => f.id === selected)!;

  const chartData = timelineLabels.map((label, i) => ({
    label,
    "Future A (Stay)":    futures[0].salaryData[i],
    "Future B (ML Eng)":  futures[1].salaryData[i],
    "Future C (Manager)": futures[2].salaryData[i],
  }));

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
                  <p className="text-xs text-muted-foreground">5yr salary</p>
                  <p className="text-base font-bold text-foreground">{f.salary5yr}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Risk</p>
                  <p className={`text-sm font-bold ${f.aiRiskColor}`}>{f.aiRisk}</p>
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
              { label: "5-Year Salary",   value: activeFuture.salary5yr,        color: "text-foreground" },
              { label: "AI Risk",         value: activeFuture.aiRisk,            color: activeFuture.aiRiskColor },
              { label: "Promotion Odds",  value: activeFuture.promotionOdds,     color: "text-foreground" },
              { label: "Satisfaction",    value: activeFuture.satisfaction,      color: activeFuture.satisfactionColor },
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
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">AI Assessment of This Path</p>
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
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={v => `RM${v}k`} />
                    <Tooltip formatter={(v: number) => [`RM${v}k`, ""]} />
                    <Line key="line-stay"    type="monotone" dataKey="Future A (Stay)"    stroke="#3B82F6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line key="line-ml"      type="monotone" dataKey="Future B (ML Eng)"  stroke="#22C55E" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line key="line-manager" type="monotone" dataKey="Future C (Manager)" stroke="#A855F7" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-6 mt-2 justify-center">
                {[["Future A (Stay)","#3B82F6"],["Future B (ML Eng)","#22C55E"],["Future C (Manager)","#A855F7"]].map(([l,c])=>(
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: c }} />
                    <span className="text-xs text-muted-foreground">{l}</span>
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
              <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-2">AI Recommendation · 87% confidence</p>
              <p className="text-lg font-bold mb-3">Future B: Transition to ML Engineering within 12 months.</p>
              <p className="text-blue-100 text-sm leading-relaxed max-w-2xl">
                Across all three paths, the ML Engineering transition delivers the best risk-adjusted outcome for your specific profile. Your Python and SQL depth reduces the transition timeline by an estimated 4 months versus a typical candidate. Future A (staying) carries more career risk than it appears. Future C (management) is viable, but requires 18+ months of deliberate positioning that you haven't started yet.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <DollarSign size={13} /> +RM 52k over 5 years vs. staying
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Shield size={13} /> AI Risk: 62% → 28%
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Clock size={13} /> 9–14 months to transition
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Market Salary Comparison ── */}
        <MarketSalaryGraph />

        {/* CTA to Prescription */}
        <div className="bg-muted border border-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">You've seen your futures. Now get the treatment plan.</p>
            <p className="text-sm text-muted-foreground mt-1">Career Prescription turns this analysis into a day-by-day action plan.</p>
          </div>
          <button onClick={() => onNavigate?.("prescription")} className="flex-shrink-0 flex items-center gap-2 bg-primary text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
            View My Prescription <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Market Salary Comparison — animated bar race chart
   ═══════════════════════════════════════════════════════════════════════════════ */

interface SalaryEntry {
  company: string;
  min: number;
  max: number;
  median: number;
  color: string;
  glow: string;
}

interface PositionSalary {
  id: string;
  position: string;
  yourOffer: number;
  marketMedian: number;
  companies: SalaryEntry[];
}

const SALARY_DATA: PositionSalary[] = [
  {
    id: "data-analyst",
    position: "Data Analyst",
    yourOffer: 8500,
    marketMedian: 7800,
    companies: [
      { company: "Maybank",          min: 7000, max: 9500,  median: 8200,  color: "#FFB300", glow: "rgba(255,179,0,0.25)" },
      { company: "CIMB",             min: 6500, max: 9000,  median: 7800,  color: "#C62828", glow: "rgba(198,40,40,0.2)" },
      { company: "Grab",             min: 8000, max: 12000, median: 9800,  color: "#2E7D32", glow: "rgba(46,125,50,0.2)" },
      { company: "Shopee",           min: 7500, max: 11000, median: 9200,  color: "#E65100", glow: "rgba(230,81,0,0.2)" },
      { company: "Petronas Digital", min: 7000, max: 10000, median: 8500,  color: "#0D47A1", glow: "rgba(13,71,161,0.2)" },
      { company: "Axiata",           min: 6800, max: 9200,  median: 7600,  color: "#4527A0", glow: "rgba(69,39,160,0.15)" },
      { company: "TNG Digital",      min: 7200, max: 10500, median: 8800,  color: "#00695C", glow: "rgba(0,105,92,0.2)" },
    ],
  },
  {
    id: "analytics-engineer",
    position: "Analytics Engineer",
    yourOffer: 10500,
    marketMedian: 9600,
    companies: [
      { company: "Grab",             min: 9000,  max: 14000, median: 11500, color: "#2E7D32", glow: "rgba(46,125,50,0.2)" },
      { company: "Shopee",           min: 8500,  max: 13000, median: 10800, color: "#E65100", glow: "rgba(230,81,0,0.2)" },
      { company: "GoTo",             min: 8000,  max: 12500, median: 10200, color: "#1565C0", glow: "rgba(21,101,192,0.2)" },
      { company: "Maybank",          min: 7500,  max: 11000, median: 9200,  color: "#FFB300", glow: "rgba(255,179,0,0.25)" },
      { company: "Petronas Digital", min: 8000,  max: 11500, median: 9800,  color: "#0D47A1", glow: "rgba(13,71,161,0.2)" },
      { company: "CIMB",             min: 7000,  max: 10500, median: 8800,  color: "#C62828", glow: "rgba(198,40,40,0.2)" },
      { company: "TNG Digital",      min: 8200,  max: 12000, median: 10000, color: "#00695C", glow: "rgba(0,105,92,0.2)" },
    ],
  },
  {
    id: "ai-product-analyst",
    position: "AI Product Analyst",
    yourOffer: 9500,
    marketMedian: 10200,
    companies: [
      { company: "Petronas Digital", min: 8000,  max: 13000, median: 10500, color: "#0D47A1", glow: "rgba(13,71,161,0.2)" },
      { company: "Grab",             min: 9000,  max: 15000, median: 12000, color: "#2E7D32", glow: "rgba(46,125,50,0.2)" },
      { company: "Axiata",           min: 7500,  max: 11500, median: 9500,  color: "#4527A0", glow: "rgba(69,39,160,0.15)" },
      { company: "Shopee",           min: 8500,  max: 13500, median: 11000, color: "#E65100", glow: "rgba(230,81,0,0.2)" },
      { company: "MDEC",             min: 7000,  max: 10000, median: 8500,  color: "#00838F", glow: "rgba(0,131,143,0.2)" },
      { company: "AirAsia Digital",  min: 7800,  max: 12000, median: 9800,  color: "#B71C1C", glow: "rgba(183,28,28,0.2)" },
      { company: "TNG Digital",      min: 8000,  max: 11000, median: 9600,  color: "#00695C", glow: "rgba(0,105,92,0.2)" },
    ],
  },
];

function MarketSalaryGraph() {
  const [activePos, setActivePos] = useState(0);
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const animRef = useRef(0);
  const startRef = useRef(0);

  const data = SALARY_DATA[activePos];
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

  const yourX = xScale(data.yourOffer);
  const medianX = xScale(data.marketMedian);

  const gridLines = [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000].filter(v => v <= maxVal);

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
            {SALARY_DATA.map((pos, i) => (
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
                        {(c.min * animProgress / 1000).toFixed(1)}k
                      </text>
                      <text x={maxX + 4} y={y + barH / 2 + 4} textAnchor="start" fontSize={9}
                        fill="rgba(22,40,75,0.4)" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                        {(c.max * animProgress / 1000).toFixed(1)}k
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Your offer line */}
            {animProgress > 0.3 && (
              <g style={{ opacity: animProgress }}>
                <line x1={yourX} y1={TOP - 2} x2={yourX} y2={TOP + chartH + 2}
                  stroke="url(#your-offer-grad)" strokeWidth={2.5} strokeDasharray="6,4" />
                <rect x={yourX - 40} y={TOP + chartH + 6} width={80} height={20} rx={10}
                  fill="#8A7038" />
                <text x={yourX} y={TOP + chartH + 19} textAnchor="middle" fontSize={10} fontWeight={700} fill="white"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}>
                  You: RM {(data.yourOffer / 1000).toFixed(1)}k
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
            const aboveMarket = data.yourOffer > data.marketMedian;
            const diff = Math.abs(data.yourOffer - data.marketMedian);
            const pct = Math.round((diff / data.marketMedian) * 100);
            const highest = sorted[0];
            const lowest = sorted[sorted.length - 1];
            return [
              {
                label: aboveMarket ? "Above Market" : "Below Market",
                value: `${aboveMarket ? "+" : "-"}RM ${diff.toLocaleString()}`,
                desc: `Your offer is ${pct}% ${aboveMarket ? "above" : "below"} market median`,
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
