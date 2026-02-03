import { useState, useCallback, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { toast } from 'sonner';

import { snapshotService, Snapshot } from '@/services/snapshot';

interface UseEditorHistoryOptions {
  documentId: string;
  doc: Y.Doc | null;
  autoSnapshot?: boolean;
  autoSnapshotInterval?: number;
  snapshotOnUnmount?: boolean;
}

interface UseEditorHistoryReturn {
  snapshots: Snapshot[];
  isLoading: boolean;
  isRestoring: boolean;
  createSnapshot: (description?: string) => Promise<Snapshot | null>;
  restoreSnapshot: (snapshotId: string) => Promise<boolean>;
  deleteSnapshot: (snapshotId: string) => Promise<boolean>;
  clearSnapshots: () => Promise<boolean>;
  refreshSnapshots: () => Promise<void>;
}

export function useEditorHistory({
  documentId,
  doc,
  autoSnapshot = false,
  autoSnapshotInterval = 300000,
  snapshotOnUnmount = false,
}: UseEditorHistoryOptions): UseEditorHistoryReturn {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const hasContentChangedRef = useRef(false);
  const lastSnapshotTimeRef = useRef<number>(Date.now());

  const refreshSnapshots = useCallback(async () => {
    if (!documentId) return;

    setIsLoading(true);

    try {
      const result = await snapshotService.getSnapshots(documentId);
      setSnapshots(result);
    } catch {
      toast.error('加载快照失败');
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  const createSnapshot = useCallback(
    async (description?: string) => {
      if (!doc || !documentId) {
        toast.error('文档未准备好');

        return null;
      }

      try {
        const newSnapshot = await snapshotService.createSnapshot(doc, documentId, description);

        hasContentChangedRef.current = false;
        lastSnapshotTimeRef.current = Date.now();

        await refreshSnapshots();

        return newSnapshot;
      } catch {
        toast.error('创建快照失败');

        return null;
      }
    },
    [doc, documentId, refreshSnapshots],
  );

  const restoreSnapshot = useCallback(
    async (snapshotId: string) => {
      if (!doc) {
        toast.error('文档未准备好');

        return false;
      }

      setIsRestoring(true);

      try {
        const success = await snapshotService.restoreSnapshot(doc, snapshotId);

        if (success) {
          hasContentChangedRef.current = false;
          lastSnapshotTimeRef.current = Date.now();

          await refreshSnapshots();
        }

        return success;
      } catch {
        toast.error('恢复快照失败');

        return false;
      } finally {
        setIsRestoring(false);
      }
    },
    [doc, refreshSnapshots],
  );

  const deleteSnapshot = useCallback(
    async (snapshotId: string) => {
      try {
        const success = await snapshotService.deleteSnapshot(snapshotId);

        if (success) {
          await refreshSnapshots();
        }

        return success;
      } catch {
        toast.error('删除快照失败');

        return false;
      }
    },
    [refreshSnapshots],
  );

  const clearSnapshots = useCallback(async () => {
    if (!documentId) return false;

    try {
      const success = await snapshotService.clearSnapshots(documentId);

      if (success) {
        setSnapshots([]);
      }

      return success;
    } catch {
      toast.error('清空快照失败');

      return false;
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      refreshSnapshots();
    }
  }, [documentId, refreshSnapshots]);

  useEffect(() => {
    if (!autoSnapshot || !doc || !documentId) return;

    const updateHandler = () => {
      hasContentChangedRef.current = true;
    };

    doc.on('update', updateHandler);

    const checkInterval = Math.min(autoSnapshotInterval / 10, 30000);

    const interval = setInterval(async () => {
      if (!hasContentChangedRef.current) {
        return;
      }

      const timeSinceLastSnapshot = Date.now() - lastSnapshotTimeRef.current;

      if (timeSinceLastSnapshot < autoSnapshotInterval) {
        return;
      }

      const snapshot = await snapshotService.createSnapshotIfChanged(
        doc,
        documentId,
        `自动保存 - ${new Date().toLocaleString()}`,
      );

      if (snapshot) {
        hasContentChangedRef.current = false;
        lastSnapshotTimeRef.current = Date.now();
        await refreshSnapshots();
      }
    }, checkInterval);

    return () => {
      doc.off('update', updateHandler);
      clearInterval(interval);
    };
  }, [autoSnapshot, autoSnapshotInterval, doc, documentId, refreshSnapshots]);

  useEffect(() => {
    if (!snapshotOnUnmount || !doc || !documentId) return;

    return () => {
      if (hasContentChangedRef.current) {
        snapshotService.createSnapshotIfChanged(doc, documentId, '组件卸载自动保存');
      }
    };
  }, [snapshotOnUnmount, doc, documentId]);

  return {
    snapshots,
    isLoading,
    isRestoring,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    clearSnapshots,
    refreshSnapshots,
  };
}
