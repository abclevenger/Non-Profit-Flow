"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth/session-hooks";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { canAccessVotingWorkspace } from "@/lib/auth/permissions";
import { isMemberRole } from "@/lib/auth/roles";
import type { Session } from "@/lib/auth/app-session";
import { canAccessReviewsQueue, canManageIssueRouting } from "@/lib/expert-review/permissions";
import { canAccessGcReviewQueue } from "@/lib/gc-review/permissions";
import { useOrganizationBranding } from "@/lib/organization-branding-context";
import { MODULE_KEY_BY_NAV_HREF } from "@/lib/organization-settings/modules";
import { canManageOrganizationSettings } from "@/lib/organization-settings/permissions";
import type { OrganizationProfile } from "@/lib/mock-data/types";

export type NavItem = { href: string; label: string };

const defaultNav: NavItem[] = [
  { href: "/overview", label: "Overview" },
  { href: "/assessment", label: "Assessment" },
  { href: "/assessment/report", label: "Assessment report" },
  { href: "/assessment/standards", label: "Standards hub" },
  { href: "/assessment/executive-report", label: "Executive report" },
  { href: "/strategy", label: "Strategy" },
  { href: "/governance", label: "Governance" },
  { href: "/risks", label: "Risks" },
  { href: "/meetings", label: "Meetings" },
  { href: "/minutes", label: "Minutes" },
  { href: "/voting", label: "Voting" },
  { href: "/training", label: "Training" },
  { href: "/documents", label: "Documents" },
];

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export type DashboardSidebarProps = {
  orgName: string;
  mission: string;
  logo: OrganizationProfile["logo"];
  navItems?: NavItem[];
};

export function DashboardSidebar({
  orgName,
  mission,
  logo,
  navItems = defaultNav,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { effectiveModules } = useOrganizationBranding();

  const { mainNav, settingsNavItems } = useMemo(() => {
    let items = navItems;
    const role = session?.user?.role;
    if (role && isMemberRole(role)) {
      items = items.filter(
        (item) => item.href !== "/voting" || canAccessVotingWorkspace(role),
      );
    }
    items = items.filter((item) => {
      const key = MODULE_KEY_BY_NAV_HREF[item.href];
      if (!key) return true;
      return effectiveModules[key] === true;
    });
    if (session?.user?.isPlatformAdmin) {
      items = [...items, { href: "/platform-admin", label: "Platform admin" }];
    }
    if (role === "ADMIN") {
      items = [
        ...items,
        { href: "/admin/audit", label: "Audit log" },
        { href: "/auth/debug", label: "Supabase session" },
      ];
    }
    if (role && isMemberRole(role) && canAccessGcReviewQueue(role)) {
      items = [...items, { href: "/general-counsel", label: "GC review queue" }];
    }
    if (role && isMemberRole(role) && canAccessReviewsQueue(role)) {
      items = [...items, { href: "/reviews", label: "Review requests" }];
    }
    const showOrgSettings =
      role && isMemberRole(role) && canManageOrganizationSettings(session as Session | null);
    const settingsNavItems: { href: string; label: string; primary?: boolean }[] = [];
    if (showOrgSettings) {
      settingsNavItems.push(
        { href: "/settings", label: "Organization", primary: true },
        { href: "/settings/workspace", label: "Workspace ops" },
        { href: "/settings/members", label: "Team members" },
        { href: "/billing", label: "Billing" },
      );
    }
    if (role && isMemberRole(role) && canManageIssueRouting(session as Session | null)) {
      if (!settingsNavItems.some((i) => i.href === "/settings/routing")) {
        settingsNavItems.push({ href: "/settings/routing", label: "Issue routing" });
      }
    }
    const hasActiveOrg = Boolean(session?.user?.activeOrganizationId);
    if (hasActiveOrg && role && isMemberRole(role)) {
      if (!settingsNavItems.some((i) => i.href === "/settings/account")) {
        settingsNavItems.push({
          href: "/settings/account",
          label: "My account",
          primary: settingsNavItems.length === 0,
        });
      }
    }
    return { mainNav: items, settingsNavItems };
  }, [navItems, session, effectiveModules]);

  const linkClass = (href: string, exact?: boolean) => {
    const active = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
    return `whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:whitespace-normal ${
      active
        ? "bg-[color-mix(in_srgb,var(--primary-color,var(--brand-primary))_16%,white)] text-stone-900 shadow-sm ring-1 ring-stone-200/70"
        : "text-stone-700 hover:bg-white/70 hover:text-stone-900"
    }`;
  };

  const hasLogoImage = logo.type === "url" && Boolean(logo.src);

  const renderMark = () => {
    if (hasLogoImage && logo.src) {
      if (logo.src.startsWith("data:")) {
        return (
          // eslint-disable-next-line @next/next/no-img-element -- data URLs / branding
          <img
            src={logo.src}
            alt={logo.alt}
            className="max-h-20 max-w-full object-contain"
            width={160}
            height={80}
          />
        );
      }
        return (
        <Image
          src={logo.src}
          alt={logo.alt}
          width={160}
          height={190}
          className="max-h-32 w-auto max-w-[7.5rem] object-contain"
        />
      );
    }
    return (
      <span className="line-clamp-3 px-2 text-center font-serif text-base font-semibold leading-snug tracking-tight text-stone-800">
        {orgName}
      </span>
    );
  };

  return (
    <aside
      className="flex min-h-0 w-full flex-col border-b border-stone-200/90 lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r"
      style={{ backgroundColor: "var(--demo-sidebar-bg, #f2efe8)" }}
    >
      <div className="border-b border-stone-200/50 bg-[color-mix(in_srgb,var(--surface-elevated,#fff)_72%,transparent)] px-5 py-8 text-center backdrop-blur-[2px] lg:px-6">
        <div className="mx-auto flex max-w-[14rem] flex-col items-center gap-5">
          <div
            className={`flex w-full items-center justify-center rounded-2xl border border-stone-200/80 bg-[var(--surface-elevated,#ffffff)] shadow-sm ring-1 ring-stone-100/80 ${
              hasLogoImage ? "min-h-[8rem] max-w-[9rem] px-3 py-4" : "min-h-[5.5rem] max-w-[5.5rem] px-2 py-4"
            }`}
            aria-label={hasLogoImage ? "Organization logo" : "Organization name"}
          >
            {renderMark()}
          </div>
          <div className="w-full space-y-2">
            {hasLogoImage ? (
              <p className="font-serif text-lg font-semibold leading-snug text-stone-900">{orgName}</p>
            ) : null}
            <p className="text-pretty text-sm leading-relaxed text-stone-600">{mission}</p>
          </div>
        </div>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col px-2 pb-3 pt-4 lg:px-3 lg:pb-6" aria-label="Primary">
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto lg:overflow-x-visible">
          <div className="flex gap-1 lg:flex-col">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {settingsNavItems.length > 0 ? (
          <div
            className="mt-3 flex shrink-0 flex-col gap-1 border-t border-stone-200/80 pt-3 lg:mt-auto"
            role="region"
            aria-labelledby="sidebar-settings-heading"
          >
            <h2
              id="sidebar-settings-heading"
              className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-stone-500"
            >
              Settings
            </h2>
            <div className="flex flex-col gap-1">
              {settingsNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${linkClass(item.href, true)} ${
                    item.primary
                      ? "flex items-center justify-center gap-2 lg:justify-start"
                      : ""
                  }`}
                >
                  {item.primary ? (
                    <GearIcon className="shrink-0 opacity-80" aria-hidden />
                  ) : null}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
