"use client";

import { useSession } from "@/lib/auth/session-hooks";
import { ALL_AGENCIES_COOKIE_VALUE } from "@/lib/auth/workspace-constants";
import { useWorkspace } from "@/lib/workspace-context";

function agencyRoleLabel(role: string | null, isOwner: boolean): string {
  if (isOwner) return "Owner";
  if (role === "AGENCY_ADMIN") return "Agency admin";
  if (role === "AGENCY_STAFF") return "Agency staff";
  if (role === null) return "Organization access";
  return role;
}

export function AgencySwitcher() {
  const { data: session, status } = useSession();
  const { agencies, setActiveAgency, activeAgencyId, agencyScopeIsAll } = useWorkspace();

  if (status === "loading") {
    return (
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs font-medium text-stone-600">Agency</span>
        <p className="text-sm text-stone-500">Loading…</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (agencies.length === 0) {
    return null;
  }

  const isPlatform = session.user.isPlatformAdmin;
  const selectValue = isPlatform && agencyScopeIsAll ? ALL_AGENCIES_COOKIE_VALUE : activeAgencyId ?? "";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor="active-agency" className="text-xs font-medium text-stone-600">
        Agency
      </label>
      <select
        id="active-agency"
        value={selectValue}
        onChange={(e) => {
          void setActiveAgency(e.target.value);
        }}
        className="max-w-full rounded-lg border border-stone-200/90 bg-white/90 px-3 py-2 text-sm font-medium text-stone-900 shadow-sm backdrop-blur-sm outline-none ring-stone-200 transition-shadow focus:border-stone-300 focus:ring-2 focus:ring-stone-200/80"
        aria-describedby="active-agency-hint"
      >
        {isPlatform ? (
          <option value={ALL_AGENCIES_COOKIE_VALUE}>All agencies (platform)</option>
        ) : null}
        {agencies.map((a) => {
          const subtitle = agencyRoleLabel(a.agencyMembershipRole, a.isOwner);
          const wl = a.isWhiteLabel ? "White-label" : "Agency";
          return (
            <option key={a.id} value={a.id}>
              {a.name} — {subtitle} · {wl}
            </option>
          );
        })}
      </select>
      <p id="active-agency-hint" className="text-[11px] text-stone-500">
        {isPlatform ? "Platform → agency scope" : "Switch reseller / firm context"}
      </p>
    </div>
  );
}
