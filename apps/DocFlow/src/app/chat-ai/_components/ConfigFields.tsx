'use client';

/**
 * 模型配置表单项组
 *
 * 包含 Model / Max Tokens / Temperature / Top-P / Top-K / Frequency Penalty / Min-P / N / Stop Sequences / System Prompt，
 * 供主模型与对比模型配置复用。网页搜索和深度思考功能已移至聊天界面底部。
 */

import { HelpCircle } from 'lucide-react';

import type { ModelConfig } from '../types';
import { DEFAULT_MODEL_CONFIG } from '../constants';
import { useChatModels } from '../hooks/useChatModels';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip } from '@/components/ui/Tooltip';
import Textarea from '@/components/ui/Textarea';

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
          value={value ?? min}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          min={min}
          max={max}
          step={step}
          className="w-20 h-8 text-sm"
        />
        <input
          type="range"
          value={value ?? min}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
  // 使用 Hook 获取模型列表（从后端动态获取）
  const { models, isLoading } = useChatModels();

  // 解构配置项并应用默认值回退
  const {
    modelName = DEFAULT_MODEL_CONFIG.modelName,
    maxTokens = DEFAULT_MODEL_CONFIG.maxTokens,
    temperature = DEFAULT_MODEL_CONFIG.temperature,
    topP = DEFAULT_MODEL_CONFIG.topP,
    topK = DEFAULT_MODEL_CONFIG.topK,
    frequencyPenalty = DEFAULT_MODEL_CONFIG.frequencyPenalty,
    minP = DEFAULT_MODEL_CONFIG.minP,
    n = DEFAULT_MODEL_CONFIG.n,
    systemPrompt = DEFAULT_MODEL_CONFIG.systemPrompt,
    stop = DEFAULT_MODEL_CONFIG.stop,
  } = config;

  return (
    <div className="space-y-5">
      {/* 模型选择 */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Model</span>
        <Select
          value={modelName}
          onValueChange={(v) => updateConfig('modelName', v)}
          disabled={isLoading || models.length === 0}
        >
          <SelectTrigger className="w-full h-9">
            <SelectValue placeholder={isLoading ? '加载模型中...' : '选择模型'} />
          </SelectTrigger>
          <SelectContent>
            {models.map((option) => (
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
          value={maxTokens}
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
        value={temperature}
        min={0}
        max={2}
        step={0.1}
        onChange={(v) => updateConfig('temperature', v)}
      />

      {/* Top-P */}
      <SliderInput
        label="Top-P"
        tooltip="核采样参数。模型只从概率累计达到 P 的候选词中采样。值越小，选择越集中；值越大，多样性越高。"
        value={topP}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => updateConfig('topP', v)}
      />

      {/* Top-K */}
      <SliderInput
        label="Top-K"
        tooltip="Top-k 采样参数。模型从概率最高的前 K 个候选词中采样。值越小，生成内容越保守；值越大，内容越丰富。"
        value={topK}
        min={0}
        max={100}
        step={1}
        onChange={(v) => updateConfig('topK', v)}
      />

      {/* Frequency Penalty */}
      <SliderInput
        label="Frequency Penalty"
        tooltip="频率惩罚参数。正值会根据新标记在文本中出现的频率惩罚它们，从而降低模型逐字重复相同行的可能性。"
        value={frequencyPenalty}
        min={-2}
        max={2}
        step={0.1}
        onChange={(v) => updateConfig('frequencyPenalty', v)}
      />

      {/* Min-P */}
      <SliderInput
        label="Min-P"
        tooltip="最小概率参数。仅保留概率高于此阈值的标记。有助于在不牺牲多样性的情况下移除低质量的尾部概率。"
        value={minP}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => updateConfig('minP', v)}
      />

      {/* Generation Count (n) */}
      <SliderInput
        label="N (生成数量)"
        tooltip="控制每个输入提示生成的回复数量。建议范围 1-10 的整数。"
        value={n}
        min={1}
        max={10}
        step={1}
        onChange={(v) => {
          // 强制限制在 1-10 之间，且为整数
          const validValue = Math.max(1, Math.min(10, Math.floor(v)));
          updateConfig('n', validValue);
        }}
      />

      {/* Stop Sequences */}
      <div className="space-y-2">
        <LabelWithTooltip
          label="Stop Sequences"
          tooltip="停止序列。当模型生成这些序列中的任何一个时，它将停止生成。输入多个序列请用逗号分隔。"
        />
        <Input
          value={stop?.join(', ') || ''}
          onChange={(e) =>
            updateConfig(
              'stop',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s !== ''),
            )
          }
          placeholder="例如: [DONE], \n"
          className="h-8 text-sm"
        />
      </div>

      {/* System Prompt */}
      <div className="space-y-2">
        <LabelWithTooltip
          label="System Prompt"
          tooltip="设定 AI 的角色和行为规则。这是一个全局指令，会影响模型的所有回复。"
        />
        <Textarea
          value={systemPrompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateConfig('systemPrompt', e.target.value)
          }
          placeholder="输入系统提示词..."
          className="min-h-[100px] text-sm resize-none"
        />
      </div>
    </div>
  );
}
