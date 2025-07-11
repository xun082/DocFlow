'use client';

import DragHandle from '@tiptap-pro/extension-drag-handle-react';
import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { useEffect, useState } from 'react';

import useContentItemActions from './hooks/useContentItemActions';
import { useData } from './hooks/useData';

import { Icon } from '@/components/ui/Icon';
import { Toolbar } from '@/components/ui/Toolbar';
import { Surface } from '@/components/ui/Surface';
import { DropdownButton } from '@/components/ui/Dropdown';

export type ContentItemMenuProps = {
  editor: Editor;
  isEditable?: boolean;
};

export const ContentItemMenu = ({ editor, isEditable = true }: ContentItemMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const data = useData();
  const actions = useContentItemActions(editor, data.currentNode, data.currentNodePos);

  useEffect(() => {
    if (menuOpen) {
      editor.commands.setMeta('lockDragHandle', true);
    } else {
      editor.commands.setMeta('lockDragHandle', false);
    }
  }, [editor, menuOpen]);

  return (
    <DragHandle
      pluginKey="ContentItemMenu"
      editor={editor}
      onNodeChange={data.handleNodeChange}
      tippyOptions={{
        offset: [-2, 16],
        zIndex: 9999,
        placement: 'top-start',
        interactive: true,
        appendTo: () => document.body,
        hideOnClick: false,
        trigger: 'manual',
        duration: [200, 150],
        animation: 'shift-away-subtle',
        theme: 'content-item-menu',
        popperOptions: {
          strategy: 'absolute',
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
                padding: 8,
                altBoundary: true,
                altAxis: true,
                tether: false,
              },
            },
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['bottom-start', 'top-end', 'bottom-end'],
                allowedAutoPlacements: ['top', 'bottom'],
              },
            },
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ],
        },
      }}
    >
      {isEditable ? (
        <div className="flex items-center gap-0.5">
          <Toolbar.Button onClick={actions.handleAdd}>
            <Icon name="Plus" />
          </Toolbar.Button>
          <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Popover.Trigger asChild>
              <Toolbar.Button>
                <Icon name="GripVertical" />
              </Toolbar.Button>
            </Popover.Trigger>
            <Popover.Content side="bottom" align="start" sideOffset={8}>
              <Surface className="p-2 flex flex-col min-w-[16rem]">
                <Popover.Close asChild>
                  <DropdownButton onClick={actions.resetTextFormatting}>
                    <Icon name="RemoveFormatting" />
                    Clear formatting
                  </DropdownButton>
                </Popover.Close>
                <Popover.Close asChild>
                  <DropdownButton onClick={actions.copyNodeToClipboard}>
                    <Icon name="Clipboard" />
                    Copy to clipboard
                  </DropdownButton>
                </Popover.Close>
                <Popover.Close asChild>
                  <DropdownButton onClick={actions.duplicateNode}>
                    <Icon name="Copy" />
                    Duplicate
                  </DropdownButton>
                </Popover.Close>
                <Toolbar.Divider horizontal />
                <Popover.Close asChild>
                  <DropdownButton
                    onClick={actions.deleteNode}
                    className="text-red-500 bg-red-500 dark:text-red-500 hover:bg-red-500 dark:hover:text-red-500 dark:hover:bg-red-500 bg-opacity-10 hover:bg-opacity-20 dark:hover:bg-opacity-20"
                  >
                    <Icon name="Trash2" />
                    Delete
                  </DropdownButton>
                </Popover.Close>
              </Surface>
            </Popover.Content>
          </Popover.Root>
        </div>
      ) : null}
    </DragHandle>
  );
};
