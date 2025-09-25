'use client';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React, { useEffect, useState } from 'react';

import { BilibiliDialog } from './BilibiliDialog';

export const BilibiliComponent: React.FC<NodeViewProps> = ({ node, editor }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!node.attrs.src) {
      setTimeout(() => {
        setIsOpen(true);
      }, 100);
    }
  }, [node.attrs.src]);

  if (isOpen) {
    return (
      <NodeViewWrapper>
        <BilibiliDialog
          editor={editor}
          isOpen={true}
          onClose={() => {
            setIsOpen(false);
          }}
        />
      </NodeViewWrapper>
    );
  }

  if (node.attrs.src && node.attrs.src.trim() !== '') {
    return (
      <NodeViewWrapper>
        <div
          className="relative overflow-hidden rounded-lg"
          style={{
            width: node.attrs.width || '100%',
            paddingTop: node.attrs.height ? undefined : '56.25%',
            height: node.attrs.height,
          }}
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={node.attrs.src}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </NodeViewWrapper>
    );
  }
};
