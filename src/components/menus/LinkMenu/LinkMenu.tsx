'use client';

import React, { useState, JSX } from 'react';
import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';
import { useEditorState } from '@tiptap/react';

import { MenuProps } from '../types';

import { LinkPreviewPanel } from '@/components/panels/LinkPreviewPanel';
import { LinkEditorPanel } from '@/components/panels';

export function LinkMenu({ editor }: MenuProps): JSX.Element {
  const [showEdit, setShowEdit] = useState(false);
  const { link, target } = useEditorState({
    editor,
    selector: (ctx) => {
      const attrs = ctx.editor.getAttributes('link');

      return { link: attrs.href, target: attrs.target };
    },
  });

  const shouldShow = () => {
    const isActive = editor.isActive('link');

    return isActive;
  };

  const handleEdit = () => {
    setShowEdit(true);
  };

  const onSetLink = (url: string, openInNewTab?: boolean) => {
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url, target: openInNewTab ? '_blank' : '' })
      .run();
    setShowEdit(false);
  };

  const onUnsetLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowEdit(false);

    return null;
  };

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="linkMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      options={{
        placement: 'bottom',
        offset: 8,
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
}

export default LinkMenu;
