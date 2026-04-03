# Compliance & Governance module

## Goal

A **single, calm place** to see **organizational compliance and governance health**: filings, policies, board documentation, and financial oversight—**without** dense legal copy or alarmist UX. Users should immediately see **what is on track**, **what needs attention**, and **what is next** (timeline). This is **not** a replacement for counsel or filings software; it is a **board-facing readiness and gap view**.

**Relationship to existing [`/governance`](src/app/(dashboard)/governance/page.tsx):** That route stays as **governance narrative + health card + compliance calendar list**. The new **`/compliance`** module is the **structured checklist, score, alerts, and deadline timeline** that can **reference** the same underlying mock data (`governance`, `complianceCalendar`, `meetingMinutes`, `boardVotes`) via links and optional **derived hints**.

**Relationship to [Grant Readiness](./grant-readiness-module.plan.md):** Grant module = **funder prep** checklist. Compliance module = **standing + obligations** broadly. Some policy rows may **overlap in theme**; keep **separate bundles** (`boardGrantReadiness` vs `boardCompliance`) and optional cross-link copy (“Also reviewed in Grant readiness”) where helpful—not merged into one type.

---

## 1. Routing & navigation

| Item | Location |
|------|----------|
| Page | [`src/app/(dashboard)/compliance/page.tsx`](src/app/(dashboard)/compliance/page.tsx) → **`/compliance`** |
| Sidebar | `{ href: "/compliance", label: "Compliance" }` in [`DashboardSidebar.tsx`](src/components/dashboard/DashboardSidebar.tsx) |
| Overview | Section **“Compliance”** (see §6) |

---

## 2. Data model

### Checklist status

`ComplianceChecklistStatus = "Complete" | "Needs Attention" | "Missing"`

(Optional alias display strings: **On track** / **Needs attention** / **Missing** per tone spec.)

### `ComplianceChecklistItem`

| Field | Notes |
|-------|--------|
| `id` | Stable string |
| `section` | `FilingsDeadlines` \| `GovernancePolicies` \| `BoardActivity` \| `FinancialOversight` |
| `label` | Short line |
| `status` | Complete / Needs Attention / Missing |
| `lastUpdated` | Display or ISO |
| `critical` | Drives “compliance risk” banner when not Complete |
| `linkedModule?` | `minutes` \| `voting` \| `governance` \| `succession` \| `documents` |
| `riskFlag?` | `Overdue` \| `Missing` \| `ExpiringSoon` \| `NeedsReview` — for **RiskFlagIndicators** |

### `ComplianceTimelineEvent`

| Field | Notes |
|-------|--------|
| `id` | string |
| `title` | e.g. “990 filing”, “Bylaws review” |
| `dueDate` | ISO preferred for sorting |
| `kind` | `filing` \| `policyReview` \| `audit` \| `other` |
| `status` | `upcoming` \| `dueSoon` \| `overdue` (or derive from date) |

### Profile bundle

```ts
boardCompliance: {
  checklist: ComplianceChecklistItem[];
  timeline: ComplianceTimelineEvent[];
  /** hoa | school | faith | nonprofit — copy + which rows are critical in mocks */
  complianceProfile?: "hoa" | "school" | "faith" | "nonprofit";
};
```

**Mocks:** `src/lib/mock-data/compliance/community.ts`, `growing.ts`, `privateSchool.ts` — wire into all profiles. Reuse or mirror tone of [`complianceCalendar`](src/lib/mock-data/types.ts) on `OrganizationProfile` where it helps the **timeline** (optional merge in UI: show `profile.complianceCalendar` rows alongside `boardCompliance.timeline` with labels).

---

## 3. Helpers (`src/lib/compliance/complianceHelpers.ts`)

- **`compliancePercent(checklist)`** — same family as grant readiness (weighted or count-based); document formula.
- **`complianceSummary(checklist)`** — complete / needs attention / missing counts; critical gap count.
- **`complianceAlerts(checklist, timeline)`** — overdue filings, missing policies, outdated docs → strings for **ComplianceAlertsCard** (e.g. **“2 items overdue · 1 critical gap”**).
- **`complianceBanner(checklist): "risk" | "good" | "mixed"`**
  - **risk:** any **critical** item not Complete → **“Compliance risk detected — action required”** (calm styling, not red panic)
  - **good:** high % complete **and** no critical Missing → **“Organization is in good standing”**
  - **mixed:** default in-between reassurance

### Cross-module derivation (important, v1 scope)

Implement **optional** `enrichComplianceFromProfile(profile)` or individual heuristics:

| Source | Signal (examples) |
|--------|-------------------|
| **Minutes** [`meetingMinutes`](src/lib/mock-data/types.ts) | If no Approved/Published record in last X days → suggest **Needs Attention** on “Meeting minutes current” **or** surface only in Alerts without mutating checklist (prefer **alerts** + **link to /minutes** to avoid fighting authored mock). **v1:** authored checklist + **one** alert line when heuristic matches. |
| **Voting** `boardVotes` | If zero **Closed/Finalized** votes in period → soft flag “Decisions documented”; else link `/voting`. |
| **Governance** `profile.governance` | Map known labels to policy rows **or** show “Review governance module” on policy gaps. |
| **Succession** [`board-succession-module.plan.md`](board-succession-module.plan.md) | When `boardSuccession` exists: link **“Board structure health”**; optional alert if multiple seats **without** pipeline. |

**Rule:** Checklist **status** remains **mock-authoritative**; derived signals **add** alert rows or callout text so demos stay predictable.

---

## 4. Components (`src/components/compliance/`)

| Component | Responsibility |
|-----------|----------------|
| **`ComplianceHeader`** | Title + description from spec |
| **`ComplianceScoreCard`** | **“Compliance status: 82% complete”** + complete vs missing counts |
| **`ComplianceChecklist`** | Four sections; rows show status, last updated, link to module |
| **`ComplianceAlertsCard`** | Aggregated overdue / missing / outdated (from helpers) |
| **`ComplianceTimeline`** | Sort upcoming `timeline` + optional `complianceCalendar` rows; chips **Upcoming** / **Expiring soon** / **Overdue** |
| **`RiskFlagIndicators`** | Small pills: Overdue, Missing, Expiring soon, Needs review — driven by `riskFlag` or date logic |

---

## 5. Page layout (`/compliance`)

1. Header  
2. Top **banner** (`complianceBanner`)  
3. `ComplianceScoreCard`  
4. `ComplianceAlertsCard`  
5. `ComplianceTimeline`  
6. `ComplianceChecklist` (full)

---

## 6. Overview integration

Section **“Compliance”**:

- **“78% compliant · 2 items need attention”**  
- 1–2 alert lines  
- Link **View compliance** → `/compliance`

---

## 7. UX / tone

- Checklists, progress bar/ring, **simple status labels**  
- Wording: **On track**, **Needs attention**, **Missing**, **Upcoming**  
- Avoid overwhelming legal lists and alarmist copy (even for “risk detected,” use **calm** banner styling)

---

## 8. Profile-specific copy

| `complianceProfile` | Emphasis in header or callout |
|---------------------|-------------------------------|
| **HOA** | Filings, elections, community compliance |
| **School** | Public meeting / reporting |
| **Faith** | Internal governance |
| **Nonprofit** | IRS, policies, board oversight docs |

---

## 9. Future (structure / comments)

- Automated reminders; audit-ready export; uploads; compliance history; policy version history; funder-specific packs  

---

## 10. Documentation

**`src/lib/mock-data/compliance/README.md`:**

- Checklist vs timeline vs `complianceCalendar`  
- Critical flags and banner rules  
- How cross-module hints are computed  
- Production integration notes  

---

## 11. Verification

- `npm run lint` / `npm run build`  
- `/compliance`, Overview, links to `/minutes`, `/voting`, `/governance`, `/succession` (when routes exist)  

---

## Implementation checklist

- [ ] Types + `OrganizationProfile.boardCompliance` + mocks per archetype  
- [ ] `complianceHelpers.ts` (percent, alerts, banner, timeline sort, optional profile heuristics)  
- [ ] Components: header, score, checklist, alerts, timeline, risk flags  
- [ ] Page + sidebar + Overview section  
- [ ] `compliance/README.md`  
- [ ] Lint / build  
