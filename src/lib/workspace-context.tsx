"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/auth/session-hooks";
import type { SessionActiveOrganization } from "@/lib/auth/sessionOrganizations";
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
  /** Sample bundle key for benchmarks / legacy props */
  demoProfileKey: SampleProfileId;
  organizations: import("@/lib/auth/sessionOrganizations").SessionOrganizationSummary[];
  setActiveOrganization: (organizationId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  status: "loading" | "authenticated" | "unauthenticated";
  hasOrganization: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const active = session?.user?.activeOrganization ?? null;
  const demoProfileKey = useMemo(() => coerceDemoProfileKey(active?.demoProfileKey), [active?.demoProfileKey]);

  const setActiveOrganization = useCallback(
    async (organizationId: string) => {
      await update({ activeOrganizationId: organizationId });
    },
    [update],
  );

  const refreshSession = useCallback(async () => {
    await update({});
  }, [update]);

  const value = useMemo<WorkspaceContextValue>(() => {
    const orgs = session?.user?.organizations ?? [];
    const hasOrganization = Boolean(active?.id);
    return {
      organizationId: active?.id ?? null,
      organization: active,
      demoProfileKey,
      organizations: orgs,
      setActiveOrganization,
      refreshSession,
      status,
      hasOrganization,
    };
  }, [active, demoProfileKey, session?.user?.organizations, setActiveOrganization, refreshSession, status]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

/**
 * @deprecated Prefer `useWorkspace()` + `useDashboardProfile()` — kept for gradual migration.
 */
export function useDemoMode() {
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
