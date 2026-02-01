'use client';

import React from 'react';
import { Settings2, RotateCcw, X } from 'lucide-react';

import type { ModelConfig } from '../types';
import ConfigFields, { type UpdateConfigFn } from './ConfigFields';
import { DEFAULT_MODEL_CONFIG } from '../constants';

import { cn } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ModelConfigModalProps {
  /** 模型配置 */
  config: ModelConfig;
  /** 配置变更回调 */
  onConfigChange: (config: ModelConfig) => void;
  /** 是否处于对比模式 */
  isCompareMode?: boolean;
  /** 添加对比模型回调 */
  onAddCompareModel?: () => void;
  /** 取消模型对比回调 */
  onCancelCompare?: () => void;
  /** 触发器按钮样式类 */
  triggerClassName?: string;
  /** 标题图标 */
  icon?: React.ReactNode;
  /** 标题文本 */
  title?: string;
  /** 自定义触发器内容 */
  children?: React.ReactNode;
}

export default function ModelConfigModal({
  config,
  onConfigChange,
  isCompareMode = false,
  onAddCompareModel,
  onCancelCompare,
  triggerClassName,
  icon = <Settings2 className="h-4 w-4" />,
  title = '模型配置',
  children,
}: ModelConfigModalProps) {
  const updateConfig: UpdateConfigFn = (key, value) => {
    onConfigChange({ ...config, [key]: value });
  };

  const handleReset = () => {
    onConfigChange({ ...DEFAULT_MODEL_CONFIG, id: config.id });
  };

  const toggleCompare = () => {
    if (isCompareMode) {
      onCancelCompare?.();
    } else {
      onAddCompareModel?.();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="">
        {children ? (
          <span className={triggerClassName}>{children}</span>
        ) : (
          <Button variant="ghost" size="icon" className={triggerClassName} title="模型配置">
            {icon}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-xl border-none shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-50 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shadow-sm">{icon}</div>
            <DialogTitle className="text-xl font-bold text-gray-800">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar ">
          <ConfigFields config={config} updateConfig={updateConfig} />

          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #e2e8f0;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #3b82f6;
            }
          `}</style>
        </div>

        <DialogFooter className="px-6 py-4 flex items-center justify-between sm:justify-between border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              重置默认
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCompare}
              className={cn(
                'rounded-lg transition-all',
                isCompareMode
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50',
              )}
            >
              {isCompareMode ? (
                <>
                  <X className="h-4 w-4 mr-1.5" />
                  取消对比
                </>
              ) : (
                <>
                  <Settings2 className="h-4 w-4 mr-1.5" />
                  开启对比
                </>
              )}
            </Button>
          </div>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 rounded-lg shadow-blue-100 shadow-lg active:scale-95 transition-all">
              确定
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
