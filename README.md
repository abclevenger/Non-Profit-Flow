# Board Oversight Dashboard

A **standalone demo web app** for **Mission Impact Legal Advisors** Ã¢â‚¬â€ a calm, board-facing **strategic oversight** prototype for nonprofit leaders. It uses **local mock data only** (local mock data for the dashboard; **authentication** protects the app (see Authentication below)).

## What this is

- A polished **sample dashboard** you can show in **sales conversations** and **planning meetings**
- Three example organizations: **Small Community Nonprofit**, **Growing Multi-Program Nonprofit**, and **Private School / Faith-Based** (selector in the header)
- **Next.js App Router**, **React**, **TypeScript**, and **Tailwind CSS**
- Structured so you can **duplicate a profile** for a specific nonprofit prospect

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home route is a **public landing** page with links to sign-in; the dashboard lives under **`/overview`** and requires login.

```bash
npm run build   # production build
npm start       # run production server
```

## Folder structure (high level)

| Path | Purpose |
|------|--------|
| [`src/app/layout.tsx`](src/app/layout.tsx) | Root layout, fonts, page metadata |
| [`src/app/page.tsx`](src/app/page.tsx) | Public landing + links to sign-in |
| [`src/app/(dashboard)/layout.tsx`](src/app/(dashboard)/layout.tsx) | Workspace + branding providers + dashboard shell (sidebar + header) |
| [`src/app/(dashboard)/overview/page.tsx`](src/app/(dashboard)/overview/page.tsx) | Board overview (main demo) |
| [`src/app/(dashboard)/strategy/page.tsx`](src/app/(dashboard)/strategy/page.tsx) | **Strategic Planning** Ã¢â‚¬â€ full priority workspace (`/strategy`) |
| [`src/app/(dashboard)/governance/page.tsx`](src/app/(dashboard)/governance/page.tsx) | Governance & compliance calendar |
| [`src/app/(dashboard)/risks/page.tsx`](src/app/(dashboard)/risks/page.tsx) | Risk grid |
| [`src/app/(dashboard)/meetings/page.tsx`](src/app/(dashboard)/meetings/page.tsx) | **Meeting workflow** Ã¢â‚¬â€ list + calendar, links to detail |
| [`src/app/(dashboard)/meetings/[id]/page.tsx`](src/app/(dashboard)/meetings/[id]/page.tsx) | Single meeting: agenda, votes, discussion, minutes, actions |
| [`src/app/(dashboard)/minutes/page.tsx`](src/app/(dashboard)/minutes/page.tsx) | Meeting minutes & records (`/minutes`) |
| [`src/app/(dashboard)/voting/page.tsx`](src/app/(dashboard)/voting/page.tsx) | Board voting & decision workflow |
| [`src/app/(dashboard)/training/page.tsx`](src/app/(dashboard)/training/page.tsx) | Board member training & orientation (`/training`) |
| [`src/app/(dashboard)/documents/page.tsx`](src/app/(dashboard)/documents/page.tsx) | Packets, minutes, resolutions |
| [`src/components/voting/`](src/components/voting/) | Voting UI (cards, timeline, discussion, coordinator scaffold) |
| [`src/components/training/`](src/components/training/) | Training UI (modules, progress, resources, FAQ) |
| [`src/components/minutes/`](src/components/minutes/) | Minutes & records UI (cards, detail panel, timeline) |
| [`src/lib/mock-data/votes/`](src/lib/mock-data/votes/) | **Vote mock data** per archetype |
| [`src/lib/mock-data/minutes/`](src/lib/mock-data/minutes/) | **Meeting minutes mock data** per archetype |
| [`src/lib/mock-data/board-meetings/`](src/lib/mock-data/board-meetings/) | **`BoardMeeting`** graph (agenda Ã¢â€ â€ votes Ã¢â€ â€ minutes Ã¢â€ â€ actions) |
| [`src/components/meeting-workflow/`](src/components/meeting-workflow/) | Meeting list row, calendar strip, workflow agenda tags |
| [`src/lib/meeting-workflow/meetingWorkflowHelpers.ts`](src/lib/meeting-workflow/meetingWorkflowHelpers.ts) | Next meeting, days-until, vote/action resolution |
| [`src/lib/mock-data/training/`](src/lib/mock-data/training/) | **Training bundles** per archetype (generated from `tools/training-seed.json`) |
| [`src/lib/mock-data/`](src/lib/mock-data/) | **Central mock data** Ã¢â‚¬â€ start here to customize |
| [`src/components/dashboard/`](src/components/dashboard/) | Reusable dashboard UI modules |
| [`src/components/strategy/`](src/components/strategy/) | **Strategic Planning** module (cards, insight callout, notes panel) |
| [`src/lib/demo-mode-context.tsx`](src/lib/demo-mode-context.tsx) | Re-exports workspace context (`WorkspaceProvider`, `useWorkspace`; legacy `DemoModeProvider` alias) |
| [`docs/ORGANIZATIONS.md`](docs/ORGANIZATIONS.md) | **Multi-organization** model, memberships, modules, and APIs |

The `(dashboard)` segment is only for grouping; URLs stay **`/overview`**, **`/strategy`**, etc.

## Board Voting & Decision Workflow

- **Route:** [`/voting`](src/app/(dashboard)/voting/page.tsx) Ã¢â‚¬â€ summary cards, vote items by lifecycle, discussion thread, timeline, mock **QuestionComposer**, and **CoordinatorControlsCard** (scaffold for future persistence).
- **Data:** Each profileÃ¢â‚¬â„¢s `boardVotes` array lives in [`src/lib/mock-data/votes/`](src/lib/mock-data/votes/) (`community.ts`, `growing.ts`, `privateSchool.ts`). Types: `BoardVoteItem`, `DiscussionComment`, `BoardVoteStatus` in [`types.ts`](src/lib/mock-data/types.ts).
- **To add a vote:** Copy an object in the relevant `votes/*.ts` file, assign a unique `id`, set `meetingId` to a [`BoardMeeting`](src/lib/mock-data/types.ts) `id` when it belongs to a scheduled meeting, plus `opensAt` / `closesAt` / `decisionDate`, `publicVisible`, `followUpRequired`, and `discussionThread`.
- **Future:** Real ballots, quorum, coordinator permissions, notifications, export to minutes/resolutions, public posting Ã¢â‚¬â€ search for `COORDINATOR` and `QuestionComposer` in [`src/components/voting/`](src/components/voting/).

## Board Member Training

- **Route:** [`/training`](src/app/(dashboard)/training/page.tsx) Ã¢â‚¬â€ orientation overview, seven default modules, governance basics, quick answers, document list, and progress (demo aggregate).
- **Data:** Each profileÃ¢â‚¬â„¢s `boardTraining` bundle lives in [`src/lib/mock-data/training/`](src/lib/mock-data/training/) (`community.ts`, `growing.ts`, `privateSchool.ts`). Types: `BoardTrainingBundle`, `TrainingModuleItem`, `TrainingResource`, `TrainingProgress` in [`types.ts`](src/lib/mock-data/types.ts). Source JSON for regeneration: [`tools/training-seed.json`](tools/training-seed.json); run `node tools/emit-training.mjs` after editing the seed.
- **To add a module:** Add an object to `modules[]` with a unique `id`, set `required: true` or `false`, `status`, and `linkedResources` ids that match `resources[]`.
- **To mark public/coordinator emphasis on a doc:** Set `recommended: true` on a `TrainingResource`.
- **Future:** Per-user completion, coordinator assignment, acknowledgements, video, quizzes Ã¢â‚¬â€ replace `progress` and `status` fields from your API; see comments in [`trainingHelpers.ts`](src/lib/training/trainingHelpers.ts) and [`ProgressTrackerCard`](src/components/training/ProgressTrackerCard.tsx).

## Meeting Minutes & Records

- **Route:** [`/minutes`](src/app/(dashboard)/minutes/page.tsx) Ã¢â‚¬â€ summary cards, grouped lists (recent, draft/review, approved, public), and a **MinutesDetailPanel** with decisions, follow-up, linked agenda/votes/docs, and **MinutesTimelineCard**.
- **Data:** Each profileÃ¢â‚¬â„¢s `meetingMinutes` array lives in [`src/lib/mock-data/minutes/`](src/lib/mock-data/minutes/) (`community.ts`, `growing.ts`, `privateSchool.ts`). Types: `MeetingMinutesRecord`, `MinutesDecisionItem`, `MinutesFollowUpAction`, `MinutesRecordStatus` in [`types.ts`](src/lib/mock-data/types.ts).
- **To add a record:** Append to `meetingMinutes` with a unique `id`, set `status`, `meetingType`, `decisionsMade`, `followUpActions`, and optional `linkedVotes` (ids matching [`boardVotes`](src/lib/mock-data/votes/)), `linkedAgendaItems`, and `linkedDocuments`.
- **To mark approved:** Set `status` to `Approved` and fill `approvedDate`. Use `Published` plus `publishedDate` when a public summary is live.
- **To mark public-facing:** Set `publicVisible: true` and optionally `publicSummary` for website-ready text. **MinutesPublicVisibilityTag** shows Public vs Internal record.
- **Future:** Export PDF, portal publishing, full-text search, filters by date/type/topic Ã¢â‚¬â€ extend [`minutesHelpers.ts`](src/lib/minutes/minutesHelpers.ts) and replace mock arrays with API data.

## Meeting workflow system

- **Routes:** [`/meetings`](src/app/(dashboard)/meetings/page.tsx) (list default, optional simple calendar) and [`/meetings/[id]`](src/app/(dashboard)/meetings/[id]/page.tsx) (agenda with **Decision required** tags, linked votes, pre-meeting **DiscussionThreadCard**s, minutes when `minutesRecordId` is set, follow-up actions from `actionItems` ids).
- **Entity:** `BoardMeeting` on [`OrganizationProfile`](src/lib/mock-data/types.ts) as `boardMeetings[]` Ã¢â‚¬â€ `WorkflowAgendaItem` rows use `informational` + optional `linkedVoteId`; `voteItems` mirrors vote ids; `minutesRecordId` points at `meetingMinutes[].id`; `actionItems` points at `actionItems[].id`. Votes gain optional `meetingId`; minutes gain optional `meetingId`; actions gain optional `linkedMeetingId` / `linkedVoteId`.
- **Data:** [`src/lib/mock-data/board-meetings/`](src/lib/mock-data/board-meetings/) (`community.ts`, `growing.ts`, `privateSchool.ts`) Ã¢â‚¬â€ wired like other modules from [`genericSample`](src/lib/mock-data/genericSample.ts) / [`customizedPreview`](src/lib/mock-data/customizedPreview.ts) / [`privateSchool`](src/lib/mock-data/profiles/privateSchool.ts).
- **Overview:** **Next meeting** block uses [`nextBoardMeeting`](src/lib/meeting-workflow/meetingWorkflowHelpers.ts) and shows top three agenda lines plus decision count.
- **Future:** Real calendar sync, automated minute stubs from agenda + vote outcomes, push actions to external task tools.

## Strategic Planning module

- **Overview** (`/overview`): top **three** strategic priorities with progress and status, plus a **Ã¢â‚¬Å“View all prioritiesÃ¢â‚¬Â** link to `/strategy`.
- **Strategy** (`/strategy`): full **Strategic Planning** view Ã¢â‚¬â€ insight summary (**on track / needs attention / off track**), all priorities grouped by **category** when set, **Updates from leadership** (notes per priority), and optional alignment callout from mock data.
- **Statuses** (standardized): **On Track** (green), **At Risk** (amber), **Off Track** (red) via [`StatusPill`](src/components/dashboard/StatusPill.tsx) `strategicStatus`.
- **Data:** each profileÃ¢â‚¬â„¢s `strategicPriorities` in [`src/lib/mock-data/types.ts`](src/lib/mock-data/types.ts) includes `description`, `dueDate`, `lastUpdated`, `notes`, and optional `category`. Edit the archetype files in [`src/lib/mock-data/profiles/`](src/lib/mock-data/profiles/).
- **v1:** read-only demo; **future:** editing, timeline updates, links to board agendas, export Ã¢â‚¬â€ keep stable `id` on each priority.

## How to customize for a prospect

1. **Branding & story**  
   Edit archetype profiles under [`src/lib/mock-data/profiles/`](src/lib/mock-data/profiles/) (`communityNonprofit.ts`, `growingNonprofit.ts`, `privateSchool.ts`). Legacy files [`genericSample.ts`](src/lib/mock-data/genericSample.ts) and [`customizedPreview.ts`](src/lib/mock-data/customizedPreview.ts) remain as bases for spreads. Register new IDs in [`dashboardData.ts`](src/lib/mock-data/dashboardData.ts).

   Adjust **`organizationName`**, **`missionSnippet`**, **`boardChair`**, **`executiveDirector`**, **`reportingPeriod`**, and **`theme`** (accent colors).

2. **Logo**  
   In the profileÃ¢â‚¬â„¢s `logo` field, either keep `type: "placeholder"` or set `type: "url"` and `src` to a file under **`public/`** (e.g. `/client-logo.png`).

3. **Content**  
   In the same profile file, update arrays for priorities, metrics, risks, agenda, actions, governance rows, documents, votes, **`boardTraining`**, **`meetingMinutes`**, and **`boardMeetings`** (or edit files under [`src/lib/mock-data/training/`](src/lib/mock-data/training/), [`src/lib/mock-data/minutes/`](src/lib/mock-data/minutes/), and [`src/lib/mock-data/board-meetings/`](src/lib/mock-data/board-meetings/)). Types live in [`src/lib/mock-data/types.ts`](src/lib/mock-data/types.ts).

4. **Wire a third profile (optional)**  
   - Add `src/lib/mock-data/yourClientPreview.ts` exporting an `OrganizationProfile`.  
   - Extend `DemoMode` in `types.ts` and branch in [`src/lib/mock-data/dashboardData.ts`](src/lib/mock-data/dashboardData.ts).  
   - Add a seeded `Organization` with `demoProfileKey` and memberships (see [`docs/ORGANIZATIONS.md`](docs/ORGANIZATIONS.md)); register the profile in [`dashboardData.ts`](src/lib/mock-data/dashboardData.ts).

5. **Planning call button**  
   The header CTA URL is set in [`DashboardHeader.tsx`](src/components/dashboard/DashboardHeader.tsx) (`ctaHref`). Point it to your real scheduling link.

## Organizations (header)

- Use **Organization** in the header to switch tenants you belong to (session-backed; no full reload). Sample/demo orgs are real `Organization` rows tied to mock JSON via `demoProfileKey` — see [`docs/ORGANIZATIONS.md`](docs/ORGANIZATIONS.md).

## Code comments

Look for short comments in:

- Mock profile files Ã¢â‚¬â€ **where to swap nonprofit branding and data**  
- [`dashboardData.ts`](src/lib/mock-data/dashboardData.ts) Ã¢â‚¬â€ **where to register a new profile**

## Product name

The shell shows **Board Oversight Dashboard** as the product line; Mission Impact Legal Advisors can be referenced in metadata and README as the firm presenting the demo.

---

Built as a **discussion and planning preview** Ã¢â‚¬â€ not live data and not legal advice.

## Authentication

- **Stack:** Auth.js v5 (`next-auth`), **Prisma + SQLite** (local dev), **JWT sessions**, optional **Google** and **Microsoft Entra ID** SSO via env vars in `.env.example`.
- **Sign-in:** `/login` Ã¢â‚¬â€ email as username, password, and **6-digit TOTP** when required. Standard `autocomplete` attributes support password managers.
- **Password policy:** 12+ characters with uppercase, lowercase, number, and symbol Ã¢â‚¬â€ see [`src/lib/password-policy.ts`](src/lib/password-policy.ts).
- **2FA:** **Admin** and **Board chair** accounts with `twoFactorEnabled` must provide a valid authenticator code (`otpauth` / TOTP).
- **Roles:** Persisted on `User.role` in the database (`ADMIN`, `BOARD_CHAIR`, `BOARD_MEMBER`, `COMMITTEE_MEMBER`, `EXECUTIVE_DIRECTOR`, `GUEST`). Labels in [`src/lib/auth/roles.ts`](src/lib/auth/roles.ts); permission matrix in [`src/lib/auth/permissions.ts`](src/lib/auth/permissions.ts) for future module gates.
- **Registration:** `/register` creates **board member** accounts; promote roles via database or future admin UI.
- **Recovery:** `/forgot-password` Ã¢â€ â€™ `/reset-password?token=Ã¢â‚¬Â¦` Ã¢â‚¬â€ one-hour tokens in `VerificationToken`. In **development**, the forgot-password API returns `devHint.resetLink` so you are not locked out; in production, send the link by email instead.
- **First run:** `cp .env.example .env` (set `AUTH_SECRET`), `npx prisma db push`, `npx prisma db seed`. Seeded demo: `admin@board.demo` / `BoardAdmin1!z9` + TOTP secret printed in the seed log; `member@board.demo` / `MemberPass1!z9` (no 2FA).
- **Routes:** `/` is a public landing page; dashboard routes require a session ([`src/middleware.ts`](src/middleware.ts) uses `getToken` for Edge compatibility).

