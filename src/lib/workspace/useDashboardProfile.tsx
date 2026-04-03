"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getDashboardProfile } from "@/lib/mock-data/dashboardData";
import type { OrganizationProfile, SampleProfileId } from "@/lib/mock-data/types";
import { useWorkspace } from "@/lib/workspace-context";

function coerceProfileKey(raw: string | null | undefined): SampleProfileId {
  if (raw === "growingNonprofit" || raw === "privateSchool" || raw === "communityNonprofit") return raw;
  return "communityNonprofit";
}

export type DashboardDataSource = "mock_bundle" | "supabase_tenant";

export type DashboardProfileState = {
  profile: OrganizationProfile;
  loading: boolean;
  error: string | null;
  source: DashboardDataSource;
  profileId: SampleProfileId | "live";
};

const DashboardProfileContext = createContext<DashboardProfileState | null>(null);

function useDashboardProfileState(): DashboardProfileState {
  const { organizationId, organization, demoProfileKey } = useWorkspace();
  const useLive = Boolean(organization?.useSupabaseTenantData && organizationId);

  const mockProfile = useMemo(
    () => getDashboardProfile(coerceProfileKey(demoProfileKey)),
    [demoProfileKey],
  );

  const [liveProfile, setLiveProfile] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useLive || !organizationId) {
      setLiveProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetch(`/api/organizations/${organizationId}/tenant-snapshot`, { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        const j = (await r.json()) as { profile?: OrganizationProfile; error?: string };
        if (!r.ok) {
          throw new Error(j.error ?? `HTTP ${r.status}`);
        }
        if (!j.profile) throw new Error("Missing profile");
        if (!cancelled) setLiveProfile(j.profile);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLiveProfile(null);
          setError(e instanceof Error ? e.message : "Failed to load tenant data");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [useLive, organizationId]);

  if (useLive && liveProfile) {
    return {
      profile: liveProfile,
      loading: false,
      error,
      source: "supabase_tenant",
      profileId: "live",
    };
  }

  if (useLive && loading) {
    return {
      profile: mockProfile,
      loading: true,
      error: null,
      source: "supabase_tenant",
      profileId: "live",
    };
  }

  if (useLive && error) {
    return {
      profile: mockProfile,
      loading: false,
      error,
      source: "supabase_tenant",
      profileId: "live",
    };
  }

  return {
    profile: mockProfile,
    loading: false,
    error: null,
    source: "mock_bundle",
    profileId: coerceProfileKey(demoProfileKey),
  };
}

export function DashboardProfileProvider({ children }: { children: ReactNode }) {
  const value = useDashboardProfileState();
  return <DashboardProfileContext.Provider value={value}>{children}</DashboardProfileContext.Provider>;
}

export function useDashboardProfile(): DashboardProfileState {
  const ctx = useContext(DashboardProfileContext);
  if (!ctx) {
    throw new Error("useDashboardProfile must be used within DashboardProfileProvider");
  }
  return ctx;
}
