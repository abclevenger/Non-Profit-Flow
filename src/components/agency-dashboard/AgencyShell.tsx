"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState, type CSSProperties } from "react";
import { LogOutButton } from "@/components/auth/logout-button";
import { UserSessionMenu } from "@/components/auth/user-session-menu";
import { AgencySwitcher } from "@/components/dashboard/AgencySwitcher";
import type { AgencyDashboardSeat } from "@/lib/agency-dashboard/access";
import { useSession } from "@/lib/auth/session-hooks";

export const AgencyHubSearchContext = createContext({ query: "" });

export function useAgencyHubSearch() {
  return useContext(AgencyHubSearchContext);
}

type AgencyNavItem = { href: string; label: string; exact?: boolean };

function agencyNavItems(agencyId: string): AgencyNavItem[] {
  return [
    { href: `/agency/${agencyId}`, label: "Agency overview", exact: true },
    { href: `/agency/${agencyId}/accounts`, label: "Nonprofit accounts" },
    { href: `/agency/${agencyId}/team`, label: "Team members" },
    { href: `/agency/${agencyId}/assessments`, label: "Assessments" },
    { href: `/agency/${agencyId}/consult`, label: "Consult opportunities" },
    { href: `/agency/${agencyId}/documents`, label: "Documents" },
    { href: `/agency/${agencyId}/reports`, label: "Reports" },
    { href: `/agency/${agencyId}/branding`, label: "Branding" },
    { href: `/agency/${agencyId}/settings`, label: "Settings" },
  ];
}

export function AgencyShell({
  agencyId,
  agencyName,
  isWhiteLabel,
  seat,
  canManageAgency,
  children,
}: {
  agencyId: string;
  agencyName: string;
  isWhiteLabel: boolean;
  seat: AgencyDashboardSeat;
  canManageAgency: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [q, setQ] = useState("");
  const notifCount = 0;

  const items = useMemo(() => agencyNavItems(agencyId), [agencyId]);

  const linkClass = (href: string, exact?: boolean) => {
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return `rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? "bg-[color-mix(in_srgb,var(--agency-accent,#6b5344)_14%,white)] text-stone-900 shadow-sm ring-1 ring-stone-200/70"
        : "text-stone-700 hover:bg-white/70 hover:text-stone-900"
    }`;
  };

  return (
    <div
      className="min-h-screen bg-[#f4f2ee] text-stone-900"
      style={
        {
          "--agency-accent": "#5c5347",
        } as CSSProperties
      }
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-stone-200/90 bg-[#ebe6df] lg:min-h-screen lg:w-56 lg:border-b-0 lg:border-r">
          <div className="border-b border-stone-200/60 px-4 py-6 lg:px-5">
            <Link href="/overview" className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900">
              ← Nonprofit workspace
            </Link>
            <div className="mt-4 flex items-center gap-2">
              <Image src="/govflow-logo.png" alt="" width={36} height={44} className="h-9 w-auto object-contain" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Agency hub</p>
                <p className="truncate font-serif text-base font-semibold text-stone-900">{agencyName}</p>
                {isWhiteLabel ? (
                  <span className="mt-0.5 inline-block rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-stone-600 ring-1 ring-stone-200/80">
                    White-label
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-stone-500">
              {seat === "platform"
                ? "Platform scope"
                : seat === "OWNER"
                  ? "Agency owner"
                  : seat === "AGENCY_ADMIN"
                    ? "Agency admin"
                    : "Agency staff"}
              {!canManageAgency ? " · View-focused" : null}
            </p>
            <div className="mt-4 border-t border-stone-200/60 pt-4">
              <AgencySwitcher />
            </div>
            {session?.user?.isPlatformAdmin ? (
              <Link
                href="/platform-admin"
                className="mt-3 block text-center text-xs font-semibold text-violet-900 underline decoration-violet-300"
              >
                Platform hub
              </Link>
            ) : null}
          </div>
          <nav className="flex flex-col gap-0.5 px-2 py-4 lg:px-3" aria-label="Agency">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href, item.exact === true)}>
                {item.label}
              </Link>
            ))}
            {session?.user ? (
              <div className="mt-3 border-t border-stone-200/70 pt-3">
                <LogOutButton className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-left text-sm font-semibold text-stone-800 hover:bg-white/90" />
              </div>
            ) : null}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-stone-200/90 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div className="relative min-w-0 flex-1">
                <label htmlFor="agency-global-search" className="sr-only">
                  Search accounts and activity
                </label>
                <input
                  id="agency-global-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search accounts, people, flags…"
                  className="w-full rounded-xl border border-stone-200/90 bg-stone-50/90 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200/80"
                />
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  className="relative rounded-xl border border-stone-200/90 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50"
                  aria-label="Notifications"
                >
                  Alerts
                  {notifCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {notifCount}
                    </span>
                  ) : null}
                </button>
                {session?.user?.isPlatformAdmin ? (
                  <span className="hidden rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-semibold uppercase text-violet-900 ring-1 ring-violet-200/80 sm:inline">
                    Platform
                  </span>
                ) : null}
                {session?.user?.isDemoUser ? (
                  <span className="hidden rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase text-amber-950 ring-1 ring-amber-200/80 sm:inline">
                    Demo
                  </span>
                ) : null}
                <UserSessionMenu />
              </div>
            </div>
          </header>

          <AgencyHubSearchContext.Provider value={{ query: q }}>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">{children}</main>
          </AgencyHubSearchContext.Provider>
        </div>
      </div>
    </div>
  );
}
