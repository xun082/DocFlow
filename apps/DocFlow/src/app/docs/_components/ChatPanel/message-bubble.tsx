import { useState } from 'react';
import {
  Bot,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Copy,
  Download,
  Link,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

import type { ChatMessage } from '@/app/chat-ai/types';
import {
  markdownComponents,
  compactMarkdownComponents,
} from '@/components/business/ai/markdown-components';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/utils';

/**
 * 将图片 URL 转为 PNG Blob 并写入剪贴板
 * 这样粘贴到富文本编辑器时会直接插入图片
 */
async function copyImageAsBlob(imageUrl: string): Promise<void> {
  // 通过 Image + Canvas 将任意格式转为 PNG（兼容 webp 等）
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas 不可用');
  ctx.drawImage(img, 0, 0);

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('图片转换失败'));
    }, 'image/png');
  });

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
}

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
            ) : message.imageUrl ? (
              /* 图片消息 */
              <div className="p-2">
                <div className="relative group/img rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={message.imageUrl}
                    alt={message.content || '生成的图片'}
                    className="w-full h-auto max-h-[320px] object-contain cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => window.open(message.imageUrl, '_blank')}
                    crossOrigin="anonymous"
                  />
                  {/* 悬浮工具栏 */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <button
                      onClick={async () => {
                        if (!message.imageUrl) return;

                        try {
                          await copyImageAsBlob(message.imageUrl);
                          toast.success('图片已复制，可粘贴到编辑器');
                        } catch {
                          toast.error('复制图片失败');
                        }
                      }}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-md shadow-sm transition-colors"
                      title="复制图片"
                    >
                      <ClipboardCopy className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (message.imageUrl) {
                          navigator.clipboard.writeText(message.imageUrl);
                          toast.success('链接已复制');
                        }
                      }}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-md shadow-sm transition-colors"
                      title="复制链接"
                    >
                      <Link className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <a
                      href={message.imageUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white/90 hover:bg-white rounded-md shadow-sm transition-colors"
                      title="下载图片"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-600" />
                    </a>
                  </div>
                  {/* 底部提示词 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <p className="text-[11px] text-white/90 line-clamp-2">{message.content}</p>
                  </div>
                </div>
                {/* 尺寸信息 */}
                {message.imageSize && (
                  <div className="flex items-center gap-1.5 mt-1.5 px-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-[11px] text-gray-400">{message.imageSize}</span>
                  </div>
                )}
              </div>
            ) : message.isStreaming && message.imageSize ? (
              /* 图片加载状态 */
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                    <Sparkles className="w-4 h-4 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-800">AI 正在绘图...</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">尺寸 {message.imageSize}</p>
                  </div>
                </div>
              </div>
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
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={compactMarkdownComponents}
                            >
                              {message.reasoningContent || ''}
                            </ReactMarkdown>
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
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
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
