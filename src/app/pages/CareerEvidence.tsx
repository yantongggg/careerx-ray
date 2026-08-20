import { demoToast } from "../state/toast";
import { NextStep } from "../state/stages";
import { useState } from "react";
import {
  Clock, Github, Linkedin, Award, CheckCircle, AlertCircle,
  Sparkles, Shield, ChevronRight, Plus, Check, X,
  BookOpen, Globe, Heart, RefreshCw, ExternalLink, Circle
} from "lucide-react";
import { useCareerProfile } from "../state/careerProfile";
import { corpusFor } from "../lib/careerCorpus";
import type { CareerProfile, EvidenceItem, TrustLevel } from "../lib/profileTypes";

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

/* ────────────────────────────────────────────────────────────────
   The record shows what the user actually added.

   Eight entries used to be authored here — a SuperAI finalist placing,
   an AWS certification, a Stripe hackathon win, an 89-star dbt package
   — and every account saw all eight as its own. The whole point of this
   page is that a claim is only worth what backs it, so inventing the
   backing was the one thing it could not do.

   The "detected" tab now proposes what would be worth adding for this
   person's role family, clearly framed as suggestions. It does not
   claim to have found things that were never there.
   ──────────────────────────────────────────────────────────────── */

const KIND_TO_TYPE: Record<string, Entry["type"]> = {
  certificate: "cert",
  project: "project",
  portfolio: "project",
  link: "project",
  reference: "leadership",
  record: "work",
  resume: "work",
  other: "work",
};

const TYPE_EMOJI: Record<Entry["type"], string> = {
  work: "💼", project: "💻", cert: "🎓", hackathon: "⚡", competition: "🏆",
  leadership: "👥", volunteer: "🤝", publication: "📝", opensource: "🔧",
};

const TRUST_TO_STATUS: Record<TrustLevel, Entry["verified"]> = {
  verified: "verified",
  corroborated: "pending",
  "self-declared": "unverified",
};

const TRUST_SCORE: Record<TrustLevel, number> = {
  verified: 96,
  corroborated: 74,
  "self-declared": 45,
};

/** Turn what the user actually gave us into the timeline's shape. */
function entriesFrom(profile: CareerProfile): Entry[] {
  const items: Entry[] = profile.evidence.map(e => {
    const type = KIND_TO_TYPE[e.kind] ?? "work";
    return {
      id: e.id,
      type,
      emoji: TYPE_EMOJI[type],
      title: e.label,
      org: e.source || "Self-declared",
      date: e.addedAt,
      skills: e.skills,
      evidenceSource: e.source || "You",
      trustScore: TRUST_SCORE[e.trust],
      verified: TRUST_TO_STATUS[e.trust],
      aiImpact: impactOf(e),
    };
  });

  /* The uploaded resume is evidence too — it is where most of the
     profile came from, and hiding it made the record look emptier
     than it is. */
  if (profile.resume) {
    items.unshift({
      id: "resume",
      type: "work",
      emoji: "📄",
      title: profile.resume.fileName,
      org: profile.resume.employers[0] ?? profile.currentRole ?? "Your history",
      date: "Uploaded during your scan",
      skills: profile.resume.skills.slice(0, 6),
      evidenceSource: profile.resume.method === "ai" ? "AI extraction" : "On-device parsing",
      trustScore: TRUST_SCORE["self-declared"],
      verified: "unverified",
      aiImpact: `Read ${profile.resume.skills.length} skills and ${profile.resume.employers.length} employer${profile.resume.employers.length === 1 ? "" : "s"} from this file. A resume is your own account of your history — it raises detail, not trust. Verify the claims that matter with an issuer.`,
    });
  }

  return items;
}

function impactOf(e: EvidenceItem): string {
  const skills = e.skills.length ? ` It backs ${e.skills.slice(0, 3).join(", ")}.` : "";
  switch (e.trust) {
    case "verified":
      return `Confirmed against the issuer's own record, so this counts fully toward your readiness score.${skills}`;
    case "corroborated":
      return `Matches a source you connected but is not issuer-confirmed, so it carries partial weight.${skills} Verify it with the issuer to close the gap.`;
    default:
      return `Currently your word alone. It appears on your profile but adds little to your score until something independent supports it.${skills}`;
  }
}

/** What this person's role family should be adding next. */
function suggestionsFrom(profile: CareerProfile) {
  return corpusFor(profile).evidenceSamples.map((sample, i) => ({
    id: `s${i + 1}`,
    title: sample.title,
    source: sample.issuer,
    sourceIcon: sample.kind === "certificate" ? Award : sample.kind === "project" ? Github : Globe,
    kind: sample.kind === "experience" ? ("record" as const) : sample.kind,
    desc: sample.detail,
  }));
}

/* A freshly-scanned account has an empty record, and that is the honest
   state to show — not eight achievements belonging to someone else. */
function NoEvidenceYet() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Shield className="h-5 w-5 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-foreground">Your record is empty</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Nothing has been added yet. Every recommendation X-Ray makes is only as
        strong as what backs it, so this page stays empty until you add
        something real — a certificate, a repository, a reference.
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        Open the <strong className="text-foreground">Suggested</strong> tab to see what counts most for your role.
      </p>
    </div>
  );
}

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
  const { profile } = useCareerProfile();
  const entries = entriesFrom(profile);
  const [open, setOpen] = useState<string | null>(null);

  if (!entries.length) return <NoEvidenceYet />;

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-xl">
        Your career evidence powers X-Ray's blind spot detection, risk scoring, and career simulations. The richer this record, the more precise your Career Health Score.
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
  const { profile, addEvidence } = useCareerProfile();
  const detected = suggestionsFrom(profile);
  const [statuses, setStatuses] = useState<Record<string, "pending" | "accepted" | "rejected">>({});

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Sparkles size={15} className="text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">What would move your score most</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ranked for {profile.targetRole || "your target role"}. Connect a source and X-Ray will watch it for new achievements, with your approval before anything is added.</p>
        </div>
        <button onClick={() => demoToast("Connect GitHub, LinkedIn or an issuer portal to enable automatic detection")} className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-xs text-primary border border-blue-200 bg-white px-3 py-1.5 rounded-lg hover:bg-blue-50 font-medium">
          <RefreshCw size={11} /> Scan
        </button>
      </div>

      {detected.map((d, i) => {
        const status = statuses[d.id] ?? "pending";
        return (
          <div key={d.id} className={`bg-white border rounded-xl p-5 shadow-sm ${status === "accepted" ? "border-emerald-200" : status === "rejected" ? "border-border opacity-50" : "border-amber-200"}`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                <d.sourceIcon size={15} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{d.title}</p>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${i === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {i === 0 ? "Highest impact" : i === 1 ? "High impact" : "Worth adding"}
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
                  <button onClick={() => {
                      /* Added on the user's word, so it enters the record
                         self-declared. Trust is earned by verification,
                         not by clicking Add. */
                      addEvidence({ kind: d.kind, label: d.title, source: d.source, trust: "self-declared", skills: [] });
                      setStatuses(p => ({ ...p, [d.id]: "accepted" }));
                      demoToast(`Added "${d.title}" as self-declared — verify it to raise its weight`);
                    }}
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
  const { profile, scorecard } = useCareerProfile();
  const entries = entriesFrom(profile);

  const verified = entries.filter(e => e.verified === "verified").length;
  const pending = entries.filter(e => e.verified === "pending").length;
  const unverified = entries.length - verified - pending;

  /* Evidence quality is the share of the record that something
     independent stands behind — not a number typed into the file. */
  const quality = entries.length
    ? Math.round(((verified * 100 + pending * 65 + unverified * 25) / entries.length))
    : 0;

  if (!entries.length) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Your evidence has no effect on your scores yet, because there is none on
          file. Each verified item moves the four numbers below.
        </p>
        <div className="bg-muted border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground mb-1">Nothing to measure</p>
          <p className="text-xs text-muted-foreground">
            Add something on the Suggested tab and the impact appears here.
          </p>
        </div>
      </div>
    );
  }

  const rows: { metric: string; value: string | number; note: string }[] = [
    {
      metric: "Career Health Score",
      value: scorecard.careerHealth,
      note: `${verified} verified item${verified === 1 ? "" : "s"} counting in full`,
    },
    {
      metric: "AI exposure",
      value: `${scorecard.aiExposure.percent}%`,
      note: "Evidence of non-automatable work is what lowers this",
    },
    {
      metric: "Promotion Readiness",
      value: scorecard.promotionReady,
      note: "Scope and leadership evidence move this most",
    },
    {
      metric: "Items on record",
      value: entries.length,
      note: `${verified} verified · ${pending} corroborated · ${unverified} self-declared`,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
        How your evidence feeds the four numbers X-Ray scores you on. Verified
        entries count in full; self-declared ones barely count at all.
      </p>
      <div className="grid gap-3">
        {rows.map(m => (
          <div key={m.metric} className="bg-white border border-border rounded-xl p-4 flex items-center gap-5">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{m.metric}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.note}</p>
            </div>
            <span className="text-lg font-bold text-foreground tabular-nums flex-shrink-0">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-muted border border-border rounded-xl p-5 mt-2">
        <div className="flex items-start gap-3">
          <Shield size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">Overall evidence quality</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${quality}%` }} />
              </div>
              <span className="text-sm font-bold text-primary tabular-nums">{quality}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {unverified > 0
                ? `${unverified} of ${entries.length} entries rest on your word alone. Verifying ${unverified === 1 ? "it" : "them"} with the issuer is the fastest way to raise this.`
                : `All ${entries.length} entries have something independent behind them.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const tabs: { id: Tab; label: string; icon: typeof Clock }[] = [
  { id: "timeline", label: "Career Timeline",    icon: Clock        },
  { id: "detected", label: "Suggested",        icon: Sparkles     },
  { id: "impact",   label: "X-Ray Impact",       icon: Shield       },
];

export function CareerEvidence({ onNavigate }: { onNavigate?: (page: string) => void }) {
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
          <button onClick={() => demoToast("Manual entry added to your review queue — or connect a source to auto-import")} className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
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

        <div className="mt-6">
          <NextStep currentPage="evidence" onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
