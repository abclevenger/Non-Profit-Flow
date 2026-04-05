"use client";

import { LogOutButton } from "@/components/auth/logout-button";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { membershipRoleDisplayLabel } from "@/lib/saas/roles";
import { useAppSession } from "./app-auth-provider";

export function UserSessionMenu() {
  const { data: session, status } = useAppSession();

  if (status === "loading") {
    return <span className="text-xs text-stone-500">Session…</span>;
  }
  if (!session?.user) {
    return null;
  }

  const {
    email,
    name,
    role,
    membershipRole,
    isPlatformAdmin,
    isDemoUser,
    activeOrganization,
    activeMembership,
    activeAgency,
    agencyScopeIsAll,
  } = session.user;
  const displayName = (name || email || "").trim() || "Team member";
  const orgName = activeOrganization?.name ?? null;
  const agencyLabel = agencyScopeIsAll ? "All agencies" : activeAgency?.name ?? null;
  const title = activeMembership?.title?.trim() || null;
  const roleBadge = membershipRoleDisplayLabel(membershipRole);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Team member</p>
        <p className="truncate font-medium text-stone-900">{displayName}</p>
        {title ? <p className="truncate text-xs text-stone-700">{title}</p> : null}
        <p className="truncate text-xs text-stone-600">{email}</p>
        {agencyLabel ? (
          <p className="mt-0.5 truncate text-[11px] text-stone-500">
            Agency: <span className="font-medium text-stone-700">{agencyLabel}</span>
          </p>
        ) : null}
        {orgName ? (
          <p className="mt-1 truncate text-xs text-stone-600">
            <span className="font-medium text-stone-800">{orgName}</span>
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-stone-200/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-800">
            {roleBadge}
          </span>
          {isPlatformAdmin ? (
            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900">
              Platform admin
            </span>
          ) : null}
          {isDemoUser ? (
            <span className="rounded-md bg-amber-100/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950 ring-1 ring-amber-200/80">
              Demo user
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[10px] text-stone-500">
          App permission layer: <span className="font-medium text-stone-600">{ROLE_LABELS[role]}</span>
        </p>
      </div>
      <LogOutButton className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50" />
    </div>
  );
}
