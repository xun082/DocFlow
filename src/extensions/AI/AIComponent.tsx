import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import {
  ArrowUp,
  Paperclip,
  Square,
  StopCircle,
  Mic,
  Globe,
  BrainCog,
  FolderCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none scrollbar-thin scrollbar-thumb-[#D1D5DB] scrollbar-track-transparent hover:scrollbar-thumb-[#9CA3AF] caret-gray-700',
        className,
      )}
      ref={ref}
      rows={1}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      outline: 'border border-[#666666] bg-transparent hover:bg-[#4A4A50]',
      ghost: 'bg-transparent hover:bg-[#4A4A50]',
    };
    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-6',
      icon: 'h-8 w-8 rounded-full aspect-[1/1]',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

// Custom Divider Component
const CustomDivider: React.FC = () => (
  <div className="relative h-6 w-[1.5px] mx-1">
    <div
      className="absolute inset-0 bg-gradient-to-t from-transparent via-[#9b87f5]/70 to-transparent rounded-full"
      style={{
        clipPath:
          'polygon(0% 0%, 100% 0%, 100% 40%, 140% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, -40% 50%, 0% 40%)',
      }}
    />
  </div>
);

interface AIComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  deleteNode: () => void;
  editor: Editor;
}

// 按钮配置接口
interface ActionButtonConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  hoverBgColor: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const AIComponent: React.FC<AIComponentProps> = ({ node, updateAttributes, editor }) => {
  const [prompt, setPrompt] = useState(node.attrs.context || '');
  const [isLoading, setIsLoading] = useState(node.attrs.loading || false);
  const [response, setResponse] = useState(node.attrs.response || '');
  const [isRecording, setIsRecording] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThink, setShowThink] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Combined effects for textarea management and click outside handling
  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [prompt]);

  useEffect(() => {
    setTimeout(() => {
      if (textareaRef.current && !isLoading && !isRecording) {
        textareaRef.current.focus();
      }
    }, 100);

    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        editor.chain().focus().insertContent(response).run();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLoading, isRecording, editor, response]);

  const handleGenerateAI = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    updateAttributes({ loading: true });

    try {
      // 这里应该调用你的AI服务API
      // 示例：const result = await aiService.generate({ prompt, context: node.attrs.context });

      // 模拟AI响应
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let messagePrefix = '';
      if (showSearch) messagePrefix = '[Search: ';
      else if (showThink) messagePrefix = '[Think: ';
      else if (showCanvas) messagePrefix = '[Canvas: ';

      const formattedPrompt = messagePrefix ? `${messagePrefix}${prompt}]` : prompt;
      const mockResponse = `AI响应：基于提示 "${formattedPrompt}" 生成的内容...`;
      setResponse(mockResponse);
      console.log('AI响应:', response);
      updateAttributes({
        prompt,
        response: mockResponse,
        loading: false,
      });
    } catch (error) {
      console.error('AI生成失败:', error);
      updateAttributes({ loading: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    updateAttributes({ prompt: newPrompt });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateAI();
    }
  };

  // const onblur = () => {
  //   editor.chain().focus().insertContent(response).run();
  // };

  const handleToggleChange = (value: string) => {
    if (value === 'search') {
      setShowSearch((prev) => !prev);
      setShowThink(false);
      setShowCanvas(false);
    } else if (value === 'think') {
      setShowThink((prev) => !prev);
      setShowSearch(false);
      setShowCanvas(false);
    }
  };

  const handleCanvasToggle = () => {
    setShowCanvas((prev) => !prev);
    setShowSearch(false);
    setShowThink(false);
  };

  // 按钮配置数据
  const actionButtons: ActionButtonConfig[] = [
    {
      id: 'search',
      label: 'Search',
      icon: Globe,
      color: '#10B981',
      bgColor: 'bg-[#10B981]/20',
      hoverBgColor: 'hover:bg-[#10B981]/30',
      isActive: showSearch,
      disabled: isLoading || isRecording,
      onClick: () => handleToggleChange('search'),
    },
    {
      id: 'think',
      label: 'Think',
      icon: BrainCog,
      color: '#8B5CF6',
      bgColor: 'bg-[#8B5CF6]/20',
      hoverBgColor: 'hover:bg-[#8B5CF6]/30',
      isActive: showThink,
      disabled: isLoading || isRecording,
      onClick: () => handleToggleChange('think'),
    },
    {
      id: 'canvas',
      label: 'Canvas',
      icon: FolderCode,
      color: '#F97316',
      bgColor: 'bg-[#F97316]/20',
      hoverBgColor: 'hover:bg-[#F97316]/30',
      isActive: showCanvas,
      disabled: isLoading || isRecording,
      onClick: handleCanvasToggle,
    },
  ];

  const hasContent = prompt.trim() !== '';

  // 当 isLoading 为 true 时，显示简化的加载状态
  if (isLoading) {
    return (
      <NodeViewWrapper className="ai-block">
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="rounded-3xl border border-[#D1D5DB] bg-[#F9FAFB] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm font-medium">AI is writing</span>
                <div className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: '200ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: '400ms' }}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-[#6B7280] hover:text-[#374151] hover:bg-gray-200/50"
                onClick={() => {
                  setIsLoading(false);
                  updateAttributes({ loading: false });
                }}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="ai-block">
      {/* 返回值显示 */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-2">{response}</div>
        {/* AI Input Box */}
        <div
          ref={componentRef}
          className={cn(
            'rounded-3xl border border-[#D1D5DB] bg-[#F9FAFB] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300',
          )}
        >
          <div
            className={cn(
              'transition-all duration-300',
              isRecording ? 'h-0 overflow-hidden opacity-0' : 'opacity-100',
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600">AI正在思考中...</span>
                </div>
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                className="text-base"
                disabled={isLoading || isRecording}
                placeholder="输入你的AI提示词..."
              />
            )}
          </div>

          {/* Voice Recording Indicator */}
          <div
            className={cn(
              'flex flex-col items-center justify-center w-full transition-all duration-300 py-3',
              isRecording ? 'opacity-100' : 'opacity-0 h-0',
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-sm text-white/80">00:00</span>
            </div>
            <div className="w-full h-10 flex items-center justify-center gap-0.5 px-4">
              {[...Array(32)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full bg-white/50 animate-pulse"
                  style={{
                    height: `${Math.max(15, Math.random() * 100)}%`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
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
              disabled={isLoading || isRecording}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-1">
              {actionButtons.slice(0, 2).map((buttonConfig) => {
                const IconComponent = buttonConfig.icon;

                return (
                  <button
                    key={buttonConfig.id}
                    onClick={buttonConfig.onClick}
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

              {actionButtons.slice(2).map((buttonConfig) => {
                const IconComponent = buttonConfig.icon;

                return (
                  <button
                    key={buttonConfig.id}
                    onClick={buttonConfig.onClick}
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
                isRecording
                  ? 'bg-transparent hover:bg-gray-200/50 text-red-500 hover:text-red-600'
                  : hasContent
                    ? 'bg-gray-700 hover:bg-gray-800 text-white'
                    : 'bg-transparent hover:bg-gray-200/50 text-[#6B7280] hover:text-[#374151]',
              )}
              onClick={() => {
                if (isRecording) setIsRecording(false);
                else if (hasContent) handleGenerateAI();
                else setIsRecording(true);
              }}
              disabled={isLoading && !hasContent}
            >
              {isLoading ? (
                <Square className="h-4 w-4 fill-white animate-pulse" />
              ) : isRecording ? (
                <StopCircle className="h-5 w-5 text-red-500" />
              ) : hasContent ? (
                <ArrowUp className="h-4 w-4 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-white transition-colors" />
              )}
            </Button>
          </div>
        </div>

        {/* AI Response */}
      </div>
    </NodeViewWrapper>
  );
};

export default AIComponent;
