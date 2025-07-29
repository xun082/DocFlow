import { useState, useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import * as Y from 'yjs';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';

import { ExtensionKit } from '@/extensions/extension-kit';
import { getCursorColorByUserId } from '@/utils/cursor_color';
import authApi from '@/services/auth';
import { getCookie } from '@/utils/cookie';

// 类型定义
export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'syncing' | 'error';

export type AuthErrorType = {
  status: boolean;
  reason: string;
};

// 主要的协作编辑器hook
export function useCollaborativeEditor(roomId: string, initialContent?: JSONContent) {
  const [isEditable, setIsEditable] = useState(true);
  const [doc] = useState(() => new Y.Doc());
  const [authToken] = useState(() => getCookie('auth_token'));
  const [isOffline, setIsOffline] = useState(() => {
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }

    return false; // 服务端默认为在线状态
  });
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [authError, setAuthError] = useState<AuthErrorType>({ status: false, reason: '' });
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isServerSynced, setIsServerSynced] = useState(false);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const hasUnsyncedChangesRef = useRef(false);

  // 网络状态监听
  useEffect(() => {
    // 只在浏览器环境中添加事件监听器
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 获取当前用户信息
  useEffect(() => {
    if (!authToken) return;

    const fetchUser = async () => {
      try {
        const { data: response } = await authApi.getMe({
          onError: (error) => console.error('获取用户信息失败:', error),
          unauthorized: () => {
            setAuthError({ status: true, reason: 'unauthorized' });
          },
        });

        if (response?.data) {
          setCurrentUser({
            id: response.data.id.toString(),
            name: response.data.name,
            color: getCursorColorByUserId(response.data.id.toString()),
            avatar: response.data.avatar_url,
          });
          setAuthError({ status: false, reason: '' });
        }
      } catch (error) {
        console.error('获取用户信息异常:', error);
        setAuthError({ status: true, reason: 'user-fetch-failed' });
      }
    };

    fetchUser();
  }, [authToken]);

  // 本地持久化
  useEffect(() => {
    if (!roomId || !doc) return;

    const persistence = new IndexeddbPersistence(`tiptap-collaborative-${roomId}`, doc);
    const localStorageKey = `offline-edits-${roomId}`;

    persistence.on('synced', () => {
      setIsLocalLoaded(true);

      if (localStorage.getItem(localStorageKey) === 'true') {
        hasUnsyncedChangesRef.current = true;
      }
    });

    const handleTransaction = () => {
      if (isOffline) {
        localStorage.setItem(localStorageKey, 'true');
        localStorage.setItem(`last-offline-edit-${roomId}`, new Date().toISOString());
        hasUnsyncedChangesRef.current = true;
      }
    };

    persistence.on('afterTransaction', handleTransaction);
    doc.on('update', handleTransaction);

    return () => {
      persistence.destroy();
    };
  }, [roomId, doc, isOffline]);

  // 协作提供者
  useEffect(() => {
    if (isOffline || !authToken || !roomId || !doc) return;

    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!websocketUrl) {
      setAuthError({ status: true, reason: 'websocket-url-missing' });

      return;
    }

    const clearOfflineEdits = () => {
      hasUnsyncedChangesRef.current = false;
      localStorage.removeItem(`offline-edits-${roomId}`);
    };

    const hocuspocusProvider = new HocuspocusProvider({
      url: websocketUrl,
      name: roomId,
      document: doc,
      token: authToken,

      onConnect: () => {
        setConnectionStatus('syncing');
        setAuthError({ status: false, reason: '' });
      },

      onDisconnect: () => {
        setConnectionStatus('disconnected');
        setIsServerSynced(false);

        // 自动重连（如果不是离线状态）
        if (!isOffline) {
          setTimeout(() => hocuspocusProvider.connect(), 5000);
        }
      },

      onAuthenticationFailed: (data) => {
        console.error('协作服务器认证失败:', data);
        setConnectionStatus('error');
        setAuthError({ status: true, reason: 'authentication-failed' });
      },

      onSynced: () => {
        setConnectionStatus('connected');
        setIsServerSynced(true);
        clearOfflineEdits();
      },

      onDestroy: () => {
        setConnectionStatus('disconnected');
        setIsServerSynced(false);
      },
    });

    setProvider(hocuspocusProvider);

    return () => {
      if (hocuspocusProvider.awareness) {
        hocuspocusProvider.awareness.setLocalStateField('user', null);
      }

      hocuspocusProvider.destroy();
    };
  }, [roomId, doc, authToken, isOffline]);

  // 设置用户awareness信息
  useEffect(() => {
    if (provider?.awareness && currentUser) {
      provider.awareness.setLocalStateField('user', currentUser);
    }
  }, [provider, currentUser]);

  // 协作用户管理
  useEffect(() => {
    if (!provider?.awareness) return;

    const handleAwarenessUpdate = () => {
      const states = provider.awareness!.getStates();
      const users: CollaborationUser[] = [];

      states.forEach((state, clientId) => {
        if (state?.user) {
          const userData = state.user;
          const userId = userData.id || clientId.toString();

          if (currentUser && userId !== currentUser.id) {
            users.push({
              id: userId,
              name: userData.name,
              color: getCursorColorByUserId(userId),
              avatar: userData.avatar,
            });
          }
        }
      });

      setConnectedUsers(users);
    };

    provider.awareness.on('update', handleAwarenessUpdate);

    return () => provider.awareness?.off('update', handleAwarenessUpdate);
  }, [provider, currentUser]);

  // 创建编辑器
  const editor = useEditor({
    extensions: [
      ...ExtensionKit({ provider }),
      ...(doc ? [Collaboration.configure({ document: doc, field: 'content' })] : []),
      ...(provider && !isOffline && currentUser && doc
        ? [CollaborationCursor.configure({ provider, user: currentUser })]
        : []),
    ],
    content: '',
    onTransaction: ({ editor }) => {
      setIsEditable(editor.isEditable);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const isAllSelected = from === 0 && to === editor.state.doc.content.size;
      const editorElement = document.querySelector('.ProseMirror');

      if (editorElement) {
        editorElement.classList.toggle('is-all-selected', isAllSelected);
      }
    },
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full',
        spellcheck: 'false',
      },
    },
    immediatelyRender: false,
  });

  // 设置初始内容
  useEffect(() => {
    if (!editor || !initialContent || !isLocalLoaded) return;

    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, isLocalLoaded]);

  const isFullyLoaded = isLocalLoaded && (isOffline || isServerSynced);
  const syncProgress = {
    synced: connectionStatus === 'connected',
    loading: connectionStatus === 'syncing',
  };

  return {
    editor,
    isEditable,
    connectionStatus,
    provider,
    doc,
    isOffline,
    currentUser,
    authError,
    connectedUsers,
    syncProgress,
    isLocalLoaded,
    isServerSynced,
    isFullyLoaded,
  };
}
