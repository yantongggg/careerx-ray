import { useState } from "react";
import { Onboarding } from "./components/Onboarding";
import { LandingPage } from "./components/LandingPage";
import { CareerCommandCenter } from "./components/CareerCommandCenter";
import { CareerDna } from "./components/CareerDna";
import { JobMatchTracker } from "./components/JobMatchTracker";
import { InterviewCoach } from "./components/InterviewCoach";
import { OfferDecisionDashboard } from "./components/OfferDecisionDashboard";
import { EmployerDashboard } from "./components/EmployerDashboard";
import { EcosystemInsights } from "./components/EcosystemInsights";
import { Dashboard } from "./components/Dashboard";
import { DecisionLab } from "./components/DecisionLab";
import { BlindSpots } from "./components/BlindSpots";
import { CareerPrescription } from "./components/CareerPrescription";
import { CareerEvidence } from "./components/CareerEvidence";
import { UserProfile } from "./components/UserProfile";
import { Sidebar } from "./components/Sidebar";

/* MARKER-MAKE-KIT-INVOKED */

type AppState = "landing" | "onboarding" | "app";
type Role = "candidate" | "employer" | "university";
type Page =
  | "command"
  | "dna"
  | "jobs"
  | "coach"
  | "offers"
  | "dashboard"
  | "decisionlab"
  | "blindspots"
  | "prescription"
  | "evidence"
  | "profile"
  | "employer"
  | "insights";

const pageLabels: Record<Page, string> = {
  command:      "Command Center",
  dna:          "Career DNA",
  jobs:         "Job Match Tracker",
  coach:        "Interview Coach",
  offers:       "Offer Decision AI",
  dashboard:    "Career Dashboard",
  decisionlab:  "Decision Lab",
  blindspots:   "Blind Spot Detection",
  prescription: "Career Prescription",
  evidence:     "Career Evidence",
  profile:      "My Profile",
  employer:     "Employer Dashboard",
  insights:     "Institution Insights",
};

const allPages: Page[] = [
  "command", "dna", "jobs", "coach", "offers", "dashboard", "decisionlab", "blindspots",
  "prescription", "evidence", "profile", "employer", "insights",
];

const pageRole: Record<Page, Role> = {
  command: "candidate",
  dna: "candidate",
  jobs: "candidate",
  coach: "candidate",
  offers: "candidate",
  dashboard: "candidate",
  decisionlab: "candidate",
  blindspots: "candidate",
  prescription: "candidate",
  evidence: "candidate",
  profile: "candidate",
  employer: "employer",
  insights: "university",
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

  const navigate = (target: string) => {
    if (target === "landing")    { setAppState("landing");    return; }
    if (target === "onboarding") { setAppState("onboarding"); return; }
    if ((allPages as string[]).includes(target)) {
      const nextPage = target as Page;
      setPage(nextPage);
      setRole(pageRole[nextPage]);
      setAppState("app");
    }
  };

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
    setPage(roleHome[nextRole]);
    setAppState("app");
  };

  if (appState === "landing")    return <LandingPage onNavigate={navigate} />;
  if (appState === "onboarding") {
    return <Onboarding onComplete={() => { setPage("command"); setAppState("app"); }} />;
  }

  return (
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
            <div className="hidden sm:flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-medium text-red-600">{role === "candidate" ? "4 open risks" : role === "employer" ? "3 delayed replies" : "128 students need support"}</span>
            </div>
            <button
              onClick={() => navigate("onboarding")}
              className="text-xs text-muted-foreground hover:text-primary transition-colors border border-border px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              Re-scan
            </button>
            <button
              onClick={() => navigate("profile")}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold"
            >
              JK
            </button>
          </div>
        </header>

        {/* Page */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {page === "dashboard"    && <Dashboard onNavigate={navigate} />}
          {page === "command"      && <CareerCommandCenter onNavigate={navigate} />}
          {page === "dna"          && <CareerDna />}
          {page === "jobs"         && <JobMatchTracker />}
          {page === "coach"        && <InterviewCoach />}
          {page === "offers"       && <OfferDecisionDashboard />}
          {page === "decisionlab"  && <DecisionLab />}
          {page === "blindspots"   && <BlindSpots />}
          {page === "prescription" && <CareerPrescription />}
          {page === "evidence"     && <CareerEvidence />}
          {page === "profile"      && <UserProfile />}
          {page === "employer"     && <EmployerDashboard />}
          {page === "insights"     && <EcosystemInsights />}
        </div>
      </main>
    </div>
  );
}
