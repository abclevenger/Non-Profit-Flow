# AI-driven agenda & planning support

## Goal

Help boards **plan meetings proactively** with an **AI-assisted agenda builder**, **smart prioritization**, **AI-augmented scenario impact** (timeline shifts), **anonymized benchmarking with optional narrative**, and **contextual facilitation nudges** (e.g. chair: allow more discussion time). Everything stays **human-in-the-loop**: AI proposes; chairs/coordinators **review, edit, and approve**. Aligns with and **extends** [Predictive governance & strategic insights](./predictive-governance-strategic-insights.plan.md) (shared scenario/benchmark concepts; this plan adds **LLM integration** and **agenda-specific UX**).

---

## 1. Design principles

- **Chair owns the agenda:** AI output is always a **draft**; never auto-publish to “official” packet without explicit action.
- **Graceful degradation:** With **no API key**, provide a **deterministic agenda suggestion** (same inputs, rule-based ordering) so the product works in demos and offline review.
- **Contextual, not chatty:** Short rationale bullets per item; optional “Explain” expand.
- **Privacy:** Send **minimized context** to models (titles, dates, statuses—not member PII). Document retention policy for production.
- **Transparency:** Show **“Suggested by AI”** vs **“Rule-based draft”** badges.
- **No legal advice:** Planning aid only.

---

## 2. Data inputs (from `OrganizationProfile`)

| Source | Use |
|--------|-----|
| **`boardMeetings`** | Past and upcoming `WorkflowAgendaItem` rows, `meetingDate`, `voteItems`, `actionItems` |
| **`meetingMinutes`** | Discussion length proxy (if `discussionNotes` length / `decisionsMade` count available); recurrence of topics |
| **`boardVotes`** | Open / draft / overdue votes → decision items on agenda |
| **`actionItems`** | Unresolved / overdue → carry-forward |
| **`strategicPriorities`** | At-risk / due-soon → strategic block |
| **`complianceCalendar`** / future **compliance** / **grant** modules | Deadlines → time-sensitive placement |
| **User role** (from auth session) | Chair-only nudges vs all-board summaries |

Normalize into an internal **`AgendaPlanningContext`** JSON passed to the model (and to the heuristic engine).

---

## 3. AI-powered agenda builder

### 3.1 Output shape

```ts
interface SuggestedAgendaItem {
  id: string;
  title: string;
  kind: "decision" | "discussion" | "information" | "consent" | "other";
  suggestedOrder: number;
  estimatedMinutes?: number;
  rationale: string; // one short sentence
  linkedVoteId?: string;
  linkedActionId?: string;
  linkedMeetingId?: string;
  urgencyScore?: number; // 1–5 for UI sorting
}

interface AgendaDraft {
  meetingLabel: string;
  targetDate?: string;
  items: SuggestedAgendaItem[];
  openingNotes?: string; // AI summary for chair
  generatedAt: string;
  source: "ai" | "heuristic";
}
```

### 3.2 Prioritization signals

| Signal | How |
|--------|-----|
| **Urgency** | Vote `decisionDate` / `closesAt`, compliance dates, grant readiness gates |
| **Frequency** | Topics appearing in **N** of last **M** minutes or agendas (string/title similarity heuristic) |
| **Past discussion** | Proxy: length of `discussionNotes` or linked thread count on votes (when available) → boost time estimate |

**Heuristic engine:** `buildHeuristicAgendaDraft(context): AgendaDraft` — sort by urgency, interleave consent vs heavy decisions, cap total estimated minutes.

**AI path:** Server Route Handler `POST /api/ai/agenda-draft` (or Server Action) using **Vercel AI SDK** + provider (`openai`, `anthropic`, etc.): system prompt encodes board governance tone; user message = stringified `AgendaPlanningContext` + instructions to return **structured JSON** (`generateObject` / tool schema).

### 3.3 UI placement

- **Primary:** [`/meetings`](src/app/(dashboard)/meetings/page.tsx) — **“Draft agenda with AI”** opens side panel or `/meetings/plan` subpage.
- **Secondary:** Next meeting card on [**Overview**](src/app/(dashboard)/overview/page.tsx) — shortcut button.
- **Flow:** Load context → show skeleton → display draft list (drag-and-drop reorder optional v2) → **Copy to clipboard** / **Save as draft** (v1: client state + `localStorage` key per profile; v2: API persistence).

---

## 4. AI-based scenario modeling

**Extends** the deterministic **`ScenarioModelingPanel`** in the predictive insights plan.

- **Inputs:** Same delays (vote slip, meeting slip) + `AgendaPlanningContext`.
- **AI output:** 2–4 bullet **“projected impacts”** (grant window, milestone, compliance) in plain language—**grounded** on profile dates so the model **cannot invent** dates (pass computed baseline dates in the prompt; ask model to explain shifts only).
- **UI:** Toggle **“Add AI summary”** on the scenario panel; if no key, show deterministic bullets only.
- **Route:** `POST /api/ai/scenario-summary` with `{ scenarioParams, profileSnapshot }`.

---

## 5. Anonymized benchmarking + AI narrative

- **Numbers:** Reuse **synthetic cohort** JSON from [predictive plan §4](./predictive-governance-strategic-insights.plan.md) (`benchmarks.json` by archetype).
- **AI layer (optional):** Given **org metrics** (avg days open vote → closed, count of agenda items next meeting) + **cohort row**, generate a **short comparative paragraph** (“Boards like yours often …”) with mandatory footer: **“Illustrative anonymized benchmark—not a performance rating.”**
- **Route:** `POST /api/ai/benchmark-narrative` or client-only template merge if no API key.

---

## 6. Contextual prompts (facilitation nudges)

Extend **`GovernanceInsight`** (predictive plan) with:

```ts
type InsightCategory = ... | "facilitation";

// Examples:
// - "Heavy decision block: consider 15 extra minutes for Item 3"
// - "Consent agenda large: split if any member requested discussion (policy)"
```

**Rules + AI hybrid:**

- **Heuristics:** If estimated decision minutes &gt; X% of meeting slot, or ≥3 high-urgency votes stacked consecutively → insight.
- **AI (optional):** Given ordered `SuggestedAgendaItem[]`, return `facilitationNotes: string[]` for **chair-only** display (check `session.user.role`).

**Surface:** Overview insight strip; **Meeting plan** panel header; optional email-style digest (future).

---

## 7. Technical stack (when implementing)

| Piece | Recommendation |
|-------|------------------|
| SDK | [`ai`](https://www.npmjs.com/package/ai) (Vercel AI SDK) + chosen provider adapter |
| Structured output | `generateObject` with Zod schema for `AgendaDraft` |
| Env | `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` etc.; feature flags `AI_AGENDA_ENABLED` |
| Rate limits | Per-org throttle in production |
| Logging | Store prompt hashes + output version, not raw PII |

If the repo **must stay zero-API-key**, ship **heuristic-only** v1 and stub routes that return `501` with message.

---

## 8. Dependencies & order

1. **`AgendaPlanningContext` builder** from existing mock profile (no AI).
2. **Heuristic `AgendaDraft`** + basic UI.
3. **API routes** + AI SDK + structured output.
4. **Scenario + benchmark** AI wrappers.
5. **Facilitation insights** merged into `buildGovernanceInsights` or parallel `buildFacilitationInsights`.

Grant/compliance strings in prompts improve when those profile fields exist (see other module plans).

---

## 9. Verification

- With **no** API key: heuristic agenda + deterministic scenario still work.
- With **mock** key in dev: agenda JSON validates against schema; chair nudge appears for stacked heavy items.
- `npm run lint` / `npm run build`; manual pass on `/meetings` and Overview.

---

## Implementation checklist

- [ ] `AgendaPlanningContext` + `buildHeuristicAgendaDraft`
- [ ] Meetings UI: draft panel/page + copy/save draft (local v1)
- [ ] `POST /api/ai/agenda-draft` + Zod schema + AI SDK (optional env)
- [ ] Extend scenario UI with AI impact summary API
- [ ] Benchmark narrative API + `PeerComparisonCard` hook-up
- [ ] Facilitation insights (heuristic + optional AI) for chairs
- [ ] README: env vars, privacy note, heuristic fallback
- [ ] Lint / build
