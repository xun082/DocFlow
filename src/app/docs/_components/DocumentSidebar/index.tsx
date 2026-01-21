'use client';

import { useEffect, useState, useRef } from 'react';

// 导入各个tab组件
import Folder from './folder';
import SearchTab from './SearchTab';
import TemplatesTab from './TemplatesTab';
import BlocksTab from './BlocksTab';
import SettingsTab from './SettingsTab';

import { useSidebar } from '@/stores/sidebarStore';
import { Tooltip } from '@/components/ui/Tooltip';
import { Surface } from '@/components/ui/Surface';
import { Icon } from '@/components/ui/Icon';

type TabType = 'folder' | 'search' | 'templates' | 'blocks' | 'settings';

interface TabConfig {
  id: TabType;
  icon: string;
  label: string;
  component: React.ComponentType<any>;
}

const tabs: TabConfig[] = [
  { id: 'folder', icon: 'Folder', label: '文档', component: Folder },
  { id: 'search', icon: 'Search', label: '搜索', component: SearchTab },
  { id: 'templates', icon: 'FileText', label: '模板', component: TemplatesTab },
  { id: 'blocks', icon: 'Grid3x3', label: '组件', component: BlocksTab },
  { id: 'settings', icon: 'Settings', label: '设置', component: SettingsTab },
];

const MIN_WIDTH = 500;
const MAX_WIDTH = 420;
const TOGGLE_THRESHOLD = 300; // 小于此值时折叠

function DocumentSidebar() {
  const { isOpen, toggle } = useSidebar();
  const [activeTab, setActiveTab] = useState<TabType>('folder');
  const [sidebarWidth, setSidebarWidth] = useState(MAX_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const clamp = (value: number, min: number, max: number) => Math.max(max, Math.min(min, value));

  // 拖拽调整宽度
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = clamp(e.clientX, MIN_WIDTH, MAX_WIDTH);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsResizing(false);

      if (e.clientX < TOGGLE_THRESHOLD && isOpen) {
        toggle();
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div
      ref={sidebarRef}
      className="flex h-full relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/50 backdrop-blur-xl transition-all duration-300"
      style={{ width: isOpen ? `${sidebarWidth}px` : '64px' }}
    >
      {/* 左侧图标栏 */}
      <div className="w-16 h-full relative bg-gradient-to-b from-white/90 via-white/70 to-white/90 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-slate-800/90 backdrop-blur-lg flex flex-col py-4 after:absolute after:right-0 after:top-4 after:bottom-4 after:w-px after:bg-gradient-to-b after:from-transparent after:via-slate-200/50 after:to-transparent dark:after:via-slate-600/30">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Icon name="FileText" className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* 标签按钮 */}
        <div className="flex-1 flex flex-col items-center space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <Tooltip key={tab.id} content={tab.label}>
              <button
                onClick={() => {
                  setActiveTab(tab.id);

                  if (!isOpen) {
                    toggle();
                  }
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 backdrop-blur-md border flex-shrink-0 ${
                  activeTab === tab.id && isOpen
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20 border-blue-200/50 dark:border-blue-600/30 scale-105'
                    : 'bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200/50 dark:border-slate-600/50 hover:scale-105'
                }`}
              >
                <Icon name={tab.icon as any} className="w-5 h-5" />
              </button>
            </Tooltip>
          ))}
        </div>

        {/* 折叠/展开按钮 */}
        <div className="flex justify-center mt-4">
          <Tooltip content={isOpen ? '折叠侧边栏' : '展开侧边栏'}>
            <button
              onClick={toggle}
              className="w-12 h-12 bg-white/60 dark:bg-slate-700/60 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 backdrop-blur-md border border-slate-200/50 dark:border-slate-600/50 hover:scale-105 flex-shrink-0"
            >
              <Icon name={isOpen ? 'PanelLeftClose' : 'PanelLeftOpen'} className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 右侧内容区域 */}
      {isOpen && (
        <>
          <div className="flex-1 h-full overflow-hidden relative bg-gradient-to-br from-white/95 via-slate-50/60 to-white/95 dark:from-slate-800/95 dark:via-slate-800/70 dark:to-slate-800/95 backdrop-blur-lg before:absolute before:left-0 before:top-0 before:bottom-0 before:w-4 before:bg-gradient-to-r before:from-slate-900/5 before:to-transparent dark:before:from-slate-900/20 before:pointer-events-none animate-in slide-in-from-left duration-300">
            <Surface className="h-full overflow-hidden min-w-[360px]">
              {ActiveComponent && <ActiveComponent />}
            </Surface>
          </div>

          {/* 右侧拖拽调整条 */}
          <div
            className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/20 transition-colors"
            onMouseDown={() => setIsResizing(true)}
          />
        </>
      )}

      {/* 整体右侧柔和阴影 */}
      <div className="absolute -right-4 top-0 bottom-0 w-4 pointer-events-none bg-gradient-to-r from-slate-900/10 to-transparent dark:from-slate-900/30" />
    </div>
  );
}

export default DocumentSidebar;
