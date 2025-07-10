'use client';

import { useRef, useEffect, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import dynamic from 'next/dynamic';

import { DocumentHeader } from '@/app/docs/_components/DocumentHeader';
import { TableOfContents } from '@/app/docs/_components/TableOfContents';
import { useSidebar } from '@/stores/sidebarStore';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';

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

interface DocumentClientProps {
  documentId: string;
  initialContent: JSONContent;
  initialHTML: string;
}

export function DocumentClient({ documentId, initialContent, initialHTML }: DocumentClientProps) {
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const sidebar = useSidebar();

  const [isClient, setIsClient] = useState(false);

  // 客户端挂载检测
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 获取编辑器 - 简化创建逻辑
  const { editor, isEditable, loading, error } = useDocumentEditor({
    documentId,
    initialContent,
    isEditable: true,
  });

  // 编辑器就绪状态 - 简化判断逻辑
  const isEditorReady = Boolean(isClient && editor && !loading && !error);

  // 错误处理
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            加载文档时出错
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900" ref={menuContainerRef}>
      {/* Header */}
      <DocumentHeader
        editor={isEditorReady ? editor : null}
        isSidebarOpen={sidebar.isOpen}
        toggleSidebar={sidebar.toggle}
        provider={undefined}
      />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          {/* 内容区域 */}
          <div className="h-full overflow-y-auto" ref={editorContainerRef}>
            {isEditorReady ? (
              /* 编辑器模式 */
              <EditorContent
                editor={editor}
                className="prose-container h-full focus:outline-none"
              />
            ) : (
              /* 静态内容显示模式 */
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
            )}
          </div>
        </div>

        {/* 侧边栏 */}
        {sidebar.isOpen && isEditorReady && editor && (
          <div className="w-64 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
            <TableOfContents isOpen={true} onClose={sidebar.close} editor={editor} />
          </div>
        )}
      </div>

      {/* 编辑器菜单 - 只在编辑器完全就绪时渲染 */}
      {isEditorReady && (
        <>
          <ContentItemMenu editor={editor} isEditable={isEditable} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} documentId={documentId} />
        </>
      )}
    </div>
  );
}

export default DocumentClient;
