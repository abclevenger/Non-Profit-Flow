# Predictive governance & strategic insights

## Goal

Strengthen **Governance** with **proactive governance prompts**, **lightweight scenario modeling**, and **anonymized benchmarking**—surfaced **in context** (overview, voting, grants, compliance, strategy) so boards can **act sooner** and **govern with clearer foresight**. This remains a **demo-first** product: rules run on **mock profile data** and **derived signals**; benchmarking uses **curated synthetic cohort stats** until a real analytics pipeline exists.

**Related:** [AI-driven agenda & planning support](./ai-agenda-planning-support.plan.md) adds an **LLM agenda builder**, **AI prioritization**, **AI narrative** for scenarios/benchmarks, and **chair facilitation nudges**—with **heuristic fallbacks** when no API key is configured.

---

## 1. Design principles

- **Supportive, not noisy:** Cap visible prompts per page (e.g. top 3–5); collapse “see all insights.”
- **Explain the link:** Each prompt states **what** is wrong/at risk and **why it matters** (one line).
- **Action-oriented:** Primary link to the **module** where the user fixes the issue (`/voting`, `/grants`, `/compliance`, etc.).
- **Honest about data:** Benchmarking labeled **“Illustrative peer snapshot (anonymized)”** or similar—no fake precision.
- **No legal advice:** Copy clarifies insights are **planning aids**, not determinations of compliance.

---

## 2. Proactive prompts (alerts)

### 2.1 Concept

A unified **`GovernanceInsight`** (or **`ProactivePrompt`**) model computed from `OrganizationProfile` + optional future auth role (for “leadership only” insights).

Suggested shape:

```ts
type InsightSeverity = "info" | "attention" | "risk";
type InsightCategory =
  | "governance_element"
  | "timeline"
  | "cross_module"
  | "readiness";

interface GovernanceInsight {
  id: string;
  severity: InsightSeverity;
  category: InsightCategory;
  title: string;
  detail: string;
  /** Where to act */
  href: string;
  /** e.g. vote id, grant checklist id — for deduping */
  relatedIds?: string[];
}
```

### 2.2 Rule examples (implement as pure functions)

| Rule | Inputs | Example message |
|------|--------|-----------------|
| Missing compliance / policy signal | `boardVotes`, `profile.governance`, optional `boardCompliance` / grant checklist when those modules exist | “Policy review not reflected for an open finance vote” |
| Decision brief incomplete | `BoardVoteItem` + [Decision Brief](./decision-brief-standardization.plan.md) | “Brief incomplete — decision may stall” |
| Vote overdue / closing soon | Parsed dates + `BoardVoteStatus` | “Voting closes in 48h — 2 items still in draft” |
| Timeline cascade | Vote `decisionDate` vs [grant readiness](./grant-readiness-module.plan.md) deadlines | “Delayed board vote may push grant submission past internal target” |
| Minutes lag | `meetingMinutes` + `boardMeetings` | “Last approved minutes &gt; 60 days — funder diligence risk” |
| Strategic priority at risk + linked decision | `strategicPriorities` + votes | “At-risk priority tied to undecided vote” |

**Helper module:** e.g. `src/lib/insights/governanceInsights.ts` — `buildGovernanceInsights(profile): GovernanceInsight[]`, sorted by severity then relevance.

### 2.3 UI

- **`InsightStrip` or `ProactivePromptCard`** — compact list with icon tone (stone / amber / rose), title, detail, link.
- **Overview:** New section **“Insights for your board”** (or inject above key blocks).
- **Contextual:** On **`/voting`**, filter insights where `relatedIds` includes vote ids; same pattern for future `/grants`, `/compliance`.

---

## 3. Scenario modeling

### 3.1 Concept

**What-if** sliders or presets that **recompute projected dates/outcomes** client-side from a small **dependency graph** (no heavy simulation).

**Scenario parameters (v1):**

- Delay vote decision by **+N days** (per selected vote or global “next 3 decisions”).
- Delay **next board meeting** by **+N weeks** (shifts agenda-linked votes).

**Outputs (display as text + simple timeline):**

- Shifted **grant readiness** target (if [grant module](./grant-readiness-module.plan.md) exists: map to checklist “submission window”).
- Shifted **compliance** filing reminder (if [compliance module](./compliance-governance-module.plan.md) exists).
- **Human-readable** summary: “Under this scenario, your notional grant draft deadline moves from X → Y.”

### 3.2 Data / logic

- **`ScenarioModel`** — inputs + derived outputs as plain objects; optionally persist last scenario in **`sessionStorage`** (demo).
- **Route:** `/strategy/scenarios` **or** a **drawer/modal** launched from Overview (“Model timeline impact”) to avoid a heavy new IA; **recommend** modal/drawer on Overview + deep link from Strategy page.
- **Component:** `ScenarioModelingPanel` — presets (“2-week slip”, “Meeting postponed 3 weeks”), outcome bullets, **reset**.

### 3.3 Guardrails

- Label outputs **“Projected (illustrative)”**; no automated “you will miss the grant.”

---

## 4. Anonymized benchmarking

### 4.1 Concept

Show **cohort comparison** metrics that feel credible but are **explicitly synthetic** in the demo.

**Metrics (pick 2–3 for v1):**

- Median **days from draft → finalized** vote (similar org size / sector tag from `SampleProfileId` or future `organizationType`).
- **% of boards** with policies current (illustrative).
- **Typical** time to post minutes after meeting (illustrative).

**Data source v1:** Static JSON under `src/lib/insights/benchmarks.json` keyed by archetype (`communityNonprofit`, `growingNonprofit`, `privateSchool`) — **not** real user data.

### 4.2 UI

- **`BenchmarkSparkline` or `PeerComparisonCard`** — “Your dashboard (sample): ~12 days · **Similar nonprofits (anonymized): ~9 days**” with footnote.
- **Placement:** Overview sidebar or bottom of **Insights** section; optional one line on **Voting** page footer.

### 4.3 Future

- Pipe to **aggregated analytics** (opt-in, anonymized, minimum cell sizes); legal/privacy review before production.

---

## 5. Cross-module integration map

| Source module | Feeds insights | Scenario uses |
|---------------|----------------|---------------|
| Voting / votes | Deadlines, brief completeness, status | Delay propagation |
| Meetings | Meeting date, agenda decisions | Meeting slip |
| Minutes | Recency, approval | Governance prompts |
| Strategy | Priority status | At-risk linkage |
| Grant readiness (when built) | % complete, critical gaps | Cascade messaging |
| Compliance (when built) | Filings due | Cascade messaging |
| Decision brief (when built) | Completeness gate | Prompts |

---

## 6. Implementation phases

**Phase A — Insights engine + Overview**

- Types + `buildGovernanceInsights(profile)` with rules that work on **today’s** `OrganizationProfile` only.
- `ProactivePromptCard` / list on Overview.
- Unit-style tests optional: pure functions + fixture profile.

**Phase B — Contextual surfaces**

- Filter insights on `/voting` (and stub hooks for future routes).
- Optional “all insights” page `/insights` if the list grows (otherwise avoid).

**Phase C — Scenario modeling**

- `ScenarioModelingPanel` + storage + copy; wire to meeting/vote dates from profile.

**Phase D — Benchmarking**

- JSON cohort data + `PeerComparisonCard` on Overview.

---

## 7. Files to add / touch (when implementing)

| Area | Likely paths |
|------|----------------|
| Types & builders | `src/lib/insights/types.ts`, `governanceInsights.ts`, `scenarioModel.ts` |
| Benchmarks | `src/lib/insights/benchmarks.json`, `benchmarkHelpers.ts` |
| UI | `src/components/insights/*.tsx` |
| Overview | [`src/app/(dashboard)/overview/page.tsx`](src/app/(dashboard)/overview/page.tsx) |
| Voting | [`src/app/(dashboard)/voting/page.tsx`](src/app/(dashboard)/voting/page.tsx) |
| Strategy | Optional entry point from [`strategy/page.tsx`](src/app/(dashboard)/strategy/page.tsx) |

---

## 8. Verification

- `npm run lint` / `npm run build`
- Manual: Overview shows insights; voting page shows subset; scenario panel updates copy when sliders change; benchmark footnote visible.

---

## 9. Dependencies on other plans

Implementing **full** cross-module prompts (grant + compliance cascades) is easiest **after** [`grant-readiness-module.plan.md`](grant-readiness-module.plan.md) and [`compliance-governance-module.plan.md`](compliance-governance-module.plan.md) exist on the profile; until then, use **stubs** (e.g. insights appear when `profile.boardGrantReadiness` is present).

---

## Implementation checklist

- [ ] `GovernanceInsight` types + `buildGovernanceInsights(profile)` rules (votes, minutes, meetings, strategy; stubs for grant/compliance)
- [ ] `InsightStrip` / `ProactivePromptCard` + Overview section + contextual filter on Voting
- [ ] `ScenarioModelingPanel` + scenario helpers + link from Overview/Strategy
- [ ] `benchmarks.json` + `PeerComparisonCard` + anonymized disclaimer
- [ ] README or in-app tooltip: illustrative data, not legal advice
- [ ] Lint / build
