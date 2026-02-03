'use client';

import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from 'react';
import { SuggestionKeyDownProps } from '@tiptap/suggestion';

import { MentionListProps, MentionUser } from '../types';

import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/Panel';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

const MentionList = forwardRef(
  (
    props: MentionListProps,
    ref: ForwardedRef<{ onKeyDown: (evt: SuggestionKeyDownProps) => boolean }>,
  ) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // 过滤用户列表
    const getFilteredItems = () => {
      if (!searchQuery.trim()) {
        return props.items;
      }

      const query = searchQuery.toLowerCase();

      return props.items.filter((user: MentionUser) => {
        return (
          user.name.toLowerCase().includes(query) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.role && user.role.toLowerCase().includes(query))
        );
      });
    };

    const filteredItems = getFilteredItems();

    // 滚动到指定索引的用户
    const scrollToIndex = useCallback((index: number) => {
      const element = itemRefs.current[index];

      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }, []);

    useEffect(() => {
      // 只有当当前选中的索引超出过滤后列表范围时才重置
      if (selectedIndex >= filteredItems.length) {
        setSelectedIndex(Math.max(0, filteredItems.length - 1));
      }
    }, [filteredItems.length, selectedIndex]);

    const selectItem = useCallback(
      (index: number) => {
        const user = filteredItems[index];

        if (user) {
          // 传递正确的 mention 属性，使用 name 作为 label
          props.command({
            id: user.id,
            label: user.name,
            email: user.email,
          });
        }
      },
      [filteredItems, props],
    );

    useImperativeHandle(ref, () => {
      const scrollIntoView = (index: number) => {
        const element = itemRefs.current[index];

        if (element) {
          element.scrollIntoView({ block: 'nearest' });
        }
      };

      const upHandler = () => {
        const newIndex = (selectedIndex + filteredItems.length - 1) % filteredItems.length;
        setSelectedIndex(newIndex);
        scrollIntoView(newIndex);
      };

      const downHandler = () => {
        const newIndex = (selectedIndex + 1) % filteredItems.length;
        setSelectedIndex(newIndex);
        scrollIntoView(newIndex);
      };

      const enterHandler = () => {
        selectItem(selectedIndex);
      };

      return {
        onKeyDown: ({ event }) => {
          if (event.key === 'ArrowUp') {
            upHandler();

            return true;
          }

          if (event.key === 'ArrowDown') {
            downHandler();

            return true;
          }

          if (event.key === 'Enter') {
            enterHandler();

            return true;
          }

          return false;
        },
      };
    }, [filteredItems, selectedIndex, selectItem]);

    const createClickHandler = useCallback(
      (index: number) => () => selectItem(index),
      [selectItem],
    );

    if (!props.items || !props.items.length) {
      return (
        <Panel className="max-w-[20rem] p-4 min-w-[18rem]">
          <div className="text-center text-sm text-muted-foreground">没有可提及的用户</div>
        </Panel>
      );
    }

    return (
      <Panel className="max-w-[20rem] max-h-[20rem] flex flex-col min-w-[18rem]">
        {/* 搜索输入框 */}
        <div className="p-2 border-b">
          <Input
            placeholder="搜索用户..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
            autoFocus={true}
            onKeyDown={(e) => {
              // 处理键盘导航
              if (e.key === 'ArrowUp') {
                e.preventDefault();

                const newIndex = (selectedIndex + filteredItems.length - 1) % filteredItems.length;

                setSelectedIndex(newIndex);
                scrollToIndex(newIndex);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();

                const newIndex = (selectedIndex + 1) % filteredItems.length;

                setSelectedIndex(newIndex);
                scrollToIndex(newIndex);
              } else if (e.key === 'Enter') {
                e.preventDefault();

                selectItem(selectedIndex);
              }
            }}
          />
        </div>

        {/* 用户列表 */}
        <div className="overflow-y-auto flex-1">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">未找到匹配的用户</div>
          ) : (
            filteredItems.map((user: MentionUser, index: number) => (
              <Button
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                variant="ghost"
                className={cn(
                  'justify-start w-full gap-2 h-auto py-2',
                  index === selectedIndex && 'bg-accent',
                )}
                size="sm"
                key={user.id}
                onClick={createClickHandler(index)}
                data-user-id={user.id}
              >
                <div className="flex items-center gap-2 w-full">
                  {/* 头像 */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* 用户信息 */}
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="font-medium text-sm truncate">{user.name}</div>
                    {user.email && (
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    )}
                  </div>

                  {/* 角色标签 */}
                  {user.role && (
                    <div className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {user.role}
                    </div>
                  )}
                </div>
              </Button>
            ))
          )}
        </div>
      </Panel>
    );
  },
);

MentionList.displayName = 'MentionList';

export default MentionList;
