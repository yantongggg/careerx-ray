import { useState, useEffect, useRef } from "react";
import { Maximize2, Minimize2, RotateCcw, ChevronDown } from "lucide-react";

const TAU = Math.PI * 2;

/* ── Data model ── */

interface Company {
  id: string;
  label: string;
  colors: string[];     // gradient for the sun
  glow: string;
  positions: Position[];
}

interface Position {
  id: string;
  label: string;
  skills: { skillId: string; fit: number }[];   // fit 0-100
  gaps: { skillId: string; importance: number }[]; // skills candidate lacks
}

interface Skill {
  id: string;
  label: string;
  proficiency: number;  // 0-100
  category: "technical" | "data" | "soft";
  colors: string[];
  glow: string;
}

const SKILLS: Skill[] = [
  { id: "sql",       label: "SQL",         proficiency: 95, category: "data",      colors: ["#64B5F6","#1565C0","#0D47A1"], glow: "rgba(100,181,246,0.5)" },
  { id: "python",    label: "Python",      proficiency: 90, category: "technical", colors: ["#4DB6AC","#00897B","#004D40"], glow: "rgba(77,182,172,0.5)" },
  { id: "tableau",   label: "Tableau",     proficiency: 80, category: "data",      colors: ["#FF8A65","#E64A19","#BF360C"], glow: "rgba(255,138,101,0.45)" },
  { id: "storytell", label: "Storytelling", proficiency: 85, category: "soft",      colors: ["#CE93D8","#8E24AA","#4A148C"], glow: "rgba(206,147,216,0.45)" },
  { id: "powerbi",   label: "Power BI",    proficiency: 70, category: "data",      colors: ["#FFF176","#F9A825","#F57F17"], glow: "rgba(255,241,118,0.4)" },
  { id: "dbt",       label: "dbt",         proficiency: 60, category: "technical", colors: ["#80DEEA","#00ACC1","#006064"], glow: "rgba(128,222,234,0.4)" },
  { id: "bigquery",  label: "BigQuery",    proficiency: 60, category: "data",      colors: ["#A5D6A7","#2E7D32","#1B5E20"], glow: "rgba(165,214,167,0.35)" },
  { id: "teamwork",  label: "Teamwork",    proficiency: 70, category: "soft",      colors: ["#FFAB91","#D84315","#BF360C"], glow: "rgba(255,171,145,0.35)" },
  { id: "excel",     label: "Excel",       proficiency: 70, category: "data",      colors: ["#C5E1A5","#558B2F","#33691E"], glow: "rgba(197,225,165,0.3)" },
  { id: "leadership",label: "Leadership",  proficiency: 50, category: "soft",      colors: ["#EF9A9A","#C62828","#B71C1C"], glow: "rgba(239,154,154,0.3)" },
];

const COMPANIES: Company[] = [
  {
    id: "maybank", label: "Maybank",
    colors: ["#FFF8E1","#FFB300","#FF8F00","#E65100"], glow: "rgba(255,179,0,0.5)",
    positions: [
      { id: "mb-da", label: "Data Analyst", skills: [
        { skillId: "sql", fit: 95 }, { skillId: "python", fit: 72 }, { skillId: "tableau", fit: 85 }, { skillId: "excel", fit: 60 }, { skillId: "storytell", fit: 65 },
      ], gaps: [{ skillId: "aws", importance: 40 }] },
      { id: "mb-bi", label: "BI Associate", skills: [
        { skillId: "powerbi", fit: 90 }, { skillId: "sql", fit: 80 }, { skillId: "excel", fit: 75 }, { skillId: "tableau", fit: 60 },
      ], gaps: [{ skillId: "spark", importance: 35 }] },
    ],
  },
  {
    id: "grab", label: "Grab",
    colors: ["#E8F5E9","#66BB6A","#2E7D32","#1B5E20"], glow: "rgba(102,187,106,0.5)",
    positions: [
      { id: "gr-ae", label: "Analytics Engineer", skills: [
        { skillId: "sql", fit: 88 }, { skillId: "dbt", fit: 92 }, { skillId: "python", fit: 80 }, { skillId: "bigquery", fit: 75 },
      ], gaps: [{ skillId: "k8s", importance: 55 }, { skillId: "docker", importance: 50 }] },
      { id: "gr-mle", label: "ML Engineer", skills: [
        { skillId: "python", fit: 95 },
      ], gaps: [{ skillId: "aws", importance: 85 }, { skillId: "mlops", importance: 90 }, { skillId: "docker", importance: 70 }, { skillId: "k8s", importance: 60 }] },
    ],
  },
  {
    id: "shopee", label: "Shopee",
    colors: ["#FBE9E7","#FF7043","#D84315","#BF360C"], glow: "rgba(255,112,67,0.5)",
    positions: [
      { id: "sp-bi", label: "BI Associate", skills: [
        { skillId: "powerbi", fit: 85 }, { skillId: "sql", fit: 78 }, { skillId: "excel", fit: 70 },
      ], gaps: [{ skillId: "spark", importance: 45 }] },
      { id: "sp-pm", label: "Product Analyst", skills: [
        { skillId: "storytell", fit: 92 }, { skillId: "sql", fit: 65 }, { skillId: "tableau", fit: 75 }, { skillId: "teamwork", fit: 60 },
      ], gaps: [] },
    ],
  },
  {
    id: "petronas", label: "Petronas Digital",
    colors: ["#E3F2FD","#42A5F5","#1565C0","#0D47A1"], glow: "rgba(66,165,245,0.5)",
    positions: [
      { id: "pt-da", label: "Data Analyst", skills: [
        { skillId: "sql", fit: 90 }, { skillId: "python", fit: 78 }, { skillId: "tableau", fit: 82 }, { skillId: "storytell", fit: 55 },
      ], gaps: [{ skillId: "aws", importance: 50 }] },
      { id: "pt-mle", label: "ML Engineer", skills: [
        { skillId: "python", fit: 92 },
      ], gaps: [{ skillId: "mlops", importance: 88 }, { skillId: "docker", importance: 65 }, { skillId: "aws", importance: 80 }] },
    ],
  },
  {
    id: "deloitte", label: "Deloitte",
    colors: ["#F3E5F5","#AB47BC","#7B1FA2","#4A148C"], glow: "rgba(171,71,188,0.5)",
    positions: [
      { id: "dl-ae", label: "Analytics Engineer", skills: [
        { skillId: "sql", fit: 85 }, { skillId: "dbt", fit: 88 }, { skillId: "python", fit: 75 }, { skillId: "bigquery", fit: 70 },
      ], gaps: [{ skillId: "k8s", importance: 40 }] },
      { id: "dl-pm", label: "Product Analyst", skills: [
        { skillId: "storytell", fit: 90 }, { skillId: "tableau", fit: 80 }, { skillId: "teamwork", fit: 72 }, { skillId: "leadership", fit: 55 },
      ], gaps: [] },
    ],
  },
];

const GAP_SKILLS: Record<string, { label: string; colors: string[]; glow: string }> = {
  aws:    { label: "AWS",        colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.5)" },
  docker: { label: "Docker",     colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.45)" },
  mlops:  { label: "MLOps",      colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.45)" },
  k8s:    { label: "Kubernetes",  colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.4)" },
  spark:  { label: "Spark",      colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.4)" },
};

/* ── Role families: skills + Malaysian employer sets per target-role family ── */

const RED = ["#EF5350","#C62828"];
const gapDef = (label: string, o = 0.45) => ({ label, colors: RED, glow: `rgba(239,83,80,${o})` });

const CREATIVE_SKILLS: Skill[] = [
  { id: "figma",      label: "Figma",          proficiency: 92, category: "technical", colors: ["#64B5F6","#1565C0","#0D47A1"], glow: "rgba(100,181,246,0.5)" },
  { id: "ui",         label: "UI Design",      proficiency: 88, category: "technical", colors: ["#4DB6AC","#00897B","#004D40"], glow: "rgba(77,182,172,0.5)" },
  { id: "proto",      label: "Prototyping",    proficiency: 82, category: "technical", colors: ["#FF8A65","#E64A19","#BF360C"], glow: "rgba(255,138,101,0.45)" },
  { id: "research",   label: "User Research",  proficiency: 75, category: "soft",      colors: ["#CE93D8","#8E24AA","#4A148C"], glow: "rgba(206,147,216,0.45)" },
  { id: "designsys",  label: "Design Systems", proficiency: 70, category: "technical", colors: ["#FFF176","#F9A825","#F57F17"], glow: "rgba(255,241,118,0.4)" },
  { id: "motion",     label: "Motion Design",  proficiency: 60, category: "technical", colors: ["#80DEEA","#00ACC1","#006064"], glow: "rgba(128,222,234,0.4)" },
  { id: "illust",     label: "Illustration",   proficiency: 65, category: "technical", colors: ["#A5D6A7","#2E7D32","#1B5E20"], glow: "rgba(165,214,167,0.35)" },
  { id: "uxwriting",  label: "UX Writing",     proficiency: 55, category: "soft",      colors: ["#FFAB91","#D84315","#BF360C"], glow: "rgba(255,171,145,0.35)" },
  { id: "teamwork",   label: "Teamwork",       proficiency: 70, category: "soft",      colors: ["#C5E1A5","#558B2F","#33691E"], glow: "rgba(197,225,165,0.3)" },
  { id: "leadership", label: "Leadership",     proficiency: 50, category: "soft",      colors: ["#EF9A9A","#C62828","#B71C1C"], glow: "rgba(239,154,154,0.3)" },
];

const CREATIVE_GAPS: Record<string, { label: string; colors: string[]; glow: string }> = {
  htmlcss: gapDef("HTML/CSS", 0.5),
  webflow: gapDef("Webflow"),
  threed:  gapDef("Blender 3D"),
  a11y:    gapDef("Accessibility", 0.4),
  aitools: gapDef("AI Design Tools", 0.4),
};

const CREATIVE_COMPANIES: Company[] = [
  {
    id: "grabdesign", label: "Grab Design",
    colors: ["#E8F5E9","#66BB6A","#2E7D32","#1B5E20"], glow: "rgba(102,187,106,0.5)",
    positions: [
      { id: "gd-pd", label: "Product Designer", skills: [
        { skillId: "figma", fit: 95 }, { skillId: "ui", fit: 88 }, { skillId: "designsys", fit: 82 }, { skillId: "proto", fit: 80 }, { skillId: "research", fit: 70 },
      ], gaps: [{ skillId: "htmlcss", importance: 45 }] },
      { id: "gd-ur", label: "UX Researcher", skills: [
        { skillId: "research", fit: 92 }, { skillId: "uxwriting", fit: 70 }, { skillId: "teamwork", fit: 65 }, { skillId: "figma", fit: 60 },
      ], gaps: [{ skillId: "a11y", importance: 55 }] },
    ],
  },
  {
    id: "airasiamove", label: "AirAsia MOVE",
    colors: ["#FFEBEE","#EF5350","#C62828","#B71C1C"], glow: "rgba(239,83,80,0.5)",
    positions: [
      { id: "am-ux", label: "UI/UX Designer", skills: [
        { skillId: "figma", fit: 90 }, { skillId: "ui", fit: 85 }, { skillId: "proto", fit: 78 }, { skillId: "motion", fit: 60 },
      ], gaps: [{ skillId: "webflow", importance: 40 }] },
      { id: "am-mo", label: "Motion Designer", skills: [
        { skillId: "motion", fit: 90 }, { skillId: "illust", fit: 75 }, { skillId: "figma", fit: 55 },
      ], gaps: [{ skillId: "threed", importance: 80 }, { skillId: "aitools", importance: 50 }] },
    ],
  },
  {
    id: "fave", label: "Fave",
    colors: ["#FCE4EC","#EC407A","#C2185B","#880E4F"], glow: "rgba(236,64,122,0.5)",
    positions: [
      { id: "fv-pd", label: "Product Designer", skills: [
        { skillId: "figma", fit: 88 }, { skillId: "ui", fit: 82 }, { skillId: "proto", fit: 75 }, { skillId: "research", fit: 60 },
      ], gaps: [{ skillId: "htmlcss", importance: 50 }] },
      { id: "fv-bd", label: "Brand Designer", skills: [
        { skillId: "illust", fit: 85 }, { skillId: "ui", fit: 70 }, { skillId: "motion", fit: 55 },
      ], gaps: [{ skillId: "threed", importance: 45 }] },
    ],
  },
  {
    id: "mindvalley", label: "Mindvalley",
    colors: ["#F3E5F5","#AB47BC","#7B1FA2","#4A148C"], glow: "rgba(171,71,188,0.5)",
    positions: [
      { id: "mv-vd", label: "Visual Designer", skills: [
        { skillId: "ui", fit: 90 }, { skillId: "illust", fit: 82 }, { skillId: "figma", fit: 75 }, { skillId: "motion", fit: 70 },
      ], gaps: [{ skillId: "aitools", importance: 60 }] },
      { id: "mv-ux", label: "UX Designer", skills: [
        { skillId: "figma", fit: 85 }, { skillId: "research", fit: 78 }, { skillId: "uxwriting", fit: 72 }, { skillId: "designsys", fit: 65 },
      ], gaps: [{ skillId: "a11y", importance: 50 }] },
    ],
  },
  {
    id: "forefront", label: "Forefront KL",
    colors: ["#E3F2FD","#42A5F5","#1565C0","#0D47A1"], glow: "rgba(66,165,245,0.5)",
    positions: [
      { id: "ff-cd", label: "Creative Designer", skills: [
        { skillId: "ui", fit: 84 }, { skillId: "illust", fit: 78 }, { skillId: "motion", fit: 65 }, { skillId: "teamwork", fit: 60 },
      ], gaps: [{ skillId: "webflow", importance: 55 }, { skillId: "threed", importance: 40 }] },
      { id: "ff-ad", label: "Art Director", skills: [
        { skillId: "ui", fit: 80 }, { skillId: "illust", fit: 72 }, { skillId: "leadership", fit: 68 },
      ], gaps: [{ skillId: "aitools", importance: 45 }] },
    ],
  },
];

const SOFTWARE_SKILLS: Skill[] = [
  { id: "ts",         label: "TypeScript",  proficiency: 90, category: "technical", colors: ["#64B5F6","#1565C0","#0D47A1"], glow: "rgba(100,181,246,0.5)" },
  { id: "react",      label: "React",       proficiency: 88, category: "technical", colors: ["#4DB6AC","#00897B","#004D40"], glow: "rgba(77,182,172,0.5)" },
  { id: "node",       label: "Node.js",     proficiency: 80, category: "technical", colors: ["#A5D6A7","#2E7D32","#1B5E20"], glow: "rgba(165,214,167,0.35)" },
  { id: "git",        label: "Git & CI",    proficiency: 85, category: "technical", colors: ["#FF8A65","#E64A19","#BF360C"], glow: "rgba(255,138,101,0.45)" },
  { id: "api",        label: "REST APIs",   proficiency: 78, category: "technical", colors: ["#FFF176","#F9A825","#F57F17"], glow: "rgba(255,241,118,0.4)" },
  { id: "sqldb",      label: "SQL",         proficiency: 70, category: "data",      colors: ["#80DEEA","#00ACC1","#006064"], glow: "rgba(128,222,234,0.4)" },
  { id: "testing",    label: "Testing",     proficiency: 60, category: "technical", colors: ["#CE93D8","#8E24AA","#4A148C"], glow: "rgba(206,147,216,0.45)" },
  { id: "agile",      label: "Agile",       proficiency: 68, category: "soft",      colors: ["#FFAB91","#D84315","#BF360C"], glow: "rgba(255,171,145,0.35)" },
  { id: "teamwork",   label: "Teamwork",    proficiency: 70, category: "soft",      colors: ["#C5E1A5","#558B2F","#33691E"], glow: "rgba(197,225,165,0.3)" },
  { id: "leadership", label: "Leadership",  proficiency: 50, category: "soft",      colors: ["#EF9A9A","#C62828","#B71C1C"], glow: "rgba(239,154,154,0.3)" },
];

const SOFTWARE_GAPS: Record<string, { label: string; colors: string[]; glow: string }> = {
  golang:    gapDef("Go", 0.5),
  k8s:       gapDef("Kubernetes"),
  docker:    gapDef("Docker"),
  aws:       gapDef("AWS", 0.4),
  sysdesign: gapDef("System Design", 0.4),
};

const SOFTWARE_COMPANIES: Company[] = [
  {
    id: "grab", label: "Grab",
    colors: ["#E8F5E9","#66BB6A","#2E7D32","#1B5E20"], glow: "rgba(102,187,106,0.5)",
    positions: [
      { id: "gr-se", label: "Software Engineer", skills: [
        { skillId: "ts", fit: 90 }, { skillId: "react", fit: 82 }, { skillId: "node", fit: 78 }, { skillId: "api", fit: 75 },
      ], gaps: [{ skillId: "golang", importance: 70 }, { skillId: "k8s", importance: 60 }] },
      { id: "gr-be", label: "Backend Engineer", skills: [
        { skillId: "node", fit: 88 }, { skillId: "api", fit: 85 }, { skillId: "sqldb", fit: 72 },
      ], gaps: [{ skillId: "golang", importance: 85 }, { skillId: "docker", importance: 65 }] },
    ],
  },
  {
    id: "shopee", label: "Shopee",
    colors: ["#FBE9E7","#FF7043","#D84315","#BF360C"], glow: "rgba(255,112,67,0.5)",
    positions: [
      { id: "sp-fe", label: "Frontend Engineer", skills: [
        { skillId: "react", fit: 92 }, { skillId: "ts", fit: 88 }, { skillId: "testing", fit: 60 },
      ], gaps: [{ skillId: "sysdesign", importance: 50 }] },
      { id: "sp-fs", label: "Full-Stack Engineer", skills: [
        { skillId: "ts", fit: 85 }, { skillId: "react", fit: 80 }, { skillId: "node", fit: 75 }, { skillId: "sqldb", fit: 65 },
      ], gaps: [{ skillId: "docker", importance: 55 }, { skillId: "aws", importance: 45 }] },
    ],
  },
  {
    id: "tng", label: "TNG Digital",
    colors: ["#E3F2FD","#42A5F5","#1565C0","#0D47A1"], glow: "rgba(66,165,245,0.5)",
    positions: [
      { id: "tn-se", label: "Software Engineer", skills: [
        { skillId: "ts", fit: 86 }, { skillId: "node", fit: 80 }, { skillId: "api", fit: 78 }, { skillId: "git", fit: 70 },
      ], gaps: [{ skillId: "k8s", importance: 65 }, { skillId: "aws", importance: 60 }] },
      { id: "tn-me", label: "Mobile Engineer", skills: [
        { skillId: "ts", fit: 75 }, { skillId: "api", fit: 70 },
      ], gaps: [{ skillId: "sysdesign", importance: 55 }] },
    ],
  },
  {
    id: "carsome", label: "Carsome",
    colors: ["#FFEBEE","#EF5350","#C62828","#B71C1C"], glow: "rgba(239,83,80,0.5)",
    positions: [
      { id: "cs-se", label: "Software Engineer", skills: [
        { skillId: "ts", fit: 82 }, { skillId: "react", fit: 78 }, { skillId: "node", fit: 72 }, { skillId: "agile", fit: 65 },
      ], gaps: [{ skillId: "aws", importance: 55 }] },
      { id: "cs-qa", label: "QA Engineer", skills: [
        { skillId: "testing", fit: 90 }, { skillId: "git", fit: 70 }, { skillId: "agile", fit: 68 },
      ], gaps: [{ skillId: "docker", importance: 45 }] },
    ],
  },
  {
    id: "paynet", label: "PayNet",
    colors: ["#F3E5F5","#AB47BC","#7B1FA2","#4A148C"], glow: "rgba(171,71,188,0.5)",
    positions: [
      { id: "pn-be", label: "Backend Engineer", skills: [
        { skillId: "node", fit: 85 }, { skillId: "api", fit: 82 }, { skillId: "sqldb", fit: 78 }, { skillId: "git", fit: 72 },
      ], gaps: [{ skillId: "sysdesign", importance: 70 }, { skillId: "k8s", importance: 50 }] },
      { id: "pn-pe", label: "Platform Engineer", skills: [
        { skillId: "git", fit: 85 }, { skillId: "node", fit: 70 },
      ], gaps: [{ skillId: "k8s", importance: 88 }, { skillId: "docker", importance: 75 }, { skillId: "aws", importance: 70 }] },
    ],
  },
];

const MARKETING_SKILLS: Skill[] = [
  { id: "social",     label: "Social Media",    proficiency: 90, category: "technical", colors: ["#64B5F6","#1565C0","#0D47A1"], glow: "rgba(100,181,246,0.5)" },
  { id: "content",    label: "Content Writing", proficiency: 88, category: "technical", colors: ["#4DB6AC","#00897B","#004D40"], glow: "rgba(77,182,172,0.5)" },
  { id: "seo",        label: "SEO",             proficiency: 82, category: "technical", colors: ["#A5D6A7","#2E7D32","#1B5E20"], glow: "rgba(165,214,167,0.35)" },
  { id: "copy",       label: "Copywriting",     proficiency: 80, category: "technical", colors: ["#FF8A65","#E64A19","#BF360C"], glow: "rgba(255,138,101,0.45)" },
  { id: "storytell",  label: "Storytelling",    proficiency: 85, category: "soft",      colors: ["#CE93D8","#8E24AA","#4A148C"], glow: "rgba(206,147,216,0.45)" },
  { id: "analytics",  label: "GA4 Analytics",   proficiency: 70, category: "data",      colors: ["#FFF176","#F9A825","#F57F17"], glow: "rgba(255,241,118,0.4)" },
  { id: "brand",      label: "Brand Strategy",  proficiency: 65, category: "soft",      colors: ["#80DEEA","#00ACC1","#006064"], glow: "rgba(128,222,234,0.4)" },
  { id: "email",      label: "Email Marketing", proficiency: 60, category: "technical", colors: ["#FFAB91","#D84315","#BF360C"], glow: "rgba(255,171,145,0.35)" },
  { id: "teamwork",   label: "Teamwork",        proficiency: 70, category: "soft",      colors: ["#C5E1A5","#558B2F","#33691E"], glow: "rgba(197,225,165,0.3)" },
  { id: "leadership", label: "Leadership",      proficiency: 50, category: "soft",      colors: ["#EF9A9A","#C62828","#B71C1C"], glow: "rgba(239,154,154,0.3)" },
];

const MARKETING_GAPS: Record<string, { label: string; colors: string[]; glow: string }> = {
  paidads:    gapDef("Meta/Google Ads", 0.5),
  martech:    gapDef("HubSpot"),
  crm:        gapDef("Salesforce CRM"),
  video:      gapDef("Video Editing", 0.4),
  influencer: gapDef("KOL Management", 0.4),
};

const MARKETING_COMPANIES: Company[] = [
  {
    id: "nestle", label: "Nestlé Malaysia",
    colors: ["#FFF8E1","#FFB300","#FF8F00","#E65100"], glow: "rgba(255,179,0,0.5)",
    positions: [
      { id: "ns-be", label: "Brand Executive", skills: [
        { skillId: "brand", fit: 85 }, { skillId: "storytell", fit: 80 }, { skillId: "content", fit: 75 }, { skillId: "teamwork", fit: 65 },
      ], gaps: [{ skillId: "crm", importance: 50 }] },
      { id: "ns-dm", label: "Digital Marketing Exec", skills: [
        { skillId: "social", fit: 88 }, { skillId: "seo", fit: 70 }, { skillId: "analytics", fit: 68 },
      ], gaps: [{ skillId: "paidads", importance: 75 }, { skillId: "martech", importance: 45 }] },
    ],
  },
  {
    id: "airasia", label: "AirAsia",
    colors: ["#FFEBEE","#EF5350","#C62828","#B71C1C"], glow: "rgba(239,83,80,0.5)",
    positions: [
      { id: "aa-cm", label: "Content Marketer", skills: [
        { skillId: "content", fit: 92 }, { skillId: "copy", fit: 85 }, { skillId: "social", fit: 78 },
      ], gaps: [{ skillId: "video", importance: 60 }] },
      { id: "aa-gm", label: "Growth Marketer", skills: [
        { skillId: "analytics", fit: 80 }, { skillId: "seo", fit: 75 }, { skillId: "email", fit: 62 },
      ], gaps: [{ skillId: "paidads", importance: 85 }, { skillId: "martech", importance: 55 }] },
    ],
  },
  {
    id: "lazada", label: "Lazada",
    colors: ["#E3F2FD","#42A5F5","#1565C0","#0D47A1"], glow: "rgba(66,165,245,0.5)",
    positions: [
      { id: "lz-ce", label: "Campaign Executive", skills: [
        { skillId: "social", fit: 85 }, { skillId: "copy", fit: 78 }, { skillId: "teamwork", fit: 68 },
      ], gaps: [{ skillId: "influencer", importance: 65 }] },
      { id: "lz-ma", label: "Marketing Analyst", skills: [
        { skillId: "analytics", fit: 88 }, { skillId: "seo", fit: 72 }, { skillId: "email", fit: 60 },
      ], gaps: [{ skillId: "crm", importance: 70 }, { skillId: "paidads", importance: 50 }] },
    ],
  },
  {
    id: "zus", label: "ZUS Coffee",
    colors: ["#E0F2F1","#26A69A","#00796B","#004D40"], glow: "rgba(38,166,154,0.5)",
    positions: [
      { id: "zs-sm", label: "Social Media Exec", skills: [
        { skillId: "social", fit: 95 }, { skillId: "content", fit: 82 }, { skillId: "copy", fit: 75 },
      ], gaps: [{ skillId: "video", importance: 70 }, { skillId: "influencer", importance: 55 }] },
      { id: "zs-bm", label: "Brand Marketer", skills: [
        { skillId: "storytell", fit: 85 }, { skillId: "brand", fit: 80 }, { skillId: "content", fit: 70 },
      ], gaps: [{ skillId: "martech", importance: 40 }] },
    ],
  },
  {
    id: "mediaprima", label: "Media Prima",
    colors: ["#F3E5F5","#AB47BC","#7B1FA2","#4A148C"], glow: "rgba(171,71,188,0.5)",
    positions: [
      { id: "mp-cs", label: "Content Strategist", skills: [
        { skillId: "content", fit: 90 }, { skillId: "storytell", fit: 88 }, { skillId: "copy", fit: 80 }, { skillId: "leadership", fit: 55 },
      ], gaps: [{ skillId: "video", importance: 50 }] },
      { id: "mp-seo", label: "SEO Specialist", skills: [
        { skillId: "seo", fit: 92 }, { skillId: "analytics", fit: 75 }, { skillId: "content", fit: 65 },
      ], gaps: [{ skillId: "paidads", importance: 45 }] },
    ],
  },
];

const PRODUCT_SKILLS: Skill[] = [
  { id: "roadmap",     label: "Roadmapping",       proficiency: 85, category: "technical", colors: ["#64B5F6","#1565C0","#0D47A1"], glow: "rgba(100,181,246,0.5)" },
  { id: "agile",       label: "Agile / Scrum",     proficiency: 88, category: "technical", colors: ["#4DB6AC","#00897B","#004D40"], glow: "rgba(77,182,172,0.5)" },
  { id: "stakeholder", label: "Stakeholder Mgmt",  proficiency: 82, category: "soft",      colors: ["#FF8A65","#E64A19","#BF360C"], glow: "rgba(255,138,101,0.45)" },
  { id: "userres",     label: "User Research",     proficiency: 80, category: "soft",      colors: ["#CE93D8","#8E24AA","#4A148C"], glow: "rgba(206,147,216,0.45)" },
  { id: "panalytics",  label: "Product Analytics", proficiency: 78, category: "data",      colors: ["#FFF176","#F9A825","#F57F17"], glow: "rgba(255,241,118,0.4)" },
  { id: "storytell",   label: "Storytelling",      proficiency: 85, category: "soft",      colors: ["#80DEEA","#00ACC1","#006064"], glow: "rgba(128,222,234,0.4)" },
  { id: "wireframe",   label: "Wireframing",       proficiency: 70, category: "technical", colors: ["#A5D6A7","#2E7D32","#1B5E20"], glow: "rgba(165,214,167,0.35)" },
  { id: "sqldb",       label: "SQL",               proficiency: 65, category: "data",      colors: ["#FFAB91","#D84315","#BF360C"], glow: "rgba(255,171,145,0.35)" },
  { id: "teamwork",    label: "Teamwork",          proficiency: 75, category: "soft",      colors: ["#C5E1A5","#558B2F","#33691E"], glow: "rgba(197,225,165,0.3)" },
  { id: "leadership",  label: "Leadership",        proficiency: 60, category: "soft",      colors: ["#EF9A9A","#C62828","#B71C1C"], glow: "rgba(239,154,154,0.3)" },
];

const PRODUCT_GAPS: Record<string, { label: string; colors: string[]; glow: string }> = {
  abtest:    gapDef("A/B Testing", 0.5),
  growth:    gapDef("Growth Loops"),
  pricing:   gapDef("Pricing Strategy"),
  aiproduct: gapDef("AI Product Sense", 0.4),
  tech:      gapDef("Technical Fluency", 0.4),
};

const PRODUCT_COMPANIES: Company[] = [
  {
    id: "grab", label: "Grab",
    colors: ["#E8F5E9","#66BB6A","#2E7D32","#1B5E20"], glow: "rgba(102,187,106,0.5)",
    positions: [
      { id: "gr-pm", label: "Product Manager", skills: [
        { skillId: "roadmap", fit: 90 }, { skillId: "agile", fit: 85 }, { skillId: "stakeholder", fit: 82 }, { skillId: "panalytics", fit: 75 },
      ], gaps: [{ skillId: "abtest", importance: 70 }, { skillId: "aiproduct", importance: 60 }] },
      { id: "gr-apm", label: "Associate PM", skills: [
        { skillId: "agile", fit: 80 }, { skillId: "userres", fit: 72 }, { skillId: "teamwork", fit: 68 },
      ], gaps: [{ skillId: "tech", importance: 50 }] },
    ],
  },
  {
    id: "touchngo", label: "Touch 'n Go",
    colors: ["#E3F2FD","#42A5F5","#1565C0","#0D47A1"], glow: "rgba(66,165,245,0.5)",
    positions: [
      { id: "tg-pm", label: "Product Manager", skills: [
        { skillId: "roadmap", fit: 85 }, { skillId: "stakeholder", fit: 80 }, { skillId: "panalytics", fit: 70 }, { skillId: "sqldb", fit: 60 },
      ], gaps: [{ skillId: "pricing", importance: 65 }, { skillId: "abtest", importance: 55 }] },
      { id: "tg-po", label: "Product Owner", skills: [
        { skillId: "agile", fit: 90 }, { skillId: "roadmap", fit: 78 }, { skillId: "teamwork", fit: 70 },
      ], gaps: [{ skillId: "tech", importance: 60 }] },
    ],
  },
  {
    id: "setel", label: "Setel",
    colors: ["#E0F2F1","#26A69A","#00796B","#004D40"], glow: "rgba(38,166,154,0.5)",
    positions: [
      { id: "st-pm", label: "Product Manager", skills: [
        { skillId: "userres", fit: 85 }, { skillId: "roadmap", fit: 80 }, { skillId: "storytell", fit: 75 }, { skillId: "wireframe", fit: 68 },
      ], gaps: [{ skillId: "growth", importance: 70 }] },
      { id: "st-gpm", label: "Growth PM", skills: [
        { skillId: "panalytics", fit: 85 }, { skillId: "storytell", fit: 70 },
      ], gaps: [{ skillId: "growth", importance: 88 }, { skillId: "abtest", importance: 75 }] },
    ],
  },
  {
    id: "foodpanda", label: "foodpanda MY",
    colors: ["#FCE4EC","#EC407A","#C2185B","#880E4F"], glow: "rgba(236,64,122,0.5)",
    positions: [
      { id: "fp-pm", label: "Product Manager", skills: [
        { skillId: "panalytics", fit: 82 }, { skillId: "roadmap", fit: 75 }, { skillId: "agile", fit: 70 },
      ], gaps: [{ skillId: "abtest", importance: 65 }, { skillId: "aiproduct", importance: 50 }] },
      { id: "fp-spm", label: "Senior PM", skills: [
        { skillId: "stakeholder", fit: 85 }, { skillId: "roadmap", fit: 80 }, { skillId: "leadership", fit: 75 },
      ], gaps: [{ skillId: "pricing", importance: 70 }] },
    ],
  },
  {
    id: "bigpay", label: "BigPay",
    colors: ["#F3E5F5","#AB47BC","#7B1FA2","#4A148C"], glow: "rgba(171,71,188,0.5)",
    positions: [
      { id: "bp-pm", label: "Product Manager", skills: [
        { skillId: "roadmap", fit: 82 }, { skillId: "stakeholder", fit: 78 }, { skillId: "sqldb", fit: 62 },
      ], gaps: [{ skillId: "pricing", importance: 60 }, { skillId: "tech", importance: 55 }] },
      { id: "bp-ppm", label: "Platform PM", skills: [
        { skillId: "agile", fit: 78 }, { skillId: "panalytics", fit: 72 }, { skillId: "wireframe", fit: 55 },
      ], gaps: [{ skillId: "aiproduct", importance: 65 }] },
    ],
  },
];

type FamilyKey = "data" | "creative" | "software" | "marketing" | "product";

const FAMILIES: Record<FamilyKey, { skills: Skill[]; gapSkills: Record<string, { label: string; colors: string[]; glow: string }>; companies: Company[] }> = {
  data:      { skills: SKILLS,           gapSkills: GAP_SKILLS,      companies: COMPANIES },
  creative:  { skills: CREATIVE_SKILLS,  gapSkills: CREATIVE_GAPS,   companies: CREATIVE_COMPANIES },
  software:  { skills: SOFTWARE_SKILLS,  gapSkills: SOFTWARE_GAPS,   companies: SOFTWARE_COMPANIES },
  marketing: { skills: MARKETING_SKILLS, gapSkills: MARKETING_GAPS,  companies: MARKETING_COMPANIES },
  product:   { skills: PRODUCT_SKILLS,   gapSkills: PRODUCT_GAPS,    companies: PRODUCT_COMPANIES },
};

function getRoleFamily(role: string): FamilyKey {
  const r = role.toLowerCase();
  if (/design|ux/.test(r)) return "creative";
  if (/software|engineer|developer/.test(r) && !r.includes("data")) return "software";
  if (/market|brand|content/.test(r)) return "marketing";
  if (r.includes("product") && /manager|owner|lead/.test(r)) return "product";
  return "data";
}

/* Wrap the target-role label into short lines for the centre of the graph */
function wrapLabel(text: string, maxChars = 12): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > maxChars) { lines.push(cur); cur = w; }
    else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

/* ── Stars ── */
function makeStars(count: number, W: number, H: number) {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + 0.3, o: Math.random() * 0.5 + 0.15 });
  }
  return stars;
}

/* ── Helpers ── */
function getRelatedSkillIds(company: Company): Set<string> {
  const set = new Set<string>();
  for (const pos of company.positions) {
    for (const s of pos.skills) set.add(s.skillId);
  }
  return set;
}

function getGapSkillIds(company: Company): Map<string, number> {
  const map = new Map<string, number>();
  for (const pos of company.positions) {
    for (const g of pos.gaps) {
      map.set(g.skillId, Math.max(map.get(g.skillId) || 0, g.importance));
    }
  }
  return map;
}

function getBestFit(company: Company, skillId: string): { position: string; fit: number } | null {
  let best: { position: string; fit: number } | null = null;
  for (const pos of company.positions) {
    for (const s of pos.skills) {
      if (s.skillId === skillId && (!best || s.fit > best.fit)) {
        best = { position: pos.label, fit: s.fit };
      }
    }
  }
  return best;
}

/* ── Component ── */

interface SkillGraphProps {
  targetRole?: string;
  selectedJob?: { company: string; position: string } | null;
  onClearJob?: () => void;
}

export function SkillGraph({ targetRole = "Data Analyst", selectedJob, onClearJob }: SkillGraphProps) {
  const familyKey = getRoleFamily(targetRole);
  const { skills: FAM_SKILLS, gapSkills: FAM_GAP_SKILLS, companies: FAM_COMPANIES } = FAMILIES[familyKey];

  const [expanded, setExpanded] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(FAM_COMPANIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mouseInGraph, setMouseInGraph] = useState(false);
  const anglesRef = useRef<Map<string, number>>(new Map());
  const [, setTick] = useState(0);
  const animRef = useRef(0);

  const W = expanded ? 1200 : 860;
  const H = expanded ? 600 : 460;
  const CX = W * 0.42;
  const CY = H * 0.5;

  const starsRef = useRef(makeStars(220, W, H));

  // Reset selection when the role family changes
  useEffect(() => {
    setSelectedCompany(FAM_COMPANIES[0]);
    setHovered(null);
  }, [familyKey]);

  // Auto-select company when navigating from Job Match Tracker
  useEffect(() => {
    if (selectedJob) {
      const company = FAM_COMPANIES.find(c => c.id === selectedJob.company);
      if (company) {
        setSelectedCompany(company);
        setHovered(null);
      }
    }
  }, [selectedJob]);

  const relatedIds = getRelatedSkillIds(selectedCompany);
  const gapIds = getGapSkillIds(selectedCompany);

  // If a specific position is selected, narrow down to just that position's skills
  const selectedPosition = selectedJob
    ? selectedCompany.positions.find(p => p.label.toLowerCase().includes(selectedJob.position.toLowerCase()) || selectedJob.position.toLowerCase().includes(p.label.toLowerCase()))
    : null;

  const filteredRelatedIds = selectedPosition
    ? new Set(selectedPosition.skills.map(s => s.skillId))
    : relatedIds;
  const filteredGapIds = selectedPosition
    ? new Map(selectedPosition.gaps.map(g => [g.skillId, g.importance]))
    : gapIds;

  const relatedSkills = FAM_SKILLS.filter(s => filteredRelatedIds.has(s.id));
  const unrelatedSkills = FAM_SKILLS.filter(s => !filteredRelatedIds.has(s.id));
  const gapEntries = Array.from(filteredGapIds.entries()).map(([id, importance]) => ({ id, importance, ...(FAM_GAP_SKILLS[id] || { label: id, colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.4)" }) }));

  // Initialize angles for orbiting skills
  useEffect(() => {
    const map = new Map<string, number>();
    relatedSkills.forEach((s, i) => {
      if (!map.has(s.id)) map.set(s.id, (i / relatedSkills.length) * TAU);
    });
    gapEntries.forEach((g, i) => {
      if (!map.has(g.id)) map.set(g.id, ((i + 0.5) / Math.max(gapEntries.length, 1)) * TAU + 0.3);
    });
    anglesRef.current = map;
  }, [selectedCompany.id, familyKey]);

  // Animation loop — only rotate when mouse is NOT in graph
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      if (!mouseInGraph) {
        anglesRef.current.forEach((angle, id) => {
          const baseSpeed = 0.002;
          const idx = Array.from(anglesRef.current.keys()).indexOf(id);
          anglesRef.current.set(id, angle + baseSpeed * (1 - idx * 0.05));
        });
      }
      setTick(t => t + 1);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [mouseInGraph]);

  const resetGraph = () => {
    const map = new Map<string, number>();
    relatedSkills.forEach((s, i) => map.set(s.id, (i / relatedSkills.length) * TAU));
    gapEntries.forEach((g, i) => map.set(g.id, ((i + 0.5) / Math.max(gapEntries.length, 1)) * TAU + 0.3));
    anglesRef.current = map;
    setHovered(null);
  };

  // Position calculations
  const getSkillPos = (id: string, orbitRadius: number) => {
    const angle = anglesRef.current.get(id) || 0;
    return { x: CX + Math.cos(angle) * orbitRadius, y: CY + Math.sin(angle) * orbitRadius * 0.45 };
  };

  // Unrelated skills — scattered as stars on the outer edges
  const unrelatedPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  useEffect(() => {
    const map = new Map<string, { x: number; y: number }>();
    unrelatedSkills.forEach((s, i) => {
      const edgeAngle = (i / Math.max(unrelatedSkills.length, 1)) * Math.PI - Math.PI / 2;
      const dist = 180 + Math.random() * 60;
      map.set(s.id, {
        x: W * 0.82 + Math.cos(edgeAngle) * 70 + (i % 2) * 30,
        y: H * 0.25 + i * (H * 0.5 / Math.max(unrelatedSkills.length, 1)) + 20,
      });
    });
    unrelatedPositions.current = map;
  }, [selectedCompany.id, familyKey, W, H]);

  const skillMap = new Map(FAM_SKILLS.map(s => [s.id, s]));

  // Orbit radii for skills (inner = high fit, outer = lower)
  const innerOrbit = 120;
  const outerOrbit = 200;
  const gapOrbit = 270;

  const getOrbit = (skillId: string): number => {
    const best = getBestFit(selectedCompany, skillId);
    if (!best) return outerOrbit;
    if (best.fit >= 85) return innerOrbit;
    if (best.fit >= 70) return 160;
    return outerOrbit;
  };

  // Hover connections
  const hoveredSkill = hovered ? skillMap.get(hovered) : null;
  const hoveredPositions = hovered ? selectedCompany.positions.filter(p =>
    p.skills.some(s => s.skillId === hovered) || p.gaps.some(g => g.skillId === hovered)
  ) : [];

  const totalFit = relatedSkills.length > 0
    ? Math.round(relatedSkills.reduce((sum, s) => sum + (getBestFit(selectedCompany, s.id)?.fit || 0), 0) / relatedSkills.length)
    : 0;

  return (
    <div className={`border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-lg overflow-hidden transition-all ${expanded ? "col-span-full" : ""}`}
      style={{ background: "linear-gradient(135deg, #06080f 0%, #0c1220 40%, #0f1729 100%)" }}>

      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div>
            <h2 className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Skill System</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a company to see how your skills align
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-md">
              Why these companies? Top Malaysian employers actively hiring {targetRole}s on Talentbank in the last 90 days, ranked by demand.
            </p>
          </div>

          {/* Company selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <div className="w-3 h-3 rounded-full" style={{ background: selectedCompany.colors[1] }} />
              {selectedCompany.label}
              <ChevronDown size={13} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-[#151d30] border border-white/10 rounded-lg shadow-2xl py-1 w-48">
                {FAM_COMPANIES.map(c => (
                  <button key={c.id}
                    onClick={() => { setSelectedCompany(c); setDropdownOpen(false); setHovered(null); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      c.id === selectedCompany.id ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: c.colors[1] }} />
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-400">Overall Fit</span>
            <span className="text-sm font-bold" style={{ color: selectedCompany.colors[1] }}>{totalFit}%</span>
          </div>
          <button onClick={resetGraph} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><RotateCcw size={15} /></button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      <div className="relative" style={{ height: H }}
        onMouseEnter={() => setMouseInGraph(true)}
        onMouseLeave={() => { setMouseInGraph(false); setHovered(null); }}
      >
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="select-none">
          <defs>
            <radialGradient id="sun-grad-co" cx="50%" cy="50%">
              <stop offset="0%" stopColor={selectedCompany.colors[0]} />
              <stop offset="35%" stopColor={selectedCompany.colors[1]} />
              <stop offset="70%" stopColor={selectedCompany.colors[2]} />
              <stop offset="100%" stopColor={selectedCompany.colors[3] || selectedCompany.colors[2]} />
            </radialGradient>
            <radialGradient id="sun-corona-co" cx="50%" cy="50%">
              <stop offset="0%" stopColor={selectedCompany.glow} />
              <stop offset="50%" stopColor={selectedCompany.glow.replace(/[\d.]+\)$/, "0.06)")} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <filter id="sun-blur-co" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <filter id="planet-glow-co" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <filter id="star-soft" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <style>{`
              @keyframes sunPulse2 { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
              @keyframes twinkle2 { 0%,100% { opacity:0.2; } 50% { opacity:0.8; } }
              @keyframes gapPulse { 0%,100% { opacity:0.35; } 50% { opacity:0.75; } }
              .sun-pulse2 { animation: sunPulse2 3s ease-in-out infinite; }
              .twinkle2 { animation: twinkle2 3s ease-in-out infinite; }
              .gap-pulse { animation: gapPulse 2s ease-in-out infinite; }
            `}</style>
          </defs>

          {/* Background stars */}
          {starsRef.current.map((s, i) => (
            <circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o}
              className={i % 7 === 0 ? "twinkle2" : undefined}
              style={i % 7 === 0 ? { animationDelay: `${(i * 0.4) % 5}s` } : undefined}
            />
          ))}

          {/* Orbit rings */}
          {[innerOrbit, 160, outerOrbit, gapOrbit].map((orbit, i) => (
            <ellipse key={`orb${i}`} cx={CX} cy={CY} rx={orbit} ry={orbit * 0.45}
              fill="none" stroke={i === 3 ? "rgba(239,83,80,0.08)" : "rgba(255,255,255,0.05)"} strokeWidth={1}
              strokeDasharray={i === 3 ? "4,8" : undefined}
            />
          ))}

          {/* Connection lines (when hovering a skill) */}
          {hovered && hoveredPositions.map((pos, pi) => {
            const skillPos = relatedIds.has(hovered) ? getSkillPos(hovered, getOrbit(hovered)) : null;
            const gapPos = gapIds.has(hovered) ? getSkillPos(hovered, gapOrbit) : null;
            const from = skillPos || gapPos;
            if (!from) return null;
            return (
              <line key={`conn-${pi}`} x1={from.x} y1={from.y} x2={CX} y2={CY}
                stroke={gapIds.has(hovered) ? "rgba(239,83,80,0.35)" : `${selectedCompany.colors[1]}44`}
                strokeWidth={1.5}
                strokeDasharray={gapIds.has(hovered) ? "5,4" : undefined}
              />
            );
          })}

          {/* Sun corona */}
          <circle cx={CX} cy={CY} r={95} fill="url(#sun-corona-co)" className="sun-pulse2" />
          <circle cx={CX} cy={CY} r={60} fill={selectedCompany.glow.replace(/[\d.]+\)$/, "0.1)")} filter="url(#sun-blur-co)" />

          {/* Sun (Target role at the centre, company + fit below) */}
          <g onPointerEnter={() => setHovered("__company__")} onPointerLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
            <circle cx={CX} cy={CY} r={50} fill="url(#sun-grad-co)" />
            <circle cx={CX} cy={CY} r={50} fill="none" stroke={`${selectedCompany.colors[0]}66`} strokeWidth={1.5} />
            {/* Target role — big, readable, wrapped */}
            {(() => {
              const lines = wrapLabel(targetRole);
              const startY = CY - (lines.length - 1) * 8 + 5;
              return lines.map((line, i) => (
                <text key={i} x={CX} y={startY + i * 16} textAnchor="middle" fontSize={13.5} fontWeight={800} fill="#fff"
                  style={{ pointerEvents: "none", fontFamily: "var(--font-display)", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                  {line}
                </text>
              ));
            })()}
            {/* Selected company name + overall fit — prominent */}
            <text x={CX} y={CY + 72} textAnchor="middle" fontSize={14} fontWeight={700}
              fill={selectedCompany.colors[1]}
              style={{ pointerEvents: "none", fontFamily: "var(--font-display)" }}>
              {selectedCompany.label}
            </text>
            <text x={CX} y={CY + 88} textAnchor="middle" fontSize={11} fontWeight={600}
              fill="rgba(255,255,255,0.75)"
              style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
              {totalFit}% overall fit
            </text>
            {/* Position labels around sun */}
            {selectedCompany.positions.map((pos, i) => {
              const a = (i / selectedCompany.positions.length) * Math.PI - Math.PI / 2;
              const tx = CX + Math.cos(a) * 88;
              const ty = CY + Math.sin(a) * 62;
              return (
                <text key={pos.id} x={tx} y={ty} textAnchor="middle" fontSize={9} fontWeight={500}
                  fill="rgba(255,255,255,0.55)" style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {pos.label}
                </text>
              );
            })}
          </g>

          {/* Related skills (planets orbiting) */}
          {relatedSkills.map(skill => {
            const orbit = getOrbit(skill.id);
            const pos = getSkillPos(skill.id, orbit);
            const best = getBestFit(selectedCompany, skill.id);
            const isHov = hovered === skill.id;
            const highlighted = !hovered || hovered === skill.id || hovered === "__company__";
            const r = isHov ? 18 : 12 + (skill.proficiency / 100) * 6;
            const gradId = `sg-${skill.id}`;

            return (
              <g key={skill.id}
                onPointerEnter={() => setHovered(skill.id)}
                onPointerLeave={() => setHovered(null)}
                style={{ cursor: "pointer", opacity: highlighted ? 1 : 0.2, transition: "opacity 0.25s" }}
              >
                <defs>
                  <radialGradient id={gradId} cx="35%" cy="35%">
                    <stop offset="0%" stopColor={skill.colors[0]} />
                    <stop offset="60%" stopColor={skill.colors[1]} />
                    <stop offset="100%" stopColor={skill.colors[2]} />
                  </radialGradient>
                </defs>

                {isHov && <circle cx={pos.x} cy={pos.y} r={r + 12} fill={skill.glow} filter="url(#planet-glow-co)" />}

                <circle cx={pos.x} cy={pos.y} r={r} fill={`url(#${gradId})`} />
                <circle cx={pos.x - r * 0.25} cy={pos.y - r * 0.25} r={r * 0.3} fill="rgba(255,255,255,0.2)" />

                {/* Proficiency ring */}
                {isHov && (
                  <>
                    <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                    <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none" stroke={skill.colors[0]} strokeWidth={2}
                      strokeDasharray={`${(skill.proficiency / 100) * TAU * (r + 5)} ${TAU * (r + 5)}`}
                      strokeLinecap="round" transform={`rotate(-90 ${pos.x} ${pos.y})`}
                    />
                  </>
                )}

                {/* Label */}
                <text x={pos.x} y={pos.y + r + 14} textAnchor="middle" fontSize={9.5} fontWeight={600}
                  fill="rgba(255,255,255,0.85)" style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {skill.label}
                </text>

                {/* Fit badge */}
                {best && (
                  <text x={pos.x} y={pos.y + r + 25} textAnchor="middle" fontSize={8} fontWeight={500}
                    fill={best.fit >= 85 ? "rgba(129,199,132,0.8)" : best.fit >= 70 ? "rgba(255,213,79,0.7)" : "rgba(255,138,101,0.6)"}
                    style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                    {best.fit}% → {best.position}
                  </text>
                )}
              </g>
            );
          })}

          {/* Gap skills (orbiting outer ring with red glow) */}
          {gapEntries.map((gap, i) => {
            const pos = getSkillPos(gap.id, gapOrbit);
            const isHov = hovered === gap.id;
            const highlighted = !hovered || hovered === gap.id;
            const r = isHov ? 12 : 8 + (gap.importance / 100) * 4;

            return (
              <g key={gap.id}
                onPointerEnter={() => setHovered(gap.id)}
                onPointerLeave={() => setHovered(null)}
                style={{ cursor: "pointer", opacity: highlighted ? 1 : 0.25, transition: "opacity 0.25s" }}
              >
                <circle cx={pos.x} cy={pos.y} r={r + 8} fill={gap.glow}
                  filter="url(#planet-glow-co)" className="gap-pulse"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
                <circle cx={pos.x} cy={pos.y} r={r} fill={gap.colors[1]} />
                <circle cx={pos.x - r * 0.3} cy={pos.y - r * 0.2} r={r * 0.3} fill={gap.colors[0]} opacity={0.5} />
                <circle cx={pos.x} cy={pos.y} r={r + 2} fill="none" stroke="rgba(239,83,80,0.35)" strokeWidth={1} strokeDasharray="3,3" />

                <text x={pos.x} y={pos.y + r + 13} textAnchor="middle" fontSize={9} fontWeight={600}
                  fill="rgba(239,83,80,0.8)" style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {gap.label}
                </text>
                <text x={pos.x} y={pos.y + r + 23} textAnchor="middle" fontSize={7.5} fontWeight={500}
                  fill="rgba(239,83,80,0.5)" style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  Need to learn
                </text>
              </g>
            );
          })}

          {/* Unrelated skills — dim scattered stars */}
          {unrelatedSkills.map((s, i) => {
            const uPos = unrelatedPositions.current.get(s.id);
            if (!uPos) return null;
            return (
              <g key={s.id} style={{ opacity: 0.45 }}>
                <circle cx={uPos.x} cy={uPos.y} r={8} fill={s.colors[1]} opacity={0.35} />
                <circle cx={uPos.x} cy={uPos.y} r={5.5} fill={s.colors[1]} opacity={0.6} />
                <circle cx={uPos.x - 1.5} cy={uPos.y - 1.5} r={2} fill={s.colors[0]} opacity={0.3} />
                <text x={uPos.x} y={uPos.y + 16} textAnchor="middle" fontSize={9} fontWeight={600}
                  fill="rgba(255,255,255,0.35)" style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {s.label}
                </text>
              </g>
            );
          })}

          {/* "Unrelated" label if any */}
          {unrelatedSkills.length > 0 && (
            <text x={W * 0.85} y={H * 0.1} textAnchor="middle" fontSize={10} fontWeight={600}
              fill="rgba(255,255,255,0.2)" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.1em" }}>
              NOT REQUIRED
            </text>
          )}

          {/* Gap orbit label */}
          {gapEntries.length > 0 && (
            <text x={CX} y={CY - gapOrbit * 0.45 - 10} textAnchor="middle" fontSize={9} fontWeight={600}
              fill="rgba(239,83,80,0.4)" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.12em" }}>
              SKILLS TO ENHANCE
            </text>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {[
            { emoji: "☀", label: "Company", color: selectedCompany.colors[1] },
            { emoji: "🪐", label: "Your Skills", color: "#64B5F6" },
            { emoji: "☄", label: "Need to Learn", color: "#EF5350" },
            { emoji: "✦", label: "Not Required", color: "rgba(255,255,255,0.4)" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
              <span className="text-[10px]">{l.emoji}</span>
              <span className="text-[10px] font-medium" style={{ color: l.color }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Pause indicator */}
        {mouseInGraph && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
            <div className="flex gap-0.5">
              <div className="w-1 h-3 bg-white/50 rounded-sm" />
              <div className="w-1 h-3 bg-white/50 rounded-sm" />
            </div>
            <span className="text-[10px] text-white/50 font-medium">Orbits paused</span>
          </div>
        )}

        {/* Hover tooltip */}
        {hovered && hovered !== "__company__" && (
          <div className="absolute top-3 right-3 bg-[rgba(10,14,26,0.95)] backdrop-blur border border-white/10 rounded-xl shadow-2xl p-4 w-60 pointer-events-none">
            {(() => {
              const skill = skillMap.get(hovered);
              const gapEntry = gapEntries.find(g => g.id === hovered);

              if (skill) {
                const best = getBestFit(selectedCompany, hovered);
                const allFits = selectedCompany.positions
                  .map(p => ({ pos: p.label, fit: p.skills.find(s => s.skillId === hovered)?.fit }))
                  .filter(f => f.fit);
                return (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full" style={{ background: skill.colors[0] }} />
                      <span className="text-sm font-bold text-white">{skill.label}</span>
                      <span className="ml-auto text-xs font-medium" style={{ color: skill.colors[0] }}>{skill.proficiency}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full" style={{
                        width: `${skill.proficiency}%`,
                        background: `linear-gradient(90deg, ${skill.colors[0]}, ${skill.colors[1]})`
                      }} />
                    </div>
                    {allFits.length > 0 && (
                      <div className="space-y-1.5 border-t border-white/10 pt-2">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Position Match</p>
                        {allFits.map((f, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-xs text-slate-300">{f.pos}</span>
                            <span className="text-xs font-bold" style={{
                              color: (f.fit || 0) >= 85 ? "#81C784" : (f.fit || 0) >= 70 ? "#FFD54F" : "#FF8A65"
                            }}>{f.fit}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              }

              if (gapEntry) {
                const positions = selectedCompany.positions.filter(p => p.gaps.some(g => g.skillId === hovered));
                return (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full" style={{ background: "#EF5350" }} />
                      <span className="text-sm font-bold text-white">{gapEntry.label}</span>
                    </div>
                    <p className="text-xs text-red-400 mb-2">⚠ You don't have this skill yet</p>
                    {positions.length > 0 && (
                      <div className="space-y-1.5 border-t border-white/10 pt-2">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Needed For</p>
                        {positions.map(p => {
                          const g = p.gaps.find(g => g.skillId === hovered);
                          return (
                            <div key={p.id} className="flex items-center justify-between">
                              <span className="text-xs text-slate-300">{p.label}</span>
                              <span className="text-xs font-bold text-red-400">{g?.importance}% importance</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              }

              return null;
            })()}
          </div>
        )}

        {/* Company info tooltip */}
        {hovered === "__company__" && (
          <div className="absolute top-3 right-3 bg-[rgba(10,14,26,0.95)] backdrop-blur border border-white/10 rounded-xl shadow-2xl p-4 w-60 pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ background: selectedCompany.colors[1] }} />
              <span className="text-sm font-bold text-white">{selectedCompany.label}</span>
            </div>
            <div className="space-y-1.5 border-t border-white/10 pt-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Open Positions</p>
              {selectedCompany.positions.map(p => {
                const avgFit = p.skills.length > 0
                  ? Math.round(p.skills.reduce((s, sk) => s + Math.min(sk.fit, skillMap.get(sk.skillId)?.proficiency || 0), 0) / p.skills.length)
                  : 0;
                return (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{p.gaps.length} gaps</span>
                      <span className="text-xs font-bold" style={{
                        color: avgFit >= 75 ? "#81C784" : avgFit >= 50 ? "#FFD54F" : "#FF8A65"
                      }}>{avgFit}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
