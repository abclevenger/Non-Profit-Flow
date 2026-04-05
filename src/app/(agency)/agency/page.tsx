import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencyIndexPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.agencies.length > 0) {
    redirect(`/agency/${session.user.agencies[0]!.id}`);
  }

  if (session.user.isPlatformAdmin) {
    const first = await prisma.agency.findFirst({ orderBy: { name: "asc" } });
    if (first) {
      redirect(`/agency/${first.id}`);
    }
    redirect("/platform-admin");
  }

  redirect("/overview");
}
