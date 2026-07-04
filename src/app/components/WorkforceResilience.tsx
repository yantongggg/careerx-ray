import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  GraduationCap,
  Layers,
  Link2,
  Shield,
  TrendingUp,
  UserMinus,
  Users,
  Zap,
} from "lucide-react";

const kpis = [
  { label: "Fragile teams", value: "3", icon: AlertTriangle },
  { label: "At-risk hires", value: "12", icon: UserMinus },
  { label: "Critical skill gaps", value: "5", icon: Layers },
];

type RiskLevel = "red" | "amber" | "green";

type Team = {
  name: string;
  headcount: number;
  keyPersonRisk: RiskLevel;
  skillConcentrationRisk: RiskLevel;
  topRisks: string[];
};

const teams: Team[] = [
  {
    name: "Data Engineering",
    headcount: 8,
    keyPersonRisk: "red",
    skillConcentrationRisk: "red",
    topRisks: ["Single cloud architect", "No Kafka backup", "2 members leaving within 6 months"],
  },
  {
    name: "Product Design",
    headcount: 5,
    keyPersonRisk: "amber",
    skillConcentrationRisk: "amber",
    topRisks: ["Only 1 accessibility specialist", "Figma expertise concentrated in lead"],
  },
  {
    name: "Machine Learning",
    headcount: 6,
    keyPersonRisk: "red",
    skillConcentrationRisk: "amber",
    topRisks: ["MLOps knowledge in 1 person", "No NLP backup", "Model deployment bottleneck"],
  },
  {
    name: "Frontend Engineering",
    headcount: 12,
    keyPersonRisk: "green",
    skillConcentrationRisk: "green",
    topRisks: ["Well-distributed skills", "Strong knowledge sharing culture"],
  },
  {
    name: "Backend Services",
    headcount: 10,
    keyPersonRisk: "amber",
    skillConcentrationRisk: "green",
    topRisks: ["Payment gateway expertise in 2 people", "Good overall coverage"],
  },
  {
    name: "DevOps & Platform",
    headcount: 4,
    keyPersonRisk: "red",
    skillConcentrationRisk: "red",
    topRisks: ["Entire Kubernetes knowledge in team lead", "No CI/CD redundancy", "Understaffed"],
  },
];

type SkillGap = {
  skill: string;
  supply: number;
  demand: number;
};

const skillGaps: SkillGap[] = [
  { skill: "Cloud Architecture (AWS/GCP)", supply: 25, demand: 80 },
  { skill: "MLOps / Model Deployment", supply: 15, demand: 70 },
  { skill: "Kafka / Event Streaming", supply: 10, demand: 55 },
  { skill: "Kubernetes & Container Orchestration", supply: 20, demand: 65 },
  { skill: "Accessibility & Inclusive Design", supply: 30, demand: 50 },
  { skill: "Data Governance & Privacy", supply: 35, demand: 60 },
  { skill: "NLP / LLM Engineering", supply: 12, demand: 72 },
];

type UniversityPartnership = {
  university: string;
  strength: string;
  graduates: number;
  matchScore: number;
};

const universityPartnerships: UniversityPartnership[] = [
  { university: "Universiti Malaya", strength: "Cloud & Data Engineering", graduates: 45, matchScore: 91 },
  { university: "Asia Pacific University", strength: "MLOps & AI Systems", graduates: 32, matchScore: 87 },
  { university: "Monash Malaysia", strength: "DevOps & Platform Engineering", graduates: 28, matchScore: 84 },
  { university: "Taylor's University", strength: "UX & Accessibility", graduates: 38, matchScore: 82 },
  { university: "Universiti Teknologi", strength: "Backend & Distributed Systems", graduates: 52, matchScore: 79 },
];

function getRiskColor(risk: RiskLevel) {
  switch (risk) {
    case "red":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
    case "amber":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    case "green":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
  }
}

export function WorkforceResilience() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAllGaps, setShowAllGaps] = useState(false);
  const [connectedUniversities, setConnectedUniversities] = useState<string[]>([]);

  const handleConnectUniversity = (university: string) => {
    setConnectedUniversities((prev) => [...prev, university]);
    alert(`Partnership request sent to ${university}`);
  };

  const visibleGaps = showAllGaps ? skillGaps : skillGaps.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
              <Shield size={22} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Workforce Resilience Planner</h1>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mt-1">
                Identify fragile teams, key-person dependencies, and critical skill gaps. Build graduate pipelines to
                reduce hiring risk and ensure long-term workforce health.
              </p>
            </div>
            <button
              onClick={() => alert("Generating full resilience report for Q3 2026...")}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700"
            >
              <Zap size={14} /> Generate Report
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid sm:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <kpi.icon size={17} className="text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground mt-3">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Team Health Grid */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Team Health Grid</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Click a team to see detailed risk breakdown</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-red-50 text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> High Risk
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-amber-50 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const keyColor = getRiskColor(team.keyPersonRisk);
              const skillColor = getRiskColor(team.skillConcentrationRisk);
              const isSelected = selectedTeam?.name === team.name;
              return (
                <div
                  key={team.name}
                  onClick={() => setSelectedTeam(isSelected ? null : team)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-blue-50/50 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{team.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{team.headcount} members</p>
                    </div>
                    <Building2 size={16} className="text-muted-foreground" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Key person dependency</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${keyColor.text} ${keyColor.bg} ${keyColor.border} border px-2 py-0.5 rounded-full`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${keyColor.dot}`}></span>
                        {team.keyPersonRisk === "red" ? "High" : team.keyPersonRisk === "amber" ? "Medium" : "Low"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Skill concentration</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${skillColor.text} ${skillColor.bg} ${skillColor.border} border px-2 py-0.5 rounded-full`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${skillColor.dot}`}></span>
                        {team.skillConcentrationRisk === "red" ? "High" : team.skillConcentrationRisk === "amber" ? "Medium" : "Low"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Team Detail */}
          {selectedTeam && (
            <div className="mt-5 border border-primary/20 bg-blue-50/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-primary" />
                <h3 className="font-semibold text-foreground">{selectedTeam.name} - Risk Details</h3>
              </div>
              <ul className="space-y-2">
                {selectedTeam.topRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                    <p className="text-sm text-foreground">{risk}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => alert(`Creating mitigation plan for ${selectedTeam.name}...`)}
                className="mt-4 inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                <Zap size={12} /> Create Mitigation Plan
              </button>
            </div>
          )}
        </section>

        {/* Skills Gap Visualization */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Skills Gap Analysis</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Internal supply vs projected demand over next 12 months</p>
            </div>
            <button
              onClick={() => setShowAllGaps(!showAllGaps)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {showAllGaps ? "Show less" : "Show all"}
            </button>
          </div>

          <div className="space-y-4">
            {visibleGaps.map((gap) => (
              <div key={gap.skill} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{gap.skill}</p>
                  <span className={`text-xs font-bold ${gap.demand - gap.supply > 40 ? "text-red-600" : "text-amber-600"}`}>
                    -{gap.demand - gap.supply}% gap
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground w-14 shrink-0">Supply</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${gap.supply}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-foreground w-8">{gap.supply}%</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground w-14 shrink-0">Demand</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${gap.demand}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-foreground w-8">{gap.demand}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Graduate Pipeline */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap size={18} className="text-muted-foreground" />
            <div>
              <h2 className="font-semibold text-foreground">Graduate Pipeline - University Partnerships</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Suggested partnerships to fill future skill gaps</p>
            </div>
          </div>

          <div className="space-y-3">
            {universityPartnerships.map((uni) => {
              const isConnected = connectedUniversities.includes(uni.university);
              return (
                <div
                  key={uni.university}
                  className="flex items-center justify-between border border-border rounded-xl p-4 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <GraduationCap size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{uni.university}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{uni.strength}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-foreground">{uni.graduates}</p>
                      <p className="text-xs text-muted-foreground">grads/year</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-emerald-700">{uni.matchScore}%</p>
                      <p className="text-xs text-muted-foreground">match</p>
                    </div>
                    <button
                      onClick={() => handleConnectUniversity(uni.university)}
                      disabled={isConnected}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isConnected
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                          : "bg-primary text-white hover:bg-blue-700"
                      }`}
                    >
                      <Link2 size={12} /> {isConnected ? "Connected" : "Connect"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Insight */}
        <div className="bg-slate-950 text-white rounded-xl p-5">
          <TrendingUp size={18} className="text-orange-300 mb-3" />
          <h3 className="font-bold">Resilience Forecast</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Based on current hiring patterns and attrition signals, 3 teams will face critical knowledge loss within 6 months unless graduate pipelines are activated now. Connecting with suggested universities could reduce time-to-fill by 40%.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              ["6 months", "risk horizon"],
              ["40%", "faster fill time"],
              ["RM 890K", "potential savings"],
            ].map(([value, label]) => (
              <div key={label} className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
