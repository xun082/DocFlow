'use client';

import { EmojiItem } from '@tiptap/extension-emoji';
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

import { EmojiListProps } from '../types';

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
    const getFilteredItems = () => {
      // 过滤空格
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
    };

    const filteredItems = getFilteredItems();

    // 滚动到指定索引的表情符号
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

      const itemsPerRow = 16;

      const upHandler = () => {
        const newIndex =
          (selectedIndex - itemsPerRow + filteredItems.length) % filteredItems.length;
        setSelectedIndex(newIndex);
        scrollIntoView(newIndex);
      };

      const downHandler = () => {
        const newIndex = (selectedIndex + itemsPerRow) % filteredItems.length;
        setSelectedIndex(newIndex);
        scrollIntoView(newIndex);
      };

      const leftHandler = () => {
        const newIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
        setSelectedIndex(newIndex);
        scrollIntoView(newIndex);
      };

      const rightHandler = () => {
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

          if (event.key === 'ArrowLeft') {
            leftHandler();

            return true;
          }

          if (event.key === 'ArrowRight') {
            rightHandler();

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
      <Panel className="w-[520px] max-h-[360px] flex flex-col">
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
              const itemsPerRow = 16;

              if (e.key === 'ArrowUp') {
                e.preventDefault();

                const newIndex =
                  (selectedIndex - itemsPerRow + filteredItems.length) % filteredItems.length;

                setSelectedIndex(newIndex);
                scrollToIndex(newIndex);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();

                const newIndex = (selectedIndex + itemsPerRow) % filteredItems.length;

                setSelectedIndex(newIndex);
                scrollToIndex(newIndex);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();

                const newIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;

                setSelectedIndex(newIndex);
                scrollToIndex(newIndex);
              } else if (e.key === 'ArrowRight') {
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

        {/* 表情符号网格 */}
        <div className="overflow-y-auto flex-1 p-2">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              未找到匹配的表情符号
            </div>
          ) : (
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
            >
              {filteredItems.map((item: EmojiItem, index: number) => (
                <button
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded hover:bg-accent transition-colors text-lg',
                    index === selectedIndex && 'bg-accent',
                  )}
                  key={item.name}
                  onClick={createClickHandler(index)}
                  data-emoji-name={item.name}
                  title={`:${item.name}:`}
                >
                  {item.fallbackImage ? (
                    <img src={item.fallbackImage} className="w-5 h-5" alt="emoji" />
                  ) : (
                    item.emoji
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>
    );
  },
);

EmojiList.displayName = 'EmojiList';

export default EmojiList;
