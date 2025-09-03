import { useRef } from 'react';

import { AiApi } from '@/services/ai';

enum AIState {
  INPUT = 'input',
  LOADING = 'loading',
  DISPLAY = 'display',
}

interface UseSSEStreamProps {
  updateState: (state: any) => void;
  setAiState: (state: AIState) => void;
  setText: (text: string) => void;
  updateAttributes: (attributes: Record<string, any>) => void;
  buildContentString: (prompt: string, op?: string) => string;
  documentId: string;
  selectedModel: string;
}

export const useSSEStream = ({
  updateState,
  setAiState,
  setText,
  updateAttributes,
  buildContentString,
  documentId,
  selectedModel,
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
            setAiState(AIState.INPUT);
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
                console.log('结束');
                updateState({
                  response: accumulatedResponseRef.current,
                  prompt: '',
                  aiState: AIState.INPUT,
                });

                return;
              } else if (choice.delta && choice.delta.content) {
                // 累积接收到的内容
                const newContent = accumulatedResponseRef.current + choice.delta.content;
                accumulatedResponseRef.current = newContent;
                lineString += choice.delta.content;
              }
            }

            // 防止打字机效果漏字
            setText(lineString);
          } catch (parseError) {
            console.error('解析SSE数据失败:', parseError);
          }
        }
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
    if (!prompt?.trim()) return;

    accumulatedResponseRef.current = '';
    updateState({ aiState: AIState.LOADING });

    try {
      const contentString = buildContentString(prompt, nodeAttrs.op);
      const apiKeys = localStorage.getItem('docflow_api_keys');

      // SSE流式数据处理
      const requestData = {
        documentId: documentId,
        content: contentString,
        apiKey: apiKeys ? JSON.parse(apiKeys)?.siliconflow : '',
        model: selectedModel,
        errorHandler: () => {
          updateState({ aiState: AIState.INPUT });
          updateAttributes({
            aiState: AIState.DISPLAY,
          });
        },
      };

      // 续写
      resetAccumulatedResponse();
      abortRef.current = await AiApi.ContinueWriting(requestData, processSSEResponse);
    } catch (error) {
      console.error('AI生成过程中出错:', error);
      updateState({
        aiState: AIState.INPUT,
        response: '错误：请求过程中出错',
      });
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
