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

  // const validateBilibiliIframeUrl = (url: string): boolean => {
  //   // 校验B站iframe链接格式
  //   const iframeRegex = /^(https?:\/\/)?player\.bilibili\.com\/player\.html\?.*$/;

  //   if (!iframeRegex.test(url)) {
  //     return false;
  //   }

  //   // 检查必要的参数
  //   const urlObj = new URL(url);
  //   const params = new URLSearchParams(urlObj.search);

  //   // 必须包含aid或bvid参数
  //   const hasAid = params.has('aid');
  //   const hasBvid = params.has('bvid');

  //   return hasAid || hasBvid;
  // };

  const handleSubmit = async () => {
    if (!url || !url.trim()) {
      setError('请输入 Bilibili 视频链接');

      return;
    }

    // 使用DOMParser解析
    const parser = new DOMParser();
    const doc = parser.parseFromString(url, 'text/html');
    const iframe = doc.querySelector('iframe');
    const videoUrl = iframe ? iframe.getAttribute('src') : url;

    setIsLoading(true);
    setError('');

    try {
      editor
        .chain()
        .focus()
        .setBilibili({
          src: videoUrl || url,
          width: Math.max(320, width),
          height: Math.max(180, height),
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
      <DialogContent className="sm:max-w-[580px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-[#FF6699]/20 text-white shadow-2xl shadow-[#FF6699]/10 backdrop-blur-sm">
        <DialogHeader className="space-y-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6699]/20 to-[#FF6699]/10 p-1 rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6699]/20">
              <svg
                className="icon"
                viewBox="0 0 1129 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="200"
                height="200"
              >
                <path
                  d="M234.908525 9.656195a80.468288 80.468288 0 0 1 68.398044 0 167.374038 167.374038 0 0 1 41.84351 30.577949l160.936576 140.819503H621.156306L782.092881 40.234144a168.983404 168.983404 0 0 1 41.84351-30.577949 80.468288 80.468288 0 0 1 107.022823 66.788678 80.468288 80.468288 0 0 1-17.703024 53.913753 449.817728 449.817728 0 0 1-35.406046 32.187315 232.553351 232.553351 0 0 1-22.531121 18.507706h100.58536a170.59277 170.59277 0 0 1 118.288383 53.10907A171.397453 171.397453 0 0 1 1128.106519 352.4511v462.692655a325.896565 325.896565 0 0 1-4.023415 70.00741 178.639599 178.639599 0 0 1-80.468288 112.655603 173.006819 173.006819 0 0 1-92.53853 25.749852H212.377404a341.18554 341.18554 0 0 1-72.421459-4.023415 177.834916 177.834916 0 0 1-111.046237-80.468287A172.202136 172.202136 0 0 1 1.550491 846.526387V388.66183A360.497929 360.497929 0 0 1 1.550491 321.873151a177.030233 177.030233 0 0 1 160.936575-143.233552h105.413457c-16.89834-12.070243-31.382632-26.554535-46.671607-39.429461a80.468288 80.468288 0 0 1-25.749852-65.983996A80.468288 80.468288 0 0 1 234.908525 9.656195M216.400819 321.873151a80.468288 80.468288 0 0 0-63.569948 57.937167 108.632188 108.632188 0 0 0 0 30.577949v380.615001a80.468288 80.468288 0 0 0 55.523119 80.468288 106.21814 106.21814 0 0 0 34.601364 5.63278h654.207179a80.468288 80.468288 0 0 0 76.444873-47.47629 112.655603 112.655603 0 0 0 8.046829-53.10907v-354.060465a135.186723 135.186723 0 0 0 0-38.624779 80.468288 80.468288 0 0 0-52.304387-54.718435 129.553943 129.553943 0 0 0-49.890338-7.242146H254.220914a268.764081 268.764081 0 0 0-37.820095 0z m0 0"
                  fill="#FF6699"
                  p-id="5749"
                ></path>
                <path
                  d="M348.368811 447.40368a80.468288 80.468288 0 0 1 55.523118 18.507706 80.468288 80.468288 0 0 1 28.163901 59.546533v80.468287a80.468288 80.468288 0 0 1-16.093658 51.499705 80.468288 80.468288 0 0 1-131.967992-9.656195 104.608774 104.608774 0 0 1-10.460877-54.718436v-80.468287a80.468288 80.468288 0 0 1 70.00741-67.593362z m416.021047 0a80.468288 80.468288 0 0 1 86.101068 75.64019v80.468288a94.147897 94.147897 0 0 1-12.070243 53.10907 80.468288 80.468288 0 0 1-132.772675 0 95.757262 95.757262 0 0 1-12.874926-57.132485v-80.468287a80.468288 80.468288 0 0 1 70.00741-70.812093z m0 0"
                  fill="#FF6699"
                  p-id="5750"
                ></path>
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold  text-[#FF6699] bg-clip-text ">
                插入 Bilibili 视频
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm">
                输入 Bilibili 视频链接并选择合适的尺寸
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* URL 输入 */}
          <div className="space-y-3">
            <Label htmlFor="youtube-url" className="text-sm font-medium text-slate-300">
              Bilibili 视频链接
            </Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.bilibili.com/video/BV..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-[#FF6699] focus:ring-[#FF6699]/20 transition-all duration-200"
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
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#FF6699]/20 ${
                    width === size.width && height === size.height
                      ? 'border-[#FF6699] bg-[#FF6699]/10 shadow-lg shadow-[#FF6699]/20'
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
                className="bg-slate-800/50 border-slate-600 text-white focus:border-[#FF6699] focus:ring-[#FF6699]/20 transition-all duration-200"
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
                className="bg-slate-800/50 border-slate-600 text-white focus:border-[#FF6699] focus:ring-[#FF6699]/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-3 rounded-lg border border-[#FF6699]/20 bg-[#FF6699]/5 text-[#FF6699] text-sm shadow-sm">
              {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-200"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !url?.trim()}
              className="flex-1 bg-gradient-to-r from-[#FF6699] to-[#FF6699]/80 text-white hover:shadow-lg hover:shadow-[#FF6699]/20 duration-200"
            >
              {isLoading ? '插入中...' : '插入视频'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
