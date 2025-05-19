import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

export const DraggableBlockView: React.FC<NodeViewProps> = (props) => {
  const blockType = props.node.attrs.blockType || props.extension.options.blockType;

  return (
    <NodeViewWrapper className="draggable-block-wrapper" data-block-type={blockType}>
      <div className="draggable-block" data-drag-handle></div>
    </NodeViewWrapper>
  );
};
