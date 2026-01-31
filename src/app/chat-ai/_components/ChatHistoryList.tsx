'use client';

/**
 * 聊天历史记录列表组件
 *
 * 功能说明：
 * - 显示所有聊天会话
 * - 支持新建、切换、重命名和删除会话
 * - 位于侧边栏下方
 */

import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Plus, Trash2, MessageSquare, Pencil, Check, X } from 'lucide-react';

import type { ChatSession } from '../types';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

interface ChatHistoryListProps {
  /** 会话列表 */
  sessions: ChatSession[];
  /** 当前激活的会话 ID */
  activeSessionId?: string;
  /** 会话点击回调 */
  onSessionClick: (sessionId: string) => void;
  /** 新建会话回调 */
  onNewSession: () => void;
  /** 删除会话回调 */
  onDeleteSession: (sessionId: string) => void;
  /** 重命名会话回调 */
  onRenameSession?: (sessionId: string, newTitle: string) => void;
  /** 是否还有更多 */
  hasMore?: boolean;
  /** 是否正在加载更多 */
  isLoadingMore?: boolean;
  /** 加载更多回调 */
  onLoadMore?: () => void;
}

/**
 * 格式化时间显示
 */
function formatTime(date: Date): string {
  const d = dayjs(date);
  const now = dayjs();

  // 如果是今天，只显示时分
  if (d.isSame(now, 'day')) {
    return d.format('HH:mm');
  }

  // 如果是今年，显示 月-日 时:分
  if (d.isSame(now, 'year')) {
    return d.format('MM-DD HH:mm');
  }

  // 跨年显示 年-月-日 时:分
  return d.format('YYYY-MM-DD HH:mm');
}

export default function ChatHistoryList({
  sessions,
  activeSessionId,
  onSessionClick,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: ChatHistoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 监听滚动到底部
  const observerTarget = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [onLoadMore, hasMore, isLoadingMore]);

  const handleStartEdit = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditValue(session.title);
  };

  const handleConfirmRename = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();

    if (editValue.trim() && onRenameSession) {
      onRenameSession(sessionId, editValue.trim());
    }

    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (editValue.trim() && onRenameSession) {
        onRenameSession(sessionId, editValue.trim());
      }

      setEditingId(null);
      setEditValue('');
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 新建会话按钮 */}
      <div className="p-3 border-b border-gray-100">
        <Button
          onClick={onNewSession}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-blue-100 shadow-md active:scale-95 transition-all"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          新建会话
        </Button>
      </div>

      {/* 会话列表 - 默认隐藏滚动条，悬停时显示 */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.scrollbarColor = '#d1d5db transparent';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.scrollbarColor = 'transparent transparent';
        }}
      >
        <div className="text-xs text-gray-400 mt-2 mb-2 pl-2">最近会话({sessions.length})</div>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p className="text-xs text-center">暂无会话记录</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => editingId !== session.id && onSessionClick(session.id)}
                className={cn(
                  'group relative p-2 rounded-lg cursor-pointer transition-colors',
                  activeSessionId === session.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent',
                )}
              >
                {/* 会话信息 */}
                <div className="pr-14">
                  {editingId === session.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, session.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-xs px-1 py-0.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleConfirmRename(e, session.id)}
                        className="p-0.5 hover:bg-green-50 rounded"
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-0.5 hover:bg-gray-100 rounded"
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4
                        className={cn(
                          'text-xs font-medium truncate',
                          activeSessionId === session.id ? 'text-blue-600' : 'text-gray-700',
                        )}
                      >
                        {session.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400">
                          {formatTime(session.lastMessageAt)}
                        </span>
                        {/* <span className="text-[10px] text-gray-400">
                          {session.messageCount} 条消息
                        </span> */}
                      </div>
                    </>
                  )}
                </div>

                {/* 操作按钮 */}
                {editingId !== session.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* 编辑按钮 */}
                    <button
                      onClick={(e) => handleStartEdit(e, session)}
                      className="p-1 hover:bg-blue-50 rounded"
                    >
                      <Pencil className="h-3 w-3 text-blue-500" />
                    </button>
                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* 滚动加载触发点 */}
            {hasMore && (
              <div
                ref={observerTarget}
                className="h-4 w-full flex items-center justify-center py-4"
              >
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    正在加载...
                  </div>
                )}
              </div>
            )}

            {!hasMore && sessions.length > 0 && (
              <div className="text-[10px] text-center text-gray-300 py-4">已显示全部会话</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
