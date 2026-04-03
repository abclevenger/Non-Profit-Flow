import { DemoModeProvider } from "@/lib/demo-mode-context";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DemoModeProvider>
      <DashboardShell>{children}</DashboardShell>
    </DemoModeProvider>
  );
}