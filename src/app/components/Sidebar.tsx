import {
  BarChart3, AlertTriangle, FlaskConical, Pill,
  Layers, User, Bell, Settings, ChevronRight, TrendingUp,
  Briefcase, Video, Building2, GraduationCap, LayoutDashboard,
  Fingerprint, Scale, UserCheck, MessageSquareWarning, RotateCcw,
  ShieldCheck, Handshake, School, BookOpenCheck, WalletCards, HeartPulse,
  Globe
} from "lucide-react";

type Role = "candidate" | "employer" | "university";

const candidateMain = [
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "dna",     label: "Career DNA", icon: Fingerprint },
  { id: "jobs",    label: "Jobs + Applications", icon: Briefcase },
  { id: "coach",   label: "Interview Coach", icon: Video },
  { id: "offers",  label: "Offer Decision AI", icon: Scale },
  { id: "portfolio", label: "Portfolio Builder", icon: Globe },
];

const journey = [
  { id: "dashboard",    label: "X-Ray Dashboard",      icon: BarChart3,     step: "01" },
  { id: "blindspots",   label: "Blind Spots",          icon: AlertTriangle, step: "02", badge: "5" },
  { id: "decisionlab",  label: "Decision Lab",         icon: FlaskConical,  step: "03" },
  { id: "prescription", label: "Prescription",         icon: Pill,          step: "04" },
];

const support = [
  { id: "evidence", label: "Career Evidence",  icon: Layers },
  { id: "profile",  label: "My Profile",       icon: User   },
];

const employerMain = [
  { id: "employer",       label: "Hiring Command Center", icon: Building2 },
  { id: "emp-matching",   label: "Smart Talent Matching", icon: UserCheck },
  { id: "emp-sla",        label: "Reply SLA Monitor", icon: MessageSquareWarning },
  { id: "emp-reengage",   label: "Talent Re-engagement", icon: RotateCcw },
  { id: "emp-resilience", label: "Workforce Resilience", icon: ShieldCheck },
];

const universityMain = [
  { id: "insights",        label: "University Dashboard", icon: School },
  { id: "uni-outcomes",    label: "Outcome Loop", icon: HeartPulse },
  { id: "uni-curriculum",  label: "Curriculum Engine", icon: BookOpenCheck },
  { id: "uni-internships", label: "Internship Marketplace", icon: Handshake },
  { id: "uni-wallet",      label: "Learning Wallet", icon: WalletCards },
];

interface SidebarProps {
  currentPage: string;
  currentRole: Role;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, currentRole, onNavigate }: SidebarProps) {
  const roleTitle = currentRole === "candidate" ? "Candidates" : currentRole === "employer" ? "Employers" : "Universities";
  const roleSubtitle = currentRole === "candidate"
    ? "Discover, prepare, grow"
    : currentRole === "employer"
      ? "Find, engage, retain"
      : "Track, align, intervene";
  const roleItems = currentRole === "candidate" ? candidateMain : currentRole === "employer" ? employerMain : universityMain;

  return (
    <aside className="flex-shrink-0 bg-white border-r border-border flex flex-col md:h-full max-md:h-auto max-md:border-r-0 max-md:border-b" style={{ width: "min(252px, 100%)" }}>

      {/* Logo */}
      <div className="h-16 px-5 flex items-center border-b border-border">
        <button onClick={() => onNavigate("command")} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground tracking-tight text-sm leading-none">CareerX-Ray</p>
            <p className="text-xs text-muted-foreground mt-0.5">{roleSubtitle}</p>
          </div>
        </button>
      </div>

      {/* Health score */}
      <div className="mx-4 my-4 p-4 rounded-xl bg-blue-50 border border-blue-100 max-md:hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-primary font-semibold">{currentRole === "candidate" ? "Career Health Score" : currentRole === "employer" ? "Trust Response Score" : "Graduate Outcome Score"}</span>
          <span className="text-xs text-emerald-600 font-medium">+6 pts</span>
        </div>
        <div className="flex items-end gap-1.5 mb-2">
          <span className="text-2xl font-bold text-primary">{currentRole === "candidate" ? "84" : currentRole === "employer" ? "91" : "88"}</span>
          <span className="text-xs text-muted-foreground mb-0.5">/100</span>
        </div>
        <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "84%" }} />
        </div>
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp size={10} className="text-emerald-500" />
          <span className="text-xs text-emerald-600 font-medium">{currentRole === "candidate" ? "Improving · 4 risks open" : currentRole === "employer" ? "Transparent · 3 replies due" : "Strong · 128 need support"}</span>
        </div>
      </div>

      {/* Journey nav */}
      <nav className="flex-1 px-3 overflow-y-auto max-md:flex max-md:gap-2 max-md:pb-3">
        <div className="max-md:min-w-[220px]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-1">{roleTitle}</p>
          <div className="space-y-0.5">
            {roleItems.map((item, index) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={`${item.label}-${index}`}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon size={14} className="flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {active && <ChevronRight size={13} className="opacity-50" />}
                </button>
              );
            })}
          </div>
        </div>

        {currentRole === "candidate" && <div className="max-md:min-w-[220px]">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-1 md:mt-4 md:border-t md:border-border md:pt-5">X-Ray Journey</p>
        <div className="space-y-0.5">
          {journey.map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className={`text-xs font-bold tabular-nums flex-shrink-0 ${active ? "text-blue-200" : "text-muted-foreground/50"}`}>
                  {item.step}
                </span>
                <item.icon size={14} className="flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {(item as any).badge && !active && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[18px] text-center leading-tight">
                    {(item as any).badge}
                  </span>
                )}
                {active && <ChevronRight size={13} className="opacity-50" />}
              </button>
            );
          })}
        </div>
        </div>}

        {currentRole === "candidate" && <div className="max-md:min-w-[220px]">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-5 pb-2 mt-2 border-t border-border max-md:mt-0 max-md:pt-2 max-md:border-t-0">Supporting Data</p>
        <div className="space-y-0.5">
          {support.map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon size={14} className="flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {active && <ChevronRight size={13} className="opacity-50" />}
              </button>
            );
          })}
        </div>
        </div>}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3 space-y-0.5 max-md:hidden">
        {[
          { icon: Bell,     label: "Notifications", badge: "2" },
          { icon: Settings, label: "Settings"                  },
        ].map(item => (
          <button key={item.label}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <item.icon size={14} />
            <span className="flex-1 text-left">{item.label}</span>
            {(item as any).badge && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">{(item as any).badge}</span>
            )}
          </button>
        ))}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">JK</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Jordan Kim</p>
            <p className="text-xs text-muted-foreground truncate">Sr. Data Analyst · Stripe</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
