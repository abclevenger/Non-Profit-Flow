/**
 * Fire-and-forget audit log for authenticated sessions (client-only callers).
 */
export function logContentAccess(payload: {
  resourceType: string;
  resourceKey: string;
  href?: string | null;
}) {
  void fetch("/api/audit/content-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceType: payload.resourceType,
      resourceKey: payload.resourceKey,
      href: payload.href ?? null,
    }),
  }).catch(() => {});
}
