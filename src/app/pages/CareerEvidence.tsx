import { demoToast } from "../state/toast";
import { NextStep } from "../state/stages";
import { useState } from "react";
import {
  Clock, Github, Award, CheckCircle,
  Sparkles, Shield, ChevronRight, Plus, Check, X, Globe, ExternalLink, Circle
} from "lucide-react";
import { useCareerProfile } from "../state/careerProfile";
import { corpusFor } from "../lib/careerCorpus";
import type { CareerProfile, TrustLevel } from "../lib/profileTypes";


interface Entry {
  id: string;
  type: "work" | "project" | "cert" | "hackathon" | "competition" | "leadership" | "volunteer" | "publication" | "opensource" | "profile";
  title: string;
  org: string;
  date: string;
  skills: string[];
  evidenceSource: string;
  trustScore: number;
  verified: "verified" | "pending" | "unverified";
  emoji: string;
}

const typeLabel: Record<Entry["type"], string> = {
  work: "Work", project: "Project", cert: "Certification",
  hackathon: "Hackathon", competition: "Competition", leadership: "Leadership",
  volunteer: "Volunteer", publication: "Publication", opensource: "Open Source",
  profile: "Profile",
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
  profile:     { text: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-200"     },
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
  link: "profile",
  reference: "leadership",
  record: "work",
  resume: "work",
  other: "work",
};

const TYPE_EMOJI: Record<Entry["type"], string> = {
  work: "💼", project: "💻", cert: "🎓", hackathon: "⚡", competition: "🏆",
  leadership: "👥", volunteer: "🤝", publication: "📝", opensource: "🔧", profile: "🔗",
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

/**
 * Build the timeline from everything we already hold.
 *
 * This used to show the résumé as a single row — one entry saying "a PDF
 * was uploaded" — while the employers, qualifications and certifications
 * inside it stayed buried. Anyone who had just uploaded a CV saw an
 * almost-empty record and was told to start adding things by hand.
 *
 * Everything readable is unpacked into its own entry. Nothing is
 * invented: an entry appears only where the source actually named one,
 * and everything read out of a document the user wrote themselves is
 * self-declared until an issuer confirms it.
 */
function entriesFrom(profile: CareerProfile): Entry[] {
  const items: Entry[] = [];
  const r = profile.resume;

  /* Connected sources first — these carry the strongest trust and are
     what the user consciously linked. */
  profile.evidence.forEach(e => {
    const type = KIND_TO_TYPE[e.kind] ?? "work";
    items.push({
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
    });
  });

  if (r) {
    const already = new Set(profile.evidence.map(e => e.label.toLowerCase()));

    r.employers.forEach((employer, i) => {
      items.push({
        id: `cv-emp-${i}`,
        type: "work",
        emoji: TYPE_EMOJI.work,
        title: i === 0 && r.currentTitle ? r.currentTitle : profile.currentRole || "Role not stated",
        org: employer,
        date: i === 0 ? "Most recent" : "Earlier",
        skills: r.skills.slice(0, 4),
        evidenceSource: r.fileName,
        trustScore: TRUST_SCORE["self-declared"],
        verified: "unverified",
      });
    });

    r.education.forEach((edu, i) => {
      items.push({
        id: `cv-edu-${i}`,
        type: "cert",
        emoji: "🎓",
        title: edu,
        org: "Qualification",
        date: "From your résumé",
        skills: [],
        evidenceSource: r.fileName,
        trustScore: TRUST_SCORE["self-declared"],
        verified: "unverified",
      });
    });

    r.certifications
      .filter(c => !already.has(c.toLowerCase()))
      .forEach((cert, i) => {
        items.push({
          id: `cv-cert-${i}`,
          type: "cert",
          emoji: TYPE_EMOJI.cert,
          title: cert,
          org: "Certification",
          date: "From your résumé",
          skills: [],
          evidenceSource: r.fileName,
          trustScore: TRUST_SCORE["self-declared"],
          verified: "unverified",
        });
      });
  }

  return items;
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

/* ────────────────────────────────────────────────────────────────
   One page, one list.

   This was three tabs — Career Timeline, Suggested, X-Ray Impact — plus
   a stats strip whose four numbers were typed in (8 entries, 6 verified,
   93% trust) regardless of what was on the record. The timeline is the
   page now; suggestions open beside it when asked for, and the impact
   tab is gone: it restated scores the dashboard already owns.
   ──────────────────────────────────────────────────────────────── */

function Timeline({ entries }: { entries: Entry[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-3">
        {entries.map(e => {
          const c = typeColor[e.type];
          const isOpen = open === e.id;
          return (
            <div key={e.id} className="relative flex gap-5">
              <div className="relative z-10 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-white border-2 border-border shadow-sm text-base">
                {e.emoji}
              </div>
              <div className={`flex-1 bg-white rounded-xl border shadow-sm overflow-hidden ${isOpen ? "border-primary/30" : "border-border"}`}>
                <button className="w-full flex items-start gap-3 px-5 py-4 text-left" onClick={() => setOpen(isOpen ? null : e.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${c.text} ${c.bg} ${c.border}`}>{typeLabel[e.type]}</span>
                      <VerifiedBadge status={e.verified} score={e.trustScore} />
                    </div>
                    <p className="font-semibold text-foreground text-base">{e.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{e.org} · {e.date}</p>
                  </div>
                  <ChevronRight size={15} className={`text-muted-foreground flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-border px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {e.skills.length
                        ? e.skills.map(sk => <span key={sk} className="text-xs bg-muted border border-border text-foreground px-2 py-0.5 rounded-md">{sk}</span>)
                        : <span className="text-sm text-muted-foreground">No skills attached to this one yet.</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <ExternalLink size={10} /> {e.evidenceSource}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CareerEvidence({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { profile } = useCareerProfile();
  const entries = entriesFrom(profile);

  const verified = entries.filter(e => e.verified === "verified").length;

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1000px] mx-auto">

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Career Evidence</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
              {entries.length
                ? <>Pulled from the sources you connected. Add anything else with the button.</>
                : <>Connect a source or upload a file and it lands here automatically.</>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => demoToast("Connect a source or upload a file and it appears on your timeline")}
              className="flex items-center gap-2 bg-primary text-white text-sm px-3.5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {entries.length ? <Timeline entries={entries} /> : <NoEvidenceYet />}

        <div className="mt-6">
          <NextStep currentPage="evidence" onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
