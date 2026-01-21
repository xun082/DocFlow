'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import * as Y from 'yjs';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Eye } from 'lucide-react';
import dynamic from 'next/dynamic';

// 动态导入 CommentPanel，禁用 SSR
const CommentPanel = dynamic(
  () =>
    import('@/app/docs/_components/CommentPanel').then((mod) => ({ default: mod.CommentPanel })),
  {
    ssr: false,
    loading: () => null,
  },
);
import { ExtensionKit } from '@/extensions/extension-kit';
import { getCursorColorByUserId, getAuthToken } from '@/utils';
import DocumentHeader from '@/app/docs/_components/DocumentHeader';
import { FloatingToc } from '@/app/docs/_components/FloatingToc';
import { SearchPanel } from '@/app/docs/_components/SearchPanel';
import { useFileStore } from '@/stores/fileStore';
import type { FileItem } from '@/types/file-system';
import { ContentItemMenu } from '@/components/menus/ContentItemMenu';
import { LinkMenu } from '@/components/menus';
import { TextMenu } from '@/components/menus/TextMenu';
import { TableRowMenu, TableColumnMenu, TableMenu, TableCellMenu } from '@/extensions/Table/menus';
import { ImageBlockMenu } from '@/components/menus';
import DocumentApi from '@/services/document';
import NoPermission from '@/app/docs/_components/NoPermission';
import { DocumentPermissionData } from '@/services/document/type';
import { useCommentStore } from '@/stores/commentStore';
import { useEditorStore } from '@/stores/editorStore';
import { useEditorHistory } from '@/hooks/useEditorHistory';

// 类型定义
interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export default function DocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = params?.room as string;
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // 获取URL参数中的只读模式设置
  const forceReadOnly = searchParams?.get('readonly') === 'true';

  const { documentGroups } = useFileStore();

  // 防止水合不匹配的强制客户端渲染
  const [isMounted, setIsMounted] = useState(false);

  // 权限相关状态
  const [permissionData, setPermissionData] = useState<DocumentPermissionData | null>(null);
  const [isLoadingPermission, setIsLoadingPermission] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // 协作编辑器状态
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const [isIndexedDBReady, setIsIndexedDBReady] = useState(false);
  const { openPanel, setActiveCommentId, closePanel, isPanelOpen } = useCommentStore();
  const { setEditor, clearEditor } = useEditorStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEditorHistory({
    documentId,
    doc,
    autoSnapshot: true,
    autoSnapshotInterval: 300000,
    snapshotOnUnmount: true,
  });

  // Editor编辑器的容器元素
  const editorContainRef = useRef<HTMLDivElement>(null);

  // 获取当前文档的名称
  const getCurrentDocumentName = () => {
    if (!documentId || documentGroups.length === 0) return null;

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

    // 在所有分组中查找
    for (const group of documentGroups) {
      const currentFile = findFileById(group.files, documentId);

      if (currentFile) {
        return currentFile.name;
      }
    }

    return null;
  };

  // 获取权限并初始化
  useEffect(() => {
    if (!documentId || typeof window === 'undefined') return;

    async function init() {
      setIsLoadingPermission(true);
      setPermissionError(null);

      const { data, error } = await DocumentApi.GetDocumentPermissions(Number(documentId));

      if (error) {
        setPermissionError(error);
        setIsLoadingPermission(false);

        return;
      }

      if (!data?.data) {
        setPermissionError('无法获取文档权限信息');
        setIsLoadingPermission(false);

        return;
      }

      const permData = data.data;
      setPermissionData(permData);
      setIsLoadingPermission(false);

      // 无权限时不初始化编辑器
      if (permData.permission === 'NONE') {
        setIsMounted(true);

        return;
      }

      // 初始化编辑器和用户信息
      setDoc(new Y.Doc());
      setCurrentUser({
        id: permData.userId.toString(),
        name: permData.username,
        color: getCursorColorByUserId(permData.userId.toString()),
        avatar: permData.avatar,
      });
      setIsMounted(true);
    }

    init();
  }, [documentId]);

  // 本地持久化
  useEffect(() => {
    if (!documentId || !doc || typeof window === 'undefined' || !permissionData) return;

    setIsIndexedDBReady(false);

    const persistence = new IndexeddbPersistence(`tiptap-collaborative-${documentId}`, doc);

    // 等待 IndexedDB 加载完成
    persistence.on('synced', () => {
      setIsIndexedDBReady(true);
    });

    return () => {
      persistence.destroy();
    };
  }, [documentId, doc, permissionData]);

  // 协作提供者
  useEffect(() => {
    if (!documentId || !doc || !permissionData) return;

    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!websocketUrl) {
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
  const isReadOnly = forceReadOnly || permissionData?.permission === 'VIEW';

  // 搜索快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + F 打开搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      // ESC 关闭搜索
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // 创建编辑器 - 只有在 IndexedDB 准备好之后才创建
  const editor = useEditor(
    {
      extensions: [
        ...ExtensionKit({
          provider,
          commentCallbacks: {
            onCommentActivated: (commentId) => {
              // 使用 setTimeout 确保在下一个事件循环中更新状态，避免渲染期间更新
              setTimeout(() => {
                setActiveCommentId(commentId);

                if (commentId) {
                  openPanel();
                }
              }, 0);
            },
            onCommentClick: (commentId) => {
              setTimeout(() => {
                setActiveCommentId(commentId);
                openPanel();
              }, 0);
            },
          },
        }),
        ...(doc && isIndexedDBReady
          ? [Collaboration.configure({ document: doc, field: 'content' })]
          : []),
        ...(provider && currentUser && doc && isIndexedDBReady
          ? [CollaborationCaret.configure({ provider, user: currentUser })]
          : []),
      ],
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
      onCreate: ({ editor }) => {
        // 编辑器创建后，将实例存储到store中
        if (editor && documentId) {
          setEditor(editor, documentId);
        }
      },
      onDestroy: () => {
        // 编辑器销毁时，清除store中的实例
        clearEditor();
      },
    },
    [doc, provider, currentUser, isReadOnly, isIndexedDBReady, documentId, setEditor, clearEditor],
  );

  // 点击编辑器内容时关闭评论面板（除非点击评论标记）
  useEffect(() => {
    if (!editor || !isPanelOpen) return;

    const handleEditorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isCommentMark = target.closest('span[data-comment="true"]');

      // 如果点击的不是评论标记，则关闭面板
      if (!isCommentMark) {
        closePanel();
      }
    };

    const editorElement = editor.view.dom;

    // 确保元素仍然存在于DOM中
    if (editorElement && document.body.contains(editorElement)) {
      editorElement.addEventListener('click', handleEditorClick);

      return () => {
        // 再次检查元素是否仍然存在于DOM中
        if (editorElement && document.body.contains(editorElement)) {
          editorElement.removeEventListener('click', handleEditorClick);
        }
      };
    }
  }, [editor, isPanelOpen, closePanel]);

  // Ctrl+C 复制选中文本为 JSON 格式
  useEffect(() => {
    if (!editor) return;

    const handleCopy = (e: ClipboardEvent) => {
      // 1. 检查是否有选区
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      try {
        // 2. 获取数据
        const json = editor.getJSON();
        const jsonString = JSON.stringify(json);

        // 3. 关键修复：使用 e.clipboardData 而不是 navigator.clipboard
        // 这样可以避免异步权限问题和 'clipboard is not defined' 错误
        if (e.clipboardData) {
          e.clipboardData.setData('text/json', jsonString);
          e.preventDefault(); // 只有成功设置数据后才阻止默认行为
        }
      } catch (error) {
        console.error('复制失败:', error);
      }
    };

    document.addEventListener('copy', handleCopy);

    return () => document.removeEventListener('copy', handleCopy);
  }, [editor]);

  // 组件卸载时清理编辑器实例
  useEffect(() => {
    return () => {
      clearEditor();
    };
  }, [clearEditor]);

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
  if (!isMounted || !doc || !isIndexedDBReady || !editor) {
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
            {isMounted && doc && !isIndexedDBReady && '加载数据...'}
            {isMounted && doc && isIndexedDBReady && !editor && '初始化编辑器...'}
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
          <span className="text-sm font-medium">
            {forceReadOnly
              ? '只读模式 - 当前以只读模式查看文档'
              : '只读模式 - 您只能查看此文档，无法编辑'}
          </span>
        </div>
      )}

      {/* Header */}
      <DocumentHeader
        provider={provider}
        connectedUsers={connectedUsers}
        currentUser={currentUser}
        documentId={documentId}
        documentTitle={permissionData?.documentTitle ?? getCurrentDocumentName() ?? undefined}
        documentName={`文档 ${documentId}`}
        doc={doc}
      />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={editorContainRef}
            className="h-full overflow-y-auto overflow-x-hidden relative w-full"
          >
            <EditorContent editor={editor} className="prose-container h-full pl-14" />
          </div>
        </div>
      </div>

      {/* 右侧悬浮目录 - Notion 风格 */}
      {editor && (
        <>
          <FloatingToc editor={editor} />
          <CommentPanel editor={editor} documentId={documentId} currentUserId={currentUser?.id} />
        </>
      )}

      {/* 搜索面板 */}
      {editor && editor.view && (
        <SearchPanel editor={editor} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      )}

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
