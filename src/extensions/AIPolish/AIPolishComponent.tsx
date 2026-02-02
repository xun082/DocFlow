import React, { useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import { Sparkles, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

import { markdownComponents } from '@/components/business/ai/markdown-components';
import { useAIPolish } from '@/hooks/ai/use-ai-stream';
import ModelSelector from '@/components/business/module-select';
import { markdownToTiptapJSON } from '@/utils/markdown-to-tiptap';

interface AIPolishComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  editor: Editor;
  getPos: () => number | undefined;
}

export const AIPolishComponent: React.FC<AIPolishComponentProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const [originalContent, setOriginalContent] = useState(node.attrs.originalContent || '');
  const [selectedModel, setSelectedModel] = useState('deepseek-ai/DeepSeek-V3');
  const [hasContent, setHasContent] = useState(false);

  const { state, response, responseRef, generate, stop } = useAIPolish(
    editor,
    getPos,
    updateAttributes,
    originalContent,
  );

  // 检查是否有可润色的内容
  useEffect(() => {
    const content = originalContent || node.attrs.originalContent;
    const hasValidContent = !!content && content.trim().length > 0;

    setHasContent(hasValidContent);

    if (content && !originalContent) {
      setOriginalContent(content);
    }
  }, [originalContent, node.attrs.originalContent]);

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
  }, [response, state, responseRef]);

  const handleStart = () => {
    if (!hasContent) return;

    // 获取要润色的内容
    const aiNodePos = getPos();
    if (aiNodePos === undefined) return;

    let contentToPolish = originalContent || node.attrs.originalContent;

    // 如果没有原始内容，尝试获取选中内容或前一个节点的内容
    if (!contentToPolish) {
      const { from, to } = editor.state.selection;

      if (from !== to) {
        contentToPolish = editor.state.doc.textBetween(from, to, '\n\n');
      } else {
        const $pos = editor.state.doc.resolve(aiNodePos);
        const nodeBefore = $pos.nodeBefore;

        if (nodeBefore) {
          contentToPolish = nodeBefore.textContent;
        }
      }
    }

    if (contentToPolish) {
      setOriginalContent(contentToPolish);
      updateAttributes({ state: 'loading', originalContent: contentToPolish });
      generate(selectedModel, 0.7);
    }
  };

  const handleInsert = async () => {
    const pos = getPos();

    if (pos !== undefined) {
      const nodeSize = node.nodeSize;

      try {
        // 策略：在文档中向前查找原始内容并替换
        let foundFrom: number | null = null;
        let foundTo: number | null = null;

        // 在 AI 润色块之前查找原始内容
        editor.state.doc.nodesBetween(0, pos, (node, nodePos) => {
          if (foundFrom !== null) return false; // 已找到

          const nodeText = node.textContent;

          if (nodeText === originalContent || nodeText.includes(originalContent)) {
            // 找到包含原内容的节点
            const textStart = nodeText.indexOf(originalContent);

            if (textStart !== -1) {
              foundFrom = nodePos + 1 + textStart; // +1 因为 nodePos 是节点起始位置
              foundTo = foundFrom + originalContent.length;

              return false; // 停止查找
            }
          }
        });

        // 将 Markdown 转换为 TipTap JSON
        const tiptapJSON = await markdownToTiptapJSON(response);

        if (foundFrom !== null && foundTo !== null) {
          // 找到了原始内容，执行替换
          const replaceFrom = foundFrom;
          const replaceTo = foundTo;

          // 1. 先删除原始内容
          // 2. 删除 AI 润色块
          // 3. 插入转换后的内容
          editor
            .chain()
            .focus()
            .deleteRange({ from: replaceFrom, to: replaceTo })
            .deleteRange({
              from: pos - (replaceTo - replaceFrom),
              to: pos + nodeSize - (replaceTo - replaceFrom),
            })
            .insertContentAt(replaceFrom, tiptapJSON.content || [])
            .run();
        } else {
          // 没找到原始内容，只删除 AI 润色块并插入新内容
          editor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + nodeSize })
            .insertContentAt(pos, tiptapJSON.content || [])
            .run();
        }
      } catch {
        toast.error('插入失败，请重试');
      }
    }
  };

  const handleStop = () => {
    stop();
    updateAttributes({ state: 'display' });
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
    <NodeViewWrapper className="ai-polish-block my-4">
      <div className="w-full max-w-2xl">
        {/* 调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mb-1">
            State: {state} | HasContent: {hasContent ? 'Yes' : 'No'} | Content Length:{' '}
            {originalContent.length}
          </div>
        )}

        {/* 输入状态 */}
        {state === 'input' && (
          <div className="relative bg-white border-2 border-green-300 rounded-lg shadow-md">
            {/* 标题 */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-green-50 border-b border-green-200">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">AI 润色</span>
            </div>

            {/* 工具栏 */}
            <div className="flex items-center justify-between gap-2 px-2.5 py-2">
              <div className="flex items-center gap-1.5">
                {/* 发送按钮 */}
                <button
                  onClick={handleStart}
                  disabled={!hasContent}
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                    hasContent
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title={hasContent ? '开始润色' : '需要选中内容才能润色'}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>

                {/* 模型选择器 */}
                <ModelSelector
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  disabled={false}
                  variant="green"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {!hasContent && <span className="text-xs text-amber-600">⚠️ 需要选中内容</span>}
                {hasContent && (
                  <span className="text-xs text-gray-500">
                    已选中 {originalContent.length} 字符
                  </span>
                )}
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
            {/* 润色后内容 */}
            <div
              ref={responseRef}
              className="markdown-content bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-lg p-2.5 mb-2 relative"
            >
              {response ? (
                <>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {response}
                  </ReactMarkdown>
                  <span className="inline-block w-1.5 h-4 bg-green-600 ml-1 animate-pulse"></span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">AI 正在润色中...</span>
                </div>
              )}
            </div>

            {/* 工具栏 */}
            <div className="flex items-center justify-between gap-2 mt-2">
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                variant="green"
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
            {/* 润色后内容 */}
            <div
              className="markdown-content bg-gradient-to-r from-green-50/60 to-emerald-50/60 border border-green-200/40 rounded-lg p-2.5 mb-2 cursor-pointer hover:bg-green-50/80 transition-colors"
              onClick={handleInsert}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {response}
              </ReactMarkdown>
            </div>

            {/* 工具栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="w-3 h-3" />
                <span>AI 润色完成</span>
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
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  取消
                </button>
                <button
                  onClick={handleInsert}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
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

export default AIPolishComponent;
