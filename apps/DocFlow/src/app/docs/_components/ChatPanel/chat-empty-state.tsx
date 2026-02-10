'use client';

import { Bot } from 'lucide-react';

export function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-200/40">
        <Bot className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1.5">文档 AI 助手</h3>
      <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed">
        问我任何关于文档的问题，我会尽力帮助你。
        <br />
        <span className="text-gray-300">Enter 发送 · Shift+Enter 换行</span>
      </p>
    </div>
  );
}
