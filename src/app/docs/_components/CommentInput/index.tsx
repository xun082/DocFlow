'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/core';
import { Send, X } from 'lucide-react';
import { createPortal } from 'react-dom';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    x: 1000,
    y: 1000,
  });

  const [markText, setMarkText] = useState('');
  const markItems = markText ? markText.split('&').filter(Boolean) : [];

  // 当弹窗打开时自动展开并聚焦输入框
  useEffect(() => {
    if (isOpen) {
      const { selection } = editor.state;
      const { from, to } = selection;
      const startPos = editor.view.coordsAtPos(from);
      const endPos = editor.view.coordsAtPos(to);

      const x = (startPos.left + endPos.left) / 2;
      const y = endPos.bottom + 4;

      // 获取选择comment
      const isCommentActive = editor.isActive('comment');

      const attrs = editor.getAttributes('comment') || {};

      setPosition({ x, y });

      if (isCommentActive) {
        setMarkText(attrs.markText);
      }

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
      const newMarkText = [...markItems, commentContent].join(' & ');
      editor.chain().focus().setComment(null, newMarkText).run();
      setMarkText(`${markText}&${commentContent}`);
      setCommentContent('');
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

  if (!isOpen || !position) {
    return null;
  }

  const commentInputGroup = (
    <div
      ref={containerRef}
      className={cn('fixed z-50 transition-all duration-300', isExpanded ? 'w-80' : 'w-10')}
      style={{
        left: position?.x,
        top: position?.y,
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
        {/* 输入区域 */}
        <div
          className={cn(
            'flex-1 transition-all duration-300 overflow-hidden py-2',
            isExpanded ? 'max-w-full opacity-100' : 'max-w-0 opacity-0',
          )}
        >
          {markItems.length > 0 && (
            <div className="px-2 py-1 flex flex-col gap-1 border-b border-gray-100 dark:border-gray-700">
              {markItems.map((item, idx) => (
                <div key={`${item}-${idx}`} className="group flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    {item}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMark(idx)}
                    className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 px-2">
            <Input
              ref={inputRef}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入评论内容..."
              className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible-border-0"
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
