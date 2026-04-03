"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useOrganizationBranding } from "@/lib/organization-branding-context";
import { canManageIssueRouting } from "@/lib/expert-review/permissions";
import { useWorkspace } from "@/lib/workspace-context";
import {
  foregroundForBackground,
  normalizeHex,
  settingsDefaultsForProfile,
} from "@/lib/organization-settings/colors";
import {
  DASHBOARD_MODULE_KEYS,
  DASHBOARD_MODULE_LABEL,
  type DashboardModuleKey,
  type DashboardModulesState,
  defaultModulesAllEnabled,
} from "@/lib/organization-settings/modules";

const MAX_LOGO_BYTES = 400 * 1024;

function applyFile(file: File | null, onDataUrl: (s: string) => void, onHint: (s: string | null) => void) {
  onHint(null);
  if (!file) return;
  const okType =
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.type === "image/jpg" ||
    file.type === "image/svg+xml";
  if (!okType) {
    onHint("Use PNG, JPG, or SVG.");
    return;
  }
  if (file.size > MAX_LOGO_BYTES) {
    onHint(`Keep files under ${Math.round(MAX_LOGO_BYTES / 1024)} KB.`);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const r = reader.result;
    if (typeof r === "string") onDataUrl(r);
  };
  reader.readAsDataURL(file);
}

export function OrganizationSettingsView() {
  const { organization, organizationId, profile, demoProfileKey, refreshSession } = useWorkspace();
  const { refresh, loading: brandingLoading } = useOrganizationBranding();
  const { data: session } = useSession();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaults = useMemo(() => settingsDefaultsForProfile(demoProfileKey), [demoProfileKey]);

  const [organizationName, setOrganizationName] = useState(profile.organizationName);
  const [missionSnippet, setMissionSnippet] = useState(profile.missionSnippet);
  const [primaryColor, setPrimaryColor] = useState(defaults.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(defaults.secondaryColor);
  const [accentColor, setAccentColor] = useState(defaults.accentColor ?? defaults.primaryColor);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoHint, setLogoHint] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [modules, setModules] = useState<DashboardModulesState>(defaultModulesAllEnabled());

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = settingsDefaultsForProfile(demoProfileKey);
    if (!organization) {
      setOrganizationName(profile.organizationName);
      setMissionSnippet(profile.missionSnippet);
      setPrimaryColor(d.primaryColor);
      setSecondaryColor(d.secondaryColor);
      setAccentColor(d.accentColor ?? d.primaryColor);
      setLogoUrl(null);
      setLogoHint(null);
      setModules(d.modules);
      return;
    }
    setOrganizationName(organization.name?.trim() ? organization.name : profile.organizationName);
    setMissionSnippet(organization.missionSnippet?.trim() ? organization.missionSnippet : profile.missionSnippet);
    setPrimaryColor(organization.primaryColor ?? d.primaryColor);
    setSecondaryColor(organization.secondaryColor ?? d.secondaryColor);
    setAccentColor(
      normalizeHex(organization.accentColor ?? "") ?? d.accentColor ?? organization.primaryColor ?? d.primaryColor,
    );
    setLogoUrl(organization.logoUrl ?? null);
    setLogoHint(null);
    setModules(organization.modules ?? d.modules);
  }, [organization, demoProfileKey, profile.organizationName, profile.missionSnippet]);

  const onLogoFile = useCallback((file: File | null) => {
    applyFile(file, setLogoUrl, setLogoHint);
  }, []);

  const previewPrimary = normalizeHex(primaryColor) ?? defaults.primaryColor;
  const previewSecondary = normalizeHex(secondaryColor) ?? defaults.secondaryColor;
  const previewAccent = normalizeHex(accentColor) ?? previewPrimary;
  const previewBtnFg = foregroundForBackground(previewAccent);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    const p = normalizeHex(primaryColor);
    const sec = normalizeHex(secondaryColor);
    const acc = normalizeHex(accentColor);
    if (!p || !sec || !acc) {
      setError("Each color must be a valid #RRGGBB value.");
      setSaving(false);
      return;
    }
    if (!organizationId) {
      setError("Select an organization in the header before saving.");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`/api/organizations/${encodeURIComponent(organizationId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: organizationName.trim(),
          missionSnippet: missionSnippet.trim() || null,
          logoUrl,
          primaryColor: p,
          secondaryColor: sec,
          accentColor: acc,
          modules,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      }
      setMessage(typeof data.message === "string" ? data.message : "Branding updated successfully");
      await refresh();
      await refreshSession();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setResetting(true);
    setMessage(null);
    setError(null);
    if (!organizationId) {
      setError("Select an organization in the header before resetting.");
      setResetting(false);
      return;
    }
    try {
      const res = await fetch(`/api/organizations/${encodeURIComponent(organizationId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetBranding: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Reset failed");
      }
      await refresh();
      await refreshSession();
      const d = settingsDefaultsForProfile(demoProfileKey);
      setOrganizationName(profile.organizationName);
      setMissionSnippet(profile.missionSnippet);
      setPrimaryColor(d.primaryColor);
      setSecondaryColor(d.secondaryColor);
      setAccentColor(d.accentColor ?? d.primaryColor);
      setLogoUrl(null);
      setModules(d.modules);
      setMessage(typeof data.message === "string" ? data.message : "Branding reset to defaults");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const showRoutingLink = canManageIssueRouting(session);

  const toggleModule = (key: DashboardModuleKey) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">White-label</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
            Organization branding
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-stone-600">
            Tied to the active organization in the header switcher. Save to apply everywhere instantly.
          </p>
        </header>
        {showRoutingLink ? (
          <Link
            href="/settings/routing"
            className="rounded-2xl border border-stone-200/90 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
          >
            Issue routing
          </Link>
        ) : null}
      </div>

      {brandingLoading ? (
        <p className="text-sm text-stone-500" aria-live="polite">
          Loading organization settings…
        </p>
      ) : null}
      {message ? (
        <p
          className="rounded-2xl bg-emerald-50/90 px-5 py-3.5 text-sm font-medium text-emerald-950 ring-1 ring-emerald-200/70"
          role="status"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-rose-50/90 px-5 py-3.5 text-sm text-rose-900 ring-1 ring-rose-200/70" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <section className="rounded-3xl border border-stone-200/70 bg-white p-8 shadow-[0_20px_60px_-24px_rgba(28,25,23,0.18)] ring-1 ring-stone-100/80">
          <h2 className="font-serif text-2xl font-semibold text-stone-900">Branding</h2>
          <p className="mt-1 text-sm text-stone-500">Logo and palette</p>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Logo</p>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                onLogoFile(e.dataTransfer.files?.[0] ?? null);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 transition-colors ${
                dragActive
                  ? "border-[var(--primary-color,#6b5344)] bg-stone-50/90"
                  : "border-stone-200/90 bg-stone-50/40 hover:border-stone-300"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                className="hidden"
                onChange={(e) => onLogoFile(e.target.files?.[0] ?? null)}
              />
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-inner">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="px-3 text-center text-xs font-medium text-stone-400">Drop or click</span>
                )}
              </div>
              <div className="text-center text-sm text-stone-600">
                <span className="font-semibold text-stone-800">Upload logo</span>
                <span className="block text-xs text-stone-500">PNG, JPG, SVG · max {Math.round(MAX_LOGO_BYTES / 1024)} KB</span>
              </div>
            </div>
            {logoUrl ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLogoUrl(null);
                }}
                className="mt-3 text-sm font-semibold text-stone-600 underline-offset-4 hover:underline"
              >
                Remove logo
              </button>
            ) : null}
            {logoHint ? <p className="mt-2 text-sm text-rose-700">{logoHint}</p> : null}
          </div>

          <div className="mt-10 space-y-8">
            <ColorField id={`${formId}-p`} label="Primary" value={primaryColor} onChange={setPrimaryColor} />
            <ColorField id={`${formId}-s`} label="Secondary" value={secondaryColor} onChange={setSecondaryColor} />
            <ColorField id={`${formId}-a`} label="Accent" value={accentColor} onChange={setAccentColor} />
          </div>
        </section>

        <div className="space-y-10">
          <section className="rounded-3xl border border-stone-200/70 bg-gradient-to-b from-stone-50/80 to-white p-8 shadow-[0_20px_60px_-24px_rgba(28,25,23,0.12)] ring-1 ring-stone-100/60">
            <h2 className="font-serif text-2xl font-semibold text-stone-900">Live preview</h2>
            <p className="mt-1 text-sm text-stone-500">Updates as you edit</p>

            <div
              className="mt-6 overflow-hidden rounded-2xl border bg-[var(--surface-page,#f7f5f2)] shadow-sm"
              style={{ borderColor: `${previewSecondary}55` }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: `${previewPrimary}20`, color: "#1c1917" }}
              >
                <span className="text-sm font-semibold">Board header</span>
                <span className="text-xs opacity-75">Q2</span>
              </div>
              <div className="space-y-4 p-5">
                <div
                  className="rounded-xl border bg-white p-4 shadow-sm"
                  style={{ borderColor: `${previewSecondary}50` }}
                >
                  <p className="text-sm font-medium text-stone-800">Status card</p>
                  <p className="mt-1 text-xs text-stone-600">Secondary tints borders.</p>
                </div>
                <button
                  type="button"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md"
                  style={{ backgroundColor: previewAccent, color: previewBtnFg }}
                >
                  Primary button
                </button>
                <p className="text-xs font-medium text-stone-500">Sidebar item</p>
                <div
                  className="rounded-xl px-3 py-2.5 text-sm font-medium shadow-sm ring-1 ring-stone-200/60"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${previewPrimary} 14%, white)`,
                    color: "#1c1917",
                  }}
                >
                  Overview
                </div>
                <div className="rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 ring-1 ring-stone-200/40">
                  Strategy
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200/70 bg-white p-8 shadow-sm ring-1 ring-stone-100/80">
            <h2 className="font-serif text-2xl font-semibold text-stone-900">Dashboard modules</h2>
            <p className="mt-1 text-sm text-stone-500">Hidden items won’t appear in the nav or open by URL.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {DASHBOARD_MODULE_KEYS.map((key) => (
                <li key={key}>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/30 px-4 py-3.5 transition-colors hover:bg-stone-50/60">
                    <span className="text-sm font-medium text-stone-800">{DASHBOARD_MODULE_LABEL[key]}</span>
                    <input
                      type="checkbox"
                      checked={modules[key]}
                      onChange={() => toggleModule(key)}
                      className="h-5 w-5 rounded border-stone-300 text-[var(--primary-color,#44403c)]"
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="rounded-3xl border border-stone-200/60 bg-white/60 p-8 backdrop-blur-sm">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Organization</h2>
        <p className="mt-1 text-sm text-stone-500">Shown in the shell and sidebar</p>
        <label className="mt-6 block max-w-md">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Display name</span>
          <input
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200/90 bg-white px-4 py-3 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
          />
        </label>
        <label className="mt-6 block max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Mission summary</span>
          <textarea
            value={missionSnippet}
            onChange={(e) => setMissionSnippet(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-stone-200/90 bg-white px-4 py-3 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
          />
        </label>
      </section>

      <section className="rounded-3xl border border-dashed border-stone-200/80 bg-stone-50/50 p-6 text-sm text-stone-600">
        <p className="font-medium text-stone-800">Coming later</p>
        <p className="mt-2 max-w-2xl leading-relaxed">
          Custom domains, email & PDF branding, favicon, and login-screen theming — see{" "}
          <code className="rounded bg-stone-200/60 px-1.5 py-0.5 text-xs">lib/organization-settings/white-label.ts</code>.
        </p>
      </section>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          disabled={saving || brandingLoading}
          onClick={() => void save()}
          className="rounded-2xl px-10 py-3.5 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
          style={{
            backgroundColor: "var(--accent-color, var(--demo-accent, #6b5344))",
            color: "var(--demo-accent-foreground, #fafaf9)",
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          disabled={resetting || saving || brandingLoading}
          onClick={() => void resetToDefaults()}
          className="rounded-2xl border border-stone-300/90 bg-white px-8 py-3.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-50"
        >
          {resetting ? "Resetting…" : "Reset to default"}
        </button>
      </div>
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const normalized = normalizeHex(value);
  const pickerValue = normalized ?? "#6b5344";

  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          id={id}
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-16 cursor-pointer rounded-xl border border-stone-200/90 bg-white p-1 shadow-sm"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
          spellCheck={false}
          className="w-40 rounded-2xl border border-stone-200/90 bg-white px-3 py-2.5 font-mono text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
          aria-label={`${label} hex`}
        />
        <span
          className="h-11 w-11 rounded-xl border border-stone-200/90 shadow-inner"
          style={{ backgroundColor: pickerValue }}
        />
      </div>
    </div>
  );
}
