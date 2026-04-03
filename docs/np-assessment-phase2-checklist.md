# NP Assessment Phase 2 — hardening checklist

## What changed

- **Workflow:** `NOT_STARTED` (UI: Draft) → first save → `IN_PROGRESS` → submit → `COMPLETED`. `ARCHIVED` closes edits.
- **Autosave:** Still debounced per section; responses persist to the current user’s `NpAssessmentParticipant`; **read model** merges latest answer per question across all participants (`responsesMergedForAssessment`).
- **Submit:** Live orgs (`isDemoTenant === false`) require **all** questions answered (merged across the org). Demo orgs may submit with gaps (server + client).
- **Reports / standards / export:** Built only from **`NpAssessmentResponse`** rows via `recomputeReportBundleFromDatabase` — no mock scoring on live paths.
- **Permissions:** See `src/lib/np-assessment/np-assessment-permissions.ts` (`canFillNpAssessmentWizard`, `canAccessAssessmentHub`, attorney excluded from wizard).
- **Board members:** `NpAssessment.allowBoardMemberFill` (default `true`). Admins PATCH via API body `{ "allowBoardMemberFill": false }`.

## Files touched

| Area | Path |
|------|------|
| Schema | `prisma/schema.prisma` — `allowBoardMemberFill` |
| Runtime | `src/lib/np-assessment/assessment-runtime.ts` |
| Demo-only responses | `src/lib/np-assessment/demo-responses.ts` |
| Scoring | `src/lib/np-assessment/scoring.ts` — removed inline demo generator |
| Permissions | `src/lib/np-assessment/np-assessment-permissions.ts` |
| Report data | `src/lib/np-assessment/report-page-data.ts` |
| APIs | `.../np-assessments/route.ts`, `[assessmentId]/route.ts`, `responses/route.ts`, `submit/route.ts`, `export/route.ts` |
| Pages | `assessment/page.tsx`, `take/[assessmentId]/page.tsx`, `standards/page.tsx` |
| UI | `AssessmentWizardClient.tsx`, `StandardsHubClient.tsx` |

## Migration

```bash
npx prisma db push
# or create a migration for allowBoardMemberFill
```

## Manual QA

1. **Live org:** Create assessment, answer as user A, confirm user B sees merged answers on reload; chair (user B) submits when all questions answered via merge; report + executive + CSV match DB.
2. **Live org:** Partial answers → Submit disabled in UI; POST submit returns 400.
3. **Demo org:** Partial submit succeeds; standards page shows demo banner + illustrative pillar data.
4. **Board member** with `allowBoardMemberFill: false` → no Continue link, take route 403, responses POST 403.
5. **Attorney:** Hub visible; no Continue on in-progress; report links when completed.
6. **Catalog missing:** Submit returns 503; wizard shows empty categories message.

## Next (overview)

Minimum widgets to wire to live assessment data:

- **Consult / risk strip:** `consultBanner`, `essentialFlaggedCount`, `categoriesNeedingConsult` from `loadCompletedReportBundle` for active org.
- **Readiness / board health:** Reuse `report.overall.percentMet` and pillar roll-up from `computeStandardsPillarCards` + latest completed assessment id.
