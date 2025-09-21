'use client';

import React from 'react';

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';

interface GroupQRDialogProps {
  children: React.ReactNode;
}

const GroupQRDialog: React.FC<GroupQRDialogProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-sm border-white/20 text-white">
        <DialogTitle className="text-xl font-bold text-white text-center mb-2">
          DocFlow 学习交流群
        </DialogTitle>

        <div className="text-center space-y-6">
          <div>
            <p className="text-gray-400 text-sm">扫描二维码加入群聊</p>
          </div>

          <div className="flex justify-center">
            <img
              src="https://docflow.tos-cn-guangzhou.volces.com/image/group.png"
              alt="DocFlow 学习交流群二维码"
              className="w-64 h-auto max-w-full rounded-xl shadow-2xl border border-white/10"
            />
          </div>

          <p className="text-gray-500 text-xs">长按或扫描二维码加入群聊</p>

          {/* 新增的说明 */}
          <p className="text-gray-400 text-xs">
            如果群已满或二维码过期，请添加我的微信
            <span className="ml-1 inline-block px-1.5 py-0.5 rounded bg-white/10 border border-white/10 font-medium">
              yunmz777
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupQRDialog;
