"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getDashboardProfile } from "@/lib/mock-data/dashboardData";
import type { OrganizationProfile, SampleProfileId } from "@/lib/mock-data/types";

const STORAGE_KEY = "board-oversight-sample-profile";
const LEGACY_KEY = "board-oversight-demo-mode";

function isSampleProfileId(v: string): v is SampleProfileId {
  return v === "communityNonprofit" || v === "growingNonprofit" || v === "privateSchool";
}

function migrateLegacyProfile(raw: string | null): SampleProfileId | null {
  if (!raw) return null;
  if (isSampleProfileId(raw)) return raw;
  if (raw === "generic") return "communityNonprofit";
  if (raw === "customized") return "growingNonprofit";
  return null;
}

type DemoModeContextValue = {
  profileId: SampleProfileId;
  setProfileId: (id: SampleProfileId) => void;
  profile: OrganizationProfile;
};

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileIdState] = useState<SampleProfileId>("communityNonprofit");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
      const next = migrateLegacyProfile(raw);
      if (next) startTransition(() => setProfileIdState(next));
    } catch {
      /* ignore */
    }
  }, []);

  const setProfileId = useCallback((id: SampleProfileId) => {
    setProfileIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const profile = useMemo(() => getDashboardProfile(profileId), [profileId]);

  const value = useMemo(
    () => ({ profileId, setProfileId, profile }),
    [profileId, setProfileId, profile],
  );

  return (
    <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider");
  return ctx;
}