import { demoToast } from "../state/toast";
import { archetypeFor } from "../lib/careerDna.js";
import { useCareerProfile } from "../state/careerProfile";
import { MapPin, Briefcase, GraduationCap, Award, Code, Star, ExternalLink, Edit3, Plus, ArrowRight, Network, FileSearch, CalendarRange } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { dimensions } from "../lib/careerDna.js";
import { corpusFor } from "../lib/careerCorpus";
import type { CareerProfile } from "../lib/profileTypes";

/* ────────────────────────────────────────────────────────────────
   My Profile — what the scan actually knows about this person.

   Every section on this page used to be a module-level constant: three
   jobs at Stripe, Airbnb and Deloitte, a Michigan degree, nine skill
   bars and three awards. It called useCareerProfile() and then rendered
   none of it, so the page confidently described someone else.

   Sections with nothing behind them now say so and point at the way to
   fill them, rather than borrowing a stranger's history.
   ──────────────────────────────────────────────────────────────── */

const LOGO_COLORS = [
  "bg-indigo-600", "bg-rose-500", "bg-emerald-600",
  "bg-amber-600", "bg-sky-600", "bg-violet-600",
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** The six DNA dimensions, from the scan rather than a fixed radar. */
function dnaFrom(profile: CareerProfile) {
  return dimensions.map(d => ({ subject: d, A: Math.round(profile.dnaScores[d] ?? 55) }));
}

/**
 * Skill bars from the resume.
 *
 * We have no proficiency measurement, so the level cannot be presented
 * as one. It reflects corroboration instead: a skill the target role's
 * postings also ask for, or one an evidence item backs, sits higher
 * than a skill that only appears once on a CV.
 */
function skillsFrom(profile: CareerProfile, wanted: string[]): { name: string; level: number; why: string }[] {
  const resumeSkills = profile.resume?.skills ?? [];
  const evidenced = new Set(
    profile.evidence.flatMap(e => e.skills.map(sk => sk.toLowerCase())),
  );
  const demanded = new Set(wanted.map(w => w.toLowerCase()));

  return resumeSkills.slice(0, 10).map(name => {
    const key = name.toLowerCase();
    const backed = evidenced.has(key);
    const inDemand = [...demanded].some(d => d.includes(key) || key.includes(d));
    if (backed && inDemand) return { name, level: 92, why: "Evidenced, and your target roles ask for it" };
    if (backed) return { name, level: 78, why: "Backed by evidence you added" };
    if (inDemand) return { name, level: 64, why: "Your target roles ask for it, but nothing backs it yet" };
    return { name, level: 45, why: "On your resume only" };
  });
}

function EmptySection({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>;
}

export function UserProfile({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { profile, scorecard, displayName } = useCareerProfile();
  const primary = archetypeFor(profile);
  const corpus = corpusFor(profile);

  const name = displayName;
  const role = profile.resume?.currentTitle || profile.currentRole;
  const years = profile.resume?.yearsExperience;
  const employers = profile.resume?.employers ?? [];
  const education = profile.resume?.education ?? [];
  const certifications = [
    ...(profile.resume?.certifications ?? []),
    ...profile.evidence.filter(e => e.kind === "certificate").map(e => e.label),
  ];
  const projects = profile.evidence.filter(e => e.kind === "project" || e.kind === "portfolio");
  const dnaData = dnaFrom(profile);
  const skills = skillsFrom(profile, corpus.targetSkills);
  const tags = [
    profile.currentRole, profile.targetRole,
    ...(profile.resume?.skills ?? []).slice(0, 4),
  ].filter(Boolean) as string[];
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
        {/* Profile header */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {initialsOf(name)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">{name}</h1>
                  <p className="text-base text-muted-foreground mt-0.5">
                    {[role, employers[0]].filter(Boolean).join(" · ") || "Complete your scan to fill this in"}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin size={12} /> Malaysia
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase size={12} /> {years ? `${years} years experience` : profile.experience || "Experience not stated"}
                    </div>
                  </div>
                </div>
                <button onClick={() => demoToast("Profile editing coming soon — connected evidence sources keep it updated automatically")} className="flex items-center gap-2 border border-border text-foreground text-sm px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium">
                  <Edit3 size={14} /> Edit Profile
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map(t => (
                  <span key={t} className="text-xs bg-blue-50 text-primary border border-blue-100 px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Briefcase size={16} className="text-muted-foreground" /> Experience
                </h2>
                <button onClick={() => demoToast("Add experience manually — or connect LinkedIn to auto-import")} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>
              {employers.length ? (
                <div className="space-y-6">
                  {employers.map((company, i) => (
                    <div key={company} className={i < employers.length - 1 ? "pb-6 border-b border-border" : ""}>
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-lg ${LOGO_COLORS[i % LOGO_COLORS.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {initialsOf(company)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{i === 0 ? role || "Role not stated" : "Previous role"}</p>
                          <p className="text-sm text-muted-foreground">{company}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Read from your resume. Dates and detail were not extracted — add them to strengthen this.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection text={
                  profile.resume
                    ? "No employers were found in your resume. Add them there and re-run the scan."
                    : "Upload a resume during your scan and your work history appears here."
                } />
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-5">
                <GraduationCap size={16} className="text-muted-foreground" /> Education
              </h2>
              {education.length ? (
                <div className="space-y-4">
                  {education.map((e, i) => (
                    <div key={e} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-lg ${LOGO_COLORS[i % LOGO_COLORS.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        <GraduationCap size={16} />
                      </div>
                      <p className="font-semibold text-foreground self-center">{e}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection text="No qualifications on file yet. SPM, STPM, diploma and TVET all count — add them to your resume." />
              )}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-5">
                <Code size={16} className="text-muted-foreground" /> Projects
              </h2>
              {projects.length ? (
                <div className="space-y-4">
                  {projects.map(p => (
                    <div key={p.id} className="p-4 rounded-xl border border-border hover:bg-muted transition-colors group">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-foreground">{p.label}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {p.source}
                          <ExternalLink size={11} className="ml-1 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.skills.map(t => <span key={t} className="text-xs bg-blue-50 text-primary border border-blue-100 px-2 py-0.5 rounded-md">{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection text="Nothing here yet. Add a project or portfolio under Career Evidence and it shows up on your profile." />
              )}
            </div>
            {/* Skills — moved out of the narrow column. It was the
                tallest block on the page sitting in the third that had
                least room, while the two-thirds column ran out of
                content and left the page half empty below the fold. */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground mb-4">Skills</h2>
              {skills.length === 0 ? (
                <EmptySection text="Skills appear here once a resume is read or evidence is added." />
              ) : (
                <div className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                  {skills.map((sk) => (
                    <div key={sk.name} title={sk.why}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">{sk.name}</span>
                        <span className="text-sm text-muted-foreground tabular-nums">{sk.level}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${sk.level}%`, opacity: sk.level < 50 ? 0.5 : 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Career DNA */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-foreground">Career DNA</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Primary type: {primary.name}</p>
                </div>
                <span className="text-xs bg-blue-50 text-primary border border-blue-100 px-2 py-1 rounded-full font-semibold">{scorecard.careerHealth}%</span>
              </div>
              <div style={{ width: "100%", height: 208 }}>
                <ResponsiveContainer width="100%" height={208}>
                  <RadarChart data={dnaData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                    <Radar dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground">{primary.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{primary.oneLiner}</p>
                <button onClick={() => onNavigate?.("dna")} className="mt-3 text-xs text-primary font-semibold inline-flex items-center gap-1">
                  Open full DNA map <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Award size={16} className="text-muted-foreground" /> Certifications
              </h2>
              <div className="space-y-3">
                {certifications.length ? certifications.map(c => (
                  <div key={c} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Award size={13} className="text-primary" />
                    </div>
                    <p className="text-xs font-medium text-foreground leading-snug self-center">{c}</p>
                  </div>
                )) : (
                  <EmptySection text={`None yet. ${corpus.certification} is the one that opens the most doors for where you are heading.`} />
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Star size={16} className="text-muted-foreground" /> Worth adding next
              </h2>
              <div className="space-y-3">
                {corpus.evidenceSamples.slice(0, 3).map(a => (
                  <div key={a.title} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <Star size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kept off the journey on purpose. These answer "how would you
            know if it were wrong", which is a reviewer's question rather
            than a jobseeker's — so they live behind a click here instead
            of taking a slot in the five stages. */}
        <div className="mt-6 rounded-xl border border-border bg-white p-6">
          <p className="text-base font-semibold text-foreground">Under the hood</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            How every number on your scan is produced, and how we would know if it were wrong.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate?.("architecture")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <Network size={15} /> Technical architecture
            </button>
            <button
              onClick={() => onNavigate?.("blueprint")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <FileSearch size={15} /> Validation blueprint
            </button>
            <button
              onClick={() => onNavigate?.("nextplan")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <CalendarRange size={15} /> Next plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
