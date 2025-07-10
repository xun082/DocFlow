'use client';

import React, { useCallback, useState, JSX } from 'react';
import { BubbleMenu as BaseBubbleMenu, useEditorState } from '@tiptap/react';

import { MenuProps } from '../types';

import { LinkPreviewPanel } from '@/components/panels/LinkPreviewPanel';
import { LinkEditorPanel } from '@/components/panels';

export const LinkMenu = ({ editor, appendTo }: MenuProps): JSX.Element => {
  const [showEdit, setShowEdit] = useState(false);
  const { link, target } = useEditorState({
    editor,
    selector: (ctx) => {
      const attrs = ctx.editor.getAttributes('link');

      return { link: attrs.href, target: attrs.target };
    },
  });

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive('link');

    return isActive;
  }, [editor]);

  const handleEdit = useCallback(() => {
    setShowEdit(true);
  }, []);

  const onSetLink = useCallback(
    (url: string, openInNewTab?: boolean) => {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, target: openInNewTab ? '_blank' : '' })
        .run();
      setShowEdit(false);
    },
    [editor],
  );

  const onUnsetLink = useCallback(() => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowEdit(false);

    return null;
  }, [editor]);

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="linkMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        placement: 'bottom',
        zIndex: 10001,
        interactive: true,
        appendTo: appendTo?.current || document.body,
        offset: [0, 8],
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
                fallbackPlacements: ['top', 'bottom-start', 'bottom-end', 'top-start', 'top-end'],
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
        onHidden: () => {
          setShowEdit(false);
        },
      }}
    >
      {showEdit ? (
        <LinkEditorPanel
          initialUrl={link}
          initialOpenInNewTab={target === '_blank'}
          onSetLink={onSetLink}
        />
      ) : (
        <LinkPreviewPanel url={link} onClear={onUnsetLink} onEdit={handleEdit} />
      )}
    </BaseBubbleMenu>
  );
};

export default LinkMenu;
