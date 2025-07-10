import { memo } from 'react';
import { Editor } from '@tiptap/react';

import { EditorInfo } from './EditorInfo';

import { Icon } from '@/components/ui/Icon';

export interface DocumentHeaderProps {
  editor?: Editor | null;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  provider?: any; // 支持不同类型的provider
}

export const DocumentHeader = memo(
  ({ editor, isSidebarOpen, toggleSidebar, provider }: DocumentHeaderProps) => {
    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        {/* 左侧：侧边栏切换按钮 */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            aria-label={isSidebarOpen ? '隐藏侧边栏' : '显示侧边栏'}
          >
            <Icon name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeft'} />
          </button>

          {/* 文档标题 */}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">文档编辑器</h1>
        </div>

        {/* 右侧：编辑器信息和工具栏 */}
        <div className="flex items-center space-x-4">
          {editor && <EditorInfo editor={editor} />}
          {provider && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              协作状态: {provider.connected ? '已连接' : '未连接'}
            </div>
          )}
        </div>
      </div>
    );
  },
);

DocumentHeader.displayName = 'DocumentHeader';
