'use client';

import { Node } from '@tiptap/pm/model';
import { Editor, NodeViewWrapper } from '@tiptap/react';
import { useCallback, useRef } from 'react';

interface ImageBlockViewProps {
  editor: Editor;
  getPos: () => number;
  node: Node;
  updateAttributes: (attrs: Record<string, string>) => void;
}

export const ImageBlockView = (props: ImageBlockViewProps) => {
  const { editor, getPos, node } = props as ImageBlockViewProps & {
    node: Node & {
      attrs: {
        src: string;
        width?: string;
        align?: 'left' | 'center' | 'right';
        alt?: string;
      };
    };
  };
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const { src, width, align = 'center', alt } = node.attrs;

  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const onClick = useCallback(() => {
    editor.commands.setNodeSelection(getPos());
  }, [getPos, editor.commands]);

  return (
    <NodeViewWrapper as="figure" data-type="imageBlock" className={alignClass} data-drag-handle>
      <div contentEditable={false} ref={imageWrapperRef}>
        <img
          className="rounded block h-auto w-full max-w-full"
          src={src}
          alt={alt || ''}
          onClick={onClick}
          style={{ width: width || undefined }}
        />
      </div>
    </NodeViewWrapper>
  );
};

export default ImageBlockView;
