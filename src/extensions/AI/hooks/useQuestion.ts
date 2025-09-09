import { useRef } from 'react';

import { AiApi } from '@/services/ai';
import { storage, STORAGE_KEYS } from '@/utils/localstorage';

enum AIState {
  INPUT = 'input',
  LOADING = 'loading',
  DISPLAY = 'display',
}

interface QuestionParams {
  // documentId: string;
  question: string;
  apiKey: string;
  model: string;
  useKnowledgeBase: boolean;
}

interface UseQuestionProps {
  updateState: (state: any) => void;
  setAiState: (state: AIState) => void;
  setText: (text: string) => void;
  updateAttributes: (attributes: Record<string, any>) => void;
  // documentId: string;
  setResponse: (response: string) => void;

  selectedModel: string;
}

export const useQuestion = ({
  updateState,
  setAiState,
  setText,
  setResponse,
  updateAttributes,
  selectedModel,
}: UseQuestionProps) => {
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
            console.log('问答响应完成:', accumulatedResponseRef.current);

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
                console.log('问答结束');
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

  const handleQuestion = async (
    question: string,
    abortRef: React.MutableRefObject<(() => void) | undefined>,
  ) => {
    if (!question?.trim()) return;

    accumulatedResponseRef.current = '';
    updateState({ aiState: AIState.LOADING });

    try {
      const apiKeys = storage.get(STORAGE_KEYS.API_KEYS);
      const siliconflowApiKey = apiKeys?.siliconflow;

      // 如果没有 API 密钥，提示用户配置
      if (!siliconflowApiKey) {
        setAiState(AIState.INPUT);
        setResponse('');
        updateAttributes({ aiState: AIState.INPUT, response: '' });

        return;
      }

      // SSE流式数据处理
      const requestData: QuestionParams = {
        question: question,
        apiKey: siliconflowApiKey,
        model: selectedModel,
        useKnowledgeBase: true,
      };

      // 问答
      resetAccumulatedResponse();
      abortRef.current = await AiApi.Question(requestData, processSSEResponse, () => {
        updateState({ aiState: AIState.INPUT });
        updateAttributes({
          aiState: AIState.DISPLAY,
        });
      });
    } catch (error) {
      console.error('问答过程中出错:', error);
      updateState({
        aiState: AIState.INPUT,
        response: '',
      });
    }
  };

  return {
    processSSEResponse,
    resetAccumulatedResponse,
    accumulatedResponseRef,
    handleQuestion,
  };
};

export { AIState };
