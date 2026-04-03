# Assessment workflow — phased implementation guide

This document maps the nonprofit organizational assessment feature into **three delivery phases**. It reflects the current codebase (Prisma + Next.js App Router).

---

## Phase 1 — Database schema, seed, create assessment, save responses, draft / in-progress

### Scope

- Persist organizations’ assessment **runs** and per-user **responses** while work is incomplete.
- Load the **question catalog** from the database (after seed).
- **Create** a new run and **autosave** answers without submitting.

### Files to create / update

| Area | Path |
|------|------|
| Schema | `prisma/schema.prisma` — `NpAssessment`, `NpAssessmentParticipant`, `NpAssessmentResponse`, `NpAssessmentCategory`, `NpAssessmentQuestion` |
| Seed | `prisma/seed-np-assessment-catalog.ts`, `prisma/seed.ts` (calls catalog seed) |
| Question definitions | `src/lib/np-assessment/question-bank/index.ts`, `extension-categories.ts`, `legal.ts`, `governance.ts`, `types.ts` |
| Server load | `src/lib/np-assessment/load-catalog.ts` — `loadNpAssessmentCatalogFromDb()` |
| Runtime | `src/lib/np-assessment/assessment-runtime.ts` — `ensureParticipant`, `saveAssessmentResponses`, `loadAssessmentWorkspaceForUser` |
| Permissions (fill) | `src/lib/np-assessment/np-assessment-permissions.ts` — `canPerformNpAssessmentAction(..., "fill")`, `normalizeAssessmentStatus` |
| APIs | `src/app/api/organizations/[organizationId]/np-assessments/route.ts` (GET list, POST create) |
| APIs | `src/app/api/organizations/[organizationId]/np-assessments/[assessmentId]/route.ts` (GET workspace + notes, PATCH `currentCategoryIndex`) |
| APIs | `src/app/api/organizations/[organizationId]/np-assessments/[assessmentId]/responses/route.ts` (POST batch save) |
| UI | `src/app/(dashboard)/assessment/page.tsx` — hub |
| UI | `src/app/(dashboard)/assessment/take/[assessmentId]/page.tsx` — gate + wizard host |
| UI | `src/components/np-assessment/AssessmentWizardClient.tsx` — multi-step form, debounced save |
| UI | `src/components/np-assessment/StartAssessmentButton.tsx` — POST create |
| Nav | `src/components/dashboard/DashboardSidebar.tsx` — link to `/assessment` |

### Code (patterns)

**1. Assessment + participant + response shape (Prisma)**

- `NpAssessment.status`: `NOT_STARTED` → first save moves to `IN_PROGRESS` (see `saveAssessmentResponses`).
- `NpAssessmentParticipant`: `@@unique([assessmentId, userId])` for dashboard users.
- `NpAssessmentResponse`: `answer` (`MET` | `NEEDS_WORK` | `DONT_KNOW` | `NA`), optional `notes`, `flaggedForConsult`, `completedByUserId`.

**2. Create assessment (POST)**

```ts
// Conceptually: prisma.npAssessment.create({
//   data: { organizationId, title, status: "NOT_STARTED", createdByUserId },
// });
```

Implemented in `np-assessments/route.ts` after `assertOrgAccess` and `canPerformNpAssessmentAction(..., "create")`.

**3. Batch save (autosave)**

```ts
// assessment-runtime.ts — upsert per (participantId, questionId)
await prisma.npAssessmentResponse.upsert({
  where: { participantId_questionId: { participantId, questionId } },
  create: { assessmentId, participantId, questionId, answer, notes, flaggedForConsult, completedByUserId },
  update: { answer, notes, flaggedForConsult, completedByUserId },
});
await prisma.npAssessment.update({ where: { id: assessmentId }, data: { status: "IN_PROGRESS" } });
```

**4. Wizard autosave (client)**

`AssessmentWizardClient` debounces ~900ms and POSTs `{ items: [{ indicatorCode, answer, notes? }] }` to `.../responses`.

### Migration notes (Phase 1)

1. Run `npx prisma generate` and `npx prisma db push` (or create a migration) so new columns and `@@unique([assessmentId, userId])` exist.
2. If legacy duplicate `(assessmentId, userId)` participant rows exist, dedupe before applying the unique constraint.
3. Run `npx prisma db seed` so `seedNpAssessmentCatalog(prisma)` populates `NpAssessmentCategory` / `NpAssessmentQuestion`.
4. Legacy statuses `DRAFT` / `IN_PROGRESS` / `SUBMITTED` are normalized in UI via `normalizeAssessmentStatus()` where needed.

### Testing checklist (Phase 1)

- [ ] After seed, `loadNpAssessmentCatalogFromDb()` returns 10 categories with questions.
- [ ] Org admin can POST create; new row has `status === "NOT_STARTED"`.
- [ ] Opening `/assessment/take/:id` creates or reuses one `NpAssessmentParticipant` for the current user.
- [ ] Answering questions triggers POST `.../responses`; reload preserves answers and notes.
- [ ] PATCH `currentCategoryIndex` updates and survives reload.
- [ ] `COMPLETED` / `ARCHIVED` / `SUBMITTED` assessments reject further saves (runtime guard).

---

## Phase 2 — Submit, scoring engine, consult flags, category / overall summaries

### Scope

- **Finalize** a run: validate completeness, set terminal status, persist a **computed report payload**.
- **Score** responses into category blocks, overall totals, priority rows, and **consult banner** severity.

### Files to create / update

| Area | Path |
|------|------|
| Submit + snapshot | `src/lib/np-assessment/assessment-runtime.ts` — `submitAssessment`, `getLatestStoredReport` |
| Submit API | `src/app/api/organizations/[organizationId]/np-assessments/[assessmentId]/submit/route.ts` |
| Scoring | `src/lib/np-assessment/scoring.ts` — `computeNpAssessmentReport`, `buildAiSummaryPayload`, `questionsMapFromCategories` |
| Answer rules | `src/lib/np-assessment/answers.ts` — `isFlaggedAnswer` (anything ≠ `MET`) |
| Permissions (submit) | `np-assessment-permissions.ts` — `canPerformNpAssessmentAction(..., "submit")` |
| Report persistence | `prisma/schema.prisma` — `NpAssessmentReport` (`payload` JSON string) |
| AI hook (optional) | `NpAssessmentReportView` + `NpAssessmentAiPanel` consume `aiPayload` produced at submit |

### Code (patterns)

**1. Submit**

```ts
// submitAssessment — after count(participant responses) === total catalog questions
await prisma.$transaction([
  prisma.npAssessment.update({
    where: { id: assessmentId },
    data: { status: "COMPLETED", submittedAt: new Date(), currentCategoryIndex: categories.length - 1 },
  }),
  prisma.npAssessmentReport.create({
    data: {
      assessmentId,
      participantId,
      payload: JSON.stringify({ report, aiPayload, responses, submittedByUserId, submittedAt }),
    },
  }),
]);
```

**2. Scoring entrypoint**

```ts
const report = computeNpAssessmentReport(categories, responsesRecord);
// responsesRecord: Record<indicatorCode, NpAnswerValue | undefined>
```

**3. Consult / priority / urgent (in `computeNpAssessmentReport`)**

- **Urgent category**: ≥2 flagged **Essential** items in the same category (`urgentCategorySlugs`).
- **Priority**: any flagged Essential (`essentialFlaggedCount > 0`).
- **Consult**: any non-`MET` response (`totalFlagged > 0`) when not overridden by higher tiers.

Banner order: `urgent_category` → `priority` → `consult` → `none`.

**4. Category & overall summaries**

- Per category: `met`, `needsWork`, `dontKnow`, `na`, `answered`, `completionPercent`, `weightedRiskScore`, `consultRecommended`.
- Overall: `met`, `flagged`, `percentMet`, `percentFlagged`, `weightedRiskTotal`, `naFlagged`, etc.

### Migration notes (Phase 2)

1. Ensure Phase 1 schema includes `NpAssessment.submittedAt` and `NpAssessmentResponse` fields used when recomputing from DB if you add “reopen” flows later.
2. Existing `NpAssessmentReport` rows: payload must include `report`, `aiPayload`, and `responses` for downstream Phase 3 consumers (`getLatestStoredReport`).

### Testing checklist (Phase 2)

- [ ] Submit with missing answers returns 400 with clear fraction (e.g. `12/40`).
- [ ] Submit with all answers sets `status` to `COMPLETED` and sets `submittedAt`.
- [ ] `NpAssessmentReport` row exists with parseable JSON.
- [ ] All-`MET` → `consultBanner === "none"` and `priorityRows` empty.
- [ ] One non-Essential non-`MET` only → `consult` (not `priority`).
- [ ] One Essential non-`MET` → `priority`.
- [ ] Two Essential non-`MET` in same category → `urgent_category`.
- [ ] `buildAiSummaryPayload` runs without throw for typical reports.

---

## Phase 3 — Graphical report UI, export PDF/CSV, roles, demo vs live orgs

### Scope

- Render **charts, tables, banners** from **stored** report data (not demo generators).
- **Export** CSV (and PDF via print).
- Enforce **role-based** access on APIs and pages.
- Same code path for **demo and live** orgs (tenant is always `organizationId` on the assessment).

### Files to create / update

| Area | Path |
|------|------|
| Report data loader | `src/lib/np-assessment/report-page-data.ts` — `loadCompletedReportBundle` |
| Graphical UI | `src/components/np-assessment/NpAssessmentReportView.tsx` — Recharts, summary cards, `ConsultBanners` |
| Executive UI | `src/components/np-assessment/ExecutiveReportClient.tsx`, `standards-dashboard-model.ts` |
| Toolbar | `src/components/np-assessment/AssessmentReportToolbar.tsx` — print + CSV link |
| Report page | `src/app/(dashboard)/assessment/report/page.tsx` |
| Executive page | `src/app/(dashboard)/assessment/executive-report/page.tsx` |
| CSV export | `src/app/api/organizations/[organizationId]/np-assessments/[assessmentId]/export/route.ts` |
| Permissions | `np-assessment-permissions.ts` — `view_report`, `export`, `create`, `fill`, `submit`, `archive` + `isPlatformAdmin` bypass |
| All assessment APIs | `assertOrgAccess` + role checks per route |
| Demo / live | No separate assessment store: `NpAssessment.organizationId` ties to `Organization` (`isDemoTenant` is branding/guardrails elsewhere, not a second assessment pipeline) |

### Code (patterns)

**1. Load live report for UI**

```ts
// report-page-data.ts
const bundle = await loadCompletedReportBundle(organizationId, searchParams.assessmentId);
// kind: "live" → { report, aiPayload, executive?, assessmentId }
```

**2. CSV export**

`GET /api/organizations/:orgId/np-assessments/:assessmentId/export` — builds CSV with category, code, question text, rating type, response label, flagged, notes.

**3. PDF**

`AssessmentReportToolbar`: `window.print()`; rely on existing `print:` / `print:hidden` classes in `NpAssessmentReportView` for a clean print layout.

**4. Role gates (server)**

```ts
const role = coerceOrgMembershipRole(session.user.membershipRole ?? "VIEWER");
if (!canPerformNpAssessmentAction(role, session.user.isPlatformAdmin, "view_report")) redirect("/forbidden?reason=assessment-report");
```

### Migration notes (Phase 3)

1. **Prisma client** must be regenerated after schema changes (`prisma generate`); otherwise TypeScript will not see `submittedAt`, `notes`, etc.
2. **VIEWER** members cannot `view_report` or `export` by design; adjust `np-assessment-permissions.ts` if product needs read-only viewers.
3. **Demo orgs**: use normal create/fill/submit; optional UI badges come from `Organization.isDemoTenant` on shell components, not from assessment logic.
4. **Supabase**: assessments are **Prisma/SQLite (or your configured DB)** today; syncing assessment tables to Supabase for RLS would be a **new** phase if required.

### Testing checklist (Phase 3)

- [ ] `/assessment/report` shows empty state when no completed assessment; with `?assessmentId=` shows that run when completed.
- [ ] Charts and priority table match known seeded responses after submit.
- [ ] Consult banners match Phase 2 rules in the UI (`ConsultBanners` in `NpAssessmentReportView`).
- [ ] CSV downloads and columns match the current participant’s responses.
- [ ] Print preview hides toolbar/footer appropriately.
- [ ] `VIEWER` cannot open report or export (403 / redirect).
- [ ] Platform admin can access APIs across orgs when session has `isPlatformAdmin`.
- [ ] Creating and completing an assessment under a demo org (`isDemoTenant: true`) behaves the same as a live org.

---

## Cross-phase dependency summary

```text
Phase 1 (persist draft)
    → Phase 2 (submit + compute + store JSON)
        → Phase 3 (read JSON + charts + exports + gates)
```

## One-command local setup (all phases)

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

Then: **Assessment** in the sidebar → start or continue a run → submit → open **Assessment report**.
