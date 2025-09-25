import { useState } from 'react';

import ShareDialog from '../DocumentSidebar/folder/ShareDialog';
import { FileItem } from '../DocumentSidebar/folder/type';

import { Icon } from '@/components/ui/Icon';

// 类型定义
interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
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
    <div className="relative group" style={{ zIndex: 50 + (total - index) }}>
      <div
        className="relative w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800"
        style={{
          borderColor: user.color || '#3B82F6',
          borderWidth: user.id === currentUser?.id ? '2.5px' : '2px',
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';

              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className={`absolute inset-0 flex items-center justify-center text-white font-semibold text-xs rounded-full ${
            user.avatar ? 'hidden' : 'flex'
          }`}
          style={{ backgroundColor: user.color || '#3B82F6' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
          style={{ backgroundColor: user.color || '#10B981' }}
        />
      </div>

      {/* 桌面端悬停提示 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] hidden lg:block">
        <div className="flex items-center space-x-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: user.color || '#10B981' }}
          />
          <span className="font-medium">{user.name}</span>
          {user.id === currentUser?.id && <span className="text-green-400 text-xs">(您)</span>}
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
        </div>
      </div>
    </div>
  );
}

interface DocumentHeaderProps {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  isTocOpen?: boolean;
  toggleToc?: () => void;
  provider?: any;
  connectedUsers?: CollaborationUser[];
  currentUser?: CollaborationUser | null;
  // 分享相关属性
  documentId?: string;
  documentName?: string;
}

export default function DocumentHeader({
  isSidebarOpen,
  toggleSidebar,
  isTocOpen,
  toggleToc,
  provider,
  connectedUsers = [],
  currentUser,
  documentId,
  documentName = '未命名文档',
}: DocumentHeaderProps) {
  // 判断是否为协作模式
  const isCollaborationMode = provider && Array.isArray(connectedUsers);

  // 合并所有用户（当前用户 + 连接用户）
  const allUsers = [
    ...connectedUsers,
    ...(currentUser && !connectedUsers.find((u) => u.id === currentUser.id) ? [currentUser] : []),
  ];

  // 分享对话框状态
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDialogFile, setShareDialogFile] = useState<FileItem | null>(null);

  // 处理分享按钮点击
  const handleShare = () => {
    if (documentId) {
      const fileItem: FileItem = {
        id: documentId,
        name: documentName,
        type: 'file',
        depth: 0,
      };
      setShareDialogFile(fileItem);
      setShareDialogOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 min-h-[60px] relative z-10">
      {/* 左侧：侧边栏切换按钮、目录按钮和文档标题 */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            aria-label={isSidebarOpen ? '隐藏侧边栏' : '显示侧边栏'}
          >
            <Icon name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeft'} />
          </button>

          {/* 目录控制按钮 */}
          {toggleToc && (
            <button
              type="button"
              onClick={toggleToc}
              className={`
                flex-shrink-0 p-2 rounded-lg transition-all duration-300 hover:scale-105
                ${
                  isTocOpen
                    ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                }
              `}
              aria-label={isTocOpen ? '隐藏目录' : '显示目录'}
            >
              <div className="relative">
                <Icon name="List" className="w-4 h-4" />
                {isTocOpen && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-pulse" />
                )}
              </div>
            </button>
          )}
        </div>

        {/* 文档标题 */}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {documentName || (isCollaborationMode ? '协作文档' : '文档编辑器')}
        </h1>

        {/* 协作状态指示器 */}
        {isCollaborationMode && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400 hidden sm:inline">
              协作中
            </span>
          </div>
        )}
      </div>

      {/* 右侧：协作用户列表和操作按钮 */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* 统一的协作用户显示 */}
        {isCollaborationMode && allUsers.length > 0 && (
          <>
            <div className="flex items-center space-x-3 px-3 py-1.5 bg-green-50/80 dark:bg-green-950/30 rounded-lg border border-green-200/50 dark:border-green-800/50">
              {/* 桌面端显示完整信息 */}
              <div className="hidden lg:flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  在线协作
                </span>
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
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-white dark:border-gray-600 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm ml-1 hover:scale-105 transition-transform duration-200">
                    +{allUsers.length - 5}
                  </div>
                )}
              </div>

              {/* 用户数量文字说明 */}
              <div className="text-sm font-medium">
                {allUsers.length === 1 ? (
                  currentUser && allUsers[0].id === currentUser.id ? (
                    <span className="text-blue-600 dark:text-blue-400 hidden sm:inline">
                      只有您在线
                    </span>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400 hidden sm:inline">
                      1位用户在线
                    </span>
                  )
                ) : (
                  <span className="text-green-600 dark:text-green-400">
                    <span className="hidden sm:inline">{allUsers.length}位用户在线</span>
                    <span className="sm:hidden">{allUsers.length}人</span>
                  </span>
                )}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
          </>
        )}

        {/* GitHub 链接 */}
        <a
          href="https://github.com/xun082/DocFlow"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800/80 group backdrop-blur-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          aria-label="查看 GitHub 仓库"
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>

        {/* 分享按钮 - 优化样式 */}
        {documentId && (
          <button
            type="button"
            onClick={handleShare}
            className="relative group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon name="Share" className="w-4 h-4" />
            <span className="hidden sm:inline">分享文档</span>

            {/* 光晕效果 */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200 -z-10 blur-xl"></div>
          </button>
        )}
      </div>

      {/* 分享对话框 */}
      {shareDialogFile && (
        <ShareDialog
          file={shareDialogFile}
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setShareDialogFile(null);
          }}
        />
      )}
    </div>
  );
}
