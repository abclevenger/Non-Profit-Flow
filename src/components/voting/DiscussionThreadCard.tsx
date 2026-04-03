import type { ReactNode } from "react";
import type { DiscussionComment } from "@/lib/mock-data/types";

export function DiscussionThreadCard({
  voteTitle,
  comments,
  footer,
}: {
  voteTitle: string;
  comments: DiscussionComment[];
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white/50 p-4 shadow-sm ring-1 ring-stone-100/80 backdrop-blur-md">
      <h4 className="font-medium text-stone-900">Discussion</h4>
      <p className="mt-0.5 text-xs text-stone-500">{voteTitle}</p>
      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">No questions or comments yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="border-l-2 border-stone-200 pl-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-stone-900">{c.author}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    c.type === "Question"
                      ? "bg-sky-100 text-sky-900"
                      : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {c.type}
                </span>
                <span className="text-xs text-stone-500">{c.createdAt}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{c.message}</p>
            </li>
          ))}
        </ul>
      )}
      {footer ? <div className="mt-4 border-t border-stone-200/80 pt-4">{footer}</div> : null}
    </div>
  );
}
