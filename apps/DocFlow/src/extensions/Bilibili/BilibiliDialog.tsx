'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { isValidBilibiliUrl } from '@syncflow/bilibili';

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

  const handleSubmit = async () => {
    if (!url || !url.trim()) {
      setError('请输入 Bilibili 视频链接');

      return;
    }

    if (!isValidBilibiliUrl(url)) {
      setError('请输入有效的 Bilibili 视频链接');

      return;
    }

    setIsLoading(true);
    setError('');

    try {
      editor
        .chain()
        .focus()
        .setBilibiliVideo({
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

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bilibili-url">视频链接</Label>
            <Input
              id="bilibili-url"
              placeholder="https://www.bilibili.com/video/BV..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="grid gap-2">
            <Label>预设尺寸</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SIZES.map((size) => (
                <Button
                  key={size.label}
                  variant={width === size.width && height === size.height ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetSize(size.width, size.height)}
                >
                  {size.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="width">宽度</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="height">高度</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? '插入中...' : '插入'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
