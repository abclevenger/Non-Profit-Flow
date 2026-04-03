import type { OrganizationProfile } from "@/lib/mock-data/types";
import { nextBoardMeeting } from "@/lib/meeting-workflow/meetingWorkflowHelpers";

export type ScenarioParams = {
  /** Simulated slip in closing open / scheduled votes */
  voteDelayDays: number;
  /** Simulated postponement of the next board meeting */
  meetingSlipWeeks: number;
};

export type ScenarioOutcome = {
  bullets: string[];
  disclaimer: string;
};

/**
 * Deterministic, illustrative scenario copy — not a predictive engine.
 */
export function computeScenarioOutcomes(
  profile: OrganizationProfile,
  params: ScenarioParams,
): ScenarioOutcome {
  const bullets: string[] = [];
  const nextMeet = nextBoardMeeting(profile.boardMeetings);
  const openVotes = profile.boardVotes.filter(
    (v) => v.status === "Open for Vote" || v.status === "Scheduled",
  );

  if (params.voteDelayDays > 0) {
    bullets.push(
      `If key votes slip by about ${params.voteDelayDays} day${params.voteDelayDays === 1 ? "" : "s"}, consent agenda sequencing and minutes language may need revision.`,
    );
    if (openVotes.length > 0) {
      bullets.push(
        `${openVotes.length} active or scheduled decision(s) could overlap the next reporting period narrative in board packets.`,
      );
    }
    bullets.push(
      "Grant or compliance submissions that depend on board approval should assume a later internal \"ready to submit\" date.",
    );
  }

  if (params.meetingSlipWeeks > 0) {
    bullets.push(
      `Postponing the next board meeting by ~${params.meetingSlipWeeks} week${params.meetingSlipWeeks === 1 ? "" : "s"} pushes formal decisions and may delay action owners’ downstream tasks.`,
    );
    if (nextMeet) {
      bullets.push(
        `Agenda items tied to "${nextMeet.title}" would likely roll to a later cycle — confirm nothing statutory is date-bound.`,
      );
    }
  }

  if (bullets.length === 0) {
    bullets.push("Adjust sliders to preview how delays can ripple through packets, minutes, and external deadlines.");
  }

  return {
    bullets,
    disclaimer:
      "Illustrative projection for planning — not a guarantee of outcomes. Confirm dates with counsel and staff.",
  };
}
