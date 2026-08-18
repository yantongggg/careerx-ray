# Where the data comes from

Short version: **the product logic is real code that executes; the
market layer underneath it is authored data compiled into the bundle.**
There is no data pipeline, no scraping, and no live feed. This document
lists every dataset and where it lives, so the claim can be checked
rather than taken on trust.

Verified by static analysis of `src/`: **zero** occurrences of `fetch(`,
`axios`, `XMLHttpRequest`, or `WebSocket`. The single exception is the
resume-analysis call described at the bottom.

---

## What computes at runtime

These run as real functions on the user's own inputs. Same input, same
output, every time — which is what makes the "why this score?" panels
answerable.

| Logic | Location |
|---|---|
| Career DNA scoring from calibration answers | `src/app/pages/Onboarding.tsx` — `score = 35 + 55 × points / 6` |
| Archetype resolution (6 dimensions → 1 of 12) | `src/app/lib/careerDna.js` |
| Risk derivation for the current role | `src/app/lib/careerRisk.ts` — `deriveRisks()` |
| Target-role gap derivation | `src/app/lib/careerRisk.ts` — `deriveTargetGaps()` |
| The four headline scores | `src/app/lib/careerRisk.ts` — `deriveScorecard()` |
| Role-family classification | `src/app/lib/roleFamily.ts` — `detectRoleFamily()` |
| Rejection-reason normalisation | `src/app/state/intelligence.tsx` — `normalizeSkill()` |
| Hiring-signal aggregation and cluster mapping | `src/app/state/intelligence.tsx`, `src/app/pages/universitySignals.tsx` |
| Curriculum gap derivation from live signals | `src/app/pages/CurriculumEngine.tsx` |
| Resume text extraction | `src/app/lib/resumeParse.ts` — runs in the browser via `unpdf` |
| Resume field parsing (fallback path) | `src/app/lib/resumeParse.ts` — `parseResumeRuleBased()` |
| Resume and cover-letter generation | `src/app/lib/resumeGen.ts` |
| Offer scoring | `src/app/pages/OfferDecisionDashboard.tsx` — weighted sum, weights in one place |

## What is authored

Every figure below was written by us as a stand-in for a market data
feed. None of it is measured, and the UI does not claim it is.

| Dataset | Location | What it covers |
|---|---|---|
| Automation exposure baselines | `src/app/lib/careerRisk.ts` — `AUTOMATION_BASE` | Per role family |
| Market salary medians | `src/app/lib/careerRisk.ts` — `MARKET_MEDIAN` | 8 role families × 3 seniority bands, RM/month |
| Key credential per family | `src/app/lib/careerRisk.ts` — `KEY_CREDENTIAL` | What most often blocks a move |
| Market trend narratives | `src/app/pages/BlindSpots.tsx` — `marketTrends` | 5 families × 3 trends |
| Role-shift maps and reposition paths | `src/app/pages/BlindSpots.tsx` — `marketMoves` | Declining roles, growth lanes, skill overlap |
| 12-month demand curves | `src/app/pages/BlindSpots.tsx` — `buildTrendData` | **Synthesised**: linear slope plus a sine term. Labelled in the UI as a modelled index, not measured postings |
| Employer salary benchmarks | `src/app/pages/DecisionLab.tsx` — `SALARY_DATA` | 3 positions × 7 Malaysian employers |
| Future-path projections | `src/app/pages/DecisionLab.tsx` — `futures` | 3 scenarios, 10 time points each |
| Role transition rules | `src/app/state/intelligence.tsx` — `ROLE_GAP_RULES` | 5 authored transitions plus a generic fallback |
| Baseline hiring outcomes | `src/app/state/intelligence.tsx` — `SEED_SIGNALS`, and the 218 baseline count | Gives the intelligence graph a history before the demo starts |
| Interview question sets | `src/app/pages/InterviewCoach.tsx` — `ROLE_DATA` | 3 employers |
| Job listings | `src/app/pages/ApplicationPrep.tsx` — `ALL_JOBS` | 3 roles |
| Employer, university and pipeline datasets | `src/app/pages/` — `HiringPipeline`, `EcosystemInsights`, `CurriculumEngine`, `OutcomeLoop`, and siblings | All authored |
| Aspiration profiles per role family | `src/app/pages/CareerDna.tsx` — `ASPIRATION_BY_FAMILY` | What each family's roles lean on |

**No real person appears anywhere in this repository.** Every candidate,
employer contact and hiring outcome is invented.

## The one network call

`api/analyze-resume.ts` is a Vercel serverless function that sends
extracted resume **text** (never the file) to Claude for field
extraction, and returns structured fields.

- The API key lives in the Vercel environment and never reaches the client.
- If the key is absent, the endpoint returns 503 and the client falls
  back to `parseResumeRuleBased()`.
- Any failure — offline, rate limited, malformed — falls back the same
  way. The UI records which path ran on `ParsedResume.method` and
  displays it, so rule-based output is never presented as AI output.

The model extracts and never scores. Every number the product shows is
produced by the deterministic logic in the first table.

## What we would replace first, given real data

1. `MARKET_MEDIAN` and the employer salary benchmarks — a live salary
   corpus is the single highest-value swap.
2. `marketMoves` and the demand curves — replace the synthesised index
   with a real job-posting time series.
3. `SEED_SIGNALS` and the baseline outcome count — these become real the
   moment the Career Intelligence Graph has actual employer traffic.

The interfaces are already shaped for it: each of these is a plain data
structure behind a pure function, so swapping the source does not touch
the product logic.
