import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import { Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import ConcurrencySelector from '../AI/components/ConcurrencySelector';

import { compactMarkdownComponents } from '@/components/business/ai/markdown-components';
import ModelSelector from '@/components/business/module-select';
import { ChatAiApi, type StreamChunk } from '@/services/chat-ai';

enum AIState {
  INPUT = 'input',
  LOADING = 'loading',
  DISPLAY = 'display',
}

interface AIBrainstormComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  editor: Editor;
  getPos: () => number | undefined;
}

interface BrainstormResponse {
  content: string;
  finished: boolean;
}

export const AIBrainstormComponent: React.FC<AIBrainstormComponentProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const [topic, setTopic] = useState(node.attrs.topic || '');
  const [n, setN] = useState(node.attrs.n || 3);
  const [responses, setResponses] = useState<BrainstormResponse[]>(
    node.attrs.responses || Array(n).fill({ content: '', finished: false }),
  );
  const [aiState, setAiState] = useState<AIState>((node.attrs.aiState as AIState) || AIState.INPUT);
  const [selectedModel, setSelectedModel] = useState('Pro/moonshotai/Kimi-K2.5');
  const [isComposing, setIsComposing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [topic]);

  useEffect(() => {
    if (aiState === AIState.INPUT && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // 检查点击是否在下拉菜单内（包括 Portal 渲染的元素和普通下拉菜单）
      const isClickInsideDropdown =
        target instanceof Element &&
        (target.closest('[role="menu"]') ||
          target.closest('[role="menuitem"]') ||
          target.closest('[data-radix-popper-content-wrapper]') ||
          target.closest('[data-radix-portal]') ||
          // 检查是否是自定义下拉菜单
          target.classList.contains('z-50') ||
          target.closest('.z-50'));

      if (
        componentRef.current &&
        !componentRef.current.contains(target) &&
        !isClickInsideDropdown
      ) {
        if (aiState === AIState.INPUT) {
          const hasValidResponse = responses.some((r) => r.content.trim());

          if (hasValidResponse) {
            setAiState(AIState.DISPLAY);
            updateAttributes({ aiState: AIState.DISPLAY });
          } else {
            const pos = getPos();

            if (pos !== undefined) {
              editor
                .chain()
                .focus()
                .deleteRange({ from: pos, to: pos + node.nodeSize })
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
  }, [aiState, responses, editor]);

  const handleGenerate = async () => {
    if (aiState === AIState.LOADING) return;

    if (!topic.trim()) {
      toast.warning('请输入头脑风暴主题');

      return;
    }

    setAiState(AIState.LOADING);
    updateAttributes({ aiState: AIState.LOADING });

    const newResponses: BrainstormResponse[] = Array(n)
      .fill(null)
      .map(() => ({ content: '', finished: false }));
    setResponses(newResponses);

    try {
      const cancel = await ChatAiApi.Brainstorm(
        {
          topic,
          n,
          model: selectedModel,
          temperature: 1.2,
        },
        (chunk: StreamChunk) => {
          if (chunk.event === 'message' && chunk.index !== undefined) {
            const index = chunk.index;

            setResponses((prev) => {
              const updated = [...prev];

              if (!updated[index]) {
                updated[index] = { content: '', finished: false };
              }

              if (chunk.content) {
                updated[index] = {
                  ...updated[index],
                  content: updated[index].content + chunk.content,
                };
              }

              if (chunk.finish_reason) {
                updated[index] = {
                  ...updated[index],
                  finished: true,
                };
              }

              return updated;
            });
          }

          if (chunk.event === 'done') {
            setAiState(AIState.DISPLAY);
            updateAttributes({
              aiState: AIState.DISPLAY,
              responses: newResponses,
            });
          }
        },
        () => {
          toast.error('生成失败，请重试');
          setAiState(AIState.INPUT);
          updateAttributes({ aiState: AIState.INPUT });
        },
      );

      abortRef.current = cancel;
    } catch {
      toast.error('生成失败，请重试');
      setAiState(AIState.INPUT);
      updateAttributes({ aiState: AIState.INPUT });
    }
  };

  const handleStop = () => {
    try {
      abortRef.current?.();
    } catch {
      // 静默处理停止错误
    } finally {
      setAiState(AIState.DISPLAY);
      updateAttributes({ aiState: AIState.DISPLAY, responses });
    }
  };

  const handleSelectOption = (index: number) => {
    const selectedContent = responses[index]?.content;

    if (!selectedContent?.trim()) return;

    const pos = getPos();

    if (pos !== undefined) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .pasteMarkdown(selectedContent)
        .run();
    }
  };

  return (
    <NodeViewWrapper className="ai-brainstorm-block" ref={componentRef}>
      <div className="w-full max-w-[1400px] mx-auto space-y-3">
        {/* 输入框 - 现代简约设计 */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
              <Lightbulb className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-semibold text-gray-700">AI 头脑风暴</span>
          </div>

          <textarea
            ref={textareaRef}
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              updateAttributes({ topic: e.target.value });
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="输入您的主题，AI 将生成多个不同方案..."
            className="w-full px-2.5 py-2 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 resize-none bg-gray-50/50 placeholder:text-gray-400 transition-all"
            rows={2}
            disabled={aiState === AIState.LOADING}
          />

          <p className="mt-1.5 text-[10px] text-gray-500">
            例如：
            {[
              '新茶饮品牌产品命名方案',
              '公司年会活动策划',
              '《如何提升团队效率》文章大纲',
              '618 促销活动营销文案',
              'Q3 产品复盘会议主题',
              '科技类公众号选题方向',
            ].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setTopic(label);
                  updateAttributes({ topic: label });
                  textareaRef.current?.focus();
                }}
                className="mr-1.5 text-indigo-600 hover:text-indigo-700 hover:underline focus:outline-none focus:underline"
              >
                {label}
              </button>
            ))}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <ConcurrencySelector
                value={n}
                onChange={(value) => {
                  setN(value);
                  updateAttributes({ n: value });
                }}
                disabled={aiState === AIState.LOADING}
              />

              <div className="relative min-w-[180px]">
                <ModelSelector
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  disabled={aiState === AIState.LOADING}
                  variant="custom"
                  buttonConfig={{
                    color: '#6366f1',
                    bgColor: 'bg-indigo-50',
                    hoverBgColor: 'hover:bg-indigo-100',
                    className:
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors border border-indigo-200 shadow-sm w-full min-w-[180px]',
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || aiState === AIState.LOADING}
              className={`
                px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all
                ${
                  !topic.trim() || aiState === AIState.LOADING
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm hover:shadow-md active:scale-95'
                }
              `}
            >
              {aiState === AIState.LOADING ? '生成中...' : '生成方案'}
            </button>
          </div>
        </div>

        {/* 生成中状态 - 简约卡片设计 */}
        {aiState === AIState.LOADING && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {responses.map((response, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-2.5 relative min-h-[150px] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[12px] font-bold shadow-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 rounded-full"
                        style={{
                          width: response.finished ? '100%' : '60%',
                          animation: response.finished ? 'none' : 'pulse 2s ease-in-out infinite',
                        }}
                      />
                    </div>
                  </div>
                  <div className="markdown-content text-[12px] leading-relaxed text-gray-700">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={compactMarkdownComponents}
                    >
                      {response.content || '✨ 生成中...'}
                    </ReactMarkdown>
                    {!response.finished && response.content && (
                      <span className="inline-block w-1 h-3 bg-gradient-to-b from-blue-500 to-purple-600 ml-0.5 animate-pulse rounded-sm shadow-sm"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center pt-1.5">
              <button
                onClick={handleStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 rounded-lg border-2 border-red-300 hover:border-red-400 bg-white hover:bg-red-50 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                    clipRule="evenodd"
                  />
                </svg>
                停止生成
              </button>
            </div>
          </div>
        )}

        {/* 显示结果 */}
        {aiState === AIState.DISPLAY && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2.5">
              {responses.map((response, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 border-2 border-gray-200/60 hover:border-blue-400/60 hover:shadow-xl rounded-xl p-2.5 relative min-h-[160px] group transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center justify-center w-4 h-4 rounded bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white text-[12px] font-bold shadow-md">
                        {index + 1}
                      </div>
                      <span className="text-[12px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {response.content.length} 字
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(response.content);
                          toast.success('已复制');
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                        title="复制"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOption(index);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-700 rounded hover:bg-blue-50 transition-colors"
                        title="插入"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="markdown-content text-[12px] leading-relaxed text-gray-700">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={compactMarkdownComponents}
                    >
                      {response.content || '无内容'}
                    </ReactMarkdown>
                  </div>
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-400/40 transition-colors pointer-events-none" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1.5 px-0.5">
              <div className="flex items-center gap-1 text-[12px] text-gray-500 bg-gray-50/80 px-2.5 py-1 rounded-lg border border-gray-200/60">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                悬停显示操作：复制或插入
              </div>
              <button
                onClick={() => {
                  setAiState(AIState.INPUT);
                  setResponses(Array(n).fill({ content: '', finished: false }));
                  updateAttributes({ aiState: AIState.INPUT, responses: [] });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                重新生成
              </button>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default AIBrainstormComponent;
