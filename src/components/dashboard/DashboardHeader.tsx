"use client";

import Link from "next/link";
import type { SampleProfileId } from "@/lib/mock-data/types";
import { UserSessionMenu } from "@/components/auth/user-session-menu";
import { ExampleOrgSelector } from "./ExampleOrgSelector";

export type DashboardHeaderProps = {
  productName?: string;
  orgName: string;
  reportingPeriod: string;
  profileId: SampleProfileId;
  onProfileIdChange: (id: SampleProfileId) => void;
  ctaHref?: string;
};

export function DashboardHeader({
  productName = "Board Oversight Dashboard",
  orgName,
  reportingPeriod,
  profileId,
  onProfileIdChange,
  ctaHref = "https://www.missionimpactlegal.com/contact",
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-stone-200/90 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{productName}</p>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600 ring-1 ring-stone-200/80">
              Demo preview
            </span>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900 ring-1 ring-sky-200/80">
              Sample Organization
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">Preview how this could look for your organization</p>
          <h1 className="mt-2 truncate font-serif text-xl font-semibold text-stone-900 sm:text-2xl">{orgName}</h1>
          <p className="mt-1 text-sm text-stone-600">Reporting period: {reportingPeriod}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:max-w-xs lg:w-auto lg:min-w-[220px]">
          <UserSessionMenu />
          <ExampleOrgSelector profileId={profileId} onProfileIdChange={onProfileIdChange} />
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-center text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--demo-accent, #6b5344)",
              color: "var(--demo-accent-foreground, #faf8f5)",
            }}
          >
            Schedule a planning call
          </Link>
        </div>
      </div>
    </header>
  );
}