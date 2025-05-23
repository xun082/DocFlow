'use client';

import { useState, ReactNode, useEffect } from 'react';
import { icons } from 'lucide-react';

import ExplorerTab from './tabs/folder';
import SearchTab from './tabs/SearchTab';
import TemplatesTab from './tabs/TemplatesTab';
import BlocksTab from './tabs/BlocksTab';
import SettingsTab from './tabs/SettingsTab';

import { cn } from '@/utils/utils';
import { Icon } from '@/components/ui/Icon';

type IconName = keyof typeof icons;

// 侧边栏项类型
type TabItem = {
  id: string;
  icon: IconName;
  title: string;
  content: ReactNode;
};

interface TabSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  initialActiveTab?: string;
}

const TabSidebar = ({ isOpen, onClose, initialActiveTab = 'explorer' }: TabSidebarProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(isOpen);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // 同步外部的isOpen状态
  useEffect(() => {
    setIsSidebarOpen(isOpen);
  }, [isOpen]);

  const handleTabClick = (tabId: string) => {
    if (tabId === 'search') {
      setIsSearchActive(true);
    } else {
      setIsSearchActive(false);
    }

    if (activeTab === tabId && isSidebarOpen) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setActiveTab(tabId);
      setIsSidebarOpen(true);
    }
  };

  const tabs: TabItem[] = [
    {
      id: 'explorer',
      icon: 'Files' as IconName,
      title: '文档',
      content: <ExplorerTab />,
    },
    {
      id: 'search',
      icon: 'Search' as IconName,
      title: '搜索',
      content: <SearchTab isActive={isSearchActive} />,
    },
    {
      id: 'templates',
      icon: 'LayoutTemplate' as IconName,
      title: '模板',
      content: <TemplatesTab />,
    },
    {
      id: 'blocks',
      icon: 'Blocks' as IconName,
      title: '区块',
      content: <BlocksTab />,
    },
    {
      id: 'settings',
      icon: 'Settings' as IconName,
      title: '设置',
      content: <SettingsTab />,
    },
  ];

  // 当前激活标签
  const activeTabItem = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="flex h-full border-r border-gray-200 bg-gray-50">
      {/* 左侧图标栏 */}
      <div className="w-14 border-r border-gray-200 flex flex-col items-center py-4 bg-white">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'w-10 h-10 rounded-lg flex justify-center items-center cursor-pointer mb-2 transition-colors',
              activeTab === tab.id && isSidebarOpen
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100',
            )}
            onClick={() => handleTabClick(tab.id)}
            title={tab.title}
          >
            <Icon name={tab.icon} className="h-5 w-5" />
          </div>
        ))}
      </div>

      {/* 右侧内容区 */}
      <div
        className={cn(
          'bg-gray-50 overflow-hidden transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-0',
        )}
      >
        {isSidebarOpen && (
          <div className="h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div className="flex items-center">
                <span className="font-medium text-gray-800">{activeTabItem.title}</span>
              </div>
              <button
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-200 text-gray-500"
                onClick={onClose}
                title="关闭"
              >
                <Icon name="X" className="h-4 w-4" />
              </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-auto">{activeTabItem.content}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabSidebar;
