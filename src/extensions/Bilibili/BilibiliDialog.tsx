'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BilibiliDialogProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_SIZES = [
  { label: '小尺寸', width: 320, height: 180 },
  { label: '标准', width: 560, height: 315 },
  { label: '大尺寸', width: 640, height: 360 },
  { label: '超大', width: 854, height: 480 },
];

export const BilibiliDialog: React.FC<BilibiliDialogProps> = ({ editor, isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [width, setWidth] = useState(560);
  const [height, setHeight] = useState(315);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateBilibiliUrl = (url: string): boolean => {
    // 移除首尾空格
    const trimmedUrl = url.trim();

    // 验证必须以 http:// 或 https:// 开头的完整 URL
    // 只允许 bilibili.com 或 b23.tv 域名
    const bilibiliUrlRegex = /^https?:\/\/(www\.)?(bilibili\.com|b23\.tv)\/.+/;

    // 验证 BV 号格式：必须以 BV 开头，后跟 10 个字符（字母和数字）
    const bvidRegex = /^[Bb][Vv][a-zA-Z0-9]{10}$/;

    // 验证 av 号格式：必须以 av 开头，后跟数字
    const avidRegex = /^[Aa][Vv]\d+$/;

    // 验证嵌入播放器 URL
    const embedUrlRegex = /^https?:\/\/player\.bilibili\.com\/player\.html/;

    return (
      bilibiliUrlRegex.test(trimmedUrl) ||
      bvidRegex.test(trimmedUrl) ||
      avidRegex.test(trimmedUrl) ||
      embedUrlRegex.test(trimmedUrl)
    );
  };

  const handleSubmit = async () => {
    if (!url || !url.trim()) {
      setError('请输入 Bilibili 视频链接');

      return;
    }

    if (!validateBilibiliUrl(url)) {
      setError('请输入有效的 Bilibili 视频链接');

      return;
    }

    setIsLoading(true);
    setError('');

    try {
      editor
        .chain()
        .focus()
        .setBilibili({
          src: url.trim(),
          width: Math.max(320, width) || 560,
          height: Math.max(180, height) || 315,
        })
        .run();

      // 重置表单
      setUrl('');
      setWidth(560);
      setHeight(315);
      onClose();
    } catch {
      setError('插入视频时出错，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSize = (presetWidth: number, presetHeight: number) => {
    setWidth(presetWidth);
    setHeight(presetHeight);
  };

  const handleClose = () => {
    setUrl('');
    setWidth(560);
    setHeight(315);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>插入 Bilibili 视频</DialogTitle>
          <DialogDescription>输入 Bilibili 视频链接并选择合适的尺寸</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL 输入 */}
          <div className="space-y-2">
            <Label htmlFor="bilibili-url">Bilibili 视频链接</Label>
            <Input
              id="bilibili-url"
              type="url"
              placeholder="https://www.bilibili.com/video/BV..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* 尺寸设置 */}
          <div className="space-y-2">
            <Label>尺寸</Label>
            <div className="flex gap-2">
              {PRESET_SIZES.map((size) => (
                <Button
                  key={size.label}
                  onClick={() => handlePresetSize(size.width, size.height)}
                  variant={width === size.width && height === size.height ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                >
                  {size.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Input
                id="width"
                type="number"
                min="320"
                max="1920"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 560)}
                className="flex-1"
                placeholder="宽度"
              />
              <span className="text-muted-foreground">×</span>
              <Input
                id="height"
                type="number"
                min="180"
                max="1080"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 315)}
                className="flex-1"
                placeholder="高度"
              />
            </div>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} variant="outline">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !url?.trim()}>
            {isLoading ? '插入中...' : '插入视频'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
