import { demoToast } from "../state/toast";
import { NextStep } from "../state/stages";
import { useState } from "react";
import {
  Clock, Github, Award, CheckCircle,
  Sparkles, Shield, ChevronRight, Plus, Check, X, Globe, ExternalLink, Circle
} from "lucide-react";
import { useCareerProfile } from "../state/careerProfile";
import { corpusFor } from "../lib/careerCorpus";
import {
  fetchGithubSignal, repoEvidence, signalCaveat, yearsActive,
  type GithubSignal,
} from "../lib/githubSignal";
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
    /* A connected source and the résumé describe the same job. Match on
       the words rather than the exact string — "Data Analyst · Maybank ·
       2023–Present" and "Maybank" are the same entry written twice. */
    const seen = profile.evidence.map(e => e.label.toLowerCase());
    const STOP = new Set(["data", "with", "from", "science", "analyst", "university"]);
    const alreadyListed = (text: string) => {
      const key = text.toLowerCase();
      const words = key.split(/[^a-z]+/).filter(w => w.length > 3 && !STOP.has(w));
      return seen.some(existing => {
        if (existing.includes(key)) return true;
        /* One shared word is not a duplicate — "AWS Certified Data
           Engineer" and "Data Analyst · Maybank" share "data". Two
           distinctive words in common is. */
        const hits = words.filter(w => existing.includes(w)).length;
        return hits >= 2 || (words.length === 1 && hits === 1);
      });
    };

    r.employers.filter(e => !alreadyListed(e)).forEach((employer, i) => {
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

    r.education.filter(e => !alreadyListed(e)).forEach((edu, i) => {
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
      .filter(c => !alreadyListed(c))
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

/* ────────────────────────────────────────────────────────────────
   The one connector that verifies itself.

   Everything else on this page is the user's word for it. A public
   repository is not: the commits, the languages and the dates are on
   record, and whoever reads the profile can open the same URL.

   It reports visible public activity and says so. Someone whose work
   lives in private repositories at an employer looks quiet here and is
   not, and a number without that caveat becomes a verdict nobody can
   defend.
   ──────────────────────────────────────────────────────────────── */
function GithubConnector({ onImported }: { onImported: (signal: GithubSignal) => void }) {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [signal, setSignal] = useState<GithubSignal | null>(null);

  const connect = async () => {
    if (!input.trim() || state === "loading") return;
    setState("loading");
    setError(null);

    const result = await fetchGithubSignal(input);
    if (result.status === "ok") {
      setSignal(result.signal);
      setState("done");
      onImported(result.signal);
    } else {
      setError(result.reason);
      setState("idle");
    }
  };

  if (state === "done" && signal) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Github size={16} className="text-foreground" />
              <a
                href={signal.url}
                target="_blank"
                rel="noreferrer"
                className="text-base font-semibold text-foreground hover:underline"
              >
                {signal.handle}
              </a>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Corroborated
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {signal.publicRepos} public {signal.publicRepos === 1 ? "repo" : "repos"} ·{" "}
              {signal.followers} {signal.followers === 1 ? "follower" : "followers"} ·{" "}
              {yearsActive(signal)} {yearsActive(signal) === 1 ? "year" : "years"} on GitHub
            </p>
          </div>
          {signal.languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {signal.languages.slice(0, 4).map(l => (
                <span key={l.name} className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground">
                  {l.name} <span className="text-muted-foreground tabular-nums">{l.count}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{signalCaveat(signal)}</p>

        {signal.topRepos.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {signal.topRepos.map(r => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border px-3.5 py-2.5 transition hover:border-primary/40 hover:bg-accent"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">{r.name}</span>
                  {r.language && <span className="flex-shrink-0 text-xs text-muted-foreground">{r.language}</span>}
                </div>
                {r.description && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.description}</p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-white p-5">
      <div className="flex items-center gap-2">
        <Github size={16} className="text-foreground" />
        <p className="text-base font-semibold text-foreground">Connect GitHub</p>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Public repositories only, read from GitHub&apos;s own API. Anyone reading your
        profile can open the same links, which is what makes this stronger than a claim.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") void connect(); }}
          placeholder="github.com/yourname"
          className="flex-1 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
        <button
          onClick={() => void connect()}
          disabled={state === "loading" || !input.trim()}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "loading" ? "Reading…" : "Connect"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function CareerEvidence({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { profile, addEvidence } = useCareerProfile();
  const entries = entriesFrom(profile);

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

        <GithubConnector
          onImported={signal => {
            repoEvidence(signal).forEach(addEvidence);
            demoToast(`Imported ${signal.topRepos.length} public repositories from GitHub ✓`);
          }}
        />

        {entries.length ? <Timeline entries={entries} /> : <NoEvidenceYet />}

        <div className="mt-6">
          <NextStep currentPage="evidence" onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
