'use client';

import { EmojiItem } from '@tiptap/extension-emoji';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { SuggestionKeyDownProps } from '@tiptap/suggestion';

import { EmojiListProps } from '../types';

import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/utils/utils';

const EmojiList = forwardRef(
  (
    props: EmojiListProps,
    ref: ForwardedRef<{ onKeyDown: (evt: SuggestionKeyDownProps) => boolean }>,
  ) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [props.items]);

    const selectItem = useCallback(
      (index: number) => {
        const item = props.items[index];

        if (item) {
          props.command({ name: item.name });
        }
      },
      [props],
    );

    useImperativeHandle(ref, () => {
      const scrollIntoView = (index: number) => {
        const item = props.items[index];

        if (item) {
          const node = document.querySelector(`[data-emoji-name="${item.name}"]`);

          if (node) {
            node.scrollIntoView({ block: 'nearest' });
          }
        }
      };

      const upHandler = () => {
        const newIndex = (selectedIndex + props.items.length - 1) % props.items.length;
        setSelectedIndex(newIndex);
        scrollIntoView(newIndex);
      };

      const downHandler = () => {
        const newIndex = (selectedIndex + 1) % props.items.length;
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
    }, [props, selectedIndex, selectItem]);

    const createClickHandler = useCallback(
      (index: number) => () => selectItem(index),
      [selectItem],
    );

    if (!props.items || !props.items.length) {
      return null;
    }

    return (
      <Panel className="overflow-y-auto max-w-[18rem] max-h-[18rem]">
        {props.items.map((item: EmojiItem, index: number) => (
          <Button
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
        ))}
      </Panel>
    );
  },
);

EmojiList.displayName = 'EmojiList';

export default EmojiList;
