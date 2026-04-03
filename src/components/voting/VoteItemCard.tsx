import type { BoardVoteItem } from "@/lib/mock-data/types";
import { PublicVisibilityTag } from "./PublicVisibilityTag";
import { VoteStatusPill } from "./VoteStatusPill";

export type VoteItemCardProps = {
  vote: BoardVoteItem;
  urgency?: "openingSoon" | "closingSoon" | "followUp" | null;
};

export function VoteItemCard({ vote, urgency }: VoteItemCardProps) {
  const u =
    urgency ??
    (vote.status === "Scheduled"
      ? "openingSoon"
      : vote.status === "Open for Vote"
        ? "closingSoon"
        : vote.followUpRequired || vote.status === "Needs Follow-Up"
          ? "followUp"
          : null);

  const urgencyLabel =
    u === "openingSoon"
      ? "Opening soon"
      : u === "closingSoon"
        ? "Voting closes soon"
        : u === "followUp"
          ? "Follow-up"
          : null;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white/70 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md transition-shadow hover:shadow-md">
      {urgencyLabel ? (
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200/80">
            {urgencyLabel}
          </span>
        </div>
      ) : null}
      <div className={`flex flex-wrap items-start justify-between gap-3 ${urgencyLabel ? "pr-24" : ""}`}>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{vote.category}</p>
          <h3 className="mt-1 font-serif text-lg font-semibold text-stone-900">{vote.title}</h3>
        </div>
        <VoteStatusPill status={vote.status} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{vote.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PublicVisibilityTag publicVisible={vote.publicVisible} />
        {vote.followUpRequired ? (
          <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-900 ring-1 ring-orange-200/70">
            Follow-up tracked
          </span>
        ) : null}
      </div>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-stone-500">Voting opens</dt>
          <dd className="font-medium text-stone-900">{vote.opensAt}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Voting closes</dt>
          <dd className="font-medium text-stone-900">{vote.closesAt}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Decision deadline</dt>
          <dd className="font-medium text-stone-900">{vote.decisionDate}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Meeting</dt>
          <dd className="font-medium text-stone-900">{vote.meetingDate ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-stone-500">Coordinator</dt>
          <dd className="text-stone-800">{vote.owner}</dd>
        </div>
        {vote.movedBy ? (
          <div>
            <dt className="text-xs font-medium text-stone-500">Moved / seconded</dt>
            <dd className="text-stone-800">
              {vote.movedBy}
              {vote.secondedBy ? ` · Second: ${vote.secondedBy}` : ""}
            </dd>
          </div>
        ) : null}
      </dl>
      {(vote.outcome || vote.votesFor != null) && (
        <div className="mt-4 rounded-xl bg-stone-50/90 px-3 py-2 ring-1 ring-stone-200/70">
          <p className="text-xs font-semibold uppercase text-stone-500">Outcome</p>
          {vote.outcome ? <p className="mt-1 text-sm text-stone-800">{vote.outcome}</p> : null}
          {vote.votesFor != null ? (
            <p className="mt-1 text-xs text-stone-600">
              For {vote.votesFor} · Against {vote.votesAgainst ?? 0} · Abstain {vote.abstentions ?? 0}
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}