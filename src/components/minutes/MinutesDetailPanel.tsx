import type { BoardVoteItem, MeetingMinutesRecord } from "@/lib/mock-data/types";
import { DecisionSummaryList } from "./DecisionSummaryList";
import { FollowUpActionsList } from "./FollowUpActionsList";
import { MinutesPublicVisibilityTag } from "./MinutesPublicVisibilityTag";
import { MinutesStatusPill } from "./MinutesStatusPill";
import { MinutesTimelineCard } from "./MinutesTimelineCard";

export function MinutesDetailPanel({
  record,
  votes,
}: {
  record: MeetingMinutesRecord;
  votes: BoardVoteItem[];
}) {
  const voteLabels = record.linkedVotes
    .map((id) => {
      const v = votes.find((x) => x.id === id);
      return v ? { id, title: v.title } : { id, title: `Vote id: ${id}` };
    });

  return (
    <div className="space-y-6 rounded-2xl border border-stone-200/80 bg-white/50 p-6 shadow-sm ring-1 ring-white/40 backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200/70 pb-4">
        <div>
          <p className="text-xs font-medium text-stone-500">{record.meetingDate}</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-900">{record.meetingTitle}</h2>
          <p className="mt-1 text-sm text-stone-600">{record.meetingType} meeting</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MinutesStatusPill status={record.status} />
          <MinutesPublicVisibilityTag publicVisible={record.publicVisible} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Attendees</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{record.attendees.join(" · ")}</p>
          </section>
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Summary</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{record.summary}</p>
            {record.publicSummary ? (
              <p className="mt-3 rounded-xl bg-teal-50/50 p-3 text-sm text-teal-950 ring-1 ring-teal-200/60">
                <span className="font-semibold">Public summary: </span>
                {record.publicSummary}
              </p>
            ) : null}
          </section>
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Discussion notes</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{record.discussionNotes}</p>
          </section>
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Decisions</h3>
            <div className="mt-2">
              <DecisionSummaryList decisions={record.decisionsMade} />
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Follow-up actions</h3>
            <div className="mt-2">
              <FollowUpActionsList actions={record.followUpActions} />
            </div>
          </section>
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Linked agenda items</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
                {record.linkedAgendaItems.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Linked votes</h3>
              {voteLabels.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
                  {voteLabels.map((v) => (
                    <li key={v.id}>{v.title}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-stone-500">None linked.</p>
              )}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Linked documents</h3>
            {record.linkedDocuments.length ? (
              <ul className="mt-2 space-y-2">
                {record.linkedDocuments.map((d) => (
                  <li key={d.id}>
                    <a
                      href={d.href ?? "#"}
                      className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline"
                    >
                      {d.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-stone-500">No documents attached.</p>
            )}
          </section>
        </div>
        <MinutesTimelineCard record={record} />
      </div>
    </div>
  );
}
