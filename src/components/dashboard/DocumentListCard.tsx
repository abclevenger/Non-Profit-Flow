"use client";

import { logContentAccess } from "@/lib/audit/clientContentAccess";
import { BoardItemReviewActions } from "@/components/expert-review/BoardItemReviewActions";
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
  /** When set, each row can be flagged as a contract / record for counsel review. */
  organizationIdForGc?: string;
};

function contractRecordId(title: string) {
  return `contract-${encodeURIComponent(title).slice(0, 180)}`;
}

export function DocumentListCard({
  title = "Recent documents and decisions",
  documents,
  filter,
  logAccess,
  organizationIdForGc,
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
              <div className="overflow-hidden rounded-lg border border-stone-200/80 bg-stone-50/50 transition-colors hover:border-stone-300 hover:bg-white">
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
                  className="group block px-4 py-3"
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
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-200/60 px-4 py-2">
                  {doc.downloadAllowed === false ? (
                    <span
                      className="text-xs font-medium text-stone-400"
                      title="Download disabled by policy for this item."
                    >
                      Download disabled by policy
                    </span>
                  ) : (
                    <a
                      href={doc.href}
                      download
                      className="text-xs font-semibold text-stone-800 underline-offset-4 hover:underline"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (logAccess) {
                          logContentAccess({
                            resourceType: "document_download",
                            resourceKey: doc.title,
                            href: doc.href,
                          });
                        }
                      }}
                    >
                      Download
                    </a>
                  )}
                </div>
                {organizationIdForGc ? (
                  <div className="border-t border-stone-200/60 px-4 py-2">
                    <BoardItemReviewActions
                      organizationId={organizationIdForGc}
                      gcItemType="contract"
                      expertItemType="contract"
                      itemId={contractRecordId(doc.title)}
                      itemTitle={doc.title}
                      relatedHref="/documents"
                      compact
                    />
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}