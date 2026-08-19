import { archetypeFor } from "../lib/careerDna.js";
import { useState } from "react";
import {
  ArrowRight, Award, BarChart3, Building2, CheckCircle, MapPin, Scale,
  ShieldCheck, Sparkles, TrendingUp, Wallet
} from "lucide-react";
import { useCareerProfile } from "../state/careerProfile";
import { NextStep } from "../state/stages";

/* ── The weighting model ──
   One place for the weights. The label, the bar width and the
   arithmetic all read from here, so the number on screen is always the
   number that was actually computed. */
const FACTORS = [
  { key: "dna",   label: "Career DNA alignment", weight: 0.30, desc: "Does this role fit your work style and strengths?" },
  { key: "growth", label: "Skill growth",        weight: 0.25, desc: "Will the role build scarce skills for the next 24 months?" },
  { key: "pay",    label: "Compensation",        weight: 0.20, desc: "Salary, benefits, runway, and fair-pay benchmark." },
  { key: "trust",  label: "Employer trust",      weight: 0.15, desc: "Response speed, transparency, graduate ratings, acceptance data." },
  { key: "life",   label: "Life fit",            weight: 0.10, desc: "Location, commute, stability, flexibility, personal preference." },
] as const;

type FactorKey = typeof FACTORS[number]["key"];

/* Per-offer sub-scores. Four of the five are authored from what we know
   about each employer; the DNA one is computed per user below, which is
   why the same three offers can rank differently for two candidates. */
const offers: {
  company: string; role: string; location: string; salary: string; monthly: number;
  sub: Record<Exclude<FactorKey, "dna">, number>;
  /** The DNA dimensions this role actually leans on. */
  dnaWeights: Record<string, number>;
  upside: string; risk: string;
}[] = [
  {
    company: "Maybank",
    role: "Data Analyst, Digital Banking",
    location: "Kuala Lumpur",
    salary: "RM 8.8k/mo",
    monthly: 8800,
    sub: { growth: 88, pay: 74, trust: 96, life: 92 },
    dnaWeights: { Technical: 0.3, Execution: 0.3, Communication: 0.25, Strategic: 0.15 },
    upside: "Best structured growth path and the strongest employer trust score in the set.",
    risk: "Less innovation freedom than the startup track.",
  },
  {
    company: "Grab",
    role: "Analytics Engineer",
    location: "Petaling Jaya / Hybrid",
    salary: "RM 10.2k/mo",
    monthly: 10200,
    sub: { growth: 94, pay: 90, trust: 78, life: 70 },
    dnaWeights: { Technical: 0.4, Innovation: 0.25, Execution: 0.2, Strategic: 0.15 },
    upside: "Best technical compounding and regional exposure.",
    risk: "Higher ambiguity; needs stronger self-direction.",
  },
  {
    company: "Shopee",
    role: "Business Intelligence Associate",
    location: "Kuala Lumpur",
    salary: "RM 9.4k/mo",
    monthly: 9400,
    sub: { growth: 66, pay: 82, trust: 72, life: 76 },
    dnaWeights: { Execution: 0.4, Technical: 0.3, Communication: 0.3 },
    upside: "Fast pace and a strong brand signal on your record.",
    risk: "The role can keep you in reporting work, which raises your AI exposure.",
  },
];

export function OfferDecisionDashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { profile } = useCareerProfile();
  const dnaScores = Object.keys(profile.dnaScores).length
    ? profile.dnaScores
    : { Technical: 55, Execution: 55, Communication: 55, Strategic: 55, Innovation: 55, Leadership: 55 };
  const archetype = archetypeFor(profile);

  /* How well your calibrated dimensions line up with what the role
     leans on — a weighted average of your own scores, so this is the
     part of the total that moves with the person, not the offer. */
  const dnaScoreFor = (weights: Record<string, number>) =>
    Math.round(
      Object.entries(weights).reduce((sum, [dim, w]) => sum + (dnaScores[dim] ?? 55) * w, 0) /
        Object.values(weights).reduce((a, b) => a + b, 0),
    );

  const scored = offers.map(offer => {
    const sub: Record<FactorKey, number> = { dna: dnaScoreFor(offer.dnaWeights), ...offer.sub };
    const total = Math.round(FACTORS.reduce((sum, f) => sum + sub[f.key] * f.weight, 0));
    const top = Object.entries(offer.dnaWeights).sort(([, a], [, b]) => b - a)[0][0];
    return {
      ...offer,
      sub,
      total,
      dnaFit: `${archetype.name} fit — this role leans hardest on ${top.toLowerCase()}, where you score ${dnaScores[top] ?? 55}.`,
    };
  });

  const best = scored.reduce((a, b) => (b.total > a.total ? b : a));
  const [selectedCompany, setSelectedCompany] = useState(best.company);
  const selected = scored.find(o => o.company === selectedCompany) ?? best;

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        <div className="bg-slate-950 text-white rounded-2xl p-6 lg:p-7">
          <div className="grid lg:grid-cols-[1fr_330px] gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-slate-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Scale size={13} /> AI Offer Decision Dashboard
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Compare multiple offers with your Career DNA, not just salary.</h1>
              <p className="text-sm text-slate-300 leading-relaxed mt-2 max-w-2xl">
                Built for early-career candidates who receive more than one offer and need a transparent way to choose the best long-term move.
              </p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-slate-400">AI recommendation</p>
              <p className="text-2xl font-bold mt-1">{best.company}</p>
              <p className="text-sm text-emerald-300 mt-1">Highest weighted fit · {best.total}%</p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {best.monthly < Math.max(...scored.map(o => o.monthly))
                  ? `Not the biggest salary in the set — it wins on the other 80% of the weighting.`
                  : `Leads on both pay and long-term fit.`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {scored.map(offer => {
            const active = selected.company === offer.company;
            return (
              <button
                key={offer.company}
                onClick={() => setSelectedCompany(offer.company)}
                className={`text-left border rounded-xl p-5 shadow-sm transition-all ${active ? "bg-blue-50 border-primary" : "bg-white border-border hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground">{offer.company}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{offer.role}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{offer.total}%</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-4">
                  <span className="inline-flex items-center gap-1"><MapPin size={12} /> {offer.location}</span>
                  <span className="inline-flex items-center gap-1"><Wallet size={12} /> {offer.salary}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6">
          <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-foreground">{selected.company} decision brief</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.role}</p>
              </div>
              <Award size={18} className="text-amber-500" />
            </div>
            <div className="space-y-3">
              {[
                ["DNA fit", selected.dnaFit, ShieldCheck],
                ["Upside", selected.upside, TrendingUp],
                ["Risk to watch", selected.risk, BarChart3],
              ].map(([label, text, Icon]) => (
                <div key={String(label)} className="border border-border rounded-xl p-4 flex items-start gap-3">
                  <Icon size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{String(label)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{String(text)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-700 mb-1">Suggested negotiation angle</p>
              <p className="text-sm text-foreground leading-relaxed">Ask for a 6-month learning milestone review tied to cloud certification and analytics ownership, instead of only negotiating base salary.</p>
            </div>
          </section>

          <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={17} className="text-primary" />
              <h2 className="font-semibold text-foreground">How {selected.company} scores {selected.total}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Your score on each factor, times its weight. The five contributions add up to the total.</p>
            <div className="space-y-3">
              {FACTORS.map(f => {
                const score = selected.sub[f.key];
                return (
                  <div key={f.key}>
                    <div className="flex items-center justify-between mb-1 gap-3">
                      <p className="text-sm font-semibold text-foreground">{f.label}</p>
                      <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
                        {score} × {Math.round(f.weight * 100)}% = <span className="font-bold text-primary">{(score * f.weight).toFixed(1)}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${score}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                  </div>
                );
              })}
              <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
                <p className="text-sm font-bold text-foreground">Total</p>
                <p className="text-sm font-bold text-primary tabular-nums">{selected.total}%</p>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Why this is different</p>
              <p className="text-sm text-muted-foreground mt-0.5">Normal job sites stop at offers. CareerX-Ray helps candidates decide which offer compounds their future.</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("prescription")} className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
            Build the plan to get there <ArrowRight size={14} />
          </button>
        </div>

        <NextStep currentPage="offers" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
