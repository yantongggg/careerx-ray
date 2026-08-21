# Where the data comes from

Short version: **the product logic is real code that executes; the
market layer underneath it is authored data compiled into the bundle.**
There is no data pipeline, no scraping, and no live feed. This document
lists every dataset and where it lives, so the claim can be checked
rather than taken on trust.

Verified by static analysis of `src/`: **zero** occurrences of `axios`,
`XMLHttpRequest`, or `WebSocket`, and no third-party host is contacted
from the browser. There are exactly **four** `fetch(` calls, all to our
own `/api/*` functions, all optional, and all listed at the bottom.

---

## What computes at runtime

These run as real functions on the user's own inputs. Same input, same
output, every time — which is what makes the "why this score?" panels
answerable.

| Logic | Location |
|---|---|
| Career DNA scoring from calibration answers | `src/app/lib/careerDna.js` — `calculateCareerDna()`, a preference matrix over three opposing axes |
| Archetype resolution (6 dimensions → 1 of 12) | `src/app/lib/careerDna.js` — z-score corrected against every archetype's baseline |
| Word matching between a résumé and a posting | `src/app/lib/skillMatch.ts` — one implementation, shared by the fit score, the coverage line and the skill graph |
| The job / future / interview corpus, keyed by role family | `src/app/lib/careerCorpus.ts` — `corpusFor()` |
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
| Employer salary benchmarks | `src/app/lib/careerCorpus.ts` — `buildSalaryLandscape()` | Derived from `MARKET_MEDIAN`, not a second table |
| Future-path projections | `src/app/lib/careerCorpus.ts` — `futuresFor()` | 3 scenarios generated from the user's own current and target roles |
| Role transition rules | `src/app/state/intelligence.tsx` — `ROLE_GAP_RULES` | Used by the intelligence graph only; the gap list no longer reads it |
| Baseline hiring outcomes | `src/app/state/intelligence.tsx` — `SEED_SIGNALS`, and the 218 baseline count | Gives the intelligence graph a history before the demo starts |
| Interview question sets | `src/app/lib/careerCorpus.ts` — `interview` on each posting | One set per posting, in both authored families |
| Job listings | `src/app/lib/careerCorpus.ts` — `jobs` per family | 6 data, 6 software, plus generic postings titled from the user's own target |
| Gap card copy for the two decisive gaps | `src/app/lib/careerRisk.ts` — `AUTHORED_GAP` | Everything else on that page is derived |
| Employer, university and pipeline datasets | `src/app/pages/` — `HiringPipeline`, `EcosystemInsights`, `CurriculumEngine`, `OutcomeLoop`, and siblings | All authored |
| Aspiration profiles per role family | `src/app/pages/CareerDna.tsx` — `ASPIRATION_BY_FAMILY` | What each family's roles lean on |

**No real person appears anywhere in this repository.** Every candidate,
employer contact and hiring outcome is invented.

## The four network calls

Every one is a Vercel serverless function of ours, every one is
optional, and every one degrades to local logic rather than to an error.
`ANTHROPIC_API_KEY` lives in the Vercel environment and never reaches
the client bundle.

| Endpoint | Sends | If the key is absent |
|---|---|---|
| `api/analyze-resume.ts` | Résumé **text** only — the file never leaves the device | 503, and `parseResumeRuleBased()` runs in the browser |
| `api/chat.ts` | The question and the derived scan summary | 503, and `localChatReply()` answers from the same derivation |
| `api/what-if.ts` | Two named options and the target role | 503, and `localWhatIf()` scores them locally |
| `api/github.ts` | A public GitHub handle | Not key-gated — GitHub's public REST API needs no auth; `GITHUB_TOKEN` only raises the rate limit |

The UI records which path ran and displays it, so rule-based output is
never presented as AI output.

**The models extract, phrase and compare. None of them scores.** Every
number the product shows is produced by the deterministic logic in the
first table, which is why the "why this score?" panels can print the
arithmetic.

Nothing is scraped. GitHub is read through its own documented public
API. LinkedIn is a manual paste and always will be: their API is gated
behind partner approval, and scraping it breaches their terms.

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
