/**
 * Chat AI 类型定义
 */

/** 聊天消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system';

/** 聊天消息 */
export interface ChatMessage {
  /** 消息 ID */
  id: string;
  /** 消息角色 */
  role: MessageRole;
  /** 消息内容 */
  content: string;
  /** 推理内容（深度思考模式） */
  reasoning_content?: string;
  /** 创建时间 */
  created_at: string;
}

/** 会话信息 */
export interface Conversation {
  /** 会话 ID */
  id: string;
  /** 会话标题 */
  title: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  last_message_at: string;
  /** 消息数量 */
  message_count: number;
}

/** 会话详情（包含消息列表） */
export interface ConversationDetail extends Conversation {
  /** 消息列表 */
  messages: ChatMessage[];
}

/** 聊天补全请求参数 */
export interface CompletionsRequest {
  /** 会话 ID (UUID)，如果不传则创建新会话 */
  conversation_id?: string;
  /** 模型名称 (预留字段，后端暂不支持) */
  model?: string;
  /** 消息列表 */
  messages: Array<{
    /** 消息角色：user, assistant, system */
    role: MessageRole;
    /** 消息内容 */
    content: string;
  }>;
  /** 生成的最大令牌数 (1-32768, 默认 1024) */
  max_tokens?: number;
  /** 采样温度 (0-2, 默认 1) */
  temperature?: number;
  /** Top-P 参数：核采样 (预留字段) */
  top_p?: number;
  /** 是否启用思维链 (预留字段) */
  enable_thinking?: boolean;
  /** 思维预算 (预留字段) */
  thinking_budget?: number;
  /** 是否启用联网搜索（启用后会先搜索相关网页内容，默认 false） */
  enable_web_search?: boolean;
  /** Top-k 采样参数 */
  top_k?: number;
  /** 频率惩罚参数 (-2.0 到 2.0) */
  frequency_penalty?: number;
  /** 最小概率参数 (0-1) */
  min_p?: number;
  /** 停止序列，最多 4 个 */
  stop?: string[];
  /** 生成结果数量 */
  n?: number;
}

/** AI 续写请求参数 */
export interface AutocompleteRequest {
  /** Markdown 格式的已有内容 */
  content: string;
  /** AI 模型名称，默认 Pro/moonshotai/Kimi-k2.5 */
  model?: string;
  /** 采样温度 (0-2)，较高的值让输出更有创意，默认 0.8 */
  temperature?: number;
}

/** AI 润色请求参数 */
export interface PolishRequest {
  /** Markdown 格式的内容 */
  content: string;
  /** AI 模型名称，默认 Pro/moonshotai/Kimi-k2.5 */
  model?: string;
  /** 采样温度 (0-2)，较高的值让输出更有创意，默认 0.7 */
  temperature?: number;
}

/** AI 头脑风暴请求参数 */
export interface BrainstormRequest {
  /** 头脑风暴的主题 */
  topic: string;
  /** 生成的不同方案数量 (1-5) */
  n?: number;
  /** AI 模型名称 */
  model?: string;
  /** 采样温度 (0-2)，默认 1.2 */
  temperature?: number;
}

/** OpenAI 格式的原始流式响应 */
export interface OpenAIStreamResponse {
  /** 响应 ID */
  id?: string;
  /** 会话 ID */
  conversation_id?: string;
  /** 选择列表 */
  choices?: Array<{
    /** 选择索引 */
    index?: number;
    /** 增量内容 */
    delta?: {
      /** 消息内容 */
      content?: string;
      /** 推理内容（深度思考模式） */
      reasoning_content?: string;
    };
    /** 完成原因 */
    finish_reason?: string;
  }>;
}

/** SSE 流式响应事件数据 */
export interface StreamChunk {
  /** 事件类型 */
  event?: 'message' | 'done' | 'error';
  /** 选择索引（用于多结果场景） */
  index?: number;
  /** 内容片段 */
  content?: string;
  /** 推理内容片段（深度思考模式） */
  reasoning_content?: string;
  /** 会话 ID（首次响应时返回） */
  conversation_id?: string;
  /** 消息 ID */
  message_id?: string;
  /** 错误信息 */
  error?: string;
  /** 完成原因 */
  finish_reason?: string;
}

/** 会话列表响应 */
export interface ConversationsResponse {
  list: Conversation[];
  total: number;
}

/** 聊天模型信息 */
export interface ChatModel {
  /** 模型 ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 模型描述 */
  description: string;
  /** 是否支持深入思考 */
  support_thinking: boolean;
  /** 最大上下文长度 */
  max_context_length: number;
}

/** 模型列表响应 */
export interface ModelListResponse {
  list: ChatModel[];
}
