import {
  BarChart3, AlertTriangle, FlaskConical, Pill,
  Layers, User, Bell, Settings, ChevronRight, TrendingUp,
  Briefcase, Video, Building2, GraduationCap, LayoutDashboard,
  Fingerprint, Scale, UserCheck, MessageSquareWarning, RotateCcw,
  ShieldCheck, Handshake, School, BookOpenCheck, WalletCards, HeartPulse,
  Globe, Users
} from "lucide-react";

type Role = "candidate" | "employer" | "university";

import { JOURNEY } from "./stages";
import { demoToast } from "./toast";

const employerMain = [
  { id: "employer",       label: "Hiring Command Center", icon: Building2 },
  { id: "emp-pipeline",   label: "Hiring Pipeline", icon: Users },
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
  const roleItems = currentRole === "employer" ? employerMain : universityMain;

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
      <div className="mx-4 my-4 p-4 rounded-xl bg-accent border border-border max-md:hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-primary font-semibold">{currentRole === "candidate" ? "Career Health Score" : currentRole === "employer" ? "Trust Response Score" : "Graduate Outcome Score"}</span>
          <span className="text-xs text-[#115E50] font-medium">+6 pts</span>
        </div>
        <div className="flex items-end gap-1.5 mb-2">
          <span className="text-2xl font-bold text-primary">{currentRole === "candidate" ? "84" : currentRole === "employer" ? "91" : "88"}</span>
          <span className="text-xs text-muted-foreground mb-0.5">/100</span>
        </div>
        <div className="h-1.5 bg-[#EFEDE6] rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "84%" }} />
        </div>
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp size={10} className="text-[#115E50]" />
          <span className="text-xs text-[#115E50] font-medium">{currentRole === "candidate" ? "Improving · 4 risks open" : currentRole === "employer" ? "Transparent · 3 replies due" : "Strong · 128 need support"}</span>
        </div>
      </div>

      {/* Journey nav */}
      <nav className="flex-1 px-3 overflow-y-auto max-md:flex max-md:gap-2 max-md:pb-3">
        {currentRole === "candidate" ? (
          <div className="max-md:min-w-[220px] max-md:flex max-md:gap-1 md:space-y-0.5 md:pt-2">
            {(() => {
              const commandActive = currentPage === "command";
              return (
                <button
                  onClick={() => onNavigate("command")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    commandActive ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <LayoutDashboard size={14} className="flex-shrink-0" />
                  <span className="flex-1 text-left">Command Center</span>
                  {commandActive && <ChevronRight size={13} className="opacity-50" />}
                </button>
              );
            })()}
            <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider px-3 pt-4 pb-1 max-md:hidden">Your journey</p>
            {JOURNEY.map(stage => {
              const active = currentPage === stage.id || stage.tools.some(t => t.page === currentPage);
              return (
                <button
                  key={stage.id}
                  onClick={() => onNavigate(stage.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active ? "shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  style={active ? { backgroundColor: stage.tint, color: stage.color } : {}}
                >
                  <span className="text-[10px] font-bold tabular-nums flex-shrink-0 w-4" style={{ color: active ? stage.color : "rgba(22,40,75,0.3)" }}>
                    {stage.num}
                  </span>
                  <stage.icon size={14} className="flex-shrink-0" style={active ? { color: stage.color } : {}} />
                  <span className="flex-1 text-left">{stage.label}</span>
                  {stage.status === "done" && !active && <span className="text-[10px] font-bold text-emerald-600">✓</span>}
                  {active && <ChevronRight size={13} className="opacity-50" />}
                </button>
              );
            })}
          </div>
        ) : (
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
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3 space-y-0.5 max-md:hidden">
        {[
          { icon: Bell,     label: "Notifications", badge: "2" },
          { icon: Settings, label: "Settings"                  },
        ].map(item => (
          <button key={item.label}
            onClick={() => demoToast(item.label === "Notifications" ? "2 notifications: Maybank interview in 2 days \u00b7 1 new live market signal" : "Settings panel coming to the full version")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <item.icon size={14} />
            <span className="flex-1 text-left">{item.label}</span>
            {(item as any).badge && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">{(item as any).badge}</span>
            )}
          </button>
        ))}
        <button onClick={() => onNavigate("profile")} className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg hover:bg-muted transition-colors text-left">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D9C18A] to-[#8A7038] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">JK</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Jordan Kim</p>
            <p className="text-xs text-muted-foreground truncate">Sr. Data Analyst · Stripe</p>
          </div>
          <ChevronRight size={13} className="text-muted-foreground/50" />
        </button>
      </div>
    </aside>
  );
}
