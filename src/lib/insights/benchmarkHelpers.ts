import type { OrganizationProfile, SampleProfileId } from "@/lib/mock-data/types";
import benchmarks from "./benchmarks.json";

type BenchmarkRow = (typeof benchmarks)[keyof typeof benchmarks];

export function getPeerBenchmark(profileId: SampleProfileId): BenchmarkRow {
  const row = benchmarks[profileId as keyof typeof benchmarks];
  return row ?? benchmarks.communityNonprofit;
}

/** Rough demo metrics from mock profile — not real analytics */
export function computeBoardCadenceMetrics(profile: OrganizationProfile) {
  const votes = profile.boardVotes;
  const openOrScheduled = votes.filter(
    (v) => v.status === "Open for Vote" || v.status === "Scheduled" || v.status === "Draft",
  );
  const draft = votes.filter((v) => v.status === "Draft").length;
  const finalized = votes.filter((v) => v.status === "Finalized" || v.status === "Closed").length;
  const agendaCount = profile.boardMeetings.reduce((n, m) => n + m.agendaItems.length, 0);
  const meetingCount = profile.boardMeetings.length || 1;
  const avgAgendaItems = Math.round(agendaCount / meetingCount);

  return {
    openDecisionItems: openOrScheduled.length,
    draftVotes: draft,
    recentFinalized: finalized,
    avgAgendaItemsPerMeeting: avgAgendaItems,
  };
}
