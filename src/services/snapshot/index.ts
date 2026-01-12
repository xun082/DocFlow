import * as Y from 'yjs';

export interface Snapshot {
  id: string;
  documentId: string;
  timestamp: number;
  description?: string;
  snapshotData: Uint8Array;
}

const DB_NAME = 'docflow-snapshots';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';

export class SnapshotService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('documentId', 'documentId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  async createSnapshot(doc: Y.Doc, documentId: string, description?: string): Promise<Snapshot> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const prevGc = doc.gc;
    doc.gc = false;

    try {
      const snapshot = Y.snapshot(doc);
      const snapshotData = Y.encodeSnapshot(snapshot);

      const newSnapshot: Snapshot = {
        id: `${documentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        documentId,
        timestamp: Date.now(),
        description,
        snapshotData,
      };

      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(newSnapshot);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to save snapshot'));
      });

      await this.cleanupOldSnapshots(documentId);

      return newSnapshot;
    } finally {
      doc.gc = prevGc;
    }
  }

  async restoreSnapshot(doc: Y.Doc, snapshotId: string): Promise<boolean> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const snapshot = await new Promise<Snapshot | undefined>((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(snapshotId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get snapshot'));
    });

    if (!snapshot) {
      console.error('Snapshot not found:', snapshotId);

      return false;
    }

    try {
      const decodedSnapshot = Y.decodeSnapshot(snapshot.snapshotData);

      const prevGc = doc.gc;
      doc.gc = false;

      try {
        const newDoc = Y.createDocFromSnapshot(doc, decodedSnapshot);

        const content = newDoc.getXmlFragment('content');
        const targetContent = doc.getXmlFragment('content');

        targetContent.delete(0, targetContent.length);
        content.forEach((child) => {
          if (child instanceof Y.XmlElement || child instanceof Y.XmlText) {
            targetContent.push([child.clone()]);
          }
        });

        return true;
      } finally {
        doc.gc = prevGc;
      }
    } catch (error) {
      console.error('Failed to restore snapshot:', error);

      return false;
    }
  }

  async getSnapshots(documentId: string): Promise<Snapshot[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('documentId');
      const request = index.getAll(documentId);

      request.onsuccess = () => {
        const snapshots = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(snapshots);
      };

      request.onerror = () => {
        reject(new Error('Failed to get snapshots'));
      };
    });
  }

  async deleteSnapshot(snapshotId: string): Promise<boolean> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(snapshotId);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to delete snapshot'));
      };
    });
  }

  async clearSnapshots(documentId: string): Promise<boolean> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const snapshots = await this.getSnapshots(documentId);

    await Promise.all(snapshots.map((snapshot) => this.deleteSnapshot(snapshot.id)));

    return true;
  }

  private async cleanupOldSnapshots(documentId: string, maxSnapshots: number = 50): Promise<void> {
    const snapshots = await this.getSnapshots(documentId);

    if (snapshots.length > maxSnapshots) {
      const toDelete = snapshots.slice(maxSnapshots);
      await Promise.all(toDelete.map((snapshot) => this.deleteSnapshot(snapshot.id)));
    }
  }
}

export const snapshotService = new SnapshotService();
