'use client';

/**
 * Collaboration API — 文档 AI 编辑 Agent
 *
 * 使用与 chat-ai 完全一致的 clientRequest.streamPost 方案：
 * - 自动携带 auth_token（getCookie，与全站一致）
 * - 401 时自动刷新 token 并重试
 * - Sentry breadcrumb 上报
 * - 行级解析：data: {"type":"intent","data":{...}}\n\n
 */

import { clientRequest, RequestError } from '@/services/request';
import { getCookie } from '@/utils/auth/cookie';

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

export interface AgentIntent {
  action: string;
  target: { mode: string; heading?: string };
  description: string;
}

export interface AgentAnchor {
  anchorNodeId: string | null;
  insertMode: 'before' | 'after' | 'replace' | 'append';
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

export interface AgentOp {
  type: 'insert_after' | 'insert_before' | 'replace' | 'append_to_doc';
  nodeId: string | null;
  content: TiptapNode[];
}

export interface AgentProposal {
  proposalId: string;
  description: string;
  ops: AgentOp[];
}

export type AgentEditEventType =
  | 'thinking_token'
  | 'intent_token'
  | 'anchor_token'
  | 'proposal_token'
  | 'intent'
  | 'anchor'
  | 'proposal'
  | 'error'
  | 'done';

export interface AgentEditStreamEvent {
  type: AgentEditEventType;
  data:
    | AgentIntent
    | AgentAnchor
    | AgentProposal
    | { text: string }
    | { message: string }
    | Record<string, never>;
}

interface DocumentEditRequest {
  message: string;
  documentContent: Record<string, unknown>;
  documentId?: string;
}

// ─── 公共接口 ─────────────────────────────────────────────────────────────────

/**
 * 调用后端 Agent 编辑接口，流式接收每个阶段结果。
 *
 * 与 ChatAiApi 完全一致的调用方式：
 * - 使用 clientRequest.streamPost 发起请求
 * - 后端每行格式：data: {"type":"intent","data":{...}}
 * - parseOpenAIStreamLine 自动解析，onChunk 按 type 派发
 *
 * @returns cancel 函数，调用后中止请求
 */
export async function streamDocumentEdit(
  request: DocumentEditRequest,
  onEvent: (event: AgentEditStreamEvent) => void,
  onError?: (err: Error) => void,
): Promise<() => void> {
  // Pre-flight: if there's no auth token at all, redirect to login immediately
  // instead of sending an unauthenticated request and getting a cryptic 401.
  if (typeof window !== 'undefined' && !getCookie('auth_token')) {
    const loginUrl = `/auth?redirect_to=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    window.location.href = loginUrl;
    return () => {};
  }

  try {
    return await clientRequest.streamPost<AgentEditStreamEvent>(
      '/api/v1/collaboration/agent/edit',
      {
        // LangGraph 三节点串行调用 LLM，留足时间
        timeout: 120000,
        params: request,
        headers: { Accept: 'text/event-stream' },
        errorHandler: {
          onError: (err) => onError?.(err instanceof Error ? err : new Error(String(err))),
        },
      },
      (chunk) => {
        onEvent(chunk);
      },
    );
  } catch (err: unknown) {
    // 401 时 clientRequest.streamPost 内部已调用 handleAuthFailure() 发起跳转登录
    // 此处静默处理，避免短暂闪现错误面板
    if (err instanceof RequestError && err.status === 401) {
      return () => {};
    }

    onError?.(err instanceof Error ? err : new Error(String(err)));
    return () => {};
  }
}
