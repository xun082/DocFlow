'use client';

/**
 * 模型配置表单项组
 *
 * 包含 Model / Max Tokens / Temperature / Top-P / Enable Thinking / Thinking Budget，
 * 供主模型与对比模型配置复用。
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

import type { ModelConfig } from '../types';
import { MODEL_OPTIONS, THINKING_OPTIONS } from '../constants';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip } from '@/components/ui/Tooltip';

/** 配置更新函数类型，供 ConfigPanel 等调用方使用 */
export type UpdateConfigFn = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => void;

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

export interface ConfigFieldsProps {
  config: ModelConfig;
  updateConfig: UpdateConfigFn;
}

export default function ConfigFields({ config, updateConfig }: ConfigFieldsProps) {
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
