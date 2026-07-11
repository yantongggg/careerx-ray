import { useState } from "react";
import {
  ArrowRight, Building2, ChevronDown, GraduationCap, Lightbulb,
  Radio, TrendingDown, TrendingUp, Users,
} from "lucide-react";
import { useIntelligence } from "./intelligence";

/* ────────────────────────────────────────────────────────────────
   University view of the Career Intelligence Graph.
   Individual hiring outcomes are aggregated into pattern alerts —
   a university acts on trends, not on single rejections. Tone is
   systemic ("employer outcomes indicate a readiness gap"), never
   about individual students.
   ──────────────────────────────────────────────────────────────── */

type Severity = "red" | "amber" | "blue" | "green";

const SEVERITY_STYLES: Record<Severity, { dot: string; text: string; bg: string; border: string; label: string }> = {
  red:   { dot: "#DC2626", text: "#B91C1C", bg: "rgba(220,38,38,0.05)",  border: "rgba(220,38,38,0.18)",  label: "Urgent gap" },
  amber: { dot: "#D97706", text: "#B45309", bg: "rgba(217,119,6,0.06)",  border: "rgba(217,119,6,0.2)",   label: "Needs support" },
  blue:  { dot: "#1B5CA3", text: "#1B5CA3", bg: "rgba(27,92,163,0.05)",  border: "rgba(27,92,163,0.16)",  label: "Emerging trend" },
  green: { dot: "#15803D", text: "#15803D", bg: "rgba(21,128,61,0.05)",  border: "rgba(21,128,61,0.18)",  label: "Improving" },
};

interface Cluster {
  key: string;
  label: string;
  base: number;
  employers: number;
  severity: Severity;
  trend: string;
  improving?: boolean;
  faculties: string;
  roles: string;
  students: string;
  interventions: string[];
}

const CLUSTERS: Cluster[] = [
  {
    key: "cloud", label: "Cloud deployment evidence missing", base: 18, employers: 6,
    severity: "red", trend: "+22% this month",
    faculties: "Computer Science · Software Engineering",
    roles: "Data Analyst · Backend Engineer · Analytics Engineer",
    students: "~34% of active applicants in affected faculties",
    interventions: [
      "Add a 2-week cloud deployment sprint to final-year modules",
      "Update final-year project rubric to require deployed proof",
      "Partner with an employer for an AWS/GCP micro-credential",
    ],
  },
  {
    key: "dbt", label: "Data engineering (dbt / pipelines) readiness gap", base: 14, employers: 5,
    severity: "red", trend: "+15% this month",
    faculties: "Computer Science · Business Analytics",
    roles: "Analytics Engineer · Data Engineer",
    students: "~28% of data-track applicants",
    interventions: [
      "Partner with employers on a data engineering micro-project",
      "Introduce dbt into the Database Management course project",
    ],
  },
  {
    key: "sysdesign", label: "System design explanation readiness gap", base: 9, employers: 4,
    severity: "amber", trend: "+8% this month",
    faculties: "Computer Science",
    roles: "Backend Engineer · Software Engineer",
    students: "~19% of engineering applicants",
    interventions: [
      "Add system design case practice to interview prep workshops",
      "Run peer mock-interview sessions with rubric feedback",
    ],
  },
  {
    key: "internship", label: "Internship evidence below employer expectations", base: 7, employers: 3,
    severity: "amber", trend: "+5% this month",
    faculties: "Business Analytics · Finance",
    roles: "BI Associate · Data Analyst",
    students: "~15% of penultimate-year students",
    interventions: [
      "Match affected cohorts through the Internship Marketplace",
      "Credit project-based placements as internship evidence",
    ],
  },
  {
    key: "comms", label: "Interview communication readiness", base: 5, employers: 3,
    severity: "blue", trend: "+3% this month",
    faculties: "All faculties",
    roles: "Client-facing analyst roles",
    students: "~11% of active applicants",
    interventions: [
      "Assign mock interview practice for affected cohorts",
      "Embed storytelling practice into capstone presentations",
    ],
  },
  {
    key: "sql", label: "SQL fundamentals", base: 4, employers: 2,
    severity: "green", trend: "−18% this month", improving: true,
    faculties: "Computer Science · Business Analytics",
    roles: "Data Analyst",
    students: "Gap closing after last semester's course update",
    interventions: ["Keep the updated SQL case-study module — it's working"],
  },
];

/* Live rejection reasons roll up into the matching cluster */
const SKILL_TO_CLUSTER: Record<string, string> = {
  "Cloud deployment (AWS/GCP)": "cloud",
  "Data engineering (dbt)": "dbt",
  "Stakeholder communication": "comms",
  "SQL optimization": "sql",
};

function useClusters() {
  const { signals } = useIntelligence();
  const live = signals.filter(s => s.live);
  const liveByCluster = new Map<string, number>();
  live.forEach(s => {
    const key = SKILL_TO_CLUSTER[s.skill] ?? "other";
    liveByCluster.set(key, (liveByCluster.get(key) || 0) + 1);
  });
  const clusters = CLUSTERS.map(c => ({
    ...c,
    count: c.base + (liveByCluster.get(c.key) || 0),
    liveCount: liveByCluster.get(c.key) || 0,
  })).sort((a, b) => b.count - a.count);
  const unmapped = liveByCluster.get("other") || 0;
  return { clusters, liveTotal: live.length, unmapped };
}

/* ── Level 1: aggregated pattern banner ── */

export function PatternAlert({ onAction }: { onAction?: () => void }) {
  const { clusters, liveTotal } = useClusters();
  const top = clusters.filter(c => c.severity === "red");
  const outcomes = top.reduce((s, c) => s + c.count, 0);
  const employers = Math.max(...top.map(c => c.employers)) + (liveTotal > 0 ? 1 : 0);
  const isLive = top.some(c => c.liveCount > 0);

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden" style={{ borderLeft: `3px solid ${isLive ? "#115E50" : "#8A7038"}` }}>
      <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? "bg-emerald-600" : "bg-[#8A7038]"}`} />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isLive ? "#115E50" : "#8A7038" }}>
            {isLive ? "Live pattern detected" : "Pattern detected"}
          </span>
          {isLive && <span className="text-[10px] text-muted-foreground">· updated just now</span>}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed">
            Employer outcomes indicate a <span className="font-semibold">data &amp; cloud readiness gap</span> —
            multiple employers rejected or paused candidates for data/backend roles due to missing cloud deployment and data engineering evidence.
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
            <Radio size={11} />
            <span className="font-semibold text-foreground">{outcomes} related hiring outcomes</span> · {employers} employers ·
            est. <span className="font-semibold text-foreground">34% of active CS applicants</span> affected · confidence: High
          </p>
        </div>

        {onAction && (
          <button
            onClick={onAction}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors hover:bg-accent"
            style={{ borderColor: "rgba(138,112,56,0.3)", color: "#8A7038" }}
          >
            Review curriculum impact <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Levels 2 + 3: signal clusters with drill-down ── */

export function HiringOutcomeSignals() {
  const { clusters, unmapped } = useClusters();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const maxCount = Math.max(...clusters.map(c => c.count));

  return (
    <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Hiring Outcome Signals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Last 14 days · anonymized and grouped by the Career Intelligence Graph — click a signal for detail</p>
        </div>
        <div className="flex items-center gap-3">
          {(["red", "amber", "blue", "green"] as Severity[]).map(s => (
            <div key={s} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_STYLES[s].dot }} />
              <span className="text-[10px] text-muted-foreground max-lg:hidden">{SEVERITY_STYLES[s].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border">
        {clusters.map(cluster => {
          const sv = SEVERITY_STYLES[cluster.severity];
          const open = openKey === cluster.key;
          return (
            <div key={cluster.key}>
              <button
                onClick={() => setOpenKey(open ? null : cluster.key)}
                className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sv.dot }} />
                <span className="text-sm font-medium text-foreground flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  {cluster.label}
                  {cluster.liveCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
                      </span>
                      +{cluster.liveCount} live
                    </span>
                  )}
                </span>
                <div className="w-24 h-2 rounded-full overflow-hidden flex-shrink-0 max-sm:hidden" style={{ backgroundColor: "#EFEDE6" }}>
                  <div className="h-full rounded-full" style={{ width: `${(cluster.count / maxCount) * 100}%`, backgroundColor: sv.dot, opacity: 0.75 }} />
                </div>
                <span className="text-xs font-bold w-20 text-right flex-shrink-0" style={{ color: sv.text }}>{cluster.count} outcomes</span>
                <span className={`text-[10px] w-24 text-right flex-shrink-0 inline-flex items-center justify-end gap-1 max-md:hidden ${cluster.improving ? "text-emerald-700" : "text-muted-foreground"}`}>
                  {cluster.improving ? <TrendingDown size={10} /> : <TrendingUp size={10} />} {cluster.trend}
                </span>
                <ChevronDown size={14} className={`text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="px-5 pb-4 pt-1" style={{ backgroundColor: sv.bg }}>
                  <div className="grid md:grid-cols-2 gap-4 pt-3">
                    <div className="space-y-2.5">
                      {[
                        { icon: GraduationCap, label: "Affected faculties", value: cluster.faculties },
                        { icon: Users, label: "Affected roles", value: cluster.roles },
                        { icon: Building2, label: "Reporting employers", value: `${cluster.employers} employers (anonymized)` },
                        { icon: Radio, label: "Student impact", value: cluster.students },
                      ].map(row => (
                        <div key={row.label} className="flex items-start gap-2.5">
                          <row.icon size={13} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <p className="text-xs leading-relaxed">
                            <span className="text-muted-foreground">{row.label}: </span>
                            <span className="font-medium text-foreground">{row.value}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border bg-white p-3.5" style={{ borderColor: sv.border }}>
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: sv.text }}>
                        <Lightbulb size={12} /> Recommended interventions
                      </p>
                      <ul className="space-y-1.5">
                        {cluster.interventions.map(iv => (
                          <li key={iv} className="text-xs text-foreground leading-relaxed flex items-start gap-1.5">
                            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: sv.dot }} />
                            {iv}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 bg-accent/50 border-t border-border">
        <p className="text-[10px] text-muted-foreground">
          Signals are aggregated from anonymized employer hiring outcomes across the Talentbank network.
          Individual candidates are never identified{unmapped > 0 ? ` · ${unmapped} new outcome(s) pending classification` : ""}.
        </p>
      </div>
    </section>
  );
}

/* ── AI Impact Heatmap — how AI is reshaping demand per role family ── */

const HEATMAP_ROWS = [
  { role: "Junior Analyst",   demand: "↓",  demandTone: "red",   ai: "High",    aiTone: "red",   salary: "Low",    salaryTone: "red",   ease: "Medium", easeTone: "amber" },
  { role: "BI Analyst",       demand: "→",  demandTone: "blue",  ai: "Medium",  aiTone: "amber", salary: "Medium", salaryTone: "amber", ease: "High",   easeTone: "green" },
  { role: "Data Engineer",    demand: "↑",  demandTone: "green", ai: "Low-Med", aiTone: "green", salary: "High",   salaryTone: "green", ease: "Medium", easeTone: "amber" },
  { role: "AI Engineer",      demand: "↑↑", demandTone: "green", ai: "Medium",  aiTone: "amber", salary: "High",   salaryTone: "green", ease: "Low",    easeTone: "red"   },
  { role: "Product Analyst",  demand: "↑",  demandTone: "green", ai: "Medium",  aiTone: "amber", salary: "High",   salaryTone: "green", ease: "High",   easeTone: "green" },
  { role: "UX / Product Design", demand: "↑", demandTone: "green", ai: "Medium", aiTone: "amber", salary: "Medium", salaryTone: "amber", ease: "High", easeTone: "green" },
] as const;

const HEAT_TONES: Record<string, string> = {
  red:   "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue:  "bg-blue-50 text-blue-700 border-blue-200",
};

const HeatChip = ({ value, tone }: { value: string; tone: string }) => (
  <span className={`inline-block min-w-[60px] text-center text-[11px] font-bold px-2 py-1 rounded-md border ${HEAT_TONES[tone]}`}>{value}</span>
);

export function AiImpactHeatmap() {
  return (
    <section className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold text-foreground">AI Impact Heatmap — where your graduates' roles are heading</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Demand, AI exposure, salary growth, and transition ease per role family · guides curriculum and advising priorities</p>
        </div>
        <div className="flex items-center gap-3">
          {[["red", "Risk"], ["amber", "Changing"], ["green", "Growth"], ["blue", "Stable"]].map(([tone, label]) => (
            <span key={tone} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : tone === "green" ? "bg-emerald-500" : "bg-blue-500"}`} /> {label}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              {["Role family", "Demand", "AI exposure", "Salary growth", "Transition ease"].map(h => (
                <th key={h} className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {HEATMAP_ROWS.map(row => (
              <tr key={row.role} className="hover:bg-muted/40">
                <td className="px-5 py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{row.role}</td>
                <td className="px-5 py-2.5"><HeatChip value={row.demand} tone={row.demandTone} /></td>
                <td className="px-5 py-2.5"><HeatChip value={row.ai} tone={row.aiTone} /></td>
                <td className="px-5 py-2.5"><HeatChip value={row.salary} tone={row.salaryTone} /></td>
                <td className="px-5 py-2.5"><HeatChip value={row.ease} tone={row.easeTone} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
