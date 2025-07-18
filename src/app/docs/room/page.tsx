'use client';

import { useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { useParams } from 'next/navigation';

import { DocumentHeader } from '../_components/DocumentHeader';
import { TableOfContents } from '../_components/TableOfContents';
import NoPermissionView from '../room/_components/no_permission_view';

import { LinkMenu } from '@/components/menus';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { TextMenu } from '@/components/menus/TextMenu';
import { ContentItemMenu } from '@/components/menus/ContentItemMenu';
import { useSidebar } from '@/stores/sidebarStore';
import { useCollaborativeEditor } from '@/hooks/useCollaborativeEditor';

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

  const {
    editor,
    // isEditable,
    connectionStatus,
    provider,
    isOffline,
    isMounted,
    authError,
    isFullyLoaded,
    isLocalLoaded,
    isServerSynced,
    connectedUsers,
    currentUser,
  } = useCollaborativeEditor(roomId);

  // 处理初始加载状态
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen" suppressHydrationWarning>
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p>正在初始化...</p>
        </div>
      </div>
    );
  }

  // 处理权限错误
  if (authError.status) {
    return <NoPermissionView reason={authError.reason} />;
  }

  // 处理编辑器和内容加载状态
  if (!editor || !isFullyLoaded) {
    const getStatusText = () => {
      if (!editor) {
        return '创建编辑器中...';
      }

      if (isOffline) {
        return isLocalLoaded ? '离线模式就绪' : '加载本地数据...';
      }

      if (!isLocalLoaded) {
        return '加载本地数据...';
      }

      if (!isServerSynced) {
        switch (connectionStatus) {
          case 'connecting':
            return '连接协作服务器...';
          case 'syncing':
            return '同步文档内容...';
          case 'disconnected':
            return '连接已断开';
          case 'error':
            return '连接出错';
          default:
            return '准备协作环境...';
        }
      }

      return '准备就绪...';
    };

    const getStatusColor = () => {
      if (connectionStatus === 'error') return 'text-red-500';
      if (connectionStatus === 'disconnected') return 'text-yellow-500';

      return 'text-blue-500';
    };

    return (
      <div className="flex items-center justify-center h-screen" suppressHydrationWarning>
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="mb-2">{getStatusText()}</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>
              状态:{' '}
              <span className={getStatusColor()}>{isOffline ? '离线模式' : connectionStatus}</span>
            </p>
            {connectedUsers.length > 0 && (
              <p>协作用户: {connectedUsers.map((u) => u.name).join(', ')}</p>
            )}
            <div className="flex justify-center space-x-4 mt-2">
              <span className={isLocalLoaded ? 'text-green-500' : 'text-gray-400'}>
                {isLocalLoaded ? '✓' : '○'} 本地数据
              </span>
              {!isOffline && (
                <span className={isServerSynced ? 'text-green-500' : 'text-gray-400'}>
                  {isServerSynced ? '✓' : '○'} 服务器同步
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染编辑器界面
  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      suppressHydrationWarning
      ref={menuContainerRef}
    >
      <DocumentHeader
        editor={editor}
        isSidebarOpen={sidebar.isOpen}
        toggleSidebar={sidebar.toggle}
        provider={provider || undefined}
        connectedUsers={connectedUsers}
        currentUser={currentUser}
        connectionStatus={connectionStatus}
        isOffline={isOffline}
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

      {/* 显示连接状态指示器 - 仅在移动端或紧急情况下显示 */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-50 md:hidden">
          📴 离线模式
        </div>
      )}

      {!isOffline && connectionStatus !== 'connected' && connectionStatus === 'error' && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-50">
          ❌ 连接失败
        </div>
      )}

      {editor && (
        <>
          <ContentItemMenu editor={editor} />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} documentId={roomId} />
          <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
          <TableRowMenu editor={editor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
          <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
        </>
      )}
    </div>
  );
}
