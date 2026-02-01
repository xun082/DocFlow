import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import { Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import ConcurrencySelector from '../AI/components/ConcurrencySelector';
import SyntaxHighlight from '../AI/components/SyntaxHighlight';

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
      <div className="w-full mx-auto">
        {aiState === AIState.INPUT && (
          <div className="bg-gradient-to-br from-yellow-50/80 via-white to-orange-50/60 border border-yellow-300/40 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 shadow-md">
                <Lightbulb className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-orange-700 bg-clip-text text-transparent tracking-wide">
                AI 头脑风暴
              </span>
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
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/60 resize-none bg-white shadow-sm placeholder:text-gray-400 transition-all"
              rows={2}
            />

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <ConcurrencySelector
                  value={n}
                  onChange={(value) => {
                    setN(value);
                    updateAttributes({ n: value });
                  }}
                  disabled={false}
                />

                <div className="relative">
                  <ModelSelector
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    disabled={false}
                    variant="custom"
                    buttonConfig={{
                      color: '#7C3AED',
                      bgColor: 'bg-purple-100/80',
                      hoverBgColor: 'hover:bg-purple-200/80',
                      className: 'border border-purple-200/60 shadow-sm',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!topic.trim()}
                className={`
                  px-4 py-2 text-sm font-semibold rounded-lg transition-all
                  ${
                    !topic.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-lg active:scale-95'
                  }
                `}
              >
                生成方案
              </button>
            </div>
          </div>
        )}

        {aiState === AIState.LOADING && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {responses.map((response, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/40 rounded-xl p-3.5 relative min-h-[180px] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white text-xs font-bold shadow-md">
                      {index + 1}
                    </div>
                    <div className="flex-1 h-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 transition-all duration-500"
                        style={{
                          width: response.finished ? '100%' : '60%',
                          animation: response.finished ? 'none' : 'pulse 2s ease-in-out infinite',
                        }}
                      />
                    </div>
                  </div>
                  <div className="markdown-content text-[11px] leading-relaxed text-gray-700">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: SyntaxHighlight,
                        pre: ({ children, className, ...props }: any) => (
                          <pre className={`rounded text-[10px] ${className || ''}`} {...props}>
                            {children}
                          </pre>
                        ),
                        p: ({ children }) => (
                          <p className="mb-1.5 last:mb-0 text-[11px] leading-relaxed">{children}</p>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-xs font-bold mb-1.5 text-gray-900 leading-tight">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xs font-semibold mb-1 text-gray-800 leading-tight">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-[11px] font-semibold mb-1 text-gray-700 leading-tight">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-[11px] font-medium mb-0.5 text-gray-700 leading-tight">
                            {children}
                          </h4>
                        ),
                        h5: ({ children }) => (
                          <h5 className="text-[10px] font-medium mb-0.5 text-gray-600 leading-tight">
                            {children}
                          </h5>
                        ),
                        h6: ({ children }) => (
                          <h6 className="text-[10px] font-normal mb-0.5 text-gray-600 leading-tight">
                            {children}
                          </h6>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-3 mb-1.5 space-y-0.5 text-[11px]">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-3 mb-1.5 space-y-0.5 text-[11px]">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-[11px] leading-relaxed">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-800">{children}</strong>
                        ),
                        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-gray-300 pl-2 italic text-gray-600 text-[11px] my-1 bg-gray-50/50 py-0.5 rounded-r">
                            {children}
                          </blockquote>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            className="text-blue-600 hover:text-blue-700 underline text-[11px] font-medium"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {response.content || '✨ 生成中...'}
                    </ReactMarkdown>
                    {!response.finished && response.content && (
                      <span className="inline-block w-1.5 h-4 bg-gradient-to-b from-blue-500 to-purple-600 ml-1 animate-pulse rounded-sm shadow-sm"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center pt-2">
              <button
                onClick={handleStop}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 rounded-lg border-2 border-red-300 hover:border-red-400 bg-white hover:bg-red-50 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

        {aiState === AIState.DISPLAY && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {responses.map((response, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 border-2 border-gray-200/60 hover:border-blue-400/60 hover:shadow-xl rounded-xl p-3.5 relative min-h-[180px] group transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white text-xs font-bold shadow-md">
                        {index + 1}
                      </div>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {response.content.length} 字
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(response.content);
                          toast.success('已复制');
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                        title="复制"
                      >
                        <svg
                          className="w-4 h-4"
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
                        className="p-1.5 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                        title="插入"
                      >
                        <svg
                          className="w-4 h-4"
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
                  <div className="markdown-content text-[11px] leading-relaxed text-gray-700">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: SyntaxHighlight,
                        pre: ({ children, className, ...props }: any) => (
                          <pre className={`rounded text-[10px] ${className || ''}`} {...props}>
                            {children}
                          </pre>
                        ),
                        p: ({ children }) => (
                          <p className="mb-1.5 last:mb-0 text-[11px] leading-relaxed">{children}</p>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-xs font-bold mb-1.5 text-gray-900 leading-tight">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xs font-semibold mb-1 text-gray-800 leading-tight">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-[11px] font-semibold mb-1 text-gray-700 leading-tight">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-[11px] font-medium mb-0.5 text-gray-700 leading-tight">
                            {children}
                          </h4>
                        ),
                        h5: ({ children }) => (
                          <h5 className="text-[10px] font-medium mb-0.5 text-gray-600 leading-tight">
                            {children}
                          </h5>
                        ),
                        h6: ({ children }) => (
                          <h6 className="text-[10px] font-normal mb-0.5 text-gray-600 leading-tight">
                            {children}
                          </h6>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-3 mb-1.5 space-y-0.5 text-[11px]">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-3 mb-1.5 space-y-0.5 text-[11px]">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-[11px] leading-relaxed">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-800">{children}</strong>
                        ),
                        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-gray-300 pl-2 italic text-gray-600 text-[11px] my-1 bg-gray-50/50 py-0.5 rounded-r">
                            {children}
                          </blockquote>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            className="text-blue-600 hover:text-blue-700 underline text-[11px] font-medium"
                          >
                            {children}
                          </a>
                        ),
                        table: ({ children }) => (
                          <table className="border-collapse border border-gray-300 text-[10px] my-1.5 rounded overflow-hidden shadow-sm">
                            {children}
                          </table>
                        ),
                        thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => (
                          <tr className="border-b border-gray-300">{children}</tr>
                        ),
                        th: ({ children }) => (
                          <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-gray-300 px-2 py-1">{children}</td>
                        ),
                      }}
                    >
                      {response.content || '无内容'}
                    </ReactMarkdown>
                  </div>
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-400/40 transition-colors pointer-events-none" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 px-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-200/60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  updateAttributes({ aiState: AIState.INPUT });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
