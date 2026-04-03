"use client";

import type { OrganizationProfile, SampleProfileId } from "@/lib/mock-data/types";
import { computeBoardCadenceMetrics, getPeerBenchmark } from "@/lib/insights/benchmarkHelpers";

export type PeerComparisonCardProps = {
  profileId: SampleProfileId;
};

export function PeerComparisonCard({ profileId }: PeerComparisonCardProps) {
  const peer = getPeerBenchmark(profileId);

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      <h2 className="font-serif text-lg font-semibold text-stone-900">Peer snapshot (anonymized)</h2>
      <p className="mt-1 text-sm text-stone-600">{peer.label}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-stone-50/90 px-3 py-2 ring-1 ring-stone-200/70">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Median days · draft → closed</dt>
          <dd className="mt-1 font-serif text-2xl font-semibold text-stone-900">{peer.medianDaysDraftToClosed}</dd>
        </div>
        <div className="rounded-lg bg-stone-50/90 px-3 py-2 ring-1 ring-stone-200/70">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Typical agenda items</dt>
          <dd className="mt-1 font-serif text-2xl font-semibold text-stone-900">{peer.typicalAgendaItems}</dd>
        </div>
        <div className="rounded-lg bg-stone-50/90 px-3 py-2 ring-1 ring-stone-200/70">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Minutes posted within (days)</dt>
          <dd className="mt-1 font-serif text-2xl font-semibold text-stone-900">{peer.minutesPostedWithinDays}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-stone-500">
        Illustrative cohort data for discussion — not a ranking, benchmark study, or legal standard.
      </p>
    </div>
  );
}

/** Optional: show this profile’s rough demo metrics next to peer row */
export function PeerComparisonWithProfileMetrics({
  profileId,
  profile,
}: PeerComparisonCardProps & { profile: OrganizationProfile }) {
  const m = computeBoardCadenceMetrics(profile);

  return (
    <div className="space-y-4">
      <PeerComparisonCard profileId={profileId} />
      <div className="rounded-xl border border-dashed border-stone-300/90 bg-stone-50/50 px-4 py-3 text-sm text-stone-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">This demo profile (sample)</p>
        <p className="mt-2">
          Open or scheduled decisions: <strong>{m.openDecisionItems}</strong> · Draft votes:{" "}
          <strong>{m.draftVotes}</strong> · Avg agenda items / meeting: <strong>{m.avgAgendaItemsPerMeeting}</strong>
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Compare informally to the illustrative medians above when planning cycle improvements.
        </p>
      </div>
    </div>
  );
}
