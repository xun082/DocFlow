import { memo } from 'react';
import { Editor } from '@tiptap/react';

import { EditorInfo } from './EditorInfo';
import { CollaborationUserList } from '../CollaborationUserList';

import { CollaborationUser } from '@/hooks/useCollaborativeEditor';
import { Icon } from '@/components/ui/Icon';

export interface DocumentHeaderProps {
  editor?: Editor | null;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  provider?: any; // 支持不同类型的provider
  // 协作相关属性
  connectedUsers?: CollaborationUser[];
  currentUser?: CollaborationUser | null;
  connectionStatus?: string;
  isOffline?: boolean;
}

export const DocumentHeader = memo(
  ({
    editor,
    isSidebarOpen,
    toggleSidebar,
    provider,
    connectedUsers = [],
    currentUser,
    connectionStatus,
    isOffline = false,
  }: DocumentHeaderProps) => {
    // 判断是否为协作模式
    const isCollaborationMode = provider && Array.isArray(connectedUsers);

    // 获取连接状态显示文本
    const getConnectionStatusText = () => {
      if (isOffline) return '离线模式';
      if (!provider) return '';

      switch (connectionStatus) {
        case 'connected':
          return '协作中';
        case 'connecting':
          return '连接中...';
        case 'syncing':
          return '同步中...';
        case 'disconnected':
          return '已断开';
        case 'error':
          return '连接失败';
        default:
          return '未连接';
      }
    };

    // 获取连接状态颜色
    const getConnectionStatusColor = () => {
      if (isOffline) return 'text-yellow-600 dark:text-yellow-400';
      if (!provider) return '';

      switch (connectionStatus) {
        case 'connected':
          return 'text-green-600 dark:text-green-400';
        case 'connecting':
        case 'syncing':
          return 'text-blue-600 dark:text-blue-400';
        case 'disconnected':
          return 'text-yellow-600 dark:text-yellow-400';
        case 'error':
          return 'text-red-600 dark:text-red-400';
        default:
          return 'text-gray-500 dark:text-gray-400';
      }
    };

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 min-h-[60px]">
        {/* 左侧：侧边栏切换按钮和文档标题 */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            aria-label={isSidebarOpen ? '隐藏侧边栏' : '显示侧边栏'}
          >
            <Icon name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeft'} />
          </button>

          {/* 文档标题 */}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {isCollaborationMode ? '协作文档' : '文档编辑器'}
          </h1>

          {/* 协作状态指示器 */}
          {isCollaborationMode && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-500'
                    : connectionStatus === 'error'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${getConnectionStatusColor()} hidden sm:inline`}
              >
                {getConnectionStatusText()}
              </span>
            </div>
          )}
        </div>

        {/* 右侧：协作用户列表和编辑器信息 */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* 协作用户列表 */}
          {isCollaborationMode && (
            <div className="hidden md:flex">
              <CollaborationUserList
                connectedUsers={connectedUsers}
                currentUser={currentUser}
                className=""
              />
            </div>
          )}

          {/* 移动端简化协作显示 */}
          {isCollaborationMode && (
            <div className="flex md:hidden items-center space-x-2">
              <div className="flex -space-x-1">
                {[
                  ...connectedUsers,
                  ...(currentUser && !connectedUsers.find((u) => u.id === currentUser.id)
                    ? [currentUser]
                    : []),
                ]
                  .slice(0, 3)
                  .map((user, index) => (
                    <div
                      key={user.id}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800"
                      style={{
                        borderColor: user.color || '#3B82F6',
                        zIndex: 10 + index,
                      }}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white font-semibold text-xs rounded-full"
                          style={{ backgroundColor: user.color || '#3B82F6' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {connectedUsers.length + (currentUser ? 1 : 0)}人
              </span>
            </div>
          )}

          {/* 编辑器信息 */}
          {editor && (
            <div className="hidden lg:flex items-center space-x-4">
              <EditorInfo editor={editor} />
            </div>
          )}

          {/* 非协作模式的简单状态 */}
          {!isCollaborationMode && provider && (
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              协作状态: {provider.connected ? '已连接' : '未连接'}
            </div>
          )}
        </div>
      </div>
    );
  },
);

DocumentHeader.displayName = 'DocumentHeader';
