'use client';

/**
 * 聊天面板组件 (ChatAIPanels)
 *
 * 功能说明：
 * - 显示单个模型的聊天区域
 * - 包含模型标题、消息区域、快捷问题和输入框
 * - 支持在对比模式下并排显示多个面板
 * - 支持展示聊天消息历史
 * - 使用 react-markdown 渲染消息内容
 * - 使用 use-stick-to-bottom 自动滚动
 */

import React, { useRef, useState } from 'react';
import { Send, Copy, User, Bot, Square, Loader2, Pencil, Share2, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStickToBottom } from 'use-stick-to-bottom';

import type { ModelConfig, ChatMessage, ChatStatus } from '../types';
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
  /** 聊天消息列表 */
  messages?: ChatMessage[];
  /** 当前状态 */
  status?: ChatStatus;
  /** 停止生成回调 */
  onStopGenerating?: () => void;
}

/**
 * 根据模型值获取显示名称
 */
function getModelDisplayName(modelValue: string): string {
  const option = MODEL_OPTIONS.find((opt) => opt.value === modelValue);

  return option?.label || modelValue;
}

/**
 * 复制文本到剪贴板
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
}

/**
 * 消息气泡组件
 */
function MessageBubble({
  message,
  onEdit,
  isGenerating = false,
}: {
  message: ChatMessage;
  onEdit?: (message: ChatMessage) => void;
  isGenerating?: boolean;
}) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  // 处理编辑
  const handleEdit = () => {
    onEdit?.(message);
  };

  // 处理复制
  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 处理分享
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        text: message.content,
      });
    } else {
      // 降级处理：复制到剪贴板
      copyToClipboard(message.content);
    }
  };

  return (
    <div className="group">
      <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* 头像 */}
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            isUser
              ? 'bg-purple-600 text-white'
              : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* 消息内容 */}
        <div
          className={cn(
            'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-purple-600 text-white rounded-tr-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm',
          )}
        >
          {isUser ? (
            // 用户消息直接显示
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            // AI 消息使用 Markdown 渲染
            <div className="prose prose-sm prose-gray max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
              {message.content ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : message.isStreaming ? (
                <span className="inline-flex items-center gap-1 text-gray-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  思考中...
                </span>
              ) : null}
            </div>
          )}

          {/* 流式加载指示器 */}
          {message.isStreaming && message.content && (
            <span className="inline-block w-1.5 h-4 bg-purple-600 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>

      {/* 消息操作按钮 */}
      {!message.isStreaming && (
        <div
          className={cn(
            'flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'justify-end pr-11' : 'pl-11',
          )}
        >
          <button
            onClick={handleEdit}
            disabled={isGenerating}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all duration-200',
              isGenerating
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50 cursor-pointer',
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            编辑
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all duration-200 cursor-pointer',
              copied
                ? 'text-green-600 bg-green-50'
                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50',
            )}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                复制
              </>
            )}
          </button>
          <button
            onClick={handleShare}
            className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs text-gray-400 rounded-md hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
          >
            <Share2 className="h-3.5 w-3.5" />
            分享
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChatAIPanels({
  config,
  inputValue,
  onInputChange,
  onSend,
  onQuickQuestionClick,
  showBorder = false,
  messages = [],
  status = 'idle',
  onStopGenerating,
}: ChatPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 使用 use-stick-to-bottom 实现自动滚动
  const { scrollRef, contentRef } = useStickToBottom();

  // 处理键盘事件（Enter 发送）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (status !== 'streaming') {
        onSend();
      }
    }
  };

  // 是否禁用发送
  const isSendDisabled = status === 'streaming' || !inputValue.trim();

  // 是否显示快捷问题（仅在消息为空时显示）
  const showQuickQuestions = messages.length === 0;

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

      {/* ----- 消息区域 ----- */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">开始新的对话吧 ✨</p>
          </div>
        ) : (
          <div ref={contentRef} className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isGenerating={status === 'streaming'}
                onEdit={(msg) => {
                  onInputChange(msg.content);
                  textareaRef.current?.focus();
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ----- 底部操作区域 ----- */}
      <div className="p-4 w-full">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* 快捷问题按钮组（仅在消息为空时显示） */}
          {showQuickQuestions && (
            <div className="flex items-center gap-2 flex-wrap">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question.id}
                  onClick={() => {
                    onInputChange(question.text);
                    textareaRef.current?.focus();
                    onQuickQuestionClick(question.text);
                  }}
                  className={cn(
                    'px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-full cursor-pointer',
                    'hover:bg-gray-50 hover:border-purple-200 transition-colors',
                  )}
                >
                  {question.text}
                </button>
              ))}
            </div>
          )}

          {/* 操作栏 */}
          {!showQuickQuestions && status === 'streaming' && onStopGenerating && (
            <div className="flex items-center gap-2">
              {/* 停止生成按钮 */}
              <button
                onClick={onStopGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-colors"
              >
                <Square className="h-3 w-3" />
                停止生成
              </button>
            </div>
          )}

          {/* 输入框区域 */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={status === 'streaming' ? 'AI 正在回复中...' : '请输入提示词...'}
              disabled={status === 'streaming'}
              className={cn(
                'w-full min-h-[100px] pr-14 resize-none border border-gray-200 rounded-xl bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none px-4 py-3 text-sm text-gray-800 shadow-sm',
                status === 'streaming' && 'opacity-60 cursor-not-allowed',
              )}
            />
            {/* 发送按钮 */}
            <button
              type="button"
              onClick={onSend}
              disabled={isSendDisabled}
              className={cn(
                'absolute right-3 bottom-3 h-9 w-9 inline-flex items-center justify-center rounded-lg shadow-sm transition-colors',
                isSendDisabled
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white',
              )}
              aria-label="发送"
            >
              {status === 'streaming' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
