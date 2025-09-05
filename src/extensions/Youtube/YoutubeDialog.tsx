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
import { Badge } from '@/components/ui/badge';

interface YoutubeDialogProps {
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

export const YoutubeDialog: React.FC<YoutubeDialogProps> = ({ editor, isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [width, setWidth] = useState(560);
  const [height, setHeight] = useState(315);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

    return youtubeRegex.test(url);
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('请输入 YouTube 视频链接');

      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError('请输入有效的 YouTube 视频链接');

      return;
    }

    setIsLoading(true);
    setError('');

    try {
      editor
        .chain()
        .focus()
        .setYoutubeVideo({
          src: url,
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
      <DialogContent className="sm:max-w-[580px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/50 text-white shadow-2xl backdrop-blur-sm">
        <DialogHeader className="space-y-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                插入 YouTube 视频
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm">
                输入 YouTube 视频链接并选择合适的尺寸
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* URL 输入 */}
          <div className="space-y-3">
            <Label htmlFor="youtube-url" className="text-sm font-medium text-slate-300">
              YouTube 视频链接
            </Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20"
            />
          </div>

          {/* 预设尺寸 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-300">预设尺寸</Label>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_SIZES.map((size) => (
                <button
                  key={size.label}
                  onClick={() => handlePresetSize(size.width, size.height)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    width === size.width && height === size.height
                      ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                      : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-white mb-1">{size.label}</div>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                      {size.width} × {size.height}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 自定义尺寸 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm font-medium text-slate-300">
                宽度
              </Label>
              <Input
                id="width"
                type="number"
                min="320"
                max="1920"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 560)}
                className="bg-slate-800/50 border-slate-600 text-white focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium text-slate-300">
                高度
              </Label>
              <Input
                id="height"
                type="number"
                min="180"
                max="1080"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 315)}
                className="bg-slate-800/50 border-slate-600 text-white focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !url.trim()}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-200"
            >
              {isLoading ? '插入中...' : '插入视频'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
