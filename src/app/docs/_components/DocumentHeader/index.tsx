import { Editor } from '@tiptap/react';

import { Icon } from '@/components/ui/Icon';

// 类型定义
interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

// 编辑器信息组件
function EditorInfo({ editor }: { editor: Editor }) {
  const characters = editor.storage.characterCount?.characters() || 0;
  const words = editor.storage.characterCount?.words() || 0;

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
      <span>{characters} 字符</span>
      <span>{words} 词</span>
    </div>
  );
}

// 协作用户头像组件
function UserAvatar({
  user,
  currentUser,
  index,
  total,
}: {
  user: CollaborationUser;
  currentUser?: CollaborationUser | null;
  index: number;
  total: number;
}) {
  return (
    <div className="group relative" style={{ zIndex: 50 + (total - index) }}>
      <div
        className="relative h-8 w-8 cursor-pointer rounded-full border-2 bg-white shadow-sm transition-all duration-200 hover:scale-110 dark:bg-gray-800"
        style={{
          borderColor: user.color || '#3B82F6',
          borderWidth: user.id === currentUser?.id ? '2.5px' : '2px',
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-full w-full rounded-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';

              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className={`absolute inset-0 flex items-center justify-center rounded-full text-xs font-semibold text-white ${
            user.avatar ? 'hidden' : 'flex'
          }`}
          style={{ backgroundColor: user.color || '#3B82F6' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div
          className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm dark:border-gray-800"
          style={{ backgroundColor: user.color || '#10B981' }}
        />
      </div>

      {/* 桌面端悬停提示 */}
      <div className="pointer-events-none absolute top-full left-1/2 z-[9999] mt-2 hidden -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 lg:block">
        <div className="flex items-center space-x-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: user.color || '#10B981' }}
          />
          <span className="font-medium">{user.name}</span>
          {user.id === currentUser?.id && <span className="text-xs text-green-400">(您)</span>}
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 transform">
          <div className="h-0 w-0 border-r-4 border-b-4 border-l-4 border-transparent border-b-gray-900" />
        </div>
      </div>
    </div>
  );
}

interface DocumentHeaderProps {
  editor?: Editor | null;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  isTocOpen?: boolean;
  toggleToc?: () => void;
  provider?: any;
  connectedUsers?: CollaborationUser[];
  currentUser?: CollaborationUser | null;
  connectionStatus?: string;
  isOffline?: boolean;
}

export default function DocumentHeader({
  editor,
  isSidebarOpen,
  toggleSidebar,
  isTocOpen,
  toggleToc,
  provider,
  connectedUsers = [],
  currentUser,
  connectionStatus,
  isOffline = false,
}: DocumentHeaderProps) {
  // 判断是否为协作模式
  const isCollaborationMode = provider && Array.isArray(connectedUsers);

  // 合并所有用户（当前用户 + 连接用户）
  const allUsers = [
    ...connectedUsers,
    ...(currentUser && !connectedUsers.find((u) => u.id === currentUser.id) ? [currentUser] : []),
  ];

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
    <div className="relative !z-100000 flex min-h-[60px] items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
      {/* 左侧：侧边栏切换按钮、目录按钮和文档标题 */}
      <div className="flex min-w-0 flex-1 items-center space-x-3">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label={isSidebarOpen ? '隐藏侧边栏' : '显示侧边栏'}
          >
            <Icon name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeft'} />
          </button>

          {/* 目录控制按钮 */}
          {toggleToc && (
            <button
              type="button"
              onClick={toggleToc}
              className={`flex-shrink-0 rounded-lg p-2 transition-all duration-300 hover:scale-105 ${
                isTocOpen
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              } `}
              aria-label={isTocOpen ? '隐藏目录' : '显示目录'}
            >
              <div className="relative">
                <Icon name="List" className="h-4 w-4" />
                {isTocOpen && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" />
                )}
              </div>
            </button>
          )}
        </div>

        {/* 文档标题 */}
        <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isCollaborationMode ? '协作文档' : '文档编辑器'}
        </h1>

        {/* 协作状态指示器 */}
        {isCollaborationMode && (
          <div className="flex flex-shrink-0 items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : connectionStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              }`}
            />
            <span className={`text-sm font-medium ${getConnectionStatusColor()} hidden sm:inline`}>
              {getConnectionStatusText()}
            </span>
          </div>
        )}
      </div>

      {/* 右侧：协作用户列表和编辑器信息 */}
      <div className="flex flex-shrink-0 items-center space-x-4">
        {/* 统一的协作用户显示 */}
        {isCollaborationMode && allUsers.length > 0 && (
          <div className="flex items-center space-x-3">
            {/* 桌面端显示完整信息 */}
            <div className="hidden items-center space-x-2 lg:flex">
              <svg
                className="h-4 w-4 flex-shrink-0 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">在线协作</span>
            </div>

            {/* 用户头像列表 */}
            <div className="flex items-center -space-x-1">
              {allUsers.slice(0, 5).map((user, index) => (
                <UserAvatar
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                  index={index}
                  total={allUsers.length}
                />
              ))}

              {/* 更多用户计数 */}
              {allUsers.length > 5 && (
                <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  +{allUsers.length - 5}
                </div>
              )}
            </div>

            {/* 用户数量文字说明 */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {allUsers.length === 1 ? (
                currentUser && allUsers[0].id === currentUser.id ? (
                  <span className="hidden text-blue-600 sm:inline dark:text-blue-400">
                    只有您在线
                  </span>
                ) : (
                  <span className="hidden sm:inline">1位用户在线</span>
                )
              ) : (
                <span className="text-green-600 dark:text-green-400">
                  <span className="hidden sm:inline">{allUsers.length}位用户在线</span>
                  <span className="sm:hidden">{allUsers.length}人</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* 编辑器信息 */}
        {editor && (
          <div className="hidden items-center space-x-4 lg:flex">
            <EditorInfo editor={editor} />
          </div>
        )}

        {/* 非协作模式的简单状态 */}
        {!isCollaborationMode && provider && (
          <div className="hidden text-sm text-gray-500 sm:block dark:text-gray-400">
            协作状态: {provider.connected ? '已连接' : '未连接'}
          </div>
        )}
      </div>
    </div>
  );
}
