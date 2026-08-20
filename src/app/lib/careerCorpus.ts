/* ────────────────────────────────────────────────────────────────
   The career corpus — one source of role-specific content.

   Six pages used to hold their own copy of a single hardcoded persona:
   Decision Lab offered "transition into ML Engineering" no matter what
   you asked for, Job Match always showed the same Maybank analyst
   posting, and Interview Coach asked about dbt whether or not you had
   ever touched it. A student who scanned as a junior developer aiming
   at software engineering saw a data analyst's entire career.

   Replacing "data analyst" with "software engineer" throughout would
   only have pointed the same hardcoding somewhere else. Instead this
   module extends the pattern roleFamily.ts already established: content
   is written per family, and everything that can be derived from the
   profile — salary trajectories, fit scores, the third career path — is
   derived rather than typed in.

   Two families are written out in full (software, data). Everything
   else resolves to `generic`, whose postings template their titles from
   the user's own target role, so a restaurant supervisor aiming at
   restaurant manager gets postings for that and not for either of the
   tech families.
   ──────────────────────────────────────────────────────────────── */

import type { CareerProfile } from "./profileTypes";
import { detectRoleFamily, FAMILY_LABEL, type RoleFamily } from "./roleFamily";
import { automationBase, keyCredential, marketMedian, seniorityBand, type SeniorityBand } from "./careerRisk";

/* ── Shapes ──────────────────────────────────────────────────── */

export interface CorpusHiringContact {
  name: string;
  title: string;
  replyRate: number;
  avgReply: string;
  responseHours: string;
  lastSeen: string;
}

export interface CorpusInterview {
  /** Four questions this specific posting would actually open with. */
  questions: string[];
  /** How the coach suggests framing the highlighted question. */
  aiFrame: string;
  /** Which question the rehearsal starts on, and its label. */
  activeQ: number;
  promptLabel: string;
}

export interface CorpusJob {
  id: string;
  company: string;
  companyId: string;
  /** Full posting title, e.g. "Software Engineer, Payments". */
  title: string;
  /** Canonical role behind the posting, e.g. "Software Engineer". */
  position: string;
  location: string;
  type: string;
  /** Monthly RM. Rendered by the pages; never stored pre-formatted. */
  salaryLow: number;
  salaryHigh: number;
  description: string;
  requirements: string[];
  /** What this posting rewards, and what it will probe. */
  strengths: string[];
  gaps: string[];
  companyColors: string[];
  companyGlow: string;
  hr: CorpusHiringContact;
  interview: CorpusInterview;
}

export interface CorpusEvidenceSample {
  kind: "certificate" | "project" | "portfolio" | "experience";
  title: string;
  issuer: string;
  detail: string;
}

/** The authored, family-specific half of the corpus. */
export interface FamilyContent {
  family: RoleFamily;
  /** Postings, most-relevant first. */
  jobs: CorpusJob[];
  /** A real third path in the same family as the target role. */
  adjacentRole: string;
  /** The leadership track for this family. */
  leadRole: string;
  /** One rung above leadRole, for when the target role is already the
      leadership role and Future C would otherwise repeat Future B. */
  execRole: string;
  /** Skills the user most likely already has that transfer. */
  foundationSkills: string[];
  /** What the target role additionally demands. */
  targetSkills: string[];
  /** Concrete certification name, not a category. */
  certification: string;
  /** How long a serious transition into the target takes. */
  transitionMonths: [number, number];
  evidenceSamples: CorpusEvidenceSample[];
}

/* ── Company palettes ────────────────────────────────────────── */

const PALETTE: Record<string, { colors: string[]; glow: string }> = {
  grab:      { colors: ["#00B14F", "#00844A"], glow: "rgba(0,177,79,0.18)" },
  shopee:    { colors: ["#EE4D2D", "#C63A1F"], glow: "rgba(238,77,45,0.18)" },
  maybank:   { colors: ["#FFC72C", "#E0A400"], glow: "rgba(255,199,44,0.20)" },
  tng:       { colors: ["#1F4FD8", "#12379B"], glow: "rgba(31,79,216,0.18)" },
  carsome:   { colors: ["#0B57D0", "#083F97"], glow: "rgba(11,87,208,0.18)" },
  paynet:    { colors: ["#E4002B", "#B00021"], glow: "rgba(228,0,43,0.18)" },
  petronas:  { colors: ["#00A19C", "#007571"], glow: "rgba(0,161,156,0.18)" },
  axiata:    { colors: ["#ED1C24", "#B5151B"], glow: "rgba(237,28,36,0.18)" },
  neutral:   { colors: ["#475569", "#334155"], glow: "rgba(71,85,105,0.16)" },
};

const pal = (k: keyof typeof PALETTE | string) => PALETTE[k] ?? PALETTE.neutral;

/* ── Software ────────────────────────────────────────────────── */

const SOFTWARE: FamilyContent = {
  family: "software",
  adjacentRole: "Backend Engineer",
  leadRole: "Engineering Team Lead",
  execRole: "Head of Engineering",
  foundationSkills: ["Git", "one production language", "REST APIs", "SQL basics"],
  targetSkills: ["System design", "Automated testing", "CI/CD", "Cloud deployment", "Code review"],
  certification: "AWS Certified Developer – Associate",
  transitionMonths: [6, 12],
  evidenceSamples: [
    { kind: "project", title: "Full-stack side project, deployed", issuer: "Self-directed", detail: "A running URL beats a repository. Deploy it and put the link on the resume." },
    { kind: "certificate", title: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", detail: "The cloud credential Malaysian engineering teams screen for most often." },
    { kind: "project", title: "Open-source contribution merged", issuer: "GitHub", detail: "One merged pull request to a real project is stronger evidence than ten tutorials." },
    { kind: "experience", title: "Internship or freelance build", issuer: "Employer or client", detail: "Shipped software someone else depended on — name the users and the scale." },
  ],
  jobs: [
    {
      id: "sw-grab-se",
      company: "Grab", companyId: "grab",
      title: "Software Engineer, Payments",
      position: "Software Engineer",
      location: "Petaling Jaya / Hybrid",
      type: "Full-time",
      salaryLow: 6500, salaryHigh: 9000,
      description: "Build and operate the services behind GrabPay transactions. You will own endpoints end to end — design, tests, deploy, on-call — inside a team that ships weekly.",
      requirements: ["1–3 years writing production code", "Go, Java or Python", "Relational databases and query tuning", "Git-based review workflow", "Comfortable owning a service in production"],
      strengths: ["Hands-on coding", "API design", "Debugging under load"],
      gaps: ["Distributed systems depth", "Production on-call experience"],
      companyColors: pal("grab").colors, companyGlow: pal("grab").glow,
      hr: { name: "Daniel Lim", title: "Talent Acquisition, Engineering", replyRate: 84, avgReply: "~2.5 hrs", responseHours: "10 AM – 7 PM", lastSeen: "18 min ago" },
      interview: {
        questions: [
          "Walk me through a service you built and what broke first in production.",
          "How would you design an idempotent payment endpoint that clients can safely retry?",
          "Tell me about a bug that took you more than a day. How did you narrow it down?",
          "Your code review gets 20 comments. How do you handle that?",
        ],
        aiFrame: "Start with the failure mode — a retried payment must not charge twice. Name the idempotency key, where you store it, what happens on a concurrent retry, and how the client learns the request already succeeded. Close with how you would test it.",
        activeQ: 1,
        promptLabel: "Question 2 · System design",
      },
    },
    {
      id: "sw-tng-be",
      company: "TNG Digital", companyId: "tng",
      title: "Backend Engineer, Wallet Platform",
      position: "Backend Engineer",
      location: "Kuala Lumpur",
      type: "Full-time",
      salaryLow: 6000, salaryHigh: 8500,
      description: "Work on the wallet services used by millions of Touch 'n Go users daily. Heavy on correctness, reconciliation, and services that cannot lose a transaction.",
      requirements: ["Java or Go in production", "Message queues (Kafka or similar)", "Strong SQL", "Unit and integration testing discipline"],
      strengths: ["Backend fundamentals", "Data correctness", "Testing"],
      gaps: ["Event-driven architecture", "High-throughput tuning"],
      companyColors: pal("tng").colors, companyGlow: pal("tng").glow,
      hr: { name: "Aisha Rahman", title: "People Operations, Platform", replyRate: 71, avgReply: "~6 hrs", responseHours: "9 AM – 5 PM", lastSeen: "3 hrs ago" },
      interview: {
        questions: [
          "How do you guarantee a wallet balance stays correct when two requests hit it at once?",
          "Explain a time you wrote a test that caught something a review missed.",
          "What happens when your consumer crashes halfway through a Kafka batch?",
          "How would you reconcile two systems that disagree about a transaction?",
        ],
        aiFrame: "Name the concurrency control explicitly — row-level locking or optimistic versioning — then explain why you chose it over the other. Interviewers here care that you know money cannot be eventually consistent.",
        activeQ: 0,
        promptLabel: "Question 1 · Concurrency correctness",
      },
    },
    {
      id: "sw-carsome-fe",
      company: "Carsome", companyId: "carsome",
      title: "Frontend Engineer, Marketplace",
      position: "Frontend Engineer",
      location: "Kuala Lumpur / Hybrid",
      type: "Full-time",
      salaryLow: 5500, salaryHigh: 8000,
      description: "Own the buyer-facing marketplace experience in React and TypeScript. Performance on mid-range Android phones is a first-class requirement, not an afterthought.",
      requirements: ["React and TypeScript", "Responsive layout and accessibility", "Performance profiling", "Working with design systems"],
      strengths: ["React", "UI craft", "Attention to detail"],
      gaps: ["Web performance measurement", "Accessibility standards"],
      companyColors: pal("carsome").colors, companyGlow: pal("carsome").glow,
      hr: { name: "Sarah Tan", title: "Talent Acquisition", replyRate: 92, avgReply: "~45 min", responseHours: "9 AM – 6 PM", lastSeen: "2 min ago" },
      interview: {
        questions: [
          "A listing page takes 6 seconds to become interactive on a mid-range phone. Where do you look first?",
          "How do you decide what belongs in component state versus shared state?",
          "Show me something you built where the interaction detail mattered.",
          "How do you keep a design system from drifting as the product grows?",
        ],
        aiFrame: "Do not start with a fix — start with a measurement. Say which tool you open, which metric you read, and only then name the likely cause. Guessing at optimisations is the answer that loses this question.",
        activeQ: 0,
        promptLabel: "Question 1 · Performance debugging",
      },
    },
    {
      id: "sw-grab-lead",
      company: "Grab", companyId: "grab",
      title: "Engineering Team Lead, Payments",
      position: "Engineering Team Lead",
      location: "Petaling Jaya / Hybrid",
      type: "Full-time",
      salaryLow: 12000, salaryHigh: 17000,
      description: "Lead a team of five engineers on the payments platform. Still technical, but your output is now what the team ships, not what you write.",
      requirements: ["Senior engineering experience", "Mentoring or tech-lead experience", "System design across services", "Comfortable owning delivery, not just code"],
      strengths: ["Technical depth", "System design"],
      gaps: ["Direct people management", "Delivery planning"],
      companyColors: pal("grab").colors, companyGlow: pal("grab").glow,
      hr: { name: "Daniel Lim", title: "Talent Acquisition, Engineering", replyRate: 80, avgReply: "~3 hrs", responseHours: "10 AM – 7 PM", lastSeen: "40 min ago" },
      interview: {
        questions: [
          "How do you decide what to delegate and what to keep?",
          "Your best engineer wants to leave. What do you do first?",
          "Walk me through how you would plan a quarter for five people.",
          "How do you stay technical enough to be useful?",
        ],
        aiFrame: "The trap is answering everything as an engineer. They want to hear that you measure yourself by what the team ships. Name one thing you deliberately did not build yourself so someone else could learn it.",
        activeQ: 0,
        promptLabel: "Question 1 · Leading engineers",
      },
    },
    {
      id: "sw-paynet-qa",
      company: "PayNet", companyId: "paynet",
      title: "Software Engineer in Test",
      position: "QA Engineer",
      location: "Kuala Lumpur",
      type: "Full-time",
      salaryLow: 5000, salaryHigh: 7200,
      description: "Build the automated test suites that gate releases for Malaysia's national payments infrastructure. Writing code, not clicking through checklists.",
      requirements: ["Test automation in Python or Java", "API testing", "CI pipelines", "Understanding of the release process"],
      strengths: ["Systematic thinking", "Automation", "Risk assessment"],
      gaps: ["Performance and load testing", "Security testing"],
      companyColors: pal("paynet").colors, companyGlow: pal("paynet").glow,
      hr: { name: "Nurul Izzati", title: "HR Business Partner, Technology", replyRate: 64, avgReply: "~8 hrs", responseHours: "9 AM – 5 PM", lastSeen: "1 day ago" },
      interview: {
        questions: [
          "Which tests would you write first for a new payment API, and why those?",
          "How do you deal with a test suite that fails intermittently?",
          "Where does automated testing stop being worth the cost?",
          "Walk me through a release you helped gate.",
        ],
        aiFrame: "Rank by blast radius, not by ease. The tests you write first are the ones covering the failures that would move money incorrectly. Say that out loud, then work outward to the cheaper cases.",
        activeQ: 0,
        promptLabel: "Question 1 · Test strategy",
      },
    },
  ],
};

/* ── Data ────────────────────────────────────────────────────── */

const DATA: FamilyContent = {
  family: "data",
  adjacentRole: "Analytics Engineer",
  leadRole: "Data Science Manager",
  execRole: "Head of Data",
  foundationSkills: ["SQL", "Python", "Dashboarding", "Stakeholder communication"],
  targetSkills: ["Data modelling", "Pipeline orchestration", "Cloud warehouse", "Experiment design", "Version-controlled transforms"],
  certification: "AWS Certified Data Engineer – Associate",
  transitionMonths: [9, 14],
  evidenceSamples: [
    { kind: "project", title: "End-to-end analysis with a decision attached", issuer: "Self-directed", detail: "A dashboard nobody acted on is not evidence. Name the decision it changed." },
    { kind: "certificate", title: "AWS Certified Data Engineer – Associate", issuer: "Amazon Web Services", detail: "The cloud credential that most often gates the move out of reporting work." },
    { kind: "project", title: "dbt project in a public repository", issuer: "GitHub", detail: "Shows you can version-control transformations, not just write queries." },
    { kind: "experience", title: "Analytics internship or contract", issuer: "Employer or client", detail: "Someone made a decision on your numbers — say who, and what changed." },
  ],
  jobs: [
    {
      id: "da-maybank",
      company: "Maybank", companyId: "maybank",
      title: "Data Analyst, Digital Banking",
      position: "Data Analyst",
      location: "Kuala Lumpur",
      type: "Full-time",
      salaryLow: 5500, salaryHigh: 8000,
      description: "Analyse customer and transaction behaviour across Maybank's digital channels, and turn it into decisions the product and fraud teams act on.",
      requirements: ["Strong SQL", "Python or R", "Dashboarding (Tableau or Power BI)", "Financial services domain interest"],
      strengths: ["SQL depth", "FinTech domain", "Fraud analytics"],
      gaps: ["Cloud credential"],
      companyColors: pal("maybank").colors, companyGlow: pal("maybank").glow,
      hr: { name: "Sarah Tan", title: "Talent Acquisition, Digital Banking", replyRate: 96, avgReply: "~45 min", responseHours: "9 AM – 6 PM", lastSeen: "2 min ago" },
      interview: {
        questions: [
          "Walk me through a dashboard you built that changed a business decision.",
          "How would you detect unusual transaction behaviour in SQL?",
          "Tell me about a time you influenced stakeholders without authority.",
          "Which metric would you defend if the business wanted to change its definition?",
        ],
        aiFrame: "Start with the business goal, define baseline behaviour by segment, use rolling windows and z-scores to flag anomalies, then explain how you would validate false positives with the fraud operations team.",
        activeQ: 1,
        promptLabel: "Question 2 · SQL case interview",
      },
    },
    {
      id: "da-grab-ae",
      company: "Grab", companyId: "grab",
      title: "Analytics Engineer",
      position: "Analytics Engineer",
      location: "Petaling Jaya / Hybrid",
      type: "Full-time",
      salaryLow: 7500, salaryHigh: 11000,
      description: "Own the transformation layer between raw event data and the metrics the business trusts. dbt, BigQuery, and a strong opinion about what a metric means.",
      requirements: ["dbt or equivalent transformation tooling", "Advanced SQL and warehouse modelling", "Python", "Data quality testing"],
      strengths: ["dbt", "Python", "Experimentation"],
      gaps: ["Spark production evidence"],
      companyColors: pal("grab").colors, companyGlow: pal("grab").glow,
      hr: { name: "Daniel Lim", title: "People Operations, Data Team", replyRate: 82, avgReply: "~2.5 hrs", responseHours: "10 AM – 7 PM", lastSeen: "18 min ago" },
      interview: {
        questions: [
          "How do you ensure data quality in a dbt pipeline?",
          "Explain how you would model ride-hailing metrics in a star schema.",
          "Tell me about a time you debugged a pipeline under production pressure.",
          "Product and finance disagree on what an active user is. What do you do?",
        ],
        aiFrame: "Lead with the business metric the pipeline serves, walk through your model layers from staging to marts, then explain the testing strategy: schema tests, freshness checks, and how failures alert someone.",
        activeQ: 0,
        promptLabel: "Question 1 · dbt pipeline design",
      },
    },
    {
      id: "da-shopee-mgr",
      company: "Shopee Malaysia", companyId: "shopee",
      title: "Analytics Manager, Marketplace",
      position: "Analytics Manager",
      location: "Kuala Lumpur",
      type: "Full-time",
      salaryLow: 11000, salaryHigh: 16000,
      description: "Lead a team of four analysts covering marketplace health. You will own what the team measures, what it stops measuring, and how its work reaches the people who act on it.",
      requirements: ["Experience leading or mentoring analysts", "Strong analytical background", "Stakeholder management at director level", "Hiring and performance conversations"],
      strengths: ["Analytical depth", "Stakeholder communication"],
      gaps: ["Direct people management", "Headcount planning"],
      companyColors: pal("shopee").colors, companyGlow: pal("shopee").glow,
      hr: { name: "Nurul Izzati", title: "Regional Talent Acquisition", replyRate: 66, avgReply: "~8 hrs", responseHours: "9 AM – 6 PM", lastSeen: "5 hrs ago" },
      interview: {
        questions: [
          "Tell me about the first time you had to give someone difficult feedback.",
          "How would you decide what your team should stop working on?",
          "A director wants a number you know is misleading. What do you do?",
          "How do you keep your own analytical skills current once you are managing?",
        ],
        aiFrame: "They are testing whether you want to manage or just want the title. Lead with a moment where you chose someone else's growth over your own output — that is the shift, and it is the thing an analyst promotion panel cannot fake.",
        activeQ: 0,
        promptLabel: "Question 1 · People leadership",
      },
    },
    {
      id: "da-petronas",
      company: "Petronas Digital", companyId: "petronas",
      title: "AI Product Analyst",
      position: "AI Product Analyst",
      location: "Kuala Lumpur",
      type: "Full-time",
      salaryLow: 6500, salaryHigh: 9500,
      description: "Sit between the machine-learning teams and the business, deciding what a model is worth and whether it is earning its keep in production.",
      requirements: ["Analytical background", "Understanding of ML evaluation", "Stakeholder communication", "Experiment design"],
      strengths: ["Stakeholder comms", "AI project signal"],
      gaps: ["Product discovery", "Cloud"],
      companyColors: pal("petronas").colors, companyGlow: pal("petronas").glow,
      hr: { name: "Aisha Rahman", title: "HR Business Partner, Digital", replyRate: 68, avgReply: "~6 hrs", responseHours: "9 AM – 5 PM", lastSeen: "3 hrs ago" },
      interview: {
        questions: [
          "How would you measure whether a model is delivering business value?",
          "Walk us through how you would prioritise features for an AI-powered dashboard.",
          "Describe a time you translated a technical finding for a non-technical audience.",
          "How would you run an A/B test on a recommendation engine?",
        ],
        aiFrame: "Frame around the business KPI the model moves, not accuracy. Explain how you would monitor drift, and how you would describe a precision-recall trade-off to someone who does not want the maths.",
        activeQ: 0,
        promptLabel: "Question 1 · ML product evaluation",
      },
    },
  ],
};

/* ── Generic ─────────────────────────────────────────────────── */

/* Postings whose titles come from the user's own target role, so this
   fallback is specific rather than vague. Everything here is true of
   almost any Malaysian employer, which is exactly what a fallback needs. */
const GENERIC_TEMPLATES: {
  key: string; company: string; companyId: string; suffix: string;
  location: string; band: [number, number];
  description: string; requirements: string[];
  strengths: string[]; gaps: string[];
  hr: CorpusHiringContact; interview: CorpusInterview;
}[] = [
  {
    key: "g1", company: "Axiata Group", companyId: "axiata", suffix: "",
    location: "Kuala Lumpur", band: [0.85, 1.10],
    description: "A structured team with a defined progression ladder and formal review cycles. Strong on process, and a reliable place to build a track record.",
    requirements: ["Relevant experience in the role", "Evidence of results you can point to", "Comfortable working across teams", "Clear written communication"],
    strengths: ["Reliability", "Cross-team communication"],
    gaps: ["Formal credential for the role"],
    hr: { name: "Sarah Tan", title: "Talent Acquisition", replyRate: 88, avgReply: "~2 hrs", responseHours: "9 AM – 6 PM", lastSeen: "12 min ago" },
    interview: {
      questions: [
        "Walk me through the result you are proudest of in this role.",
        "Tell me about a time the work went wrong and what you changed afterwards.",
        "How do you decide what to do first when everything is urgent?",
        "What would you need from us in your first three months to do this well?",
      ],
      aiFrame: "Lead with the situation and the number. Most candidates describe what they did; the ones who get offers describe what changed because of it. Name the before and the after.",
      activeQ: 0,
      promptLabel: "Question 1 · Track record",
    },
  },
  {
    key: "g2", company: "Carsome", companyId: "carsome", suffix: "",
    location: "Kuala Lumpur / Hybrid", band: [0.95, 1.25],
    description: "A fast-moving company where scope grows quickly for people who take it. Less structure than a corporate, more room to own something outright.",
    requirements: ["Able to work without close supervision", "Comfortable with ambiguity", "Evidence of taking initiative", "Willing to learn on the job"],
    strengths: ["Initiative", "Adaptability"],
    gaps: ["Depth in one specialism"],
    hr: { name: "Daniel Lim", title: "People Operations", replyRate: 79, avgReply: "~3 hrs", responseHours: "10 AM – 7 PM", lastSeen: "40 min ago" },
    interview: {
      questions: [
        "Tell me about something you started that nobody asked you to start.",
        "How do you work when the brief is unclear?",
        "Describe a time you had to learn something quickly to finish a job.",
        "What part of this role are you least prepared for?",
      ],
      aiFrame: "The last question is the real one. Name a genuine gap and the specific thing you are doing about it — a course, a project, a person you are learning from. Claiming no weaknesses reads as no self-awareness.",
      activeQ: 0,
      promptLabel: "Question 1 · Initiative",
    },
  },
  {
    key: "g3", company: "Shopee Malaysia", companyId: "shopee", suffix: ", Regional",
    location: "Kuala Lumpur", band: [1.00, 1.35],
    description: "Regional scope across Southeast Asia. Higher bar and higher pay, with the expectation that you can operate across markets and time zones.",
    requirements: ["Proven performance in a similar role", "Regional or multi-market exposure preferred", "Strong analytical reasoning", "High ownership"],
    strengths: ["Ownership", "Analytical reasoning"],
    gaps: ["Regional exposure", "Scale experience"],
    hr: { name: "Nurul Izzati", title: "Regional Talent Acquisition", replyRate: 62, avgReply: "~9 hrs", responseHours: "9 AM – 6 PM", lastSeen: "1 day ago" },
    interview: {
      questions: [
        "What is the largest scope you have personally owned?",
        "Tell me about a decision you made with incomplete information.",
        "How would you handle the same work across three markets with different rules?",
        "What would make you turn this role down?",
      ],
      aiFrame: "Scope means people affected, money involved, or decisions you made alone — pick whichever is genuinely largest and quantify it. Vague seniority claims get probed here until they break.",
      activeQ: 0,
      promptLabel: "Question 1 · Scope",
    },
  },
];

/* ── Assembly ────────────────────────────────────────────────── */

const AUTHORED: Partial<Record<RoleFamily, FamilyContent>> = {
  software: SOFTWARE,
  data: DATA,
};

/** Adjacent and lead roles for the families that fall back to generic. */
const GENERIC_TRACKS: Record<RoleFamily, { adjacent: string; lead: string; exec: string; skills: string[]; cert: string }> = {
  software:  { adjacent: "Backend Engineer",       lead: "Engineering Team Lead", exec: "Head of Engineering",     skills: ["System design", "Testing", "CI/CD"], cert: "AWS Certified Developer – Associate" },
  data:      { adjacent: "Analytics Engineer",     lead: "Data Science Manager", exec: "Head of Data",      skills: ["Data modelling", "Pipelines"],      cert: "AWS Certified Data Engineer – Associate" },
  design:    { adjacent: "Product Designer",       lead: "Design Lead", exec: "Head of Design",               skills: ["Design systems", "User research", "Prototyping"], cert: "A published end-to-end case study" },
  marketing: { adjacent: "Performance Marketer",   lead: "Marketing Manager", exec: "Head of Marketing",         skills: ["Paid acquisition", "Analytics", "Copywriting"],  cert: "Google Ads Search Certification" },
  product:   { adjacent: "Product Owner",          lead: "Head of Product", exec: "VP Product",           skills: ["Discovery", "Roadmapping", "Metrics"],           cert: "A shipped-product case study" },
  business:  { adjacent: "Key Account Manager",    lead: "Sales Manager", exec: "Head of Sales",             skills: ["Pipeline management", "Negotiation", "CRM discipline"], cert: "A professional licence or registration" },
  service:   { adjacent: "Shift Supervisor",       lead: "Operations Manager", exec: "Regional Operations Manager",        skills: ["Team scheduling", "Service standards", "Stock control"], cert: "A recognised trade or safety certification" },
  generic:   { adjacent: "Senior specialist track", lead: "Team Manager", exec: "Head of Department",             skills: ["Planning", "Communication", "Ownership"],        cert: "A role-relevant certification" },
};

function titleCase(role: string): string {
  return role.replace(/\s+/g, " ").trim();
}

/** Build the generic family content around whatever the user is aiming at. */
function buildGeneric(profile: CareerProfile, family: RoleFamily, band: SeniorityBand): FamilyContent {
  const target = titleCase(profile.targetRole || profile.currentRole || "the role you want");
  const median = marketMedian(family, band);
  const track = GENERIC_TRACKS[family];

  return {
    family,
    adjacentRole: track.adjacent,
    leadRole: track.lead,
    execRole: track.exec,
    foundationSkills: ["What you already do daily", "Communication", "Reliability"],
    targetSkills: track.skills,
    certification: track.cert,
    transitionMonths: [6, 12],
    evidenceSamples: [
      { kind: "experience", title: `Documented results from your ${titleCase(profile.currentRole || "current")} work`, issuer: "Your employer", detail: "Numbers you can defend beat adjectives every time." },
      { kind: "certificate", title: track.cert, issuer: "Recognised issuer", detail: keyCredential(family) + " is the usual gate into this family." },
      { kind: "project", title: `A piece of work that looks like ${target}`, issuer: "Self-directed", detail: "Do the target job once, unpaid if necessary, so the resume is not purely aspirational." },
    ],
    jobs: GENERIC_TEMPLATES.map(t => ({
      id: `gen-${t.key}`,
      company: t.company,
      companyId: t.companyId,
      title: `${target}${t.suffix}`,
      position: target,
      location: t.location,
      type: "Full-time",
      salaryLow: Math.round((median * t.band[0]) / 100) * 100,
      salaryHigh: Math.round((median * t.band[1]) / 100) * 100,
      description: t.description,
      requirements: t.requirements,
      strengths: t.strengths,
      gaps: t.gaps,
      companyColors: pal(t.companyId).colors,
      companyGlow: pal(t.companyId).glow,
      hr: t.hr,
      interview: t.interview,
    })),
  };
}

/* ── Futures ─────────────────────────────────────────────────── */

export interface CorpusFuture {
  id: "stay" | "target" | "promotion" | "study";
  label: string;
  role: string;
  tagline: string;
  color: string;
  dotColor: string;
  borderColor: string;
  bgColor: string;
  emoji: string;
  story: string;
  oneYear: string;
  threeYear: string;
  fiveYear: string;
  /** Monthly RM at year five. */
  salary5yr: number;
  /** Share of the role's tasks exposed to automation, as a percentage. */
  aiRiskPct: number;
  promotionOddsPct: number;
  satisfaction: string;
  satisfactionTone: "good" | "mixed" | "poor";
  /** Ten points: now, 6mo, 1yr, 18mo, 2yr, 2.5yr, 3yr, 3.5yr, 4yr, 5yr. */
  salaryData: number[];
  pros: string[];
  cons: string[];
  aiVerdict: string;
  confidence: number;
}

export const TIMELINE_LABELS = ["Now", "6mo", "1yr", "18mo", "2yr", "2.5yr", "3yr", "3.5yr", "4yr", "5yr"];

const round100 = (n: number) => Math.round(n / 100) * 100;

/** No job to stay in, so "stay put" is not one of their options. */
export function isStudent(profile: CareerProfile): boolean {
  const t = `${profile.userType} ${profile.currentRole}`.toLowerCase();
  return /student|learner|no job yet|fresh grad|graduate|undergrad/.test(t);
}

/** Ten-point curve from `from` to `to`, easing so growth front-loads or not. */
function curve(from: number, to: number, shape: "flat" | "climb" | "late"): number[] {
  const t = [0, 0.06, 0.14, 0.24, 0.36, 0.48, 0.60, 0.73, 0.86, 1];
  return t.map(x => {
    const e = shape === "flat" ? x : shape === "climb" ? Math.pow(x, 0.75) : Math.pow(x, 1.35);
    return round100(from + (to - from) * e);
  });
}

/* Exposure by band. A junior does more of the work that tooling absorbs
   first; a senior spends more time on judgement calls that it does not. */
const BAND_EXPOSURE: [number, number, number] = [1.18, 1.0, 0.74];

function riskAt(family: RoleFamily, band: SeniorityBand): number {
  return Math.max(8, Math.min(92, Math.round(automationBase(family) * BAND_EXPOSURE[band] * 100)));
}

const fmtRM = (n: number) => `RM ${(n / 1000).toFixed(1)}k/mo`;

/**
 * The three paths open to this person, derived from where they are and
 * where they said they want to go — not a fixed list of three roles.
 */
export function buildFutures(profile: CareerProfile, content: FamilyContent): CorpusFuture[] {
  const currentFamily = detectRoleFamily(profile.currentRole) === "generic"
    ? content.family
    : detectRoleFamily(profile.currentRole);
  const targetFamily = detectRoleFamily(profile.targetRole) === "generic"
    ? content.family
    : detectRoleFamily(profile.targetRole);

  const band = seniorityBand(profile);
  const nextBand: SeniorityBand = band === 2 ? 2 : (band + 1) as SeniorityBand;

  const currentRole = titleCase(profile.currentRole) || "your current role";
  const targetRole = titleCase(profile.targetRole) || "your target role";
  /* Future C is the promotion track, not a sideways move — people
     comparing careers want to know where the ladder goes. */
  const promotionRole = content.leadRole.toLowerCase() === targetRole.toLowerCase()
    ? content.execRole
    : content.leadRole;

  /* Start from what they actually earn where that is known; fall back to
     the family median for their band. */
  const startPay = parseStart(profile) ?? marketMedian(currentFamily, band);
  const stayPay = round100(Math.max(startPay * 1.14, marketMedian(currentFamily, band) * 1.05));
  const targetPay = round100(Math.max(marketMedian(targetFamily, nextBand), startPay * 1.45));
  const promotionPay = round100(marketMedian(targetFamily, 2) * 1.08);

  /* Family sets the baseline, seniority modulates it. Within one family
     the junior tasks are the ones tooling takes first, which is why
     staying put is exposed even when the move is sideways in family. */
  const stayRisk = riskAt(currentFamily, band);
  const targetRisk = riskAt(targetFamily, nextBand);
  const [lo, hi] = content.transitionMonths;

  if (isStudent(profile)) {
    /* Postgraduate study costs two years of earning and a year of
       compounding, and the payoff is a higher entry band — not a
       shortcut. Both sides are shown that way. */
    const directPay = round100(marketMedian(targetFamily, nextBand));
    const studyPay = round100(marketMedian(targetFamily, nextBand) * 1.12);
    return [
      {
        id: "target",
        label: "Future A",
        role: targetRole,
        tagline: `You go straight for ${targetRole}.`,
        color: "#22C55E", dotColor: "bg-emerald-500", borderColor: "border-emerald-200", bgColor: "bg-emerald-50",
        emoji: "🚀",
        story: `You start applying now and learn on someone else's payroll. The first job is the hardest one to get; everything after it is easier because you have a track record instead of a transcript.`,
        oneYear: `You take an entry offer around ${fmtRM(round100(marketMedian(targetFamily, 0)))}. The work is less interesting than you hoped and you learn faster than you expected.`,
        threeYear: `Three years of real projects behind you, on about ${fmtRM(curve(round100(marketMedian(targetFamily, 0)), directPay, "climb")[6])}. Employers are reading your work, not your grades.`,
        fiveYear: `You are on roughly ${fmtRM(directPay)} — and the people who studied for two more years are just now catching up to where you already are.`,
        salary5yr: directPay,
        aiRiskPct: targetRisk,
        promotionOddsPct: 62,
        satisfaction: "High",
        satisfactionTone: "good",
        salaryData: curve(round100(marketMedian(targetFamily, 0)), directPay, "climb"),
        pros: ["Earning three years earlier", "Evidence beats a transcript at every interview after the first", "No debt"],
        cons: ["The first job is the hardest to get", "Some employers still gate on a postgraduate degree", "You learn what your employer needs, not what you choose"],
        aiVerdict: `For most ${FAMILY_LABEL[targetFamily].toLowerCase()} roles in Malaysia this is the stronger move. Experience compounds and a degree does not — unless the specific route you want is gated on one.`,
        confidence: 81,
      },
      {
        id: "study",
        label: "Future B",
        role: `Master's, then ${targetRole}`,
        tagline: `You study first, then go for ${targetRole}.`,
        color: "#4F46E5", dotColor: "bg-indigo-500", borderColor: "border-indigo-200", bgColor: "bg-indigo-50",
        emoji: "🎓",
        story: `Two more years of study before you start. It buys depth, a research network, and access to the routes that genuinely require the qualification — and it costs you two years of earning and the compounding that comes with it.`,
        oneYear: `You are studying, not earning. Your peers who started working are on about ${fmtRM(round100(marketMedian(targetFamily, 0)))} while you are paying fees.`,
        threeYear: `You graduate and enter one band higher, at roughly ${fmtRM(round100(marketMedian(targetFamily, nextBand) * 0.9))}. The gap to the people who started working is smaller than it looks, because they have three years of evidence.`,
        fiveYear: `You are on about ${fmtRM(studyPay)} — ahead on paper, and roughly level once you count the two years you did not earn.`,
        salary5yr: studyPay,
        aiRiskPct: Math.max(12, targetRisk - 6),
        promotionOddsPct: 58,
        satisfaction: "Steady",
        satisfactionTone: "mixed",
        salaryData: curve(0, studyPay, "late"),
        pros: ["Opens routes that genuinely require the qualification", "Deeper foundation than on-the-job learning gives", "A research network you cannot get otherwise"],
        cons: ["Two years without income, plus fees", "Most employers hire on evidence, not the certificate", "You are still competing with people who have three years of work"],
        aiVerdict: `Worth it when the specific thing you want is gated on the degree — research, some public-sector routes, some specialist work. Doing it because you are not ready to apply yet is the expensive version of waiting.`,
        confidence: 74,
      },
    ];
  }

  return [
    {
      id: "stay",
      label: "Future A",
      role: currentRole,
      tagline: `You stay a ${currentRole}.`,
      color: "#3B82F6", dotColor: "bg-blue-500", borderColor: "border-blue-200", bgColor: "bg-blue-50",
      emoji: "⏸️",
      story: `You continue as a ${currentRole}. No dramatic changes, reasonable raises, familiar work. On the surface it is the safe option.`,
      oneYear: `Pay reaches about ${fmtRM(curve(startPay, stayPay, "flat")[2])} on a standard review cycle. The work stays manageable — but the tools your team adopted this year already handle a slice of what you used to own.`,
      threeYear: `Your title has not changed and your scope has narrowed slightly. You are still employed and still competent. Two people junior to you moved into different tracks.`,
      fiveYear: `You are earning about ${fmtRM(stayPay)}. Peers who moved are on roughly ${fmtRM(targetPay)}. You are good at this job — but you stopped growing in it, and you know it.`,
      salary5yr: stayPay,
      aiRiskPct: stayRisk,
      promotionOddsPct: Math.max(12, 40 - Math.round(stayRisk * 0.4)),
      satisfaction: "Declining",
      satisfactionTone: "mixed",
      salaryData: curve(startPay, stayPay, "flat"),
      pros: ["Zero transition risk", "Familiar environment", "Relationships already built"],
      cons: [`Automation exposure stays at ${stayRisk}%`, "A pay gap that widens each year", "A hardening promotion ceiling"],
      aiVerdict: `This path is less safe than it feels. At ${stayRisk}% automation exposure the decline is gradual enough to miss, and hard to reverse once it is obvious. The regret risk is highest here.`,
      confidence: 88,
    },
    {
      id: "target",
      label: "Future B",
      role: targetRole,
      tagline: `You move into ${targetRole}.`,
      color: "#22C55E", dotColor: "bg-emerald-500", borderColor: "border-emerald-200", bgColor: "bg-emerald-50",
      emoji: "🚀",
      story: `You spend the next ${lo}–${hi} months closing the gap to ${targetRole}. It is uncomfortable at first, then it accelerates — your ${content.foundationSkills.slice(0, 2).join(" and ")} carry over and cut months off the curve.`,
      oneYear: `You finish ${content.certification} and ship the evidence to prove it. You start applying. The interviews are harder than your current job and you get rejected before you get an offer — around ${fmtRM(curve(startPay, targetPay, "climb")[2])}.`,
      threeYear: `Eighteen months into the new role your skills are compounding faster than they ever did before. You are on about ${fmtRM(curve(startPay, targetPay, "climb")[6])} and being handed work above your title.`,
      fiveYear: `You are earning about ${fmtRM(targetPay)} with automation exposure at ${targetRisk}% — you are working with the tools rather than being displaced by them.`,
      salary5yr: targetPay,
      aiRiskPct: targetRisk,
      promotionOddsPct: Math.min(82, 45 + Math.round((stayRisk - targetRisk) * 0.6)),
      satisfaction: "High",
      satisfactionTone: "good",
      salaryData: curve(startPay, targetPay, "climb"),
      pros: [`About ${fmtRM(targetPay - stayPay)} more than staying`, `Automation exposure drops to ${targetRisk}%`, "Skills that keep compounding"],
      cons: [`${lo}–${hi} months of real effort`, "Rejection before the offer", "The uncomfortable stretch of being new again"],
      aiVerdict: `This is the best risk-adjusted move on the board. Your ${content.foundationSkills[0]} foundation shortens the transition, and the gap that remains is closable with ${content.certification} plus shipped evidence.`,
      confidence: 84,
    },
    {
      id: "promotion",
      label: "Future C",
      role: promotionRole,
      tagline: `You go past ${targetRole} to ${promotionRole}.`,
      color: "#A855F7", dotColor: "bg-purple-500", borderColor: "border-purple-200", bgColor: "bg-purple-50",
      emoji: "📈",
      story: `The same first move, then one more. ${targetRole} is the door; ${promotionRole} is what the door leads to — and the people who get there decide early that they are aiming past the first job, not at it.`,
      oneYear: `Identical to Future B for the first year — you still have to get into ${targetRole} first. The difference is what you take on once you are there: scope other people depend on, not just work you finish.`,
      threeYear: `You are being handed responsibility above your title, on about ${fmtRM(curve(startPay, promotionPay, "late")[6])}. This is the year the two paths separate.`,
      fiveYear: `You are on roughly ${fmtRM(promotionPay)} as ${promotionRole}, with automation exposure at its lowest — deciding what gets built is the last thing to be automated.`,
      salary5yr: promotionPay,
      aiRiskPct: Math.max(10, targetRisk - 12),
      promotionOddsPct: Math.min(74, 40 + Math.round((stayRisk - targetRisk) * 0.5)),
      satisfaction: "Mixed",
      satisfactionTone: "mixed",
      salaryData: curve(startPay, promotionPay, "late"),
      pros: ["The highest ceiling of the three", "Lowest automation exposure", "Compounding influence, not just skill"],
      cons: ["The longest runway", "Less hands-on work than you may want", `A different job from ${targetRole}, not a bigger one`],
      aiVerdict: `The highest ceiling and the longest wait. It needs you to be deliberate rather than merely good — most people underestimate how different leading is from doing, and find that out after they have taken the job.`,
      confidence: 79,
    },
  ];
}

function parseStart(profile: CareerProfile): number | null {
  const nums = [...(profile.salaryRange ?? "").matchAll(/\d[\d,]*(?:\.\d+)?/g)]
    .map(m => parseFloat(m[0].replace(/,/g, "")))
    .map(n => (n < 100 ? n * 1000 : n))
    .filter(n => n >= 800 && n <= 100000);
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

/* ── Salary landscape ────────────────────────────────────────── */

export interface LandscapeCompany {
  company: string;
  min: number;
  max: number;
  median: number;
  color: string;
  glow: string;
}

export interface LandscapePosition {
  id: string;
  position: string;
  /** What this profile currently earns, where that is known. */
  yourPay: number | null;
  marketMedian: number;
  companies: LandscapeCompany[];
}

/* Employers pay a fairly stable multiple of the market median for a
   role, so the landscape is one median times a per-employer factor
   rather than seven hand-typed bands per role. Spread is the width of
   each employer's band around its own median. */
const EMPLOYERS: { company: string; factor: number; spread: number; color: string; glow: string }[] = [
  { company: "Grab",             factor: 1.18, spread: 0.26, color: "#2E7D32", glow: "rgba(46,125,50,0.2)" },
  { company: "Shopee",           factor: 1.12, spread: 0.24, color: "#E65100", glow: "rgba(230,81,0,0.2)" },
  { company: "TNG Digital",      factor: 1.06, spread: 0.22, color: "#00695C", glow: "rgba(0,105,92,0.2)" },
  { company: "Petronas Digital", factor: 1.02, spread: 0.20, color: "#0D47A1", glow: "rgba(13,71,161,0.2)" },
  { company: "Maybank",          factor: 0.98, spread: 0.18, color: "#FFB300", glow: "rgba(255,179,0,0.25)" },
  { company: "CIMB",             factor: 0.93, spread: 0.18, color: "#C62828", glow: "rgba(198,40,40,0.2)" },
  { company: "Axiata",           factor: 0.90, spread: 0.16, color: "#4527A0", glow: "rgba(69,39,160,0.15)" },
];

/**
 * What each of the three futures pays across the market, for the bar
 * race. Positions follow the futures, so the comparison is always
 * between roles this person is actually choosing among.
 */
export function buildSalaryLandscape(profile: CareerProfile, futures: CorpusFuture[]): LandscapePosition[] {
  const yourPay = parseStart(profile);
  return futures.map(f => {
    /* Year-five pay is the endpoint of a five-year climb; the market
       median for that role today is what the bars should compare against. */
    const median = round100(f.salary5yr * 0.86);
    return {
      id: f.id,
      position: f.role,
      yourPay,
      marketMedian: median,
      companies: EMPLOYERS.map(e => {
        const m = round100(median * e.factor);
        return {
          company: e.company,
          median: m,
          min: round100(m * (1 - e.spread / 2)),
          max: round100(m * (1 + e.spread / 2)),
          color: e.color,
          glow: e.glow,
        };
      }),
    };
  });
}

/* ── Fit scoring ─────────────────────────────────────────────── */

/** Deterministic 0–100 fit between a profile and one posting. */
export function fitFor(profile: CareerProfile, job: CorpusJob): number {
  const target = (profile.targetRole || "").toLowerCase();
  const current = (profile.currentRole || "").toLowerCase();
  const position = job.position.toLowerCase();

  let score = 52;

  // Aiming at exactly this role is the strongest single signal.
  if (target && position.includes(target)) score += 24;
  else if (target && overlaps(target, position)) score += 14;

  /* Doing something close means the résumé reads correctly for it. But
     a posting for the role they already hold is not progress, so the
     credit is small and the ranking below discounts it separately. */
  if (current && position.includes(current)) score += 4;
  else if (current && overlaps(current, position)) score += 6;

  // Evidence is what turns a claim into a match.
  score += Math.min(12, profile.evidence.length * 4);
  if (profile.resume) score += 4;

  // Pay expectation far above the band reads as a stretch application.
  const pay = parseStart(profile);
  if (pay !== null) {
    if (pay > job.salaryHigh * 1.15) score -= 8;
    else if (pay < job.salaryLow * 0.85) score += 3;
  }

  return Math.max(38, Math.min(97, Math.round(score)));
}

/**
 * How far a posting moves this person toward the role they named.
 *
 * Readiness alone ranked the job they already have at the top — they are
 * of course most ready for it, and it is of no use to someone trying to
 * move. Ranking multiplies readiness by this, so "can I get it" and
 * "does it take me anywhere" both count.
 */
export function advancementFor(profile: CareerProfile, job: CorpusJob): number {
  const target = (profile.targetRole || "").toLowerCase();
  const current = (profile.currentRole || "").toLowerCase();
  const position = job.position.toLowerCase();

  if (!target) return 0.7;
  if (position.includes(target) || target.includes(position)) return 1;
  /* The role they already hold: a sideways move, worth something —
     a better employer is a real reason — but not the point. */
  if (current && (position.includes(current) || current.includes(position))) return 0.35;
  if (overlaps(target, position)) return 0.8;
  return 0.55;
}

/** Chance of converting an application into an offer, given the fit. */
export function successChanceFor(profile: CareerProfile, job: CorpusJob): number {
  const fit = fitFor(profile, job);
  const evidenceBoost = Math.min(10, profile.evidence.length * 3);
  return Math.max(28, Math.min(92, Math.round(fit * 0.82 + evidenceBoost)));
}

function overlaps(a: string, b: string): boolean {
  const stop = new Set(["the", "and", "of", "a", "senior", "junior", "lead"]);
  const wa = a.split(/[^a-z]+/).filter(w => w.length > 2 && !stop.has(w));
  const wb = new Set(b.split(/[^a-z]+/).filter(w => w.length > 2 && !stop.has(w)));
  return wa.some(w => wb.has(w));
}

/* ── Application angle ───────────────────────────────────────── */

export interface JobAngle {
  /** What to point the resume at. */
  focus: string;
  /** The opening line of the cover letter. */
  hook: string;
  /** The argument paragraph. */
  body: string;
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/**
 * How to pitch one profile at one posting.
 *
 * This used to be a lookup table keyed by three job ids. Any posting
 * outside those three — which is every posting for most users — fell to
 * a single generic paragraph. Deriving it from the posting's own stated
 * requirements means it is specific for every job in every family.
 */
export function angleFor(profile: CareerProfile, job: CorpusJob): JobAngle {
  const top = job.requirements.slice(0, 2).map(lower);
  const focus = top.length ? top.join(" and ") : lower(job.position);
  const from = profile.resume?.currentTitle || profile.currentRole;
  const skills = profile.resume?.skills ?? [];
  const overlap = skills.filter(sk =>
    job.requirements.some(r => r.toLowerCase().includes(sk.toLowerCase())),
  );

  return {
    focus,
    hook: `${job.company} is hiring for exactly the work I am moving toward, and ${lower(job.strengths[0] ?? job.position)} is where I do my best work.`,
    body: [
      from
        ? `I come to this from ${from}, where the day-to-day already overlaps with what this role asks for.`
        : `I am early in my career and deliberate about where it goes; this role is the direction I have been building toward.`,
      overlap.length
        ? `The overlap with your requirements is direct — ${overlap.slice(0, 4).join(", ")} — and the rest I can evidence rather than claim.`
        : `Where I do not yet match a requirement I would rather say so than pad it: ${lower(job.gaps[0] ?? "the gaps are narrow")} is what I am closing now.`,
    ].join(" "),
  };
}

/* ── Entry point ─────────────────────────────────────────────── */

export interface Corpus extends FamilyContent {
  /** Jobs ranked against this profile, best fit first. */
  rankedJobs: (CorpusJob & { fit: number; successChance: number; advancement: number })[];
  futures: CorpusFuture[];
  salaryLandscape: LandscapePosition[];
}

/**
 * Everything the role-specific pages need, for this profile.
 *
 * The family comes from the current role first and the target role
 * second, matching detectRoleFamily's contract — but a student with no
 * current role is classified by where they are heading.
 */
export function corpusFor(profile: CareerProfile): Corpus {
  const family = detectRoleFamily(profile.currentRole, profile.targetRole);
  const band = seniorityBand(profile);
  const content = AUTHORED[family] ?? buildGeneric(profile, family, band);

  const rankedJobs = content.jobs
    .map(job => ({
      ...job,
      fit: fitFor(profile, job),
      successChance: successChanceFor(profile, job),
      advancement: advancementFor(profile, job),
    }))
    /* Readiness weighted by whether the job takes them anywhere. */
    .sort((a, b) =>
      (b.fit * (0.55 + b.advancement * 0.45)) - (a.fit * (0.55 + a.advancement * 0.45))
      || a.company.localeCompare(b.company));

  const futures = buildFutures(profile, content);
  return { ...content, rankedJobs, futures, salaryLandscape: buildSalaryLandscape(profile, futures) };
}

/** Look one job up by id, across every family, for pages given only an id. */
export function jobById(profile: CareerProfile, id: string | null | undefined): CorpusJob | undefined {
  if (!id) return undefined;
  const corpus = corpusFor(profile);
  return corpus.rankedJobs.find(j => j.id === id)
    ?? SOFTWARE.jobs.find(j => j.id === id)
    ?? DATA.jobs.find(j => j.id === id);
}

export { SOFTWARE as SOFTWARE_CONTENT, DATA as DATA_CONTENT };
