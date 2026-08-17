import { ArrowRight, BarChart3, Building2, GraduationCap, School, Sparkles, UserRound } from "lucide-react";

type Role = "candidate" | "employer" | "university";

interface RoleSelectProps {
  onSelect: (role: Role) => void;
  onBack: () => void;
}

const doors = [
  {
    role: "candidate" as Role,
    icon: UserRound,
    label: "I'm a candidate",
    desc: "Find my career risks and my fastest path to getting hired.",
    note: "Starts with a 3-minute X-Ray scan",
    cta: "Start my scan",
    accent: "#8A7038",
  },
  {
    role: "employer" as Role,
    icon: Building2,
    label: "I'm an employer",
    desc: "Review my hiring pipeline with readiness intelligence, not resumes.",
    note: "Instant access · demo workspace",
    cta: "Open hiring workspace",
    accent: "#16284B",
  },
  {
    role: "university" as Role,
    icon: School,
    label: "I'm a university",
    desc: "Track graduate readiness gaps before they cost my students offers.",
    note: "Instant access · demo workspace",
    cta: "View readiness insights",
    accent: "#115E50",
  },
];

export function RoleSelect({ onSelect, onBack }: RoleSelectProps) {
  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Nav */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">CareerX-Ray</span>
          </button>
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-3.5 py-1.5 mb-5 shadow-sm">
              <Sparkles size={12} className="text-primary" />
              <span className="text-xs text-muted-foreground font-medium">One intelligence layer · three doors</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">How will you use CareerX-Ray?</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              The same Career Intelligence Graph serves candidates, employers, and universities — each through their own lens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {doors.map(door => (
              <button
                key={door.role}
                onClick={() => onSelect(door.role)}
                className="bg-white border border-border rounded-2xl p-6 text-left shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                style={{ borderTop: `3px solid ${door.accent}` }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${door.accent}14` }}>
                  <door.icon size={20} style={{ color: door.accent }} />
                </div>
                <p className="font-bold text-foreground">{door.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 mb-4 min-h-[48px]">{door.desc}</p>
                <p className="text-[10px] text-muted-foreground/70 mb-4">{door.note}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: door.accent }}>
                  {door.cta} <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
