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

// 调试工具：检查连接所需的关键信息
function debugCollaborativeConnection() {
  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const authToken = getCookie('auth_token');

  console.log('🔍 === 协作连接调试信息 ===');
  console.log('🌐 WebSocket URL:', websocketUrl || '❌ 未配置');
  console.log('🔗 Server URL:', serverUrl || '❌ 未配置');
  console.log('🔑 Auth Token:', authToken ? '✅ 存在' : '❌ 不存在');
  console.log('🔒 Token内容:', authToken ? `${authToken.substring(0, 20)}...` : 'N/A');
  console.log('🌍 当前环境:', process.env.NODE_ENV);
  console.log('================================');

  return {
    websocketUrl,
    serverUrl,
    authToken,
    hasRequiredConfig: !!(websocketUrl && authToken),
  };
}

// 定义协作用户接口
export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export type AuthErrorType = {
  status: boolean;
  reason: string;
};

export interface ExtensionKitProps {
  provider: HocuspocusProvider | null;
  onCommentActivated?: (commentId: string) => void;
}

export function useCollaborativeEditor(
  roomId: string,
  initialContent?: JSONContent,
  onCommentActivated?: (commentId: string) => void,
) {
  const [isEditable, setIsEditable] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'syncing' | 'error'
  >('connecting');
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const hasUnsyncedChangesRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [authError, setAuthError] = useState<AuthErrorType>({ status: false, reason: '' });
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const [syncProgress, setSyncProgress] = useState<{ synced: boolean; loading: boolean }>({
    synced: false,
    loading: true,
  });
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const [isServerSynced, setIsServerSynced] = useState(false);
  const [isInitialContentSet, setIsInitialContentSet] = useState(false);

  // 使用ref来避免在useEffect依赖中包含易变的状态
  const currentUserRef = useRef<CollaborationUser | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);

  // 更新refs
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  // 客户端挂载后初始化Y.Doc
  useEffect(() => {
    if (isMounted) return;

    setIsMounted(true);

    const ydoc = new Y.Doc();
    setDoc(ydoc);

    const storedToken = getCookie('auth_token');

    if (storedToken) {
      setAuthToken(storedToken);
    }

    setIsOffline(!navigator.onLine);

    // 如果有初始内容，标记为准备设置
    if (initialContent && typeof initialContent === 'object') {
      console.log('📄 准备设置初始文档内容');
      setIsInitialContentSet(true);
    } else {
      setIsInitialContentSet(true);
    }
  }, [isMounted, initialContent]);

  // 监听网络状态变化
  useEffect(() => {
    if (!isMounted) return;

    const handleOnline = () => {
      console.log('🌐 网络恢复在线');
      setIsOffline(false);
      setConnectionStatus('connecting');

      if (hasUnsyncedChangesRef.current) {
        console.log('🔄 检测到未同步的更改，准备重连同步...');
      }

      // 网络恢复时延迟重连
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        const currentProvider = providerRef.current;

        if (currentProvider && connectionStatus !== 'connected') {
          console.log('🔄 网络恢复后尝试重连...');
          currentProvider.connect();
        }
      }, 1000);
    };

    const handleOffline = () => {
      console.log('📴 网络离线');
      setIsOffline(true);
      setConnectionStatus('disconnected');

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isMounted, connectionStatus]);

  // IndexedDB本地持久化
  useEffect(() => {
    if (!isMounted || !roomId || !doc) return;

    console.log('🗄️ 初始化IndexedDB持久化...');

    const indexeddbPersistence = new IndexeddbPersistence(`tiptap-collaborative-${roomId}`, doc);

    indexeddbPersistence.on('synced', () => {
      console.log('✅ IndexedDB本地数据加载完成');
      setIsLocalLoaded(true);

      // 检查是否有未同步的离线编辑
      const localStorageKey = `offline-edits-${roomId}`;

      if (localStorage.getItem(localStorageKey) === 'true') {
        hasUnsyncedChangesRef.current = true;
        console.log('⚠️ 检测到未同步的离线编辑');
      }
    });

    indexeddbPersistence.on('beforeTransaction', () => {
      console.log('📝 IndexedDB事务开始');
    });

    indexeddbPersistence.on('afterTransaction', () => {
      console.log('✅ IndexedDB事务完成');

      if (isOffline || connectionStatus !== 'connected') {
        localStorage.setItem(`offline-edits-${roomId}`, 'true');
        hasUnsyncedChangesRef.current = true;

        const now = new Date().toISOString();

        localStorage.setItem(`last-offline-edit-${roomId}`, now);
        console.log('💾 离线编辑已保存到本地');
      }
    });

    // 监听文档更新
    doc.on('update', () => {
      if (isOffline || !providerRef.current || connectionStatus !== 'connected') {
        console.log('📝 离线模式下文档更新');
        hasUnsyncedChangesRef.current = true;

        const now = new Date().toISOString();

        localStorage.setItem(`last-offline-edit-${roomId}`, now);
      }
    });

    return () => {
      indexeddbPersistence.destroy();
    };
  }, [isMounted, roomId, doc, isOffline, connectionStatus]);

  // 获取当前用户信息
  useEffect(() => {
    if (!isMounted || !authToken) return;

    const fetchCurrentUser = async () => {
      try {
        const { data: response } = await authApi.getMe({
          onError: (error) => console.error('❌ 获取用户信息失败:', error),
          unauthorized: () => {
            console.warn('⚠️ 认证已过期，需要重新登录');
            setAuthError({ status: true, reason: 'unauthorized' });
          },
        });

        if (response?.data) {
          console.log('✅ 用户信息获取成功:', response.data);

          const userData: CollaborationUser = {
            id: response.data.id.toString(),
            name: response.data.name,
            color: getCursorColorByUserId(response.data.id.toString()),
            avatar: response.data.avatar_url,
          };

          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('❌ 获取用户信息异常:', error);
        setAuthError({ status: true, reason: 'user-fetch-failed' });
      }
    };

    fetchCurrentUser();
  }, [isMounted, authToken]);

  // 初始化协作服务器连接
  useEffect(() => {
    if (!isMounted || !doc || isOffline || !authToken || !roomId || !isInitialContentSet) return;

    // 输出调试信息
    const debugInfo = debugCollaborativeConnection();

    if (!debugInfo.hasRequiredConfig) {
      console.error('❌ 协作连接配置不完整，无法建立连接');
      setAuthError({ status: true, reason: 'config-incomplete' });

      return;
    }

    // 检查WebSocket URL配置，支持多种格式
    let websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!websocketUrl) {
      console.error('❌ NEXT_PUBLIC_WEBSOCKET_URL 环境变量未配置');
      setAuthError({ status: true, reason: 'websocket-url-missing' });

      return;
    }

    // 如果使用127.0.0.1，尝试转换为localhost
    if (websocketUrl.includes('127.0.0.1')) {
      const localhostUrl = websocketUrl.replace('127.0.0.1', 'localhost');

      console.log('🔄 尝试使用localhost代替127.0.0.1:', localhostUrl);
      websocketUrl = localhostUrl;
    }

    console.log('🔗 初始化协作服务器连接...', {
      roomId,
      authToken: !!authToken,
      websocketUrl,
      documentId: roomId,
      originalUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    });

    const hocuspocusProvider = new HocuspocusProvider({
      url: websocketUrl,
      name: roomId,
      document: doc,
      token: authToken,

      onConnect: () => {
        console.log('🔗 已连接到协作服务器');
        setConnectionStatus('syncing');
        setSyncProgress({ synced: false, loading: true });
        setAuthError({ status: false, reason: '' }); // 清除之前的错误

        // 设置用户awareness信息
        queueMicrotask(() => {
          const user = currentUserRef.current;

          if (user && hocuspocusProvider.awareness) {
            hocuspocusProvider.awareness.setLocalStateField('user', user);
            console.log('👤 设置用户awareness信息:', user.name);
          }
        });
      },

      onDisconnect: (data: any) => {
        console.log('🔌 与协作服务器断开连接', data);
        setConnectionStatus('disconnected');
        setSyncProgress({ synced: false, loading: false });
        setIsServerSynced(false);

        // 尝试重连（如果不是离线状态）
        if (!isOffline) {
          console.log('🔄 5秒后尝试重连...');
          setTimeout(() => {
            if (hocuspocusProvider && connectionStatus !== 'connected') {
              console.log('🔄 执行重连尝试...');
              hocuspocusProvider.connect();
            }
          }, 5000);
        }
      },

      onClose: (data: any) => {
        console.log('🔌 协作服务器连接已关闭', data);
        setConnectionStatus('disconnected');
        setSyncProgress({ synced: false, loading: false });
        setIsServerSynced(false);
      },

      onAuthenticationFailed: (data) => {
        console.error('❌ 协作服务器认证失败:', data);
        console.error('📋 完整错误信息:', JSON.stringify(data, null, 2));
        setConnectionStatus('error');
        setSyncProgress({ synced: false, loading: false });

        let reason = 'permission-denied';

        if (data.reason) {
          console.log('📋 认证失败原因:', data.reason);

          if (data.reason.includes('FOLDER') || data.reason.includes('file')) {
            reason = 'folder-not-editable';
          } else if (data.reason.includes('权限') || data.reason.includes('permission')) {
            reason = 'no-edit-permission';
          } else {
            reason = data.reason;
          }
        }

        setAuthError({
          status: true,
          reason: reason,
        });
      },

      onSynced: () => {
        console.log('✅ 文档已与服务器同步');
        setConnectionStatus('connected');
        setSyncProgress({ synced: true, loading: false });
        setIsServerSynced(true);

        // 清除离线编辑标记
        queueMicrotask(() => {
          hasUnsyncedChangesRef.current = false;
          localStorage.removeItem(`offline-edits-${roomId}`);
        });
      },

      onDestroy: () => {
        console.log('🗑️ 协作服务器连接已销毁');
        setConnectionStatus('disconnected');
        setSyncProgress({ synced: false, loading: false });
      },
    });

    setProvider(hocuspocusProvider);

    // 页面卸载时清理
    const handleBeforeUnload = () => {
      if (hocuspocusProvider && hocuspocusProvider.awareness) {
        console.log('🚪 用户离开页面，清除awareness信息');
        hocuspocusProvider.awareness.setLocalStateField('user', null);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (hocuspocusProvider && hocuspocusProvider.awareness) {
        console.log('🧹 组件卸载，清除用户信息');
        hocuspocusProvider.awareness.setLocalStateField('user', null);
      }

      hocuspocusProvider.destroy();
    };
  }, [isMounted, roomId, doc, isOffline, authToken, isInitialContentSet]);

  // awareness监听器 - 使用简化的依赖管理
  useEffect(() => {
    if (!provider?.awareness) return;

    const handleAwarenessUpdate = () => {
      if (!provider?.awareness) return;

      const states = provider.awareness.getStates();
      const users: CollaborationUser[] = [];
      const currentUser = currentUserRef.current;

      states.forEach((state, clientId) => {
        if (state && state.user) {
          const userData = state.user;
          const userId = userData.id || clientId.toString();

          // 排除当前用户
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

      // 直接设置用户列表，不用复杂的比较逻辑
      setConnectedUsers(users);

      if (users.length > 0) {
        console.log(
          '👥 协作用户更新:',
          users.map((u) => u.name),
        );
      }
    };

    console.log('📡 注册awareness监听器');
    provider.awareness.on('update', handleAwarenessUpdate);

    return () => {
      console.log('🧹 清理awareness监听器');

      if (provider.awareness) {
        provider.awareness.off('update', handleAwarenessUpdate);
      }
    };
  }, [provider]); // 只依赖provider

  // 当currentUser更新时，设置awareness信息
  useEffect(() => {
    if (!provider?.awareness || !currentUser) return;

    console.log('👤 更新用户awareness信息:', currentUser.name);
    provider.awareness.setLocalStateField('user', currentUser);
  }, [provider, currentUser]);

  // 创建编辑器实例 - 使用memo优化
  const editor = useEditor(
    {
      extensions: [
        ...ExtensionKit({ provider, onCommentActivated }),
        // Y.js协作扩展
        ...(doc
          ? [
              Collaboration.configure({
                document: doc,
                field: 'content',
              }),
            ]
          : []),
        // 协作光标扩展
        ...(provider && !isOffline && currentUser && doc
          ? [
              CollaborationCursor.configure({
                provider,
                user: currentUser,
              }),
            ]
          : []),
      ],
      // 编辑器初始为空，让Y.js处理内容同步
      content: '',
      onCreate: () => {
        console.log('📝 编辑器实例创建成功');
      },
      onTransaction: ({ editor }) => {
        setIsEditable(editor.isEditable);
      },
      onSelectionUpdate: ({ editor }) => {
        // 处理全选状态的特殊样式
        const { from, to } = editor.state.selection;
        const isAllSelected = from === 0 && to === editor.state.doc.content.size;
        const editorElement = document.querySelector('.ProseMirror');

        if (editorElement) {
          if (isAllSelected) {
            editorElement.classList.add('is-all-selected');
            setTimeout(() => {
              const activeMarks: string[] = [];
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

  // 设置初始内容到Y.js文档 - 保守策略
  useEffect(() => {
    if (!editor || !doc || !initialContent || !isLocalLoaded) return;

    try {
      // 检查Y.js文档是否为空（第一次加载）
      const fragment = doc.getXmlFragment('content');

      // 更安全的空文档检查
      const isEmpty =
        fragment.length === 0 ||
        (fragment.length === 1 && fragment.get(0)?.toString().trim() === '');

      // 只在文档为空且编辑器内容也为空时设置初始内容
      if (isEmpty && editor.state.doc.content.size <= 2) {
        console.log('📄 Y.js文档为空，设置API初始内容');

        // 延迟设置，确保编辑器完全初始化
        queueMicrotask(() => {
          try {
            if (editor && !editor.isDestroyed) {
              editor.commands.setContent(initialContent);
              console.log('✅ API初始内容已设置到Y.js文档');
            }
          } catch (error) {
            console.error('❌ 设置初始内容失败:', error);
            // 尝试备用方法

            try {
              if (editor && !editor.isDestroyed) {
                editor.chain().clearContent().insertContent(initialContent).run();
                console.log('✅ 使用备用方法设置初始内容成功');
              }
            } catch (backupError) {
              console.error('❌ 备用方法也失败:', backupError);
            }
          }
        });
      } else {
        console.log('📄 Y.js文档已有内容，跳过初始内容设置');
        console.log('Fragment length:', fragment.length);
        console.log('Editor doc size:', editor.state.doc.content.size);
      }
    } catch (error) {
      console.error('❌ 检查Y.js文档状态失败:', error);
    }
  }, [editor, doc, initialContent, isLocalLoaded]);

  // 计算整体加载状态
  const isFullyLoaded = isLocalLoaded && (isOffline || isServerSynced) && isInitialContentSet;

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
