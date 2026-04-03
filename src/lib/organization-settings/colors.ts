import type { CSSProperties } from "react";
import type { SessionActiveOrganization } from "@/lib/auth/sessionOrganizations";
import type { OrganizationProfile, SampleProfileId } from "@/lib/mock-data/types";
import { getDashboardProfile } from "@/lib/mock-data/dashboardData";
import { defaultModulesAllEnabled } from "./modules";
import type { OrganizationSettingsPublic } from "./types";

const HEX = /^#([0-9a-fA-F]{6})$/;

export function normalizeHex(input: string): string | null {
  const t = input.trim();
  if (!HEX.test(t)) return null;
  return t.toLowerCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  const v = parseInt(n.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const srgb = [rgb.r, rgb.g, rgb.b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function foregroundForBackground(bgHex: string): string {
  return luminance(bgHex) > 0.55 ? "#1c1917" : "#fafaf9";
}

function mixHex(a: string, b: string, ratioA: number): string {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return a;
  const r = Math.round(ra.r * ratioA + rb.r * (1 - ratioA));
  const g = Math.round(ra.g * ratioA + rb.g * (1 - ratioA));
  const bl = Math.round(ra.b * ratioA + rb.b * (1 - ratioA));
  return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function defaultSecondaryColor(): string {
  return "#5c7a7a";
}

function buildBrandingCssProperties(primary: string, secondary: string, buttonAccent: string): CSSProperties {
  const accentFg = foregroundForBackground(buttonAccent);
  const sidebarBg = mixHex(secondary, "#f7f5f2", 0.12);
  const border = mixHex(secondary, "#e7e2d9", 0.35);
  const linkMuted = mixHex(primary, "#57534e", 0.55);

  return {
    "--primary": primary,
    "--secondary": secondary,
    "--accent": buttonAccent,
    "--primary-color": primary,
    "--secondary-color": secondary,
    "--accent-color": buttonAccent,
    "--brand-primary": primary,
    "--brand-secondary": secondary,
    "--brand-accent": buttonAccent,
    "--demo-accent": buttonAccent,
    "--demo-accent-foreground": accentFg,
    "--demo-sidebar-bg": sidebarBg,
    "--demo-border": border,
    "--link-color": primary,
    "--link-hover-color": linkMuted,
    "--surface-page": "#f7f5f2",
    "--surface-elevated": "#ffffff",
    "--text-primary": "#1c1917",
    "--text-muted": "#57534e",
  } as CSSProperties;
}

/** Legacy demo settings row (being phased out). */
export function mergeBrandingCss(
  profile: OrganizationProfile,
  _profileId: SampleProfileId,
  saved: OrganizationSettingsPublic | null,
): CSSProperties {
  const primary = normalizeHex(saved?.primaryColor ?? "") ?? profile.theme.accent;
  const secondary = normalizeHex(saved?.secondaryColor ?? "") ?? defaultSecondaryColor();
  const accentFromSaved = normalizeHex(saved?.accentColor ?? "");
  const buttonAccent = accentFromSaved ?? primary;
  return buildBrandingCssProperties(primary, secondary, buttonAccent);
}

export function mergeBrandingFromSessionOrg(
  profile: OrganizationProfile,
  org: SessionActiveOrganization | null,
): CSSProperties {
  if (!org) {
    const primary = profile.theme.accent;
    const secondary = defaultSecondaryColor();
    return buildBrandingCssProperties(primary, secondary, primary);
  }
  const primary = normalizeHex(org.primaryColor) ?? profile.theme.accent;
  const secondary = normalizeHex(org.secondaryColor) ?? defaultSecondaryColor();
  const buttonAccent = normalizeHex(org.accentColor ?? "") ?? primary;
  return buildBrandingCssProperties(primary, secondary, buttonAccent);
}

export function effectiveOrganizationNameFromTenant(
  org: SessionActiveOrganization | null,
  profile: OrganizationProfile,
): string {
  return org?.name?.trim() || profile.organizationName;
}

export function effectiveLogoFromTenant(
  org: SessionActiveOrganization | null,
  profile: OrganizationProfile,
): OrganizationProfile["logo"] {
  const url = org?.logoUrl?.trim();
  const name = effectiveOrganizationNameFromTenant(org, profile);
  if (
    url &&
    (url.startsWith("data:") ||
      url.startsWith("https://") ||
      url.startsWith("http://") ||
      url.startsWith("/"))
  ) {
    return { type: "url", src: url, alt: `${name} logo` };
  }
  return profile.logo;
}

export function effectiveOrganizationName(
  profile: OrganizationProfile,
  saved: OrganizationSettingsPublic | null,
): string {
  const o = saved?.organizationName?.trim();
  return o && o.length > 0 ? o : profile.organizationName;
}

export function effectiveLogo(
  profile: OrganizationProfile,
  saved: OrganizationSettingsPublic | null,
): OrganizationProfile["logo"] {
  const url = saved?.logoUrl?.trim();
  if (
    url &&
    (url.startsWith("data:") ||
      url.startsWith("https://") ||
      url.startsWith("http://") ||
      url.startsWith("/"))
  ) {
    return {
      type: "url",
      src: url,
      alt: `${effectiveOrganizationName(profile, saved)} logo`,
    };
  }
  return profile.logo;
}

export function settingsDefaultsForProfile(profileId: SampleProfileId): OrganizationSettingsPublic {
  const p = getDashboardProfile(profileId);
  return {
    profileId,
    organizationName: null,
    logoUrl: null,
    primaryColor: p.theme.accent,
    secondaryColor: defaultSecondaryColor(),
    accentColor: p.theme.accent,
    useAccentColor: true,
    modules: defaultModulesAllEnabled(),
    updatedAt: null,
  };
}
