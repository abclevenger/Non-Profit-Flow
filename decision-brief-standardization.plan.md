# Decision Brief Standardization

## Goal

Every **decision item** (vote, decision-type agenda row, strategic item needing a board decision) uses the same **Decision Brief** shape so members see **what**, **why**, **options**, **recommendation**, **impact**, **risks**, **timing**, and **materials**—reducing “can we get more information?” delays. UX: **structured, scannable, short blocks**—not legal prose or clutter.

**Align with:** If the **decision speed / clarity** dashboard plan is implemented, **merge** overlapping fields (`voteOptions`, `recommendedAction`, timing) into this **`DecisionBrief`** type so there is a **single source of truth** (avoid duplicating summary/options on `BoardVoteItem`).

---

## 1. Core type: `DecisionBrief`

New interface in [`types.ts`](src/lib/mock-data/types.ts) (or `src/lib/decisions/decisionBriefTypes.ts` re-exported):

```ts
export interface DecisionBriefOption {
  id: string;
  label: string; // "Option A" / short title
  description: string;
}

export interface DecisionBriefMaterial {
  id: string;
  title: string;
  href?: string;
  type?: "document" | "link" | "reference";
}

export interface DecisionBrief {
  /** Mirrors vote/agenda title; “What is being decided?” */
  title: string;
  /** 1–2 sentences */
  summary: string;
  whyThisMatters: string;
  options: DecisionBriefOption[]; // expect ≥2 for “multiple options” signal; allow 1 for ratification-style
  recommendation: string;
  impact: string; // financial / operational / strategic in one short block or structured sub-bullets in mock
  risks: string;
  /** Decision deadline + urgency — can mirror vote decisionDate + short note */
  timing: string;
  supportingMaterials: DecisionBriefMaterial[];
}
```

**Completeness rule** (helper `isDecisionBriefComplete(brief: DecisionBrief | undefined): boolean`):

- Required non-empty: `title`, `summary`, `whyThisMatters`, `recommendation`, `impact`, `risks`, `timing`
- `options`: at least **2** options **or** explicitly allow single-option motions via `options.length >= 1` + flag `singleOptionMotion?: true` (product choice—**recommend ≥2** for contested decisions; document exception for consent/ratification)
- `supportingMaterials`: **≥1** link/doc **or** `materialsWaived?: true` on brief for rare cases (if waived, still complete)

Tune rules so mocks pass; show **incomplete** states intentionally on 1–2 demo votes for storytelling.

---

## 2. Component: `DecisionBriefCard`

Location: [`src/components/decisions/DecisionBriefCard.tsx`](src/components/decisions/DecisionBriefCard.tsx) (new folder + barrel).

- Renders sections with **bold headers**: Summary, Why this matters, Options (A/B/C), Recommendation, Impact, Risks, Timing, Supporting materials.
- Props: `brief: DecisionBrief`, optional `variant: "full" | "compact"`, optional `qualitySignals?: DecisionBriefQualitySignals`.

**Decision quality signals** (subtle, supportive—not punitive):

```ts
export type DecisionBriefQualitySignals = {
  clearRecommendation: boolean;
  multipleOptionsPresented: boolean;
  riskAnalysisPresent: boolean; // false → “Risk section to strengthen” micro-hint
};
```

Derived in helper from brief content (e.g. `risks.trim().length > 40`, `options.length >= 2`).

---

## 3. Condensed view (vote cards)

Extend [`VoteItemCard`](src/components/voting/VoteItemCard.tsx) (or small child `DecisionBriefCondensedRow`):

- **Title** (existing)
- **Recommendation** (first line or truncated from `brief.recommendation`)
- **Deadline** (`decisionDate` / timing line)
- **Risk level** — derive **Low / Medium / High** from brief text **or** optional `riskLevel?: "Low" | "Medium" | "High"` on brief for demo consistency—keep **subtle** chip, not alarmist.

If no brief: show “Brief not started” or omit condensed row.

---

## 4. Enforcement (demo behavior)

Target state name: user asked **“Ready for Vote”** — codebase uses **`Open for Vote`** for live voting and may add **`DecisionReadiness`** from the decision-speed plan.

**Rule:** A vote cannot be shown as **ready to open** / cannot transition to **`Open for Vote`** (and coordinator cannot complete “open vote” action) **unless** `isDecisionBriefComplete(vote.decisionBrief)`.

UI:

- Banner on voting detail / coordinator strip: **“Decision brief incomplete — cannot proceed to vote”** when user attempts transition or when `status === "Scheduled"` and brief incomplete (educational).
- For **read-only demo**: no real state machine—use **visual gate** + disabled primary control on [`CoordinatorControlsCard`](src/components/voting/CoordinatorControlsCard.tsx) or equivalent.

Strategic / agenda: **soft** enforcement—show completeness badge, no hard block unless tied to a vote.

---

## 5. Data attachment

| Surface | How |
|---------|-----|
| **Vote** | `decisionBrief?: DecisionBrief` on [`BoardVoteItem`](src/lib/mock-data/types.ts) |
| **Agenda** | If `WorkflowAgendaItem.linkedVoteId` → resolve brief from **vote** (DRY). If agenda-only decision **without** vote yet: add optional `decisionBrief?: DecisionBrief` on `WorkflowAgendaItem` **or** `draftDecisionBriefs: Record<agendaItemId, DecisionBrief>` on `BoardMeeting`—prefer **optional field on `WorkflowAgendaItem`** for demo simplicity. |
| **Strategy** | Optional `decisionBrief?: DecisionBrief` on `StrategicPriority` when `kind` or flag `requiresBoardDecision?: true` (add flag if needed). |

Populate mocks in [`votes/*.ts`](src/lib/mock-data/votes/) and meeting agenda fixtures; add **one** incomplete brief example.

---

## 6. UI integration points

1. **Voting page** — Above discussion / timeline: render **`DecisionBriefCard`** for `selected` vote when `decisionBrief` present; placeholder CTA when missing.
2. **Meeting detail** [`meetings/[id]/page.tsx`](src/app/(dashboard)/meetings/[id]/page.tsx) — For agenda rows with decision + linked vote, show condensed brief or link “View decision brief” expanding inline.
3. **Strategy** — [`StrategicPriorityCard`](src/components/strategy/StrategicPriorityCard.tsx) or detail panel: if `decisionBrief`, show collapsible `DecisionBriefCard` (compact).

---

## 7. Decision history

- **v1:** **Finalized / Closed** votes **retain** `decisionBrief` on `BoardVoteItem`—that **is** the historical record.
- Add section **“Recent decision briefs”** on Voting page or new subsection: list last N closed votes with **title + recommendation one-liner + date** → expand full `DecisionBriefCard` read-only.
- Optional profile array `decisionBriefArchive` only if votes are pruned in future—**not required** for demo.

---

## 8. Overview: “Upcoming Decisions”

In [`overview/page.tsx`](src/app/(dashboard)/overview/page.tsx):

- Section **“Upcoming decisions”**
- Source: votes in `Draft` | `Scheduled` | `Open for Vote` (and optionally agenda items with briefs in next meeting)
- Each row: **title**, **readiness** (e.g. Brief complete / Needs information), link to `/voting?vote=id` when query supported
- Summary line: **“2 decisions ready · 1 needs more information”** from `isDecisionBriefComplete` counts

---

## 9. UX guardrails

- Sections, bold headers, **2–4 sentence** max per field in mocks.
- No long paragraphs; no dense legal tone.
- Quality signals as **small neutral chips** (e.g. stone/blue), not red “FAIL” states.

---

## 10. Future (comments / structure)

- Templates by decision type (finance, governance, HR)
- Auto-summary / AI-assisted draft
- Pre-vote feedback thread tied to brief version
- Export to board packet PDF

---

## 11. Documentation

Short [`src/components/decisions/README.md`](src/components/decisions/README.md) or section in main README:

- What `DecisionBrief` is
- Completeness rules and `isDecisionBriefComplete`
- How agenda links to vote brief
- Where to extend for templates / export

---

## 12. Verification

- `npm run lint` / `npm run build`
- Spot-check: voting (complete vs incomplete), meeting agenda, strategy card, overview section

---

## Implementation checklist

- [ ] `DecisionBrief` + helpers (`isDecisionBriefComplete`, quality signal derivation)
- [ ] `DecisionBriefCard` + condensed subcomponent for vote cards
- [ ] `BoardVoteItem.decisionBrief` + mock data (include 1 incomplete)
- [ ] Optional `WorkflowAgendaItem.decisionBrief` / vote resolution path
- [ ] Optional `StrategicPriority.decisionBrief` + flag
- [ ] Voting + meeting + strategy integration
- [ ] Enforcement messaging + coordinator gate (demo)
- [ ] Overview “Upcoming decisions”
- [ ] Decision history subsection (closed votes)
- [ ] README + lint/build
