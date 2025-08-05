'use client';

import { EmojiItem } from '@tiptap/extension-emoji';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  useMemo,
  useRef,
} from 'react';
import { SuggestionKeyDownProps } from '@tiptap/suggestion';

import { EmojiListProps } from '../types';

import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/Panel';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/utils';

const EmojiList = forwardRef(
  (
    props: EmojiListProps,
    ref: ForwardedRef<{ onKeyDown: (evt: SuggestionKeyDownProps) => boolean }>,
  ) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // 过滤emoji列表
    const filteredItems = useMemo(() => {
      if (!searchQuery.trim()) {
        return props.items;
      }

      const query = searchQuery.toLowerCase();

      return props.items.filter((item: EmojiItem) => {
        return (
          item.name.toLowerCase().includes(query) ||
          (item.shortcodes &&
            item.shortcodes.some((code: string) => code.toLowerCase().includes(query))) ||
          (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(query)))
        );
      });
    }, [props.items, searchQuery]);

    // 滚动到指定索引的表情符号
    const scrollToIndex = useCallback((index: number) => {
      const element = itemRefs.current[index];

      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }, []);

    useEffect(() => setSelectedIndex(0), [filteredItems]);

    const selectItem = useCallback(
      (index: number) => {
        const item = filteredItems[index];

        if (item) {
          props.command({ name: item.name });
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
          console.log('event.key', event.key);

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
      return null;
    }

    return (
      <Panel className="max-w-[18rem] max-h-[20rem] flex flex-col min-w-[16rem]">
        {/* 搜索输入框 */}
        <div className="p-2 border-b">
          <Input
            placeholder="搜索表情符号..."
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

        {/* 表情符号列表 */}
        <div className="overflow-y-auto flex-1">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              未找到匹配的表情符号
            </div>
          ) : (
            filteredItems.map((item: EmojiItem, index: number) => (
              <Button
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                variant="ghost"
                className={cn('justify-start w-full', index === selectedIndex && 'bg-accent')}
                size="sm"
                key={item.name}
                onClick={createClickHandler(index)}
                data-emoji-name={item.name}
              >
                {item.fallbackImage ? (
                  <img src={item.fallbackImage} className="w-5 h-5" alt="emoji" />
                ) : (
                  item.emoji
                )}{' '}
                <span className="truncate text-ellipsis">:{item.name}:</span>
              </Button>
            ))
          )}
        </div>
      </Panel>
    );
  },
);

EmojiList.displayName = 'EmojiList';

export default EmojiList;
