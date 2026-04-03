import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isPlatformAdmin) {
    redirect("/forbidden?reason=platform-admin");
  }
  return <>{children}</>;
}
