"use client";

import { ContentProtectionShell, SensitivityBadge } from "@/components/content-protection";
import { useDemoMode } from "@/lib/demo-mode-context";
import { DocumentListCard } from "@/components/dashboard/DocumentListCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function DocumentsPage() {
  const { profile, organizationId } = useDemoMode();

  return (
    <ContentProtectionShell blockContextMenu restrictSelection showViewOnlyHint>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeader
            title="Documents"
            description="Board packets, minutes, resolutions, and upcoming approvals — sample metadata for how records can be organized."
          />
          <SensitivityBadge variant="confidential" />
        </div>
        <DocumentListCard
          title="Board packets"
          documents={profile.documents}
          filter={["packet"]}
          logAccess
          organizationIdForGc={organizationId ?? undefined}
        />
        <DocumentListCard
          title="Meeting minutes"
          documents={profile.documents}
          filter={["minutes"]}
          logAccess
          organizationIdForGc={organizationId ?? undefined}
        />
        <DocumentListCard
          title="Resolutions"
          documents={profile.documents}
          filter={["resolution"]}
          logAccess
          organizationIdForGc={organizationId ?? undefined}
        />
        <DocumentListCard
          title="Upcoming approvals"
          documents={profile.documents}
          filter={["approval"]}
          logAccess
          organizationIdForGc={organizationId ?? undefined}
        />
      </div>
    </ContentProtectionShell>
  );
}