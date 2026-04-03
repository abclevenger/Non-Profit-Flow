import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AssessmentWizardClient } from "@/components/np-assessment/AssessmentWizardClient";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import { canFillNpAssessmentWizard } from "@/lib/np-assessment/np-assessment-permissions";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Take assessment | Non-Profit Flow",
};

type Props = { params: Promise<{ assessmentId: string }> };

export default async function AssessmentTakePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const organizationId = session.user.activeOrganizationId;
  if (!organizationId) {
    redirect("/overview");
  }
  const role = coerceOrgMembershipRole(session.user.membershipRole ?? "VIEWER");
  const isPlatform = session.user.isPlatformAdmin;

  const { assessmentId } = await params;
  const assessment = await prisma.npAssessment.findFirst({
    where: { id: assessmentId, organizationId },
    select: { id: true, allowBoardMemberFill: true },
  });
  if (!assessment) {
    redirect("/assessment");
  }

  if (!canFillNpAssessmentWizard(role, isPlatform, assessment.allowBoardMemberFill)) {
    redirect("/forbidden?reason=assessment-fill");
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { isDemoTenant: true },
  });

  return (
    <AssessmentWizardClient
      organizationId={organizationId}
      assessmentId={assessmentId}
      organizationIsDemoTenant={Boolean(org?.isDemoTenant)}
    />
  );
}
