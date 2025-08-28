import React, { useState, useCallback, useRef, useEffect } from 'react';
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
        'flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none scrollbar-thin scrollbar-thumb-[#444444] scrollbar-track-transparent hover:scrollbar-thumb-[#555555]',
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
      default: 'bg-white hover:bg-white/80 text-black',
      outline: 'border border-[#444444] bg-transparent hover:bg-[#3A3A40]',
      ghost: 'bg-transparent hover:bg-[#3A3A40]',
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

export const AIComponent: React.FC<AIComponentProps> = ({ node, updateAttributes }) => {
  const [prompt, setPrompt] = useState(node.attrs.prompt || '');
  const [isLoading, setIsLoading] = useState(node.attrs.loading || false);
  const [response, setResponse] = useState(node.attrs.response || '');
  const [isRecording, setIsRecording] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThink, setShowThink] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [prompt]);

  const handleGenerateAI = useCallback(async () => {
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
  }, [prompt, updateAttributes, showSearch, showThink, showCanvas]);

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newPrompt = e.target.value;
      setPrompt(newPrompt);
      updateAttributes({ prompt: newPrompt });
    },
    [updateAttributes],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateAI();
    }
  };

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

  const hasContent = prompt.trim() !== '';

  return (
    <NodeViewWrapper className="ai-block">
      <div className="w-full max-w-4xl mx-auto p-4">
        {/* AI Input Box */}
        <div
          className={cn(
            'rounded-3xl border border-[#444444] bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300',
            isLoading && 'border-red-500/70',
          )}
        >
          <div
            className={cn(
              'transition-all duration-300',
              isRecording ? 'h-0 overflow-hidden opacity-0' : 'opacity-100',
            )}
          >
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              className="text-base"
              disabled={isLoading || isRecording}
              placeholder="输入你的AI提示词..."
            />
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
              className="h-8 w-8 rounded-full text-[#9CA3AF] hover:text-[#D1D5DB] hover:bg-gray-600/30"
              onClick={() => uploadInputRef.current?.click()}
              disabled={isLoading || isRecording}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleToggleChange('search')}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-gray-600/30',
                  showSearch
                    ? 'bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30'
                    : 'text-[#9CA3AF] hover:text-[#D1D5DB]',
                )}
                disabled={isLoading || isRecording}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{ rotate: showSearch ? 360 : 0, scale: showSearch ? 1.1 : 1 }}
                    whileHover={{
                      rotate: showSearch ? 360 : 15,
                      scale: 1.1,
                      transition: { type: 'spring', stiffness: 300, damping: 10 },
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  >
                    <Globe
                      className={cn('w-4 h-4', showSearch ? 'text-[#10B981]' : 'text-inherit')}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap text-[#10B981] flex-shrink-0"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={() => handleToggleChange('think')}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-gray-600/30',
                  showThink
                    ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30'
                    : 'text-[#9CA3AF] hover:text-[#D1D5DB]',
                )}
                disabled={isLoading || isRecording}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{ rotate: showThink ? 360 : 0, scale: showThink ? 1.1 : 1 }}
                    whileHover={{
                      rotate: showThink ? 360 : 15,
                      scale: 1.1,
                      transition: { type: 'spring', stiffness: 300, damping: 10 },
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  >
                    <BrainCog
                      className={cn('w-4 h-4', showThink ? 'text-[#8B5CF6]' : 'text-inherit')}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showThink && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap text-[#8B5CF6] flex-shrink-0"
                    >
                      Think
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <CustomDivider />

              <button
                onClick={handleCanvasToggle}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:bg-gray-600/30',
                  showCanvas
                    ? 'bg-[#F97316]/20 text-[#F97316] hover:bg-[#F97316]/30'
                    : 'text-[#9CA3AF] hover:text-[#D1D5DB]',
                )}
                disabled={isLoading || isRecording}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{ rotate: showCanvas ? 360 : 0, scale: showCanvas ? 1.1 : 1 }}
                    whileHover={{
                      rotate: showCanvas ? 360 : 15,
                      scale: 1.1,
                      transition: { type: 'spring', stiffness: 300, damping: 10 },
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  >
                    <FolderCode
                      className={cn('w-4 h-4', showCanvas ? 'text-[#F97316]' : 'text-inherit')}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showCanvas && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap text-[#F97316] flex-shrink-0"
                    >
                      Canvas
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            <Button
              variant="default"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-full transition-all duration-200',
                isRecording
                  ? 'bg-transparent hover:bg-gray-600/30 text-red-500 hover:text-red-400'
                  : hasContent
                    ? 'bg-white hover:bg-white/80 text-[#1F2023]'
                    : 'bg-transparent hover:bg-gray-600/30 text-[#9CA3AF] hover:text-[#D1D5DB]',
              )}
              onClick={() => {
                if (isRecording) setIsRecording(false);
                else if (hasContent) handleGenerateAI();
                else setIsRecording(true);
              }}
              disabled={isLoading && !hasContent}
            >
              {isLoading ? (
                <Square className="h-4 w-4 fill-[#1F2023] animate-pulse" />
              ) : isRecording ? (
                <StopCircle className="h-5 w-5 text-red-500" />
              ) : hasContent ? (
                <ArrowUp className="h-4 w-4 text-[#1F2023]" />
              ) : (
                <Mic className="h-5 w-5 text-[#1F2023] transition-colors" />
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
