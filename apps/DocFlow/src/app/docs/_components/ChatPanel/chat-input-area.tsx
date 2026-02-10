'use client';

import { Send, Square, Brain, Globe, ChevronDown, Lightbulb, MessageSquare } from 'lucide-react';

import type { ChatStatus, ModelConfig, ModelOption } from '@/app/chat-ai/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils';

export type ChatMode = 'normal' | 'brainstorm';

interface ChatInputAreaProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  chatMode: ChatMode;
  onChatModeChange: (mode: ChatMode) => void;
  onClearBrainstorm: () => void;
  /** 仅 normal 模式使用 */
  config?: ModelConfig;
  onConfigChange?: (updater: (prev: ModelConfig) => ModelConfig) => void;
  models?: ModelOption[];
  /** 仅 brainstorm 模式使用 */
  brainstormCount: number;
  onBrainstormCountChange: (count: number) => void;
  status: ChatStatus;
  isBrainstorming: boolean;
  isSendDisabled: boolean;
  onSend: () => void;
  onStop: () => void;
  onBrainstorm: () => void;
  onStopBrainstorm: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInputArea({
  inputValue,
  onInputChange,
  onKeyDown,
  onPaste,
  chatMode,
  onChatModeChange,
  onClearBrainstorm,
  config,
  onConfigChange,
  models = [],
  brainstormCount,
  onBrainstormCountChange,
  status,
  isBrainstorming,
  isSendDisabled,
  onSend,
  onStop,
  onBrainstorm,
  onStopBrainstorm,
  textareaRef,
}: ChatInputAreaProps) {
  const isBusy = status === 'streaming' || isBrainstorming;

  const placeholder =
    chatMode === 'brainstorm'
      ? isBrainstorming
        ? 'AI 正在生成方案...'
        : '输入主题，生成多个创意方案...'
      : status === 'streaming'
        ? 'AI 正在回复中...'
        : '输入消息，Enter 发送...';

  const handlePrimaryAction = () => {
    if (chatMode === 'normal') {
      if (status === 'streaming') onStop();
      else onSend();
    } else {
      if (isBrainstorming) onStopBrainstorm();
      else onBrainstorm();
    }
  };

  const primaryDisabled =
    chatMode === 'normal' ? isSendDisabled : !inputValue.trim() && !isBrainstorming;

  return (
    <div className="relative border border-gray-200 rounded-xl bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        disabled={isBusy}
        rows={2}
        className={cn(
          'w-full px-3.5 py-2.5 pb-11 text-sm text-gray-800 outline-none resize-none rounded-xl bg-transparent',
          isBusy && 'opacity-60 cursor-not-allowed',
        )}
      />
      <div className="absolute right-2.5 bottom-2 left-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                disabled={isBusy}
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
                  onChatModeChange('normal');
                  onClearBrainstorm();
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
                  onChatModeChange('brainstorm');
                  onClearBrainstorm();
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
              {models.length > 0 && config?.modelName && onConfigChange && (
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
                          onConfigChange((prev) => ({ ...prev, modelName: model.value }))
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

              <button
                type="button"
                onClick={() =>
                  onConfigChange?.((prev) => ({ ...prev, enableWebSearch: !prev.enableWebSearch }))
                }
                disabled={status === 'streaming'}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all duration-200',
                  config?.enableWebSearch
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-blue-200 hover:text-blue-500',
                )}
              >
                <Globe className="h-3 w-3" />
                <span>联网</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onConfigChange?.((prev) => ({ ...prev, enableThinking: !prev.enableThinking }))
                }
                disabled={status === 'streaming'}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all duration-200',
                  config?.enableThinking
                    ? 'bg-purple-50 text-purple-600 border-purple-200'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-purple-200 hover:text-purple-500',
                )}
              >
                <Brain className="h-3 w-3" />
                <span>思考</span>
              </button>
            </>
          ) : (
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
                    onClick={() => onBrainstormCountChange(count)}
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
          )}
        </div>

        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={primaryDisabled}
          className={cn(
            'h-7 w-7 inline-flex items-center justify-center rounded-lg shadow-sm transition-all duration-200',
            isBusy
              ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 active:scale-90'
              : !inputValue.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
                : chatMode === 'brainstorm'
                  ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-200/50 shadow-lg active:scale-95'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200/50 shadow-lg active:scale-95',
          )}
          aria-label={isBusy ? '停止生成' : '发送'}
        >
          {isBusy ? (
            <Square className="h-3 w-3 fill-current" />
          ) : chatMode === 'brainstorm' ? (
            <Lightbulb className="h-3 w-3" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}
