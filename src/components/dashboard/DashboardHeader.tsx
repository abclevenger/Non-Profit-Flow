"use client";

import Image from "next/image";
import Link from "next/link";
import { UserSessionMenu } from "@/components/auth/user-session-menu";
import { AgencySwitcher } from "./AgencySwitcher";
import { OrganizationSwitcher } from "./OrganizationSwitcher";

export type DashboardHeaderProps = {
  orgName: string;
  reportingPeriod: string;
  /** Seeded showcase organization — distinct from production customer workspaces. */
  isDemoTenant?: boolean;
  ctaHref?: string;
};

export function DashboardHeader({
  orgName,
  reportingPeriod,
  isDemoTenant = true,
  ctaHref = "https://www.mission-impact.legal/contact",
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-stone-200/90 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Image
                src="/govflow-logo.png"
                alt=""
                width={88}
                height={104}
                className="h-10 w-auto object-contain object-left"
                priority
              />
              <span className="font-serif text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
                Non-Profit Flow
              </span>
            </div>
            {isDemoTenant ? (
              <>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950 ring-1 ring-amber-200/90">
                  Demo tenant
                </span>
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900 ring-1 ring-sky-200/80">
                  Sample data
                </span>
              </>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-200/80">
                Live workspace
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {isDemoTenant
              ? "Preview how this could look for your organization"
              : "Organization data is loaded from your tenant store"}
          </p>
          <h1 className="mt-2 truncate font-serif text-xl font-semibold text-stone-900 sm:text-2xl">{orgName}</h1>
          <p className="mt-1 text-sm text-stone-600">Reporting period: {reportingPeriod}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:max-w-xs lg:w-auto lg:min-w-[220px]">
          <UserSessionMenu />
          <AgencySwitcher />
          <OrganizationSwitcher />
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-center text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--accent-color, var(--demo-accent, #6b5344))",
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