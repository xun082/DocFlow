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

import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Copy,
  User,
  Bot,
  Square,
  Loader2,
  Pencil,
  Share2,
  Check,
  UserIcon,
  Settings,
  LogOut,
  Brain,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';
import { useStickToBottom } from 'use-stick-to-bottom';
import { useRouter } from 'next/navigation';

import type { ModelConfig, ChatMessage, ChatStatus } from '../types';
import { MODEL_OPTIONS, QUICK_QUESTIONS } from '../constants';
import { useChatModels } from '../hooks/useChatModels';
import ModelConfigModal from './ModelConfigModal';

import { useUserQuery, useLogoutMutation } from '@/hooks/useUserQuery';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatPanelProps {
  /** 模型配置信息 */
  config: ModelConfig;
  /** 输入框内容 */
  inputValue: string;
  /** 输入框变更回调 */
  onInputChange: (value: string) => void;
  /** 发送消息回调 */
  onSend: () => void;
  /** 是否显示边框（对比模式下使用） */
  showBorder?: boolean;
  /** 聊天消息列表 */
  messages?: ChatMessage[];
  /** 当前状态 */
  status?: ChatStatus;
  /** 停止生成回调 */
  onStopGenerating?: () => void;
  /** 配置变更回调 */
  onConfigChange?: (config: ModelConfig) => void;
  /** 是否处于对比模式 */
  isCompareMode?: boolean;
  /** 添加对比模型回调 */
  onAddCompareModel?: () => void;
  /** 取消模型对比回调 */
  onCancelCompare?: () => void;
}

/**
 * 根据模型值获取显示名称
 */
function getModelDisplayName(
  modelValue: string,
  models: { value: string; label: string }[],
): string {
  // 优先使用 API 获取的模型，否则使用静态配置
  const options = models.length > 0 ? models : MODEL_OPTIONS;
  const option = options.find((opt) => opt.value === modelValue);

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
const MessageBubble = React.memo(
  function MessageBubble({
    message,
    onEdit,
    isGenerating = false,
    userAvatar,
    userName,
  }: {
    message: ChatMessage;
    onEdit?: (message: ChatMessage) => void;
    isGenerating?: boolean;
    userAvatar?: string;
    userName?: string;
  }) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);
    const [showReasoning, setShowReasoning] = useState(true); // 默认展开，不自动折叠

    // 是否有推理内容
    const hasReasoning = !isUser && message.reasoningContent && message.reasoningContent.length > 0;

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
    const handleShare = async () => {
      if (typeof navigator !== 'undefined' && !!navigator.share) {
        try {
          await navigator.share({
            text: message.content,
          });
        } catch {
          // 用户取消分享或分享失败
        }
      } else {
        // 降级处理：调用已有的复制逻辑，提供用户反馈
        await handleCopy();
      }
    };

    return (
      <div className="group">
        <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
          {/* 头像 - 移动端隐藏，桌面端显示 */}
          <div className="hidden md:flex flex-shrink-0">
            {isUser ? (
              <Avatar className="h-8 w-8 ring-1 ring-gray-100 shadow-sm">
                <AvatarImage src={userAvatar || ''} alt={userName || 'User'} />
                <AvatarFallback className="bg-blue-500 text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* 消息内容 */}
          <div
            className={cn(
              'flex flex-col gap-2',
              isUser ? 'max-w-[85%] md:max-w-[75%]' : 'w-full md:max-w-[75%]',
            )}
          >
            <div
              className={cn(
                'rounded-2xl text-sm leading-relaxed overflow-hidden',
                isUser
                  ? 'bg-blue-500 text-white rounded-tr-sm shadow-md w-fit'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm',
              )}
            >
              {isUser ? (
                // 用户消息直接显示
                <div className="px-4 py-3 whitespace-pre-wrap">{message.content}</div>
              ) : (
                // AI 消息：包含推理内容和主回复
                <>
                  {/* 推理内容（深度思考模式） */}
                  {hasReasoning && (
                    <div className="border-b border-gray-100">
                      <button
                        onClick={() => setShowReasoning(!showReasoning)}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-xs font-medium text-gray-600 hover:bg-gray-50/80 transition-all duration-200 group"
                      >
                        <Brain className="h-4 w-4 flex-shrink-0 text-blue-500" />
                        <span className="flex-1">
                          {message.isStreaming && !message.content ? '正在思考...' : '深度思考'}
                        </span>
                        {showReasoning ? (
                          <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        ) : (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </button>

                      <div
                        className={cn(
                          'grid transition-all duration-300 ease-in-out',
                          showReasoning
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0',
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                            <div
                              className={cn(
                                'prose prose-sm prose-gray max-w-none',
                                'prose-p:my-1.5 prose-p:text-gray-600 prose-p:leading-relaxed',
                                'prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-li:text-gray-600',
                                'prose-pre:my-3 prose-pre:bg-white prose-pre:border prose-pre:border-gray-200 prose-pre:shadow-sm',
                                'prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
                                'prose-code:before:content-none prose-code:after:content-none',
                                'prose-headings:text-gray-800 prose-headings:font-semibold prose-strong:text-gray-800',
                                'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
                                'text-[13px] leading-relaxed',
                                // 流式光标效果：仅在推理阶段（还没有主回复内容时）显示
                                message.isStreaming &&
                                  message.reasoningContent &&
                                  !message.content &&
                                  'after:content-["▋"] after:ml-1 after:animate-pulse after:text-blue-400 after:inline-block after:align-middle',
                              )}
                            >
                              <MdPreview
                                value={message.reasoningContent || ''}
                                theme="light"
                                showCodeRowNumber={false}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 主回复内容 */}
                  <div className="px-4 py-3">
                    <div
                      className={cn(
                        'prose prose-sm prose-gray max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
                        // 添加打字机光标效果：仅在主回复有内容且正在流式输出时显示
                        message.isStreaming &&
                          message.content &&
                          'after:content-["▋"] after:ml-1 after:animate-pulse after:text-blue-500 after:inline-block after:align-middle',
                      )}
                    >
                      {message.content ? (
                        <MdPreview
                          value={message.content}
                          theme="light"
                          showCodeRowNumber={false}
                        />
                      ) : message.isStreaming && !message.reasoningContent ? (
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          思考中...
                        </span>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 消息操作按钮 */}
        {!message.isStreaming && (
          <div
            className={cn(
              'flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity',
              isUser ? 'justify-end md:pr-11' : 'md:pl-11',
            )}
          >
            <button
              onClick={handleEdit}
              disabled={isGenerating}
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all duration-200',
                isGenerating
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer',
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
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50',
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
              className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs text-gray-400 rounded-md hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <Share2 className="h-3.5 w-3.5" />
              分享
            </button>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数
    // 如果消息内容变化、流式状态变化、推理内容变化或生成状态变化，则重新渲染
    return (
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.reasoningContent === nextProps.message.reasoningContent &&
      prevProps.message.isStreaming === nextProps.message.isStreaming &&
      prevProps.isGenerating === nextProps.isGenerating &&
      prevProps.userAvatar === nextProps.userAvatar &&
      prevProps.userName === nextProps.userName
    );
  },
);

export default function ChatAIPanels({
  config,
  inputValue,
  onInputChange,
  onSend,
  showBorder = false,
  messages = [],
  status = 'idle',
  onStopGenerating,
  onConfigChange,
  isCompareMode = false,
  onAddCompareModel,
  onCancelCompare,
}: ChatPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 获取当前用户信息用于头像显示
  const { data: user } = useUserQuery();

  // 获取动态模型列表用于显示名称
  const { models } = useChatModels();

  const router = useRouter();

  const logoutMutation = useLogoutMutation();

  // 挂载状态
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 使用 use-stick-to-bottom 实现自动滚动
  const { scrollRef, contentRef } = useStickToBottom();

  // 处理键盘事件（Enter 发送）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果正在输入法输入中，不触发发送
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (status !== 'streaming') {
        onSend();
      }
    }
  };

  // 是否禁用发送 (仅在空闲且输入为空时禁用)
  const isSendDisabled = status === 'idle' && !inputValue.trim();

  // 是否显示快捷问题（仅在消息为空时显示）
  const showQuickQuestions = messages.length === 0;

  // 从 config 中读取网页搜索和深度思考状态
  const enableWebSearch = config.enableWebSearch || false;
  const enableDeepThinking = config.enableThinking || false;

  // 切换网页搜索
  const toggleWebSearch = () => {
    onConfigChange?.({ ...config, enableWebSearch: !enableWebSearch });
  };

  // 切换深度思考
  const toggleDeepThinking = () => {
    onConfigChange?.({ ...config, enableThinking: !enableDeepThinking });
  };

  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-w-0 bg-gradient-to-br from-gray-50 to-blue-50/30',
        showBorder ? 'border border-gray-100 rounded-xl' : '',
      )}
    >
      {/* ----- 模型标题栏 ----- */}
      <header className="hidden lg:flex px-4 py-2 border-b border-gray-100 bg-white items-center justify-between sticky top-0 z-10 shadow-sm">
        <ModelConfigModal
          config={config}
          onConfigChange={onConfigChange || (() => {})}
          isCompareMode={isCompareMode}
          onAddCompareModel={onAddCompareModel}
          onCancelCompare={onCancelCompare}
          triggerClassName="text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors cursor-pointer"
          icon={null}
          title="模型配置"
        >
          {getModelDisplayName(config.modelName, models)}
        </ModelConfigModal>

        {mounted && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm group-hover:ring-blue-50 transition-all">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push('/dashboard/user')}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>个人中心</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push('/dashboard/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>账户设置</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {/* 消息区域 */}
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
                userAvatar={user?.avatar_url}
                userName={user?.name}
                onEdit={
                  onInputChange
                    ? (msg) => {
                        onInputChange(msg.content);
                        textareaRef.current?.focus();
                      }
                    : undefined
                }
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
                  }}
                  className={cn(
                    'px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-full cursor-pointer',
                    'hover:bg-gray-50 hover:border-blue-200 transition-colors',
                  )}
                >
                  {question.text}
                </button>
              ))}
            </div>
          )}

          {/* 输入框区域 */}
          <div className="relative border border-gray-200 rounded-xl bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={status === 'streaming' ? 'AI 正在回复中...' : '请输入提示词...'}
              disabled={status === 'streaming'}
              className={cn(
                'w-full min-h-[60px] px-4 py-3 pb-14 text-sm text-gray-800 outline-none resize-none',
                status === 'streaming' && 'opacity-60 cursor-not-allowed',
              )}
            />
            <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleWebSearch}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition-all duration-200',
                    enableWebSearch
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-200 hover:text-blue-600',
                  )}
                  disabled={status === 'streaming'}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>网页搜索</span>
                </button>
                <button
                  type="button"
                  onClick={toggleDeepThinking}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition-all duration-200',
                    enableDeepThinking
                      ? 'bg-purple-50 text-purple-600 border-purple-200'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-purple-200 hover:text-purple-600',
                  )}
                  disabled={status === 'streaming'}
                >
                  <Brain className="h-3.5 w-3.5" />
                  <span>深度思考</span>
                </button>
              </div>
              <button
                type="button"
                onClick={status === 'streaming' ? onStopGenerating : onSend}
                disabled={isSendDisabled}
                className={cn(
                  'h-9 w-9 inline-flex items-center justify-center rounded-lg shadow-sm transition-all duration-200',
                  status === 'streaming'
                    ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 shadow-red-100/50 active:scale-90'
                    : isSendDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200/50 shadow-lg active:scale-95',
                )}
                aria-label={status === 'streaming' ? '停止生成' : '发送'}
                title={status === 'streaming' ? '停止生成' : '发送'}
              >
                {status === 'streaming' ? (
                  <Square className="h-4 w-4 fill-current" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
