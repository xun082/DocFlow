'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Editor } from '@tiptap/core';
import { Send, X, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { debounce } from 'lodash-es';
import { toast } from 'sonner';
import { computePosition, offset, shift, flip, size, inline } from '@floating-ui/dom';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { useCommentStore } from '@/stores/commentStore';

interface CommentInputGroupProps {
  editor: Editor;
}

export const CommentInput: React.FC<CommentInputGroupProps> = ({ editor }) => {
  const { isOpen, closeComment } = useCommentStore();
  const [commentContent, setCommentContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    x: 1000,
    y: 1000,
  });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  const [markText, setMarkText] = useState('');
  const markItems = markText ? markText.split('&').filter(Boolean) : [];

  // 使用floating-ui的智能定位函数
  const updatePosition = useCallback(async () => {
    // 检查编辑器视图是否可用
    if (!editor.view || !containerRef.current) {
      return;
    }

    const { selection } = editor.state;
    const { from, to } = selection;

    // 获取编辑器DOM元素作为边界容器
    const editorElement = editor.view.dom.parentElement?.parentElement;
    if (!editorElement) return;

    // 创建虚拟的锚点元素
    const virtualAnchor = {
      getBoundingClientRect: () => {
        const startPos = editor.view.coordsAtPos(from);
        const endPos = editor.view.coordsAtPos(to);

        if (startPos && endPos) {
          const left = Math.min(startPos.left, endPos.left);
          const right = Math.max(startPos.right, endPos.right);
          const bottom = Math.max(startPos.bottom, endPos.bottom);

          return new DOMRect(
            left,
            bottom + 4, // 在选中文本下方4px
            right - left,
            1, // 高度设为1px，作为锚点
          );
        }

        return new DOMRect(0, 0, 0, 0);
      },
      contextElement: editor.view.dom,
    };

    try {
      const { x, y } = await computePosition(virtualAnchor, containerRef.current, {
        placement: 'bottom',
        middleware: [
          offset(8), // 距离锚点8px
          shift({ padding: 8 }), // 边界检测，距离边界8px
          flip(), // 自动翻转位置
          inline(), // 内联定位
          size({
            apply({ availableWidth, availableHeight, elements }) {
              // 限制弹窗最大宽度和高度
              Object.assign(elements.floating.style, {
                maxWidth: `${Math.min(availableWidth, 320)}px`,
                maxHeight: `${Math.min(availableHeight, 400)}px`,
              });
            },
          }),
        ],
      });

      setPosition({ x, y });
    } catch (error) {
      console.warn('Failed to compute position:', error);

      // 降级方案：使用原始定位逻辑
      const startPos = editor.view.coordsAtPos(from);
      const endPos = editor.view.coordsAtPos(to);

      if (startPos && endPos) {
        const x = (startPos.left + endPos.left) / 2;
        const y = endPos.bottom + 4;
        setPosition({ x, y });
      }
    }
  }, [editor]);

  // 使用useMemo优化防抖函数，避免重复创建
  const debouncedUpdatePosition = useMemo(() => debounce(updatePosition, 16), [updatePosition]);

  // 监听编辑器选区变化，实时更新弹窗位置
  useEffect(() => {
    if (!isOpen) return;

    const handleSelectionUpdate = () => {
      debouncedUpdatePosition();
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      debouncedUpdatePosition.cancel();
    };
  }, [isOpen, editor, debouncedUpdatePosition]);

  // 当弹窗打开时自动展开并聚焦输入框
  useEffect(() => {
    if (isOpen) {
      // 检查编辑器视图是否可用
      if (!editor.view || !containerRef.current) {
        return;
      }

      // 每次弹窗显示时重新获取comment的激活状态和属性
      const isCommentActive = editor.isActive('comment');
      const attrs = editor.getAttributes('comment') || {};

      if (isCommentActive) {
        setMarkText(attrs.markText || '');
      } else {
        setMarkText('');
      }

      // 获取编辑器DOM元素作为边界容器
      const editorElement = editor.view.dom.parentElement?.parentElement;
      if (!editorElement) return;

      // 使用ResizeObserver和IntersectionObserver优化定位逻辑
      const setupObservers = () => {
        // 清理现有的观察器
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }

        if (intersectionObserverRef.current) {
          intersectionObserverRef.current.disconnect();
        }

        // 创建ResizeObserver监听编辑器容器尺寸变化
        resizeObserverRef.current = new ResizeObserver(debouncedUpdatePosition);

        if (editor.view?.dom) {
          resizeObserverRef.current.observe(editor.view.dom);
        }

        // 创建IntersectionObserver监听可见性变化
        intersectionObserverRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                debouncedUpdatePosition();
              }
            });
          },
          {
            root: editor.view?.dom.parentElement?.parentElement,
            threshold: 0.1,
          },
        );

        if (editor.view?.dom) {
          intersectionObserverRef.current.observe(editor.view.dom);
        }
      };

      // 初始定位
      updatePosition();
      setupObservers();

      const scrollContainer = editor.isEditable && editor?.view?.dom.parentElement?.parentElement;

      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', debouncedUpdatePosition, {
          passive: true,
        });
      }

      // 清理函数
      return () => {
        // 停止观察器
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }

        if (intersectionObserverRef.current) {
          intersectionObserverRef.current.disconnect();
          intersectionObserverRef.current = null;
        }

        if (scrollContainer) {
          scrollContainer.removeEventListener('scroll', debouncedUpdatePosition);
          debouncedUpdatePosition.cancel();
        }
      };
    } else {
      setCommentContent('');
      setMarkText('');
      // 重置position状态，避免下次打开时位置不正确
      setPosition({
        x: 1000,
        y: 1000,
      });
    }
  }, [isOpen, updatePosition]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeComment();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeComment]);

  const handleSubmit = () => {
    const trimmedContent = commentContent.trim();

    // 输入验证
    if (!trimmedContent) {
      toast.error('评论内容不能为空');

      return;
    }

    if (trimmedContent.length > 500) {
      toast.error('评论内容不能超过500个字符');

      return;
    }

    try {
      // 统一计算新的标记文本
      const newMarkItems = markItems.length > 0 ? [...markItems, trimmedContent] : [trimmedContent];

      const newMarkText = newMarkItems.join(' & ');

      // 更新编辑器状态
      editor.chain().focus().setComment(null, newMarkText).run();

      // 更新本地状态
      setMarkText(newMarkText);
      setCommentContent('');
      toast.success('评论提交成功');
    } catch (error) {
      console.error('提交评论失败:', error);
      toast.error('评论提交失败，请重试');
    }
  };

  const handleRemoveMark = (index: number) => {
    const newMarkItems = [...markItems];
    newMarkItems.splice(index, 1);

    const newMarkText = newMarkItems.join(' & ');
    editor.chain().focus().setComment(null, newMarkText).run();
    setMarkText(newMarkText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      closeComment();
    }
  };

  const handleCancel = () => {
    closeComment();
  };

  const handleDeleteMark = () => {
    // 获取当前激活的评论ID
    const activeCommentId = editor.getAttributes('comment').commentId;

    if (activeCommentId) {
      // 使用unsetComment命令删除整个mark
      editor.chain().focus().unsetComment(activeCommentId).run();
      toast.success('评论标记已删除');
    } else {
      toast.error('未找到可删除的评论标记');
    }

    closeComment();
  };

  if (!isOpen || !position) {
    return null;
  }

  const commentInputGroup = (
    <div
      ref={containerRef}
      className={cn('fixed z-5 w-80')}
      style={{
        left: position?.x,
        top: position?.y,
      }}
    >
      {/* 触发器按钮 */}
      <div
        className={cn(
          'flex items-center rounded-lg border shadow-lg overflow-hidden',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600',
          'backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 w-full',
        )}
      >
        {/* 输入区域 */}
        <div className={cn('flex-1 overflow-hidden py-2 max-w-full opacity-100')}>
          {markItems.length > 0 && (
            <div className="px-2 py-1 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {markItems.map((item, idx) => (
                  <div key={`${item}-${idx}`} className="group flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 truncate max-w-[180px]">
                      {item}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMark(idx)}
                      className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-[2px] px-2">
            <Input
              ref={inputRef}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入评论内容..."
              className="my-2 flex-1 !border-0 !shadow-none !ring-0 !outline-none focus:!border-0 focus:!outline-none focus:!ring-0 focus-visible:!border-0 focus-visible:!outline-none focus-visible:!ring-0 bg-transparent"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSubmit}
              disabled={!commentContent.trim()}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
            {markItems.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDeleteMark}
                className="h-8 w-8 p-0 flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="删除评论标记"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(commentInputGroup, document.body);
};

export default CommentInput;
