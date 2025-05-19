import { useState, useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import * as Y from 'yjs';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';

import { ExtensionKit } from '@/extensions/extension-kit';
import { initialContent } from '@/utils/data/initialContent';
import { getCursorColorByUserId } from '@/utils/cursor_color';
import authApi from '@/services/auth';
import { getCookie } from '@/utils/cookie';

// 定义协作用户接口
export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export function useCollaborativeEditor(roomId: string) {
  const [isEditable, setIsEditable] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const hasUnsyncedChangesRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);

  // 客户端挂载后初始化Y.Doc
  useEffect(() => {
    if (isMounted) return;

    setIsMounted(true);
    setDoc(new Y.Doc());

    const storedToken = getCookie('auth_token');

    if (storedToken) {
      setAuthToken(storedToken);
    }

    setIsOffline(!navigator.onLine);
  }, [isMounted]);

  // 监听网络状态变化
  useEffect(() => {
    if (!isMounted) return;

    const handleOnline = () => {
      console.log('Network is back online');
      setIsOffline(false);
      setConnectionStatus('connecting');

      if (hasUnsyncedChangesRef.current) {
        console.log('Has unsynced changes, reconnecting to sync...');
      }
    };

    const handleOffline = () => {
      console.log('Network is offline');
      setIsOffline(true);
      setConnectionStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !roomId || !doc) return;

    const indexeddbPersistence = new IndexeddbPersistence(`tiptap-collaborative-${roomId}`, doc);

    indexeddbPersistence.on('synced', () => {
      console.log('Content from IndexedDB loaded');

      // 当从IndexedDB加载完成后，检查是否有未同步的更改
      const localStorageKey = `offline-edits-${roomId}`;

      if (localStorage.getItem(localStorageKey) === 'true') {
        hasUnsyncedChangesRef.current = true;
      }
    });

    // 添加更多事件监听
    indexeddbPersistence.on('beforeTransaction', () => {
      console.log('Before persistence transaction');
    });

    indexeddbPersistence.on('afterTransaction', () => {
      console.log('After persistence transaction');
      // 记录有未同步的本地更改
      localStorage.setItem(`offline-edits-${roomId}`, 'true');
    });

    // 监听更新，记录本地更改
    doc.on('update', () => {
      if (isOffline || !provider || !provider.synced) {
        console.log('Document updated in offline mode');
        hasUnsyncedChangesRef.current = true;

        const now = new Date().toISOString();
        localStorage.setItem(`last-offline-edit-${roomId}`, now);
      }
    });

    return () => {
      indexeddbPersistence.destroy();
    };
  }, [isMounted, roomId, doc, isOffline, provider]);

  useEffect(() => {
    if (!isMounted || !authToken) return;

    const fetchCurrentUser = async () => {
      const { data: response } = await authApi.getMe({
        onError: (error) => console.error('获取用户信息失败:', error),
        unauthorized: () => {
          console.warn('认证已过期，需要重新登录');
        },
      });

      if (response?.data) {
        const userData: CollaborationUser = {
          id: response.data.id.toString(),
          name: response.data.name,
          color: getCursorColorByUserId(response.data.id.toString()),
          avatar: response.data.avatar_url,
        };
        setCurrentUser(userData);
      }
    };

    fetchCurrentUser();
  }, [isMounted, authToken]);

  useEffect(() => {
    if (!isMounted || !doc || isOffline || !authToken) return;

    console.log('初始化 hocuspocus provider');

    const hocuspocusProvider = new HocuspocusProvider({
      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL as string,
      name: roomId,
      document: doc,
      token: authToken,
      onConnect: () => {
        console.log('Connected to collaboration server with token');

        queueMicrotask(() => {
          setConnectionStatus('connected');

          if (currentUser && hocuspocusProvider.awareness) {
            hocuspocusProvider.awareness.setLocalStateField('user', currentUser);
            console.log('设置用户awareness:', currentUser);
          }
        });
      },

      onSynced: () => {
        console.log('Document synced with server');

        queueMicrotask(() => {
          hasUnsyncedChangesRef.current = false;
        });
      },
      onDisconnect: () => {
        console.log('Disconnected from collaboration server');
        setConnectionStatus('disconnected');
      },
      onClose: () => {
        console.log('Connection closed');
        setConnectionStatus('disconnected');
      },
    });

    setProvider(hocuspocusProvider);

    // 监听awareness更新
    if (hocuspocusProvider.awareness) {
      hocuspocusProvider.awareness.on('update', () => {
        if (!hocuspocusProvider.awareness) return;

        // 获取所有客户端状态
        const states = hocuspocusProvider.awareness.getStates();
        console.log('Awareness states:', states);

        // 收集所有用户信息
        const users: CollaborationUser[] = [];

        states.forEach((state, clientId) => {
          if (state && state.user) {
            const userData = state.user;
            const userId = userData.id || clientId.toString();
            users.push({
              id: userId,
              name: userData.name,
              color: getCursorColorByUserId(userId),
              avatar: userData.avatar,
            });
          }
        });

        // 更新连接用户列表
        if (users.length > 0) {
          console.log('Connected users:', users);
        }
      });
    }

    // 添加页面卸载事件处理函数，清理当前用户信息
    const handleBeforeUnload = () => {
      if (hocuspocusProvider && hocuspocusProvider.awareness) {
        console.log('用户离开页面，清除当前用户信息');
        hocuspocusProvider.awareness.setLocalStateField('user', null);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // 组件卸载时清除用户信息并销毁provider
      if (hocuspocusProvider && hocuspocusProvider.awareness) {
        console.log('组件卸载，清除当前用户信息');
        hocuspocusProvider.awareness.setLocalStateField('user', null);
      }

      hocuspocusProvider.destroy();
    };
  }, [isMounted, roomId, doc, isOffline, authToken, currentUser]);

  // 创建编辑器
  const editor = useEditor(
    {
      extensions: [
        ...ExtensionKit({ provider }),
        // 添加协作扩展
        ...(doc
          ? [
              Collaboration.configure({
                document: doc,
                field: 'content',
              }),
            ]
          : []),
        ...(provider && !isOffline && currentUser && doc
          ? [
              CollaborationCursor.configure({
                provider,
                user: currentUser || undefined,
              }),
            ]
          : []),
      ],
      // 使用initialContent作为初始内容，当Y.doc为空时会自动使用这个内容
      content: initialContent,
      onCreate: ({ editor }) => {
        console.log('Editor created', editor);

        requestAnimationFrame(() => {
          if (editor.isEmpty) {
            try {
              console.log('Editor is empty, setting initialContent');
              editor.commands.setContent(initialContent);
            } catch (err) {
              console.error('Error setting content:', err);
            }
          }
        });
      },
      onTransaction: ({ editor }) => {
        setIsEditable(editor.isEditable);
      },
      onSelectionUpdate: ({ editor }) => {
        // 检测是否是全选状态
        const { from, to } = editor.state.selection;
        const isAllSelected = from === 0 && to === editor.state.doc.content.size;

        // 获取编辑器DOM
        const editorElement = document.querySelector('.ProseMirror');

        if (editorElement) {
          if (isAllSelected) {
            editorElement.classList.add('is-all-selected');

            // 对于全选，我们强制活跃所有已使用的标记类型
            // 这将确保菜单栏能够显示文档中使用的格式
            setTimeout(() => {
              // 使用setTimeout确保DOM已更新
              const activeMarks: string[] = [];

              // 检查文档中各种样式的存在
              editor.state.doc.descendants((node) => {
                if (node.marks && node.marks.length > 0) {
                  node.marks.forEach((mark) => {
                    if (!activeMarks.includes(mark.type.name)) {
                      activeMarks.push(mark.type.name);
                    }
                  });
                }

                return true;
              });

              // 手动触发选择更新，确保菜单能够反映当前样式
              editor.view.dispatch(editor.state.tr.setSelection(editor.state.selection));
            }, 10);
          } else {
            editorElement.classList.remove('is-all-selected');
          }
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
    },
    [provider, isOffline, currentUser, doc, isMounted],
  );

  return {
    editor,
    isEditable,
    connectionStatus,
    provider,
    doc,
    isOffline,
    isMounted,
    currentUser,
  };
}
