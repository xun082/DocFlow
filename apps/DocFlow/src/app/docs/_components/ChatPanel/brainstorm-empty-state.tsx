'use client';

import { Lightbulb } from 'lucide-react';

interface BrainstormEmptyStateProps {
  brainstormCount: number;
}

export function BrainstormEmptyState({ brainstormCount }: BrainstormEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-200/40">
        <Lightbulb className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1.5">头脑风暴模式</h3>
      <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
        输入主题，AI 将同时生成 {brainstormCount} 个不同方案
        <br />
        <span className="text-gray-300">适合创意发散、多角度思考</span>
      </p>
    </div>
  );
}
