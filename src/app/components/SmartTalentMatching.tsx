import { useState } from "react";
import {
  Bookmark,
  Brain,
  Filter,
  Mail,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

const roleTypes = ["All Roles", "Data Analyst", "Software Engineer", "Product Manager", "UX Designer"];
const experienceLevels = ["Fresh Grad", "1-2 years", "3-5 years"];
const skillTags = ["Python", "SQL", "Figma", "React", "Machine Learning", "Power BI", "Cloud", "Agile"];
const salaryRanges = ["RM3k-5k", "RM5k-8k", "RM8k-12k", "RM12k+"];

const candidates = [
  {
    name: "Aisyah Rahman",
    university: "Universiti Malaya",
    fitScore: 94,
    skills: ["Python", "SQL", "Machine Learning"],
    careerDna: "Analytical Builder",
  },
  {
    name: "Jordan Kim",
    university: "Monash Malaysia",
    fitScore: 91,
    skills: ["React", "Agile", "Cloud"],
    careerDna: "Creative Technologist",
  },
  {
    name: "Priya Raman",
    university: "Universiti Kebangsaan",
    fitScore: 89,
    skills: ["Power BI", "SQL", "Agile"],
    careerDna: "Strategic Connector",
  },
  {
    name: "Wei Lin Tan",
    university: "Asia Pacific University",
    fitScore: 87,
    skills: ["Figma", "React", "Python"],
    careerDna: "Design Thinker",
  },
  {
    name: "Faiz Abdullah",
    university: "Universiti Teknologi",
    fitScore: 85,
    skills: ["Cloud", "Python", "Agile"],
    careerDna: "Systems Architect",
  },
  {
    name: "Mei Chen Loh",
    university: "Taylor's University",
    fitScore: 83,
    skills: ["Machine Learning", "SQL", "Power BI"],
    careerDna: "Data Storyteller",
  },
];

const matchInsights = [
  { label: "Skill match", value: "87%", desc: "Core technical skills align with role requirements" },
  { label: "Personality fit", value: "82%", desc: "Career DNA traits correlate with high performers in role" },
  { label: "Growth potential", value: "91%", desc: "Learning velocity and adaptability indicators" },
];

export function SmartTalentMatching() {
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedExperience, setSelectedExperience] = useState("Fresh Grad");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Python", "SQL"]);
  const [selectedSalary, setSelectedSalary] = useState("RM3k-5k");
  const [showFilters, setShowFilters] = useState(true);
  const [savedCandidates, setSavedCandidates] = useState<string[]>([]);
  const [contactedCandidates, setContactedCandidates] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = (name: string) => {
    setSavedCandidates((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleContact = (name: string) => {
    setContactedCandidates((prev) => [...prev, name]);
    alert(`Contact request sent to ${name}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <UserCheck size={22} className="text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Smart Talent Matching</h1>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mt-1">
                AI-powered matching that connects you with the right candidates based on skills, Career DNA,
                verified evidence, salary expectations, and response likelihood.
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              <Filter size={14} /> {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Users, value: "34 high-fit grads", label: "Matched to your roles" },
            { icon: Zap, value: "12 new this week", label: "Fresh matches added" },
            { icon: TrendingUp, value: "91% response rate", label: "For contacted candidates" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <stat.icon size={17} className="text-muted-foreground" />
              <p className="text-xl font-bold text-foreground mt-3">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="bg-white border border-border rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Search size={16} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Filter Candidates</h3>
            </div>

            <div className="space-y-3">
              {/* Role Type */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Role Type</p>
                <div className="flex flex-wrap gap-2">
                  {roleTypes.map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedRole === role
                          ? "bg-primary text-white"
                          : "bg-muted border border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Experience Level</p>
                <div className="flex flex-wrap gap-2">
                  {experienceLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedExperience(level)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedExperience === level
                          ? "bg-primary text-white"
                          : "bg-muted border border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Tags */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skillTags.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedSkills.includes(skill)
                          ? "bg-emerald-500 text-white"
                          : "bg-muted border border-border text-foreground hover:border-emerald-300"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Salary Range</p>
                <div className="flex flex-wrap gap-2">
                  {salaryRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedSalary(range)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedSalary === range
                          ? "bg-primary text-white"
                          : "bg-muted border border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Grid */}
        <section className="space-y-4">
          <h2 className="font-semibold text-foreground">Matched Candidates</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.name}
                onClick={() => setSelectedCandidate(candidate.name)}
                className={`bg-white border rounded-xl p-5 shadow-sm cursor-pointer transition-all ${
                  selectedCandidate === candidate.name ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{candidate.university}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
                    <p className="text-sm font-bold text-emerald-700">{candidate.fitScore}%</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 mb-4">
                  <Brain size={12} className="text-purple-500" />
                  <span className="text-xs text-purple-700 font-medium">{candidate.careerDna}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact(candidate.name);
                    }}
                    disabled={contactedCandidates.includes(candidate.name)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      contactedCandidates.includes(candidate.name)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-blue-700"
                    }`}
                  >
                    <Mail size={12} /> {contactedCandidates.includes(candidate.name) ? "Contacted" : "Contact"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(candidate.name);
                    }}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      savedCandidates.includes(candidate.name)
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "border-border text-foreground hover:border-primary/40"
                    }`}
                  >
                    <Bookmark size={12} /> {savedCandidates.includes(candidate.name) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Match Insights Panel */}
        <section className="bg-slate-950 text-white rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={18} className="text-blue-300" />
            <h2 className="font-bold text-lg">Match Insights</h2>
          </div>
          <p className="text-sm text-slate-300 mb-5">
            Why candidates were ranked: our AI evaluates multiple dimensions to surface the best fit.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {matchInsights.map((insight) => (
              <div key={insight.label} className="bg-white/10 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-400">{insight.label}</p>
                <p className="text-2xl font-bold mt-1">{insight.value}</p>
                <p className="text-xs text-slate-300 mt-2">{insight.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
