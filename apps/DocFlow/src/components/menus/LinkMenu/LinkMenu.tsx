import React, { useCallback, useState, JSX } from 'react';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';

import { MenuProps } from '../types';

import { LinkPreviewPanel } from '@/components/panels/LinkPreviewPanel';
import { LinkEditorPanel } from '@/components/panels';

export const LinkMenu = ({ editor }: MenuProps): JSX.Element => {
  const [showEdit, setShowEdit] = useState(false);
  const { link, target, isLinkActive } = useEditorState({
    editor,
    selector: (ctx) => {
      const attrs = ctx.editor.getAttributes('link');

      return {
        link: attrs.href,
        target: attrs.target,
        isLinkActive: ctx.editor.isActive('link'),
      };
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
      pluginKey="textMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      options={{
        flip: false,
        onHide: () => {
          setShowEdit(false);
        },
      }}
    >
      {isLinkActive ? (
        showEdit ? (
          <LinkEditorPanel
            initialUrl={link}
            initialOpenInNewTab={target === '_blank'}
            onSetLink={onSetLink}
          />
        ) : (
          <LinkPreviewPanel url={link} onClear={onUnsetLink} onEdit={handleEdit} />
        )
      ) : null}
    </BaseBubbleMenu>
  );
};

export default LinkMenu;
