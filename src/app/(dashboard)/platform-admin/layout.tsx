import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isPlatformAdmin) {
    if (process.env.NODE_ENV === "development") {
      console.info("[platform-admin/layout] denied", {
        hasUser: Boolean(session?.user?.id),
        isPlatformAdmin: Boolean(session?.user?.isPlatformAdmin),
      });
    }
    redirect("/forbidden?reason=platform-admin");
  }
  if (process.env.NODE_ENV === "development") {
    console.info("[platform-admin/layout] ok", {
      userId: session.user.id,
      isPlatformAdmin: session.user.isPlatformAdmin,
    });
  }
  return <>{children}</>;
}
