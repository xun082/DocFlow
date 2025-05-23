'use client';

import { useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { useParams } from 'next/navigation';

import { LinkMenu } from '@/components/menus';
import { TableOfContents } from '@/components/layout/toc';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { TextMenu } from '@/components/menus/TextMenu';
import { ContentItemMenu } from '@/components/menus/ContentItemMenu';
import { Header } from '@/components/layout/Header';
import { useSidebar } from '@/hooks/useSidebar';
import { useCollaborativeEditor } from '@/hooks/useCollaborativeEditor';
import NoPermissionView from '@/app/docs/[room]/_components/no_permission_view';

export default function Document() {
  const params = useParams();

  // 检查params是否存在并提取roomId
  if (!params || !params.room) {
    return (
      <div className="flex items-center justify-center h-screen" suppressHydrationWarning>
        <div className="text-center">
          <p className="text-red-500">无效的房间ID</p>
        </div>
      </div>
    );
  }

  const roomId = params.room as string;
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const sidebar = useSidebar();

  const { editor, isEditable, connectionStatus, provider, isOffline, isMounted, authError } =
    useCollaborativeEditor(roomId);

  // 处理加载状态
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen" suppressHydrationWarning>
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // 处理权限错误
  if (authError.status) {
    return <NoPermissionView reason={authError.reason} />;
  }

  if (!editor || (!provider && !isOffline) || (connectionStatus !== 'connected' && !isOffline)) {
    return (
      <div className="flex items-center justify-center h-screen" suppressHydrationWarning>
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p>
            {isOffline
              ? '离线模式加载中...'
              : connectionStatus === 'connected'
                ? '加载编辑器中...'
                : '连接协作服务器中...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            状态: {isOffline ? '离线编辑' : connectionStatus}
          </p>
        </div>
      </div>
    );
  }

  // 渲染编辑器
  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      suppressHydrationWarning
      ref={menuContainerRef}
    >
      <Header
        editor={editor}
        isSidebarOpen={sidebar.isOpen}
        toggleSidebar={sidebar.toggle}
        provider={provider || undefined}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto relative">
          {isMounted && editor && <EditorContent editor={editor} className="h-full" />}
        </div>

        {sidebar.isOpen && (
          <div className="w-64 border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto">
            <TableOfContents isOpen={true} onClose={sidebar.close} editor={editor} />
          </div>
        )}
      </div>

      {editor && (
        <>
          <ContentItemMenu editor={editor} isEditable={isEditable} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} />
          <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
          <TableRowMenu editor={editor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
          <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
        </>
      )}
    </div>
  );
}
