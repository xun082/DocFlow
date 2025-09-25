import { useRef } from 'react';
import { Editor } from '@tiptap/core';

import { AiApi } from '@/services/ai';
import { storage, STORAGE_KEYS } from '@/utils/localstorage';

enum AIState {
  INPUT = 'input',
  LOADING = 'loading',
  DISPLAY = 'display',
}

interface UseSSEStreamProps {
  updateState: (state: any) => void;
  setAiState: (state: AIState) => void;
  updateAttributes: (attributes: Record<string, any>) => void;
  buildContentString: (prompt: string, op?: string) => string;
  documentId: string;
  selectedModel: string;
  setResponse: (response: string) => void;
  editor: Editor;
  useKnowledgeBase: boolean; // 添加知识库开关参数
}

export const useSSEStream = ({
  updateState,
  setAiState,
  updateAttributes,
  buildContentString,
  documentId,
  selectedModel,
  setResponse,
  editor,
  useKnowledgeBase,
}: UseSSEStreamProps) => {
  const accumulatedResponseRef = useRef('');

  const processSSEResponse = async (response: Response) => {
    // 获取流式响应
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let lineString = '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              // AI响应完成，切换到显示状态
              setAiState(AIState.DISPLAY);
              updateState({ aiState: AIState.DISPLAY });
              console.log('AI响应完成:', accumulatedResponseRef.current);

              return;
            }

            try {
              const parsedData = JSON.parse(data);

              // 检查是否有choices数组和delta内容
              if (parsedData.choices && parsedData.choices.length > 0) {
                const choice = parsedData.choices[0];

                // 检查finish_reason来判断是否完成
                if (choice.finish_reason === 'stop') {
                  // 流式传输完成，同步响应内容并切换到显示状态
                  updateState({
                    response: accumulatedResponseRef.current,
                    prompt: '',
                    aiState: AIState.DISPLAY,
                  });
                  setAiState(AIState.DISPLAY);

                  return;
                } else if (choice.delta && choice.delta.content) {
                  // 累积接收到的内容
                  const newContent = accumulatedResponseRef.current + choice.delta.content;
                  accumulatedResponseRef.current = newContent;
                  lineString += choice.delta.content;
                }
              }

              setResponse(accumulatedResponseRef.current);

              const pos = editor.state.selection.from;
              editor.commands.updateStreamingContent(pos, lineString);
            } catch (parseError) {
              console.error('解析SSE数据失败:', parseError);
            }
          }
        }
      }
    } catch (error) {
      // 处理中止错误
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('流读取被中止:', error);
        // 中止是预期行为，不需要额外处理
      } else {
        // 其他错误需要重新抛出
        console.error('流读取过程中出错:', error);
        throw error;
      }
    }
  };

  const resetAccumulatedResponse = () => {
    accumulatedResponseRef.current = '';
  };

  const handleGenerateAI = async (
    prompt: string,
    nodeAttrs: any,
    abortRef: React.MutableRefObject<(() => void) | undefined>,
  ) => {
    console.log('=== useSSEStream handleGenerateAI 开始 ===', {
      prompt: prompt?.trim(),
      nodeAttrs,
      op: nodeAttrs.op,
    });

    if (!prompt?.trim()) {
      console.log('useSSEStream: prompt为空，直接返回');

      return;
    }

    console.log('useSSEStream: 清空累积响应，设置加载状态');
    accumulatedResponseRef.current = '';
    updateState({ aiState: AIState.LOADING });

    try {
      const contentString = buildContentString(prompt, nodeAttrs.op);

      const apiKeys = storage.get(STORAGE_KEYS.API_KEYS);
      const siliconflowApiKey = apiKeys?.siliconflow;

      // SSE流式数据处理 - 构建基础请求参数
      const requestData: any = {
        model: selectedModel,
        errorHandler: (error: any) => {
          console.error('useSSEStream: SSE错误处理器被调用:', error);
          updateState({ aiState: AIState.INPUT });
          updateAttributes({
            aiState: AIState.DISPLAY,
          });
        },
      };

      // 只有当API密钥存在且不为空时才添加到请求参数中
      if (siliconflowApiKey?.trim()) {
        requestData.apiKey = siliconflowApiKey.trim();
      }
      // 如果没有API密钥，完全不传递apiKey参数，让后端使用系统默认配置

      // 续写
      resetAccumulatedResponse();

      if (nodeAttrs.op === 'continue') {
        // 构建续写请求参数
        const continueParams: any = {
          documentId: documentId,
          content: contentString,
          model: selectedModel,
        };

        // 只有存在API密钥时才添加
        if (requestData.apiKey) {
          continueParams.apiKey = requestData.apiKey;
        }

        abortRef.current = await AiApi.ContinueWriting(continueParams, processSSEResponse);
      } else {
        // 构建问答请求参数
        const questionParams: any = {
          question: prompt,
          model: selectedModel,
          useKnowledgeBase: useKnowledgeBase, // 使用传入的知识库开关状态
        };

        // 只有存在API密钥时才添加
        if (requestData.apiKey) {
          questionParams.apiKey = requestData.apiKey;
        }

        abortRef.current = await AiApi.Question(questionParams, processSSEResponse);
      }
    } catch (error) {
      console.error('useSSEStream: catch块捕获到错误:', {
        error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack',
      });

      // 区分中止错误和其他错误
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('AI生成被中止:', error);
        // 中止是预期行为，只需更新状态
        updateState({
          aiState: AIState.INPUT,
        });
      } else {
        // 其他错误需要显示错误信息
        console.error('useSSEStream: 非中止错误，重置状态:', error);
        updateState({
          aiState: AIState.INPUT,
          response: '',
        });
      }
    }
  };

  return {
    processSSEResponse,
    resetAccumulatedResponse,
    accumulatedResponseRef,
    handleGenerateAI,
  };
};

export { AIState };
