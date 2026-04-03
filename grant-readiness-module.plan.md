# Grant Readiness & Funding Compliance module

## Goal

Boards and leadership see **whether the organization is prepared to pursue grants**, **what is missing**, and **recommended next steps**—as a **readiness checklist and governance validator**, not a grant application portal. Tone: **Ready**, **Needs attention**, **Missing**, **Recommended next steps**—minimal jargon, reassuring, not intimidating.

---

## 1. Routing & navigation

| Item | Location |
|------|----------|
| Page | [`src/app/(dashboard)/grants/page.tsx`](src/app/(dashboard)/grants/page.tsx) → **`/grants`** |
| Sidebar | `{ href: "/grants", label: "Grant Readiness" }` in [`DashboardSidebar.tsx`](src/components/dashboard/DashboardSidebar.tsx) |
| Overview | Section **“Grant readiness”** (see §6) |

---

## 2. Data model

### Checklist item status

`GrantChecklistStatus = "Complete" | "Needs Attention" | "Missing"`

### `GrantChecklistItem`

| Field | Notes |
|-------|--------|
| `id` | Stable string |
| `section` | `Governance` \| `Documentation` \| `ProgramsImpact` \| `Compliance` |
| `label` | Short line (e.g. “Conflict of interest policy in place”) |
| `status` | Complete / Needs Attention / Missing |
| `notes` | Optional coordinator note |
| `lastUpdated` | Display string or ISO |
| `critical` | If true, counts toward **“not ready to apply”** gate |
| `linkedModule?` | `governance` \| `minutes` \| `strategy` \| `engagement` — for **deep link** + copy (“Review in Minutes”) |
| `suggestedAction?` | Short CTA label for action list |

### Profile bundle

```ts
boardGrantReadiness: {
  items: GrantChecklistItem[];
  /** small | growing | school | faith — thresholds & copy only in v1 */
  readinessProfile?: "small" | "growing" | "school" | "faith";
};
```

**Mocks:** `src/lib/mock-data/grants/community.ts`, `growing.ts`, `privateSchool.ts` — wire into every `OrganizationProfile`. Include **mixed** statuses and **2+ critical gaps** on one profile for demo contrast.

---

## 3. Helpers (`src/lib/grants/grantReadinessHelpers.ts`)

- **`readinessPercent(items): number`** — weight Complete = 100%, Needs Attention = 50% (or 66%), Missing = 0% per item; average across items **or** count-based `complete / total`. Document formula; keep **simple**.
- **`criticalGaps(items)`** — `critical && status !== Complete`
- **`topGaps(items, n)`** — Missing first, then Needs Attention, prefer `critical`
- **`grantReadinessSummary(items)`** — `{ percent, completeCount, attentionCount, missingCount, criticalMissingCount }`
- **`readinessBanner(items): "blocked" | "caution" | "ready"`**
  - **blocked:** any **critical** item not Complete → message **“Not ready to apply for grants yet”**
  - **ready:** no critical gaps **and** percent ≥ configurable threshold (e.g. **85%**) → **“Ready to pursue funding opportunities”**
  - **caution:** else (in progress; soften with **“A few items need attention before you apply”**)

Tune thresholds per **`readinessProfile`** if desired (e.g. growing org expects stricter % for “ready”).

### Cross-module signals (optional v1 enhancement)

**Derived hints** (read-only, no duplicate source of truth):

- **Minutes:** if `meetingMinutes` has no **Approved/Published** in last N days → optionally **suggest** upgrading a linked checklist row to Needs Attention (or document as future automation). **v1 simpler:** author checklist status in mock JSON; add **one** item with `linkedModule: "minutes"` and static copy.
- **Governance:** link rows to `/governance` when policy-related.
- **Strategy:** link “Strategic plan available” → `/strategy`.
- **Engagement:** when [engagement module](./board-engagement-module.plan.md) exists, link “Board oversight documented” / activity items → `/engagement`.

Do **not** block the module on engagement existing—use `linkedModule` + `href` only; if route missing, hide link or point to Overview.

---

## 4. Components (`src/components/grants/`)

| Component | Responsibility |
|-----------|----------------|
| **`GrantReadinessHeader`** | Title “Grant Readiness” + spec description |
| **`ReadinessScoreCard`** | Overall %, “X of Y categories complete” or item counts; calm progress ring or bar |
| **`ReadinessChecklist`** | Four sections with headers; each row: label, status pill, notes, last updated, optional **Link** to module |
| **`GapAnalysisCard`** | Top **missing** / **high-risk** (critical) items; example lines from spec |
| **`ReadinessActionList`** | Bulleted **suggested tasks** derived from non-Complete items (`suggestedAction` or template by `section`) |

**Status pills:** map to soft green / amber / stone (not red “failure”).

---

## 5. Page layout (`/grants`)

1. Header + **banner** from `readinessBanner` (blocked / caution / ready).  
2. `ReadinessScoreCard`  
3. `GapAnalysisCard`  
4. `ReadinessActionList`  
5. `ReadinessChecklist` (full scroll)

---

## 6. Overview integration

Section **“Grant readiness”**:

- **“68% ready · 2 critical gaps”** (from helpers)  
- Optional **one-line** top gap  
- Link **View grant readiness** → `/grants`

---

## 7. UX guardrails

- Checklist-first; **short labels**; notes optional, collapsed on mobile if needed.  
- No grant-proposal workflow, no LOI forms.  
- Avoid dense compliance/legal wording.

---

## 8. Profile-specific expectations

| `readinessProfile` | Emphasis |
|---------------------|----------|
| **small** | Basic governance, simple reporting; fewer critical items optional |
| **growing** | Stronger metrics / documentation; higher bar for “ready” % |
| **school** | Governance clarity, community accountability language in callout |
| **faith** | Same + mission alignment note in header helper text |

Implement as **copy variants** + optional **weight** on which items are `critical` in mocks.

---

## 9. Future (structure / comments)

- Funder-specific checklist templates  
- Document uploads  
- Audit readiness scoring  
- Export readiness PDF  
- Sync status from live policy/minutes APIs  

---

## 10. Documentation

**`src/lib/mock-data/grants/README.md`:**

- Checklist data location  
- How to mark `critical` and `linkedModule`  
- How `readinessPercent` / banner thresholds work  
- Where production would integrate real document stores  

---

## 11. Cross-plan notes

| Module | Link |
|--------|------|
| Governance | `/governance` |
| Minutes | `/minutes` |
| Strategy | `/strategy` |
| Engagement | `/engagement` when implemented |
| Procurement / Voting | No required link; optional “financial statements” → documents list |

---

## 12. Verification

- `npm run lint` / `npm run build`  
- `/grants`, Overview snippet, at least one `linkedModule` navigation works  

---

## Implementation checklist

- [ ] Types + `OrganizationProfile.boardGrantReadiness` + per-profile mocks  
- [ ] `grantReadinessHelpers.ts` (percent, gaps, banner, optional profile thresholds)  
- [ ] Components: header, score card, checklist, gap card, action list  
- [ ] Page + sidebar + Overview section  
- [ ] `grants/README.md`  
- [ ] Lint / build  
