import { useState } from "react";
import {
  Clock, Github, Linkedin, Award, CheckCircle, AlertCircle,
  Sparkles, Shield, ChevronRight, Plus, Check, X,
  BookOpen, Globe, Heart, RefreshCw, ExternalLink, Circle
} from "lucide-react";

type Tab = "timeline" | "detected" | "impact";

interface Entry {
  id: string;
  type: "work" | "project" | "cert" | "hackathon" | "competition" | "leadership" | "volunteer" | "publication" | "opensource";
  title: string;
  org: string;
  date: string;
  skills: string[];
  evidenceSource: string;
  trustScore: number;
  verified: "verified" | "pending" | "unverified";
  aiImpact: string;
  emoji: string;
}

const typeLabel: Record<Entry["type"], string> = {
  work: "Work", project: "Project", cert: "Certification",
  hackathon: "Hackathon", competition: "Competition", leadership: "Leadership",
  volunteer: "Volunteer", publication: "Publication", opensource: "Open Source",
};

const typeColor: Record<Entry["type"], { text: string; bg: string; border: string }> = {
  work:        { text: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200"    },
  project:     { text: "text-purple-600",  bg: "bg-purple-50",  border: "border-purple-200"  },
  cert:        { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  hackathon:   { text: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200"  },
  competition: { text: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"   },
  leadership:  { text: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200"    },
  volunteer:   { text: "text-teal-600",    bg: "bg-teal-50",    border: "border-teal-200"    },
  publication: { text: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200"   },
  opensource:  { text: "text-gray-700",    bg: "bg-gray-50",    border: "border-gray-200"    },
};

const entries: Entry[] = [
  {
    id: "e1", type: "competition", emoji: "🏆",
    title: "SuperAI NEXT Finalist", org: "SuperAI Conference", date: "Jun 2026",
    skills: ["Multi-agent AI", "LLMs", "Rapid Prototyping"],
    evidenceSource: "SuperAI Event Website", trustScore: 97, verified: "verified",
    aiImpact: "Elite competitive signal. Top 5/2,400 applicants. Directly supports ML Engineer transition credibility and raises Promotion Readiness by +4pts.",
  },
  {
    id: "e2", type: "cert", emoji: "☁️",
    title: "AWS Certified Solutions Architect", org: "Amazon Web Services", date: "Apr 2026",
    skills: ["AWS", "Cloud Architecture", "IAM", "EC2"],
    evidenceSource: "AWS Certification Portal", trustScore: 99, verified: "verified",
    aiImpact: "Closes the #1 career gap identified in your X-Ray scan. Unlocks 73% of target roles. Direct +8pt Career Health Score contribution.",
  },
  {
    id: "e3", type: "project", emoji: "💻",
    title: "AI Maritime Verification Platform", org: "Open Source", date: "Mar–May 2026",
    skills: ["LangGraph", "GPT-4o", "FastAPI", "Python"],
    evidenceSource: "GitHub", trustScore: 96, verified: "verified",
    aiImpact: "Strongest portfolio signal for ML pivot. Demonstrates end-to-end LLM system design. Reduces AI Risk Score by –12pts by proving non-automatable skill depth.",
  },
  {
    id: "e4", type: "work", emoji: "💼",
    title: "Senior Data Analyst", org: "Stripe", date: "Mar 2023–Present",
    skills: ["Python", "SQL", "dbt", "Looker", "Statistics"],
    evidenceSource: "LinkedIn", trustScore: 95, verified: "verified",
    aiImpact: "Core career anchor. Stripe brand and FinTech depth are strong differentiators. However, role scope is team-level — a cross-functional project is needed for L5 promotion signal.",
  },
  {
    id: "e5", type: "hackathon", emoji: "⚡",
    title: "Stripe ML Hackathon — 1st Place", org: "Stripe Internal", date: "Nov 2023",
    skills: ["Clustering", "Anomaly Detection", "Kafka", "Python"],
    evidenceSource: "Stripe Internal", trustScore: 88, verified: "verified",
    aiImpact: "Combined with SuperAI placement, builds a competition pedigree that differentiates from pure analysts. Raises innovation signal by +15pts.",
  },
  {
    id: "e6", type: "leadership", emoji: "👥",
    title: "Analytics Guild Lead", org: "Stripe", date: "Jan 2024–Present",
    skills: ["Leadership", "Mentoring", "Community Building"],
    evidenceSource: "LinkedIn / Stripe Internal", trustScore: 85, verified: "pending",
    aiImpact: "Directly addresses the 'Limited Leadership' blind spot. Adds cross-functional scope needed for L5 promotion consideration. Raises Promotion Readiness by +9pts.",
  },
  {
    id: "e7", type: "opensource", emoji: "🔧",
    title: "dbt Metrics Dashboard Package", org: "GitHub (89★)", date: "Jul 2023",
    skills: ["dbt", "SQL", "Jinja", "GitHub Actions"],
    evidenceSource: "GitHub", trustScore: 98, verified: "verified",
    aiImpact: "Rare signal — most analysts don't ship OSS. Reduces AI Risk Score, demonstrates software engineering instincts beyond analytics execution.",
  },
  {
    id: "e8", type: "publication", emoji: "📝",
    title: "Fraud Pattern Detection with GBMs", org: "Towards Data Science", date: "Feb 2024",
    skills: ["Technical Writing", "XGBoost", "Fraud Detection"],
    evidenceSource: "Medium / TDS", trustScore: 96, verified: "verified",
    aiImpact: "Builds thought leadership and discoverability. Partially addresses network decay blind spot by generating inbound connections from relevant professionals.",
  },
];

const detected = [
  {
    id: "d1", title: "SuperAI NEXT — Finalist Recognition",
    source: "SuperAI Website", sourceIcon: Globe, confidence: 97,
    desc: "Your name detected in the official SuperAI NEXT 2026 finalist list. Cross-referenced with LinkedIn profile.",
    status: "pending" as const,
  },
  {
    id: "d2", title: "New GitHub Repo: ai-maritime-verify",
    source: "GitHub", sourceIcon: Github, confidence: 99,
    desc: "New public repo with 24 commits, FastAPI + LangGraph stack. AI classified as production-grade portfolio project.",
    status: "accepted" as const,
  },
  {
    id: "d3", title: "AWS Certification Added",
    source: "LinkedIn", sourceIcon: Linkedin, confidence: 94,
    desc: "New certification detected on your LinkedIn. Cross-verified with AWS portal metadata.",
    status: "accepted" as const,
  },
];

function VerifiedBadge({ status, score }: { status: Entry["verified"]; score: number }) {
  if (status === "verified") return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
      <CheckCircle size={10} /> Verified · {score}%
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
      <Clock size={10} /> Pending · {score}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
      <Circle size={10} /> Unverified
    </span>
  );
}

function TimelineTab() {
  const [open, setOpen] = useState<string | null>("e1");
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-xl">
        Your verified career evidence powers X-Ray's blind spot detection, risk scoring, and career simulations. The richer this record, the more precise your Career Health Score.
      </p>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-3">
          {entries.map(e => {
            const c   = typeColor[e.type];
            const isOpen = open === e.id;
            return (
              <div key={e.id} className="relative flex gap-5">
                <div className="relative z-10 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-white border-2 border-border shadow-sm text-base">
                  {e.emoji}
                </div>
                <div className={`flex-1 bg-white rounded-xl border shadow-sm overflow-hidden ${isOpen ? "border-primary/30" : "border-border"}`}>
                  <button className="w-full flex items-start gap-3 px-5 py-4 text-left" onClick={() => setOpen(isOpen ? null : e.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${c.text} ${c.bg} ${c.border}`}>{typeLabel[e.type]}</span>
                        <VerifiedBadge status={e.verified} score={e.trustScore} />
                      </div>
                      <p className="font-semibold text-foreground text-sm mt-1">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.org} · {e.date}</p>
                    </div>
                    <ChevronRight size={15} className={`text-muted-foreground flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border px-5 py-4 space-y-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
                          <Sparkles size={12} /> X-Ray Impact
                        </p>
                        <p className="text-xs text-blue-900 leading-relaxed">{e.aiImpact}</p>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          {e.skills.map(s => <span key={s} className="text-xs bg-muted border border-border text-foreground px-2 py-0.5 rounded-md">{s}</span>)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <ExternalLink size={10} /> {e.evidenceSource}
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
  const [statuses, setStatuses] = useState<Record<string, "pending" | "accepted" | "rejected">>(
    Object.fromEntries(detected.map(d => [d.id, d.status]))
  );

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Sparkles size={15} className="text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">AI Detection Engine</p>
          <p className="text-xs text-muted-foreground mt-0.5">Scans GitHub, LinkedIn, AWS, dbt Labs, Medium every 24 hours. New achievements are surfaced for your approval before being added to your evidence record.</p>
        </div>
        <button className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-xs text-primary border border-blue-200 bg-white px-3 py-1.5 rounded-lg hover:bg-blue-50 font-medium">
          <RefreshCw size={11} /> Scan
        </button>
      </div>

      {detected.map(d => {
        const status = statuses[d.id];
        return (
          <div key={d.id} className={`bg-white border rounded-xl p-5 shadow-sm ${status === "accepted" ? "border-emerald-200" : status === "rejected" ? "border-border opacity-50" : "border-amber-200"}`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                <d.sourceIcon size={15} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{d.title}</p>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${d.confidence >= 90 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {d.confidence}% confidence
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Source: {d.source}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
              {status === "pending" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setStatuses(p => ({ ...p, [d.id]: "rejected" }))}
                    className="text-xs border border-border text-muted-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
                    <X size={11} /> Skip
                  </button>
                  <button onClick={() => setStatuses(p => ({ ...p, [d.id]: "accepted" }))}
                    className="text-xs bg-primary text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1">
                    <Check size={11} /> Add
                  </button>
                </div>
              )}
              {status === "accepted" && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 flex-shrink-0"><CheckCircle size={12} /> Added</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ImpactTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
        Here's how your career evidence directly influences your X-Ray scores and recommendations. Every verified entry improves accuracy.
      </p>
      <div className="grid gap-3">
        {[
          { metric: "Career Health Score",  before: 78, after: 84, delta: "+6 pts",  source: "AWS Cert + OSS Project + Guild Lead",       positive: true  },
          { metric: "AI Risk Score",        before: 42, after: 30, delta: "–12%",    source: "Maritime AI Project + OSS Package",          positive: true  },
          { metric: "Promotion Readiness",  before: 65, after: 74, delta: "+9%",     source: "Guild Lead + SuperAI Finalist recognition", positive: true  },
          { metric: "Blind Spots Detected", before: 5,  after: 3,  delta: "–2 gaps", source: "AWS Cert closes cloud gap",                 positive: true  },
        ].map(m => (
          <div key={m.metric} className="bg-white border border-border rounded-xl p-4 flex items-center gap-5">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{m.metric}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Driven by: {m.source}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm text-muted-foreground">{m.before}</span>
              <span className="text-xs text-muted-foreground">→</span>
              <span className="text-sm font-bold text-foreground">{m.after}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">{m.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted border border-border rounded-xl p-5 mt-2">
        <div className="flex items-start gap-3">
          <Shield size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Overall Evidence Quality</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "88%" }} />
              </div>
              <span className="text-sm font-bold text-primary">88%</span>
            </div>
            <p className="text-xs text-muted-foreground">8 of 8 entries have evidence. 6 verified, 2 pending. Add DataKind volunteering verification to reach 95%+.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const tabs: { id: Tab; label: string; icon: typeof Clock }[] = [
  { id: "timeline", label: "Career Timeline",    icon: Clock        },
  { id: "detected", label: "AI Detected",        icon: Sparkles     },
  { id: "impact",   label: "X-Ray Impact",       icon: Shield       },
];

export function CareerEvidence() {
  const [active, setActive] = useState<Tab>("timeline");
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1000px] mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Career Evidence</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Verified achievements that power your X-Ray scores, blind spot detection, and career simulations.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Plus size={14} /> Add Entry
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Entries",    value: "8",   color: "text-foreground"  },
            { label: "Verified",   value: "6",   color: "text-emerald-600" },
            { label: "Pending",    value: "2",   color: "text-amber-600"   },
            { label: "Trust Avg",  value: "93%", color: "text-primary"     },
          ].map(s => (
            <div key={s.label} className="bg-white border border-border rounded-xl p-4 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1.5 mb-6 w-fit shadow-sm">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active === t.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {active === "timeline" && <TimelineTab />}
        {active === "detected" && <DetectedTab />}
        {active === "impact"   && <ImpactTab />}
      </div>
    </div>
  );
}
