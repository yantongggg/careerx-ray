import { useState } from "react";
import {
  ArrowRight, Briefcase, GraduationCap, HeartPulse, MessageSquare,
  RefreshCcw, Star, TrendingUp, Users, CheckCircle2, Lightbulb, Target
} from "lucide-react";

const kpis = [
  { label: "Employed in 6 months", value: "88%", icon: Briefcase },
  { label: "Median Starting Salary", value: "RM 4.2k", icon: TrendingUp },
  { label: "Role-Relevant Placement", value: "73%", icon: Target },
  { label: "Employer Satisfaction", value: "92%", icon: Star },
];

const timelineStages = [
  { label: "Graduation", data: "2,140 graduates", status: "complete" },
  { label: "First Job", data: "1,882 placed", status: "complete" },
  { label: "6 Months", data: "88% retained", status: "complete" },
  { label: "1 Year", data: "72% promoted", status: "active" },
  { label: "2 Years", data: "64% advanced", status: "pending" },
];

const cohortData = [
  { name: "Aisyah Rahman", year: 2024, faculty: "Computer Science", employer: "Grab", role: "Software Engineer", salary: "RM 4.5k → RM 5.8k", satisfaction: 4.7 },
  { name: "Daniel Tan", year: 2024, faculty: "Business Analytics", employer: "Deloitte", role: "Data Analyst", salary: "RM 3.8k → RM 4.6k", satisfaction: 4.3 },
  { name: "Mei Lin Chong", year: 2023, faculty: "Finance", employer: "Maybank", role: "Risk Analyst", salary: "RM 4.0k → RM 5.2k", satisfaction: 4.5 },
  { name: "Arjun Nair", year: 2023, faculty: "Engineering", employer: "Intel", role: "Process Engineer", salary: "RM 4.8k → RM 6.1k", satisfaction: 4.8 },
  { name: "Nurul Huda", year: 2024, faculty: "Computer Science", employer: "Petronas Digital", role: "Cloud Engineer", salary: "RM 5.0k → RM 6.4k", satisfaction: 4.6 },
];

const feedbackLoop = [
  { title: "Insights Gathered", desc: "73% placement relevance reveals gap in cloud architecture skills across CS cohort", icon: Lightbulb, color: "text-amber-600 bg-amber-50" },
  { title: "Action Taken", desc: "Added AWS & Azure modules to Year 3 curriculum; partnered with 2 cloud employers", icon: RefreshCcw, color: "text-blue-600 bg-blue-50" },
  { title: "Impact Measured", desc: "Next cohort cloud-role placement up 18%; employer satisfaction rose to 94%", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
];

const alumniMentors = [
  { name: "Sarah Lee", role: "Senior PM at Shopee", expertise: "Product Management", available: true },
  { name: "Rizwan Ahmad", role: "Tech Lead at Wise", expertise: "Backend Engineering", available: true },
  { name: "Priya Muthu", role: "Data Scientist at AirAsia", expertise: "ML & Analytics", available: false },
  { name: "Jason Lim", role: "Consultant at McKinsey", expertise: "Strategy & Consulting", available: true },
];

export function OutcomeLoop() {
  const [selectedCohort, setSelectedCohort] = useState("All");
  const [showFeedbackDetail, setShowFeedbackDetail] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <HeartPulse className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-bold">Lifelong Outcome Loop</h1>
          </div>
          <p className="text-slate-300 text-sm">
            Tracking graduate outcomes beyond graduation — feeding real employment data back into curriculum, guidance, and employer partnerships.
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

        {/* Timeline Visualization */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Graduate Journey Timeline</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
            {timelineStages.map((stage, i) => (
              <div key={stage.label} className="relative flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    stage.status === "complete"
                      ? "bg-green-500"
                      : stage.status === "active"
                      ? "bg-blue-500 ring-4 ring-blue-100"
                      : "bg-slate-300"
                  }`}
                >
                  {i + 1}
                </div>
                <p className="text-xs font-medium mt-2">{stage.label}</p>
                <p className="text-xs text-muted-foreground">{stage.data}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Graduate Cohort Table */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Graduate Cohort Tracker</h2>
            <div className="flex gap-2">
              {["All", "2024", "2023"].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedCohort(year)}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    selectedCohort === year
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-border hover:bg-slate-50"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Year</th>
                  <th className="pb-2 font-medium">Faculty</th>
                  <th className="pb-2 font-medium">Employer</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Salary Progression</th>
                  <th className="pb-2 font-medium">Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {cohortData
                  .filter((g) => selectedCohort === "All" || g.year.toString() === selectedCohort)
                  .map((grad) => (
                    <tr key={grad.name} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">{grad.name}</td>
                      <td className="py-3">{grad.year}</td>
                      <td className="py-3">{grad.faculty}</td>
                      <td className="py-3">{grad.employer}</td>
                      <td className="py-3">{grad.role}</td>
                      <td className="py-3 text-green-700 font-medium">{grad.salary}</td>
                      <td className="py-3">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {grad.satisfaction}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Loop */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Feedback Loop — Outcomes Drive Curriculum</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feedbackLoop.map((item, i) => (
              <div
                key={item.title}
                className="border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setShowFeedbackDetail(showFeedbackDetail === i ? null : i)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
                {showFeedbackDetail === i && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-blue-700 font-medium">View detailed analysis →</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <ArrowRight className="w-3 h-3" />
            <span>Data collected quarterly from 2,140 graduates across 4 faculties</span>
          </div>
        </div>

        {/* Alumni Network */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Alumni Network</h2>
              <p className="text-xs text-muted-foreground">Active mentors available for current students</p>
            </div>
            <button
              onClick={() => alert("Browse all alumni mentors")}
              className="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Browse All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {alumniMentors.map((mentor) => (
              <div key={mentor.name} className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{mentor.name}</p>
                    <p className="text-xs text-muted-foreground">{mentor.role}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{mentor.expertise}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${mentor.available ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {mentor.available ? "Available" : "Busy"}
                  </span>
                  <button
                    onClick={() => alert(`Request mentorship from ${mentor.name}`)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    disabled={!mentor.available}
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
