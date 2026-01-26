/**
 * Chat AI 模块常量定义
 */

import type { ModelOption, QuickQuestion, ModelConfig } from './types';

/**
 * 可选择的模型列表
 */
export const MODEL_OPTIONS: ModelOption[] = [
  { value: 'glm-4.7-pro', label: 'GLM-4.7 (Pro)' },
  { value: 'glm-4', label: 'GLM-4' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
];

/**
 * 启用思维链选项
 */
export const THINKING_OPTIONS = [
  { value: 'enabled', label: '开启' },
  { value: 'disabled', label: '关闭' },
];

/**
 * 快捷问题列表
 */
export const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: 'q1', text: '非洲平头哥是哪种动物?' },
  { id: 'q2', text: '世界上最好的编程语言是哪个?' },
  { id: 'q3', text: '空穴来风的真正含义' },
  { id: 'q4', text: '大器晚成还是大器免成' },
];

/**
 * 默认模型配置
 */
export const DEFAULT_MODEL_CONFIG: Omit<ModelConfig, 'id'> = {
  modelName: 'glm-4.7-pro',
  maxTokens: 8192,
  temperature: 0.6,
  topP: 0.95,
  enableThinking: true,
  thinkingBudget: 4096,
};

/**
 * 创建新的模型配置
 * @param overrides 覆盖的配置项
 * @returns 完整的模型配置
 */
export function createModelConfig(overrides?: Partial<ModelConfig>): ModelConfig {
  return {
    id: `model-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    ...DEFAULT_MODEL_CONFIG,
    ...overrides,
  };
}
