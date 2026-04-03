import type { ReactNode } from "react";

export type EmptyStateNoteProps = {
  title?: string;
  children: ReactNode;
};

export function EmptyStateNote({ title = "Note", children }: EmptyStateNoteProps) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 px-4 py-3 text-sm text-stone-600">
      <p className="font-medium text-stone-800">{title}</p>
      <p className="mt-1 leading-relaxed">{children}</p>
    </div>
  );
}