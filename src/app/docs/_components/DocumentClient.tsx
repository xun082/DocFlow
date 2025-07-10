'use client';

import { useRef, useEffect, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import dynamic from 'next/dynamic';

import { DocumentHeader } from '@/app/docs/_components/DocumentHeader';
import { TableOfContents } from '@/app/docs/_components/TableOfContents';
import NoPermissionView from '@/app/docs/room/_components/no_permission_view';
import { useSidebar } from '@/stores/sidebarStore';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { useCollaborativeEditor } from '@/hooks/useCollaborativeEditor';

// 动态导入菜单组件
const ContentItemMenu = dynamic(
  () =>
    import('@/components/menus/ContentItemMenu').then((mod) => ({ default: mod.ContentItemMenu })),
  { ssr: false },
);

const LinkMenu = dynamic(
  () => import('@/components/menus').then((mod) => ({ default: mod.LinkMenu })),
  { ssr: false },
);

const TextMenu = dynamic(
  () => import('@/components/menus/TextMenu').then((mod) => ({ default: mod.TextMenu })),
  { ssr: false },
);

const ImageBlockMenu = dynamic(
  () =>
    import('@/extensions/ImageBlock/components/ImageBlockMenu').then((mod) => ({
      default: mod.default,
    })),
  { ssr: false },
);

const ColumnsMenu = dynamic(
  () => import('@/extensions/MultiColumn/menus').then((mod) => ({ default: mod.ColumnsMenu })),
  { ssr: false },
);

const TableRowMenu = dynamic(
  () => import('@/extensions/Table/menus').then((mod) => ({ default: mod.TableRowMenu })),
  { ssr: false },
);

const TableColumnMenu = dynamic(
  () => import('@/extensions/Table/menus').then((mod) => ({ default: mod.TableColumnMenu })),
  { ssr: false },
);

interface DocumentClientProps {
  documentId: string;
  initialContent: JSONContent;
  initialHTML: string;
  enableCollaboration?: boolean;
}

export function DocumentClient({
  documentId,
  initialContent,
  initialHTML,
  enableCollaboration = false,
}: DocumentClientProps) {
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const sidebar = useSidebar();

  const [isClient, setIsClient] = useState(false);
  const [showSSRContent, setShowSSRContent] = useState(true);
  const [menuContainer, setMenuContainer] = useState<HTMLElement | null>(null);

  // 客户端挂载检测
  useEffect(() => {
    setIsClient(true);
    // 不要立即隐藏SSR内容，等编辑器就绪后再切换
  }, []);

  // 设置菜单容器
  useEffect(() => {
    if (menuContainerRef.current) {
      setMenuContainer(menuContainerRef.current);
    }
  }, [isClient]);

  // 有条件地初始化编辑器hook
  const collaborativeEditor = useCollaborativeEditor(
    enableCollaboration && isClient ? documentId : '', // 只有客户端挂载且启用协作时才初始化
    enableCollaboration ? initialContent : undefined, // 传递初始内容给协作编辑器
  );

  const documentEditor = useDocumentEditor({
    documentId,
    initialContent: enableCollaboration ? undefined : initialContent,
    isEditable: true,
  });

  // 选择使用哪个编辑器的状态
  const editorState = enableCollaboration
    ? {
        editor: collaborativeEditor.editor,
        isEditable: collaborativeEditor.isEditable,
        loading: !collaborativeEditor.isFullyLoaded,
        error: collaborativeEditor.authError.status ? collaborativeEditor.authError.reason : null,
        isMounted: collaborativeEditor.isMounted,
        connectionStatus: collaborativeEditor.connectionStatus,
        provider: collaborativeEditor.provider,
        isOffline: collaborativeEditor.isOffline,
        authError: collaborativeEditor.authError,
        isFullyLoaded: collaborativeEditor.isFullyLoaded,
        isLocalLoaded: collaborativeEditor.isLocalLoaded,
        isServerSynced: collaborativeEditor.isServerSynced,
        connectedUsers: collaborativeEditor.connectedUsers,
      }
    : {
        editor: documentEditor.editor,
        isEditable: documentEditor.isEditable,
        loading: documentEditor.loading,
        error: documentEditor.error,
        isMounted: documentEditor.isMounted,
        connectionStatus: undefined,
        provider: undefined,
        isOffline: false,
        authError: { status: false, reason: '' },
        isFullyLoaded: !documentEditor.loading,
        isLocalLoaded: true,
        isServerSynced: true,
        connectedUsers: [],
      };

  // 当编辑器完全就绪时，隐藏SSR内容
  useEffect(() => {
    if (editorState.editor && editorState.isFullyLoaded && !editorState.loading) {
      setShowSSRContent(false);
    }
  }, [editorState.editor, editorState.isFullyLoaded, editorState.loading]);

  // 处理协作模式的权限错误
  if (enableCollaboration && editorState.authError.status) {
    return <NoPermissionView reason={editorState.authError.reason} />;
  }

  // 处理普通错误
  if (editorState.error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            加载文档时出错
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{editorState.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 编辑器就绪状态
  const isEditorReady = Boolean(
    isClient &&
      editorState.editor &&
      !editorState.loading &&
      !editorState.error &&
      (enableCollaboration ? editorState.isFullyLoaded : true),
  );

  // 菜单就绪状态 - 需要编辑器就绪和菜单容器存在
  const isMenuReady = isEditorReady && menuContainer && document.contains(menuContainer);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900" ref={menuContainerRef}>
      {/* Header */}
      <DocumentHeader
        editor={isEditorReady ? editorState.editor : null}
        isSidebarOpen={sidebar.isOpen}
        toggleSidebar={sidebar.toggle}
        provider={enableCollaboration ? editorState.provider : undefined}
        connectedUsers={enableCollaboration ? editorState.connectedUsers : undefined}
        currentUser={enableCollaboration ? collaborativeEditor.currentUser : undefined}
        connectionStatus={enableCollaboration ? editorState.connectionStatus : undefined}
        isOffline={enableCollaboration ? editorState.isOffline : false}
      />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          {/* 内容区域 */}
          <div className="h-full overflow-y-auto" ref={editorContainerRef}>
            {isEditorReady ? (
              /* 编辑器模式 */
              <EditorContent
                editor={editorState.editor}
                className="prose-container h-full focus:outline-none"
              />
            ) : showSSRContent ? (
              /* SSR静态内容显示模式 - 在编辑器就绪前显示 */
              <div className="max-w-4xl mx-auto px-8 py-12">
                <div
                  className="prose prose-lg max-w-none dark:prose-invert 
                    prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                    prose-p:text-gray-700 dark:prose-p:text-gray-300
                    prose-code:bg-gray-100 dark:prose-code:bg-gray-800
                    prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800"
                  dangerouslySetInnerHTML={{ __html: initialHTML }}
                />
              </div>
            ) : (
              /* 加载状态 - 当没有SSR内容且编辑器未就绪时 */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-lg">
                    {enableCollaboration ? '正在初始化协作编辑器...' : '正在加载编辑器...'}
                  </p>
                  {enableCollaboration && (
                    <div className="text-sm text-gray-500 mt-2">
                      <div className="flex justify-center space-x-4">
                        <span
                          className={editorState.isLocalLoaded ? 'text-green-500' : 'text-gray-400'}
                        >
                          {editorState.isLocalLoaded ? '✓' : '○'} 本地数据
                        </span>
                        {!editorState.isOffline && (
                          <span
                            className={
                              editorState.isServerSynced ? 'text-green-500' : 'text-gray-400'
                            }
                          >
                            {editorState.isServerSynced ? '✓' : '○'} 服务器同步
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 侧边栏 */}
        {sidebar.isOpen && isEditorReady && editorState.editor && (
          <div className="w-64 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
            <TableOfContents isOpen={true} onClose={sidebar.close} editor={editorState.editor} />
          </div>
        )}
      </div>

      {/* 协作模式的状态指示器 - 仅显示关键错误状态 */}
      {enableCollaboration && isEditorReady && (
        <>
          {/* 离线状态指示器 - 仅在移动端显示 */}
          {editorState.isOffline && (
            <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-50 md:hidden">
              📴 离线模式
            </div>
          )}

          {/* 连接错误状态指示器 */}
          {!editorState.isOffline && editorState.connectionStatus === 'error' && (
            <div className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-50">
              ❌ 连接失败
            </div>
          )}
        </>
      )}

      {/* 编辑器菜单 - 只在菜单和编辑器完全就绪时渲染 */}
      {isMenuReady && editorState.editor && (
        <>
          <ContentItemMenu editor={editorState.editor} isEditable={editorState.isEditable} />
          <LinkMenu editor={editorState.editor} appendTo={menuContainerRef} />
          <TextMenu editor={editorState.editor} documentId={documentId} />
          {enableCollaboration && (
            <>
              <ColumnsMenu editor={editorState.editor} appendTo={menuContainerRef} />
              <TableRowMenu editor={editorState.editor} appendTo={menuContainerRef} />
              <TableColumnMenu editor={editorState.editor} appendTo={menuContainerRef} />
              <ImageBlockMenu editor={editorState.editor} appendTo={menuContainerRef} />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default DocumentClient;
