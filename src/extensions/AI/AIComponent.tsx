import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import { BrainCircuit } from 'lucide-react';

// AI组件状态枚举
enum AIState {
  INPUT = 'input', // 输入状态：可以输入prompt
  LOADING = 'loading', // 加载状态：正在生成AI响应
  DISPLAY = 'display', // 显示状态：显示AI响应结果
}

import { createActionButtons } from './actionButtons';
import { useAnimatedText } from './components/useAnimatedText';
import { useTextExtraction } from './hooks/useTextExtraction';
import AILoadingStatus from './components/AILoadingStatus';
import AIInputPanel from './components/AIInputPanel';

import { AiApi } from '@/services/ai';

interface AIComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  editor: Editor;
  getPos: () => number | undefined;
}

export const AIComponent: React.FC<AIComponentProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const params = useParams();
  const documentId = params?.room as string;
  const [prompt, setPrompt] = useState(node.attrs.prompt || '');
  const [response, setResponse] = useState(node.attrs.response || '');
  // 统一的AI状态管理
  const [aiState, setAiState] = useState<AIState>(node.attrs.aiState || AIState.DISPLAY);

  const [selectedModel, setSelectedModel] = useState('deepseek-ai/DeepSeek-V3'); // 新增模型状态
  const [showImage, setShowImage] = useState(false); // 图片生成状态
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const [animatedText, setText] = useAnimatedText();
  const { buildContentString } = useTextExtraction(editor);
  const accumulatedResponseRef = useRef('');
  const abortRef = useRef<() => void | undefined>(undefined);

  // 统一状态更新函数
  const updateState = (
    newState: Partial<{ aiState: AIState; response: string; prompt: string }>,
  ) => {
    if (newState.aiState !== undefined) {
      setAiState(newState.aiState);
    }

    if (newState.response !== undefined) {
      setResponse(newState.response);
    }

    if (newState.prompt !== undefined) {
      setPrompt(newState.prompt);
    }

    updateAttributes(newState);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [prompt]);

  useEffect(() => {
    // 因为如果获取不到 焦点无法 focuse
    setTimeout(() => {
      if (textareaRef.current && aiState !== AIState.LOADING) {
        textareaRef.current.focus();
      }
    }, 100);

    // 监听点击其他区域，input 框隐藏
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        if (response) {
          // 如果有response，替换整个AI节点为段落
          const pos = getPos();

          if (pos !== undefined) {
            const nodeSize = node.nodeSize;
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + nodeSize })
              .insertContentAt(pos, `<p>${response}</p>`)
              .run();
          }
        } else {
          // 如果没有response，只是隐藏输入状态
          updateState({ aiState: AIState.DISPLAY });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [aiState, response, editor]);

  // 状态切换时重置动画文本
  useEffect(() => {
    if (aiState !== AIState.LOADING) {
      setText(''); // 清空动画文本
    }
  }, [aiState]);

  const handleGenerateAI = async () => {
    if (!prompt?.trim() || aiState === AIState.LOADING) return;
    accumulatedResponseRef.current = '';

    updateState({ aiState: AIState.LOADING });

    try {
      const contentString = buildContentString(prompt, node.attrs.op);
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

      let buffer = '';

      abortRef.current = await AiApi.ContinueWriting(requestData, async (response: Response) => {
        // 获取流式响应
        const reader = response.body?.getReader();

        if (!reader) {
          throw new Error('无法获取响应流');
        }

        const decoder = new TextDecoder();

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
      });
    } catch (error) {
      console.error('AI生成过程中出错:', error);
      updateState({
        aiState: AIState.INPUT,
        response: '错误：请求过程中出错',
      });
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    updateAttributes({ prompt: newPrompt });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && aiState !== AIState.LOADING) {
      e.preventDefault();
      handleGenerateAI();
    }
  };

  // 图片生成处理函数
  const handleToggleImage = () => {
    setShowImage(!showImage);
    // TODO: 实现图片生成逻辑
    console.log('Toggle image generation:', !showImage);
  };

  // 按钮配置数据
  const baseButtons = createActionButtons(
    false, // showSearch
    false, // showThink
    false, // showCanvas
    showImage, // showImage
    () => {}, // search toggle
    () => {}, // think toggle
    () => {}, // canvas toggle
    handleToggleImage, // image toggle
    aiState === AIState.LOADING,
  );

  const actionButtons = [
    ...baseButtons,
    {
      id: 'model',
      label: 'Model',
      icon: BrainCircuit,
      color: '#7C3AED',
      bgColor: 'bg-[#7C3AED]/20',
      hoverBgColor: 'hover:bg-[#7C3AED]/30',
      isActive: false,
      disabled: aiState === AIState.LOADING,
      onClick: () => {},
    },
  ];

  const hasContent = prompt?.trim() !== '';

  return (
    <NodeViewWrapper className="ai-block">
      {/* 返回值显示 */}
      <div className="w-full max-w-4xl mx-auto">
        {/* AI Input Box */}
        {aiState === AIState.LOADING ? (
          <>
            <div className="mb-2">{animatedText}</div>
            <AILoadingStatus
              onCancel={() => {
                abortRef.current?.();
                setAiState(AIState.INPUT);
                updateAttributes({ loading: false });
              }}
            />
          </>
        ) : (
          <>
            {(aiState === AIState.DISPLAY || aiState === AIState.INPUT) && response && (
              <p>{response}</p>
            )}
            {aiState === AIState.INPUT && (
              <>
                <AIInputPanel
                  prompt={prompt}
                  onPromptChange={handlePromptChange}
                  onKeyDown={handleKeyDown}
                  onGenerateAI={handleGenerateAI}
                  isLoading={(aiState as AIState) === AIState.LOADING}
                  hasContent={hasContent}
                  actionButtons={actionButtons}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  textareaRef={textareaRef}
                  uploadInputRef={uploadInputRef}
                  componentRef={componentRef}
                />
              </>
            )}
          </>
        )}
        {/* AI Response */}
      </div>
    </NodeViewWrapper>
  );
};

export default AIComponent;
