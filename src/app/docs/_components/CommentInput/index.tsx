'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/core';
import { Send, X, MessageCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { v4 as uuid } from 'uuid';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { useCommentStore } from '@/stores/commentStore';

interface CommentInputGroupProps {
  editor: Editor;
}

export const CommentInput: React.FC<CommentInputGroupProps> = ({ editor }) => {
  const { isOpen, position, closeComment } = useCommentStore();
  const [commentContent, setCommentContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 当弹窗打开时自动展开并聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setIsExpanded(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setIsExpanded(false);
      setCommentContent('');
    }
  }, [isOpen]);

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
    if (commentContent.trim()) {
      editor.chain().focus().setComment(uuid(), commentContent).run();
      setCommentContent('');
      closeComment();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      closeComment();
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

  const handleCancel = () => {
    closeComment();
  };

  if (!isOpen || !position) {
    return null;
  }

  const commentInputGroup = (
    <div
      ref={containerRef}
      className={cn('fixed z-50 transition-all duration-300', isExpanded ? 'w-80' : 'w-10')}
      style={{
        left: position.x,
        top: position.y,
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
