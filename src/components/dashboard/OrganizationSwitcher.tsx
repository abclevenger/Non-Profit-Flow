"use client";

import { useSession } from "@/lib/auth/session-hooks";
import { membershipRoleDisplayLabel } from "@/lib/saas/roles";
import { useWorkspace } from "@/lib/workspace-context";

export function OrganizationSwitcher() {
  const { data: session, status } = useSession();
  const { organizationId, organizations, setActiveOrganization, hasOrganization } = useWorkspace();

  if (status === "loading") {
    return (
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs font-medium text-stone-600">Organization</span>
        <p className="text-sm text-stone-500">Loading…</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (organizations.length === 0) {
    return (
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs font-medium text-stone-600">Organization</span>
        <p className="rounded-lg border border-amber-200/90 bg-amber-50/80 px-3 py-2 text-sm text-amber-950">
          You are not assigned to an organization yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor="active-organization" className="text-xs font-medium text-stone-600">
        Organization
      </label>
      <select
        id="active-organization"
        value={hasOrganization ? organizationId ?? "" : ""}
        onChange={(e) => {
          const next = e.target.value;
          if (next) void setActiveOrganization(next);
        }}
        className="max-w-full rounded-lg border border-stone-200/90 bg-white/90 px-3 py-2 text-sm font-medium text-stone-900 shadow-sm backdrop-blur-sm outline-none ring-stone-200 transition-shadow focus:border-stone-300 focus:ring-2 focus:ring-stone-200/80"
        aria-describedby="active-organization-hint"
      >
        {organizations.map((o) => {
          const roleLabel = membershipRoleDisplayLabel(o.membershipRole);
          const subtitle = [o.membershipTitle, roleLabel].filter(Boolean).join(" · ");
          return (
            <option key={o.id} value={o.id}>
              {o.isDemoTenant ? `${o.name} (demo)` : o.name}
              {subtitle ? ` — ${subtitle}` : ""}
            </option>
          );
        })}
      </select>
      <p id="active-organization-hint" className="text-[11px] text-stone-500">
        Switch organization
      </p>
    </div>
  );
}
