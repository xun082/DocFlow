import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import { Sparkles, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

import SyntaxHighlight from '../AI/components/SyntaxHighlight';

import ModelSelector from '@/components/business/module-select';
import { ChatAiApi, type StreamChunk } from '@/services/chat-ai';

interface AIContinueComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  editor: Editor;
  getPos: () => number | undefined;
}

export const AIContinueComponent: React.FC<AIContinueComponentProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const [response, setResponse] = useState(node.attrs.response || '');
  const [state, setState] = useState<'input' | 'loading' | 'display'>(node.attrs.state || 'input');
  const [selectedModel, setSelectedModel] = useState('deepseek-ai/DeepSeek-V3');
  const [hasContext, setHasContext] = useState(false);
  const abortRef = useRef<(() => void) | undefined>(undefined);
  const accumulatedResponseRef = useRef('');
  const responseRef = useRef<HTMLDivElement>(null);

  // 检查是否有前文内容
  useEffect(() => {
    const aiNodePos = getPos();

    if (aiNodePos !== undefined) {
      const contentBefore = editor.state.doc.textBetween(0, aiNodePos, '\n\n').trim();
      setHasContext(contentBefore.length > 0);
    }
  }, [editor, getPos]);

  // 自动滚动到生成内容
  useEffect(() => {
    if (state === 'loading' && response) {
      setTimeout(() => {
        responseRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [response, state]);

  const handleStart = () => {
    // 检查是否有前文内容
    if (!hasContext) {
      return;
    }

    setState('loading');
    updateAttributes({ state: 'loading' });
    handleContinue();
  };

  const handleContinue = async () => {
    const aiNodePos = getPos();
    if (aiNodePos === undefined) return;

    // 获取当前节点之前的所有内容
    const contentBefore = editor.state.doc.textBetween(0, aiNodePos, '\n\n');

    try {
      accumulatedResponseRef.current = '';

      abortRef.current = await ChatAiApi.Autocomplete(
        {
          content: contentBefore,
          model: selectedModel,
        },
        (chunk: StreamChunk) => {
          if (chunk.event === 'message' && chunk.content) {
            accumulatedResponseRef.current += chunk.content;
            setResponse(accumulatedResponseRef.current);

            const pos = getPos();

            if (pos !== undefined) {
              editor.commands.updateContinueContent(pos, accumulatedResponseRef.current);
            }
          } else if (chunk.event === 'done' || chunk.finish_reason === 'stop') {
            setState('display');
            updateAttributes({
              state: 'display',
              response: accumulatedResponseRef.current,
            });
          }
        },
        () => {
          toast.error('续写失败，请重试');
          setState('display');
          updateAttributes({ state: 'display' });
        },
      );
    } catch {
      toast.error('续写失败，请重试');
      setState('display');
    }
  };

  const handleInsert = () => {
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
  };

  const handleStop = () => {
    try {
      abortRef.current?.();
    } catch {
      // 静默处理停止错误
    } finally {
      setState('display');
      updateAttributes({ state: 'display' });
    }
  };

  const handleCancel = () => {
    const pos = getPos();

    if (pos !== undefined) {
      const nodeSize = node.nodeSize;
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + nodeSize })
        .run();
    }
  };

  return (
    <NodeViewWrapper className="ai-continue-block my-4">
      <div className="w-full max-w-2xl">
        {/* 输入状态 */}
        {state === 'input' && (
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* 工具栏 */}
            <div className="flex items-center justify-between gap-2 px-2.5 py-2">
              <div className="flex items-center gap-1.5">
                {/* 发送按钮 */}
                <button
                  onClick={handleStart}
                  disabled={!hasContext}
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                    hasContext
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title={hasContext ? '开始生成' : '需要前文内容才能续写'}
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>

                {/* 模型选择器 */}
                <ModelSelector
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  disabled={false}
                  variant="purple"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {!hasContext && <span className="text-xs text-amber-600">⚠️ 需要前文内容</span>}
                {/* 删除按钮 */}
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="删除"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {state === 'loading' && (
          <div className="relative">
            <div
              ref={responseRef}
              className="markdown-content bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/50 rounded-lg p-2.5 mb-2 relative"
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
              <span className="inline-block w-1.5 h-4 bg-blue-600 ml-1 animate-pulse"></span>
            </div>

            {/* 工具栏 */}
            <div className="flex items-center justify-between gap-2 mt-2">
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                variant="purple"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStop}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 rounded-md border border-red-300 hover:border-red-400 bg-white hover:bg-red-50 transition-colors"
                >
                  <Square className="w-3 h-3" />
                  停止
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 完成状态 */}
        {state === 'display' && response && (
          <div className="relative">
            <div
              className="markdown-content bg-gradient-to-r from-blue-50/60 to-purple-50/60 border border-blue-200/40 rounded-lg p-2.5 mb-2 cursor-pointer hover:bg-blue-50/80 transition-colors"
              onClick={handleInsert}
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

            {/* 工具栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="w-3 h-3" />
                <span>AI 续写完成</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(response);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  复制
                </button>
                <button
                  onClick={handleInsert}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  插入
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default AIContinueComponent;
