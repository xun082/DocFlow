'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';
import UserApi from '@/services/users';
import { User } from '@/services/users/type';

interface UserSelectorProps {
  selectedUsers: User[];
  onSelectionChange: (users: User[]) => void;
  placeholder?: string;
  maxSelections?: number;
  className?: string;
}

const UserSelector = ({
  selectedUsers,
  onSelectionChange,
  placeholder = '搜索并选择用户...',
  maxSelections,
  className,
}: UserSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 搜索用户
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);

        return;
      }

      setIsSearching(true);

      try {
        const response = await UserApi.searchUsers(query, 10, 0);

        if (response?.data?.data?.users) {
          // 过滤掉已选中的用户
          const filteredUsers = response.data.data.users.filter(
            (user) => !selectedUsers.some((selected) => selected.id === user.id),
          );
          setSearchResults(filteredUsers);
        }
      } catch (error) {
        console.error('搜索用户失败:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [selectedUsers],
  );

  // 处理搜索输入
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      setIsOpen(true);

      // 防抖搜索
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(query);
      }, 300);
    },
    [searchUsers],
  );

  // 选择用户
  const handleSelectUser = useCallback(
    (user: User) => {
      if (maxSelections && selectedUsers.length >= maxSelections) {
        return;
      }

      const newSelectedUsers = [...selectedUsers, user];
      onSelectionChange(newSelectedUsers);
      setSearchQuery('');
      setSearchResults([]);
      setIsOpen(false);

      // 重新聚焦输入框
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [selectedUsers, onSelectionChange, maxSelections],
  );

  // 移除选中的用户
  const handleRemoveUser = useCallback(
    (userId: number) => {
      const newSelectedUsers = selectedUsers.filter((user) => user.id !== userId);
      onSelectionChange(newSelectedUsers);
    },
    [selectedUsers, onSelectionChange],
  );

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      } else if (e.key === 'Backspace' && !searchQuery && selectedUsers.length > 0) {
        // 如果输入框为空且按退格键，删除最后一个选中的用户
        e.preventDefault();
        handleRemoveUser(selectedUsers[selectedUsers.length - 1].id);
      }
    },
    [searchQuery, selectedUsers, handleRemoveUser],
  );

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const canAddMore = !maxSelections || selectedUsers.length < maxSelections;

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'min-h-[42px] w-full rounded-md border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500',
          'flex flex-wrap items-center gap-1 p-2',
          !canAddMore && 'bg-gray-50',
        )}
      >
        {/* 已选中的用户标签 */}
        {selectedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-800"
          >
            {user.avatar_url && (
              <img src={user.avatar_url} alt={user.name} className="h-4 w-4 rounded-full" />
            )}
            <span>{user.name}</span>
            <button
              type="button"
              onClick={() => handleRemoveUser(user.id)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              <Icon name="X" className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* 搜索输入框 */}
        {canAddMore && (
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsOpen(true);
            }}
            onBlur={() => setIsOpen(false)}
            placeholder={selectedUsers.length === 0 ? placeholder : ''}
            className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
            disabled={!canAddMore}
          />
        )}

        {/* 搜索图标 */}
        <Icon name="Search" className="h-4 w-4 text-gray-400" />
      </div>

      {/* 搜索结果下拉框 */}
      {isOpen && (searchResults.length > 0 || isSearching || searchQuery) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {isSearching ? (
            <div className="flex items-center justify-center p-3">
              <Icon name="Loader" className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">搜索中...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div className="border-b border-gray-200 p-2 text-xs text-gray-500">
                找到 {searchResults.length} 个用户
              </div>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex cursor-pointer items-center gap-3 p-3 hover:bg-gray-50"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex-shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                        <Icon name="User" className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">{user.name}</div>
                    {user.email && (
                      <div className="truncate text-xs text-gray-500">{user.email}</div>
                    )}
                  </div>
                  {user.location && <div className="text-xs text-gray-400">{user.location}</div>}
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="p-3 text-center text-sm text-gray-500">未找到匹配的用户</div>
          ) : null}
        </div>
      )}

      {/* 限制提示 */}
      {maxSelections && selectedUsers.length >= maxSelections && (
        <div className="mt-1 text-xs text-gray-500">已达到最大选择数量 ({maxSelections})</div>
      )}
    </div>
  );
};

export default UserSelector;
