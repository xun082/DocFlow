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
 * 联网搜索选项
 */
export const WEB_SEARCH_OPTIONS = [
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
 * 默认系统提示词
 */
export const DEFAULT_SYSTEM_PROMPT = '你是一个专业、礼貌、高效的 AI 助手。';

/**
 * 默认模型配置
 */
export const DEFAULT_MODEL_CONFIG: Omit<ModelConfig, 'id'> = {
  modelName: MODEL_OPTIONS[0].value,
  maxTokens: 1024,
  temperature: 1,
  topP: 0.95,
  enableThinking: true,
  thinkingBudget: 4096,
  enableWebSearch: false,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  topK: 50,
  frequencyPenalty: 0.5,
  minP: 0.05,
  stop: [],
  n: 1,
};

/**
 * 初始主模型配置（使用固定 ID 避免 Hydration 错误）
 */
export const INITIAL_PRIMARY_MODEL: ModelConfig = {
  id: 'primary-model',
  ...DEFAULT_MODEL_CONFIG,
};

/** 用于生成唯一 ID 的计数器 */
let modelIdCounter = 0;

/**
 * 创建新的模型配置
 * 注意：此函数仅在客户端事件处理中调用，不要在组件初始化时使用
 * @param overrides 覆盖的配置项
 * @returns 完整的模型配置
 */
export function createModelConfig(overrides?: Partial<ModelConfig>): ModelConfig {
  modelIdCounter += 1;

  return {
    id: `model-${modelIdCounter}-${Date.now()}`,
    ...DEFAULT_MODEL_CONFIG,
    ...overrides,
  };
}
