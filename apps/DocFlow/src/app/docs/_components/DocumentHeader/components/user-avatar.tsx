import type { UserAvatarProps } from '../types';

export function UserAvatar({ user, currentUser, index, total }: UserAvatarProps) {
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
