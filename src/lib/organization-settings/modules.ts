/**
 * Dashboard module visibility (per organization).
 * Toggle OFF hides nav items and blocks module routes (client guard).
 */

export const DASHBOARD_MODULE_KEYS = [
  "STRATEGY",
  "GOVERNANCE",
  "RISKS",
  "MEETINGS",
  "MINUTES",
  "VOTING",
  "TRAINING",
  "DOCUMENTS",
] as const;

export type DashboardModuleKey = (typeof DASHBOARD_MODULE_KEYS)[number];

export const DASHBOARD_MODULE_LABEL: Record<DashboardModuleKey, string> = {
  STRATEGY: "Strategy",
  GOVERNANCE: "Governance",
  RISKS: "Risks",
  MEETINGS: "Meetings",
  MINUTES: "Minutes",
  VOTING: "Voting",
  TRAINING: "Training",
  DOCUMENTS: "Documents",
};

/** First matching prefix wins (supports nested routes e.g. /meetings/[id]). */
const ROUTE_MODULE_PREFIXES: { prefix: string; key: DashboardModuleKey }[] = [
  { prefix: "/strategy", key: "STRATEGY" },
  { prefix: "/governance", key: "GOVERNANCE" },
  { prefix: "/risks", key: "RISKS" },
  { prefix: "/meetings", key: "MEETINGS" },
  { prefix: "/minutes", key: "MINUTES" },
  { prefix: "/voting", key: "VOTING" },
  { prefix: "/training", key: "TRAINING" },
  { prefix: "/documents", key: "DOCUMENTS" },
];

/** Nav href → module key (single-segment paths only). */
export const MODULE_KEY_BY_NAV_HREF: Record<string, DashboardModuleKey> = {
  "/strategy": "STRATEGY",
  "/governance": "GOVERNANCE",
  "/risks": "RISKS",
  "/meetings": "MEETINGS",
  "/minutes": "MINUTES",
  "/voting": "VOTING",
  "/training": "TRAINING",
  "/documents": "DOCUMENTS",
};

export type DashboardModulesState = Record<DashboardModuleKey, boolean>;

export function defaultModulesAllEnabled(): DashboardModulesState {
  return {
    STRATEGY: true,
    GOVERNANCE: true,
    RISKS: true,
    MEETINGS: true,
    MINUTES: true,
    VOTING: true,
    TRAINING: true,
    DOCUMENTS: true,
  };
}

export function parseModulesJson(raw: string | null | undefined): DashboardModulesState | null {
  if (raw == null || raw.trim() === "") return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object" || Array.isArray(o)) return null;
    const rec = o as Record<string, unknown>;
    const next = { ...defaultModulesAllEnabled() };
    for (const k of DASHBOARD_MODULE_KEYS) {
      if (typeof rec[k] === "boolean") next[k] = rec[k];
    }
    return next;
  } catch {
    return null;
  }
}

export function serializeModulesJson(modules: DashboardModulesState): string {
  const o: Record<string, boolean> = {};
  for (const k of DASHBOARD_MODULE_KEYS) {
    o[k] = modules[k];
  }
  return JSON.stringify(o);
}

export function mergeModulesState(parsed: DashboardModulesState | null): DashboardModulesState {
  if (!parsed) return defaultModulesAllEnabled();
  return { ...defaultModulesAllEnabled(), ...parsed };
}

/** Which module applies to this path, if any. */
export function moduleKeyForPathname(pathname: string): DashboardModuleKey | null {
  for (const { prefix, key } of ROUTE_MODULE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return key;
  }
  return null;
}

export function isModuleEnabledForPath(pathname: string, modules: DashboardModulesState): boolean {
  const key = moduleKeyForPathname(pathname);
  if (key === null) return true;
  return modules[key] === true;
}
