'use client';

import React from 'react';

import { CollaborationUser } from '@/hooks/useCollaborativeEditor';

interface CollaborationUserListProps {
  connectedUsers: CollaborationUser[];
  currentUser?: CollaborationUser | null;
  className?: string;
}

export function CollaborationUserList({
  connectedUsers,
  currentUser,
  className = '',
}: CollaborationUserListProps) {
  // 合并当前用户和其他在线用户
  const allUsers = React.useMemo(() => {
    const users = [...connectedUsers];

    // 如果有当前用户且不在connectedUsers中，添加到列表开头
    if (currentUser && !users.find((u) => u.id === currentUser.id)) {
      users.unshift(currentUser);
    }

    return users;
  }, [connectedUsers, currentUser]);

  if (allUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* 协作图标和标题 */}
      <div className="flex items-center space-x-1">
        <svg
          className="w-4 h-4 text-green-500 flex-shrink-0"
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
          <div
            key={user.id}
            className="relative group"
            style={{ zIndex: 50 + (allUsers.length - index) }}
          >
            <div
              className="relative w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800"
              style={{
                borderColor: user.color || '#3B82F6',
                borderWidth: user.id === currentUser?.id ? '2.5px' : '2px',
              }}
            >
              {/* 用户头像或首字母 */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // 头像加载失败时显示用户名首字母
                    const target = e.currentTarget;
                    const parent = target.parentElement;

                    if (parent) {
                      target.style.display = 'none';

                      const fallback = parent.querySelector('.avatar-fallback') as HTMLElement;

                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }
                  }}
                />
              ) : null}

              {/* 备用头像 - 显示用户名首字母 */}
              <div
                className={`avatar-fallback absolute inset-0 flex items-center justify-center text-white font-semibold text-xs rounded-full ${
                  user.avatar ? 'hidden' : 'flex'
                }`}
                style={{ backgroundColor: user.color || '#3B82F6' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* 在线状态指示器 */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                style={{ backgroundColor: user.color || '#10B981' }}
              ></div>
            </div>

            {/* 悬停提示框 - 针对header环境优化 */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999]">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user.color || '#10B981' }}
                ></div>
                <span className="font-medium">{user.name}</span>
                {user.id === currentUser?.id && (
                  <span className="text-green-400 text-xs">(您)</span>
                )}
              </div>
              {/* 工具提示箭头 - 向上指向 */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          </div>
        ))}

        {/* 如果用户超过5个，显示更多用户计数 */}
        {allUsers.length > 5 && (
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm ml-1">
            +{allUsers.length - 5}
          </div>
        )}
      </div>

      {/* 在线用户数量文字说明 */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {allUsers.length === 1 ? (
          currentUser && allUsers[0].id === currentUser.id ? (
            <span className="text-blue-600 dark:text-blue-400">只有您在线</span>
          ) : (
            '1位用户在线'
          )
        ) : (
          <span className="text-green-600 dark:text-green-400">{allUsers.length}位用户在线</span>
        )}
      </div>
    </div>
  );
}

export default CollaborationUserList;
