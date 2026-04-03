"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { SessionActiveOrganization } from "@/lib/auth/sessionOrganizations";
import { getDashboardProfile } from "@/lib/mock-data/dashboardData";
import type { OrganizationProfile, SampleProfileId } from "@/lib/mock-data/types";

function coerceDemoProfileKey(raw: string | null | undefined): SampleProfileId {
  if (raw === "communityNonprofit" || raw === "growingNonprofit" || raw === "privateSchool") {
    return raw;
  }
  return "communityNonprofit";
}

type WorkspaceContextValue = {
  organizationId: string | null;
  organization: SessionActiveOrganization | null;
  profile: OrganizationProfile;
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

  const profile = useMemo(() => getDashboardProfile(demoProfileKey), [demoProfileKey]);

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
      profile,
      demoProfileKey,
      organizations: orgs,
      setActiveOrganization,
      refreshSession,
      status,
      hasOrganization,
    };
  }, [active, demoProfileKey, profile, session?.user?.organizations, setActiveOrganization, refreshSession, status]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

/**
 * @deprecated Use `useWorkspace()` — kept for gradual migration; maps to workspace fields.
 */
export function useDemoMode() {
  const w = useWorkspace();
  return {
    profileId: w.demoProfileKey,
    setProfileId: (id: SampleProfileId) => {
      const match = w.organizations.find((o) => o.demoProfileKey === id);
      if (match) void w.setActiveOrganization(match.id);
    },
    profile: w.profile,
    organizationId: w.organizationId,
    organization: w.organization,
  };
}
