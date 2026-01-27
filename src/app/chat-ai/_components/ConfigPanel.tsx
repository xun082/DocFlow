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

import React from 'react';
import { ChevronDown, ChevronUp, Plus, HelpCircle, X } from 'lucide-react';

import type { ModelConfig } from '../types';
import { MODEL_OPTIONS, THINKING_OPTIONS } from '../constants';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip } from '@/components/ui/Tooltip';
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

/**
 * 带问号提示的标签组件
 */
function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <Tooltip title={tooltip}>
        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
      </Tooltip>
    </div>
  );
}

/**
 * 滑块输入组件
 */
function SliderInput({
  label,
  tooltip,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  tooltip: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <LabelWithTooltip label={label} tooltip={tooltip} />
      <div className="flex items-center gap-3">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          min={min}
          max={max}
          step={step}
          className="w-20 h-8 text-sm"
        />
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
      </div>
    </div>
  );
}

type UpdateConfigFn = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => void;

/**
 * 模型配置表单项组（Model / Max Tokens / Temperature / Top-P / Enable Thinking / Thinking Budget）
 */
function ConfigFields({ config, updateConfig }: { config: ModelConfig; updateConfig: UpdateConfigFn }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Model</span>
        <Select value={config.modelName} onValueChange={(v) => updateConfig('modelName', v)}>
          <SelectTrigger className="w-full h-9">
            <SelectValue placeholder="选择模型" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Max Tokens</span>
        <Input
          type="number"
          value={config.maxTokens}
          onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value) || 1024)}
          min={1}
          max={32768}
          className="w-24 h-8 text-sm"
        />
      </div>
      <SliderInput
        label="Temperature"
        tooltip="控制输出的随机性。值越高（接近 1），结果越发散多样；值越低（接近 0），结果越确定和保守。"
        value={config.temperature}
        min={0}
        max={1}
        step={0.1}
        onChange={(v) => updateConfig('temperature', v)}
      />
      <SliderInput
        label="Top-P"
        tooltip="核采样参数。模型只从概率累计达到 P 的候选词中采样。值越小，选择越集中；值越大，多样性越高。"
        value={config.topP}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => updateConfig('topP', v)}
      />
      <div className="space-y-2">
        <LabelWithTooltip
          label="Enable Thinking"
          tooltip="启用思维链（Chain of Thought），让模型展示其推理过程，有助于得到更准确的答案。"
        />
        <Select
          value={config.enableThinking ? 'enabled' : 'disabled'}
          onValueChange={(v) => updateConfig('enableThinking', v === 'enabled')}
        >
          <SelectTrigger className="w-full h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THINKING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <LabelWithTooltip
          label="Thinking Budget"
          tooltip="分配给模型推理思考的 Token 预算。更高的预算允许更深入的思考，但会增加响应时间。"
        />
        <Input
          type="number"
          value={config.thinkingBudget}
          onChange={(e) => updateConfig('thinkingBudget', parseInt(e.target.value) || 1024)}
          min={512}
          max={16384}
          className="w-24 h-8 text-sm"
          disabled={!config.enableThinking}
        />
      </div>
    </div>
  );
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
      : (() => {}) as UpdateConfigFn;

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
