'use client';

/**
 * 文档 AI 助手面板
 *
 * 功能说明：
 * - Cursor 风格的标签页管理（多会话并行）
 * - 复用 chat-ai 的 useChat Hook 进行 SSE 流式对话
 * - 支持模型切换、联网搜索、深度思考
 * - MdPreview 渲染 Markdown 消息
 * - 历史会话快速加载
 */

import { useEffect, useRef, useState } from 'react';
import {
  Send,
  X,
  Square,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  Brain,
  Globe,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  Clock,
  FileText,
  Lightbulb,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';
import { useStickToBottom } from 'use-stick-to-bottom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

import { useChat } from '@/app/chat-ai/hooks/useChat';
import { useChatModels } from '@/app/chat-ai/hooks/useChatModels';
import { useConversations } from '@/app/chat-ai/hooks/useConversations';
import type { ChatMessage, ModelConfig } from '@/app/chat-ai/types';
import { DEFAULT_MODEL_CONFIG } from '@/app/chat-ai/constants';
import { useChatStore } from '@/stores/chatStore';
import { useUserQuery } from '@/hooks/useUserQuery';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatAiApi, type StreamChunk } from '@/services/chat-ai';
import { compactMarkdownComponents } from '@/components/business/ai/markdown-components';

/** 文档 AI 助手系统提示词 */
const DOC_SYSTEM_PROMPT =
  '你是一个专业的文档 AI 助手。帮助用户解答关于文档内容的问题，提供写作建议、内容优化方案和创意灵感。请用简洁、专业的中文回复。';

/** 聊天模式 */
type ChatMode = 'normal' | 'brainstorm';

interface BrainstormResponse {
  content: string;
  finished: boolean;
}

interface ChatPanelProps {
  documentId?: string;
  className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
  const {
    tabs,
    activeTabId,
    documentReference,
    presetMessage,
    setIsOpen,
    addTab,
    removeTab,
    setActiveTab,
    updateTab,
    setDocumentReference,
    setPresetMessage,
  } = useChatStore();

  const { data: user } = useUserQuery();
  const { models } = useChatModels();
  const { sessions, refresh: refreshSessions } = useConversations();

  const {
    messages,
    status,
    conversationId,
    sendMessage,
    stopGenerating,
    clearMessages,
    loadConversation,
  } = useChat();

  const [config, setConfig] = useState<ModelConfig>({
    id: 'doc-chat-model',
    ...DEFAULT_MODEL_CONFIG,
    systemPrompt: DOC_SYSTEM_PROMPT,
  });

  const [inputValue, setInputValue] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('normal');
  const [brainstormCount, setBrainstormCount] = useState(3);
  const [brainstormResponses, setBrainstormResponses] = useState<BrainstormResponse[]>([]);
  const [brainstormTopic, setBrainstormTopic] = useState('');
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const abortBrainstormRef = useRef<(() => void) | undefined>(undefined);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { scrollRef, contentRef } = useStickToBottom();
  const prevTabIdRef = useRef<string | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // 确保至少有一个标签页
  useEffect(() => {
    if (tabs.length === 0) {
      addTab();
    }
  }, [tabs.length, addTab]);

  // 模型列表加载后设置默认模型
  useEffect(() => {
    if (models.length > 0 && !config.modelName) {
      setConfig((prev) => ({ ...prev, modelName: models[0].value }));
    }
  }, [models, config.modelName]);

  // 切换标签页时加载对应会话
  useEffect(() => {
    if (!activeTab || prevTabIdRef.current === activeTab.id) return;
    prevTabIdRef.current = activeTab.id;

    if (activeTab.conversationId) {
      loadConversation(activeTab.conversationId);
    } else {
      clearMessages();
    }

    setInputValue('');

    // 延迟聚焦，确保 DOM 已更新
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [activeTab?.id, activeTab?.conversationId, loadConversation, clearMessages]);

  // 首条消息返回 conversationId 后同步到标签页
  useEffect(() => {
    if (conversationId && activeTab && !activeTab.conversationId) {
      updateTab(activeTab.id, { conversationId });
    }
  }, [conversationId, activeTab, updateTab]);

  // 处理预设消息：当激活新标签页且有预设消息时，自动填充输入框
  useEffect(() => {
    if (presetMessage && activeTab && !activeTab.conversationId) {
      setInputValue(presetMessage);
      setPresetMessage(null); // 使用后立即清除，避免重复填充

      // 聚焦到输入框
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [presetMessage, activeTab, setPresetMessage]);

  // ===== 事件处理 =====

  const handleSend = () => {
    if (!inputValue.trim() || status === 'streaming') return;

    const userInput = inputValue.trim();
    let messageContent = userInput;

    // 如果有文档引用，将其添加到消息前面
    if (documentReference) {
      const refText = `\`\`\`${documentReference.fileName} (行 ${documentReference.startLine}-${documentReference.endLine})\n${documentReference.content}\n\`\`\`\n\n`;
      messageContent = refText + messageContent;
      setDocumentReference(null); // 发送后清除引用
    }

    setInputValue('');

    // 如果是新对话，使用纯用户输入更新标题（不包含文档引用）
    if (activeTab?.title === '新对话' && userInput) {
      const title = userInput.slice(0, 24) + (userInput.length > 24 ? '...' : '');
      updateTab(activeTab.id, { title });
    }

    sendMessage(messageContent, config);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (chatMode === 'normal') {
        if (status !== 'streaming') {
          handleSend();
        }
      } else {
        if (!isBrainstorming) {
          handleBrainstorm();
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    try {
      // 尝试获取文档引用元数据
      const referenceData = e.clipboardData.getData('application/docflow-reference');

      if (referenceData) {
        e.preventDefault(); // 阻止默认粘贴行为

        const reference = JSON.parse(referenceData);

        // 验证数据格式
        if (
          reference.type === 'docflow-reference' &&
          reference.fileName &&
          reference.content &&
          typeof reference.startLine === 'number' &&
          typeof reference.endLine === 'number'
        ) {
          // 设置文档引用到 store
          setDocumentReference({
            fileName: reference.fileName,
            startLine: reference.startLine,
            endLine: reference.endLine,
            content: reference.content,
            charCount: reference.charCount || reference.content.length,
          });

          // 不修改输入框内容，只显示引用卡片
          return;
        }
      }

      // 如果没有文档引用元数据，允许默认粘贴行为
    } catch (error) {
      console.error('粘贴解析失败:', error);
      // 发生错误时允许默认粘贴行为
    }
  };

  const handleNewTab = () => {
    if (status === 'streaming') stopGenerating();
    prevTabIdRef.current = null;
    addTab();
  };

  const handleSwitchTab = (tabId: string) => {
    if (tabId === activeTabId) return;

    if (status === 'streaming') stopGenerating();
    prevTabIdRef.current = null;
    setActiveTab(tabId);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();

    if (status === 'streaming' && tabId === activeTabId) stopGenerating();
    prevTabIdRef.current = null;
    removeTab(tabId);
  };

  const handleOpenSession = (session: { id: string; title: string }) => {
    const existing = tabs.find((t) => t.conversationId === session.id);

    if (existing) {
      handleSwitchTab(existing.id);

      return;
    }

    if (status === 'streaming') stopGenerating();
    prevTabIdRef.current = null;
    addTab({ title: session.title, conversationId: session.id });
  };

  const toggleWebSearch = () =>
    setConfig((prev) => ({ ...prev, enableWebSearch: !prev.enableWebSearch }));
  const toggleDeepThinking = () =>
    setConfig((prev) => ({ ...prev, enableThinking: !prev.enableThinking }));

  const executeBrainstorm = async (topic: string) => {
    setIsBrainstorming(true);

    const newResponses: BrainstormResponse[] = Array(brainstormCount)
      .fill(null)
      .map(() => ({ content: '', finished: false }));
    setBrainstormResponses(newResponses);

    try {
      const cancel = await ChatAiApi.Brainstorm(
        {
          topic,
          n: brainstormCount,
          model: 'Pro/zai-org/GLM-4.7',
          temperature: 1.2,
        },
        (chunk: StreamChunk) => {
          if (chunk.event === 'message' && chunk.index !== undefined) {
            const index = chunk.index;

            setBrainstormResponses((prev) => {
              const updated = [...prev];

              if (!updated[index]) {
                updated[index] = { content: '', finished: false };
              }

              if (chunk.content) {
                updated[index] = {
                  ...updated[index],
                  content: updated[index].content + chunk.content,
                };
              }

              if (chunk.finish_reason) {
                updated[index] = {
                  ...updated[index],
                  finished: true,
                };
              }

              return updated;
            });
          }

          if (chunk.event === 'done') {
            setIsBrainstorming(false);
          }
        },
        () => {
          toast.error('生成失败，请重试');
          setIsBrainstorming(false);
        },
      );

      abortBrainstormRef.current = cancel;
    } catch {
      toast.error('生成失败，请重试');
      setIsBrainstorming(false);
    }
  };

  const handleBrainstorm = async () => {
    if (!inputValue.trim() || isBrainstorming) return;

    const topic = inputValue.trim();
    setBrainstormTopic(topic);
    setInputValue('');

    // 更新标签页标题
    if (activeTab?.title === '新对话' && topic) {
      const title = topic.slice(0, 24) + (topic.length > 24 ? '...' : '');
      updateTab(activeTab.id, { title });
    }

    await executeBrainstorm(topic);
  };

  const handleStopBrainstorm = () => {
    try {
      abortBrainstormRef.current?.();
    } catch {
      // 静默处理
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleClearBrainstorm = () => {
    setBrainstormResponses([]);
    setBrainstormTopic('');
    textareaRef.current?.focus();
  };

  const handleRegenerateBrainstorm = async () => {
    if (!brainstormTopic || isBrainstorming) return;
    await executeBrainstorm(brainstormTopic);
  };

  const isSendDisabled = status === 'idle' && !inputValue.trim();

  return (
    <div
      className={cn('flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50/30', className)}
    >
      {/* ===== 标签栏（Cursor 风格） ===== */}
      <div className="flex items-center bg-white border-b border-gray-100 min-h-[38px]">
        {/* 可横向滚动的标签区域 */}
        <div className="flex-1 flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSwitchTab(tab.id)}
              className={cn(
                'group relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap max-w-[200px] min-w-0 transition-colors shrink-0',
                tab.id === activeTabId
                  ? 'bg-white text-gray-800 shadow-[inset_0_-2px_0_0_theme(colors.blue.500)]'
                  : 'bg-gray-50/50 text-gray-500 hover:bg-gray-100/80 hover:text-gray-700',
              )}
            >
              <Sparkles className="h-3 w-3 shrink-0 text-blue-500" />
              <span className="truncate">{tab.title}</span>
              {tabs.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCloseTab(e as unknown as React.MouseEvent, tab.id);
                  }}
                  className="ml-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all shrink-0"
                >
                  <X className="h-2.5 w-2.5" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 标签栏操作按钮 */}
        <div className="flex items-center gap-0.5 px-1.5 shrink-0 border-l border-gray-100">
          <button
            onClick={handleNewTab}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="新建对话"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          {/* 历史记录下拉 */}
          <DropdownMenu onOpenChange={(open) => open && refreshSessions()}>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="历史记录"
              >
                <Clock className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {sessions.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-gray-400">暂无历史记录</div>
              ) : (
                sessions.slice(0, 3).map((session) => (
                  <DropdownMenuItem
                    key={session.id}
                    onClick={() => handleOpenSession(session)}
                    className="cursor-pointer text-xs gap-2"
                  >
                    <Sparkles className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="关闭面板"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ===== 消息区域 ===== */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {chatMode === 'normal' ? (
          // 普通对话模式
          <>
            {status === 'loading' ? (
              <div className="flex items-center justify-center h-full gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-400">加载中...</span>
              </div>
            ) : messages.length === 0 ? (
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
            ) : (
              <div ref={contentRef} className="p-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    userAvatar={user?.avatar_url}
                    userName={user?.name}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // 头脑风暴模式
          <div className="flex flex-col h-full">
            {brainstormResponses.length === 0 ? (
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
            ) : (
              <div className="flex-1 p-4 overflow-y-auto">
                <div
                  className={cn(
                    'grid gap-3',
                    brainstormCount === 2 && 'grid-cols-2',
                    brainstormCount === 3 && 'grid-cols-3',
                    brainstormCount === 4 && 'grid-cols-2',
                    brainstormCount === 5 && 'grid-cols-3',
                  )}
                >
                  {brainstormResponses.map((response, index) => (
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
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={compactMarkdownComponents}
                            >
                              {response.content}
                            </ReactMarkdown>
                            {!response.finished && (
                              <span className="inline-block w-1 h-3 bg-gradient-to-b from-purple-500 to-indigo-600 ml-0.5 animate-pulse rounded-sm"></span>
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
                      onClick={handleStopBrainstorm}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 rounded-lg border-2 border-red-300 hover:border-red-400 bg-white hover:bg-red-50 transition-all shadow-sm"
                    >
                      <Square className="h-3 w-3 fill-current" />
                      停止生成
                    </button>
                  </div>
                )}
                {!isBrainstorming && brainstormResponses.some((r) => r.content) && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleRegenerateBrainstorm}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <Zap className="h-3 w-3" />
                      重新生成
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== 底部输入区域 ===== */}
      <div className="p-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        {/* 文档引用卡片 - 仅在普通对话模式显示 */}
        {chatMode === 'normal' && documentReference && (
          <div className="mb-3 animate-in slide-in-from-bottom-2 duration-200">
            <div className="relative flex items-start gap-2.5 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500 text-white shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-emerald-700">文档引用</span>
                  <span className="text-xs text-emerald-600/70">
                    已选中 {documentReference.charCount} 字符
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate font-medium">{documentReference.fileName}</span>
                  <span className="text-emerald-500/70">
                    (行 {documentReference.startLine}-{documentReference.endLine})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDocumentReference(null)}
                className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-emerald-200/50 text-emerald-600 transition-colors shrink-0"
                title="移除引用"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="relative border border-gray-200 rounded-xl bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={chatMode === 'normal' ? handlePaste : undefined}
            placeholder={
              chatMode === 'brainstorm'
                ? isBrainstorming
                  ? 'AI 正在生成方案...'
                  : '输入主题，生成多个创意方案...'
                : status === 'streaming'
                  ? 'AI 正在回复中...'
                  : '输入消息，Enter 发送...'
            }
            disabled={status === 'streaming' || isBrainstorming}
            rows={2}
            className={cn(
              'w-full px-3.5 py-2.5 pb-11 text-sm text-gray-800 outline-none resize-none rounded-xl bg-transparent',
              (status === 'streaming' || isBrainstorming) && 'opacity-60 cursor-not-allowed',
            )}
          />
          <div className="absolute right-2.5 bottom-2 left-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* 模式切换器 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    disabled={status === 'streaming' || isBrainstorming}
                  >
                    {chatMode === 'normal' ? (
                      <>
                        <MessageSquare className="h-3 w-3" />
                        <span>对话</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-3 w-3" />
                        <span>风暴</span>
                      </>
                    )}
                    <ChevronDown className="h-2.5 w-2.5 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32">
                  <DropdownMenuItem
                    onClick={() => {
                      setChatMode('normal');
                      handleClearBrainstorm();
                    }}
                    className={cn(
                      'cursor-pointer text-xs flex items-center gap-2',
                      chatMode === 'normal' && 'bg-blue-50 text-blue-600',
                    )}
                  >
                    <MessageSquare className="h-3 w-3" />
                    对话
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setChatMode('brainstorm');
                      handleClearBrainstorm();
                    }}
                    className={cn(
                      'cursor-pointer text-xs flex items-center gap-2',
                      chatMode === 'brainstorm' && 'bg-purple-50 text-purple-600',
                    )}
                  >
                    <Lightbulb className="h-3 w-3" />
                    风暴
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {chatMode === 'normal' ? (
                <>
                  {/* 模型选择器 - 仅对话模式 */}
                  {models.length > 0 && config.modelName && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                          disabled={status === 'streaming'}
                        >
                          <span className="max-w-[80px] truncate">
                            {models.find((m) => m.value === config.modelName)?.label ||
                              config.modelName}
                          </span>
                          <ChevronDown className="h-2.5 w-2.5 shrink-0" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model.value}
                            onClick={() =>
                              setConfig((prev) => ({ ...prev, modelName: model.value }))
                            }
                            className={cn(
                              'cursor-pointer text-xs',
                              config.modelName === model.value && 'bg-blue-50 text-blue-600',
                            )}
                          >
                            {model.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* 联网搜索 */}
                  <button
                    type="button"
                    onClick={toggleWebSearch}
                    disabled={status === 'streaming'}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all duration-200',
                      config.enableWebSearch
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-blue-200 hover:text-blue-500',
                    )}
                  >
                    <Globe className="h-3 w-3" />
                    <span>联网</span>
                  </button>

                  {/* 深度思考 */}
                  <button
                    type="button"
                    onClick={toggleDeepThinking}
                    disabled={status === 'streaming'}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all duration-200',
                      config.enableThinking
                        ? 'bg-purple-50 text-purple-600 border-purple-200'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-purple-200 hover:text-purple-500',
                    )}
                  >
                    <Brain className="h-3 w-3" />
                    <span>思考</span>
                  </button>
                </>
              ) : (
                <>
                  {/* 头脑风暴并发数 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-[11px] text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:border-purple-300 transition-colors"
                        disabled={isBrainstorming}
                      >
                        <span>{brainstormCount} 个方案</span>
                        <ChevronDown className="h-2.5 w-2.5 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {[2, 3, 4, 5].map((count) => (
                        <DropdownMenuItem
                          key={count}
                          onClick={() => setBrainstormCount(count)}
                          className={cn(
                            'cursor-pointer text-xs',
                            brainstormCount === count && 'bg-purple-50 text-purple-600',
                          )}
                        >
                          生成 {count} 个方案
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>

            {/* 发送 / 停止 按钮 */}
            <button
              type="button"
              onClick={
                chatMode === 'normal'
                  ? status === 'streaming'
                    ? stopGenerating
                    : handleSend
                  : isBrainstorming
                    ? handleStopBrainstorm
                    : handleBrainstorm
              }
              disabled={
                chatMode === 'normal' ? isSendDisabled : !inputValue.trim() && !isBrainstorming
              }
              className={cn(
                'h-7 w-7 inline-flex items-center justify-center rounded-lg shadow-sm transition-all duration-200',
                status === 'streaming' || isBrainstorming
                  ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 active:scale-90'
                  : !inputValue.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
                    : chatMode === 'brainstorm'
                      ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-200/50 shadow-lg active:scale-95'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200/50 shadow-lg active:scale-95',
              )}
              aria-label={status === 'streaming' || isBrainstorming ? '停止生成' : '发送'}
            >
              {status === 'streaming' || isBrainstorming ? (
                <Square className="h-3 w-3 fill-current" />
              ) : chatMode === 'brainstorm' ? (
                <Lightbulb className="h-3 w-3" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 消息气泡组件 =====

interface MessageBubbleProps {
  message: ChatMessage;
  userAvatar?: string;
  userName?: string;
}

function MessageBubble({ message, userAvatar, userName }: MessageBubbleProps) {
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
