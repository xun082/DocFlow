import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
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

export interface ExtensionKitProps {
  provider: HocuspocusProvider | null;
  onCommentActivated?: (commentId: string) => void;
}

// 工具函数
const getWebSocketUrl = (): string | null => {
  const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  if (!url) return null;

  // 将127.0.0.1转换为localhost以避免连接问题
  return url.includes('127.0.0.1') ? url.replace('127.0.0.1', 'localhost') : url;
};

const validateConfig = () => {
  const websocketUrl = getWebSocketUrl();
  const authToken = getCookie('auth_token');

  return {
    websocketUrl,
    authToken,
    isValid: !!(websocketUrl && authToken),
  };
};

// 网络状态管理hook
const useNetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};

// 用户信息管理hook
const useCurrentUser = (authToken: string | null) => {
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [authError, setAuthError] = useState<AuthErrorType>({ status: false, reason: '' });

  useEffect(() => {
    if (!authToken) return;

    let cancelled = false;

    const fetchUser = async () => {
      try {
        const { data: response } = await authApi.getMe({
          onError: (error) => console.error('获取用户信息失败:', error),
          unauthorized: () => {
            if (!cancelled) {
              startTransition(() => {
                setAuthError({ status: true, reason: 'unauthorized' });
              });
            }
          },
        });

        if (!cancelled && response?.data) {
          // 使用startTransition避免flushSync错误
          startTransition(() => {
            setCurrentUser({
              id: response.data.id.toString(),
              name: response.data.name,
              color: getCursorColorByUserId(response.data.id.toString()),
              avatar: response.data.avatar_url,
            });
            setAuthError({ status: false, reason: '' });
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('获取用户信息异常:', error);
          startTransition(() => {
            setAuthError({ status: true, reason: 'user-fetch-failed' });
          });
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  return { currentUser, authError, setAuthError };
};

// 本地持久化hook
const useLocalPersistence = (roomId: string, doc: Y.Doc | null, isOffline: boolean) => {
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const hasUnsyncedChangesRef = useRef(false);

  useEffect(() => {
    if (!roomId || !doc) return;

    const persistence = new IndexeddbPersistence(`tiptap-collaborative-${roomId}`, doc);
    const localStorageKey = `offline-edits-${roomId}`;

    persistence.on('synced', () => {
      // 使用startTransition避免flushSync错误
      startTransition(() => {
        setIsLocalLoaded(true);
      });

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

  const clearOfflineEdits = useCallback(() => {
    hasUnsyncedChangesRef.current = false;
    localStorage.removeItem(`offline-edits-${roomId}`);
  }, [roomId]);

  return { isLocalLoaded, hasUnsyncedChangesRef, clearOfflineEdits };
};

// 协作提供者管理hook
const useCollaborationProvider = (
  roomId: string,
  doc: Y.Doc | null,
  authToken: string | null,
  isOffline: boolean,
  currentUser: CollaborationUser | null,
  clearOfflineEdits: () => void,
  setAuthError: (error: AuthErrorType) => void,
) => {
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isServerSynced, setIsServerSynced] = useState(false);

  useEffect(() => {
    if (!doc || isOffline || !authToken || !roomId) return;

    const config = validateConfig();

    if (!config.isValid) {
      startTransition(() => {
        setAuthError({ status: true, reason: 'config-incomplete' });
      });

      return;
    }

    const hocuspocusProvider = new HocuspocusProvider({
      url: config.websocketUrl!,
      name: roomId,
      document: doc,
      token: authToken,

      onConnect: () => {
        // 使用startTransition避免flushSync错误
        startTransition(() => {
          setConnectionStatus('syncing');
          setAuthError({ status: false, reason: '' });
        });
      },

      onDisconnect: () => {
        startTransition(() => {
          setConnectionStatus('disconnected');
          setIsServerSynced(false);
        });

        // 自动重连（如果不是离线状态）
        if (!isOffline) {
          setTimeout(() => hocuspocusProvider.connect(), 5000);
        }
      },

      onAuthenticationFailed: (data) => {
        console.error('协作服务器认证失败:', data);
        startTransition(() => {
          setConnectionStatus('error');
          setAuthError({ status: true, reason: 'authentication-failed' });
        });
      },

      onSynced: () => {
        startTransition(() => {
          setConnectionStatus('connected');
          setIsServerSynced(true);
        });
        clearOfflineEdits();
      },

      onDestroy: () => {
        startTransition(() => {
          setConnectionStatus('disconnected');
          setIsServerSynced(false);
        });
      },
    });

    startTransition(() => {
      setProvider(hocuspocusProvider);
    });

    // 设置用户awareness信息
    if (currentUser && hocuspocusProvider.awareness) {
      hocuspocusProvider.awareness.setLocalStateField('user', currentUser);
    }

    return () => {
      if (hocuspocusProvider.awareness) {
        hocuspocusProvider.awareness.setLocalStateField('user', null);
      }

      hocuspocusProvider.destroy();
    };
  }, [roomId, doc, authToken, isOffline, currentUser, clearOfflineEdits, setAuthError]);

  return { provider, connectionStatus, isServerSynced };
};

// 协作用户管理hook
const useConnectedUsers = (
  provider: HocuspocusProvider | null,
  currentUser: CollaborationUser | null,
) => {
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);

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

      // 使用startTransition避免flushSync错误
      startTransition(() => {
        setConnectedUsers(users);
      });
    };

    provider.awareness.on('update', handleAwarenessUpdate);

    return () => provider.awareness?.off('update', handleAwarenessUpdate);
  }, [provider, currentUser]);

  return connectedUsers;
};

// 主要的协作编辑器hook
export function useCollaborativeEditor(
  roomId: string,
  initialContent?: JSONContent,
  onCommentActivated?: (commentId: string) => void,
) {
  const [isEditable, setIsEditable] = useState(true);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isOffline = useNetworkStatus();
  const { currentUser, authError, setAuthError } = useCurrentUser(authToken);
  const { isLocalLoaded, clearOfflineEdits } = useLocalPersistence(roomId, doc, isOffline);
  const { provider, connectionStatus, isServerSynced } = useCollaborationProvider(
    roomId,
    doc,
    authToken,
    isOffline,
    currentUser,
    clearOfflineEdits,
    setAuthError,
  );
  const connectedUsers = useConnectedUsers(provider, currentUser);

  // 初始化 - 使用调度器避免快速状态更新导致的flushSync错误
  useEffect(() => {
    if (isMounted) return;

    // 延迟初始化，避免多个状态同时更新
    queueMicrotask(() => {
      startTransition(() => {
        setIsMounted(true);
        setDoc(new Y.Doc());
        setAuthToken(getCookie('auth_token'));
      });
    });
  }, [isMounted]);

  // 创建编辑器 - 使用startTransition避免flushSync错误
  const editor = useEditor(
    {
      extensions: [
        ...ExtensionKit({ provider, onCommentActivated }),
        ...(doc ? [Collaboration.configure({ document: doc, field: 'content' })] : []),
        ...(provider && !isOffline && currentUser && doc
          ? [CollaborationCursor.configure({ provider, user: currentUser })]
          : []),
      ],
      content: '',
      onTransaction: ({ editor }) => {
        // 使用startTransition包装状态更新，避免flushSync错误
        startTransition(() => {
          setIsEditable(editor.isEditable);
        });
      },
      onSelectionUpdate: ({ editor }) => {
        // 延迟DOM操作，避免在渲染过程中同步更新
        requestAnimationFrame(() => {
          const { from, to } = editor.state.selection;
          const isAllSelected = from === 0 && to === editor.state.doc.content.size;
          const editorElement = document.querySelector('.ProseMirror');

          if (editorElement) {
            editorElement.classList.toggle('is-all-selected', isAllSelected);
          }
        });
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
    },
    [provider, isOffline, currentUser, doc, isMounted],
  );

  // 设置初始内容 - 直接设置从接口获取的内容，避免flushSync错误
  useEffect(() => {
    if (!editor || !initialContent || !isLocalLoaded) return;

    // 使用调度器延迟内容设置，避免在编辑器初始化时触发flushSync
    const timeoutId = setTimeout(() => {
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(initialContent);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
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
    isMounted,
    currentUser,
    authError,
    connectedUsers,
    syncProgress,
    isLocalLoaded,
    isServerSynced,
    isFullyLoaded,
  };
}
