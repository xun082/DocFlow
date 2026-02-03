import { UserAvatar } from './user-avatar';
import type { CollaborationUsersProps } from '../types';

const MAX_VISIBLE_USERS = 5;

export function CollaborationUsers({ users, currentUser }: CollaborationUsersProps) {
  if (users.length === 0) return null;

  const visibleUsers = users.slice(0, MAX_VISIBLE_USERS);
  const remainingCount = users.length - MAX_VISIBLE_USERS;

  return (
    <>
      <div className="flex items-center gap-3 px-3 py-1.5 bg-green-50/80 dark:bg-green-950/30 rounded-lg border border-green-200/50 dark:border-green-800/50">
        {/* 用户头像列表 */}
        <div className="flex items-center -space-x-1">
          {visibleUsers.map((user, index) => (
            <UserAvatar
              key={user.id}
              user={user}
              currentUser={currentUser}
              index={index}
              total={users.length}
            />
          ))}

          {/* 更多用户计数 */}
          {remainingCount > 0 && (
            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-white dark:border-gray-600 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm ml-1 hover:scale-105 transition-transform duration-200 cursor-default">
              +{remainingCount}
            </div>
          )}
        </div>

        {/* 用户数量文字说明 */}
        <div className="text-sm font-medium text-green-700 dark:text-green-300 tabular-nums">
          <span className="hidden sm:inline">{users.length}位用户在线</span>
          <span className="sm:hidden">{users.length}人</span>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
    </>
  );
}
