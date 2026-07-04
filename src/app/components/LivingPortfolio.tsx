import { useState } from "react";
import {
  Clock, Github, Linkedin, Award, Trophy, Code2, Users,
  Heart, BookOpen, GitBranch, CheckCircle, AlertCircle,
  Circle, Sparkles, TrendingUp, Eye, FileText, Brain,
  Shield, Zap, Star, ExternalLink, ChevronRight, Plus,
  BarChart3, Globe, Layers, Target, RefreshCw, Check,
  X, Info, Building2, ArrowUpRight, Cpu, Lightbulb
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab =
  | "timeline"
  | "detected"
  | "evidence"
  | "impact"
  | "analytics"
  | "dna"
  | "xray"
  | "resume";

interface TimelineEntry {
  id: string;
  type: "work" | "project" | "cert" | "hackathon" | "leadership" | "volunteer" | "publication" | "opensource" | "competition" | "internship";
  title: string;
  org: string;
  date: string;
  endDate?: string;
  description: string;
  aiImpact: string;
  skills: string[];
  evidenceSource: string;
  trustScore: number;
  verified: "verified" | "pending" | "unverified";
  emoji: string;
}

interface DetectedAchievement {
  id: string;
  type: string;
  title: string;
  source: string;
  sourceIcon: typeof Github;
  confidence: number;
  date: string;
  description: string;
  status: "pending" | "accepted" | "rejected";
}

// ─── Data ────────────────────────────────────────────────────────────────────

const typeConfig: Record<TimelineEntry["type"], { label: string; color: string; bg: string; border: string; dot: string }> = {
  work:         { label: "Work",         color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500"    },
  internship:   { label: "Internship",   color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-200", dot: "bg-indigo-500"  },
  project:      { label: "Project",      color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-200", dot: "bg-purple-500"  },
  cert:         { label: "Cert",         color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-200",dot: "bg-emerald-500" },
  hackathon:    { label: "Hackathon",    color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200", dot: "bg-orange-500"  },
  competition:  { label: "Competition",  color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-200",  dot: "bg-amber-500"   },
  leadership:   { label: "Leadership",   color: "text-rose-600",   bg: "bg-rose-50",    border: "border-rose-200",   dot: "bg-rose-500"    },
  volunteer:    { label: "Volunteer",    color: "text-teal-600",   bg: "bg-teal-50",    border: "border-teal-200",   dot: "bg-teal-500"    },
  publication:  { label: "Publication",  color: "text-slate-600",  bg: "bg-slate-50",   border: "border-slate-200",  dot: "bg-slate-500"   },
  opensource:   { label: "Open Source",  color: "text-gray-700",   bg: "bg-gray-50",    border: "border-gray-200",   dot: "bg-gray-600"    },
};

const timelineEntries: TimelineEntry[] = [
  {
    id: "t1",
    type: "competition",
    title: "SuperAI NEXT Finalist",
    org: "SuperAI Conference",
    date: "Jun 2026",
    description: "Placed Top 5 among 200 selected builders from 2,400+ applicants worldwide. Built a multi-modal AI agent for real-time maritime risk assessment.",
    aiImpact: "Demonstrates elite-level competitive positioning, rapid AI prototyping under pressure, and ability to distill complex domain problems into deployable solutions — rare signal for senior ML roles.",
    skills: ["Multi-agent AI", "Maritime Domain", "LLMs", "Rapid Prototyping"],
    evidenceSource: "SuperAI Event Website",
    trustScore: 97,
    verified: "verified",
    emoji: "🏆",
  },
  {
    id: "t2",
    type: "cert",
    title: "AWS Certified Solutions Architect",
    org: "Amazon Web Services",
    date: "Apr 2026",
    description: "Passed the AWS Solutions Architect – Associate exam with a score of 892/1000. Covers cloud architecture design, security, and high-availability system design.",
    aiImpact: "Closes the most critical gap identified in your Career X-Ray scan. Unlocks 73% of senior data & ML roles that list cloud credentials as required. Direct +8pt Career Health Score impact.",
    skills: ["AWS", "Cloud Architecture", "IAM", "S3", "EC2", "Lambda", "RDS"],
    evidenceSource: "AWS Certification Portal",
    trustScore: 99,
    verified: "verified",
    emoji: "☁️",
  },
  {
    id: "t3",
    type: "project",
    title: "AI Maritime Verification Platform",
    org: "Independent / Open Source",
    date: "Mar 2026",
    endDate: "May 2026",
    description: "Built a multi-agent AI system for automated maritime document compliance verification. Used LangGraph, GPT-4o, and a custom evidence extraction pipeline. 94% accuracy on test set.",
    aiImpact: "Strongest portfolio signal for ML Engineer transition. Demonstrates end-to-end system design, LLM orchestration, and real-world domain application — directly addresses the career pivot goal.",
    skills: ["LangGraph", "GPT-4o", "FastAPI", "Python", "PostgreSQL", "LLMs"],
    evidenceSource: "GitHub",
    trustScore: 96,
    verified: "verified",
    emoji: "💻",
  },
  {
    id: "t4",
    type: "work",
    title: "Senior Data Analyst",
    org: "Stripe",
    date: "Mar 2023",
    endDate: "Present",
    description: "Lead analytics for the Payments Intelligence team. Built real-time fraud detection dashboards serving 14 operations team members. Reduced false-positive rate by 23% through statistical model improvements.",
    aiImpact: "Core career anchor. Stripe brand and FinTech domain expertise are strong differentiators. However, role scope has remained team-level — a cross-functional project is needed to signal L5 readiness.",
    skills: ["Python", "SQL", "dbt", "Looker", "Stripe APIs", "Statistics"],
    evidenceSource: "LinkedIn",
    trustScore: 95,
    verified: "verified",
    emoji: "💼",
  },
  {
    id: "t5",
    type: "hackathon",
    title: "Stripe ML Hackathon — 1st Place",
    org: "Stripe Internal",
    date: "Nov 2023",
    description: "Won Stripe's internal ML hackathon by building a real-time transaction clustering model for anomaly detection. Competed against 43 teams across 3 engineering offices.",
    aiImpact: "Strong internal innovation signal. Combined with SuperAI finalist placement, builds a competition pedigree that differentiates you from pure analysts and strengthens ML Engineer candidacy.",
    skills: ["Clustering", "Anomaly Detection", "Python", "Scikit-learn", "Kafka"],
    evidenceSource: "Stripe Internal Records",
    trustScore: 88,
    verified: "verified",
    emoji: "⚡",
  },
  {
    id: "t6",
    type: "cert",
    title: "dbt Analytics Engineering Certification",
    org: "dbt Labs",
    date: "Sep 2023",
    description: "Certified in analytics engineering fundamentals, including data modeling, testing, documentation, and deployment practices using dbt Core and dbt Cloud.",
    aiImpact: "Validates the analytics engineering skill layer that bridges raw data work to ML. Directly supports the Analytics Engineer pivot path and shows modern data stack fluency.",
    skills: ["dbt", "Data Modeling", "SQL", "Data Testing", "Jinja"],
    evidenceSource: "dbt Labs Portal",
    trustScore: 99,
    verified: "verified",
    emoji: "📊",
  },
  {
    id: "t7",
    type: "opensource",
    title: "dbt Metrics Dashboard Package",
    org: "Open Source (GitHub)",
    date: "Jul 2023",
    description: "Authored and published an open-source dbt package for automated metric reporting across data warehouses. 89 GitHub stars, 12 contributors, used by 34 companies.",
    aiImpact: "Rare signal: most analysts don't ship production OSS. Demonstrates software engineering instincts, community engagement, and technical generosity — strong differentiator for senior IC roles.",
    skills: ["dbt", "SQL", "Jinja", "GitHub Actions", "Open Source"],
    evidenceSource: "GitHub",
    trustScore: 98,
    verified: "verified",
    emoji: "🔧",
  },
  {
    id: "t8",
    type: "leadership",
    title: "Analytics Guild Lead",
    org: "Stripe",
    date: "Jan 2024",
    endDate: "Present",
    description: "Leads a 12-person cross-functional analytics guild at Stripe, organizing monthly knowledge-sharing sessions, establishing analytics best practices, and mentoring 3 junior analysts.",
    aiImpact: "Directly addresses the 'Limited Leadership Experience' blind spot identified in your Career X-Ray. Provides the cross-functional scope needed for L5 promotion consideration.",
    skills: ["Leadership", "Mentoring", "Community Building", "Analytics"],
    evidenceSource: "LinkedIn / Stripe Internal",
    trustScore: 85,
    verified: "pending",
    emoji: "👥",
  },
  {
    id: "t9",
    type: "publication",
    title: "Fraud Pattern Detection with GBMs",
    org: "Towards Data Science",
    date: "Feb 2024",
    description: "Published technical article on using gradient boosting machines for real-time fraud pattern detection. 4,200 reads, featured in the TDS weekly digest.",
    aiImpact: "Builds thought leadership and LinkedIn discoverability in fraud/ML space. Addresses the network decay blind spot by generating inbound connection requests from relevant professionals.",
    skills: ["Technical Writing", "GBMs", "Fraud Detection", "XGBoost"],
    evidenceSource: "Medium / Towards Data Science",
    trustScore: 96,
    verified: "verified",
    emoji: "📝",
  },
  {
    id: "t10",
    type: "volunteer",
    title: "Data Science Mentor — DataKind",
    org: "DataKind",
    date: "Sep 2022",
    endDate: "Present",
    description: "Volunteer data science mentor for non-profit organizations. Have mentored 6 NGO teams on data collection, analysis, and dashboard design for social impact projects.",
    aiImpact: "Demonstrates values-alignment and leadership beyond profit motive — a signal valued by mission-driven companies like Anthropic, Khan Academy, and similar target employers.",
    skills: ["Mentoring", "Social Impact", "Data Strategy", "Tableau"],
    evidenceSource: "DataKind Platform",
    trustScore: 82,
    verified: "pending",
    emoji: "🌱",
  },
];

const detectedAchievements: DetectedAchievement[] = [
  {
    id: "d1",
    type: "competition",
    title: "SuperAI NEXT — Finalist Recognition",
    source: "SuperAI Event Website",
    sourceIcon: Globe,
    confidence: 97,
    date: "Detected 2 hours ago",
    description: "AI detected your name in the SuperAI NEXT 2026 finalist list via event website scan. Cross-referenced with your LinkedIn profile for identity confirmation.",
    status: "pending",
  },
  {
    id: "d2",
    type: "project",
    title: "New GitHub Repository: ai-maritime-verify",
    source: "GitHub",
    sourceIcon: Github,
    confidence: 99,
    date: "Detected 1 day ago",
    description: "New public repository with 24 commits, README, and FastAPI + LangGraph stack detected. AI classified as a production-grade portfolio project based on code quality signals.",
    status: "accepted",
  },
  {
    id: "d3",
    type: "cert",
    title: "AWS Solutions Architect Certification",
    source: "LinkedIn",
    sourceIcon: Linkedin,
    confidence: 94,
    date: "Detected 3 days ago",
    description: "New certification added to your LinkedIn profile. Cross-verified against AWS Certification portal metadata. Confirmed valid credential with expiry date.",
    status: "accepted",
  },
  {
    id: "d4",
    type: "leadership",
    title: "Analytics Guild Lead Role Update",
    source: "LinkedIn",
    sourceIcon: Linkedin,
    confidence: 81,
    date: "Detected 5 days ago",
    description: "New role addition detected on LinkedIn. AI extracted 'Analytics Guild Lead' from your activity and cross-referenced with Stripe organizational data.",
    status: "pending",
  },
  {
    id: "d5",
    type: "publication",
    title: "Medium Article: Fraud Pattern Detection with GBMs",
    source: "Medium / Towards Data Science",
    sourceIcon: BookOpen,
    confidence: 96,
    date: "Detected 1 week ago",
    description: "Published article detected via Medium API with verified author attribution. 4.2k reads confirmed. AI flagged as high-value thought leadership signal.",
    status: "pending",
  },
];

const growthRadarData = [
  { subject: "Technical Depth",   A: 84 },
  { subject: "Leadership",        A: 62 },
  { subject: "Industry Exposure", A: 76 },
  { subject: "Innovation",        A: 88 },
  { subject: "Communication",     A: 79 },
  { subject: "Portfolio Strength",A: 91 },
];

const skillsOverTimeData = [
  { period: "2022", technical: 62, leadership: 30, innovation: 40 },
  { period: "2023", technical: 74, leadership: 42, innovation: 58 },
  { period: "2024", technical: 80, leadership: 58, innovation: 72 },
  { period: "2025", technical: 84, leadership: 62, innovation: 84 },
  { period: "2026", technical: 88, leadership: 68, innovation: 91 },
];

const portfolioStrengthData = [
  { category: "Competitions", score: 92 },
  { category: "Projects",     score: 88 },
  { category: "Certs",        score: 82 },
  { category: "Publications", score: 71 },
  { category: "Open Source",  score: 78 },
  { category: "Leadership",   score: 58 },
];

const dnaDimensions = [
  { label: "Builder",       pct: 92, color: "bg-blue-500",   desc: "Creates tangible systems and tools" },
  { label: "Entrepreneur",  pct: 71, color: "bg-purple-500", desc: "Identifies and moves on opportunities" },
  { label: "Leader",        pct: 65, color: "bg-rose-500",   desc: "Influences and develops others" },
  { label: "Researcher",    pct: 58, color: "bg-amber-500",  desc: "Analyzes and advances knowledge" },
  { label: "Specialist",    pct: 84, color: "bg-emerald-500",desc: "Deep domain expertise" },
  { label: "Operator",      pct: 48, color: "bg-slate-500",  desc: "Executes processes at scale" },
];

const xrayInsights = {
  strengths: [
    { label: "Strong Technical Portfolio",       impact: "+6 Career Health pts",  icon: Code2  },
    { label: "Competition Pedigree (Top 5/2400)", impact: "+4 Promotion Readiness",icon: Trophy },
    { label: "Active OSS Contributor",           impact: "–12% AI Risk",          icon: GitBranch },
    { label: "Published Technical Writing",      impact: "+Network reach +18%",   icon: BookOpen },
  ],
  blindSpots: [
    { label: "Limited Cross-functional Leadership", impact: "–8 Promotion Score",   icon: Users   },
    { label: "Weak Product/PM Exposure",            impact: "Career flexibility –15%", icon: Target  },
    { label: "No Formal ML Role History",           impact: "Transition risk +22%", icon: Brain   },
  ],
  scoreImpacts: [
    { metric: "Career Health Score", before: 78, after: 84, delta: "+6" },
    { metric: "AI Risk Score",       before: 42, after: 30, delta: "–12%" },
    { metric: "Promotion Readiness", before: 65, after: 74, delta: "+9%" },
    { metric: "Simulation Accuracy", before: 84, after: 91, delta: "+7%" },
  ],
};

const resumeTargets = [
  { role: "ML Engineer",            match: 82, highlight: ["AI Maritime Project", "SuperAI Finalist", "AWS Cert", "Python/LangGraph"] },
  { role: "Analytics Engineer",     match: 91, highlight: ["dbt Cert", "OSS Package", "Stripe Work", "SQL"] },
  { role: "AI Security Engineer",   match: 68, highlight: ["Fraud ML Hackathon", "Maritime AI", "Anomaly Detection"] },
  { role: "Staff Data Scientist",   match: 54, highlight: ["Stripe Analyst", "TDS Publication", "dbt OSS"] },
];

const verificationSources = [
  { source: "GitHub",     icon: Github,    connected: true,  entries: 4 },
  { source: "LinkedIn",   icon: Linkedin,  connected: true,  entries: 6 },
  { source: "AWS Portal", icon: Award,     connected: true,  entries: 1 },
  { source: "dbt Labs",   icon: Award,     connected: true,  entries: 1 },
  { source: "Medium",     icon: BookOpen,  connected: true,  entries: 1 },
  { source: "DataKind",   icon: Heart,     connected: false, entries: 0 },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function VerifiedBadge({ status, score }: { status: TimelineEntry["verified"]; score: number }) {
  if (status === "verified") return (
    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
      <CheckCircle size={11} className="text-emerald-500" />
      <span className="text-xs font-medium text-emerald-700">Verified · {score}%</span>
    </div>
  );
  if (status === "pending") return (
    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
      <Clock size={11} className="text-amber-500" />
      <span className="text-xs font-medium text-amber-700">Pending · {score}%</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
      <Circle size={11} className="text-gray-400" />
      <span className="text-xs font-medium text-gray-500">Unverified</span>
    </div>
  );
}

function TimelineTab() {
  const [expanded, setExpanded] = useState<string | null>("t1");
  const [filter, setFilter] = useState<string>("all");

  const types = ["all", "work", "project", "cert", "hackathon", "competition", "leadership", "opensource", "publication", "volunteer"];
  const filtered = filter === "all" ? timelineEntries : timelineEntries.filter(e => e.type === filter);

  return (
    <div className="space-y-6">
      {/* Portfolio summary */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Total Entries",   value: "10",  icon: Layers,    color: "text-blue-500",   bg: "bg-blue-50",    border: "border-blue-100"    },
          { label: "Verified",        value: "8",   icon: CheckCircle,color: "text-emerald-500",bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Avg Trust Score", value: "93%", icon: Shield,    color: "text-purple-500", bg: "bg-purple-50",  border: "border-purple-100"  },
          { label: "AI Impacts Gen.", value: "10",  icon: Sparkles,  color: "text-amber-500",  bg: "bg-amber-50",   border: "border-amber-100"   },
          { label: "Portfolio Score", value: "88",  icon: Star,      color: "text-rose-500",   bg: "bg-rose-50",    border: "border-rose-100"    },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className={s.color} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-all ${
              filter === t
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {t === "all" ? "All Entries" : t === "opensource" ? "Open Source" : t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {filtered.map(entry => {
            const cfg = typeConfig[entry.type];
            const isOpen = expanded === entry.id;
            return (
              <div key={entry.id} className="relative flex gap-5">
                {/* Dot */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white shadow-sm ${cfg.dot}`}>
                  <span className="text-sm leading-none">{entry.emoji}</span>
                </div>
                {/* Card */}
                <div className={`flex-1 bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isOpen ? "border-primary/30 ring-1 ring-blue-100" : "border-border hover:border-primary/20"}`}>
                  <button
                    className="w-full flex items-start gap-4 px-5 py-4 text-left"
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>{cfg.label}</span>
                        <VerifiedBadge status={entry.verified} score={entry.trustScore} />
                      </div>
                      <h3 className="font-semibold text-foreground mt-1.5">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground">{entry.org} · {entry.date}{entry.endDate ? ` – ${entry.endDate}` : ""}</p>
                    </div>
                    <ChevronRight size={16} className={`text-muted-foreground flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-border px-5 py-4 space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{entry.description}</p>

                      {/* AI Impact */}
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={13} className="text-primary" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Career Impact</span>
                        </div>
                        <p className="text-sm text-blue-900 leading-relaxed">{entry.aiImpact}</p>
                      </div>

                      {/* Skills + Evidence */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Skills Gained</p>
                          <div className="flex flex-wrap gap-1.5">
                            {entry.skills.map(s => (
                              <span key={s} className="text-xs bg-muted border border-border text-foreground px-2 py-0.5 rounded-md">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Evidence</p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ExternalLink size={11} />
                            <span>{entry.evidenceSource}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetectedTab() {
  const [statuses, setStatuses] = useState<Record<string, DetectedAchievement["status"]>>(
    Object.fromEntries(detectedAchievements.map(d => [d.id, d.status]))
  );

  const accept  = (id: string) => setStatuses(p => ({ ...p, [id]: "accepted" }));
  const reject  = (id: string) => setStatuses(p => ({ ...p, [id]: "rejected" }));

  const pending  = detectedAchievements.filter(d => statuses[d.id] === "pending");
  const accepted = detectedAchievements.filter(d => statuses[d.id] === "accepted");
  const rejected = detectedAchievements.filter(d => statuses[d.id] === "rejected");

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-white border border-blue-100 rounded-xl flex items-center justify-center">
            <Cpu size={17} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">AI Achievement Detection Engine</p>
            <p className="text-xs text-muted-foreground">Scans GitHub · LinkedIn · Event Sites · Certification Portals · Medium every 24 hours</p>
          </div>
          <button className="ml-auto flex items-center gap-1.5 text-xs text-primary border border-blue-200 bg-white px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            <RefreshCw size={12} /> Re-scan Now
          </button>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: "Sources Monitored", value: "6" },
            { label: "Last Scan", value: "2 hrs ago" },
            { label: "Pending Review", value: `${pending.length}` },
            { label: "Auto-Verified", value: `${accepted.length}` },
          ].map(s => (
            <div key={s.label}>
              <p className="text-base font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow: Detected → Review → Accept/Reject */}
      <div className="flex items-center gap-3 bg-white border border-border rounded-xl p-4">
        {["AI Detects Achievement", "You Review Evidence", "Accept or Skip", "Added to Living Portfolio"].map((step, i) => (
          <div key={step} className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground border border-border"}`}>{i + 1}</div>
              <span className="text-xs font-medium text-foreground">{step}</span>
            </div>
            {i < 3 && <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            Pending Review <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-1">{pending.length}</span>
          </h3>
          <div className="space-y-3">
            {pending.map(d => (
              <div key={d.id} className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                      <d.sourceIcon size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-foreground">{d.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.confidence >= 90 ? "bg-emerald-100 text-emerald-700" : d.confidence >= 75 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {d.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Source: {d.source} · {d.date}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => reject(d.id)} className="flex items-center gap-1.5 text-xs border border-border text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                      <X size={12} /> Skip
                    </button>
                    <button onClick={() => accept(d.id)} className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      <Check size={12} /> Add to Portfolio
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted */}
      {accepted.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            Added to Portfolio <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-1">{accepted.length}</span>
          </h3>
          <div className="space-y-2">
            {accepted.map(d => (
              <div key={d.id} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.source} · {d.confidence}% confidence</p>
                </div>
                <span className="text-xs text-emerald-600 font-medium">In Portfolio</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-1">Verified Evidence Sources</h3>
        <p className="text-xs text-muted-foreground mb-5">CareerX-Ray connects to your professional accounts to verify and timestamp each portfolio entry.</p>
        <div className="space-y-3">
          {verificationSources.map(v => (
            <div key={v.source} className={`flex items-center gap-4 p-4 rounded-xl border ${v.connected ? "bg-white border-border" : "bg-muted border-border opacity-60"}`}>
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                <v.icon size={18} className="text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{v.source}</p>
                <p className="text-xs text-muted-foreground">{v.connected ? `${v.entries} entries verified` : "Not connected"}</p>
              </div>
              {v.connected ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle size={12} /> Connected
                  </div>
                </div>
              ) : (
                <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">Connect</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trust breakdown per entry */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-5">Trust Score Breakdown</h3>
        <div className="space-y-3">
          {timelineEntries.slice(0, 6).map(e => (
            <div key={e.id} className="flex items-center gap-4">
              <span className="text-base">{e.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground truncate">{e.title}</span>
                  <span className={`text-xs font-bold ml-2 flex-shrink-0 ${e.trustScore >= 95 ? "text-emerald-600" : e.trustScore >= 80 ? "text-amber-600" : "text-gray-500"}`}>{e.trustScore}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${e.trustScore}%`, backgroundColor: e.trustScore >= 95 ? "#22C55E" : e.trustScore >= 80 ? "#F59E0B" : "#94A3B8" }} />
                </div>
              </div>
              <VerifiedBadge status={e.verified} score={e.trustScore} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImpactTab() {
  const [selected, setSelected] = useState(timelineEntries[0]);

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      {/* Entry list */}
      <div className="lg:col-span-2 bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Achievement</p>
        </div>
        <div className="divide-y divide-border">
          {timelineEntries.map(e => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${selected.id === e.id ? "bg-blue-50 border-r-2 border-primary" : "hover:bg-muted/50"}`}
            >
              <span className="text-lg flex-shrink-0">{e.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.org} · {e.date}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Impact panel */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-start gap-3 mb-5">
            <span className="text-3xl">{selected.emoji}</span>
            <div>
              <h3 className="font-bold text-foreground">{selected.title}</h3>
              <p className="text-sm text-muted-foreground">{selected.org} · {selected.date}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-white border border-blue-200 rounded-lg flex items-center justify-center">
                <Sparkles size={14} className="text-primary" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">AI-Generated Impact Summary</span>
            </div>
            <p className="text-sm text-blue-900 leading-relaxed mb-4">{selected.aiImpact}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skills Demonstrated</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.skills.map(s => <span key={s} className="text-xs bg-white border border-border text-foreground px-2 py-0.5 rounded-md">{s}</span>)}
              </div>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Career Relevance</p>
              <div className="space-y-2">
                {["ML Engineer Pivot", "Senior IC Readiness", "Thought Leadership"].map((r, i) => (
                  <div key={r} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-emerald-500" : i === 1 ? "bg-blue-500" : "bg-amber-500"}`} />
                    <span className="text-xs text-foreground">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Industry Relevance Signal</p>
          <div className="space-y-2">
            {[
              { label: "AI/ML Industry",          pct: 96 },
              { label: "FinTech / Payments",       pct: 88 },
              { label: "Enterprise Data",          pct: 74 },
              { label: "Product & Strategy",       pct: 52 },
            ].map(r => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{r.label}</span>
                  <span className="text-xs font-semibold text-primary">{r.pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Radar */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-1">Portfolio Strength Radar</h3>
          <p className="text-xs text-muted-foreground mb-4">Competency profile derived from all portfolio entries</p>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={growthRadarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <Radar key="radar-portfolio" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth trends */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-1">Growth Trends Over Time</h3>
          <p className="text-xs text-muted-foreground mb-4">Year-over-year competency evolution</p>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={skillsOverTimeData}>
                <defs>
                  <linearGradient id="gradTech" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gradLead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#A855F7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gradInnov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} domain={[0, 100]} />
                <Tooltip />
                <Area key="area-technical"  type="monotone" dataKey="technical"  name="Technical"  stroke="#2563EB" strokeWidth={2} fill="url(#gradTech)"  isAnimationActive={false} />
                <Area key="area-leadership" type="monotone" dataKey="leadership" name="Leadership" stroke="#A855F7" strokeWidth={2} fill="url(#gradLead)"  isAnimationActive={false} />
                <Area key="area-innovation" type="monotone" dataKey="innovation" name="Innovation" stroke="#22C55E" strokeWidth={2} fill="url(#gradInnov)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2">
            {[["Technical","#2563EB"],["Leadership","#A855F7"],["Innovation","#22C55E"]].map(([l,c])=>(
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-xs text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio strength by category */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-5">Portfolio Strength by Category</h3>
        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={portfolioStrengthData} barSize={32}>
              <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} domain={[0, 100]} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Strength"]} />
              <Bar key="bar-strength" dataKey="score" radius={[6, 6, 0, 0]} fill="#2563EB" background={{ fill: "#F1F5F9", radius: 6 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function DNATab() {
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold">Career DNA Profile</h3>
            <p className="text-blue-100 text-sm">Generated from 10 portfolio entries · 94% confidence</p>
          </div>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed">
          Jordan's career DNA is dominated by <strong className="text-white">Builder</strong> and <strong className="text-white">Specialist</strong> traits, with a strong secondary signal around <strong className="text-white">Entrepreneurship</strong>. This profile is rare — fewer than 8% of analytics professionals combine deep technical execution with competitive innovation activity. The most aligned career paths include Staff ML Engineer, Head of AI, and Technical Founder roles.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">DNA Dimensions</h3>
          {dnaDimensions.sort((a, b) => b.pct - a.pct).map(d => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm font-semibold text-foreground">{d.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{d.desc}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{d.pct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${d.color} transition-all`} style={{ width: `${d.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-3">Primary Archetype</h3>
            <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Code2 size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">Builder-Specialist</p>
                <p className="text-sm text-muted-foreground">Deep technical executor who ships real systems. Rarest combination in data careers.</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-100 text-primary px-2 py-0.5 rounded-full font-medium">92% Builder</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">84% Specialist</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-3">Best-Fit Career Archetypes</h3>
            <div className="space-y-2">
              {[
                { title: "Staff / Principal ML Engineer", fit: 94 },
                { title: "Head of AI / Machine Learning",  fit: 87 },
                { title: "AI Technical Lead",              fit: 82 },
                { title: "Technical Founder",              fit: 76 },
              ].map(a => (
                <div key={a.title} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                  <span className="text-sm font-medium text-foreground">{a.title}</span>
                  <span className={`text-xs font-bold ${a.fit >= 90 ? "text-emerald-600" : a.fit >= 80 ? "text-blue-500" : "text-amber-600"}`}>{a.fit}% fit</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function XRayTab({ onNavigate }: { onNavigate: (p: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
            <Zap size={17} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Living Portfolio → CareerX-Ray Connection</h3>
            <p className="text-xs text-muted-foreground">Your portfolio data directly powers risk detection, score calculation, and simulation accuracy</p>
          </div>
        </div>

        {/* Score impacts */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {xrayInsights.scoreImpacts.map(s => (
            <div key={s.metric} className="bg-muted rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">{s.metric}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-base font-semibold text-muted-foreground">{s.before}</span>
                <ArrowUpRight size={14} className="text-emerald-500" />
                <span className="text-base font-bold text-foreground">{s.after}</span>
              </div>
              <span className={`text-xs font-bold mt-1 block ${s.delta.startsWith("+") ? "text-emerald-600" : "text-blue-500"}`}>{s.delta} from portfolio</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Strengths */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle size={13} className="text-emerald-500" /> Portfolio Strengths Detected
            </p>
            <div className="space-y-2">
              {xrayInsights.strengths.map(s => (
                <div key={s.label} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <s.icon size={14} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">{s.label}</span>
                  <span className="text-xs font-semibold text-emerald-600 flex-shrink-0">{s.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blind spots */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle size={13} className="text-red-400" /> Portfolio Blind Spots
            </p>
            <div className="space-y-2">
              {xrayInsights.blindSpots.map(s => (
                <div key={s.label} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <s.icon size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">{s.label}</span>
                  <span className="text-xs font-semibold text-red-500 flex-shrink-0">{s.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick links to X-Ray pages */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "View Career Dashboard",    page: "dashboard",    icon: BarChart3, desc: "Updated with portfolio signals"      },
          { label: "Open Decision Lab",         page: "decisionlab",  icon: Lightbulb, desc: "Scenarios powered by your portfolio" },
          { label: "Review Blind Spots",        page: "blindspots",   icon: Eye,       desc: "3 gaps identified from portfolio"    },
        ].map(l => (
          <button
            key={l.page}
            onClick={() => onNavigate(l.page)}
            className="p-4 bg-white border border-border rounded-xl hover:border-primary/40 hover:bg-blue-50/30 transition-all text-left group"
          >
            <l.icon size={18} className="text-primary mb-3" />
            <p className="text-sm font-semibold text-foreground mb-0.5">{l.label}</p>
            <p className="text-xs text-muted-foreground">{l.desc}</p>
            <ArrowUpRight size={13} className="text-muted-foreground mt-2 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ResumeTab() {
  const [selectedTarget, setSelectedTarget] = useState(resumeTargets[0]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2200);
  };

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>This is not a resume builder.</strong> CareerX-Ray generates role-optimized resumes from your verified Living Portfolio — reordering experiences, rewriting impact statements, and surfacing the right signals for each target role automatically.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Target selector */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Target Role</p>
          </div>
          <div className="divide-y divide-border">
            {resumeTargets.map(t => (
              <button
                key={t.role}
                onClick={() => { setSelectedTarget(t); setGenerated(false); }}
                className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors ${selectedTarget.role === t.role ? "bg-blue-50 border-r-2 border-primary" : "hover:bg-muted/50"}`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{t.role}</p>
                  <p className="text-xs text-muted-foreground">{t.match}% portfolio match</p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.match >= 85 ? "bg-emerald-100 text-emerald-700" : t.match >= 70 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                  {t.match}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generator panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground">Target: {selectedTarget.role}</h3>
                <p className="text-sm text-muted-foreground">{selectedTarget.match}% portfolio match · {selectedTarget.highlight.length} entries to highlight</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium shadow-sm shadow-blue-100"
              >
                {generating ? (
                  <><RefreshCw size={14} className="animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles size={14} /> Generate Resume</>
                )}
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Will Highlight</p>
              {selectedTarget.highlight.map(h => (
                <div key={h} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-foreground">{h}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI Actions Applied</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Reorders experiences by role relevance",
                  "Rewrites impact statements for target role",
                  "Highlights matching skills from portfolio",
                  "Removes irrelevant entries automatically",
                  "Generates role-specific summary",
                  "Calibrates tone for target company tier",
                ].map(a => (
                  <div key={a} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {generated && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle size={18} className="text-emerald-600" />
                <p className="font-semibold text-foreground">Resume Generated for {selectedTarget.role}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">AI tailored 8 portfolio entries, rewrote 3 impact statements, and generated a role-specific summary. Your strongest signals for this role have been surfaced.</p>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white border border-emerald-200 text-foreground text-sm px-4 py-2 rounded-lg hover:bg-emerald-50/50 transition-colors font-medium">
                  <Eye size={14} /> Preview
                </button>
                <button className="flex items-center gap-2 bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  <FileText size={14} /> Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const tabs: { id: Tab; label: string; icon: typeof Clock; badge?: string }[] = [
  { id: "timeline",  label: "Timeline",       icon: Clock      },
  { id: "detected",  label: "AI Detected",    icon: Sparkles, badge: "3" },
  { id: "evidence",  label: "Evidence",       icon: Shield     },
  { id: "impact",    label: "AI Impact",      icon: Brain      },
  { id: "analytics", label: "Analytics",      icon: BarChart3  },
  { id: "dna",       label: "Career DNA",     icon: Cpu        },
  { id: "xray",      label: "X-Ray Connect",  icon: Zap        },
  { id: "resume",    label: "Resume Gen",     icon: FileText   },
];

interface LivingPortfolioProps {
  onNavigate: (page: string) => void;
}

export function LivingPortfolio({ onNavigate }: LivingPortfolioProps) {
  const [activeTab, setActiveTab] = useState<Tab>("timeline");

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Living Portfolio</h1>
              <span className="text-xs bg-blue-50 text-primary border border-blue-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Sparkles size={10} /> AI-Powered
              </span>
            </div>
            <p className="text-muted-foreground text-sm">Your lifelong professional record — automatically captured, verified, and evolving</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate("recruiter")}
              className="flex items-center gap-2 border border-border bg-white text-foreground text-sm px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium shadow-sm"
            >
              <Eye size={14} /> Recruiter View
            </button>
            <button className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Plus size={14} /> Add Entry
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1.5 mb-6 overflow-x-auto shadow-sm">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === t.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <t.icon size={14} />
              {t.label}
              {t.badge && activeTab !== t.id && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold leading-none">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "timeline"  && <TimelineTab />}
        {activeTab === "detected"  && <DetectedTab />}
        {activeTab === "evidence"  && <EvidenceTab />}
        {activeTab === "impact"    && <ImpactTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "dna"       && <DNATab />}
        {activeTab === "xray"      && <XRayTab onNavigate={onNavigate} />}
        {activeTab === "resume"    && <ResumeTab />}
      </div>
    </div>
  );
}
