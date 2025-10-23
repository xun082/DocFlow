'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import * as Y from 'yjs';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Eye } from 'lucide-react';

import { ExtensionKit } from '@/extensions/extension-kit';
import { getCursorColorByUserId } from '@/utils/cursor_color';
import { getAuthToken } from '@/utils/cookie';
import DocumentHeader from '@/app/docs/_components/DocumentHeader';
import { TableOfContents } from '@/app/docs/_components/TableOfContents';
import { useSidebar } from '@/stores/sidebarStore';
import { useFileStore } from '@/stores/fileStore';
import { FileItem } from '@/app/docs/_components/DocumentSidebar/folder/type';
import { ContentItemMenu } from '@/components/menus/ContentItemMenu';
import { LinkMenu } from '@/components/menus';
import { TextMenu } from '@/components/menus/TextMenu';
import { TableRowMenu, TableColumnMenu, TableMenu, TableCellMenu } from '@/extensions/Table/menus';
import { ImageBlockMenu } from '@/components/menus';
import DocumentApi from '@/services/document';
import NoPermission from '@/app/docs/_components/NoPermission';
import { DocumentPermissionData } from '@/services/document/type';

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
  const { files } = useFileStore();

  // 防止水合不匹配的强制客户端渲染
  const [isMounted, setIsMounted] = useState(false);

  // 权限相关状态
  const [permissionData, setPermissionData] = useState<DocumentPermissionData | null>(null);
  const [isLoadingPermission, setIsLoadingPermission] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

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

  // 获取当前文档的名称
  const getCurrentDocumentName = () => {
    if (!documentId || !files.length) return null;

    // 递归查找文件的函数，支持嵌套文件夹
    const findFileById = (items: FileItem[], id: string): FileItem | null => {
      for (const item of items) {
        if (item.id === id) return item;

        if (item.children && item.children.length > 0) {
          const found = findFileById(item.children, id);
          if (found) return found;
        }
      }

      return null;
    };

    const currentFile = findFileById(files, documentId);

    return currentFile?.name || null;
  };

  // 获取文档权限
  useEffect(() => {
    if (!documentId) return;

    async function fetchPermission() {
      try {
        setIsLoadingPermission(true);
        setPermissionError(null);

        const response = await DocumentApi.GetDocumentPermissions(Number(documentId));

        // 检查响应是否有错误
        if (response?.error) {
          console.error('权限API返回错误:', response.error);
          setPermissionError(response.error);

          return;
        }

        // 检查响应数据
        if (response?.data?.data) {
          const permData = response.data.data as unknown as DocumentPermissionData;

          setPermissionData(permData);
        } else if (response?.data) {
          const permData = response.data as unknown as DocumentPermissionData;
          console.log('✅ 权限数据（直接）:', permData);
          console.log('📝 准备设置权限数据:', {
            documentId: permData.documentId,
            userId: permData.userId,
            permission: permData.permission,
            isOwner: permData.isOwner,
          });
          setPermissionData(permData);
        } else {
          setPermissionError('无法获取文档权限信息');
        }
      } catch {
        setPermissionError('获取文档权限失败，请稍后重试');
      } finally {
        setIsLoadingPermission(false);
      }
    }

    fetchPermission();
  }, [documentId]);

  // 初始化 - 只有在权限验证通过后才初始化
  useEffect(() => {
    if (typeof window !== 'undefined' && permissionData) {
      // 如果有permission字段，检查是否为NONE
      if (permissionData.permission && permissionData.permission === 'NONE') {
        setIsMounted(true);

        return;
      }

      // 如果permission字段不存在，但有isOwner或documentId，说明有权限
      if (permissionData.documentId || permissionData.isOwner !== undefined) {
        setDoc(new Y.Doc());
        setIsMounted(true);
      } else {
        console.warn('⚠️ 权限数据结构异常:', permissionData);
      }
    } else {
      console.log('⏳ 等待权限数据...', {
        hasWindow: typeof window !== 'undefined',
        hasPermissionData: !!permissionData,
      });
    }
  }, [permissionData]);

  // 获取当前用户信息
  useEffect(() => {
    if (!documentId || typeof window === 'undefined' || !permissionData) return;

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
  }, [documentId, permissionData]);

  // 本地持久化
  useEffect(() => {
    if (!documentId || !doc || typeof window === 'undefined' || !permissionData) return;

    const persistence = new IndexeddbPersistence(`tiptap-collaborative-${documentId}`, doc);

    return () => {
      persistence.destroy();
    };
  }, [documentId, doc, permissionData]);

  // 协作提供者
  useEffect(() => {
    if (!documentId || !doc || !permissionData) return;

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
  }, [documentId, doc, permissionData]);

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

  // 判断是否为只读模式
  const isReadOnly = permissionData?.permission === 'VIEW';

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
      editable: !isReadOnly,
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
    [doc, provider, currentUser, isReadOnly],
  );

  // 加载中状态
  if (isLoadingPermission) {
    return (
      <div
        className="h-screen flex items-center justify-center bg-white dark:bg-gray-900"
        suppressHydrationWarning
      >
        <div className="text-center">
          <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">正在加载文档权限...</p>
        </div>
      </div>
    );
  }

  // 权限错误状态
  if (permissionError) {
    return <NoPermission message={permissionError} />;
  }

  // 无权限访问 - 只在明确permission为NONE时才拒绝
  if (permissionData?.permission === 'NONE') {
    return (
      <NoPermission
        documentTitle={permissionData?.documentTitle}
        message="您没有访问此文档的权限。请联系文档所有者获取访问权限。"
      />
    );
  }

  // 编辑器未初始化（等待编辑器准备）
  if (!isMounted || !doc || !editor) {
    return (
      <div
        className="h-screen flex items-center justify-center bg-white dark:bg-gray-900"
        suppressHydrationWarning
      >
        <div className="text-center">
          <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">正在初始化编辑器...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2" suppressHydrationWarning>
            {!isMounted && '等待挂载...'}
            {isMounted && !doc && '创建文档...'}
            {isMounted && doc && !editor && '初始化编辑器...'}
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
      {/* 只读模式提示条 */}
      {isReadOnly && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">只读模式 - 您只能查看此文档，无法编辑</span>
        </div>
      )}

      {/* Header */}
      <DocumentHeader
        isSidebarOpen={sidebar.isOpen}
        toggleSidebar={sidebar.toggle}
        isTocOpen={isTocOpen}
        toggleToc={toggleToc}
        provider={provider}
        connectedUsers={connectedUsers}
        currentUser={currentUser}
        documentId={documentId}
        documentTitle={permissionData?.documentTitle ?? getCurrentDocumentName() ?? undefined}
        documentName={`文档 ${documentId}`}
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

      {/* 编辑器菜单 - 只读模式下不显示编辑菜单 */}
      {editor && !isReadOnly && (
        <>
          <ContentItemMenu editor={editor} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} />
          <TableRowMenu editor={editor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
          <TableMenu editor={editor} appendTo={menuContainerRef} />
          <TableCellMenu editor={editor} appendTo={menuContainerRef} />
          <ImageBlockMenu editor={editor} />
        </>
      )}
    </div>
  );
}
