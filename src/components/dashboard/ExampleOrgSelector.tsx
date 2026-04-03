"use client";

import type { SampleProfileId } from "@/lib/mock-data/types";
import { SAMPLE_PROFILE_OPTIONS } from "@/lib/mock-data/dashboardData";

export type ExampleOrgSelectorProps = {
  profileId: SampleProfileId;
  onProfileIdChange: (id: SampleProfileId) => void;
};

export function ExampleOrgSelector({ profileId, onProfileIdChange }: ExampleOrgSelectorProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor="example-org" className="text-xs font-medium text-stone-600">
        View example organization
      </label>
      <select
        id="example-org"
        value={profileId}
        onChange={(e) => onProfileIdChange(e.target.value as SampleProfileId)}
        className="max-w-full rounded-lg border border-stone-200/90 bg-white/90 px-3 py-2 text-sm font-medium text-stone-900 shadow-sm backdrop-blur-sm outline-none ring-stone-200 transition-shadow focus:border-stone-300 focus:ring-2 focus:ring-stone-200/80"
      >
        {SAMPLE_PROFILE_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}