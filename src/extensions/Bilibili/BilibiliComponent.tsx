'use client';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React, { useMemo, useState } from 'react';
import { Video } from 'lucide-react';

import { BilibiliDialog } from './BilibiliDialog';

import { Button } from '@/components/ui/button';

// Bilibili 播放器基础 URL
const BILIBILI_PLAYER_BASE_URL = 'https://player.bilibili.com/player.html';

/**
 * 从 Bilibili URL 中提取 BV 号或 av 号
 */
function extractBvid(url: string): string | null {
  // 匹配 BV 号格式
  const bvidMatch = url.match(/\b[Bb][Vv]([a-zA-Z0-9]{10})\b/);

  if (bvidMatch && bvidMatch[1].length === 10) {
    return `BV${bvidMatch[1]}`;
  }

  // 匹配 av 号格式
  const avidMatch = url.match(/\b[Aa][Vv](\d+)\b/);

  if (avidMatch) {
    return `av${avidMatch[1]}`;
  }

  return null;
}

/**
 * 将 Bilibili URL 转换为嵌入播放器 URL
 */
function convertToEmbedUrl(url: string): string {
  // 移除首尾空格
  const trimmedUrl = url.trim();

  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    // 尝试提取 BV 号或 av 号
    const bvid = extractBvid(trimmedUrl);

    if (bvid) {
      if (bvid.startsWith('BV') && bvid.length === 12) {
        // BV 号：BV + 10 个字符
        // 使用 encodeURIComponent 防止注入攻击
        return `${BILIBILI_PLAYER_BASE_URL}?bvid=${encodeURIComponent(bvid)}&high_quality=1&autoplay=0`;
      } else if (bvid.startsWith('av')) {
        // av 号格式
        const aid = bvid.substring(2);

        // 验证 aid 只包含数字
        if (/^\d+$/.test(aid)) {
          return `${BILIBILI_PLAYER_BASE_URL}?aid=${encodeURIComponent(aid)}&high_quality=1&autoplay=0`;
        }
      }
    }

    // 如果无法安全转换，返回空字符串（不会渲染）
    return '';
  }

  // 验证是否为合法的 Bilibili 嵌入 URL
  if (trimmedUrl.startsWith(BILIBILI_PLAYER_BASE_URL)) {
    // 已经是嵌入 URL，验证域名
    try {
      const urlObj = new URL(trimmedUrl);

      if (urlObj.hostname === 'player.bilibili.com') {
        return trimmedUrl;
      }
    } catch {
      // URL 解析失败，返回空字符串
      return '';
    }
  }

  // 尝试从完整 URL 中提取 BV 号或 av 号
  const bvid = extractBvid(trimmedUrl);

  if (bvid) {
    if (bvid.startsWith('BV') && bvid.length === 12) {
      return `${BILIBILI_PLAYER_BASE_URL}?bvid=${encodeURIComponent(bvid)}&high_quality=1&autoplay=0`;
    } else if (bvid.startsWith('av')) {
      const aid = bvid.substring(2);

      if (/^\d+$/.test(aid)) {
        return `${BILIBILI_PLAYER_BASE_URL}?aid=${encodeURIComponent(aid)}&high_quality=1&autoplay=0`;
      }
    }
  }

  return '';
}

export const BilibiliComponent: React.FC<NodeViewProps> = ({ node, editor, deleteNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 如果有 src，显示视频
  const embedUrl = useMemo(() => {
    if (node.attrs.src && node.attrs.src.trim() !== '') {
      const url = convertToEmbedUrl(node.attrs.src);

      return url || null;
    }

    return null;
  }, [node.attrs.src]);

  if (embedUrl && embedUrl.trim() !== '') {
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
            sandbox="allow-scripts allow-same-origin allow-presentation"
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
