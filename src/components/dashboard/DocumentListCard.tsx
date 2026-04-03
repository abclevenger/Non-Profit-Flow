"use client";

import { logContentAccess } from "@/lib/audit/clientContentAccess";
import type { DocumentItem } from "@/lib/mock-data/types";

const categoryLabel: Record<DocumentItem["category"], string> = {
  packet: "Board packet",
  minutes: "Minutes",
  resolution: "Resolution",
  approval: "Approval",
  other: "Document",
};

export type DocumentListCardProps = {
  title?: string;
  documents: DocumentItem[];
  filter?: DocumentItem["category"][];
  /** When true, logs opens to ContentAccessLog for signed-in users (best-effort). */
  logAccess?: boolean;
};

export function DocumentListCard({
  title = "Recent documents and decisions",
  documents,
  filter,
  logAccess,
}: DocumentListCardProps) {
  const list = filter?.length
    ? documents.filter((d) => filter.includes(d.category))
    : documents;

  return (
    <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm">
      <h3 className="font-serif text-lg font-semibold text-stone-900">{title}</h3>
      {list.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">No sample items in this category yet — add documents in your mock profile.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((doc) => (
            <li key={doc.title}>
              <a
                href={doc.href}
                onPointerDown={() => {
                  if (logAccess) {
                    logContentAccess({
                      resourceType: "document",
                      resourceKey: doc.title,
                      href: doc.href,
                    });
                  }
                }}
                className="group block rounded-lg border border-stone-200/80 bg-stone-50/50 px-4 py-3 transition-colors hover:border-stone-300 hover:bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-stone-900 group-hover:underline">{doc.title}</p>
                  <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {categoryLabel[doc.category]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  {doc.type} · Last updated {doc.lastUpdated}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}