"use client";

import type { ReactNode } from "react";
import { SessionWatermarkOverlay, useIdleSignOut } from "@/components/content-protection";
import { ExpertReviewProviders } from "@/components/expert-review/ExpertReviewProviders";
import { GcReviewProviders } from "@/components/gc-review/GcReviewProviders";
import { useWorkspace } from "@/lib/workspace-context";
import { useDashboardProfile } from "@/lib/workspace/useDashboardProfile";
import { useOrganizationBranding } from "@/lib/organization-branding-context";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { ModuleRouteGuard } from "./ModuleRouteGuard";

export type DashboardShellProps = { children: ReactNode };

export function DashboardShell({ children }: DashboardShellProps) {
  const { organization } = useWorkspace();
  const { profile } = useDashboardProfile();
  const missionSnippet = organization?.missionSnippet?.trim() || profile.missionSnippet;
  const branding = useOrganizationBranding();
  useIdleSignOut();

  return (
    <div
      className="relative min-h-screen bg-[var(--surface-page,#f7f5f2)] text-[var(--text-primary,#1c1917)]"
      data-theme="light"
      style={branding.cssVariables}
    >
      <SessionWatermarkOverlay />
      <GcReviewProviders>
        <ExpertReviewProviders>
        <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
          <DashboardSidebar
            orgName={branding.effectiveOrganizationName}
            mission={missionSnippet}
            logo={branding.effectiveLogo}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader
              orgName={branding.effectiveOrganizationName}
              reportingPeriod={profile.reportingPeriod}
              isDemoTenant={organization?.isDemoTenant ?? false}
            />
            <ModuleRouteGuard>
              <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">{children}</div>
            </ModuleRouteGuard>
          </div>
        </div>
        </ExpertReviewProviders>
      </GcReviewProviders>
    </div>
  );
}