'use client';

import { Copy, Loader2, Square, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

import { compactMarkdownComponents } from '@/components/business/ai/markdown-components';
import { cn } from '@/utils';

export interface BrainstormResponseItem {
  content: string;
  finished: boolean;
}

interface BrainstormResultsProps {
  responses: BrainstormResponseItem[];
  count: number;
  isBrainstorming: boolean;
  onStop: () => void;
  onRegenerate: () => void;
}

export function BrainstormResults({
  responses,
  count,
  isBrainstorming,
  onStop,
  onRegenerate,
}: BrainstormResultsProps) {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div
        className={cn(
          'grid gap-3',
          count === 2 && 'grid-cols-2',
          count === 3 && 'grid-cols-3',
          count === 4 && 'grid-cols-2',
          count === 5 && 'grid-cols-3',
        )}
      >
        {responses.map((response, index) => (
          <div
            key={index}
            className={cn(
              'bg-white border-2 border-gray-200 hover:border-purple-300 rounded-xl p-3 relative min-h-[200px] group transition-all shadow-sm hover:shadow-md',
              isBrainstorming && !response.finished && 'border-purple-200',
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-[11px] font-bold shadow-sm">
                  {index + 1}
                </div>
                {!isBrainstorming && response.content && (
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                    {response.content.length} 字
                  </span>
                )}
              </div>
              {!isBrainstorming && response.content && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(response.content);
                    toast.success('已复制');
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-purple-600 rounded hover:bg-purple-50 transition-all"
                  title="复制"
                >
                  <Copy className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="markdown-content text-[12px] leading-relaxed text-gray-700">
              {response.content ? (
                <>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={compactMarkdownComponents}>
                    {response.content}
                  </ReactMarkdown>
                  {!response.finished && (
                    <span className="inline-block w-1 h-3 bg-gradient-to-b from-purple-500 to-indigo-600 ml-0.5 animate-pulse rounded-sm" />
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  生成中...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {isBrainstorming && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onStop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 rounded-lg border-2 border-red-300 hover:border-red-400 bg-white hover:bg-red-50 transition-all shadow-sm"
          >
            <Square className="h-3 w-3 fill-current" />
            停止生成
          </button>
        </div>
      )}
      {!isBrainstorming && responses.some((r) => r.content) && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <Zap className="h-3 w-3" />
            重新生成
          </button>
        </div>
      )}
    </div>
  );
}
