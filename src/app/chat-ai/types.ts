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
  /** 最大生成 Token 数量 (1-32768, 默认 1024) */
  maxTokens: number;
  /** 温度参数：控制输出的随机性 (0-2, 默认 1) */
  temperature: number;
  /** Top-P 参数：核采样，控制候选词的概率质量 */
  topP: number;
  /** 是否启用思维链（Chain of Thought） */
  enableThinking: boolean;
  /** 思维预算：分配给推理思考的 Token 数量 */
  thinkingBudget: number;
  /** 是否启用联网搜索（启用后会先搜索相关网页内容） */
  enableWebSearch: boolean;
  /** 系统提示词：用于设定 AI 的角色 and 行为 */
  systemPrompt: string;
  /** Top-k 采样参数 */
  topK: number;
  /** 频率惩罚参数 (-2.0 到 2.0) */
  frequencyPenalty: number;
  /** 最小概率参数 (0-1) */
  minP: number;
  /** 停止序列 */
  stop: string[];
  /** 生成结果数量 */
  n: number;
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

/**
 * 聊天会话接口
 * 用于历史记录管理
 */
export interface ChatSession {
  /** 会话唯一标识符 */
  id: string;
  /** 会话标题 */
  title: string;
  /** 创建时间 */
  createdAt: Date;
  /** 最后一条消息时间 */
  lastMessageAt: Date;
  /** 消息数量 */
  messageCount: number;
}

/**
 * 聊天消息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  /** 消息唯一标识符 */
  id: string;
  /** 消息角色 */
  role: MessageRole;
  /** 消息内容 */
  content: string;
  /** 创建时间 */
  createdAt: Date;
  /** 是否正在流式加载中 */
  isStreaming?: boolean;
}

/**
 * 聊天状态
 */
export type ChatStatus = 'idle' | 'loading' | 'streaming' | 'error';

/**
 * 聊天状态接口
 */
export interface ChatState {
  /** 当前状态 */
  status: ChatStatus;
  /** 消息列表 */
  messages: ChatMessage[];
  /** 错误信息 */
  error?: string;
}
