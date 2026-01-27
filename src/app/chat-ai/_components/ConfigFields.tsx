'use client';

/**
 * 模型配置表单项组
 *
 * 包含 Model / Max Tokens / Temperature / Top-P / Enable Thinking / Thinking Budget / 联网搜索，
 * 供主模型与对比模型配置复用。
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

import type { ModelConfig } from '../types';
import { MODEL_OPTIONS, THINKING_OPTIONS, WEB_SEARCH_OPTIONS } from '../constants';

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

/**
 * 带提示的标签组件
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
 * 滑块输入组件的属性接口
 */
interface SliderInputProps {
  /** 字段标签文本 */
  label: string;
  /** 悬浮提示文本 */
  tooltip: string;
  /** 当前数值 */
  value: number;
  /** 允许的最小值 */
  min: number;
  /** 允许的最大值 */
  max: number;
  /** 调整的步进值 */
  step: number;
  /** 值变更时的回调函数 */
  onChange: (value: number) => void;
}

/**
 * 滑块输入组件
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

export interface ConfigFieldsProps {
  config: ModelConfig;
  updateConfig: UpdateConfigFn;
}

export default function ConfigFields({ config, updateConfig }: ConfigFieldsProps) {
  return (
    <div className="space-y-5">
      {/* 模型选择 */}
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

      {/* Max Tokens */}
      <div className="space-y-2">
        <LabelWithTooltip
          label="Max Tokens"
          tooltip="生成的最大令牌数 (1-32768)，控制回复的最大长度。"
        />
        <Input
          type="number"
          value={config.maxTokens}
          onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value) || 1024)}
          min={1}
          max={32768}
          className="w-24 h-8 text-sm"
        />
      </div>

      {/* Temperature */}
      <SliderInput
        label="Temperature"
        tooltip="采样温度 (0-2)。值越高结果越随机多样，值越低结果越确定保守。"
        value={config.temperature}
        min={0}
        max={2}
        step={0.1}
        onChange={(v) => updateConfig('temperature', v)}
      />

      {/* Top-P */}
      <SliderInput
        label="Top-P"
        tooltip="核采样参数。模型只从概率累计达到 P 的候选词中采样。值越小，选择越集中；值越大，多样性越高。"
        value={config.topP}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => updateConfig('topP', v)}
      />

      {/* Enable Thinking */}
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

      {/* Thinking Budget */}
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

      {/* 联网搜索 */}
      <div className="space-y-2">
        <LabelWithTooltip
          label="联网搜索"
          tooltip="启用后会先搜索相关网页内容，获取最新信息来回答问题。"
        />
        <Select
          value={config.enableWebSearch ? 'enabled' : 'disabled'}
          onValueChange={(v) => updateConfig('enableWebSearch', v === 'enabled')}
        >
          <SelectTrigger className="w-full h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEB_SEARCH_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
