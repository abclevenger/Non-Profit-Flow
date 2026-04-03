# Basic content protection (DRM-lite)

## Goal

Reduce casual leakage of sensitive board material (**documents, minutes, votes, discussions**) through **authentication**, **role-aware access**, **light UX deterrence** (view-only, watermarks), **download policy**, and **audit logging**—while staying **simple, professional, and non-frustrating**. This is **deterrence and traceability**, not cryptographic DRM or copy prevention.

**Aligns with:** existing [NextAuth + roles](src/lib/auth/roles.ts), [`hasPermission`](src/lib/auth/permissions.ts), middleware, and mock **`publicVisible`** on votes/minutes/meetings.

---

## 1. Access control (foundation)

| Requirement | Approach |
|-------------|----------|
| Only logged-in users | Already enforced by middleware for dashboard routes; keep **`/`** and auth pages public. |
| Role-based access | Extend use of **`hasPermission(role, "view" \| "vote" \| …)`**; add **module → minimum role / permission** map (e.g. Voting: `vote`; Recruiting/Compliance when those routes exist: `edit` or dedicated flag). |
| Restrict sensitive modules | **Server-side gate:** layout or wrapper that calls **`auth()`** and checks role; **unauthorized → 403 page** or redirect with calm copy—not a scary error. |

**Optional:** `sensitivity: "standard" \| "elevated" \| "restricted"` on `OrganizationProfile` or per-route config object.

---

## 2. View-only protection (deterrent)

- **`ContentProtectionShell`** (client): wraps sensitive regions; props `disableContextMenu?: boolean`, `restrictSelection?: boolean`, `viewOnly?: boolean`.
- **Right-click:** `onContextMenu={(e) => e.preventDefault()}` when enabled (basic deterrent only).
- **Text selection:** `select-none` / `user-select: none` when `restrictSelection` (optional per tenant or per role—**Guests** stricter than **Chair**).
- **“View only”** banner: subtle strip when user lacks `edit` on that module.

**Copy in UI:** “Screen captures and copies may still be possible—this reduces casual sharing.”

---

## 3. Watermarking (important)

**`SessionWatermarkOverlay`** (client + session from `useSession()`):

- Fixed or repeating semi-transparent text (low opacity, `pointer-events-none`, `z-index` above content but below modals as needed).
- Dynamic string: **`Viewed by {name} ({email}) · {localized date/time}`**.
- **Server-rendered variant** optional for first paint (pass user from `auth()` into layout props).

**Apply to:** documents list/detail, minutes detail panel, voting detail, meeting packet views—**config-driven** list of routes or wrapper in `(dashboard)` segment for “sensitive” subtrees only.

---

## 4. Screenshot deterrence (light)

- **Diagonal repeating watermark** (same user/email hash + date) behind content—not a full-screen blocker.
- **No** `beforeunload` spam, **no** key-blocking, **no** DevTools detection (unreliable and hostile UX).

---

## 5. Document access control

- **`DocumentItem`** (mock) extended with `downloadAllowed: boolean` **or** derive from role + `hasPermission(..., "edit")` for “coordinator download.”
- UI: **Download** button hidden or disabled with tooltip **“Download disabled by policy.”**
- **Track access:** on “open document” / “view detail,” fire **server action** or **`POST /api/audit/content-access`** (see §6).

---

## 6. Activity tracking (audit)

**`ContentAccessLog`** (persist in production):

```ts
interface ContentAccessLog {
  id: string;
  userId: string;
  userEmail: string;
  contentType: "document" | "minutes" | "vote" | "meeting" | "other";
  contentId: string;
  action: "viewed" | "downloaded";
  timestamp: string; // ISO
  /** future: ipHash, userAgent */
}
```

**v1 demo:** append to **in-memory array** capped at N, **or** **Prisma model** + table (same DB as users) for durability across restarts.

**Instrumentation points:** document link click, minutes panel open, vote card expand/select, download success.

**Admin UI (future / v1 minimal):** simple table on **`/admin/audit`** (admin-only) or export JSON for demo.

---

## 7. Session control

- **NextAuth JWT `maxAge`:** shorten for stricter deploys (e.g. 8h); document in README.
- **Idle logout:** client `useIdleTimer` (e.g. 30–45 min) → `signOut({ callbackUrl: "/login" })` with **one** quiet toast “Signed out due to inactivity.”
- **“Secure session” (optional):** require re-auth or 2FA step before **download** or **export** (hook into existing admin 2FA path).

---

## 8. Share prevention

- **No public share URLs** for board content in v1; existing **`publicVisible`** remains a **labeling / comms** flag, not a world-readable route without auth.
- **Future:** time-limited magic links with **signed tokens** + server validation + log entry.

---

## 9. UI indicators

Reusable **`SensitivityBadge`**:

- **Confidential** | **Board only** | **Restricted access** — map from `publicVisible`, module defaults, or explicit `sensitivity` on mock items.

Place near headers on minutes, votes, documents—**small**, **stone/amber**, not alarming red.

---

## 10. Future-ready (structure only)

- Expiring access links (signed JWT + `exp` + audit row).
- Encrypted blobs (S3 + KMS / client-side keys)—out of scope.
- Download tracking (extend `ContentAccessLog.action`).
- Legal disclaimer modal on first access to restricted class (stored `ack` in DB).
- IP/device fingerprint **hashed** + retention policy.

Document extension points in **`src/lib/content-protection/README.md`** (when implementing).

---

## 11. UX principles

- Defaults **on** for sensitive modules **without** modal walls.
- **No** repetitive popups; watermarks **subtle**.
- **Professional** language in any disclaimer.

---

## 12. Implementation phases

**Phase A — Watermark + shell**  
`SessionWatermarkOverlay`, `ContentProtectionShell`, wrap minutes + voting + documents.

**Phase B — RBAC on modules**  
Map routes → permissions; 403 view; use `hasPermission`.

**Phase C — Audit**  
Prisma `ContentAccessLog` + API route + hooks from key UI actions.

**Phase D — Downloads + idle**  
`downloadAllowed` + idle sign-out + NextAuth `maxAge` tuning.

---

## 13. Files to add / touch (when implementing)

| Area | Paths |
|------|--------|
| Components | `src/components/content-protection/SessionWatermarkOverlay.tsx`, `ContentProtectionShell.tsx`, `SensitivityBadge.tsx` |
| Hooks | `src/lib/content-protection/useIdleSignOut.ts` |
| Audit | `prisma/schema.prisma` (optional), `src/app/api/audit/content-access/route.ts` |
| Layout | selective wrap in `(dashboard)/minutes`, `voting`, `documents` or shared `SensitiveDocumentLayout` |
| Auth | [`src/middleware.ts`](src/middleware.ts), [`src/lib/auth/permissions.ts`](src/lib/auth/permissions.ts), route groups |

---

## 14. Verification

- Logged-out user cannot reach dashboard; Guest cannot open restricted module (403).
- Watermark shows correct session user + time on wrapped pages.
- Audit row created on simulated “view.”
- `npm run lint` / `npm run build`.

---

## Implementation checklist

- [ ] `SessionWatermarkOverlay` + optional diagonal layer; wrap sensitive views
- [ ] `ContentProtectionShell` (context menu + optional `select-none` + view-only hint)
- [ ] `SensitivityBadge` + wire to minutes/votes/documents headers
- [ ] Module RBAC map + 403 UI for Voting / future Recruiting / Compliance
- [ ] `ContentAccessLog` persistence + `POST /api/audit/content-access` + client hooks
- [ ] Document `downloadAllowed` + disabled download UI + audit on download
- [ ] Idle sign-out + document session `maxAge`
- [ ] `content-protection/README.md` for future DRM features
- [ ] Lint / build
