'use client';

import { useRef, useEffect, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import dynamic from 'next/dynamic';

import NoPermissionView from './no_permission_view';

import DocumentHeader from '@/app/docs/_components/DocumentHeader';
import { TableOfContents } from '@/app/docs/_components/TableOfContents';
import { useSidebar } from '@/stores/sidebarStore';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { useCollaborativeEditor } from '@/hooks/useCollaborativeEditor';

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
  const sidebar = useSidebar();

  const [isClient, setIsClient] = useState(false);

  // 简单的客户端检测
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 选择使用哪个编辑器
  const collaborativeEditor = useCollaborativeEditor(
    enableCollaboration ? documentId : '',
    enableCollaboration ? initialContent : undefined,
  );

  const documentEditor = useDocumentEditor({
    documentId,
    initialContent: enableCollaboration ? undefined : initialContent,
    isEditable: true,
  });

  // 处理权限错误
  if (enableCollaboration && collaborativeEditor.authError?.status) {
    return <NoPermissionView reason={collaborativeEditor.authError.reason} />;
  }

  // 处理加载错误 - 分别处理两种编辑器的错误
  const hasError = enableCollaboration
    ? collaborativeEditor.authError?.status
    : documentEditor.error;

  const errorMessage = enableCollaboration
    ? collaborativeEditor.authError?.reason
    : documentEditor.error;

  if (hasError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            加载文档时出错
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
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

  // 编辑器是否就绪 - 分别处理两种编辑器的加载状态
  const isReady =
    isClient &&
    (enableCollaboration
      ? collaborativeEditor.editor && collaborativeEditor.isFullyLoaded
      : documentEditor.editor && !documentEditor.loading);

  // 获取当前编辑器实例
  const currentEditor = enableCollaboration ? collaborativeEditor.editor : documentEditor.editor;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900" ref={menuContainerRef}>
      {/* Header */}
      <DocumentHeader
        editor={isReady ? currentEditor : null}
        isSidebarOpen={sidebar.isOpen}
        toggleSidebar={sidebar.toggle}
        provider={enableCollaboration ? collaborativeEditor.provider : undefined}
        connectedUsers={enableCollaboration ? collaborativeEditor.connectedUsers : undefined}
        currentUser={enableCollaboration ? collaborativeEditor.currentUser : undefined}
        connectionStatus={enableCollaboration ? collaborativeEditor.connectionStatus : undefined}
        isOffline={enableCollaboration ? collaborativeEditor.isOffline : false}
      />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <div className="h-full overflow-y-auto">
            {isReady ? (
              /* 编辑器就绪 */
              <EditorContent editor={currentEditor} className="prose-container h-full pl-14" />
            ) : (
              /* 显示 SSR 内容或加载状态 */
              <div className="max-w-4xl mx-auto px-8 py-12">
                {initialHTML ? (
                  <div
                    className="prose prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: initialHTML }}
                  />
                ) : (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                      <p className="text-lg">正在加载编辑器...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 侧边栏 */}
        {sidebar.isOpen && isReady && (
          <div className="w-64 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
            <TableOfContents isOpen={true} onClose={sidebar.close} editor={currentEditor} />
          </div>
        )}
      </div>

      {/* 编辑器菜单 */}
      {isReady && (
        <>
          <ContentItemMenu editor={currentEditor} />
          <LinkMenu editor={currentEditor} appendTo={menuContainerRef} />
          <TextMenu editor={currentEditor} />
          <ColumnsMenu editor={currentEditor} appendTo={menuContainerRef} />
          <TableRowMenu editor={currentEditor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={currentEditor} appendTo={menuContainerRef} />
          <ImageBlockMenu editor={currentEditor} appendTo={menuContainerRef} />
        </>
      )}
    </div>
  );
}

export default DocumentClient;
