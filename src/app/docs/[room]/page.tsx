'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import * as Y from 'yjs';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';

import { DocumentApi } from '@/services/document';
import { ExtensionKit } from '@/extensions/extension-kit';
import { getCursorColorByUserId } from '@/utils/cursor_color';
import { getAuthToken } from '@/utils/cookie';
import DocumentHeader from '@/app/docs/_components/DocumentHeader';
import { TableOfContents } from '@/app/docs/_components/TableOfContents';
import { useSidebar } from '@/stores/sidebarStore';
import { ContentItemMenu } from '@/components/menus/ContentItemMenu';
import { LinkMenu } from '@/components/menus';
import { TextMenu } from '@/components/menus/TextMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableRowMenu, TableColumnMenu } from '@/extensions/Table/menus';

// 类型定义
interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'syncing' | 'error';

export default function DocumentPage() {
  const params = useParams();
  const documentId = params?.room as string;
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const sidebar = useSidebar();

  // 文档加载状态
  const [loading, setLoading] = useState(true);
  const [initialContent, setInitialContent] = useState<JSONContent | null>(null);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);

  // 协作编辑器状态
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isServerSynced, setIsServerSynced] = useState(false);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const hasUnsyncedChangesRef = useRef(false);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // 目录切换函数
  const toggleToc = () => {
    setIsTocOpen(!isTocOpen);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDoc(new Y.Doc());
      setAuthToken(getAuthToken() as string);
      setIsClientReady(true);
    }
  }, []);

  // 获取文档内容 - 确保在客户端且有认证token后再请求
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);

        const result = await DocumentApi.GetDocumentContent(parseInt(documentId));

        if (result.data?.data) {
          const documentData = result.data.data as any;

          setInitialContent(documentData.content);

          if (typeof document !== 'undefined') {
            document.title = documentData.title;
          }
        }
      } catch (error) {
        console.error('文档加载失败:', error);
      } finally {
        setLoading(false);
      }
    };

    // 只在客户端发请求 - 避免服务端调用API
    if (typeof window !== 'undefined' && documentId && authToken && doc) {
      fetchDocument();
    }
  }, [documentId, authToken, doc]);

  // 从localStorage获取当前用户信息
  useEffect(() => {
    if (!authToken || !documentId || documentId === '' || typeof window === 'undefined') return;

    try {
      if (typeof window !== 'undefined') {
        // localStorage 只在浏览器中存在
        const userProfileStr = localStorage.getItem('user_profile');

        if (userProfileStr) {
          const userProfile = JSON.parse(userProfileStr);
          setCurrentUser({
            id: userProfile.id.toString(),
            name: userProfile.name,
            color: getCursorColorByUserId(userProfile.id.toString()),
            avatar: userProfile.avatar_url,
          });
        }
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }, [authToken, documentId]);

  // 本地持久化 - IndexedDB 只在浏览器中可用
  useEffect(() => {
    if (!documentId || !doc || typeof window === 'undefined') return;

    const persistence = new IndexeddbPersistence(`tiptap-collaborative-${documentId}`, doc);
    const localStorageKey = `offline-edits-${documentId}`;

    persistence.on('synced', () => {
      setIsLocalLoaded(true);

      if (localStorage.getItem(localStorageKey) === 'true') {
        hasUnsyncedChangesRef.current = true;
      }
    });

    const handleTransaction = () => {
      localStorage.setItem(localStorageKey, 'true');
      localStorage.setItem(`last-offline-edit-${documentId}`, new Date().toISOString());
      hasUnsyncedChangesRef.current = true;
    };

    persistence.on('afterTransaction', handleTransaction);
    doc.on('update', handleTransaction);

    return () => {
      persistence.destroy();
    };
  }, [documentId, doc]);

  // 协作提供者 - 等待编辑器就绪后再启动WebSocket连接
  useEffect(() => {
    if (!authToken || !documentId || !doc || !isEditorReady) return;

    // 如果已经有连接且参数相同，不重复创建
    if (providerRef.current && providerRef.current.configuration.name === documentId) {
      return;
    }

    // 清理旧连接
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }

    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!websocketUrl) {
      console.error('WebSocket URL 未配置');

      return;
    }

    // 额外延迟，确保编辑器完全稳定后再建立WebSocket连接
    const connectionTimer = setTimeout(() => {
      const clearOfflineEdits = () => {
        hasUnsyncedChangesRef.current = false;
        localStorage.removeItem(`offline-edits-${documentId}`);
      };

      const hocuspocusProvider = new HocuspocusProvider({
        url: websocketUrl,
        name: documentId,
        document: doc,
        token: authToken,

        onConnect: () => {
          setConnectionStatus('syncing');
        },

        onDisconnect: () => {
          setConnectionStatus('disconnected');
          setIsServerSynced(false);
        },

        onAuthenticationFailed: (data) => {
          console.error('协作服务器认证失败:', data);
          setConnectionStatus('error');
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
  }, [documentId, isEditorReady]); // 在roomId变化或编辑器就绪时创建连接

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
      ...(provider && currentUser && doc
        ? [CollaborationCaret.configure({ provider, user: currentUser })]
        : []),
    ],
    content: '',
    onSelectionUpdate: ({ editor }) => {
      // 延迟DOM操作，避免在渲染期间触发
      requestAnimationFrame(() => {
        const { from, to } = editor.state.selection;
        const isAllSelected = from === 0 && to === editor.state.doc.content.size;
        const editorElement = document.querySelector('.ProseMirror');

        if (editorElement) {
          editorElement.classList.toggle('is-all-selected', isAllSelected);
        }
      });
    },
    onCreate: () => {
      // 编辑器创建成功后延迟设置就绪状态
      setTimeout(() => {
        setIsEditorReady(true);
      }, 500); // 增加延迟，确保编辑器完全就绪
    },
    onUpdate: () => {
      // 防止在更新期间的意外状态变更
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
    shouldRerenderOnTransaction: false, // 避免每次事务都重新渲染
  });

  // 设置初始内容
  useEffect(() => {
    if (!editor || !initialContent || !isLocalLoaded) return;

    if (editor && !editor.isDestroyed) {
      // 使用 setTimeout 避免在渲染期间同步设置内容
      setTimeout(() => {
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(initialContent);
        }
      }, 0);
    }
  }, [editor, initialContent, isLocalLoaded]);

  const isFullyLoaded = isLocalLoaded && isServerSynced;
  const isReady = editor && isFullyLoaded && !loading && doc;

  if (!isClientReady || loading || !doc) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {!isClientReady ? '正在初始化...' : '正在加载文档编辑器...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col bg-white dark:bg-gray-900"
      ref={menuContainerRef}
      suppressHydrationWarning
    >
      {/* Header */}
      <DocumentHeader
        editor={isReady ? editor : null}
        isSidebarOpen={sidebar.isOpen}
        toggleSidebar={sidebar.toggle}
        isTocOpen={isTocOpen}
        toggleToc={toggleToc}
        provider={provider}
        connectedUsers={connectedUsers}
        currentUser={currentUser}
        connectionStatus={connectionStatus}
        isOffline={false}
      />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <div className="h-full overflow-y-auto">
            {isReady ? (
              <EditorContent editor={editor} className="prose-container h-full pl-14" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">正在初始化编辑器...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 目录侧边栏 */}
        {isTocOpen && isReady && (
          <div className="w-80 border-l border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
            <TableOfContents isOpen={isTocOpen} editor={editor} />
          </div>
        )}
      </div>

      {/* 编辑器菜单 */}
      {isReady && isEditorReady && (
        <>
          <ContentItemMenu editor={editor} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} />
          <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
          <TableRowMenu editor={editor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        </>
      )}
    </div>
  );
}
