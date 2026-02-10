import { useState } from 'react';
import { Bot, Brain, Check, ChevronDown, ChevronUp, Copy, Loader2, User } from 'lucide-react';
import { MdPreview } from 'md-editor-rt';

import type { ChatMessage } from '@/app/chat-ai/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  userAvatar?: string;
  userName?: string;
}

export function MessageBubble({ message, userAvatar, userName }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);

  const hasReasoning = !isUser && message.reasoningContent && message.reasoningContent.length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 静默处理
    }
  };

  return (
    <div className="group">
      <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* 头像 */}
        <div className="shrink-0">
          {isUser ? (
            <Avatar className="h-7 w-7 ring-1 ring-gray-100">
              <AvatarImage src={userAvatar || ''} alt={userName || 'User'} />
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                <User className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm">
              <Bot className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* 消息内容 */}
        <div
          className={cn('flex flex-col gap-1', isUser ? 'max-w-[85%] items-end' : 'flex-1 min-w-0')}
        >
          <div
            className={cn(
              'rounded-2xl text-sm leading-relaxed overflow-hidden',
              isUser
                ? 'bg-blue-500 text-white rounded-tr-sm shadow-sm w-fit'
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm',
            )}
          >
            {isUser ? (
              <div className="px-3.5 py-2.5 whitespace-pre-wrap text-[13px]">{message.content}</div>
            ) : (
              <>
                {/* 推理内容（深度思考） */}
                {hasReasoning && (
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => setShowReasoning(!showReasoning)}
                      className="flex items-center gap-1.5 w-full text-left px-3.5 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50/80 transition-all"
                    >
                      <Brain className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <span className="flex-1">
                        {message.isStreaming && !message.content ? '正在思考...' : '深度思考'}
                      </span>
                      {showReasoning ? (
                        <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      )}
                    </button>
                    <div
                      className={cn(
                        'grid transition-all duration-300 ease-in-out',
                        showReasoning ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3.5 pb-3 pt-1.5 bg-gray-50/50">
                          <div
                            className={cn(
                              'prose prose-sm prose-gray max-w-none text-[12px] leading-relaxed',
                              'prose-p:my-1 prose-p:text-gray-600 prose-p:leading-relaxed',
                              'prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-li:text-gray-600',
                              'prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
                              'prose-code:before:content-none prose-code:after:content-none',
                              'prose-pre:my-2 prose-pre:bg-white prose-pre:border prose-pre:border-gray-200',
                              message.isStreaming &&
                                message.reasoningContent &&
                                !message.content &&
                                'after:content-["▋"] after:ml-1 after:animate-pulse after:text-purple-400 after:inline-block',
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
                <div className="px-3.5 py-2.5">
                  <div
                    className={cn(
                      'prose prose-sm prose-gray max-w-none text-[13px]',
                      'prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5',
                      'prose-pre:my-2 prose-pre:bg-gray-900 prose-pre:text-gray-100',
                      'prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
                      'prose-code:before:content-none prose-code:after:content-none',
                      message.isStreaming &&
                        message.content &&
                        'after:content-["▋"] after:ml-1 after:animate-pulse after:text-blue-500 after:inline-block',
                    )}
                  >
                    {message.content ? (
                      <MdPreview value={message.content} theme="light" showCodeRowNumber={false} />
                    ) : message.isStreaming && !message.reasoningContent ? (
                      <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        思考中...
                      </span>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 复制操作 */}
          {!isUser && !message.isStreaming && message.content && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className={cn(
                  'flex items-center gap-1 px-1.5 py-0.5 text-[11px] rounded transition-colors cursor-pointer',
                  copied ? 'text-green-600' : 'text-gray-400 hover:text-blue-600',
                )}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
