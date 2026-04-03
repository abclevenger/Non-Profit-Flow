"use client";

import type { ReactNode } from "react";

export type ContentProtectionShellProps = {
  children: ReactNode;
  /** Basic deterrent — not a security control */
  blockContextMenu?: boolean;
  /** Reduces casual copy/paste */
  restrictSelection?: boolean;
  /** Explain view-only posture */
  showViewOnlyHint?: boolean;
};

export function ContentProtectionShell({
  children,
  blockContextMenu,
  restrictSelection,
  showViewOnlyHint,
}: ContentProtectionShellProps) {
  return (
    <div
      className={restrictSelection ? "select-none" : undefined}
      onContextMenu={blockContextMenu ? (e) => e.preventDefault() : undefined}
    >
      {showViewOnlyHint ? (
        <p className="mb-3 rounded-lg bg-stone-100/90 px-3 py-2 text-xs text-stone-600 ring-1 ring-stone-200/80">
          View-only preview — screen capture and copy may still be possible; this layer reduces casual sharing.
        </p>
      ) : null}
      {children}
    </div>
  );
}
