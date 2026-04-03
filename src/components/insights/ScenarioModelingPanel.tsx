"use client";

import { useMemo, useState } from "react";
import type { OrganizationProfile } from "@/lib/mock-data/types";
import { computeScenarioOutcomes } from "@/lib/insights/scenarioModel";

export type ScenarioModelingPanelProps = {
  profile: OrganizationProfile;
};

export function ScenarioModelingPanel({ profile }: ScenarioModelingPanelProps) {
  const [voteDelayDays, setVoteDelayDays] = useState(0);
  const [meetingSlipWeeks, setMeetingSlipWeeks] = useState(0);

  const outcome = useMemo(
    () =>
      computeScenarioOutcomes(profile, {
        voteDelayDays,
        meetingSlipWeeks,
      }),
    [profile, voteDelayDays, meetingSlipWeeks],
  );

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      <h2 className="font-serif text-lg font-semibold text-stone-900">Timeline scenario (illustrative)</h2>
      <p className="mt-1 text-sm text-stone-600">
        Slide to preview how delays might ripple — deterministic copy for demos, not forecasting.
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="vote-delay" className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Vote / decision slip (days)
          </label>
          <input
            id="vote-delay"
            type="range"
            min={0}
            max={21}
            value={voteDelayDays}
            onChange={(e) => setVoteDelayDays(Number(e.target.value))}
            className="mt-2 block w-full accent-stone-800"
          />
          <p className="text-xs text-stone-600">{voteDelayDays} days</p>
        </div>
        <div>
          <label htmlFor="meet-slip" className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Next meeting slip (weeks)
          </label>
          <input
            id="meet-slip"
            type="range"
            min={0}
            max={8}
            value={meetingSlipWeeks}
            onChange={(e) => setMeetingSlipWeeks(Number(e.target.value))}
            className="mt-2 block w-full accent-stone-800"
          />
          <p className="text-xs text-stone-600">{meetingSlipWeeks} week(s)</p>
        </div>
      </div>
      <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-stone-800">
        {outcome.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-stone-500">{outcome.disclaimer}</p>
    </div>
  );
}
