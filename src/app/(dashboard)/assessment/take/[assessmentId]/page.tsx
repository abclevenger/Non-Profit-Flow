import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AssessmentWizardClient } from "@/components/np-assessment/AssessmentWizardClient";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import { canPerformNpAssessmentAction } from "@/lib/np-assessment/np-assessment-permissions";
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
  if (!canPerformNpAssessmentAction(role, session.user.isPlatformAdmin, "fill")) {
    redirect("/forbidden?reason=assessment");
  }

  const { assessmentId } = await params;
  const assessment = await prisma.npAssessment.findFirst({
    where: { id: assessmentId, organizationId },
    select: { id: true },
  });
  if (!assessment) {
    redirect("/assessment");
  }

  return <AssessmentWizardClient organizationId={organizationId} assessmentId={assessmentId} />;
}
