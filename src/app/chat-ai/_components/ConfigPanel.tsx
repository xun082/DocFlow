'use client';

/**
 * 可折叠的配置面板组件
 *
 * 功能说明：
 * - 包含所有模型配置项
 * - 支持折叠/展开
 * - 默认不折叠状态
 * - 位于侧边栏上方
 */

import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

import type { ModelConfig } from '../types';
import ConfigFields, { type UpdateConfigFn } from './ConfigFields';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

interface ConfigPanelProps {
  /** 模型配置 */
  config: ModelConfig;
  /** 配置变更回调 */
  onConfigChange: (config: ModelConfig) => void;
  /** 添加对比模型回调 */
  onAddCompareModel: () => void;
  /** 是否可添加对比模型 */
  canAddCompareModel: boolean;
  /** 是否处于对比模式 */
  isCompareMode?: boolean;
  /** 对比模型配置（仅对比模式下有值） */
  compareConfig?: ModelConfig | null;
  /** 对比模型配置变更回调 */
  onCompareConfigChange?: (config: ModelConfig) => void;
  /** 取消模型对比回调 */
  onCancelCompare?: () => void;
  /** 是否展开 */
  isExpanded: boolean;
  /** 切换展开状态回调 */
  onToggleExpand: () => void;
}

export default function ConfigPanel({
  config,
  onConfigChange,
  onAddCompareModel,
  canAddCompareModel,
  isCompareMode = false,
  compareConfig = null,
  onCompareConfigChange,
  onCancelCompare,
  isExpanded,
  onToggleExpand,
}: ConfigPanelProps) {
  const updateConfig: UpdateConfigFn = (key, value) => {
    onConfigChange({ ...config, [key]: value });
  };
  const updateCompareConfig: UpdateConfigFn =
    compareConfig && onCompareConfigChange
      ? (key, value) => onCompareConfigChange({ ...compareConfig, [key]: value })
      : ((() => {}) as UpdateConfigFn);

  return (
    <div className="border-b border-gray-100">
      <div
        onClick={onToggleExpand}
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-700">模型配置</h3>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="px-4 pb-4 space-y-5">
          {/* 主模型配置 */}
          <ConfigFields config={config} updateConfig={updateConfig} />

          {/* 对比模型配置（仅对比模式下显示） */}
          {isCompareMode && compareConfig && onCompareConfigChange && (
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">对比模型配置</h4>
                {onCancelCompare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancelCompare}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 mr-1" />
                    取消对比
                  </Button>
                )}
              </div>
              <ConfigFields config={compareConfig} updateConfig={updateCompareConfig} />
            </div>
          )}

          {/* 添加对比模型按钮（非对比模式且可添加时显示） */}
          {!isCompareMode && (
            <Button
              variant="outline"
              onClick={onAddCompareModel}
              disabled={!canAddCompareModel}
              className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加对比模型
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
