'use client';

/**
 * 聊天侧边栏组件
 *
 * 功能说明：
 * - 提供模型参数配置面板
 * - 包含模型选择、Token 设置、温度、Top-P 等参数
 * - 支持添加对比模型
 *
 * 参数解释（中文）：
 * - Model（模型）: 选择要使用的 AI 模型
 * - Max Tokens（最大令牌数）: 控制生成文本的最大长度
 * - Temperature（温度）: 控制输出的随机性，值越高结果越发散
 * - Top-P（核采样）: 控制采样时考虑的词汇概率质量
 * - Enable Thinking（启用思维链）: 让模型展示推理过程
 * - Thinking Budget（思维预算）: 分配给推理的 Token 数量
 */

import React from 'react';
import { Plus, HelpCircle } from 'lucide-react';
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
import type { ModelConfig } from '../types';
import { MODEL_OPTIONS, THINKING_OPTIONS } from '../constants';

// 类型定义

interface ChatSidebarProps {
  /** 当前模型配置 */
  config: ModelConfig;
  /** 配置变更回调 */
  onConfigChange: (config: ModelConfig) => void;
  /** 添加对比模型回调 */
  onAddCompareModel: () => void;
  /** 是否可以添加对比模型 */
  canAddCompareModel: boolean;
}

// 辅助组件：带提示的标签

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
}

/**
 * 带问号提示的标签组件
 */
function LabelWithTooltip({ label, tooltip }: LabelWithTooltipProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <Tooltip title={tooltip}>
        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
      </Tooltip>
    </div>
  );
}

// 辅助组件：滑块输入

interface SliderInputProps {
  label: string;
  tooltip: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

/**
 * 滑块输入组件，包含数值显示和滑块控制
 */
function SliderInput({ label, tooltip, value, min, max, step, onChange }: SliderInputProps) {
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

// ============================================================================
// 主组件
// ============================================================================

export function ChatSidebar({
  config,
  onConfigChange,
  onAddCompareModel,
  canAddCompareModel,
}: ChatSidebarProps) {
  // 更新配置的辅助函数
  const updateConfig = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <aside className="w-[200px] min-w-[200px] bg-white border-r border-gray-100 p-4 flex flex-col gap-5 overflow-y-auto">
      {/* ----- 模型选择 ----- */}
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

      {/* ----- Max Tokens 输入 ----- */}
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

      {/* ----- Temperature 滑块 ----- */}
      <SliderInput
        label="Temperature"
        tooltip="控制输出的随机性。值越高（接近 1），结果越发散多样；值越低（接近 0），结果越确定和保守。"
        value={config.temperature}
        min={0}
        max={1}
        step={0.1}
        onChange={(v) => updateConfig('temperature', v)}
      />

      {/* ----- Top-P 滑块 ----- */}
      <SliderInput
        label="Top-P"
        tooltip="核采样参数。模型只从概率累计达到 P 的候选词中采样。值越小，选择越集中；值越大，多样性越高。"
        value={config.topP}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => updateConfig('topP', v)}
      />

      {/* ----- Enable Thinking 选择 ----- */}
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

      {/* ----- Thinking Budget 输入 ----- */}
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

      {/* ----- 添加对比模型按钮 ----- */}
      <Button
        variant="outline"
        onClick={onAddCompareModel}
        disabled={!canAddCompareModel}
        className="mt-auto border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
      >
        <Plus className="h-4 w-4" />
        添加对比模型
      </Button>
    </aside>
  );
}
