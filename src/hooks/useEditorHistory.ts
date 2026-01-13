import { useState, useCallback, useEffect } from 'react';
import * as Y from 'yjs';

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

  const refreshSnapshots = useCallback(async () => {
    if (!documentId) return;

    setIsLoading(true);

    try {
      const result = await snapshotService.getSnapshots(documentId);
      setSnapshots(result);
    } catch (error) {
      console.error('Failed to load snapshots:', error);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  const createSnapshot = useCallback(
    async (description?: string) => {
      if (!doc || !documentId) {
        console.error('Document or documentId is not available');

        return null;
      }

      try {
        const newSnapshot = await snapshotService.createSnapshot(doc, documentId, description);
        await refreshSnapshots();

        return newSnapshot;
      } catch (error) {
        console.error('Failed to create snapshot:', error);

        return null;
      }
    },
    [doc, documentId, refreshSnapshots],
  );

  const restoreSnapshot = useCallback(
    async (snapshotId: string) => {
      if (!doc) {
        console.error('Document is not available');

        return false;
      }

      setIsRestoring(true);

      try {
        const success = await snapshotService.restoreSnapshot(doc, snapshotId);

        if (success) {
          await refreshSnapshots();
        }

        return success;
      } catch (error) {
        console.error('Failed to restore snapshot:', error);

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
      } catch (error) {
        console.error('Failed to delete snapshot:', error);

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
    } catch (error) {
      console.error('Failed to clear snapshots:', error);

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

    const interval = setInterval(() => {
      createSnapshot(`自动保存 - ${new Date().toLocaleString()}`);
    }, autoSnapshotInterval);

    return () => clearInterval(interval);
  }, [autoSnapshot, autoSnapshotInterval, doc, documentId, createSnapshot]);

  useEffect(() => {
    if (!snapshotOnUnmount || !doc || !documentId) return;

    return () => {
      createSnapshot('组件卸载自动保存');
    };
  }, [snapshotOnUnmount, doc, documentId, createSnapshot]);

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
