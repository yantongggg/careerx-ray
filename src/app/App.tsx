import { useState } from "react";
import { Onboarding } from "./components/Onboarding";
import { LandingPage } from "./components/LandingPage";
import { CareerCommandCenter } from "./components/CareerCommandCenter";
import { CareerDna } from "./components/CareerDna";
import { JobMatchTracker } from "./components/JobMatchTracker";
import { InterviewCoach } from "./components/InterviewCoach";
import { OfferDecisionDashboard } from "./components/OfferDecisionDashboard";
import { EmployerDashboard } from "./components/EmployerDashboard";
import { SmartTalentMatching } from "./components/SmartTalentMatching";
import { ReplySlaMonitor } from "./components/ReplySlaMonitor";
import { TalentReengagement } from "./components/TalentReengagement";
import { WorkforceResilience } from "./components/WorkforceResilience";
import { EcosystemInsights } from "./components/EcosystemInsights";
import { OutcomeLoop } from "./components/OutcomeLoop";
import { CurriculumEngine } from "./components/CurriculumEngine";
import { InternshipMarketplace } from "./components/InternshipMarketplace";
import { LearningWallet } from "./components/LearningWallet";
import { PortfolioBuilder } from "./components/PortfolioBuilder";
import { Dashboard } from "./components/Dashboard";
import { DecisionLab } from "./components/DecisionLab";
import { BlindSpots } from "./components/BlindSpots";
import { CareerPrescription } from "./components/CareerPrescription";
import { CareerEvidence } from "./components/CareerEvidence";
import { UserProfile } from "./components/UserProfile";
import { Sidebar } from "./components/Sidebar";
import { ApplicationPrep } from "./components/ApplicationPrep";
import { HiringPipeline } from "./components/HiringPipeline";
import { IntelligenceProvider } from "./components/intelligence";
import { RoleSelect } from "./components/RoleSelect";
import { JOURNEY, StageHub } from "./components/stages";
import { SkillGraph } from "./components/SkillGraph";
import { ToastHost } from "./components/toast";

/* MARKER-MAKE-KIT-INVOKED */

type AppState = "landing" | "role-select" | "onboarding" | "app";
type Role = "candidate" | "employer" | "university";
type Page =
  | "command"
  | "stage-diagnose"
  | "stage-decide"
  | "stage-prepare"
  | "stage-apply"
  | "stage-prove"
  | "dna"
  | "jobs"
  | "apply-prep"
  | "coach"
  | "offers"
  | "portfolio"
  | "dashboard"
  | "decisionlab"
  | "blindspots"
  | "prescription"
  | "evidence"
  | "profile"
  | "employer"
  | "emp-matching"
  | "emp-sla"
  | "emp-reengage"
  | "emp-resilience"
  | "emp-pipeline"
  | "insights"
  | "uni-outcomes"
  | "uni-curriculum"
  | "uni-internships"
  | "uni-wallet";

const pageLabels: Record<Page, string> = {
  command:           "Command Center",
  "stage-diagnose": "Diagnose",
  "stage-decide":   "Decide",
  "stage-prepare":  "Prepare",
  "stage-apply":    "Apply",
  "stage-prove":    "Prove",
  dna:              "Career DNA",
  jobs:             "Job Match Tracker",
  "apply-prep":     "Application Preparation",
  coach:            "Interview Coach",
  offers:           "Offer Decision AI",
  portfolio:        "Portfolio Builder",
  dashboard:        "Career Dashboard",
  decisionlab:      "Decision Lab",
  blindspots:       "Blind Spot Detection",
  prescription:     "Career Prescription",
  evidence:         "Career Evidence",
  profile:          "My Profile",
  employer:         "Employer Dashboard",
  "emp-matching":   "Smart Talent Matching",
  "emp-sla":        "Reply SLA Monitor",
  "emp-reengage":   "Talent Re-engagement",
  "emp-resilience": "Workforce Resilience",
  "emp-pipeline":   "Hiring Pipeline",
  insights:         "University Dashboard",
  "uni-outcomes":   "Outcome Loop",
  "uni-curriculum": "Curriculum Engine",
  "uni-internships":"Internship Marketplace",
  "uni-wallet":     "Learning Wallet",
};

const allPages: Page[] = [
  "command", "stage-diagnose", "stage-decide", "stage-prepare", "stage-apply", "stage-prove",
  "dna", "jobs", "apply-prep", "coach", "offers", "portfolio", "dashboard", "decisionlab", "blindspots",
  "prescription", "evidence", "profile", "employer", "emp-matching", "emp-sla", "emp-reengage",
  "emp-resilience", "emp-pipeline", "insights", "uni-outcomes", "uni-curriculum", "uni-internships", "uni-wallet",
];

const pageRole: Record<Page, Role> = {
  command: "candidate",
  "stage-diagnose": "candidate",
  "stage-decide": "candidate",
  "stage-prepare": "candidate",
  "stage-apply": "candidate",
  "stage-prove": "candidate",
  dna: "candidate",
  jobs: "candidate",
  "apply-prep": "candidate",
  coach: "candidate",
  offers: "candidate",
  portfolio: "candidate",
  dashboard: "candidate",
  decisionlab: "candidate",
  blindspots: "candidate",
  prescription: "candidate",
  evidence: "candidate",
  profile: "candidate",
  employer: "employer",
  "emp-matching": "employer",
  "emp-sla": "employer",
  "emp-reengage": "employer",
  "emp-resilience": "employer",
  "emp-pipeline": "employer",
  insights: "university",
  "uni-outcomes": "university",
  "uni-curriculum": "university",
  "uni-internships": "university",
  "uni-wallet": "university",
};

const roleHome: Record<Role, Page> = {
  candidate: "command",
  employer: "employer",
  university: "insights",
};

const roleLabels: Record<Role, string> = {
  candidate: "Candidate",
  employer: "Employer",
  university: "University",
};

export default function App() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [page, setPage]         = useState<Page>("command");
  const [role, setRole]         = useState<Role>("candidate");
  const [hasScanned, setHasScanned] = useState(false);
  const [dnaScores, setDnaScores] = useState<Record<string, number> | null>(null);
  const [prepJobId, setPrepJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set(["maybank-da", "grab-ae"]));

  const navigate = (target: string) => {
    if (target === "landing")     { setAppState("landing");     return; }
    if (target === "role-select") { setAppState("role-select"); return; }
    if (target === "onboarding")  { setAppState("onboarding");  return; }
    if ((allPages as string[]).includes(target)) {
      const nextPage = target as Page;
      // Candidate pages are built from scan results — no scan, no dashboard.
      if (pageRole[nextPage] === "candidate" && !hasScanned) {
        setAppState("onboarding");
        return;
      }
      setPage(nextPage);
      setRole(pageRole[nextPage]);
      setAppState("app");
    }
  };

  const handlePrepareApp = (jobId: string) => {
    setPrepJobId(jobId);
    setPage("apply-prep");
  };

  const handleApply = (jobId: string) => {
    setAppliedJobs(prev => new Set([...prev, jobId]));
  };

  const switchRole = (nextRole: Role) => {
    if (nextRole === "candidate" && !hasScanned) {
      setAppState("onboarding");
      return;
    }
    setRole(nextRole);
    setPage(roleHome[nextRole]);
    setAppState("app");
  };

  if (appState === "landing") {
    return (
      <IntelligenceProvider key="ix">
        <LandingPage onNavigate={navigate} />
      </IntelligenceProvider>
    );
  }
  if (appState === "role-select") {
    return (
      <IntelligenceProvider key="ix">
        <RoleSelect
          onBack={() => setAppState("landing")}
          onSelect={selected => {
            if (selected === "candidate") {
              if (hasScanned) { setRole("candidate"); setPage("command"); setAppState("app"); }
              else setAppState("onboarding");
            } else {
              switchRole(selected);
            }
          }}
        />
      </IntelligenceProvider>
    );
  }
  if (appState === "onboarding") {
    return (
      <IntelligenceProvider key="ix">
        <Onboarding onComplete={scores => { setDnaScores(scores); setHasScanned(true); setRole("candidate"); setPage("command"); setAppState("app"); }} />
      </IntelligenceProvider>
    );
  }

  return (
    <IntelligenceProvider key="ix">
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-muted">
      <Sidebar currentPage={page} currentRole={role} onNavigate={navigate} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("landing")} className="hover:text-foreground transition-colors">Home</button>
            <span>/</span>
            <span className="text-foreground font-medium">{pageLabels[page]}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={role}
              onChange={e => switchRole(e.target.value as Role)}
              className="lg:hidden text-xs font-semibold border border-border bg-white rounded-lg px-2 py-1.5 text-foreground"
            >
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
              <option value="university">University</option>
            </select>
            <div className="hidden lg:flex items-center bg-muted border border-border rounded-lg p-1">
              {(["candidate", "employer", "university"] as Role[]).map(option => (
                <button
                  key={option}
                  onClick={() => switchRole(option)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                    role === option ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {roleLabels[option]}
                </button>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-[rgba(184,154,94,0.14)] border border-[rgba(22,40,75,0.14)] px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-[#8A7038]" />
              <span className="text-xs font-medium text-[#6F5A2B]">{role === "candidate" ? "4 open risks" : role === "employer" ? "3 delayed replies" : "128 students need support"}</span>
            </div>
            {role === "candidate" && (
              <button
                onClick={() => navigate("onboarding")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors border border-border px-3 py-1.5 rounded-lg hover:bg-muted"
              >
                Re-scan
              </button>
            )}
            <button
              onClick={() => navigate("profile")}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D9C18A] to-[#8A7038] flex items-center justify-center text-white text-xs font-bold"
            >
              JK
            </button>
          </div>
        </header>

        {/* Page */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {page === "dashboard"       && <Dashboard onNavigate={navigate} />}
          {page === "command"         && <CareerCommandCenter onNavigate={navigate} />}
          {page === "stage-diagnose"  && <StageHub stage={JOURNEY[0]} onNavigate={navigate} />}
          {page === "stage-decide"    && <StageHub stage={JOURNEY[1]} onNavigate={navigate} />}
          {page === "stage-prepare"   && <StageHub stage={JOURNEY[2]} onNavigate={navigate}><SkillGraph /></StageHub>}
          {page === "stage-apply"     && <StageHub stage={JOURNEY[3]} onNavigate={navigate} />}
          {page === "stage-prove"     && <StageHub stage={JOURNEY[4]} onNavigate={navigate} />}
          {page === "dna"             && <CareerDna scores={dnaScores ?? undefined} onNavigate={navigate} />}
          {page === "jobs"            && <JobMatchTracker onPrepareApp={handlePrepareApp} onCoach={(jobId) => { setPrepJobId(jobId); navigate("coach"); }} appliedJobs={appliedJobs} />}
          {page === "apply-prep"      && prepJobId && <ApplicationPrep jobId={prepJobId} onBack={() => navigate("jobs")} onApply={handleApply} onCoach={() => navigate("coach")} />}
          {page === "coach"           && <InterviewCoach jobId={prepJobId} />}
          {page === "offers"          && <OfferDecisionDashboard />}
          {page === "portfolio"       && <PortfolioBuilder />}
          {page === "decisionlab"     && <DecisionLab onNavigate={navigate} />}
          {page === "blindspots"      && <BlindSpots onNavigate={navigate} />}
          {page === "prescription"    && <CareerPrescription />}
          {page === "evidence"        && <CareerEvidence />}
          {page === "profile"         && <UserProfile onNavigate={navigate} scores={dnaScores ?? undefined} />}
          {page === "employer"        && <EmployerDashboard />}
          {page === "emp-matching"    && <SmartTalentMatching />}
          {page === "emp-sla"         && <ReplySlaMonitor />}
          {page === "emp-reengage"    && <TalentReengagement />}
          {page === "emp-resilience"  && <WorkforceResilience />}
          {page === "emp-pipeline"    && <HiringPipeline />}
          {page === "insights"        && <EcosystemInsights onNavigate={navigate} />}
          {page === "uni-outcomes"    && <OutcomeLoop />}
          {page === "uni-curriculum"  && <CurriculumEngine />}
          {page === "uni-internships" && <InternshipMarketplace />}
          {page === "uni-wallet"      && <LearningWallet />}
        </div>
      </main>
      <ToastHost />
    </div>
    </IntelligenceProvider>
  );
}
