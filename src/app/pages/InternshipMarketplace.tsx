import { useState } from "react";
import {
  Briefcase, Building2, Calendar, ChevronRight, Clock, Filter,
  Handshake, MapPin, Search, Star, TrendingUp, Users, Zap
} from "lucide-react";

const industries = ["All", "Tech", "Finance", "Consulting", "Healthcare", "Engineering"];
const durations = ["All", "3 months", "6 months", "12 months"];
const locations = ["All", "Klang Valley", "Penang", "Johor", "Remote", "Singapore"];
const skillFilters = ["All", "Python", "Data Analytics", "Cloud", "Marketing", "Finance"];

const internships = [
  {
    company: "Grab",
    role: "Data Engineering Intern",
    duration: "6 months",
    location: "Klang Valley",
    skills: ["Python", "Spark", "SQL"],
    stipend: "RM 2,500/mo",
    match: 94,
  },
  {
    company: "Petronas Digital",
    role: "Cloud Solutions Intern",
    duration: "3 months",
    location: "Klang Valley",
    skills: ["AWS", "Terraform", "Docker"],
    stipend: "RM 2,800/mo",
    match: 89,
  },
  {
    company: "Deloitte",
    role: "Analytics Consulting Intern",
    duration: "6 months",
    location: "Klang Valley",
    skills: ["Excel", "Tableau", "SQL"],
    stipend: "RM 2,200/mo",
    match: 86,
  },
  {
    company: "Intel Penang",
    role: "Process Engineering Intern",
    duration: "12 months",
    location: "Penang",
    skills: ["MATLAB", "Six Sigma", "CAD"],
    stipend: "RM 2,600/mo",
    match: 82,
  },
  {
    company: "AirAsia",
    role: "Product Management Intern",
    duration: "3 months",
    location: "Remote",
    skills: ["Figma", "Analytics", "Agile"],
    stipend: "RM 2,000/mo",
    match: 78,
  },
  {
    company: "Maybank",
    role: "Risk Analytics Intern",
    duration: "6 months",
    location: "Klang Valley",
    skills: ["Python", "R", "Financial Modeling"],
    stipend: "RM 2,300/mo",
    match: 75,
  },
];

const careerFairs = [
  { name: "TalentConnect 2026", date: "Aug 15-16", companies: ["Google", "Grab", "Shopee", "Intel"], spots: 120 },
  { name: "Engineering Futures Fair", date: "Sep 3", companies: ["Petronas", "Dyson", "Intel", "Infineon"], spots: 80 },
  { name: "Finance & Consulting Day", date: "Sep 20", companies: ["Deloitte", "PwC", "Maybank", "CIMB"], spots: 60 },
];

const projectPathways = [
  { title: "ESG Data Dashboard", company: "CIMB", duration: "4 weeks", skills: ["Python", "Tableau"], stipend: "RM 1,200" },
  { title: "Customer Churn Analysis", company: "Maxis", duration: "3 weeks", skills: ["SQL", "ML"], stipend: "RM 1,000" },
  { title: "UI Redesign Sprint", company: "Fave", duration: "2 weeks", skills: ["Figma", "React"], stipend: "RM 800" },
];

export function InternshipMarketplace() {
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [appliedInternships, setAppliedInternships] = useState<number[]>([]);

  const handleApply = (index: number) => {
    if (!appliedInternships.includes(index)) {
      setAppliedInternships([...appliedInternships, index]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Handshake className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold">Live Internship Marketplace</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-sky-500/20 text-sky-300 rounded-full">
              312 verified openings
            </span>
          </div>
          <p className="text-slate-300 text-sm">
            Connecting students to employer-verified internships, career fair leads, and project-based pathways.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-border rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Intern-to-Full-Time</span>
            </div>
            <p className="text-2xl font-bold">42%</p>
            <p className="text-xs text-muted-foreground">conversion rate</p>
          </div>
          <div className="bg-white border border-border rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Verified Openings</span>
            </div>
            <p className="text-2xl font-bold">312</p>
            <p className="text-xs text-muted-foreground">across all industries</p>
          </div>
          <div className="bg-white border border-border rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Partner Companies</span>
            </div>
            <p className="text-2xl font-bold">28</p>
            <p className="text-xs text-muted-foreground">active partnerships</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Industry</label>
                <div className="flex flex-wrap gap-1">
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setSelectedIndustry(ind)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedIndustry === ind
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-border hover:bg-slate-50"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Duration</label>
                <div className="flex flex-wrap gap-1">
                  {durations.map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setSelectedDuration(dur)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedDuration === dur
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-border hover:bg-slate-50"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                <div className="flex flex-wrap gap-1">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocation(loc)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedLocation === loc
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-border hover:bg-slate-50"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Skill</label>
                <div className="flex flex-wrap gap-1">
                  {skillFilters.map((sk) => (
                    <button
                      key={sk}
                      onClick={() => setSelectedSkill(sk)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedSkill === sk
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-border hover:bg-slate-50"
                      }`}
                    >
                      {sk}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Internship Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internships.map((intern, i) => (
            <div key={intern.company + intern.role} className="bg-white border border-border rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{intern.company}</p>
                    <p className="text-xs text-muted-foreground">{intern.role}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  {intern.match}% match
                </span>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{intern.duration}</span>
                  <MapPin className="w-3 h-3 ml-2" />
                  <span>{intern.location}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {intern.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-900">{intern.stipend}</p>
              </div>
              <button
                onClick={() => handleApply(i)}
                className={`w-full py-2 text-xs font-medium rounded-lg transition-colors ${
                  appliedInternships.includes(i)
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {appliedInternships.includes(i) ? "Applied" : "Apply"}
              </button>
            </div>
          ))}
        </div>

        {/* Career Fair Pipeline */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Career Fair Pipeline</h2>
          <div className="space-y-3">
            {careerFairs.map((fair) => (
              <div key={fair.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{fair.name}</p>
                    <p className="text-xs text-muted-foreground">{fair.date} · {fair.spots} spots</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex gap-1">
                    {fair.companies.slice(0, 3).map((c) => (
                      <span key={c} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">{c}</span>
                    ))}
                    {fair.companies.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">+{fair.companies.length - 3}</span>
                    )}
                  </div>
                  <button
                    onClick={() => alert(`Register for ${fair.name}`)}
                    className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project-Based Pathways */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Project-Based Pathways</h2>
              <p className="text-xs text-muted-foreground">Short-term project opportunities for students who cannot commit to full internships</p>
            </div>
            <button
              onClick={() => alert("View all project opportunities")}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectPathways.map((project) => (
              <div key={project.title} className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">{project.company}</span>
                </div>
                <p className="text-sm font-medium mb-1">{project.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Clock className="w-3 h-3" />
                  <span>{project.duration}</span>
                  <span>·</span>
                  <span>{project.stipend}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded-full">{s}</span>
                  ))}
                </div>
                <button
                  onClick={() => alert(`Apply for ${project.title} at ${project.company}`)}
                  className="w-full py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
