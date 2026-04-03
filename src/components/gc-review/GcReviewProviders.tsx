"use client";

import { useSession } from "@/lib/auth/session-hooks";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { canAccessGcReviewQueue, canFlagForGcReview } from "@/lib/gc-review/permissions";
import type { GcReviewPublicJson } from "@/lib/gc-review/serialize";
import { useWorkspace } from "@/lib/workspace-context";
import { FlagGcReviewModal, type FlagGcTarget } from "./FlagGcReviewModal";

type Summary = {
  pendingCount: number;
  highRiskOpenCount: number;
  nextUrgentDeadline: string | null;
};

type GcReviewDataValue = {
  items: GcReviewPublicJson[];
  summary: Summary | null;
  loading: boolean;
  error: string | null;
  /** Bumps after successful refetch so queue views can reload expanded rows. */
  dataVersion: number;
  refetch: () => Promise<void>;
  getForItem: (itemType: string, itemId: string) => GcReviewPublicJson | undefined;
  canFlag: boolean;
  canExpand: boolean;
};

const GcReviewDataContext = createContext<GcReviewDataValue | null>(null);

export function useGcReviewData() {
  const ctx = useContext(GcReviewDataContext);
  if (!ctx) {
    throw new Error("useGcReviewData must be used within GcReviewProviders");
  }
  return ctx;
}

/** Optional: use where provider may be absent (e.g. tests). */
export function useGcReviewDataSafe(): GcReviewDataValue | null {
  return useContext(GcReviewDataContext);
}

export function GcReviewProviders({ children }: { children: ReactNode }) {
  const { organizationId } = useWorkspace();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<GcReviewPublicJson[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const [dataVersion, setDataVersion] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<FlagGcTarget | null>(null);

  const canFlag = useMemo(() => canFlagForGcReview(session?.user?.role), [session?.user?.role]);
  const canExpand = useMemo(() => canAccessGcReviewQueue(session?.user?.role), [session?.user?.role]);

  const refetch = useCallback(async () => {
    if (status !== "authenticated" || !canFlag || !organizationId) {
      setItems([]);
      setSummary(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ organizationId });
      const res = await fetch(`/api/gc-review?${q}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(typeof j.error === "string" ? j.error : res.statusText);
      }
      const data = (await res.json()) as { items: GcReviewPublicJson[]; summary: Summary };
      setItems(data.items);
      setSummary(data.summary);
      setDataVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setItems([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId, status, canFlag]);

  useEffect(() => {
    void refetch();
  }, [refetch, bump]);

  const getForItem = useCallback(
    (itemType: string, itemId: string) => items.find((i) => i.itemType === itemType && i.itemId === itemId),
    [items],
  );

  const dataValue = useMemo<GcReviewDataValue>(
    () => ({
      items,
      summary,
      loading,
      error,
      dataVersion,
      refetch,
      getForItem,
      canFlag,
      canExpand,
    }),
    [items, summary, loading, error, dataVersion, refetch, getForItem, canFlag, canExpand],
  );

  const openFlagModal = useCallback((t: FlagGcTarget) => {
    setModalTarget(t);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalTarget(null);
  }, []);

  const onSubmitted = useCallback(() => {
    setBump((b) => b + 1);
  }, []);

  const modalCtx = useMemo(() => ({ openFlagModal }), [openFlagModal]);

  return (
    <GcReviewDataContext.Provider value={dataValue}>
      <GcReviewModalBridgeContext.Provider value={modalCtx}>
        {children}
        <FlagGcReviewModal open={modalOpen} target={modalTarget} onClose={closeModal} onSubmitted={onSubmitted} />
      </GcReviewModalBridgeContext.Provider>
    </GcReviewDataContext.Provider>
  );
}

const GcReviewModalBridgeContext = createContext<{ openFlagModal: (t: FlagGcTarget) => void } | null>(null);

export function useGcReviewModal() {
  const ctx = useContext(GcReviewModalBridgeContext);
  if (!ctx) return { openFlagModal: null as null | ((t: FlagGcTarget) => void) };
  return ctx;
}
