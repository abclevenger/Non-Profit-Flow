"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { OrganizationProfile } from "@/lib/mock-data/types";
import {
  effectiveLogoFromTenant,
  effectiveOrganizationNameFromTenant,
  mergeBrandingFromSessionOrg,
} from "@/lib/organization-settings/colors";
import {
  defaultModulesAllEnabled,
  type DashboardModulesState,
  isModuleEnabledForPath,
} from "@/lib/organization-settings/modules";
import { useWorkspace } from "@/lib/workspace-context";
import { useDashboardProfile } from "@/lib/workspace/useDashboardProfile";

type OrganizationBrandingContextValue = {
  loading: boolean;
  error: string | null;
  effectiveOrganizationName: string;
  effectiveLogo: OrganizationProfile["logo"];
  effectiveModules: DashboardModulesState;
  cssVariables: CSSProperties;
  isModulePathAllowed: (pathname: string) => boolean;
  refresh: () => Promise<void>;
};

const OrganizationBrandingContext = createContext<OrganizationBrandingContextValue | null>(null);

export function OrganizationBrandingProvider({ children }: { children: ReactNode }) {
  const { organization, refreshSession, status } = useWorkspace();
  const { profile } = useDashboardProfile();

  const refresh = useCallback(async () => {
    await refreshSession();
  }, [refreshSession]);

  const value = useMemo<OrganizationBrandingContextValue>(() => {
    const effectiveOrganizationName = effectiveOrganizationNameFromTenant(organization, profile);
    const effectiveLogo = effectiveLogoFromTenant(organization, profile);
    const effectiveModules = organization?.modules ?? defaultModulesAllEnabled();
    const cssVariables = mergeBrandingFromSessionOrg(profile, organization);
    const isModulePathAllowed = (pathname: string) =>
      isModuleEnabledForPath(pathname, effectiveModules);
    return {
      loading: status === "loading",
      error: null,
      effectiveOrganizationName,
      effectiveLogo,
      effectiveModules,
      cssVariables,
      isModulePathAllowed,
      refresh,
    };
  }, [organization, profile, refresh, status]);

  return (
    <OrganizationBrandingContext.Provider value={value}>{children}</OrganizationBrandingContext.Provider>
  );
}

export function useOrganizationBranding() {
  const ctx = useContext(OrganizationBrandingContext);
  if (!ctx) throw new Error("useOrganizationBranding must be used within OrganizationBrandingProvider");
  return ctx;
}
