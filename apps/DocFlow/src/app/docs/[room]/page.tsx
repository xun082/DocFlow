'use client';

import { useEffect, useState, useRef, Activity } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import * as Y from 'yjs';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Group, Panel, Separator } from 'react-resizable-panels';

// 动态导入 CommentPanel，禁用 SSR
const CommentPanel = dynamic(
  () =>
    import('@/app/docs/_components/CommentPanel').then((mod) => ({ default: mod.CommentPanel })),
  {
    ssr: false,
    loading: () => null,
  },
);

// 动态导入 ChatPanel，禁用 SSR
const ChatPanel = dynamic(
  () => import('@/app/docs/_components/ChatPanel').then((mod) => ({ default: mod.ChatPanel })),
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
import { storage, STORAGE_KEYS } from '@/utils/storage/local-storage';
import { useChatStore } from '@/stores/chatStore';

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
  const { isOpen: isChatOpen } = useChatStore();

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

  // Ctrl+C 复制选中文本为 JSON 格式，并添加文档引用元数据
  useEffect(() => {
    if (!editor) return;

    const handleCopy = (e: ClipboardEvent) => {
      // 1. 检查是否有选区
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      try {
        // 2. 获取选中的文本内容
        const selectedText = selection.toString();
        if (!selectedText) return;

        // 3. 获取编辑器 JSON 数据
        const json = editor.getJSON();
        const jsonString = JSON.stringify(json);

        // 4. 计算选中文本在编辑器中的行号（简化版本）
        const { from, to } = editor.state.selection;
        const doc = editor.state.doc;
        let startLine = 1;
        let endLine = 1;
        let pos = 0;

        doc.descendants((node) => {
          if (pos >= to) return false;

          if (node.isBlock) {
            if (pos < from) startLine++;
            if (pos < to) endLine++;
          }

          pos += node.nodeSize;

          return true;
        });

        // 5. 构建文档引用元数据
        const documentName = getCurrentDocumentName() || '未命名文档';
        const referenceData = {
          type: 'docflow-reference',
          fileName: documentName,
          startLine: Math.max(1, startLine - 1),
          endLine: Math.max(1, endLine - 1),
          content: selectedText,
          charCount: selectedText.length,
        };

        // 6. 使用 e.clipboardData 设置多种格式
        if (e.clipboardData) {
          // 设置纯文本（保持默认复制行为）
          e.clipboardData.setData('text/plain', selectedText);
          // 设置 JSON 格式（原有功能）
          e.clipboardData.setData('text/json', jsonString);
          // 设置文档引用元数据（新功能）
          e.clipboardData.setData('application/docflow-reference', JSON.stringify(referenceData));
          e.preventDefault();
        }
      } catch (error) {
        console.error('复制失败:', error);
      }
    };

    document.addEventListener('copy', handleCopy);

    return () => document.removeEventListener('copy', handleCopy);
  }, [editor]);

  // 自动插入模板内容
  useEffect(() => {
    if (!editor || !documentId || !isIndexedDBReady || isReadOnly) {
      return;
    }

    const templateContents = storage.get(STORAGE_KEYS.TEMPLATE_CONTENT) || {};
    const docIdString = String(documentId);
    const templateContent = templateContents[docIdString];

    if (templateContent) {
      const timer = setTimeout(() => {
        try {
          if (!editor || editor.isDestroyed) {
            return;
          }

          const currentContent = editor.getText().trim();

          if (currentContent.length > 0) {
            const updatedContents = { ...templateContents };
            delete updatedContents[docIdString];
            storage.set(STORAGE_KEYS.TEMPLATE_CONTENT, updatedContents);

            return;
          }

          if (!editor.commands.pasteMarkdown) {
            return;
          }

          editor.commands.clearContent();

          const result = editor.commands.pasteMarkdown(templateContent);

          if (result) {
            const updatedContents = { ...templateContents };
            delete updatedContents[docIdString];
            storage.set(STORAGE_KEYS.TEMPLATE_CONTENT, updatedContents);

            setTimeout(() => {
              editor.commands.focus('start');
            }, 100);
          }
        } catch {
          // 静默处理错误
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [editor, documentId, isIndexedDBReady, isReadOnly]);

  // 组件卸载时清理编辑器实例
  useEffect(() => {
    return () => {
      clearEditor();
    };
  }, [clearEditor]);

  // 可复用的加载状态组件
  const LoadingState = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div
      className="h-screen flex items-center justify-center bg-white dark:bg-gray-900"
      suppressHydrationWarning
    >
      <div className="text-center">
        <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2" suppressHydrationWarning>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  // 权限加载中
  if (isLoadingPermission) {
    return <LoadingState title="正在加载文档权限..." />;
  }

  // 权限错误或无权限访问
  if (permissionError || permissionData?.permission === 'NONE') {
    return (
      <NoPermission
        documentTitle={permissionData?.documentTitle}
        message={permissionError || '您没有访问此文档的权限。请联系文档所有者获取访问权限。'}
      />
    );
  }

  // 编辑器初始化中
  if (!isMounted || !doc || !isIndexedDBReady || !editor) {
    const getSubtitle = () => {
      if (!isMounted) return '等待挂载...';
      if (!doc) return '创建文档...';
      if (!isIndexedDBReady) return '加载数据...';
      if (!editor) return '初始化编辑器...';

      return '';
    };

    return <LoadingState title="正在初始化编辑器..." subtitle={getSubtitle()} />;
  }

  return (
    <div
      className="h-screen flex flex-col bg-white dark:bg-gray-900"
      ref={menuContainerRef}
      suppressHydrationWarning
    >
      {/* 只读模式提示条 - 使用 Activity 优化显示/隐藏性能 */}
      <Activity mode={isReadOnly ? 'visible' : 'hidden'}>
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            {forceReadOnly
              ? '只读模式 - 当前以只读模式查看文档'
              : '只读模式 - 您只能查看此文档，无法编辑'}
          </span>
        </div>
      </Activity>

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

      {/* 主内容区域 - 使用可调整大小的面板布局 */}
      <div className="flex flex-1 overflow-hidden">
        <Group orientation="horizontal" className="flex-1">
          {/* 编辑器面板 */}
          <Panel defaultSize={isChatOpen ? '65' : '100'} minSize="30">
            <div className="h-full relative overflow-hidden">
              <div
                ref={editorContainRef}
                className="h-full overflow-y-auto overflow-x-hidden relative w-full"
              >
                <EditorContent editor={editor} className="prose-container h-full pl-14" />
              </div>
            </div>
          </Panel>

          {/* 聊天面板分隔条 */}
          {isChatOpen && (
            <>
              <Separator className="w-1 bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors cursor-col-resize" />
              <Panel defaultSize="35" minSize="20" maxSize="60">
                <Activity mode={isChatOpen ? 'visible' : 'hidden'}>
                  <ChatPanel documentId={documentId} />
                </Activity>
              </Panel>
            </>
          )}
        </Group>
      </div>

      {/* 右侧悬浮目录和评论面板 - 使用 Activity 优化 Selective Hydration */}
      {editor && (
        <>
          <Activity>
            <FloatingToc editor={editor} />
          </Activity>
          <Activity>
            <CommentPanel editor={editor} documentId={documentId} currentUserId={currentUser?.id} />
          </Activity>
        </>
      )}

      {/* 搜索面板 */}
      {editor && editor.view && (
        <SearchPanel editor={editor} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      )}

      {/* 编辑器菜单 - 使用 Activity 在只读模式下隐藏而非卸载，提升模式切换性能 */}
      {editor && (
        <Activity mode={isReadOnly ? 'hidden' : 'visible'}>
          <ContentItemMenu editor={editor} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} />
          <TableRowMenu editor={editor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
          <TableMenu editor={editor} appendTo={menuContainerRef} />
          <TableCellMenu editor={editor} appendTo={menuContainerRef} />
          <ImageBlockMenu editor={editor} />
        </Activity>
      )}
    </div>
  );
}
