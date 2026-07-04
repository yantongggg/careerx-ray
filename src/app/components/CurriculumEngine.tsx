import { useState } from "react";
import {
  BookOpenCheck, Brain, CalendarClock, CheckCircle2, ChevronRight,
  Cpu, Layers, Lightbulb, Sparkles, TrendingUp, Zap, AlertTriangle
} from "lucide-react";

const kpis = [
  { label: "Course Updates Suggested", value: "4", icon: Lightbulb },
  { label: "Skill Gaps Detected", value: "12", icon: AlertTriangle },
  { label: "Industry Alignment Score", value: "89%", icon: TrendingUp },
  { label: "New Micro-Credentials Proposed", value: "3", icon: Layers },
];

const currentCourses = [
  { name: "Data Structures & Algorithms", relevance: 95, status: "strong" },
  { name: "Database Management (SQL)", relevance: 88, status: "strong" },
  { name: "Software Engineering Principles", relevance: 82, status: "strong" },
  { name: "Java Programming II", relevance: 61, status: "outdated" },
  { name: "Computer Networks (Legacy)", relevance: 45, status: "critical" },
  { name: "Mainframe Systems", relevance: 28, status: "critical" },
  { name: "Statistical Methods", relevance: 76, status: "moderate" },
  { name: "Business Communication", relevance: 70, status: "moderate" },
];

const marketDemand = [
  { skill: "Cloud Architecture (AWS/Azure)", demand: 94, trend: "up" },
  { skill: "Generative AI & LLMs", demand: 91, trend: "up" },
  { skill: "Kubernetes & DevOps", demand: 87, trend: "up" },
  { skill: "Data Engineering (Spark/Kafka)", demand: 84, trend: "up" },
  { skill: "Cybersecurity & Zero Trust", demand: 82, trend: "up" },
  { skill: "Product Management", demand: 78, trend: "stable" },
  { skill: "Full-Stack TypeScript", demand: 76, trend: "stable" },
  { skill: "API Design & Microservices", demand: 73, trend: "stable" },
];

const gapAnalysis = [
  { skill: "Cloud Architecture", taught: 20, needed: 94 },
  { skill: "AI/ML Engineering", taught: 35, needed: 91 },
  { skill: "DevOps Practices", taught: 15, needed: 87 },
  { skill: "Data Engineering", taught: 40, needed: 84 },
  { skill: "Cybersecurity", taught: 30, needed: 82 },
];

const recommendations = [
  { title: "Add Cloud Architecture Module", desc: "Integrate AWS/Azure fundamentals into Year 2 curriculum", impact: 94, effort: "Medium", students: 420 },
  { title: "Replace Mainframe Systems", desc: "Swap with Containerization & DevOps course", impact: 87, effort: "Low", students: 380 },
  { title: "AI/ML Practicum Course", desc: "New elective: hands-on LLM fine-tuning and deployment", impact: 91, effort: "High", students: 290 },
  { title: "Cybersecurity Micro-Credential", desc: "Partner with CompTIA for embedded certification", impact: 82, effort: "Low", students: 340 },
];

export function CurriculumEngine() {
  const [selectedTab, setSelectedTab] = useState<"gap" | "actions">("gap");
  const [implementedActions, setImplementedActions] = useState<number[]>([]);

  const handleImplement = (index: number) => {
    if (!implementedActions.includes(index)) {
      setImplementedActions([...implementedActions, index]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpenCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold">Future-State Curriculum Engine</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-Powered
            </span>
          </div>
          <p className="text-slate-300 text-sm">
            Maps real-time employer demand and skill gaps to curriculum changes — before students graduate into outdated roles.
          </p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white border border-border rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Current Curriculum */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Current Curriculum</h2>
            <div className="space-y-3">
              {currentCourses.map((course) => (
                <div key={course.name} className="flex items-center justify-between">
                  <span className="text-sm">{course.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          course.status === "strong"
                            ? "bg-green-500"
                            : course.status === "moderate"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${course.relevance}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium w-8 text-right ${
                        course.status === "strong"
                          ? "text-green-700"
                          : course.status === "moderate"
                          ? "text-amber-700"
                          : "text-red-700"
                      }`}
                    >
                      {course.relevance}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Relevance score based on employer hiring data from last 90 days</p>
          </div>

          {/* Market Demand Signals */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Market Demand Signals</h2>
            <div className="space-y-3">
              {marketDemand.map((item) => (
                <div key={item.skill} className="flex items-center justify-between">
                  <span className="text-sm">{item.skill}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${item.demand}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-8 text-right text-blue-700">
                      {item.demand}%
                    </span>
                    {item.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Based on 18,400 job postings analyzed in the last 30 days</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab("gap")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedTab === "gap"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-border hover:bg-slate-50"
            }`}
          >
            Gap Analysis
          </button>
          <button
            onClick={() => setSelectedTab("actions")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedTab === "actions"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-border hover:bg-slate-50"
            }`}
          >
            Recommended Actions
          </button>
        </div>

        {/* Gap Analysis */}
        {selectedTab === "gap" && (
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Skill Gap Analysis — What We Teach vs. What's Needed</h2>
            <div className="space-y-4">
              {gapAnalysis.map((item) => (
                <div key={item.skill} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.skill}</span>
                    <span className="text-xs text-red-600 font-medium">Gap: {item.needed - item.taught}%</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground w-14">Taught</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.taught}%` }} />
                    </div>
                    <span className="text-xs w-8">{item.taught}%</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground w-14">Needed</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.needed}%` }} />
                    </div>
                    <span className="text-xs w-8">{item.needed}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {selectedTab === "actions" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, i) => (
                <div key={rec.title} className="bg-white border border-border rounded-xl shadow-sm p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{rec.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                      Impact: {rec.impact}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{rec.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Effort: {rec.effort}</span>
                      <span>{rec.students} students</span>
                    </div>
                    <button
                      onClick={() => handleImplement(i)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        implementedActions.includes(i)
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {implementedActions.includes(i) ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Implemented
                        </span>
                      ) : (
                        "Implement"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Implementation Timeline */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold">If implemented by Semester 2, 340 students benefit</p>
              <p className="text-xs text-muted-foreground">Early adoption increases placement relevance by an estimated 18% for the next graduating cohort</p>
            </div>
            <button
              onClick={() => alert("View implementation roadmap")}
              className="ml-auto px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              View Roadmap <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
