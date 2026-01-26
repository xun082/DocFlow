/**
 * Chat AI 模块类型定义
 * 定义了模型配置和相关状态的类型
 */

/**
 * 模型配置接口
 * 包含调用 AI 模型所需的所有参数配置
 */
export interface ModelConfig {
  /** 模型唯一标识符 */
  id: string;
  /** 模型名称，用于显示 */
  modelName: string;
  /** 最大生成 Token 数量 */
  maxTokens: number;
  /** 温度参数：控制输出的随机性，值越高结果越随机 */
  temperature: number;
  /** Top-P 参数：核采样，控制候选词的概率质量 */
  topP: number;
  /** 是否启用思维链（Chain of Thought） */
  enableThinking: boolean;
  /** 思维预算：分配给推理思考的 Token 数量 */
  thinkingBudget: number;
}

/**
 * 可选模型列表
 */
export interface ModelOption {
  value: string;
  label: string;
}

/**
 * 快捷问题接口
 */
export interface QuickQuestion {
  id: string;
  text: string;
}
