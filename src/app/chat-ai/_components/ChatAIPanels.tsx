'use client';

/**
 * 聊天面板组件 (ChatAIPanels)
 *
 * 功能说明：
 * - 显示单个模型的聊天区域
 * - 包含模型标题、消息区域、快捷问题和输入框
 * - 支持在对比模式下并排显示多个面板
 */

import React from 'react';
import { Send, Copy } from 'lucide-react';

import type { ModelConfig } from '../types';
import { MODEL_OPTIONS, QUICK_QUESTIONS } from '../constants';

import { cn } from '@/utils';

interface ChatPanelProps {
  /** 模型配置信息 */
  config: ModelConfig;
  /** 输入框内容 */
  inputValue: string;
  /** 输入框变更回调 */
  onInputChange: (value: string) => void;
  /** 发送消息回调 */
  onSend: () => void;
  /** 快捷问题点击回调 */
  onQuickQuestionClick: (question: string) => void;
  /** 是否显示边框（对比模式下使用） */
  showBorder?: boolean;
}

/**
 * 根据模型值获取显示名称
 */
function getModelDisplayName(modelValue: string): string {
  const option = MODEL_OPTIONS.find((opt) => opt.value === modelValue);

  return option?.label || modelValue;
}

export default function ChatAIPanels({
  config,
  inputValue,
  onInputChange,
  onSend,
  onQuickQuestionClick,
  showBorder = false,
}: ChatPanelProps) {
  // 处理键盘事件（Enter 发送）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-w-0 bg-gradient-to-br from-gray-50 to-purple-50/30',
        showBorder ? 'border border-gray-200 rounded-lg' : '',
      )}
    >
      {/* ----- 模型标题栏 ----- */}
      <header className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-medium text-gray-800 border border-gray-200 rounded px-3 py-1.5 inline-block bg-white shadow-sm">
          {getModelDisplayName(config.modelName)}
        </h2>
      </header>

      {/* ----- 消息区域（静态页面暂时留空） ----- */}
      <div className="flex-1 overflow-y-auto p-4">{/* 消息列表将在后续实现 */}</div>

      {/* ----- 底部操作区域 ----- */}
      <div className="p-4 w-full">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* 快捷问题按钮组 */}
          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question.id}
                onClick={() => onQuickQuestionClick(question.text)}
                className={cn(
                  'px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-full',
                  'hover:bg-gray-50 hover:border-purple-200 transition-colors',
                )}
              >
                {question.text}
              </button>
            ))}
            {/* 复制按钮 */}
            <button className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {/* 输入框区域 */}
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入提示词..."
              className="w-full min-h-[100px] pr-14 resize-none border border-gray-200 rounded-xl bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none px-4 py-3 text-sm text-gray-800 shadow-sm"
            />
            {/* 发送按钮 */}
            <button
              type="button"
              onClick={onSend}
              className="absolute right-3 bottom-3 h-9 w-9 inline-flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors"
              aria-label="发送"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
