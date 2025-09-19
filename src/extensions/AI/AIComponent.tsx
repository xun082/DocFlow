import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import { BrainCircuit, Database } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// AI组件状态枚举
enum AIState {
  INPUT = 'input', // 输入状态：可以输入prompt
  LOADING = 'loading', // 加载状态：正在生成AI响应
  DISPLAY = 'display', // 显示状态：显示AI响应结果
}

import { createActionButtons } from './actionButtons';
import { useTextExtraction } from './hooks/useTextExtraction';
import { useSSEStream } from './hooks/useSSEStream';
import { useTextToImage } from './hooks/useTextToImage';
import AILoadingStatus from './components/AILoadingStatus';
import AIInputPanel from './components/AIInputPanel';
import SyntaxHighlight from './components/SyntaxHighlight';

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
  const [aiState, setAiState] = useState<AIState>(() => {
    // 如果节点有aiState属性，使用它；否则根据是否有response来决定初始状态
    if (node.attrs.aiState) {
      return node.attrs.aiState as AIState;
    }
    // 如果有response说明是已生成的内容，显示DISPLAY状态
    // 如果没有response说明是新创建的，显示INPUT状态

    return (node.attrs.response || '').trim() ? AIState.DISPLAY : AIState.INPUT;
  });

  const [selectedModel, setSelectedModel] = useState('deepseek-ai/DeepSeek-V3'); // 新增模型状态
  const [showImage, setShowImage] = useState(false); // 图片生成状态
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true); // 知识库开关状态，默认开启
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const { buildContentString } = useTextExtraction(editor);
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

  const { handleGenerateAI: handleAIGeneration } = useSSEStream({
    updateState,
    setAiState,
    updateAttributes,
    buildContentString,
    documentId,
    selectedModel,
    setResponse,
    editor,
    useKnowledgeBase, // 传递知识库开关状态
  });

  const { generateImage } = useTextToImage({
    onSuccess: (imageUrl) => {
      const pos = getPos();

      if (pos !== undefined) {
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + node.nodeSize })
          .insertContentAt(pos + node.nodeSize, {
            type: 'imageBlock',
            attrs: { src: imageUrl },
          })
          .run();
      }
    },
    onError: () => {
      setAiState(AIState.INPUT);
      updateState({ aiState: AIState.DISPLAY });
    },
  });

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
        // 只有在INPUT状态下才处理点击外部事件
        if (aiState === AIState.INPUT) {
          if (response?.trim()) {
            // 如果有response，切换到显示状态
            updateState({ aiState: AIState.DISPLAY });
          } else {
            // 如果没有response，删除整个AI节点
            const pos = getPos();

            if (pos !== undefined) {
              const nodeSize = node.nodeSize;
              editor
                .chain()
                .focus()
                .deleteRange({ from: pos, to: pos + nodeSize })
                .run();
            }
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [aiState, response, editor]);

  const handleGenerateAI = async () => {
    // 如果已经在加载状态，直接返回
    if (aiState === AIState.LOADING) {
      return;
    }

    // 处理提问模式下的输入验证
    if (node.attrs.op === 'ask') {
      if (!prompt?.trim()) {
        toast.warning('请输入您的问题');

        return;
      }
    }
    // 处理续写模式
    else if (node.attrs.op === 'continue') {
      const contentString = buildContentString(prompt, node.attrs.op);

      if (!contentString) {
        toast.warning('文档是空白文档');

        return;
      }
    }
    // 处理空op或其他模式 - 当op为空或未定义时，默认当作ask模式处理
    else {
      if (!prompt?.trim()) {
        toast.warning('请输入您的问题');

        return;
      }
    }

    // 设置加载状态
    setAiState(AIState.LOADING);

    try {
      // 根据模式选择生成图片或文本
      if (showImage) {
        await generateImage({ prompt });
      } else {
        await handleAIGeneration(prompt, node.attrs, abortRef);
      }
    } catch (error) {
      console.error('AI生成过程中出错:', error);
      setAiState(AIState.INPUT);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    updateAttributes({ prompt: newPrompt });
  };

  // 图片生成处理函数
  const handleToggleImage = () => {
    setShowImage(!showImage);
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
      id: 'knowledge',
      label: '知识库',
      icon: Database,
      color: useKnowledgeBase ? '#10B981' : '#6B7280',
      bgColor: useKnowledgeBase ? 'bg-[#10B981]/20' : 'bg-gray-200',
      hoverBgColor: useKnowledgeBase ? 'hover:bg-[#10B981]/30' : 'hover:bg-gray-300',
      isActive: useKnowledgeBase,
      disabled: aiState === AIState.LOADING,
      onClick: () => setUseKnowledgeBase(!useKnowledgeBase),
    },
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

  // 如果在DISPLAY状态但既没有prompt也没有response，自动切换到INPUT状态
  useEffect(() => {
    if (aiState === AIState.DISPLAY && !prompt?.trim() && !response?.trim()) {
      setAiState(AIState.INPUT);
      updateState({ aiState: AIState.INPUT });
    }
  }, [aiState, prompt, response, updateState]);

  return (
    <NodeViewWrapper className="ai-block">
      {/* 返回值显示 */}
      <div className="w-full max-w-4xl mx-auto">
        {/* AI Input Box */}
        {aiState === AIState.LOADING ? (
          <>
            <div className="relative group">
              <div className="markdown-content bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-3">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: SyntaxHighlight,
                    pre: ({ children, ...props }: React.HTMLProps<HTMLPreElement>) => (
                      <pre className="rounded-[12px]" {...props}>
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>

              {/* 加载状态下的操作按钮 */}
              <div className="opacity-70 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    try {
                      abortRef.current?.();
                    } catch (error) {
                      console.log('中止流处理:', error);
                    } finally {
                      setAiState(AIState.INPUT);
                      updateAttributes({ loading: false });
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md border border-red-300 flex items-center gap-1"
                >
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  停止生成
                </button>
              </div>
            </div>

            <AILoadingStatus
              onCancel={() => {
                try {
                  abortRef.current?.();
                } catch (error) {
                  console.log('中止流处理:', error);
                } finally {
                  setAiState(AIState.INPUT);
                  updateAttributes({ loading: false });
                }
              }}
            />
          </>
        ) : (
          <>
            {(aiState === AIState.DISPLAY || aiState === AIState.INPUT) && response && (
              <div className="relative group">
                <div
                  className={`markdown-content transition-all duration-200 ${
                    aiState === AIState.DISPLAY
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-3 hover:shadow-md cursor-pointer'
                      : 'bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3'
                  }`}
                  onClick={() => {
                    if (aiState === AIState.DISPLAY) {
                      // 在显示模式下点击插入内容
                      const pos = getPos();

                      if (pos !== undefined) {
                        const nodeSize = node.nodeSize;
                        editor
                          .chain()
                          .focus()
                          .deleteRange({ from: pos, to: pos + nodeSize })
                          .pasteMarkdown(response)
                          .run();
                      }
                    }
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: SyntaxHighlight,
                      pre: ({ children, ...props }: React.HTMLProps<HTMLPreElement>) => (
                        <pre className="rounded-[12px]" {...props}>
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {response}
                  </ReactMarkdown>
                </div>

                {(aiState === AIState.DISPLAY || aiState === AIState.INPUT) && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-2">
                    {aiState === AIState.DISPLAY && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // 重新编辑
                          setAiState(AIState.INPUT);
                          updateState({ aiState: AIState.INPUT });
                        }}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 transition-all"
                      >
                        重新编辑
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        // 插入内容到文档
                        const pos = getPos();

                        if (pos !== undefined) {
                          const nodeSize = node.nodeSize;
                          editor
                            .chain()
                            .focus()
                            .deleteRange({ from: pos, to: pos + nodeSize })
                            .pasteMarkdown(response)
                            .run();
                        }
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md border border-blue-300 transition-all"
                    >
                      插入内容
                    </button>
                    {aiState === AIState.INPUT && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // 切换到显示模式
                          setAiState(AIState.DISPLAY);
                          updateState({ aiState: AIState.DISPLAY });
                        }}
                        className="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-md border border-green-300 transition-all"
                      >
                        完成编辑
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {aiState === AIState.INPUT && (
              <>
                <AIInputPanel
                  prompt={prompt}
                  onPromptChange={handlePromptChange}
                  onGenerateAI={handleGenerateAI}
                  isLoading={(aiState as AIState) === AIState.LOADING}
                  hasContent={hasContent}
                  actionButtons={actionButtons}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  textareaRef={textareaRef}
                  uploadInputRef={uploadInputRef}
                  componentRef={componentRef}
                  node={node}
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
