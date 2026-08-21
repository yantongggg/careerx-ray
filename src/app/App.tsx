import { useState } from "react";
import { Onboarding } from "./pages/Onboarding";
import { LandingPage } from "./pages/LandingPage";
import { CareerCommandCenter } from "./pages/CareerCommandCenter";
import { CareerDna } from "./pages/CareerDna";
import { DnaMethod } from "./pages/DnaMethod";
import { JobMatchTracker } from "./pages/JobMatchTracker";
import { InterviewCoach } from "./pages/InterviewCoach";
import { OfferDecisionDashboard } from "./pages/OfferDecisionDashboard";
import { EmployerDashboard } from "./pages/EmployerDashboard";
import { SmartTalentMatching } from "./pages/SmartTalentMatching";
import { ReplySlaMonitor } from "./pages/ReplySlaMonitor";
import { TalentReengagement } from "./pages/TalentReengagement";
import { WorkforceResilience } from "./pages/WorkforceResilience";
import { EcosystemInsights } from "./pages/EcosystemInsights";
import { OutcomeLoop } from "./pages/OutcomeLoop";
import { CurriculumEngine } from "./pages/CurriculumEngine";
import { InternshipMarketplace } from "./pages/InternshipMarketplace";
import { LearningWallet } from "./pages/LearningWallet";
import { PortfolioBuilder } from "./pages/PortfolioBuilder";
import { Dashboard } from "./pages/Dashboard";
import { DecisionLab } from "./pages/DecisionLab";
import { BlindSpots } from "./pages/BlindSpots";
import { CareerPrescription } from "./pages/CareerPrescription";
import { CareerEvidence } from "./pages/CareerEvidence";
import { UserProfile } from "./pages/UserProfile";
import { ValidationBlueprint } from "./pages/ValidationBlueprint";
import { EmbeddedDoc } from "./pages/EmbeddedDoc";
import { Sidebar } from "./layout/Sidebar";
import { CareerChat } from "./layout/CareerChat";
import { ApplicationPrep } from "./pages/ApplicationPrep";
import { HiringPipeline } from "./pages/HiringPipeline";
import { IntelligenceProvider } from "./state/intelligence";
import { CareerProfileProvider, useCareerProfile } from "./state/careerProfile";
import { RoleSelect } from "./pages/RoleSelect";
import { JourneyBackControl, JourneyNextControl, PAGE_ORDER, stageById, StageHub } from "./state/stages";
import { SkillGraph } from "./pages/SkillGraph";
import { ToastHost } from "./state/toast";
import { AuthPage } from "./pages/Auth";
import { ChevronLeft, LogOut } from "lucide-react";

/* MARKER-MAKE-KIT-INVOKED */

type AppState = "landing" | "auth" | "role-select" | "onboarding" | "app";

type Role = "candidate" | "employer" | "university";
type Page =
  | "command"
  | "stage-diagnose"
  | "stage-decide"
  | "stage-prepare"
  | "stage-apply"
  | "stage-prove"
  | "dna"
  | "dna-method"
  | "jobs"
  | "apply-prep"
  | "architecture"
  | "blueprint"
  | "nextplan"
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
  "dna-method":     "How Career DNA Works",
  jobs:             "Job Match Tracker",
  "apply-prep":     "Application Preparation",
  architecture:     "Technical Architecture",
  blueprint:        "Validation Blueprint",
  nextplan:         "Next Plan",
  coach:            "Interview Coach",
  offers:           "Offer Decision AI",
  portfolio:        "Living Portfolio",
  dashboard:        "Career Dashboard",
  decisionlab:      "Decision Lab",
  blindspots:       "Gap to Target",
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

/* The two applications the demo persona already sent, dated so the
   pipeline reads as a fortnight of activity rather than everything at
   once. Ids come from the data-family corpus. */
const DEMO_APPLICATIONS: Record<string, string> = {
  "da-airasia-dsm": new Date(Date.now() - 11 * 864e5).toISOString(),
  "da-cimb-snr": new Date(Date.now() - 4 * 864e5).toISOString(),
};

const allPages: Page[] = [
  "command", "stage-diagnose", "stage-decide", "stage-prepare", "stage-apply", "stage-prove",
  "dna", "dna-method", "jobs", "apply-prep", "coach", "offers", "portfolio", "architecture", "blueprint", "nextplan", "dashboard", "decisionlab", "blindspots",
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
  "dna-method": "candidate",
  jobs: "candidate",
  "apply-prep": "candidate",
  architecture: "candidate",
  blueprint: "candidate",
  nextplan: "candidate",
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

/* The two providers wrap the whole app exactly once. They used to be
   re-mounted inside every branch below, which quietly reset the
   Career Intelligence Graph whenever the user moved between the
   landing page, sign-in and the app — taking any live hiring signal
   with it. */
export default function App() {
  return (
    <IntelligenceProvider>
      <CareerProfileProvider>
        <AppRouter />
      </CareerProfileProvider>
    </IntelligenceProvider>
  );
}

function AppRouter() {
  const { profile, hasScanned, risks, setProfile, reset: resetProfile, setAccountName, displayName } = useCareerProfile();
  const [appState, setAppState] = useState<AppState>("landing");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authed, setAuthed]     = useState(false);
  const [user, setUser]         = useState<{ name: string; email: string } | null>(null);
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);
  const [page, setPage]         = useState<Page>("command");
  const [role, setRole]         = useState<Role>("candidate");
  const [history, setHistory]   = useState<Page[]>([]);
  const [prepJobId, setPrepJobId] = useState<string | null>(null);
  /* id → when they applied. Was a Set pre-seeded with two applications
     the user had never made, which put a freshly-scanned account into an
     interview loop it had no history for. */
  /* The assistant is reachable from the sidebar and from its own
     floating launcher, so its open state lives here. */
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeed, setChatSeed] = useState<string | null>(null);
  const askTapir = (question?: string) => { setChatSeed(question ?? null); setChatOpen(true); };
  const [appliedJobs, setAppliedJobs] = useState<Record<string, string>>({});

  const navigate = (target: string) => {
    if (target === "landing")     { setAppState("landing");     return; }
    if (target === "login")       { setAuthMode("login");    setAppState("auth"); return; }
    if (target === "register")    { setAuthMode("register"); setAppState("auth"); return; }
    // Everything past the landing page requires an account first.
    if (!authed) {
      setPendingTarget(target);
      setAuthMode("register");
      setAppState("auth");
      return;
    }
    if (target === "role-select") { setAppState("role-select"); return; }
    if (target === "onboarding")  { setAppState("onboarding");  return; }
    if ((allPages as string[]).includes(target)) {
      const nextPage = target as Page;
      // Candidate pages are built from scan results — no scan, no dashboard.
      if (pageRole[nextPage] === "candidate" && !hasScanned) {
        setAppState("onboarding");
        return;
      }
      if (appState === "app" && nextPage !== page) setHistory(prev => [...prev.slice(-30), page]);
      setPage(nextPage);
      setRole(pageRole[nextPage]);
      setAppState("app");
    }
  };

  const goBack = () => {
    setHistory(prev => {
      const next = [...prev];
      const last = next.pop();
      if (last) { setPage(last); setRole(pageRole[last]); }
      return next;
    });
  };

  const signOut = () => {
    setAuthed(false); setUser(null); resetProfile(); setAccountName("");
    setHistory([]); setPage("command"); setRole("candidate");
    setAppState("landing");
  };

  const handlePrepareApp = (jobId: string) => {
    setPrepJobId(jobId);
    /* navigate, not setPage — apply-prep is a stop on the Apply journey now,
       so Back has to be able to return from it. */
    navigate("apply-prep");
  };

  const handleApply = (jobId: string) => {
    setAppliedJobs(prev => (prev[jobId] ? prev : { ...prev, [jobId]: new Date().toISOString() }));
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

  const hasJourneyRail = role === "candidate" && PAGE_ORDER.includes(page);

  if (appState === "landing") {
    return <LandingPage onNavigate={navigate} />;
  }
  if (appState === "auth") {
    return (
        <AuthPage
          mode={authMode}
          onBack={() => setAppState("landing")}
          onSwitchMode={() => setAuthMode(m => (m === "login" ? "register" : "login"))}
          onAuthed={u => {
            setAuthed(true);
            setUser({ name: u.name, email: u.email });
            setAccountName(u.name);
            const scanned = u.isNew ? false : hasScanned;
            if (u.isNew) resetProfile();
            const target = pendingTarget;
            setPendingTarget(null);
            if (target && target !== "role-select") {
              // Re-run routing now that we're authed
              if (target === "onboarding") { setAppState("onboarding"); return; }
              if ((allPages as string[]).includes(target)) {
                const nextPage = target as Page;
                if (pageRole[nextPage] === "candidate" && !scanned) { setAppState("onboarding"); return; }
                setPage(nextPage); setRole(pageRole[nextPage]); setAppState("app"); return;
              }
            }
            setAppState("role-select");
          }}
        />
    );
  }
  if (appState === "role-select") {
    return (
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
    );
  }
  if (appState === "onboarding") {
    return (
      <Onboarding
        onBack={() => setAppState(hasScanned ? "app" : "role-select")}
        onComplete={next => {
          setProfile(next);
          setRole("candidate");
          setPage("command");
          setHistory([]);
          setAppState("app");
        }}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-muted">
      <Sidebar currentPage={page} currentRole={role} onNavigate={navigate} onAskTapir={() => askTapir()} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {history.length > 0 && (
              <button
                onClick={goBack}
                className={`${hasJourneyRail ? "xl:hidden" : ""} flex items-center gap-1 text-xs font-semibold border border-border rounded-lg px-2 py-1.5 hover:bg-muted hover:text-foreground transition-colors mr-1`}
              >
                <ChevronLeft size={13} /> Back
              </button>
            )}
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
              <span className="text-xs font-medium text-[#6F5A2B]">{role === "candidate" ? `${risks.length} open risk${risks.length === 1 ? "" : "s"}` : role === "employer" ? "3 delayed replies" : "128 students need support"}</span>
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
              title={displayName}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D9C18A] to-[#8A7038] flex items-center justify-center text-white text-xs font-bold"
            >
              {displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
            </button>
            <button
              onClick={signOut}
              title="Sign out"
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        </header>

        {/* Page */}
        <div className="flex-1 overflow-hidden flex">
          {hasJourneyRail && (
            <JourneyBackControl
              currentPage={page}
              onBack={goBack}
              canGoBack={history.length > 0}
              backPage={history.at(-1)}
              backLabel={history.at(-1) ? pageLabels[history.at(-1)!] : undefined}
            />
          )}
          <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
            {page === "dashboard"       && <Dashboard onNavigate={navigate} />}
            {page === "command"         && <CareerCommandCenter onNavigate={navigate} appliedJobs={appliedJobs} />}
          {/* Looked up by id, not array position — the journey order can
              change without silently pointing a route at the wrong stage. */}
            {page === "stage-diagnose"  && <StageHub stage={stageById("stage-diagnose")} onNavigate={navigate} />}
            {page === "stage-decide"    && <StageHub stage={stageById("stage-decide")} onNavigate={navigate} />}
            {page === "stage-prepare"   && <StageHub stage={stageById("stage-prepare")} onNavigate={navigate}><SkillGraph targetRole={profile.targetRole} /></StageHub>}
            {page === "stage-apply"     && <StageHub stage={stageById("stage-apply")} onNavigate={navigate} />}
            {page === "stage-prove"     && <StageHub stage={stageById("stage-prove")} onNavigate={navigate} />}
            {page === "dna"             && <CareerDna onNavigate={navigate} />}
            {page === "dna-method"      && <DnaMethod onNavigate={navigate} />}
            {page === "jobs"            && <JobMatchTracker onPrepareApp={handlePrepareApp} onCoach={(jobId) => { setPrepJobId(jobId); navigate("coach"); }} appliedJobs={appliedJobs} />}
            {page === "apply-prep"      && <ApplicationPrep jobId={prepJobId} onBack={() => navigate("jobs")} onApply={handleApply} onCoach={() => navigate("coach")} />}
            {page === "coach"           && <InterviewCoach jobId={prepJobId} onNavigate={navigate} />}
            {page === "offers"          && <OfferDecisionDashboard onNavigate={navigate} appliedJobs={appliedJobs} />}
            {page === "portfolio"       && <PortfolioBuilder onNavigate={navigate} />}
            {page === "decisionlab"     && <DecisionLab onNavigate={navigate} onAskTapir={askTapir} />}
            {page === "blindspots"      && <BlindSpots onNavigate={navigate} />}
            {page === "prescription"    && <CareerPrescription onNavigate={navigate} />}
            {page === "evidence"        && <CareerEvidence onNavigate={navigate} />}
            {page === "profile"         && <UserProfile onNavigate={navigate} />}
            {page === "architecture"    && (
              <EmbeddedDoc
                onNavigate={navigate}
                title="Runtime architecture"
                lede="One career scan, second by second: seven stages, five deterministic engines in parallel, and the only two places a model is allowed to touch it. Hover any node for detail; click the canvas to replay."
                src="/docs/architecture-runtime.en.html"
                srcZh="/docs/architecture-runtime.html"
                maxWidth={1720}
                height={1180}
              />
            )}
            {page === "blueprint"       && <ValidationBlueprint onNavigate={navigate} />}
            {page === "nextplan"        && (
              <EmbeddedDoc
                onNavigate={navigate}
                title="Next plan · 30 / 90 / 120 days"
                lede="Three gates. Each phase has one thing that has to be true before the next one starts — and a stated answer for when it is not."
                src="/docs/next-plan.en.html"
                srcZh="/docs/next-plan.html"
                maxWidth={1720}
                height={1320}
              />
            )}
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
          {hasJourneyRail && (
            <JourneyNextControl currentPage={page} onNavigate={navigate} />
          )}
        </div>
      </main>

      {/* Candidate-side only: the assistant reads a career scan, which
          employer and university accounts do not have. */}
      {role === "candidate" && (
        <CareerChat page={pageLabels[page] ?? page} open={chatOpen} onOpenChange={setChatOpen} seed={chatSeed} onSeedConsumed={() => setChatSeed(null)} />
      )}

      <ToastHost />
    </div>
  );
}
