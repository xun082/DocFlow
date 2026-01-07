import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Editor } from '@tiptap/core';
import { ImageIcon, Sparkles, Send, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

import ImageSizeButtons from './components/ImageSizeButtons';

import { AiApi } from '@/services/ai';
import { cn } from '@/utils';

// 文生图状态枚举
enum TextToImageState {
  INPUT = 'input', // 输入状态
  LOADING = 'loading', // 生成中
  DISPLAY = 'display', // 显示结果
}

interface TextToImageComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  editor: Editor;
  getPos: () => number | undefined;
}

export const TextToImageComponent: React.FC<TextToImageComponentProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const [prompt, setPrompt] = useState(node.attrs.prompt || '');
  const [size, setSize] = useState(node.attrs.size || '1328x1328');
  const [imageUrl, setImageUrl] = useState(node.attrs.imageUrl || '');
  const [state, setState] = useState<TextToImageState>(
    (node.attrs.state as TextToImageState) || TextToImageState.INPUT,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [prompt]);

  // 自动聚焦
  useEffect(() => {
    setTimeout(() => {
      if (textareaRef.current && state === TextToImageState.INPUT) {
        textareaRef.current.focus();
      }
    }, 100);

    // 点击外部关闭
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        if (state === TextToImageState.INPUT) {
          if (imageUrl?.trim()) {
            setState(TextToImageState.DISPLAY);
            updateAttributes({ state: TextToImageState.DISPLAY });
          } else {
            // 删除节点
            const pos = getPos();

            if (pos !== undefined) {
              editor
                .chain()
                .focus()
                .deleteRange({ from: pos, to: pos + node.nodeSize })
                .run();
            }
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [state, imageUrl, editor, getPos, node.nodeSize, updateAttributes]);

  // 生成图片
  const handleGenerate = async () => {
    if (!prompt?.trim()) {
      toast.warning('请输入图片描述');

      return;
    }

    setState(TextToImageState.LOADING);
    updateAttributes({ state: TextToImageState.LOADING, prompt, size });

    try {
      const result = await AiApi.TextToImage({
        prompt,
        size,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data?.code === 200 && result.data?.data) {
        const responseData = result.data.data as { imageUrl: string };
        const generatedImageUrl = responseData.imageUrl;

        setImageUrl(generatedImageUrl);
        setState(TextToImageState.DISPLAY);
        updateAttributes({
          imageUrl: generatedImageUrl,
          state: TextToImageState.DISPLAY,
          prompt,
          size,
        });

        toast.success('图片生成成功！');
      } else {
        throw new Error(result.data?.message || '生成图片失败');
      }
    } catch (error) {
      console.error('生成图片失败:', error);
      toast.error(error instanceof Error ? error.message : '生成图片失败');
      setState(TextToImageState.INPUT);
      updateAttributes({ state: TextToImageState.INPUT });
    }
  };

  // 插入图片到文档
  const handleInsertImage = () => {
    const pos = getPos();

    if (pos !== undefined && imageUrl) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .insertContentAt(pos, {
          type: 'imageBlock',
          attrs: { src: imageUrl },
        })
        .run();
    }
  };

  // 重新生成
  const handleRegenerate = () => {
    setState(TextToImageState.INPUT);
    updateAttributes({ state: TextToImageState.INPUT });
  };

  // 删除节点
  const handleDelete = () => {
    const pos = getPos();

    if (pos !== undefined) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .run();
    }
  };

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (prompt?.trim() && state === TextToImageState.INPUT) {
        handleGenerate();
      }
    }
  };

  // 获取图片尺寸显示文本和比例
  const getSizeInfo = () => {
    const [width, height] = size.split('x').map(Number);
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;

    return {
      dimensions: size,
      ratio: `${ratioW}:${ratioH}`,
    };
  };

  return (
    <NodeViewWrapper className="text-to-image-block" data-type="textToImage" ref={componentRef}>
      <div
        className={cn(
          'mx-auto my-4',
          state === TextToImageState.DISPLAY
            ? 'w-fit max-w-full'
            : state === TextToImageState.LOADING
              ? 'w-fit max-w-full'
              : 'w-full max-w-4xl',
        )}
        translate="no"
        contentEditable={false}
      >
        {/* 输入状态 */}
        {state === TextToImageState.INPUT && (
          <div
            className="rounded-2xl border border-purple-200/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            translate="no"
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-purple-100/50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-purple-900">AI 文生图</span>
              </div>
              <button
                onClick={handleDelete}
                className="p-0.5 text-gray-400 hover:text-red-500 rounded transition-colors flex-shrink-0"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 输入和操作区域 */}
            <div className="p-3" translate="no">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  updateAttributes({ prompt: e.target.value });
                }}
                onKeyDown={handleKeyDown}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder="描述你想要生成的图片，例如：海边日落，有海鸥飞过，油画风格..."
                className="w-full px-3 py-2 mb-2.5 rounded-lg border border-purple-200/60 bg-white/80 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all overflow-hidden"
                rows={2}
                style={{ minHeight: '60px', maxHeight: '100px' }}
                translate="no"
                spellCheck={false}
                contentEditable
              />

              {/* 底部操作栏 */}
              <div className="flex items-center justify-between gap-2">
                <ImageSizeButtons selectedSize={size} setSelectedSize={setSize} disabled={false} />

                <button
                  onClick={handleGenerate}
                  disabled={!prompt?.trim()}
                  className={cn(
                    'flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition-all text-sm flex-shrink-0',
                    prompt?.trim()
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  生成
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {state === TextToImageState.LOADING && (
          <div className="rounded-2xl border border-purple-200/60 bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-6 shadow-sm">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div>
                <p className="text-base font-semibold text-purple-900">AI 正在创作中...</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt}
                </p>
                <p className="text-xs text-purple-600 mt-1 font-medium">
                  比例 {getSizeInfo().ratio} • 尺寸 {getSizeInfo().dimensions}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 显示结果 */}
        {state === TextToImageState.DISPLAY && imageUrl && (
          <div className="rounded-2xl border border-purple-200/60 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow w-fit">
            <div className="relative group flex items-center justify-center bg-gray-50">
              <img
                ref={imageRef}
                src={imageUrl}
                alt={prompt}
                className="h-auto max-h-[400px] cursor-pointer transition-transform hover:scale-[1.01] block"
                onClick={handleInsertImage}
                style={{ maxHeight: '400px' }}
              />

              {/* 悬浮工具栏 */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleRegenerate}
                  className="p-2 bg-white/95 hover:bg-white rounded-lg shadow-md transition-colors"
                  title="重新生成"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-white/95 hover:bg-white rounded-lg shadow-md transition-colors"
                  title="删除"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>

              {/* 底部提示 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white/90 line-clamp-2">{prompt}</p>
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-t border-purple-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(imageUrl);
                    toast.success('图片链接已复制');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:text-purple-900 rounded-lg hover:bg-purple-100/50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  复制链接
                </button>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-purple-600 font-medium">{getSizeInfo().ratio}</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-500">{getSizeInfo().dimensions}</span>
              </div>

              <button
                onClick={handleInsertImage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                插入图片
              </button>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default TextToImageComponent;
