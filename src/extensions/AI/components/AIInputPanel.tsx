import React, { useCallback, useRef } from 'react';
import { ArrowUp, Paperclip, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

import Button from './Button';
import Textarea from './Textarea';
import CustomDivider from './CustomDivider';
import ModelSelector from './ModelSelector';

import { cn } from '@/utils/utils';

interface ActionButton {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  hoverBgColor: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface AIInputPanelProps {
  prompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerateAI: () => void;
  isLoading: boolean;
  hasContent: boolean;
  actionButtons: ActionButton[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  uploadInputRef: React.RefObject<HTMLInputElement | null>;
  componentRef: React.RefObject<HTMLDivElement | null>;
  node: ProseMirrorNode;
}

const AIInputPanel: React.FC<AIInputPanelProps> = ({
  prompt,
  onPromptChange,
  onGenerateAI,
  isLoading,
  hasContent,
  actionButtons,
  selectedModel,
  setSelectedModel,
  textareaRef,
  uploadInputRef,
  componentRef,
  node,
}) => {
  // 记录用户是否正在选择文本或使用输入法
  const isComposingRef = useRef(false);
  const selectionStartRef = useRef<number | null>(null);

  // 智能回车键处理
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // 如果是回车键且不是 Shift+Enter
      if (e.key === 'Enter' && !e.shiftKey) {
        const textarea = e.target as HTMLTextAreaElement;
        const { selectionStart, selectionEnd } = textarea;

        // 检查是否正在使用输入法
        if (isComposingRef.current) {
          return;
        }

        // 检查是否有选中的文本（用户可能在选择文字）
        if (selectionStart !== selectionEnd) {
          return;
        }

        // 检查光标位置是否刚刚发生变化（可能是通过回车键移动的）
        if (
          selectionStartRef.current !== null &&
          Math.abs(selectionStart - selectionStartRef.current) === 1
        ) {
          // 允许一次性的光标移动，但重置状态
          selectionStartRef.current = selectionStart;

          return;
        }

        // 检查是否能发送
        const canSend = (hasContent && prompt?.trim()) || node.attrs.op === 'continue';

        if (canSend && !isLoading) {
          e.preventDefault();
          onGenerateAI();
        }
      }
    },
    [hasContent, prompt, node.attrs.op, isLoading, onGenerateAI],
  );

  // 处理输入法状态
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  // 跟踪光标位置变化
  const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    selectionStartRef.current = textarea.selectionStart;
  }, []);

  // 增强的发送逻辑
  const handleSend = useCallback(() => {
    // 检查各种发送条件
    const canSend =
      // 基本条件：有内容或者是续写模式
      ((hasContent && prompt?.trim()) || node.attrs.op === 'continue') &&
      // 不在加载状态
      !isLoading;

    if (canSend) {
      console.log('发送AI请求:', { prompt: prompt?.trim(), op: node.attrs.op });
      onGenerateAI();
    } else {
      // 提供用户反馈
      if (isLoading) {
        console.log('正在处理中，请稍候...');
      } else if (!prompt?.trim() && node.attrs.op !== 'continue') {
        console.log('请输入内容后再发送');
        // 聚焦到输入框
        textareaRef.current?.focus();
      }
    }
  }, [hasContent, prompt, node.attrs.op, isLoading, onGenerateAI, textareaRef]);

  return (
    <div
      ref={componentRef}
      className={cn(
        'rounded-3xl border border-[#D1D5DB] bg-[#F9FAFB] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300',
      )}
    >
      <div className={cn('transition-all duration-300')}>
        {node.attrs.op !== 'ask' || (
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={onPromptChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onSelect={handleSelect}
            onFocus={(e) => {
              const textarea = e.target as HTMLTextAreaElement;
              const length = textarea.value.length;
              setTimeout(() => {
                textarea.setSelectionRange(length, length);
                selectionStartRef.current = length;
              }, 0);
            }}
            className="text-base"
            disabled={isLoading}
            placeholder="输入你的AI提示词..."
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          multiple={false}
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-[#6B7280] hover:text-[#374151] hover:bg-gray-200/50"
          onClick={() => uploadInputRef.current?.click()}
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-1">
          {actionButtons.slice(0, 2).map((buttonConfig, index) => {
            const IconComponent = buttonConfig.icon;

            return (
              <button
                key={`action-${buttonConfig.id}-${index}`}
                onClick={() => {
                  buttonConfig.onClick();
                }}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-gray-200/50',
                  buttonConfig.isActive
                    ? `${buttonConfig.bgColor} ${buttonConfig.hoverBgColor}`
                    : 'text-[#6B7280] hover:text-[#374151]',
                )}
                style={{
                  color: buttonConfig.isActive ? buttonConfig.color : undefined,
                }}
                disabled={buttonConfig.disabled}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      rotate: buttonConfig.isActive ? 360 : 0,
                      scale: buttonConfig.isActive ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: buttonConfig.isActive ? 360 : 15,
                      scale: 1.1,
                      transition: { type: 'spring', stiffness: 300, damping: 10 },
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  >
                    <IconComponent
                      className={cn('w-4 h-4', buttonConfig.isActive ? '' : 'text-inherit')}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {buttonConfig.isActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap flex-shrink-0"
                      style={{ color: buttonConfig.color }}
                    >
                      {buttonConfig.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}

          <CustomDivider />

          {actionButtons.slice(2).map((buttonConfig, index) => {
            if (buttonConfig.id === 'model') {
              return (
                <div
                  key={`model-${buttonConfig.id}-${index}`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ModelSelector
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    disabled={buttonConfig.disabled}
                    buttonConfig={buttonConfig}
                  />
                </div>
              );
            }

            const IconComponent = buttonConfig.icon;

            return (
              <button
                key={`button-${buttonConfig.id}-${index}`}
                onClick={() => {
                  buttonConfig.onClick();
                }}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-gray-600/30',
                  buttonConfig.isActive
                    ? `${buttonConfig.bgColor} ${buttonConfig.hoverBgColor}`
                    : 'text-[#9CA3AF] hover:text-[#D1D5DB]',
                )}
                style={{
                  color: buttonConfig.isActive ? buttonConfig.color : undefined,
                }}
                disabled={buttonConfig.disabled}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      rotate: buttonConfig.isActive ? 360 : 0,
                      scale: buttonConfig.isActive ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: buttonConfig.isActive ? 360 : 15,
                      scale: 1.1,
                      transition: { type: 'spring', stiffness: 300, damping: 10 },
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  >
                    <IconComponent
                      className={cn('w-4 h-4', buttonConfig.isActive ? '' : 'text-inherit')}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {buttonConfig.isActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap flex-shrink-0"
                      style={{ color: buttonConfig.color }}
                    >
                      {buttonConfig.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        <Button
          variant="default"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full transition-all duration-200',
            ((hasContent && prompt?.trim()) || node.attrs.op === 'continue') && !isLoading
              ? 'bg-gray-700 hover:bg-gray-800 text-white shadow-lg'
              : isLoading
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-500 cursor-not-allowed',
          )}
          onClick={handleSend}
          disabled={false} // 移除disabled，让handleSend处理所有逻辑
        >
          {isLoading ? (
            <Square className="h-4 w-4 animate-pulse" />
          ) : (hasContent && prompt?.trim()) || node.attrs.op === 'continue' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4 opacity-50" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default AIInputPanel;
