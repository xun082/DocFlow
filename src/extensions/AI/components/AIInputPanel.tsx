import React from 'react';
import { ArrowUp, Paperclip, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onGenerateAI: () => void;
  isLoading: boolean;
  hasContent: boolean;
  actionButtons: ActionButton[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  uploadInputRef: React.RefObject<HTMLInputElement | null>;
  componentRef: React.RefObject<HTMLDivElement | null>;
}

const AIInputPanel: React.FC<AIInputPanelProps> = ({
  prompt,
  onPromptChange,
  onKeyDown,
  onGenerateAI,
  isLoading,
  hasContent,
  actionButtons,
  selectedModel,
  setSelectedModel,
  textareaRef,
  uploadInputRef,
  componentRef,
}) => {
  const [hideSelection, setHideSelection] = React.useState(false);

  return (
    <div
      ref={componentRef}
      className={cn(
        'rounded-3xl border border-[#D1D5DB] bg-[#F9FAFB] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300',
        hideSelection && 'ProseMirror-hideselection',
      )}
    >
      <div className={cn('transition-all duration-300')}>
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={onPromptChange}
          onKeyDown={onKeyDown}
          onFocus={(e) => {
            const textarea = e.target as HTMLTextAreaElement;
            const length = textarea.value.length;
            setTimeout(() => {
              textarea.setSelectionRange(length, length);
            }, 0);
          }}
          className="text-base"
          disabled={false}
          placeholder="输入你的AI提示词..."
        />
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
          disabled={false}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-1">
          {actionButtons.slice(0, 2).map((buttonConfig, index) => {
            const IconComponent = buttonConfig.icon;

            return (
              <button
                key={`action-${buttonConfig.id}-${index}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
                  // 切换隐藏选择样式
                  setHideSelection(!hideSelection);

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
            hasContent
              ? 'bg-gray-700 hover:bg-gray-800 text-white'
              : 'bg-transparent hover:bg-gray-200/50 text-[#6B7280] hover:text-[#374151]',
          )}
          onClick={() => {
            if (hasContent) onGenerateAI();
          }}
          disabled={!hasContent}
        >
          {isLoading ? (
            <Square className="h-4 w-4 fill-white animate-pulse" />
          ) : hasContent ? (
            <ArrowUp className="h-4 w-4 text-white" />
          ) : (
            <span className="h-5 w-5 flex items-center justify-center text-white">?</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AIInputPanel;
