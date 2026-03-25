import { useState, useEffect } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import { toast } from 'sonner';

import type { CollaborationUser } from './useDocumentPermission';

import { DocumentPermissionData } from '@/services/document/type';
import { getAuthToken, getCursorColorByUserId } from '@/utils';

export interface UseCollaborationResult {
  provider: HocuspocusProvider | null;
  connectedUsers: CollaborationUser[];
  isCollaborationBootstrapReady: boolean;
  /** Granular sync flags used by loading-state UI */
  isIndexedDBReady: boolean;
  isServerSynced: boolean;
  /**
   * `null` = server hasn't responded yet (fall back to HTTP-derived permission).
   * `true/false` = server-confirmed value from the `server:permission` stateless message.
   */
  serverReadOnly: boolean | null;
}

export function useCollaboration(
  documentId: string,
  doc: Y.Doc | null,
  permissionData: DocumentPermissionData | null,
  currentUser: CollaborationUser | null,
): UseCollaborationResult {
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const [isIndexedDBReady, setIsIndexedDBReady] = useState(false);
  const [isServerSynced, setIsServerSynced] = useState(false);
  const [serverReadOnly, setServerReadOnly] = useState<boolean | null>(null);

  // Load local IndexedDB snapshot first so the WS diff is minimal.
  useEffect(() => {
    if (!documentId || !doc || typeof window === 'undefined' || !permissionData) return;

    setIsIndexedDBReady(false);
    setIsServerSynced(false);

    const persistence = new IndexeddbPersistence(`tiptap-collaborative-${documentId}`, doc);

    persistence.on('synced', () => setIsIndexedDBReady(true));

    return () => {
      persistence.destroy();
    };
  }, [documentId, doc, permissionData]);

  // Connect to Hocuspocus only after IndexedDB has restored local state.
  useEffect(() => {
    if (!documentId || !doc || !permissionData || !isIndexedDBReady) return;

    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!websocketUrl) {
      setProvider(null);
      setIsServerSynced(true);

      return () => setIsServerSynced(false);
    }

    setIsServerSynced(false);
    setServerReadOnly(null);

    const hocuspocusProvider = new HocuspocusProvider({
      url: websocketUrl,
      name: documentId,
      document: doc,
      token: getAuthToken(),
      onSynced: ({ state }) => {
        if (state) setIsServerSynced(true);
      },
      onAuthenticationFailed: () => {
        setIsServerSynced(true);
        toast.error('协作服务认证失败，已使用本地缓存打开；刷新或重新登录后再试同步');
      },
      onStateless: ({ payload }: { payload: string }) => {
        try {
          const msg = JSON.parse(payload) as { type: string; readOnly: boolean };

          if (msg.type === 'server:permission') {
            setServerReadOnly(!!msg.readOnly);
          }
        } catch {
          // ignore unrecognised stateless messages
        }
      },
    });

    setProvider(hocuspocusProvider);

    return () => {
      hocuspocusProvider.destroy();
      setProvider(null);
      setIsServerSynced(false);
      setServerReadOnly(null);
    };
  }, [documentId, doc, permissionData, isIndexedDBReady]);

  // Broadcast the local user's cursor/presence to peers.
  useEffect(() => {
    if (provider?.awareness && currentUser) {
      provider.awareness.setLocalStateField('user', currentUser);
    }
  }, [provider, currentUser]);

  // Maintain the list of other connected users from awareness.
  useEffect(() => {
    if (!provider?.awareness) return;

    const sync = () => {
      const users: CollaborationUser[] = [];

      provider.awareness!.getStates().forEach((state, clientId) => {
        if (!state?.user) return;

        const userId = state.user.id || clientId.toString();

        if (currentUser && userId !== currentUser.id) {
          users.push({
            id: userId,
            name: state.user.name,
            color: getCursorColorByUserId(userId),
            avatar: state.user.avatar,
          });
        }
      });

      setConnectedUsers(users);
    };

    provider.awareness.on('update', sync);

    return () => provider.awareness?.off('update', sync);
  }, [provider, currentUser]);

  return {
    provider,
    connectedUsers,
    isCollaborationBootstrapReady: isIndexedDBReady && isServerSynced,
    isIndexedDBReady,
    isServerSynced,
    serverReadOnly,
  };
}
