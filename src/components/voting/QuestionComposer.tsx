"use client";

import { useState } from "react";

/**
 * Mock composer — wire to API / WebSocket later for live board discussion.
 */
export function QuestionComposer({ voteTitle }: { voteTitle: string }) {
  const [text, setText] = useState("");

  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white/40 p-4 shadow-sm ring-1 ring-white/30 backdrop-blur-md">
      <p className="text-xs font-medium text-stone-600">Add to: {voteTitle}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Ask a clarifying question or add a comment for the board packet..."
        className="mt-2 w-full resize-y rounded-xl border border-stone-200/90 bg-white/80 px-3 py-2 text-sm text-stone-900 shadow-inner outline-none ring-stone-200 placeholder:text-stone-400 focus:border-stone-300 focus:ring-2 focus:ring-stone-200/60"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl border border-stone-200/90 bg-white/90 px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm backdrop-blur-sm transition hover:bg-white"
        >
          Add a question
        </button>
        <button
          type="button"
          className="rounded-xl px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm transition hover:opacity-90"
          style={{
            backgroundColor: "var(--demo-accent, #6b5344)",
            color: "var(--demo-accent-foreground, #faf8f5)",
          }}
        >
          Add discussion comment
        </button>
      </div>
      <p className="mt-2 text-xs text-stone-500">Demo only — submissions are not saved in v1.</p>
    </div>
  );
}