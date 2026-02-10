'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import 'md-editor-rt/lib/preview.css';
import { useStickToBottom } from 'use-stick-to-bottom';
import { toast } from 'sonner';

import { MessageBubble } from './message-bubble';
import { ChatTabBar } from './chat-tab-bar';
import { ChatEmptyState } from './chat-empty-state';
import { BrainstormEmptyState } from './brainstorm-empty-state';
import { BrainstormResults } from './brainstorm-results';
import { DocumentReferenceCard } from './document-reference-card';
import { ChatInputArea, type ChatMode } from './chat-input-area';

import { useChat } from '@/app/chat-ai/hooks/useChat';
import { useChatModels } from '@/app/chat-ai/hooks/useChatModels';
import { useConversations } from '@/app/chat-ai/hooks/useConversations';
import type { ModelConfig } from '@/app/chat-ai/types';
import { DEFAULT_MODEL_CONFIG } from '@/app/chat-ai/constants';
import { useChatStore } from '@/stores/chatStore';
import { useUserQuery } from '@/hooks/useUserQuery';
import { cn } from '@/utils';
import { ChatAiApi, type StreamChunk } from '@/services/chat-ai';

/** 文档 AI 助手系统提示词 */
const DOC_SYSTEM_PROMPT =
  '你是一个专业的文档 AI 助手。帮助用户解答关于文档内容的问题，提供写作建议、内容优化方案和创意灵感。请用简洁、专业的中文回复。';

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

  // 处理预设消息
  useEffect(() => {
    if (presetMessage && activeTab && !activeTab.conversationId) {
      setInputValue(presetMessage);
      setPresetMessage(null);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [presetMessage, activeTab, setPresetMessage]);

  const handleSend = () => {
    if (!inputValue.trim() || status === 'streaming') return;

    const userInput = inputValue.trim();
    let messageContent = userInput;

    if (documentReference) {
      const refText = `\`\`\`${documentReference.fileName} (行 ${documentReference.startLine}-${documentReference.endLine})\n${documentReference.content}\n\`\`\`\n\n`;
      messageContent = refText + messageContent;
      setDocumentReference(null);
    }

    setInputValue('');

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
      const referenceData = e.clipboardData.getData('application/docflow-reference');

      if (referenceData) {
        e.preventDefault();

        const reference = JSON.parse(referenceData);

        if (
          reference.type === 'docflow-reference' &&
          reference.fileName &&
          reference.content &&
          typeof reference.startLine === 'number' &&
          typeof reference.endLine === 'number'
        ) {
          setDocumentReference({
            fileName: reference.fileName,
            startLine: reference.startLine,
            endLine: reference.endLine,
            content: reference.content,
            charCount: reference.charCount || reference.content.length,
          });

          return;
        }
      }
    } catch (error) {
      console.error('粘贴解析失败:', error);
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

  const handleCloseTab = (tabId: string) => {
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
      <ChatTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        sessions={sessions}
        onNewTab={handleNewTab}
        onSwitchTab={handleSwitchTab}
        onCloseTab={handleCloseTab}
        onOpenSession={handleOpenSession}
        onRefreshSessions={refreshSessions}
        onClosePanel={() => setIsOpen(false)}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {chatMode === 'normal' ? (
          <>
            {status === 'loading' ? (
              <div className="flex items-center justify-center h-full gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-400">加载中...</span>
              </div>
            ) : messages.length === 0 ? (
              <ChatEmptyState />
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
          <div className="flex flex-col h-full">
            {brainstormResponses.length === 0 ? (
              <BrainstormEmptyState brainstormCount={brainstormCount} />
            ) : (
              <BrainstormResults
                responses={brainstormResponses}
                count={brainstormCount}
                isBrainstorming={isBrainstorming}
                onStop={handleStopBrainstorm}
                onRegenerate={handleRegenerateBrainstorm}
              />
            )}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        {chatMode === 'normal' && documentReference && (
          <DocumentReferenceCard
            reference={documentReference}
            onRemove={() => setDocumentReference(null)}
          />
        )}

        <ChatInputArea
          inputValue={inputValue}
          onInputChange={setInputValue}
          onKeyDown={handleKeyDown}
          onPaste={chatMode === 'normal' ? handlePaste : undefined}
          chatMode={chatMode}
          onChatModeChange={setChatMode}
          onClearBrainstorm={handleClearBrainstorm}
          config={config}
          onConfigChange={setConfig}
          models={models}
          brainstormCount={brainstormCount}
          onBrainstormCountChange={setBrainstormCount}
          status={status}
          isBrainstorming={isBrainstorming}
          isSendDisabled={isSendDisabled}
          onSend={handleSend}
          onStop={stopGenerating}
          onBrainstorm={handleBrainstorm}
          onStopBrainstorm={handleStopBrainstorm}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
}
