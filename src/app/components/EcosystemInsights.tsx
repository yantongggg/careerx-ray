import { useState } from "react";
import {
  BarChart3, BookOpenCheck, Building2, GraduationCap, Handshake,
  HeartPulse, MapPin, ShieldCheck, TrendingUp, Users, WalletCards
} from "lucide-react";
import { demoToast } from "./toast";
import { PatternAlert, HiringOutcomeSignals } from "./universitySignals";

const faculties = [
  { name: "Computer Science", ready: 84, gap: "Cloud architecture" },
  { name: "Business Analytics", ready: 72, gap: "SQL case interviews" },
  { name: "Engineering", ready: 69, gap: "Product storytelling" },
  { name: "Finance", ready: 64, gap: "Python automation" },
];

const regions = [
  { name: "Klang Valley", demand: "High", roles: "12.4k", focus: "Data, AI, product ops" },
  { name: "Penang", demand: "Rising", roles: "3.1k", focus: "Semiconductor analytics" },
  { name: "Johor", demand: "Rising", roles: "2.6k", focus: "Supply chain, logistics" },
  { name: "Singapore", demand: "High", roles: "18.7k", focus: "Regional tech hub" },
];

const universityModules = [
  {
    label: "Lifelong Outcome Loop",
    icon: HeartPulse,
    metric: "88% employed in 6 months",
    desc: "Tracks graduates beyond graduation and feeds outcome data back into student guidance, employer partnerships, and school reputation.",
  },
  {
    label: "Future-State Curriculum Engine",
    icon: BookOpenCheck,
    metric: "4 course updates suggested",
    desc: "Maps employer demand and skill gaps to curriculum changes before students graduate into outdated roles.",
  },
  {
    label: "Adaptive Readiness Profile",
    icon: ShieldCheck,
    metric: "128 students need support",
    desc: "Flags students by readiness, confidence, skill gaps, and interview preparation status so career teams can intervene early.",
  },
  {
    label: "Live Internship Marketplace",
    icon: Handshake,
    metric: "312 verified openings",
    desc: "Connects students to employer-verified internships, career fair leads, and project-based pathways.",
  },
  {
    label: "Lifelong Learning Wallet",
    icon: WalletCards,
    metric: "9,420 skill credits",
    desc: "Stores micro-credentials, verified projects, and reskilling activity as students move from school to work.",
  },
];

const atRiskStudents = [
  { name: "Aisyah", faculty: "Business Analytics", gap: "Interview confidence", action: "Assign mock interview" },
  { name: "Daniel", faculty: "Computer Science", gap: "No internship evidence", action: "Match live internship" },
  { name: "Mei Lin", faculty: "Finance", gap: "Python automation", action: "Recommend 30-day skill sprint" },
];

interface EcosystemInsightsProps {
  onNavigate?: (page: string) => void;
}

export function EcosystemInsights({ onNavigate }: EcosystemInsightsProps) {
  const [activeModule, setActiveModule] = useState(universityModules[0]);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        <div className="bg-slate-950 text-white rounded-2xl p-6 lg:p-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-xs text-slate-200">
              <GraduationCap size={12} /> Institution + Policy View
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">University employability engine for students, outcomes, and reputation.</h1>
          <p className="text-sm text-slate-300 leading-relaxed mt-2 max-w-3xl">
            Talentbank can help universities prove employability, attract students, intervene earlier, and show parents why this institution leads to stronger graduate outcomes.
          </p>
        </div>

        <PatternAlert onAction={onNavigate ? () => onNavigate("uni-curriculum") : undefined} />

        <HiringOutcomeSignals />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Student readiness", value: "76/100", icon: ShieldCheck },
            { label: "Employed in 6 months", value: "88%", icon: TrendingUp },
            { label: "Median time to job", value: "47d", icon: BarChart3 },
            { label: "Career fair interactions", value: "9.8k", icon: Users },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <kpi.icon size={17} className="text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground mt-3">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-semibold text-foreground">University AI modules</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Track, align, intervene. Designed for 16-30 early-stage career readiness.</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">Admissions + outcomes story</span>
          </div>
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
            <div className="space-y-2">
              {universityModules.map(module => (
                <button
                  key={module.label}
                  onClick={() => setActiveModule(module)}
                  className={`w-full text-left border rounded-xl p-4 transition-all ${
                    activeModule.label === module.label ? "bg-blue-50 border-primary" : "bg-white border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <module.icon size={16} className="text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{module.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{module.metric}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-slate-950 text-white rounded-xl p-5">
              <activeModule.icon size={20} className="text-blue-300 mb-4" />
              <p className="text-xl font-bold">{activeModule.label}</p>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">{activeModule.desc}</p>
              <div className="mt-5 bg-white/10 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-400">How this helps Talentbank + university partnership</p>
                <p className="text-sm text-white font-semibold mt-1">Turns graduate outcomes into a measurable student attraction story.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Readiness by faculty</h2>
            <div className="space-y-4">
              {faculties.map(f => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                    <span className="text-xs text-muted-foreground">Top gap: {f.gap}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${f.ready}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Companies students engage with</h2>
            <div className="space-y-3">
              {["Maybank", "Grab", "Petronas Digital", "Shopee", "Deloitte"].map((company, i) => (
                <div key={company} className="flex items-center gap-3 p-3 border border-border rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 size={15} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{company}</p>
                    <p className="text-xs text-muted-foreground">{420 - i * 54} profile views · {86 - i * 7} applications</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-amber-600" />
            <div>
              <h2 className="font-semibold text-foreground">Intervention queue</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Career teams can act before students become unemployed graduates.</p>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-3">
            {atRiskStudents.map(student => (
              <button key={student.name} onClick={() => demoToast(`${student.action} — assigned to ${student.name}\u2019s career advisor \u2713`)} className="bg-white border border-amber-100 rounded-xl p-4 text-left hover:border-amber-300 transition-colors">
                <p className="text-sm font-semibold text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{student.faculty}</p>
                <p className="text-xs text-amber-700 font-semibold mt-3">Gap: {student.gap}</p>
                <p className="text-xs text-foreground mt-1">{student.action}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={17} className="text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Malaysia → ASEAN talent opportunity map</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {regions.map(region => (
              <div key={region.name} className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">{region.name}</p>
                  <span className="text-xs bg-blue-50 text-primary border border-blue-100 px-2 py-0.5 rounded-full">{region.demand}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{region.roles}</p>
                <p className="text-xs text-muted-foreground mt-1">{region.focus}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
