import { useState } from "react";
import { CheckCircle, Circle, Lock, TrendingUp, ChevronRight, Clock, DollarSign, Flame } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const paths = [
  { id: "ml", label: "ML Engineering" },
  { id: "manager", label: "Data Science Manager" },
  { id: "principal", label: "Principal Data Scientist" },
];

const roadmapNodes = [
  {
    title: "Senior Data Analyst",
    status: "current",
    salary: "RM 110k–RM 125k",
    duration: "Now",
    skills: ["SQL", "Python", "Tableau", "Statistics"],
    completed: true,
  },
  {
    title: "Analytics Engineer",
    status: "next",
    salary: "RM 120k–RM 140k",
    duration: "3–6 months",
    skills: ["dbt", "Airflow", "Snowflake", "Data Modeling"],
    completed: false,
  },
  {
    title: "ML Engineer",
    status: "locked",
    salary: "RM 145k–RM 175k",
    duration: "9–14 months",
    skills: ["PyTorch", "MLflow", "Kubernetes", "Feature Engineering"],
    completed: false,
  },
  {
    title: "Staff ML Engineer",
    status: "locked",
    salary: "RM 185k–RM 220k",
    duration: "2–3 years",
    skills: ["System Design", "ML Architecture", "Technical Leadership", "Research"],
    completed: false,
  },
];

const salaryProgression = [
  { role: "Now", salary: 110 },
  { role: "Yr 1", salary: 128 },
  { role: "Yr 2", salary: 148 },
  { role: "Yr 3", salary: 168 },
  { role: "Yr 4", salary: 192 },
  { role: "Yr 5", salary: 215 },
];

const demandData = [
  { skill: "ML/AI", demand: 94 },
  { skill: "Cloud", demand: 88 },
  { skill: "Python", demand: 85 },
  { skill: "dbt", demand: 78 },
  { skill: "SQL", demand: 72 },
  { skill: "Tableau", demand: 44 },
];

const requiredSkills = [
  { skill: "PyTorch / TensorFlow", current: 22, required: 80, priority: "critical" },
  { skill: "MLflow & Experiment Tracking", current: 15, required: 70, priority: "critical" },
  { skill: "dbt & Data Modeling", current: 40, required: 75, priority: "high" },
  { skill: "AWS / GCP Cloud", current: 30, required: 70, priority: "high" },
  { skill: "Kubernetes / Docker", current: 25, required: 60, priority: "medium" },
  { skill: "Feature Engineering", current: 55, required: 80, priority: "medium" },
];

const priorityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-blue-400",
};

export function CareerRoadmap() {
  const [activePath, setActivePath] = useState("ml");

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Career Roadmap</h1>
            <p className="text-muted-foreground text-sm mt-1">Your personalized path to your target role</p>
          </div>
          <div className="flex gap-2">
            {paths.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePath(p.id)}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${activePath === p.id ? "bg-primary text-white shadow-sm" : "bg-white border border-border text-foreground hover:bg-muted"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Path Map */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-foreground mb-6">Career Path — ML Engineering Track</h3>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />
            <div className="space-y-6">
              {roadmapNodes.map((node, i) => (
                <div key={node.title} className="relative flex gap-5 group">
                  {/* Node icon */}
                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    node.status === "current" ? "bg-primary border-primary" :
                    node.status === "next" ? "bg-white border-primary" :
                    "bg-white border-border"
                  }`}>
                    {node.status === "current" ? (
                      <CheckCircle size={16} className="text-white" />
                    ) : node.status === "next" ? (
                      <Circle size={16} className="text-primary" />
                    ) : (
                      <Lock size={14} className="text-muted-foreground" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`flex-1 rounded-xl p-5 border transition-all ${
                    node.status === "current" ? "bg-blue-50 border-blue-200" :
                    node.status === "next" ? "bg-white border-border hover:border-primary/40 cursor-pointer" :
                    "bg-muted border-border opacity-70"
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{node.title}</h4>
                          {node.status === "current" && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">Current</span>}
                          {node.status === "next" && <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Next Step</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <DollarSign size={11} /> {node.salary}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={11} /> {node.duration}
                          </div>
                        </div>
                      </div>
                      {node.status !== "locked" && (
                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {node.skills.map((s) => (
                        <span key={s} className="text-xs bg-white border border-border text-foreground px-2 py-1 rounded-md">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Salary progression */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Salary Progression</h3>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <TrendingUp size={14} /> +95% over 5 years
              </div>
            </div>
            <div style={{ width: "100%", height: 176 }}>
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={salaryProgression}>
                  <defs>
                    <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={v => `RM${v}k`} />
                  <Tooltip formatter={(v: number) => [`RM${v}k`, "Salary"]} />
                  <Area type="monotone" dataKey="salary" stroke="#2563EB" strokeWidth={2} fill="url(#roadGrad)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market demand */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Market Demand by Skill</h3>
              <Flame size={16} className="text-orange-500" />
            </div>
            <div style={{ width: "100%", height: 176 }}>
              <ResponsiveContainer width="100%" height={176}>
                <BarChart data={demandData} layout="vertical" barSize={7}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8" }} domain={[0, 100]} />
                  <YAxis type="category" dataKey="skill" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} width={62} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Demand"]} />
                  <Bar dataKey="demand" fill="#2563EB" radius={[0, 4, 4, 0]} background={{ fill: "#F1F5F9", radius: 4 }} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Required Skills Gap */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-5">Required Skills — Gap Analysis</h3>
          <div className="space-y-4">
            {requiredSkills.map((s) => {
              const gap = s.required - s.current;
              const pct = Math.round((s.current / s.required) * 100);
              return (
                <div key={s.skill}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{s.skill}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium ${priorityColors[s.priority]}`}>
                        {s.priority}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.current}% / {s.required}% required</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${s.current}%`,
                        backgroundColor: pct >= 70 ? "#22C55E" : pct >= 50 ? "#F59E0B" : "#EF4444",
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{gap}% gap to close</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
