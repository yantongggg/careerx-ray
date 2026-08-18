/* ────────────────────────────────────────────────────────────────
   Role family classification — the single classifier.

   Two divergent copies used to exist (BlindSpots.detectRoleFamily and
   SkillGraph.getRoleFamily) with different family sets and different
   regex order, so the same user could be classified two ways on two
   pages. This is the one both now call.

   The canonical set is wider than either original because evidence
   intake has to speak to people outside tech — a property agent and a
   waiter do not upload a GitHub repo. The two adapters at the bottom
   narrow the canonical family back down to the key sets that the
   existing market and skill datasets are written against.
   ──────────────────────────────────────────────────────────────── */

export type RoleFamily =
  | "data"
  | "design"
  | "software"
  | "marketing"
  | "product"
  | "business"
  | "service"
  | "generic";

/** Families that the market-trend datasets in BlindSpots are authored for. */
export type MarketFamily = "data" | "design" | "software" | "marketing" | "generic";

/** Families that the orbital skill graph datasets are authored for. */
export type SkillFamily = "data" | "creative" | "software" | "marketing" | "product";

export const FAMILY_LABEL: Record<RoleFamily, string> = {
  data:      "Data & Analytics",
  design:    "Design & Creative",
  software:  "Software Engineering",
  marketing: "Marketing & Growth",
  product:   "Product",
  business:  "Sales, Property & Business",
  service:   "Service, Retail & Hospitality",
  generic:   "General",
};

/* Order matters. More specific patterns are tested before broader ones —
   "Product Designer" must land on design, not product, and "Data
   Engineer" must land on data, not software. */
const RULES: { family: RoleFamily; test: RegExp; not?: RegExp }[] = [
  { family: "design",    test: /design|ux\b|ui\b|creative|graphic|visual|illustrat|animat|photograph|videograph|art director|interior/ },
  { family: "data",      test: /data|analyst|analytics|\bbi\b|scientist|machine learning|\bml\b|statistic|actuari/ },
  { family: "software",  test: /software|developer|engineer|programmer|full.?stack|backend|front.?end|devops|\bqa\b|mobile app|cyber|security/, not: /data|design/ },
  { family: "product",   test: /product/, not: /design/ },
  { family: "marketing", test: /marketing|growth|brand|content|\bseo\b|social media|copywrit|public relations|\bpr\b|advertis|campaign/ },
  { family: "business",  test: /real estate|property|realtor|sales|account executive|business develop|\bbd\b|consultant|banker|insurance|agent|broker|finance|account(ing|ant)|audit|procurement/ },
  { family: "service",   test: /waiter|waitress|server|barista|retail|cashier|hospitality|restaurant|\bchef\b|cook|housekeep|front desk|receptionist|customer service|customer support|call cent|driver|rider|nurse|caregiver|technician|mechanic|security guard/ },
];

/**
 * Classify one or more role labels into a single family.
 * Later arguments (typically the target role) only win if no earlier
 * argument matches — the current role is the stronger signal for the
 * market data, and the target role is handled explicitly by callers
 * that care about the transition.
 */
export function detectRoleFamily(...roles: (string | undefined)[]): RoleFamily {
  for (const role of roles) {
    if (!role) continue;
    const r = role.toLowerCase();
    for (const rule of RULES) {
      if (rule.test.test(r) && !(rule.not && rule.not.test(r))) return rule.family;
    }
  }
  return "generic";
}

/** Narrow to the family keys the BlindSpots market datasets are written for. */
export function toMarketFamily(family: RoleFamily): MarketFamily {
  switch (family) {
    case "data":
    case "design":
    case "software":
    case "marketing":
      return family;
    case "product":
      return "data";
    default:
      return "generic";
  }
}

/** Narrow to the family keys the SkillGraph datasets are written for. */
export function toSkillFamily(family: RoleFamily): SkillFamily {
  switch (family) {
    case "design":
      return "creative";
    case "software":
    case "marketing":
    case "product":
      return family;
    default:
      return "data";
  }
}
