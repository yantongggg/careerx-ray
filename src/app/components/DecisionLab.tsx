import { useState } from "react";
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
    oneYear: "Salary grows to $125k with a standard review cycle. The work feels manageable. You're good at it. But the AI tools your team adopted are now handling 40% of what you used to own.",
    threeYear: "Your role has been quietly restructured. The BI function consolidated. You're still employed — but your title hasn't changed, your scope has narrowed, and two analysts junior to you were promoted into different tracks.",
    fiveYear: "You're earning $128k. The market rate for your peers who made moves is $162k+. You're good at your job — but you're no longer growing. And you know it.",
    salary5yr: "$128k",
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
    oneYear: "You complete the AWS cert and two ML portfolio projects. You start applying. The interviews are harder than your current role. You get rejected twice. Then you get an offer at $138k — an ML Engineer role at a fintech company.",
    threeYear: "You're 18 months into the new role. Your skills are compounding faster than they ever did as an analyst. You're building things that ship. Your salary is $155k. You're being sponsored for a Staff role.",
    fiveYear: "You're earning $162k, with equity. AI Risk exposure is 28% — you're building the automation, not being replaced by it. Career satisfaction is at its highest point in your professional life.",
    salary5yr: "$162k",
    aiRisk: "Low (28%)",
    aiRiskColor: "text-emerald-500",
    promotionOdds: "68% over 5 years",
    satisfaction: "High",
    satisfactionColor: "text-emerald-500",
    salaryData: [110, 114, 120, 128, 136, 142, 148, 154, 158, 162],
    pros: ["Highest long-term earnings", "AI-proof skill set", "$34k salary jump potential"],
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
    threeYear: "You're promoted to Data Science Manager. Your salary jumps to $155k. You manage a team of 4. It's harder than you expected. You have less time for the technical work you love — but more influence than you've ever had.",
    fiveYear: "You're earning $175k as a senior manager overseeing a team of 8. AI Risk exposure is 18% — leadership roles are highly protected. But you sometimes miss the craft of building things yourself.",
    salary5yr: "$175k",
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

export function DecisionLab() {
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
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={v => `$${v}k`} />
                    <Tooltip formatter={(v: number) => [`$${v}k`, ""]} />
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
                  <DollarSign size={13} /> +$52k over 5 years vs. staying
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

        {/* CTA to Prescription */}
        <div className="bg-muted border border-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">You've seen your futures. Now get the treatment plan.</p>
            <p className="text-sm text-muted-foreground mt-1">Career Prescription turns this analysis into a day-by-day action plan.</p>
          </div>
          <button className="flex-shrink-0 flex items-center gap-2 bg-primary text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
            View My Prescription <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
