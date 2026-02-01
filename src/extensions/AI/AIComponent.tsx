import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import { Sparkles, Database } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// AI组件状态枚举
enum AIState {
  INPUT = 'input', // 输入状态：可以输入prompt
  LOADING = 'loading', // 加载状态：正在生成AI响应
  DISPLAY = 'display', // 显示状态：显示AI响应结果
}

import { type ActionButtonConfig } from './actionButtons';
import { useTextExtraction } from './hooks/useTextExtraction';
import { useSSEStream } from './hooks/useSSEStream';
import AIInputPanel from './components/AIInputPanel';
import SyntaxHighlight from './components/SyntaxHighlight';

type ActionButton = ActionButtonConfig;

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
  const [knowledgeEnabled, setKnowledgeEnabled] = useState(false); // 知识库开关状态，默认关闭
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<number[]>([]); // 选中的知识库ID列表
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null); // 新增：响应内容引用
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

  // 自动滚动跟随AI内容生成
  const scrollToAIComponent = () => {
    if (responseRef.current) {
      // 滚动到响应内容，但保留更多可见区域
      responseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // 显示在屏幕中央，保证上下都有内容可见
        inline: 'nearest',
      });
    }
  };

  // 监听响应内容变化，自动滚动跟随
  useEffect(() => {
    if (aiState === AIState.LOADING && response) {
      // 延迟一点再滚动，确保内容已经渲染
      setTimeout(() => {
        scrollToAIComponent();
      }, 100);
    }
  }, [response, aiState]);

  const { handleGenerateAI: handleAIGeneration } = useSSEStream({
    updateState,
    setAiState,
    updateAttributes,
    buildContentString,
    documentId,
    selectedModel,
    setResponse,
    editor,
    useKnowledgeBase: knowledgeEnabled, // 传递知识库开关状态
    selectedKnowledgeIds, // 传递选中的知识库ID列表
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
      const aiNodePos = getPos();
      const contentString = buildContentString(prompt, node.attrs.op, aiNodePos);

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

    // 知识库验证：如果开启了知识库但没有选择任何知识库，提示用户
    if (knowledgeEnabled && selectedKnowledgeIds.length === 0) {
      toast.warning('请先选择知识库', {
        description: '您已开启知识库功能，但未选择任何知识库。请选择知识库或关闭知识库开关。',
      });

      return;
    }

    // 设置加载状态
    setAiState(AIState.LOADING);

    try {
      const aiNodePos = getPos();
      await handleAIGeneration(prompt, node.attrs, abortRef, aiNodePos);
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

  // 按钮配置数据
  const actionButtons: ActionButtonConfig[] = [
    {
      id: 'knowledge',
      label: '知识库',
      icon: Database,
      color: knowledgeEnabled ? '#10B981' : '#6B7280',
      bgColor: knowledgeEnabled ? 'bg-[#10B981]/20' : 'bg-gray-200',
      hoverBgColor: knowledgeEnabled ? 'hover:bg-[#10B981]/30' : 'hover:bg-gray-300',
      isActive: true, // 始终激活，让 KnowledgeBaseSelector 自己管理状态
      disabled: aiState === AIState.LOADING,
      onClick: () => {
        // 点击事件由 KnowledgeBaseSelector 内部的开关处理
      },
    },
    {
      id: 'model',
      label: 'Model',
      icon: Sparkles,
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
    <NodeViewWrapper className="ai-block" ref={componentRef}>
      {/* 返回值显示 */}
      <div className="w-full max-w-4xl mx-auto">
        {/* AI加载状态 */}
        {aiState === AIState.LOADING ? (
          <div className="relative">
            {/* 响应内容显示区域 - ChatGPT风格 */}
            <div
              ref={responseRef}
              className="markdown-content bg-gray-50/80 border border-gray-200/50 rounded-lg p-4 mb-3 relative"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: SyntaxHighlight,
                  pre: ({ children, className, ...props }: any) => (
                    <pre className={`rounded ${className || ''}`} {...props}>
                      {children}
                    </pre>
                  ),
                }}
              >
                {response}
              </ReactMarkdown>

              {/* 打字效果光标 */}
              <span className="inline-block w-2 h-5 bg-gray-600 ml-1 animate-pulse"></span>
            </div>

            {/* 底部工具栏 - ChatGPT风格 */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
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
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 rounded border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  停止
                </button>
              </div>

              <div className="text-xs text-gray-500">正在生成...</div>
            </div>
          </div>
        ) : (
          <>
            {aiState === AIState.DISPLAY && response && (
              <div className="relative">
                <div
                  className="markdown-content bg-gray-50/80 border border-gray-200/50 rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-100/80 transition-colors"
                  onClick={() => {
                    // 点击插入内容
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
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: SyntaxHighlight,
                      pre: ({ children, className, ...props }: any) => (
                        <pre className={`rounded ${className || ''}`} {...props}>
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {response}
                  </ReactMarkdown>
                </div>

                {/* 底部工具栏 - ChatGPT风格 */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        // 复制到剪贴板
                        navigator.clipboard.writeText(response);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      复制
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      插入内容
                    </button>
                  </div>
                </div>
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
                  actionButtons={actionButtons as ActionButton[]}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  selectedKnowledgeIds={selectedKnowledgeIds}
                  setSelectedKnowledgeIds={setSelectedKnowledgeIds}
                  knowledgeEnabled={knowledgeEnabled}
                  setKnowledgeEnabled={setKnowledgeEnabled}
                  textareaRef={textareaRef}
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
