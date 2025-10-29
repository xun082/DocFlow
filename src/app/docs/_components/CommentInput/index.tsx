'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/core';
import { Send, X, MessageCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';

interface CommentInputGroupProps {
  editor: Editor;
  onCommentSubmit: (content: string) => void;
  onCancel: () => void;
  triggerPosition?: { x: number; y: number };
}

export const CommentInput: React.FC<CommentInputGroupProps> = ({
  editor,
  onCommentSubmit,
  onCancel,
  triggerPosition,
}) => {
  const [commentContent, setCommentContent] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取选中文本的位置
  const getSelectionPosition = () => {
    if (!editor || !editor.view) return null;

    const { selection } = editor.state;
    if (selection.empty) return null;

    try {
      const { from, to } = selection;
      const startPos = editor.view.coordsAtPos(from);
      const endPos = editor.view.coordsAtPos(to);

      // 计算选中区域的中心位置
      const x = (startPos.left + endPos.left) / 2;
      const y = endPos.bottom + 8; // 在选中文本下方8px

      return { x, y };
    } catch (error) {
      console.error('获取选中位置失败:', error);

      return null;
    }
  };

  // 监听编辑器选择变化
  useEffect(() => {
    const handleSelectionUpdate = () => {
      const selectionPosition = getSelectionPosition();

      if (selectionPosition) {
        setIsVisible(true);
        setIsExpanded(true);
        // 延迟一点确保DOM已经更新
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } else {
        setIsExpanded(false);
        // 延迟隐藏，给用户操作时间
        setTimeout(() => {
          if (!isExpanded) {
            setIsVisible(false);
          }
        }, 300);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, isExpanded]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setTimeout(() => {
          if (!isExpanded) {
            setIsVisible(false);
            onCancel();
          }
        }, 300);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, isExpanded, onCancel]);

  const handleSubmit = () => {
    if (commentContent.trim()) {
      onCommentSubmit(commentContent.trim());
      setCommentContent('');
      setIsExpanded(false);
      setIsVisible(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
      setIsExpanded(false);
      setIsVisible(false);
    }
  };

  const handleTriggerClick = () => {
    setIsExpanded(!isExpanded);

    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const currentPosition = triggerPosition || getSelectionPosition();

  if (!isVisible || !currentPosition) {
    return null;
  }

  const commentInputGroup = (
    <div
      ref={containerRef}
      className={cn('fixed z-50 transition-all duration-300', isExpanded ? 'w-80' : 'w-10')}
      style={{
        left: currentPosition.x,
        top: currentPosition.y,
        transform: 'translateX(-50%)',
      }}
    >
      {/* 触发器按钮 */}
      <div
        className={cn(
          'flex items-center transition-all duration-300 rounded-lg border shadow-lg overflow-hidden',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600',
          'backdrop-blur-sm bg-white/95 dark:bg-gray-800/95',
          isExpanded ? 'w-full' : 'w-10',
        )}
      >
        {/* 触发器 */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleTriggerClick}
          className={cn(
            'h-8 w-8 p-0 flex-shrink-0 transition-all',
            isExpanded ? 'ml-1' : 'mx-auto',
          )}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>

        {/* 输入区域 */}
        <div
          className={cn(
            'flex-1 transition-all duration-300 overflow-hidden',
            isExpanded ? 'max-w-full opacity-100' : 'max-w-0 opacity-0',
          )}
        >
          <div className="flex items-center gap-1 px-2">
            <Input
              ref={inputRef}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入评论内容..."
              className="flex-1 border-0 shadow-none focus-visible:ring-0"
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onCancel();
                setIsExpanded(false);
                setIsVisible(false);
              }}
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
