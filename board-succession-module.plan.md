# Board Terms & Succession module

## Goal

Board chairs and coordinators see **who is rolling off**, **when vacancies land**, **what must be decided** (renewal vs replacement), and **whether a candidate pipeline exists**—so the board is not caught unprepared. UX is **forward-looking, scannable, calm** (timelines + cards + gentle urgency), not HR-heavy or cluttered.

---

## 1. Routing & navigation

| Item | Location |
|------|----------|
| Page | [`src/app/(dashboard)/succession/page.tsx`](src/app/(dashboard)/succession/page.tsx) → **`/succession`** |
| Sidebar | Add `{ href: "/succession", label: "Succession" }` or **`Board Terms`**—pick one label for consistency (recommend **“Succession”** short; subtitle on page carries “Board Terms”). |

Place nav near **Governance** or **Voting** (governance cluster).

---

## 2. Data model (`types.ts` + mocks)

### `BoardMemberTerm`

| Field | Notes |
|-------|--------|
| `id` | Stable string |
| `memberName` | |
| `role` | Align with seat / recruiting `BoardRole.name` when recruiting exists |
| `termStartDate` | Prefer **ISO** (`YYYY-MM-DD`) for timeline math; format in UI |
| `termEndDate` | ISO |
| `termLength` | e.g. `"3 years"` or months number—display string ok |
| `termLimit` | Max terms allowed (number) |
| `termsServed` | number |
| `eligibleForRenewal` | boolean |
| `status` | `Active` \| `Expiring Soon` \| `Term Complete` (derive **Expiring Soon** in helper when end within 90 days unless overridden in mock) |

### `BoardSeat`

| Field | Notes |
|-------|--------|
| `id` | |
| `role` | |
| `currentMember` | name or `null` if vacant |
| `termEndDate` | ISO (seat-level end; may mirror active term) |
| `renewalEligible` | boolean |
| `needsReplacement` | boolean (explicit or derived: not renewing + term ending) |
| `linkedCandidates` | `string[]` — **candidate IDs** shared with Recruiting module |

### Profile bundle

Add to **`OrganizationProfile`**:

```ts
boardSuccession: {
  terms: BoardMemberTerm[];
  seats: BoardSeat[];
  /** Optional: HOA / faith / school / nonprofit — drives micro-copy only in v1 */
  boardArchetype?: "hoa" | "faith" | "school" | "nonprofit";
};
```

**Recruiting integration (critical):** When the Board Recruitment module exists on the profile, `linkedCandidates[]` must match `RecruitCandidate.id` (same profile). Until recruiting ships, either:

- Add a minimal `recruitment.candidates` array on the profile for demo continuity, **or**
- Store placeholder candidate stubs only under `boardSuccession` and merge later.

**Helpers** (`src/lib/succession/successionHelpers.ts`):

- Days/months until `termEndDate`; bucket **90-day** “Expiring soon.”
- **High risk:** ≥2 seats/members expiring in same window (e.g. 6 months)—configurable threshold.
- **No pipeline:** `linkedCandidates.length === 0` && seat `needsReplacement` (or expiring without renewal path).
- Map seat → candidate details by resolving IDs against `profile.recruitment?.candidates` (once present).

---

## 3. Components (`src/components/succession/`)

| Component | Responsibility |
|-----------|----------------|
| **`SuccessionHeader`** | Title: “Board Terms & Succession Planning”; description: “Track term limits, upcoming vacancies, and ensure leadership continuity.” |
| **`TermTimelineCard`** | Member name, role, start/end, **time remaining**; chips: “Expiring in 3 months” (or dynamic window), “Term complete”, “Eligible for renewal.” |
| **`SuccessionRiskCard`** | Summary: e.g. “3 seats expiring · 2 without candidates”; list **roles at risk**; calm amber/stone styling. |
| **`SeatStatusCard`** | Per seat: role, current member, term end, renewal eligibility, replacement needed Y/N, **count** of pipeline candidates. |
| **`CandidatePipelineLink`** | For a seat: list linked candidates with **stage** (from recruiting: Interested → … → Approved); button **“View candidates”** → `/recruiting?role=<seatRoleId or encoded role>` (query contract TBD when recruiting page exists). |
| **`RenewalDecisionTag`** | `Renewal Likely` \| `Renewal Uncertain` \| `Replacement Needed` — neutral typography, no blame. |
| **`SuccessionTimelineView`** | Simple **12-month** horizon: markers for expirations; **highlight clusters** (multiple ends in same month). Use horizontal month strip or vertical list grouped by quarter—keep implementation light (CSS + divs, no chart lib unless already in repo). |

**Automated flags (visual only, v1):**

- Expiring Soon (within 90 days)
- High Risk (multiple expirations)
- No Pipeline (no candidates)
- Renewal Needed (eligible + decision pending—define rule in helper)

---

## 4. Page layout (`/succession`)

1. `SuccessionHeader` + short supportive callout (planning, not alarmist).
2. `SuccessionRiskCard` (top—executive summary).
3. `SuccessionTimelineView` (12 months).
4. Grid: `TermTimelineCard` for each active/near-term term (filter/sort by `termEndDate`).
5. `SeatStatusCard` per seat + embedded `CandidatePipelineLink` / warning **“No candidates in pipeline”** when `linkedCandidates` empty and seat is at risk.

---

## 5. Recruitment module integration

- **IDs:** `BoardSeat.linkedCandidates` ↔ `RecruitCandidate.id`.
- **Filter:** Recruiting page reads query `role` or `seatId` to filter list (spec when implementing recruiting).
- **Stages:** Display from candidate `stage` field (Kanban column).
- **Empty state:** Prominent but calm warning + CTA “Add candidate” or “Open recruiting” → `/recruiting`.

If recruiting is **not** implemented yet: succession page still shows **0 candidates** + warning using only `linkedCandidates.length`; linking becomes live when both datasets exist on `OrganizationProfile`.

---

## 6. Overview integration

In [`overview/page.tsx`](src/app/(dashboard)/overview/page.tsx), section **“Board succession”**:

- Copy pattern: **“2 seats expiring in 90 days · 1 has no candidates”**
- Show **next expiring seat** (single line: role + date).
- Link **View succession** → `/succession`.

Data from `successionHelpers` using `profile.boardSuccession`.

---

## 7. Profile-specific behavior (v1 = mostly copy)

| Archetype | UI nuance |
|-----------|-----------|
| **HOA** | Callout text: elections / strict cycles; optional `boardArchetype: "hoa"` |
| **Faith-based** | Emphasis on continuity / role-based succession |
| **School** | Appointments or public election language in header helper text |
| **Nonprofit** | Staggered terms, renewal vs replacement |

Implement via **`boardArchetype`** + small copy map in header or `InsightCallout`—no separate data schema per type required for demo.

---

## 8. Future (structure / comments only)

- Reminders: “Term expires in 90 days”
- Renewal workflow states; onboarding trigger on replacement
- Election tracking (HOA/school); compliance; composition balance (skills/diversity)

---

## 9. README / documentation

Add **`src/lib/mock-data/succession/README.md`** (or section in main project README if preferred) covering:

- Where term and seat JSON/mock files live (`succession/community.ts`, etc.)
- How to add a board member term row
- How `linkedCandidates` maps to recruiting candidates
- How `status` / flags are derived vs authored
- Where automation (cron/notifications) would attach in a production app

---

## 10. Verification

- `npm run lint` / `npm run build`
- Manual: `/succession`, Overview snippet, deep link to `/recruiting` (when route exists)

---

## 11. Cross-module order (implementation hint)

1. **Succession** can ship **before** recruiting using empty pipelines + warnings.
2. **Recruiting** adds candidates; wire **shared IDs** and query filter.
3. **Engagement** / **Decision speed** plans are independent; only ensure mock **names/roles** feel consistent across profiles.

---

## Implementation checklist

- [ ] Types + `OrganizationProfile.boardSuccession` + per-profile mocks (community / growing / private school)
- [ ] `successionHelpers.ts` (dates, risk, pipeline gaps, archetype copy)
- [ ] Components: header, timeline card, risk card, seat card, pipeline link, renewal tag, 12-mo timeline
- [ ] Page + sidebar + Overview section
- [ ] Recruiting: shared candidate IDs + `/recruiting` filter (when recruiting exists)
- [ ] `succession/README.md`
- [ ] Lint / build
