"use client";

import type { CSSProperties, ReactNode } from "react";
import { SessionWatermarkOverlay, useIdleSignOut } from "@/components/content-protection";
import { useDemoMode } from "@/lib/demo-mode-context";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

export type DashboardShellProps = { children: ReactNode };

export function DashboardShell({ children }: DashboardShellProps) {
  const { profileId, setProfileId, profile } = useDemoMode();
  useIdleSignOut();

  const style = {
    "--demo-accent": profile.theme.accent,
    "--demo-accent-foreground": profile.theme.accentForeground,
    "--demo-sidebar-bg": profile.theme.sidebarBg,
    "--demo-border": profile.theme.border,
  } as CSSProperties;

  return (
    <div className="relative min-h-screen bg-[#f7f5f2] text-stone-900" style={style}>
      <SessionWatermarkOverlay />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <DashboardSidebar
          orgName={profile.organizationName}
          mission={profile.missionSnippet}
          logo={profile.logo}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            orgName={profile.organizationName}
            reportingPeriod={profile.reportingPeriod}
            profileId={profileId}
            onProfileIdChange={setProfileId}
          />
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}