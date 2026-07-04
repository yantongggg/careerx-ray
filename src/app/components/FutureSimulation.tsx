import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Minus, Brain, Star, DollarSign, ChevronUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, CartesianGrid
} from "recharts";

const scenarios = [
  {
    id: "current",
    label: "Stay — Senior Data Analyst",
    color: "#3B82F6",
    dotColor: "bg-blue-500",
    salary: [110, 113, 116, 119, 123],
    promotion: 28,
    aiRisk: 62,
    satisfaction: 58,
    pros: ["Low transition risk", "Known environment", "Team relationships"],
    cons: ["Below market salary", "Limited growth ceiling", "High AI exposure"],
  },
  {
    id: "ml",
    label: "Switch — ML Engineer",
    color: "#22C55E",
    dotColor: "bg-emerald-500",
    salary: [118, 126, 136, 148, 162],
    promotion: 55,
    aiRisk: 28,
    satisfaction: 81,
    pros: ["High market demand", "AI-proof skillset", "+47% salary potential"],
    cons: ["3–6 month learning gap", "Role transition risk", "New domain learning"],
  },
  {
    id: "manager",
    label: "Promote — Data Science Manager",
    color: "#A855F7",
    dotColor: "bg-purple-500",
    salary: [130, 138, 148, 160, 175],
    promotion: 72,
    aiRisk: 18,
    satisfaction: 74,
    pros: ["Highest salary ceiling", "Leadership credibility", "Low AI displacement"],
    cons: ["Requires political capital", "Less hands-on tech", "18–24 month timeline"],
  },
];

const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const timelineData = years.map((y, i) => ({
  year: y,
  stay: scenarios[0].salary[i],
  ml: scenarios[1].salary[i],
  manager: scenarios[2].salary[i],
}));

const barCompare = [
  { name: "Promotion %", stay: 28, ml: 55, manager: 72 },
  { name: "Satisfaction", stay: 58, ml: 81, manager: 74 },
  { name: "AI Safety", stay: 38, ml: 72, manager: 82 },
];

export function FutureSimulation() {
  const [selected, setSelected] = useState<string[]>(["current", "ml", "manager"]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const activeScenarios = scenarios.filter(s => selected.includes(s.id));

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Future Simulation</h1>
            <p className="text-muted-foreground text-sm mt-1">Compare career paths across 5-year projections</p>
          </div>
          <button className="flex items-center gap-2 border border-border bg-white text-foreground text-sm px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium shadow-sm">
            <Plus size={14} /> Add Scenario
          </button>
        </div>

        {/* Scenario Selectors */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {scenarios.map((s) => {
            const isActive = selected.includes(s.id);
            return (
              <div
                key={s.id}
                onClick={() => toggle(s.id)}
                className={`bg-white rounded-xl border p-5 cursor-pointer transition-all shadow-sm ${isActive ? "border-[color:var(--primary)] ring-2 ring-blue-100" : "border-border hover:border-muted-foreground"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${s.dotColor}`} />
                    <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  </div>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isActive ? "bg-primary border-primary" : "border-border"}`}>
                    {isActive && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Y5 Salary</p>
                    <p className="text-base font-bold text-foreground mt-0.5">${s.salary[4]}k</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Promotion %</p>
                    <p className="text-base font-bold text-foreground mt-0.5">{s.promotion}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">AI Risk</p>
                    <p className={`text-base font-bold mt-0.5 ${s.aiRisk > 50 ? "text-red-500" : s.aiRisk > 30 ? "text-amber-500" : "text-emerald-500"}`}>{s.aiRisk}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                    <p className={`text-base font-bold mt-0.5 ${s.satisfaction >= 75 ? "text-emerald-500" : s.satisfaction >= 60 ? "text-amber-500" : "text-red-500"}`}>{s.satisfaction}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Salary Timeline */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-foreground">Salary Projection Timeline</h3>
              <p className="text-xs text-muted-foreground mt-0.5">5-year salary trajectory across scenarios</p>
            </div>
            <div className="flex items-center gap-2">
              {scenarios.filter(s => selected.includes(s.id)).map(s => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.label.split("—")[0].trim()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={v => `$${v}k`} />
                <Tooltip formatter={(v: number) => [`$${v}k`, ""]} />
                {selected.includes("current") && <Line type="monotone" dataKey="stay" name="Stay" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: "#3B82F6" }} />}
                {selected.includes("ml") && <Line type="monotone" dataKey="ml" name="ML Eng" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4, fill: "#22C55E" }} />}
                {selected.includes("manager") && <Line type="monotone" dataKey="manager" name="Manager" stroke="#A855F7" strokeWidth={2.5} dot={{ r: 4, fill: "#A855F7" }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Comparison bars */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-5">Key Metrics Comparison</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barCompare} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} domain={[0, 100]} />
                  <Tooltip />
                  {selected.includes("current") && <Bar dataKey="stay" name="Stay" fill="#3B82F6" radius={[3, 3, 0, 0]} />}
                  {selected.includes("ml") && <Bar dataKey="ml" name="ML Eng" fill="#22C55E" radius={[3, 3, 0, 0]} />}
                  {selected.includes("manager") && <Bar dataKey="manager" name="Manager" fill="#A855F7" radius={[3, 3, 0, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pros / Cons */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Scenario Analysis</h3>
            <div className="space-y-4">
              {activeScenarios.slice(0, 2).map(s => (
                <div key={s.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium text-foreground">{s.label.split("—")[1]?.trim()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {s.pros.slice(0, 2).map(p => (
                      <div key={p} className="flex items-start gap-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg p-2">
                        <ChevronUp size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {p}
                      </div>
                    ))}
                    {s.cons.slice(0, 1).map(c => (
                      <div key={c} className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg p-2">
                        <Minus size={12} className="text-red-400 mt-0.5 flex-shrink-0" /> {c}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold mb-1">AI Recommendation</p>
              <p className="text-blue-100 text-sm leading-relaxed max-w-2xl">
                Based on your current skills, market trends, and risk tolerance, transitioning to <strong className="text-white">ML Engineering</strong> within the next 12 months offers the highest risk-adjusted return. Your existing Python and SQL expertise create a strong foundation — a 3-month intensive upskilling program could reduce the transition timeline significantly.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <Star size={12} className="text-amber-300 fill-amber-300" />
                  <span className="text-xs text-blue-100">Confidence: 87%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign size={12} className="text-emerald-300" />
                  <span className="text-xs text-blue-100">+$52k potential over 5 years</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-blue-200" />
                  <span className="text-xs text-blue-100">Market demand: Rising</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
