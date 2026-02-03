import { useState, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/core';
import { toast } from 'sonner';

import { ChatAiApi, type StreamChunk } from '@/services/chat-ai';

export type AIState = 'input' | 'loading' | 'display';

interface UseAIStreamOptions {
  initialState?: AIState;
  initialResponse?: string;
  onUpdate?: (response: string) => void;
  onComplete?: (response: string) => void;
  onError?: () => void;
}

/**
 * 通用的 AI 流式响应 Hook
 * 处理状态管理、流式响应、错误处理等公共逻辑
 */
export function useAIStream(options: UseAIStreamOptions = {}) {
  const { initialState = 'input', initialResponse = '', onUpdate, onComplete, onError } = options;

  const [state, setState] = useState<AIState>(initialState);
  const [response, setResponse] = useState(initialResponse);
  const abortRef = useRef<(() => void) | undefined>(undefined);
  const accumulatedResponseRef = useRef('');
  const responseRef = useRef<HTMLDivElement>(null);

  // 重置状态
  const reset = useCallback(() => {
    setState('input');
    setResponse('');
    accumulatedResponseRef.current = '';
    abortRef.current = undefined;
  }, []);

  // 开始加载
  const startLoading = useCallback(() => {
    setState('loading');
    accumulatedResponseRef.current = '';
    setResponse('');
  }, []);

  // 停止加载
  const stop = useCallback(() => {
    try {
      abortRef.current?.();
    } catch {
      // 静默处理停止错误
    } finally {
      setState('display');
    }
  }, []);

  // 处理流式响应
  const handleStreamChunk = useCallback(
    (chunk: StreamChunk) => {
      if (chunk.event === 'message' && chunk.content) {
        accumulatedResponseRef.current += chunk.content;
        setResponse(accumulatedResponseRef.current);
        onUpdate?.(accumulatedResponseRef.current);
      } else if (chunk.event === 'done' || chunk.finish_reason === 'stop') {
        setState('display');
        onComplete?.(accumulatedResponseRef.current);
      }
    },
    [onUpdate, onComplete],
  );

  // 处理错误
  const handleError = useCallback(() => {
    setState('display');
    onError?.();
  }, [onError]);

  return {
    state,
    setState,
    response,
    setResponse,
    responseRef,
    abortRef,
    reset,
    startLoading,
    stop,
    handleStreamChunk,
    handleError,
  };
}

/**
 * AI 续写专用 Hook
 */
export function useAIContinue(
  editor: Editor,
  getPos: () => number | undefined,
  updateAttributes: (attrs: Record<string, any>) => void,
) {
  const stream = useAIStream({
    onUpdate: (response) => {
      const pos = getPos();

      if (pos !== undefined) {
        editor.commands.updateContinueContent(pos, response);
      }
    },
    onComplete: (response) => {
      updateAttributes({ state: 'display', response });
    },
  });

  const generate = useCallback(
    async (model: string) => {
      const aiNodePos = getPos();
      if (aiNodePos === undefined) return;

      // 获取当前节点之前的所有内容
      const contentBefore = editor.state.doc.textBetween(0, aiNodePos, '\n\n');

      stream.startLoading();
      updateAttributes({ state: 'loading' });

      try {
        stream.abortRef.current = await ChatAiApi.Autocomplete(
          { content: contentBefore, model },
          stream.handleStreamChunk,
          () => {
            toast.error('续写失败，请重试');
            stream.handleError();
          },
        );
      } catch {
        toast.error('续写失败，请重试');
        stream.handleError();
      }
    },
    [editor, getPos, updateAttributes, stream],
  );

  return { ...stream, generate };
}

/**
 * AI 润色专用 Hook
 */
export function useAIPolish(
  editor: Editor,
  getPos: () => number | undefined,
  updateAttributes: (attrs: Record<string, any>) => void,
  originalContent: string,
) {
  const stream = useAIStream({
    onUpdate: (response) => {
      const pos = getPos();

      if (pos !== undefined) {
        editor.commands.updatePolishContent(pos, response);
      }
    },
    onComplete: (response) => {
      updateAttributes({ state: 'display', response });
    },
  });

  const generate = useCallback(
    async (model: string, temperature: number = 0.7) => {
      if (!originalContent?.trim()) {
        stream.handleError();

        return;
      }

      stream.startLoading();
      updateAttributes({ state: 'loading', originalContent });

      try {
        stream.abortRef.current = await ChatAiApi.Polish(
          { content: originalContent, model, temperature },
          stream.handleStreamChunk,
          () => {
            toast.error('AI 润色失败，请重试');
            stream.handleError();
          },
        );
      } catch {
        toast.error('AI 润色失败，请重试');
        stream.handleError();
      }
    },
    [originalContent, updateAttributes, stream],
  );

  return { ...stream, generate };
}
