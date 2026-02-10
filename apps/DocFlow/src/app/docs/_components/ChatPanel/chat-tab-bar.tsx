'use client';

import { X, Plus, Clock, Sparkles } from 'lucide-react';

import type { ChatTab } from '@/stores/chatStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils';

interface SessionItem {
  id: string;
  title: string;
}

interface ChatTabBarProps {
  tabs: ChatTab[];
  activeTabId: string | null;
  sessions: SessionItem[];
  onNewTab: () => void;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onOpenSession: (session: SessionItem) => void;
  onRefreshSessions: () => void;
  onClosePanel: () => void;
}

export function ChatTabBar({
  tabs,
  activeTabId,
  sessions,
  onNewTab,
  onSwitchTab,
  onCloseTab,
  onOpenSession,
  onRefreshSessions,
  onClosePanel,
}: ChatTabBarProps) {
  return (
    <div className="flex items-center bg-white border-b border-gray-100 min-h-[38px]">
      <div className="flex-1 flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSwitchTab(tab.id)}
            className={cn(
              'group relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap max-w-[200px] min-w-0 transition-colors shrink-0',
              tab.id === activeTabId
                ? 'bg-white text-gray-800 shadow-[inset_0_-2px_0_0_theme(colors.blue.500)]'
                : 'bg-gray-50/50 text-gray-500 hover:bg-gray-100/80 hover:text-gray-700',
            )}
          >
            <Sparkles className="h-3 w-3 shrink-0 text-blue-500" />
            <span className="truncate">{tab.title}</span>
            {tabs.length > 1 && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }
                }}
                className="ml-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all shrink-0"
              >
                <X className="h-2.5 w-2.5" />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-0.5 px-1.5 shrink-0 border-l border-gray-100">
        <button
          onClick={onNewTab}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="新建对话"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <DropdownMenu onOpenChange={(open) => open && onRefreshSessions()}>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="历史记录"
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {sessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-gray-400">暂无历史记录</div>
            ) : (
              sessions.slice(0, 3).map((session) => (
                <DropdownMenuItem
                  key={session.id}
                  onClick={() => onOpenSession(session)}
                  className="cursor-pointer text-xs gap-2"
                >
                  <Sparkles className="h-3 w-3 text-blue-500 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={onClosePanel}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="关闭面板"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
