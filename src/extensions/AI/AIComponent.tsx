import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  BrainCircuit,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAnimatedText } from './components/useAnimatedText';
import CustomDivider from './components/CustomDivider';
import ModelSelector from './components/ModelSelector';
import Textarea from './components/Textarea';
import Button from './components/Button';
import AILoadingStatus from './components/AILoadingStatus';

import { cn } from '@/utils/utils';

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
  const params = useParams();
  const documentId = params?.room as string;
  const [prompt, setPrompt] = useState(node.attrs.context || '');
  const [isLoading, setIsLoading] = useState(node.attrs.loading || false);
  const [response, setResponse] = useState(node.attrs.response || '');
  const [selectedModel, setSelectedModel] = useState('deepseek-ai/DeepSeek-V3'); // 新增模型状态
  const [isRecording, setIsRecording] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThink, setShowThink] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const [animatedText, setText] = useAnimatedText();

  useEffect(() => {
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

    // const handleClickOutside = (event: MouseEvent) => {
    //   if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
    //     editor.chain().focus().insertContent(response).run();
    //   }
    // };

    // document.addEventListener('mousedown', handleClickOutside);

    // return () => {
    //   document.removeEventListener('mousedown', handleClickOutside);
    // };
  }, [isLoading, isRecording, editor, response]);

  const handleGenerateAI = async () => {
    // 获取所有文本节点的文案
    if (!prompt.trim()) return;

    setIsLoading(true);
    updateAttributes({ loading: true });

    try {
      // 提取编辑器中的文本内容
      let contentString: string = ' ';

      const extractTextContent = (): string => {
        const textContents: string[] = [];

        editor.state.doc.descendants((node) => {
          if (node.type.name === 'paragraph' && node.textContent.trim()) {
            textContents.push(node.textContent.trim());
          }

          return true;
        });

        return textContents.join('\n');
      };

      if (node.attrs.op === 'continue') {
        contentString = extractTextContent();
      } else {
        contentString = extractTextContent() + '\n' + prompt;
      }

      // SSE流式数据处理
      const requestData = {
        documentId: documentId || 'unknown',
        content: contentString,
        apiKey: 'sk-phjxmuhdlfheyxzqdhviixdpkjarcsqysncucualaflbqohw',
        // model: 'Qwen/QwQ-32B',
        model: selectedModel,
      };

      let accumulatedResponse = '';

      // 先发送POST请求启动流式处理
      try {
        const response = await fetch('https://api.codecrack.cn/api/v1/ai/continue-writing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 获取流式响应
        const reader = response.body?.getReader();

        if (!reader) {
          throw new Error('无法获取响应流');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                setIsLoading(false);
                console.log('AI响应完成:', accumulatedResponse);

                return;
              }

              try {
                const parsedData = JSON.parse(data);

                // 检查是否有choices数组和delta内容
                if (parsedData.choices && parsedData.choices.length > 0) {
                  const choice = parsedData.choices[0];

                  // 检查finish_reason来判断是否完成
                  if (choice.finish_reason === 'stop') {
                    // 流式传输完成
                    console.log('结束');
                    setIsLoading(false);

                    return;
                  } else if (choice.delta && choice.delta.content) {
                    // 累积接收到的内容
                    accumulatedResponse += choice.delta.content;

                    if (choice.delta.content) {
                      setText(choice.delta.content);
                    }

                    setResponse(accumulatedResponse);
                  }
                }
              } catch (parseError) {
                console.error('解析SSE数据失败:', parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error('POST请求失败:', error);
        setResponse('错误：请求失败');
        setIsLoading(false);

        return;
      }
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
    {
      id: 'model',
      label: 'Model',
      icon: BrainCircuit, // 需确保已导入该图标
      color: '#7C3AED',
      bgColor: 'bg-[#7C3AED]/20',
      hoverBgColor: 'hover:bg-[#7C3AED]/30',
      isActive: showCanvas,
      disabled: isLoading || isRecording,
      onClick: () => {},
    },
  ];

  const hasContent = prompt?.trim() !== '';

  return (
    <NodeViewWrapper className="ai-block">
      {/* 返回值显示 */}
      <div className="mb-2">{animatedText}</div>
      <div className="w-full max-w-4xl mx-auto">
        {/* AI Input Box */}
        {isLoading ? (
          <AILoadingStatus
            onCancel={() => {
              setIsLoading(false);
              updateAttributes({ loading: false });
            }}
          />
        ) : (
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
                  if (buttonConfig.id === 'model') {
                    return (
                      <ModelSelector
                        key={buttonConfig.id}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        disabled={buttonConfig.disabled}
                        buttonConfig={buttonConfig}
                      />
                    );
                  }

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
        )}
        {/* AI Response */}
      </div>
    </NodeViewWrapper>
  );
};

export default AIComponent;
