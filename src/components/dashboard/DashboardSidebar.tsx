"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OrganizationProfile } from "@/lib/mock-data/types";

export type NavItem = { href: string; label: string };

const defaultNav: NavItem[] = [
  { href: "/overview", label: "Overview" },
  { href: "/strategy", label: "Strategy" },
  { href: "/governance", label: "Governance" },
  { href: "/risks", label: "Risks" },
  { href: "/meetings", label: "Meetings" },
  { href: "/minutes", label: "Minutes" },
  { href: "/voting", label: "Voting" },
  { href: "/training", label: "Training" },
  { href: "/documents", label: "Documents" },
];

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

  return (
    <aside
      className="flex w-full flex-col border-b border-stone-200/90 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r"
      style={{ backgroundColor: "var(--demo-sidebar-bg, #f2efe8)" }}
    >
      <div className="flex items-start gap-3 px-4 py-5 lg:flex-col lg:px-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-stone-300/80 bg-white text-xs font-semibold text-stone-500 shadow-sm">
          {logo.type === "url" && logo.src ? (
            <Image src={logo.src} alt={logo.alt} width={48} height={48} className="rounded-xl object-cover" />
          ) : (
            <span className="px-1 text-center leading-tight">Logo</span>
          )}
        </div>
        <div className="min-w-0 lg:mt-2">
          <p className="font-serif text-base font-semibold leading-snug text-stone-900">{orgName}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">{mission}</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:px-3 lg:pb-6" aria-label="Primary">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:whitespace-normal ${
                active
                  ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/80"
                  : "text-stone-700 hover:bg-white/60 hover:text-stone-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}