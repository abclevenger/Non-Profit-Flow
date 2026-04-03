# Procurement & Major Purchase Review module

## Goal

Boards **review, compare, and approve** high-value purchases with **clear documentation**, **vendor comparison** (or **sole-source justification**), and a path to **formal vote**—reducing delays from missing bids or unclear options. UX: **cards + a focused comparison table**, scannable sections, **minimal procurement jargon**.

---

## 1. Routing & navigation

| Item | Location |
|------|----------|
| Page | [`src/app/(dashboard)/procurement/page.tsx`](src/app/(dashboard)/procurement/page.tsx) → **`/procurement`** |
| Sidebar | Add `{ href: "/procurement", label: "Procurement" }` to [`DashboardSidebar.tsx`](src/components/dashboard/DashboardSidebar.tsx) (near Documents / Governance). |
| Overview | New section **“Major purchases”** (see §7). |

---

## 2. Workflow (internal vs. display)

**Linear workflow (coordinator mental model):**

1. Draft  
2. Vendor comparison / justification  
3. Ready for review  
4. Ready for vote  
5. Approved / Rejected  

**`ProcurementStatusPill` labels** (user-facing, five states):

| Pill | Maps to steps |
|------|----------------|
| **Draft** | 1 |
| **In Review** | 2–3 (comparison, justification, internal review) |
| **Ready for Vote** | 4 |
| **Approved** | 5a |
| **Rejected** | 5b |

Optional internal flag `comparisonComplete` / `reviewComplete` for future; v1 can derive readiness from **enforcement helpers** only.

---

## 3. Data model (`types.ts` + mocks)

### `ProcurementType`

`"Multi-Vendor" | "Sole Source"`

### `VendorComparisonRow`

| Field | Type |
|-------|------|
| `id` | string |
| `vendorName` | string |
| `cost` | string (display e.g. `"$42,500"`) or `number` + formatter |
| `scopeDeliverables` | string |
| `timeline` | string |
| `strengths` | string |
| `risks` | string |
| `notes` | string |

### `SoleSourceJustification`

| Field | Type |
|-------|------|
| `whyOnlyOneVendor` | string |
| `uniqueQualifications` | string |
| `urgency` | string (optional) |
| `riskExplanation` | string |

### `PurchaseRequest` (or `MajorPurchaseRequest`)

| Field | Notes |
|-------|--------|
| `id`, `title`, `category` | category: equipment \| services \| contract \| asset \| other |
| `estimatedCost` | display string or number |
| `status` | matches pill enum |
| `decisionDate` | aligns with vote `decisionDate` when linked |
| `owner` | coordinator |
| `procurementType` | Multi-Vendor \| Sole Source |
| `vendors` | `VendorComparisonRow[]` |
| `soleSourceJustification` | optional; **required** when type Sole Source |
| `linkedDocuments` | `{ id, title, href?, type? }[]` — proposals, quotes, contracts |
| `linkedVoteId` | optional; set when converted to **`BoardVoteItem`** |
| `decisionBrief` | optional **`DecisionBrief`** — reuse [Decision Brief Standardization](./decision-brief-standardization.plan.md) (`ProcurementDecisionBrief` = same shape + `ProcurementDecisionBriefCard` wrapper with procurement-specific section order if needed) |
| `procurementArchetype?` | `hoa` \| `nonprofit` \| `school` \| `faith` — **copy only** in v1 |

**Profile bundle:**

```ts
boardProcurement: {
  requests: PurchaseRequest[];
};
```

Mocks: `src/lib/mock-data/procurement/community.ts`, `growing.ts`, `privateSchool.ts` — wire into all `OrganizationProfile` sources.

Include **one** Multi-Vendor row set with **≥2 vendors**, **one** Sole Source with full justification, **one** intentionally **incomplete** (for enforcement demo).

---

## 4. Enforcement helpers (`src/lib/procurement/procurementHelpers.ts`)

**`isSoleSourceJustificationComplete(j: SoleSourceJustification | undefined): boolean`**  
— all required strings non-empty.

**`isMultiVendorComparisonComplete(vendors: VendorComparisonRow[], min = 2, maxExpected = 3): boolean`**  
— `min` vendors (user asked 2–3; **enforce ≥2**; show expectation “typically 3” in UI copy).

**`getProcurementReadinessErrors(request): string[]`** returns messages such as:

- `"Vendor comparison incomplete"` — Multi-Vendor and `vendors.length < 2`  
- `"Sole source justification required"` — Sole Source and justification incomplete  

**`canMoveToReadyForVote(request): boolean`**

- No readiness errors **and**  
- If **`DecisionBrief`** present on request: `isDecisionBriefComplete(brief)` from decision-brief plan **or** treat brief as optional for v1 **only if** product wants faster ship—**prefer requiring** brief parity with voting module; document choice.  
- Status transition **to Ready for Vote** blocked in UI when `!canMoveToReadyForVote`.

Display banner: **“Vendor comparison incomplete”** / **“Sole source justification required”** (and combine with decision-brief incomplete if both apply).

---

## 5. Components (`src/components/procurement/`)

| Component | Responsibility |
|-----------|----------------|
| **`ProcurementHeader`** | Title + description (exact copy from spec). |
| **`ProcurementStatusPill`** | Maps status → calm stone/amber tones. |
| **`PurchaseRequestCard`** | Condensed: title, category, cost, status, type, vendor count, decision deadline, owner (optional line). |
| **`VendorComparisonTable`** | Responsive table or card grid; **2–3 columns** of vendors in mock data; empty state prompts add vendor. |
| **`SoleSourceJustificationCard`** | All fields; label **“Sole source justification required”** when type is Sole Source and incomplete. |
| **`ProcurementDecisionBrief`** | Thin wrapper around **`DecisionBriefCard`** (reuse) with procurement framing title (“What is being purchased,” etc.). |
| **`ProcurementRiskChips`** | Subtle indicators: **Single vendor only**, **High cost item**, **Limited comparison**, **Urgent decision** — rules in helper (thresholds for “high cost” in mock config). |

**Detail layout (page or side panel):** request → brief → vendors or sole justification → documents → link to vote / “Create vote” (demo).

---

## 6. Link to voting

- Each request may set **`linkedVoteId`** pointing to existing `BoardVoteItem.id`.  
- **“Send to vote”** (demo): append **`BoardVoteItem`** via same **ephemeral vote** pattern as other modules (extend `DemoModeProvider` if not already) **or** add static vote rows in mock JSON with `category: "Procurement"` and summary = recommended vendor + cost.  
- Vote **`decisionBrief`** should **mirror** or **reference** procurement brief for packet consistency.

---

## 7. Overview integration

Section **“Major purchases”**:

- Show **1–2** active requests (`Draft` \| `In Review` \| `Ready for Vote`).  
- Line: **“2 purchases under review · 1 ready for vote”** from helper counts.  
- Link → `/procurement`.

---

## 8. Risk visibility

Implement **`ProcurementRiskChips`** from rules, e.g.:

- **Single vendor only** — Multi-Vendor type but only 1 vendor row  
- **High cost item** — `estimatedCost` above profile threshold (constant per archetype)  
- **Limited comparison** — Multi-Vendor with exactly 2 vendors (informational, not error)  
- **Urgent decision** — `decisionDate` within N days  

Tone: **informational**, not punitive.

---

## 9. Profile-specific copy

Use `procurementArchetype` or reuse `OrganizationProfile` / sample id to show **one** contextual sentence in header or callout:

| Archetype | Example focus |
|-----------|----------------|
| HOA | Contractors, maintenance, property improvements |
| Nonprofit | Vendor contracts, program services, consulting |
| School | Facilities, curriculum vendors, equipment |
| Faith-based | Facilities, services, mission-aligned vendors |

---

## 10. Future (structure / comments)

- Conflict-of-interest disclosures  
- Automated bid scoring  
- Vendor history  
- Policy rules engine  
- Audit / export  

---

## 11. Documentation

Add **`src/lib/mock-data/procurement/README.md`**:

- Where purchase data lives  
- How to add vendors / sole source  
- Enforcement rules and `canMoveToReadyForVote`  
- How `linkedVoteId` ties to `boardVotes`  
- Where reminders / policy automation would hook in production  

---

## 12. Cross-plan dependencies

| Plan | Relationship |
|------|----------------|
| [Decision Brief Standardization](./decision-brief-standardization.plan.md) | Reuse `DecisionBrief` + `DecisionBriefCard`; gate **Ready for Vote** consistently. |
| Decision speed / voting | Vote cards may show procurement summary when `linkedVoteId` reverse-linked or category = Procurement. |
| Recruiting / Succession | No hard dependency. |

---

## 13. Verification

- `npm run lint` / `npm run build`  
- `/procurement`, Overview snippet, one path to `/voting` with linked item  

---

## Implementation checklist

- [ ] Types + `OrganizationProfile.boardProcurement` + per-profile mocks (incomplete + complete examples)  
- [ ] `procurementHelpers.ts` (enforcement, risk chips, overview counts)  
- [ ] Components: header, status pill, request card, vendor table, sole source card, brief wrapper, risk chips  
- [ ] Page + sidebar + Overview “Major purchases”  
- [ ] Voting link / mock vote creation + `linkedVoteId`  
- [ ] `procurement/README.md`  
- [ ] Lint / build  
