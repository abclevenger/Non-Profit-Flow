"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/auth/session-hooks";
import type { AppSession } from "@/lib/auth/app-session";
import { ALL_AGENCIES_COOKIE_VALUE } from "@/lib/auth/workspace-constants";
import type {
  SessionActiveMembership,
  SessionActiveOrganization,
  SessionAgencySummary,
  SessionOrganizationSummary,
} from "@/lib/auth/sessionOrganizations";
import type { SampleProfileId } from "@/lib/mock-data/types";
import { useDashboardProfile } from "@/lib/workspace/useDashboardProfile";

function coerceDemoProfileKey(raw: string | null | undefined): SampleProfileId {
  if (raw === "communityNonprofit" || raw === "growingNonprofit" || raw === "privateSchool") {
    return raw;
  }
  return "communityNonprofit";
}

export type WorkspaceContextValue = {
  organizationId: string | null;
  organization: SessionActiveOrganization | null;
  /** Active org team membership (role = permissions; title = position label). */
  activeMembership: SessionActiveMembership | null;
  /** Sample bundle key for benchmarks / legacy props */
  demoProfileKey: SampleProfileId;
  agencies: SessionAgencySummary[];
  activeAgencyId: string | null;
  agencyScopeIsAll: boolean;
  /** Organizations visible under the current agency scope (org switcher). */
  organizationsInScope: SessionOrganizationSummary[];
  organizations: SessionOrganizationSummary[];
  setActiveAgency: (agencyId: string) => Promise<void>;
  setActiveOrganization: (organizationId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  status: "loading" | "authenticated" | "unauthenticated";
  hasOrganization: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const active = session?.user?.activeOrganization ?? null;
  const activeMembership = session?.user?.activeMembership ?? null;
  const demoProfileKey = useMemo(() => coerceDemoProfileKey(active?.demoProfileKey), [active?.demoProfileKey]);

  const setActiveOrganization = useCallback(
    async (organizationId: string) => {
      await update({ activeOrganizationId: organizationId });
    },
    [update],
  );

  const setActiveAgency = useCallback(
    async (agencyId: string) => {
      await update({ activeAgencyId: agencyId });
      const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const j = (await r.json()) as AppSession | { user: null };
      if (!j || !("user" in j) || !j.user) return;
      const scoped =
        agencyId === ALL_AGENCIES_COOKIE_VALUE
          ? j.user.organizations
          : j.user.organizations.filter((o) => o.agencyId === agencyId);
      const cur = j.user.activeOrganizationId;
      if (scoped.length > 0 && (!cur || !scoped.some((o) => o.id === cur))) {
        await update({ activeOrganizationId: scoped[0]!.id });
      }
    },
    [update],
  );

  const refreshSession = useCallback(async () => {
    await update({});
  }, [update]);

  const value = useMemo<WorkspaceContextValue>(() => {
    const orgs = session?.user?.organizations ?? [];
    const agencies = session?.user?.agencies ?? [];
    const agencyScopeIsAll = Boolean(session?.user?.agencyScopeIsAll);
    const activeAgencyId = session?.user?.activeAgencyId ?? null;
    const organizationsInScope =
      agencyScopeIsAll || !activeAgencyId ? orgs : orgs.filter((o) => o.agencyId === activeAgencyId);
    const hasOrganization = Boolean(active?.id);
    return {
      organizationId: active?.id ?? null,
      organization: active,
      activeMembership,
      demoProfileKey,
      agencies,
      activeAgencyId,
      agencyScopeIsAll,
      organizationsInScope,
      organizations: orgs,
      setActiveAgency,
      setActiveOrganization,
      refreshSession,
      status,
      hasOrganization,
    };
  }, [
    active,
    activeMembership,
    demoProfileKey,
    session?.user?.agencies,
    session?.user?.organizations,
    session?.user?.activeAgencyId,
    session?.user?.agencyScopeIsAll,
    setActiveAgency,
    setActiveOrganization,
    refreshSession,
    status,
  ]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

/**
 * Workspace + dashboard profile (mock bundle or live tenant snapshot).
 * Prefer this name over `useDemoMode` for new code.
 */
export function useWorkspaceData() {
  const w = useWorkspace();
  const dash = useDashboardProfile();
  return {
    profileId: dash.profileId === "live" ? w.demoProfileKey : dash.profileId,
    setProfileId: (id: SampleProfileId) => {
      const match = w.organizations.find((o) => o.demoProfileKey === id);
      if (match) void w.setActiveOrganization(match.id);
    },
    profile: dash.profile,
    profileLoading: dash.loading,
    dataSource: dash.source,
    organizationId: w.organizationId,
    organization: w.organization,
  };
}

/**
 * @deprecated Use `useWorkspaceData()` — name retained for gradual migration.
 */
export function useDemoMode() {
  return useWorkspaceData();
}
