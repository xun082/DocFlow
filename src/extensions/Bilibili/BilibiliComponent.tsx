'use client';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React, { useMemo, useState } from 'react';
import { Video } from 'lucide-react';

import { BilibiliDialog } from './BilibiliDialog';

import { Button } from '@/components/ui/button';

// Bilibili 播放器基础 URL
const BILIBILI_PLAYER_BASE_URL = 'https://player.bilibili.com/player.html';

/**
 * 从 Bilibili URL 中提取 BV 号
 */
function extractBvid(url: string): string | null {
  // 匹配 BV 号格式: BVxxxxxxxxxx
  const bvidMatch = url.match(/[Bb][Vv]([a-zA-Z0-9]+)/);

  if (bvidMatch) {
    return `BV${bvidMatch[1]}`;
  }

  // 匹配 av 号格式: avxxxxxxxx
  const avidMatch = url.match(/[Aa][Vv](\d+)/);

  if (avidMatch) {
    return `av${avidMatch[1]}`;
  }

  return null;
}

/**
 * 将 Bilibili URL 转换为嵌入播放器 URL
 */
function convertToEmbedUrl(url: string): string {
  const bvid = extractBvid(url);

  if (bvid) {
    if (bvid.startsWith('BV')) {
      // Bilibili 嵌入播放器 URL，添加 high_quality 参数确保正确显示
      return `${BILIBILI_PLAYER_BASE_URL}?bvid=${bvid}&high_quality=1&autoplay=0`;
    } else if (bvid.startsWith('av')) {
      // av 号格式
      return `${BILIBILI_PLAYER_BASE_URL}?aid=${bvid.substring(2)}&high_quality=1&autoplay=0`;
    }
  }

  // 如果已经是嵌入 URL，直接返回
  if (url.includes('player.bilibili.com')) {
    return url;
  }

  // 如果无法解析，返回原 URL
  return url;
}

export const BilibiliComponent: React.FC<NodeViewProps> = ({ node, editor, deleteNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 如果有 src，显示视频
  const embedUrl = useMemo(() => {
    if (node.attrs.src && node.attrs.src.trim() !== '') {
      return convertToEmbedUrl(node.attrs.src);
    }

    return null;
  }, [node.attrs.src]);

  if (embedUrl) {
    return (
      <NodeViewWrapper>
        <div
          className="relative overflow-hidden rounded-lg border border-gray-200"
          style={{
            width: node.attrs.width || '100%',
            paddingTop: node.attrs.height ? undefined : '56.25%',
            height: node.attrs.height,
          }}
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full border-0"
            src={embedUrl}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
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
