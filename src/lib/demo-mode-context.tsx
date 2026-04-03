"use client";

/**
 * Legacy entry point — the dashboard now uses workspace / multi-organization context.
 * @see WorkspaceProvider in `@/lib/workspace-context`
 */
export {
  WorkspaceProvider,
  useWorkspace,
  useDemoMode,
  useWorkspaceData,
} from "@/lib/workspace-context";

export { WorkspaceProvider as DemoModeProvider } from "@/lib/workspace-context";
