import React, { useEffect, useState, ReactNode, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Editor } from '@tiptap/core';

interface BubbleMenuProps {
  editor: Editor;
  children: ReactNode;
  shouldShow?: () => boolean;
  updateDelay?: number;
  pluginKey?: string;
  getReferenceClientRect?: () => DOMRect;
}

export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  editor,
  children,
  shouldShow = () => true,
  updateDelay = 0,
  getReferenceClientRect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<DOMRect | null>(null);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!editor || !shouldShow()) {
        setIsOpen(false);

        return;
      }

      // Get the position
      let rect: DOMRect;

      if (getReferenceClientRect) {
        rect = getReferenceClientRect();
      } else {
        const { ranges } = editor.state.selection;
        const from = Math.min(...ranges.map((range) => range.$from.pos));
        const to = Math.max(...ranges.map((range) => range.$to.pos));

        if (from === to) {
          setIsOpen(false);

          return;
        }

        const domResult = editor.view.domAtPos(from);
        const node = domResult.node as Element;
        rect = node.getBoundingClientRect();
      }

      // Set position and open the menu
      setPosition(rect);
      setIsOpen(true);
    };

    // Handle delayed updates
    const debouncedUpdate = () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }

      updateTimeout.current = setTimeout(() => {
        updatePosition();
        updateTimeout.current = null;
      }, updateDelay);
    };

    // Subscribe to editor events
    editor.on('selectionUpdate', debouncedUpdate);
    editor.on('focus', debouncedUpdate);
    editor.on('blur', () => setIsOpen(false));
    editor.on('update', debouncedUpdate);

    // Initial position update
    updatePosition();

    return () => {
      // Cleanup
      editor.off('selectionUpdate', debouncedUpdate);
      editor.off('focus', debouncedUpdate);
      editor.off('blur', () => setIsOpen(false));
      editor.off('update', debouncedUpdate);

      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, [editor, shouldShow, updateDelay, getReferenceClientRect]);

  if (!position) {
    return null;
  }

  return (
    <Popover.Root open={isOpen}>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={8}
          style={{
            position: 'absolute',
            left: position.left,
            top: position.bottom,
            zIndex: 9999,
          }}
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default BubbleMenu;
