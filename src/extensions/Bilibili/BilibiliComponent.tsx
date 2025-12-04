'use client';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import { Video } from 'lucide-react';

import { BilibiliDialog } from './BilibiliDialog';

import { Button } from '@/components/ui/button';

export const BilibiliComponent: React.FC<NodeViewProps> = ({ node, editor, deleteNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 如果有 src，显示视频
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
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </NodeViewWrapper>
    );
  }

  // 如果没有 src，显示占位符，点击后打开对话框
  return (
    <NodeViewWrapper>
      <div className="my-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center justify-center gap-3">
          <Video className="w-12 h-12 text-gray-400" />
          <p className="text-sm text-gray-600">点击添加 Bilibili 视频</p>
          <div className="flex gap-2">
            <Button onClick={() => setIsOpen(true)} size="sm">
              添加视频
            </Button>
            <Button onClick={deleteNode} variant="outline" size="sm">
              删除
            </Button>
          </div>
        </div>
      </div>

      <BilibiliDialog
        editor={editor}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </NodeViewWrapper>
  );
};
