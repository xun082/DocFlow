'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import * as Y from 'yjs';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';

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
import { ImageBlockMenu } from '@/components/menus';
// 类型定义
interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export default function DocumentPage() {
  const params = useParams();
  const documentId = params?.room as string;
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const sidebar = useSidebar();

  // 防止水合不匹配的强制客户端渲染
  const [isMounted, setIsMounted] = useState(false);

  // 基本状态
  const [isTocOpen, setIsTocOpen] = useState(false);

  // 协作编辑器状态
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);

  // Editor编辑器的容器元素
  const editorContainRef = useRef<HTMLDivElement>(null);

  // 目录切换函数
  const toggleToc = () => {
    setIsTocOpen(!isTocOpen);
  };

  // 初始化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDoc(new Y.Doc());
      setIsMounted(true);
    }
  }, []);

  // 获取当前用户信息
  useEffect(() => {
    if (!documentId || typeof window === 'undefined') return;

    try {
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
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }, [documentId]);

  // 本地持久化
  useEffect(() => {
    if (!documentId || !doc || typeof window === 'undefined') return;

    const persistence = new IndexeddbPersistence(`tiptap-collaborative-${documentId}`, doc);

    return () => {
      persistence.destroy();
    };
  }, [documentId, doc]);

  // 协作提供者
  useEffect(() => {
    if (!documentId || !doc) return;

    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!websocketUrl) {
      console.error('WebSocket URL 未配置');

      return;
    }

    const authToken = getAuthToken();
    const hocuspocusProvider = new HocuspocusProvider({
      url: websocketUrl,
      name: documentId,
      document: doc,
      token: authToken,
    });

    setProvider(hocuspocusProvider);

    return () => {
      hocuspocusProvider.destroy();
    };
  }, [documentId, doc]);

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
  const editor = useEditor(
    {
      extensions: [
        ...ExtensionKit({ provider }),
        ...(doc ? [Collaboration.configure({ document: doc, field: 'content' })] : []),
        ...(provider && currentUser && doc
          ? [CollaborationCaret.configure({ provider, user: currentUser })]
          : []),
      ],
      content: '<p>开始编写您的文档...</p>',
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
      shouldRerenderOnTransaction: false,
    },
    [doc, provider, currentUser],
  );

  if (!isMounted || !doc || !editor) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">正在初始化编辑器...</p>
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
        editor={editor}
        isSidebarOpen={sidebar.isOpen}
        toggleSidebar={sidebar.toggle}
        isTocOpen={isTocOpen}
        toggleToc={toggleToc}
        provider={provider}
        connectedUsers={connectedUsers}
        currentUser={currentUser}
      />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <div
            ref={editorContainRef}
            // onScroll={scrollLightHandler}
            className="h-full overflow-y-auto relative w-full"
          >
            <EditorContent editor={editor} className="prose-container h-full pl-14" />
          </div>
        </div>

        {/* 目录侧边栏 */}
        {isTocOpen && editor && (
          <div className="w-80 border-l border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
            <TableOfContents isOpen={isTocOpen} editor={editor} />
          </div>
        )}
      </div>

      {/* 编辑器菜单 */}
      {editor && (
        <>
          <ContentItemMenu editor={editor} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} />
          <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
          <TableRowMenu editor={editor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
          <ImageBlockMenu editor={editor}></ImageBlockMenu>
        </>
      )}
    </div>
  );
}
