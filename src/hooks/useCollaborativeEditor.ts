import { useState, useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import * as Y from 'yjs';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret';
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
export function useCollaborativeEditor(
  roomId: string,
  initialContent?: JSONContent,
  isOffline: boolean = false,
) {
  const [isEditable, setIsEditable] = useState(true);
  const [doc] = useState(() => new Y.Doc());
  const [authToken] = useState(() => getCookie('auth_token'));
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [authError, setAuthError] = useState<AuthErrorType>({ status: false, reason: '' });
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isServerSynced, setIsServerSynced] = useState(false);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const hasUnsyncedChangesRef = useRef(false);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // 获取当前用户信息
  useEffect(() => {
    if (!authToken || !roomId || roomId === '') return;

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

  // 协作提供者 - 等待编辑器就绪后再启动WebSocket连接
  useEffect(() => {
    if (!authToken || !roomId || !doc || !isEditorReady) return;

    // 如果已经有连接且参数相同，不重复创建
    if (providerRef.current && providerRef.current.configuration.name === roomId) {
      return;
    }

    // 清理旧连接
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }

    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!websocketUrl) {
      setAuthError({ status: true, reason: 'websocket-url-missing' });

      return;
    }

    // 额外延迟，确保编辑器完全稳定后再建立WebSocket连接
    const connectionTimer = setTimeout(() => {
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

      providerRef.current = hocuspocusProvider;
      setProvider(hocuspocusProvider);
    }, 300); // 300ms延迟，确保编辑器完全稳定

    return () => {
      clearTimeout(connectionTimer);

      // 只在组件卸载时清理
      if (providerRef.current) {
        if (providerRef.current.awareness) {
          providerRef.current.awareness.setLocalStateField('user', null);
        }

        providerRef.current.destroy();
        providerRef.current = null;
      }
    };
  }, [roomId, isEditorReady]); // 在roomId变化或编辑器就绪时创建连接

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

  // 创建编辑器 - 包含协作扩展但延迟WebSocket连接
  const editor = useEditor({
    extensions: [
      ...ExtensionKit({ provider }),
      ...(doc ? [Collaboration.configure({ document: doc, field: 'content' })] : []),
      ...(provider && !isOffline && currentUser && doc
        ? [CollaborationCaret.configure({ provider, user: currentUser })]
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
    onCreate: () => {
      // 编辑器创建成功后延迟设置就绪状态
      setTimeout(() => {
        setIsEditorReady(true);
      }, 500); // 增加延迟，确保编辑器完全就绪
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
    immediatelyRender: true,
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
