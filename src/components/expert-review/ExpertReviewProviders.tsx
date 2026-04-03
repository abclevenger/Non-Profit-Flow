"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { canSubmitExpertReview } from "@/lib/expert-review/permissions";
import type { ExpertReviewPublicJson } from "@/lib/expert-review/serialize";
import { useWorkspace } from "@/lib/workspace-context";
import { RequestReviewModal, type RequestReviewTarget } from "./RequestReviewModal";

type OpenRequestModalFn = (p: Omit<RequestReviewTarget, "organizationId" | "organizationName">) => void;

type Summary = {
  openCount: number;
  urgentOpenCount: number;
  lastSubmitted: ExpertReviewPublicJson | null;
};

type ExpertReviewDataValue = {
  items: ExpertReviewPublicJson[];
  summary: Summary | null;
  loading: boolean;
  error: string | null;
  dataVersion: number;
  refetch: () => Promise<void>;
  getLatestForItem: (relatedItemType: string, relatedItemId: string) => ExpertReviewPublicJson | undefined;
  canSubmit: boolean;
};

const ExpertReviewDataContext = createContext<ExpertReviewDataValue | null>(null);

export function useExpertReviewData() {
  const ctx = useContext(ExpertReviewDataContext);
  if (!ctx) throw new Error("useExpertReviewData must be used within ExpertReviewProviders");
  return ctx;
}

export function ExpertReviewProviders({ children }: { children: ReactNode }) {
  const { organizationId, profile } = useWorkspace();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<ExpertReviewPublicJson[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const [dataVersion, setDataVersion] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<RequestReviewTarget | null>(null);

  const canSubmit = useMemo(() => canSubmitExpertReview(session?.user?.role), [session?.user?.role]);

  const refetch = useCallback(async () => {
    if (status !== "authenticated" || !canSubmit || !organizationId) {
      setItems([]);
      setSummary(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/expert-review-requests?organizationId=${encodeURIComponent(organizationId)}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(typeof j.error === "string" ? j.error : res.statusText);
      }
      const data = (await res.json()) as { items: ExpertReviewPublicJson[]; summary: Summary };
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
  }, [organizationId, status, canSubmit]);

  useEffect(() => {
    void refetch();
  }, [refetch, bump]);

  const getLatestForItem = useCallback(
    (relatedItemType: string, relatedItemId: string) => {
      const matches = items.filter((i) => i.relatedItemType === relatedItemType && i.relatedItemId === relatedItemId);
      return matches[0];
    },
    [items],
  );

  const dataValue = useMemo<ExpertReviewDataValue>(
    () => ({
      items,
      summary,
      loading,
      error,
      dataVersion,
      refetch,
      getLatestForItem,
      canSubmit,
    }),
    [items, summary, loading, error, dataVersion, refetch, getLatestForItem, canSubmit],
  );

  const openRequestModal = useCallback(
    (partial: Omit<RequestReviewTarget, "organizationId" | "organizationName">) => {
      if (!organizationId) return;
      setModalTarget({
        organizationId,
        organizationName: profile.organizationName,
        ...partial,
      });
      setModalOpen(true);
    },
    [organizationId, profile.organizationName],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalTarget(null);
  }, []);

  const onSubmitted = useCallback(() => {
    setBump((b) => b + 1);
  }, []);

  const modalBridge = useMemo(() => ({ openRequestModal }), [openRequestModal]);

  return (
    <ExpertReviewDataContext.Provider value={dataValue}>
      <ExpertReviewModalBridgeContext.Provider value={modalBridge}>
        {children}
        <RequestReviewModal
          open={modalOpen}
          target={modalTarget}
          onClose={closeModal}
          onSubmitted={onSubmitted}
        />
      </ExpertReviewModalBridgeContext.Provider>
    </ExpertReviewDataContext.Provider>
  );
}

const ExpertReviewModalBridgeContext = createContext<{
  openRequestModal: (p: Omit<RequestReviewTarget, "organizationId" | "organizationName">) => void;
} | null>(null);

export function useExpertReviewModal(): {
  openRequestModal: OpenRequestModalFn | null;
} {
  const ctx = useContext(ExpertReviewModalBridgeContext);
  if (!ctx) return { openRequestModal: null };
  return ctx;
}
