import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { EMPTY_PROFILE, type CareerProfile, type EvidenceItem, type ParsedResume } from "../lib/profileTypes";
import { deriveRisks, deriveScorecard, deriveTargetGaps, type Risk, type Scorecard, type TargetGap } from "../lib/careerRisk";

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
  hasScanned: boolean;
  risks: Risk[];
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

  const hasScanned = !!profile.scannedAt;

  const addEvidence: CareerProfileContextValue["addEvidence"] = item => {
    setProfileState(prev => {
      // Adding the same source twice is a no-op rather than a duplicate row.
      if (prev.evidence.some(e => e.kind === item.kind && e.source === item.source)) return prev;
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
    hasScanned,
    risks: deriveRisks(profile),
    targetGaps: deriveTargetGaps(profile),
    scorecard: deriveScorecard(profile),
    setProfile: setProfileState,
    addEvidence,
    removeEvidence,
    setResume,
    reset: () => setProfileState(EMPTY_PROFILE),
  }), [profile, hasScanned]);

  return <CareerProfileContext.Provider value={value}>{children}</CareerProfileContext.Provider>;
}

export function useCareerProfile() {
  const ctx = useContext(CareerProfileContext);
  if (!ctx) throw new Error("useCareerProfile must be used inside CareerProfileProvider");
  return ctx;
}
