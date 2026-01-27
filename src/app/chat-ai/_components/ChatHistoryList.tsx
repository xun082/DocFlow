'use client';

/**
 * 聊天历史记录列表组件
 *
 * 功能说明：
 * - 显示所有聊天会话
 * - 支持新建、切换和删除会话
 * - 位于侧边栏下方
 */

import React from 'react';
import { Plus, Trash2, MessageSquare } from 'lucide-react';

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
}

/**
 * 格式化时间显示
 */
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString('zh-CN');
}

export default function ChatHistoryList({
  sessions,
  activeSessionId,
  onSessionClick,
  onNewSession,
  onDeleteSession,
}: ChatHistoryListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 新建会话按钮 */}
      <div className="p-3 border-b border-gray-100">
        <Button
          onClick={onNewSession}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
                onClick={() => onSessionClick(session.id)}
                className={cn(
                  'group relative p-2 rounded-lg cursor-pointer transition-colors',
                  activeSessionId === session.id
                    ? 'bg-purple-50 border border-purple-200'
                    : 'hover:bg-gray-50 border border-transparent',
                )}
              >
                {/* 会话信息 */}
                <div className="pr-6">
                  <h4
                    className={cn(
                      'text-xs font-medium truncate',
                      activeSessionId === session.id ? 'text-purple-700' : 'text-gray-700',
                    )}
                  >
                    {session.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400">
                      {formatTime(session.lastMessageAt)}
                    </span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-400">{session.messageCount} 条消息</span>
                  </div>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
