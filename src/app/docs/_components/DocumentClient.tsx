'use client';

import { useRef, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';

import NoPermissionView from './no_permission_view';

import DocumentHeader from '@/app/docs/_components/DocumentHeader';
import { TableOfContents } from '@/app/docs/_components/TableOfContents';
import { useSidebar } from '@/stores/sidebarStore';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { useCollaborativeEditor } from '@/hooks/useCollaborativeEditor';
// 直接静态导入所有菜单组件
import { ContentItemMenu } from '@/components/menus/ContentItemMenu';
import { LinkMenu } from '@/components/menus';
import { TextMenu } from '@/components/menus/TextMenu';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableRowMenu, TableColumnMenu } from '@/extensions/Table/menus';

interface DocumentClientProps {
  documentId: string;
  initialContent: JSONContent;
  enableCollaboration?: boolean;
  isOffline?: boolean;
}

export function DocumentClient({
  documentId,
  initialContent,
  enableCollaboration = false,
  isOffline = false,
}: DocumentClientProps) {
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const sidebar = useSidebar();

  const [isTocOpen, setIsTocOpen] = useState(false);

  // 目录切换函数
  const toggleToc = () => {
    setIsTocOpen(!isTocOpen);
  };

  // 根据模式选择使用哪个编辑器，避免重复初始化
  const collaborativeEditor = useCollaborativeEditor(
    enableCollaboration ? documentId : '',
    enableCollaboration ? initialContent : undefined,
    isOffline,
  );

  const documentEditor = useDocumentEditor({
    documentId: enableCollaboration ? '' : documentId, // 如果启用协作模式就不初始化单机编辑器
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
  const isReady = enableCollaboration
    ? collaborativeEditor.editor && collaborativeEditor.isFullyLoaded
    : documentEditor.editor && !documentEditor.loading;

  // 获取当前编辑器实例
  const currentEditor = enableCollaboration ? collaborativeEditor.editor : documentEditor.editor;

  return (
    <div
      className="h-screen flex flex-col bg-white dark:bg-gray-900"
      ref={menuContainerRef}
      suppressHydrationWarning
    >
      {/* Header */}
      <DocumentHeader
        editor={isReady ? currentEditor : null}
        isSidebarOpen={sidebar.isOpen}
        toggleSidebar={sidebar.toggle}
        isTocOpen={isTocOpen}
        toggleToc={toggleToc}
        provider={enableCollaboration ? collaborativeEditor.provider : undefined}
        connectedUsers={enableCollaboration ? collaborativeEditor.connectedUsers : undefined}
        currentUser={enableCollaboration ? collaborativeEditor.currentUser : undefined}
        connectionStatus={enableCollaboration ? collaborativeEditor.connectionStatus : undefined}
        isOffline={isOffline}
      />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <div className="h-full overflow-y-auto">
            {isReady ? (
              /* 编辑器就绪 */
              <EditorContent editor={currentEditor} className="prose-container h-full pl-14" />
            ) : (
              /* 编辑器加载状态 */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">正在初始化编辑器...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">请稍候片刻</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 目录侧边栏 */}
        {isTocOpen && isReady && (
          <div className="w-80 border-l border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
            <TableOfContents isOpen={isTocOpen} editor={currentEditor} />
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
