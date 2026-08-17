import { useState } from "react";
import {
  Award, BadgeCheck, BookOpen, ChevronRight, ExternalLink, Layers,
  Link2, Lock, RefreshCcw, Share2, Shield, TrendingUp, Wallet, CheckCircle2
} from "lucide-react";

const kpis = [
  { label: "Skill Credits Earned", value: "9,420", icon: Award },
  { label: "Micro-Credentials Issued", value: "156", icon: BadgeCheck },
  { label: "Verified Projects", value: "34", icon: Shield },
  { label: "Reskilling Pathways Active", value: "12", icon: RefreshCcw },
];

const credentials = [
  { name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "May 2026", verified: true, type: "Certification" },
  { name: "Data Engineering Fundamentals", issuer: "University of Malaya", date: "Apr 2026", verified: true, type: "Micro-Credential" },
  { name: "Agile Product Management", issuer: "Scrum Alliance", date: "Mar 2026", verified: true, type: "Certification" },
  { name: "Python for ML", issuer: "Coursera x Stanford", date: "Feb 2026", verified: true, type: "Micro-Credential" },
  { name: "UI/UX Design Sprint", issuer: "Google", date: "Jan 2026", verified: true, type: "Certification" },
  { name: "Cybersecurity Basics", issuer: "CompTIA", date: "Dec 2025", verified: true, type: "Micro-Credential" },
];

const creditLedger = [
  { activity: "AWS Cloud Practitioner Exam", source: "Certification", date: "May 2026", credits: 120, category: "Cloud" },
  { activity: "Capstone: ML Fraud Detection", source: "Project", date: "Apr 2026", credits: 200, category: "AI/ML" },
  { activity: "Data Engineering Course", source: "Course", date: "Apr 2026", credits: 80, category: "Data" },
  { activity: "Hackathon: FinTech Challenge", source: "Project", date: "Mar 2026", credits: 150, category: "Finance" },
  { activity: "Agile PM Certification", source: "Certification", date: "Mar 2026", credits: 100, category: "Management" },
  { activity: "Python for ML (Coursera)", source: "Course", date: "Feb 2026", credits: 90, category: "AI/ML" },
  { activity: "Open Source Contribution", source: "Project", date: "Jan 2026", credits: 60, category: "Engineering" },
];

const reskillingPathways = [
  { title: "Cloud Architect Track", progress: 72, skills: ["AWS", "Terraform", "Kubernetes"], target: "Cloud Solutions Architect", credits: 340 },
  { title: "Data Science Path", progress: 45, skills: ["Python", "TensorFlow", "SQL"], target: "Data Scientist", credits: 280 },
  { title: "Full-Stack Developer", progress: 60, skills: ["React", "Node.js", "PostgreSQL"], target: "Full-Stack Engineer", credits: 310 },
  { title: "Cybersecurity Specialist", progress: 30, skills: ["Network Security", "Pen Testing", "SIEM"], target: "Security Analyst", credits: 250 },
];

export function LearningWallet() {
  const [activeTab, setActiveTab] = useState<"credentials" | "ledger" | "pathways">("credentials");
  const [sharedCredentials, setSharedCredentials] = useState<number[]>([]);

  const handleShare = (index: number, platform: string) => {
    if (!sharedCredentials.includes(index)) {
      setSharedCredentials([...sharedCredentials, index]);
    }
    alert(`Sharing credential to ${platform}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold">Lifelong Learning Wallet</h1>
          </div>
          <p className="text-slate-300 text-sm">
            Your portable, verified record of micro-credentials, skill credits, and reskilling activity — from school to work and beyond.
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

        {/* Blockchain Verification Banner */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Blockchain Verified</p>
            <p className="text-xs text-muted-foreground">All credentials are cryptographically signed and tamper-proof. Employers can verify instantly.</p>
          </div>
          <button
            onClick={() => alert("View blockchain verification details")}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            <Link2 className="w-3 h-3" /> Verify
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("credentials")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "credentials"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-border hover:bg-slate-50"
            }`}
          >
            My Credentials
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "ledger"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-border hover:bg-slate-50"
            }`}
          >
            Skill Credit Ledger
          </button>
          <button
            onClick={() => setActiveTab("pathways")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "pathways"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-border hover:bg-slate-50"
            }`}
          >
            Reskilling Pathways
          </button>
        </div>

        {/* My Credentials */}
        {activeTab === "credentials" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.map((cred, i) => (
              <div key={cred.name} className="bg-white border border-border rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  {cred.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold mb-1">{cred.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{cred.issuer}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span>{cred.date}</span>
                  <span>·</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{cred.type}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(i, "LinkedIn")}
                    className="flex-1 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-3 h-3" /> LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare(i, "Portfolio")}
                    className="flex-1 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Portfolio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skill Credit Ledger */}
        {activeTab === "ledger" && (
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Skill Credit Ledger</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Activity</th>
                    <th className="pb-2 font-medium">Source</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Credits</th>
                    <th className="pb-2 font-medium">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {creditLedger.map((entry) => (
                    <tr key={entry.activity} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">{entry.activity}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          entry.source === "Certification"
                            ? "bg-purple-50 text-purple-700"
                            : entry.source === "Project"
                            ? "bg-green-50 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }`}>
                          {entry.source}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{entry.date}</td>
                      <td className="py-3 font-semibold text-amber-700">+{entry.credits}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">{entry.category}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total credits earned this year</p>
              <p className="text-lg font-bold text-amber-700">800 credits</p>
            </div>
          </div>
        )}

        {/* Reskilling Pathways */}
        {activeTab === "pathways" && (
          <div className="space-y-4">
            {reskillingPathways.map((pathway) => (
              <div key={pathway.title} className="bg-white border border-border rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold">{pathway.title}</h3>
                    <p className="text-xs text-muted-foreground">Target role: {pathway.target}</p>
                  </div>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    {pathway.credits} credits
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium">{pathway.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${pathway.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {pathway.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">{skill}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => alert(`Continue ${pathway.title}`)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    Continue <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Section */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Export Your Learning Wallet</h2>
              <p className="text-xs text-muted-foreground">Share your verified credentials and skill record with employers or institutions</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => alert("Exporting to LinkedIn profile")}
                className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" /> LinkedIn
              </button>
              <button
                onClick={() => alert("Downloading PDF portfolio")}
                className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> PDF Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
