import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { EMPTY_PROFILE, type CareerProfile, type EvidenceItem, type ParsedResume } from "../lib/profileTypes";
import { gapContextFor } from "../lib/careerCorpus";
import { deriveBlindSpots, deriveRiskCategoryChecks, deriveRisks, deriveScorecard, deriveTargetGaps, getSalaryBenchmark, type BlindSpot, type Risk, type RiskCategoryCheck, type SalaryBenchmark, type Scorecard, type TargetGap } from "../lib/careerRisk";

/* ────────────────────────────────────────────────────────────────
   The scan result, shared.

   Onboarding used to hand two arguments up to App.tsx and everything
   else it had collected — the resume, the connected evidence, the raw
   calibration answers — died with the component. Pages that needed
   any of it hardcoded a persona instead, which is why a marketing
   graduate saw a data analyst's blind spots.

   Everything derived from the profile (risks, target gaps, the four
   headline scores) is computed here once and read everywhere, so the
   same number cannot disagree with itself across two pages.
   ──────────────────────────────────────────────────────────────── */

interface CareerProfileContextValue {
  profile: CareerProfile;
  /* The name to put on screen. The résumé is the better source when it
     has one; the signed-in name fills in when it does not, so the
     published portfolio stops saying "Your name". */
  displayName: string;
  setAccountName: (name: string) => void;
  hasScanned: boolean;
  risks: Risk[];
  riskChecks: RiskCategoryCheck[];
  /** Real risks the user does not believe are their problem. */
  blindSpots: BlindSpot[];
  salaryBenchmark: SalaryBenchmark;
  targetGaps: TargetGap[];
  scorecard: Scorecard;
  setProfile: (p: CareerProfile) => void;
  addEvidence: (item: Omit<EvidenceItem, "id" | "addedAt">) => void;
  removeEvidence: (id: string) => void;
  setResume: (resume: ParsedResume | null) => void;
  reset: () => void;
}

const CareerProfileContext = createContext<CareerProfileContextValue | null>(null);

export function CareerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<CareerProfile>(EMPTY_PROFILE);
  const [accountName, setAccountName] = useState("");

  const hasScanned = !!profile.scannedAt;

  const addEvidence: CareerProfileContextValue["addEvidence"] = item => {
    setProfileState(prev => {
      /* Adding the same thing twice is a no-op rather than a duplicate
         row — matched on what it is, not on where it came from.

         Keying this on kind + source meant one connector could only
         ever contribute one item per kind: a LinkedIn import of nine
         entries, all sharing the profile URL, landed as three. Six
         projects, a hackathon result and a conference talk were dropped
         on the floor with no error. Re-pasting the same URL still
         no-ops, because the labels match. */
      if (prev.evidence.some(e => e.label === item.label && e.source === item.source)) return prev;
      return {
        ...prev,
        evidence: [
          ...prev.evidence,
          { ...item, id: `ev-${prev.evidence.length + 1}-${item.kind}`, addedAt: "Just now" },
        ],
      };
    });
  };

  const removeEvidence = (id: string) =>
    setProfileState(prev => ({ ...prev, evidence: prev.evidence.filter(e => e.id !== id) }));

  const setResume = (resume: ParsedResume | null) =>
    setProfileState(prev => ({ ...prev, resume }));

  const value = useMemo<CareerProfileContextValue>(() => ({
    profile,
    displayName: profile.resume?.name?.trim() || profile.displayName?.trim() || accountName.trim() || "Your name",
    setAccountName,
    hasScanned,
    risks: deriveRisks(profile),
    riskChecks: deriveRiskCategoryChecks(profile),
    blindSpots: deriveBlindSpots(profile),
    salaryBenchmark: getSalaryBenchmark(profile),
    targetGaps: deriveTargetGaps(profile, gapContextFor(profile)),
    scorecard: deriveScorecard(profile),
    setProfile: setProfileState,
    addEvidence,
    removeEvidence,
    setResume,
    reset: () => setProfileState(EMPTY_PROFILE),
  }), [profile, hasScanned, accountName]);

  return <CareerProfileContext.Provider value={value}>{children}</CareerProfileContext.Provider>;
}

export function useCareerProfile() {
  const ctx = useContext(CareerProfileContext);
  if (!ctx) throw new Error("useCareerProfile must be used inside CareerProfileProvider");
  return ctx;
}
