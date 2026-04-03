# Board Engagement Profile module

## Goal

Give leadership a **clear, professional** view of participation in meetings, decisions, and follow-up—**without** punitive framing, leaderboards, or gamification. Copy stays **neutral and supportive** (no “low performer,” “poor participation,” etc.).

---

## 1. Routing & navigation

| Item | Location |
|------|----------|
| Page | [`src/app/(dashboard)/engagement/page.tsx`](src/app/(dashboard)/engagement/page.tsx) → **`/engagement`** (App Router group matches existing Training/Voting pattern) |
| Sidebar | Add `{ href: "/engagement", label: "Engagement" }` to `defaultNav` in [`DashboardSidebar.tsx`](src/components/dashboard/DashboardSidebar.tsx) (after Voting or Training—pick one consistent spot) |

---

## 2. Data model

Add to [`types.ts`](src/lib/mock-data/types.ts) (mirror style of `boardTraining` / `boardVotes`):

```ts
export type EngagementStatus = "Highly Engaged" | "Active" | "Limited Participation" | "Needs Attention";

export interface BoardMemberEngagement {
  id: string;
  name: string;
  role: string;
  meetingsAttended: number;
  meetingsTotal: number;
  votesParticipated: number;
  votesTotal: number;
  actionsCompleted: number;
  actionsAssigned: number;
  lastActivityDate: string; // ISO or display string; prefer ISO + formatter for consistency
  /** Derived in UI or stored in mock for simplicity */
  engagementStatus?: EngagementStatus;
}
```

Add on **`OrganizationProfile`**:

```ts
boardEngagement: {
  members: BoardMemberEngagement[];
  /** Optional reporting period label; can match profile.reportingPeriod */
  periodLabel?: string;
};
```

**Derived fields** (helpers, not required on type unless convenient for mocks):

- `attendanceRate` = `meetingsAttended / meetingsTotal` (guard divide-by-zero)
- `votesMissed` = `votesTotal - votesParticipated`
- Voting participation rate = aggregate across members
- Actions completed rate = `actionsCompleted / actionsAssigned` per member and board-wide

Mock files (new): `src/lib/mock-data/engagement/community.ts`, `growing.ts`, `privateSchool.ts`—wire into [`genericSample.ts`](src/lib/mock-data/genericSample.ts), [`customizedPreview.ts`](src/lib/mock-data/customizedPreview.ts), [`privateSchool.ts` profile](src/lib/mock-data/profiles/privateSchool.ts).

**Status assignment rule** (document in helper): map from rates + overdue actions using **gentle thresholds** (e.g. high attendance + low overdue → Highly Engaged; several missed votes or many overdue actions → Needs Attention). Avoid single numeric “score” surfaced to UI.

---

## 3. Components (`src/components/engagement/`)

| Component | Responsibility |
|-----------|----------------|
| **`EngagementHeader`** | Title: “Board Engagement Overview”; description: “See how board members are participating in meetings, decisions, and follow-through.” |
| **`EngagementStatusPill`** | Props: `status: EngagementStatus`. Muted stone/amber/blue tones—**no red “failure”** for Limited/Needs Attention; optional subtle icon. |
| **`MemberEngagementCard`** | Props: member + derived rates (or full `BoardMemberEngagement` + helper). Show: name, role, attendance %, votes participated (and optionally missed as “not yet participated” copy), actions completed, last active date, status pill. **No ranking #1/#2.** |
| **`EngagementSummaryCards`** | Four stat cards: average attendance, voting participation rate (board), actions completed rate, **overall engagement level** (qualitative label + short subtext, not a competitive score). |
| **`ParticipationBreakdown`** | Per member: simple horizontal **bars** or stacked rows—meetings attended/total, votes participated/total, actions completed/assigned. Reuse existing card/border styles from dashboard. |

Export barrel [`src/components/engagement/index.ts`](src/components/engagement/index.ts) if the repo uses that pattern elsewhere.

---

## 4. Page layout (`/engagement`)

1. `EngagementHeader` + optional `InsightCallout` (one line: supportive, e.g. for planning conversations—not surveillance).
2. `EngagementSummaryCards` (grid).
3. `ParticipationBreakdown` section (could be inside each card or a dedicated section—prefer **breakdown below summary** for scanability).
4. Grid of `MemberEngagementCard` (sort by **name** or **role**, not by “worst first”—optional secondary sort by status for leadership-only future; default **alphabetical** to avoid leaderboard feel).

---

## 5. Overview integration

In [`overview/page.tsx`](src/app/(dashboard)/overview/page.tsx), add section **“Board engagement”**:

- One line summary: e.g. **“Board engagement: 82% · 2 members need follow-up”**  
  - Compute `avgParticipation` from a small helper over `profile.boardEngagement.members` (define participation as weighted blend of attendance + vote participation + action completion, **or** simplest v1: average attendance only—document choice in helper).
- Show **1–2 members** with status `Needs Attention` (or `Limited Participation` if none)—by name only, link **“View engagement”** → `/engagement`.
- Keep section visually light (matches StatCard / SectionHeader patterns).

---

## 6. Optional private view (structure only, demo)

**Do not block v1 on auth.** Add scaffolding:

- In [`demo-mode-context`](src/lib/demo-mode-context.tsx) (or adjacent), optional `engagementAudience: "leadership" | "member"` and `viewingMemberId?: string`.
- **Leadership**: full roster + all cards (default for demo).
- **Member**: filter to **single** `MemberEngagementCard` + summary text “Your participation” (mock toggle in dev tools or profile flag later).

Document in code comment: production = real RBAC; demo = toggle.

---

## 7. Tone & UX guardrails

- Labels: “Needs attention,” “Limited participation,” “Follow-up suggested”—**never** “poor” / “bad” / “low performer.”
- **No** leaderboards, badges, streaks, or public ranking.
- Visuals: soft cards, progress bars, percentages—**no** traffic-light person scores.

---

## 8. Future (comments / structure only)

- Time-series engagement trends
- Alerts & reminders (missed votes)—behind notifications layer
- Internal board health score (never default-visible to whole board)
- Export for governance review

---

## 9. Verification

- `npm run lint` / `npm run build`
- Quick visual pass: `/engagement` + Overview snippet

---

## 10. Coordination with other planned work

- **Decision speed / votes**: engagement `votesTotal` / `votesParticipated` should stay **logically consistent** with `boardVotes` counts per profile where possible (rough alignment in mock data is enough for demo).
- **Recruiting module**: no hard dependency; engagement is seated members only.
