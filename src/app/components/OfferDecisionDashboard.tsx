import { demoToast } from "./toast";
import { getArchetypeForScoresSafe } from "../careerDna.js";
import { useState } from "react";
import {
  ArrowRight, Award, BarChart3, Building2, CheckCircle, MapPin, Scale,
  ShieldCheck, Sparkles, TrendingUp, Wallet
} from "lucide-react";

const offers = [
  {
    company: "Maybank",
    role: "Data Analyst, Digital Banking",
    location: "Kuala Lumpur",
    salary: "RM 8.8k",
    score: 91,
    dnaFit: "DNA_FIT_PLACEHOLDER",
    upside: "Best structured growth path and strongest employer trust score.",
    risk: "Less innovation freedom than startup track.",
  },
  {
    company: "Grab",
    role: "Analytics Engineer",
    location: "Petaling Jaya / Hybrid",
    salary: "RM 10.2k",
    score: 88,
    dnaFit: "Strong technical fit, higher platform learning velocity",
    upside: "Best technical compounding and regional exposure.",
    risk: "Higher ambiguity; needs stronger self-direction.",
  },
  {
    company: "Shopee",
    role: "Business Intelligence Associate",
    location: "Kuala Lumpur",
    salary: "RM 9.4k",
    score: 79,
    dnaFit: "Good execution fit, weaker long-term DNA alignment",
    upside: "Fast pace and strong brand signal.",
    risk: "Role may keep you in reporting work, increasing AI exposure.",
  },
];

const factors = [
  ["Career DNA alignment", "30%", "Does this role fit your work style and strengths?"],
  ["Skill growth", "25%", "Will the role build scarce skills for the next 24 months?"],
  ["Compensation", "20%", "Salary, benefits, runway, and fair-pay benchmark."],
  ["Employer trust", "15%", "Response speed, transparency, graduate ratings, acceptance data."],
  ["Life fit", "10%", "Location, commute, stability, flexibility, personal preference."],
];

export function OfferDecisionDashboard({ scores }: { scores?: Record<string, number> } = {}) {
  const archetype = getArchetypeForScoresSafe(scores ?? { Technical: 88, Execution: 92, Communication: 76, Strategic: 60, Innovation: 52, Leadership: 64 });
  const dnaFitText = `${archetype.name} fit: ${archetype.oneLiner.replace(/\.$/, "").toLowerCase()}`;
  const [selected, setSelected] = useState(offers[0]);

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
              <p className="text-2xl font-bold mt-1">Maybank</p>
              <p className="text-sm text-emerald-300 mt-1">Best risk-adjusted choice</p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">Highest total fit after weighting DNA alignment, growth, compensation, trust, and life fit.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {offers.map(offer => {
            const active = selected.company === offer.company;
            return (
              <button
                key={offer.company}
                onClick={() => setSelected(offer)}
                className={`text-left border rounded-xl p-5 shadow-sm transition-all ${active ? "bg-blue-50 border-primary" : "bg-white border-border hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground">{offer.company}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{offer.role}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{offer.score}%</span>
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
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={17} className="text-primary" />
              <h2 className="font-semibold text-foreground">Decision weights</h2>
            </div>
            <div className="space-y-3">
              {factors.map(([name, weight, desc]) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <span className="text-xs font-bold text-primary">{weight}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: weight }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              ))}
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
          <button onClick={() => demoToast("Acceptance plan generated: negotiation script + start-date checklist \u2713")} className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
            Generate acceptance plan <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
