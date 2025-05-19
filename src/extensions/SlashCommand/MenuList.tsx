import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Command, MenuListProps } from './types';

import { Surface } from '@/components/ui/Surface';
import { DropdownButton } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';

export const MenuList = React.forwardRef((props: MenuListProps, ref) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const activeItem = useRef<HTMLButtonElement>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  // Anytime the groups change, i.e. the user types to narrow it down, we want to
  // reset the current selection to the first menu item
  useEffect(() => {
    if (props.items.length > 0 && props.items[0].commands.length > 0) {
      setSelectedGroupIndex(0);
      setSelectedCommandIndex(0);
    }
  }, [props.items]);

  const selectItem = useCallback(
    (groupIndex: number, commandIndex: number) => {
      if (props.items[groupIndex] && props.items[groupIndex].commands[commandIndex]) {
        const command = props.items[groupIndex].commands[commandIndex];
        props.command(command);

        return true;
      }

      return false;
    },
    [props],
  );

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!props.items.length) {
        return false;
      }

      if (event.key === 'ArrowDown') {
        const currentGroup = props.items[selectedGroupIndex];
        if (!currentGroup) return false;

        const commands = currentGroup.commands;

        let newCommandIndex = selectedCommandIndex + 1;
        let newGroupIndex = selectedGroupIndex;

        if (commands.length - 1 < newCommandIndex) {
          newCommandIndex = 0;
          newGroupIndex = selectedGroupIndex + 1;
        }

        if (props.items.length - 1 < newGroupIndex) {
          newGroupIndex = 0;
        }

        // Make sure the new indices are valid
        if (props.items[newGroupIndex] && props.items[newGroupIndex].commands.length > 0) {
          setSelectedCommandIndex(newCommandIndex);
          setSelectedGroupIndex(newGroupIndex);
        }

        return true;
      }

      if (event.key === 'ArrowUp') {
        let newCommandIndex = selectedCommandIndex - 1;
        let newGroupIndex = selectedGroupIndex;

        if (newCommandIndex < 0) {
          newGroupIndex = selectedGroupIndex - 1;

          if (newGroupIndex < 0) {
            newGroupIndex = props.items.length - 1;
          }

          const newGroup = props.items[newGroupIndex];
          newCommandIndex = newGroup ? newGroup.commands.length - 1 : 0;
        }

        // Make sure the new indices are valid
        if (props.items[newGroupIndex] && props.items[newGroupIndex].commands.length > 0) {
          setSelectedCommandIndex(newCommandIndex);
          setSelectedGroupIndex(newGroupIndex);
        }

        return true;
      }

      if (event.key === 'Enter') {
        // 确保有效的选择
        if (!props.items.length || selectedGroupIndex === -1 || selectedCommandIndex === -1) {
          return false;
        }

        // 检查选中的命令是否存在
        if (
          props.items[selectedGroupIndex] &&
          props.items[selectedGroupIndex].commands[selectedCommandIndex]
        ) {
          // 阻止事件传播和默认行为
          event.preventDefault();
          event.stopPropagation();

          // 选择当前项目
          return selectItem(selectedGroupIndex, selectedCommandIndex);
        }

        return false;
      }

      return false;
    },
    [props.items, selectedGroupIndex, selectedCommandIndex, selectItem],
  );

  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: React.KeyboardEvent }) => {
      return handleKeyDown(event);
    },
  }));

  useEffect(() => {
    if (activeItem.current && scrollContainer.current) {
      const scrollContainer_top = scrollContainer.current.scrollTop;
      const scrollContainer_bottom = scrollContainer_top + scrollContainer.current.clientHeight;

      const element_top = activeItem.current.offsetTop;
      const element_bottom = element_top + activeItem.current.clientHeight;

      // Only adjust scroll if element is out of view
      if (element_top < scrollContainer_top) {
        scrollContainer.current.scrollTop = element_top;
      } else if (element_bottom > scrollContainer_bottom) {
        scrollContainer.current.scrollTop = element_bottom - scrollContainer.current.clientHeight;
      }
    }
  }, [selectedCommandIndex, selectedGroupIndex]);

  const createCommandClickHandler = useCallback(
    (groupIndex: number, commandIndex: number) => {
      return (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        selectItem(groupIndex, commandIndex);
      };
    },
    [selectItem],
  );

  if (!props.items || !props.items.length) {
    return null;
  }

  return (
    <Surface
      ref={scrollContainer}
      className="text-black max-h-[min(80vh,24rem)] overflow-auto flex-wrap mb-8 p-3 w-72 bg-white border border-neutral-100 shadow-lg rounded-xl"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#f0f0f0 transparent',
      }}
    >
      <div className="grid grid-cols-1 gap-1">
        {props.items.map((group, groupIndex: number) => (
          <React.Fragment key={`${group.title}-${groupIndex}-wrapper`}>
            <div
              className="text-neutral-400 text-xs col-[1/-1] mx-2 mt-4 font-semibold tracking-wider select-none uppercase first:mt-1"
              key={`${group.title}-${groupIndex}`}
            >
              {group.title}
            </div>
            {group.commands.map((command: Command, commandIndex: number) => (
              <DropdownButton
                key={`${command.label}-${commandIndex}`}
                ref={
                  selectedGroupIndex === groupIndex && selectedCommandIndex === commandIndex
                    ? activeItem
                    : null
                }
                isActive={
                  selectedGroupIndex === groupIndex && selectedCommandIndex === commandIndex
                }
                onClick={createCommandClickHandler(groupIndex, commandIndex)}
                className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 rounded-lg my-0.5"
              >
                <Icon name={command.iconName} className="mr-2 text-neutral-500" />
                <span className="font-medium">{command.label}</span>
              </DropdownButton>
            ))}
          </React.Fragment>
        ))}
      </div>
    </Surface>
  );
});

MenuList.displayName = 'MenuList';

export default MenuList;
