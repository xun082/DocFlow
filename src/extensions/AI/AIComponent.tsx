import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import { BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// AI组件状态枚举
enum AIState {
  INPUT = 'input', // 输入状态：可以输入prompt
  LOADING = 'loading', // 加载状态：正在生成AI响应
  DISPLAY = 'display', // 显示状态：显示AI响应结果
}

import { createActionButtons } from './actionButtons';
import { useTextExtraction } from './hooks/useTextExtraction';
import { useSSEStream } from './hooks/useSSEStream';
import { useTextToImage } from './hooks/useTextToImage';
import AILoadingStatus from './components/AILoadingStatus';
import AIInputPanel from './components/AIInputPanel';
import SyntaxHighlight from './components/SyntaxHighlight';

interface AIComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  editor: Editor;
  getPos: () => number | undefined;
}

export const AIComponent: React.FC<AIComponentProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const params = useParams();
  const documentId = params?.room as string;
  const [prompt, setPrompt] = useState(node.attrs.prompt || '');
  const [response, setResponse] = useState(node.attrs.response || '');
  // 统一的AI状态管理
  const [aiState, setAiState] = useState<AIState>(node.attrs.aiState || AIState.DISPLAY);

  const [selectedModel, setSelectedModel] = useState('deepseek-ai/DeepSeek-V3'); // 新增模型状态
  const [showImage, setShowImage] = useState(false); // 图片生成状态
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const { buildContentString } = useTextExtraction(editor);
  const abortRef = useRef<() => void | undefined>(undefined);

  // 统一状态更新函数
  const updateState = (
    newState: Partial<{ aiState: AIState; response: string; prompt: string }>,
  ) => {
    if (newState.aiState !== undefined) {
      setAiState(newState.aiState);
    }

    if (newState.response !== undefined) {
      setResponse(newState.response);
    }

    if (newState.prompt !== undefined) {
      setPrompt(newState.prompt);
    }

    updateAttributes(newState);
  };

  const { handleGenerateAI: handleAIGeneration } = useSSEStream({
    updateState,
    setAiState,
    updateAttributes,
    buildContentString,
    documentId,
    selectedModel,
    setResponse,
    editor,
  });

  const { generateImage } = useTextToImage({
    onSuccess: (imageUrl) => {
      const pos = getPos();

      if (pos !== undefined) {
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + node.nodeSize })
          .insertContentAt(pos + node.nodeSize, {
            type: 'imageBlock',
            attrs: { src: imageUrl },
          })
          .run();
      }
    },
    onError: () => {
      setAiState(AIState.INPUT);
      updateState({ aiState: AIState.DISPLAY });
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [prompt]);

  useEffect(() => {
    // 因为如果获取不到 焦点无法 focuse
    setTimeout(() => {
      if (textareaRef.current && aiState !== AIState.LOADING) {
        textareaRef.current.focus();
      }
    }, 100);

    // 监听点击其他区域，input 框隐藏
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        if (response) {
          // 如果有response，替换整个AI节点为段落
          const pos = getPos();

          if (pos !== undefined) {
            const nodeSize = node.nodeSize;
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + nodeSize })
              .pasteMarkdown(response)
              .run();
          }
        } else {
          // 如果没有response，只是隐藏输入状态
          updateState({ aiState: AIState.DISPLAY });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [aiState, response, editor]);

  const handleGenerateAI = async () => {
    // 如果已经在加载状态，直接返回
    if (aiState === AIState.LOADING) {
      return;
    }

    // 处理提问模式下的输入验证
    if (node.attrs.op === 'ask') {
      if (!prompt?.trim()) {
        toast.warning('请输入您的问题');

        return;
      }
    }
    // 处理其他模式（续写、改写等）
    else {
      const contentString = buildContentString(prompt, node.attrs.op);

      if (!contentString) {
        toast.warning('文档是空白文档');

        return;
      }
    }

    // 设置加载状态
    setAiState(AIState.LOADING);

    // 根据模式选择生成图片或文本
    if (showImage) {
      await generateImage({ prompt });
    } else {
      await handleAIGeneration(prompt, node.attrs, abortRef);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    updateAttributes({ prompt: newPrompt });
  };

  // 图片生成处理函数
  const handleToggleImage = () => {
    setShowImage(!showImage);
  };

  // 按钮配置数据
  const baseButtons = createActionButtons(
    false, // showSearch
    false, // showThink
    false, // showCanvas
    showImage, // showImage
    () => {}, // search toggle
    () => {}, // think toggle
    () => {}, // canvas toggle
    handleToggleImage, // image toggle
    aiState === AIState.LOADING,
  );

  const actionButtons = [
    ...baseButtons,
    {
      id: 'model',
      label: 'Model',
      icon: BrainCircuit,
      color: '#7C3AED',
      bgColor: 'bg-[#7C3AED]/20',
      hoverBgColor: 'hover:bg-[#7C3AED]/30',
      isActive: false,
      disabled: aiState === AIState.LOADING,
      onClick: () => {},
    },
  ];

  const hasContent = prompt?.trim() !== '';

  return (
    <NodeViewWrapper className="ai-block">
      {/* 返回值显示 */}
      <div className="w-full max-w-4xl mx-auto">
        {/* AI Input Box */}
        {aiState === AIState.LOADING ? (
          <>
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: SyntaxHighlight,
                  pre: ({ children, ...props }: React.HTMLProps<HTMLPreElement>) => (
                    <pre className="rounded-[12px]" {...props}>
                      {children}
                    </pre>
                  ),
                }}
              >
                {response}
              </ReactMarkdown>
            </div>
            {/* <div className="mb-2">{animatedText}</div> */}
            <AILoadingStatus
              onCancel={() => {
                try {
                  abortRef.current?.();
                } catch (error) {
                  // 忽略BodyStreamBuffer中止错误
                  console.log('中止流处理:', error);
                } finally {
                  setAiState(AIState.INPUT);
                  updateAttributes({ loading: false });
                }
              }}
            />
          </>
        ) : (
          <>
            {(aiState === AIState.DISPLAY || aiState === AIState.INPUT) && response && (
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: SyntaxHighlight,
                    pre: ({ children, ...props }: React.HTMLProps<HTMLPreElement>) => (
                      <pre className="rounded-[12px]" {...props}>
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            )}
            {aiState === AIState.INPUT && (
              <>
                <AIInputPanel
                  prompt={prompt}
                  onPromptChange={handlePromptChange}
                  onGenerateAI={handleGenerateAI}
                  isLoading={(aiState as AIState) === AIState.LOADING}
                  hasContent={hasContent}
                  actionButtons={actionButtons}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  textareaRef={textareaRef}
                  uploadInputRef={uploadInputRef}
                  componentRef={componentRef}
                  node={node}
                />
              </>
            )}
          </>
        )}
        {/* AI Response */}
      </div>
    </NodeViewWrapper>
  );
};

export default AIComponent;
