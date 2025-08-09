'use client';

import React, { useState } from 'react';
import { icons } from 'lucide-react';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';

interface BlockItemProps {
  icon: keyof typeof icons;
  label: string;
  description: string;
  blockType: string;
  category: string;
  onDragStart: (event: React.DragEvent, blockType: string) => void;
  onClick: (blockType: string) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({
  icon,
  label,
  description,
  blockType,
  onDragStart,
  onClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={cn(
        'group border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800',
        'cursor-pointer rounded-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500',
        'hover:shadow-sm active:scale-[0.98]',
        isDragging && 'scale-95 opacity-50',
      )}
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, blockType);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onClick(blockType)}
      data-block-type={blockType}
    >
      <div className="flex items-start space-x-3">
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
            'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            'transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50',
          )}
        >
          <Icon name={icon} className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
            {label}
          </h4>
          <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Icon
            name="GripVertical"
            className="h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-400 dark:text-gray-600 dark:group-hover:text-gray-500"
          />
        </div>
      </div>
    </div>
  );
};

const BlocksTab = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 区块分类
  const categories = [
    { id: 'all', name: '全部', icon: 'Grid3X3' },
    { id: 'text', name: '文本', icon: 'Type' },
    { id: 'media', name: '媒体', icon: 'Image' },
    { id: 'layout', name: '布局', icon: 'LayoutDashboard' },
    { id: 'data', name: '数据', icon: 'Database' },
    { id: 'interactive', name: '交互', icon: 'MousePointer' },
  ];

  // 区块数据
  const blocks = [
    {
      icon: 'Heading' as keyof typeof icons,
      label: '标题',
      description: '添加不同级别的标题文本',
      blockType: 'heading',
      category: 'text',
    },
    {
      icon: 'Type' as keyof typeof icons,
      label: '段落',
      description: '插入普通文本段落',
      blockType: 'paragraph',
      category: 'text',
    },
    {
      icon: 'List' as keyof typeof icons,
      label: '列表',
      description: '创建有序或无序列表',
      blockType: 'list',
      category: 'text',
    },
    {
      icon: 'Quote' as keyof typeof icons,
      label: '引用',
      description: '添加引用文本块',
      blockType: 'blockquote',
      category: 'text',
    },
    {
      icon: 'Code' as keyof typeof icons,
      label: '代码块',
      description: '插入代码片段，支持语法高亮',
      blockType: 'codeblock',
      category: 'text',
    },
    {
      icon: 'Image' as keyof typeof icons,
      label: '图片',
      description: '上传或插入图片',
      blockType: 'image',
      category: 'media',
    },
    {
      icon: 'Video' as keyof typeof icons,
      label: '视频',
      description: '嵌入视频内容',
      blockType: 'video',
      category: 'media',
    },
    {
      icon: 'FileAudio' as keyof typeof icons,
      label: '音频',
      description: '插入音频文件',
      blockType: 'audio',
      category: 'media',
    },
    {
      icon: 'Table' as keyof typeof icons,
      label: '表格',
      description: '创建数据表格',
      blockType: 'table',
      category: 'data',
    },
    {
      icon: 'ChartColumnBig' as keyof typeof icons,
      label: '图表',
      description: '插入各种类型的图表',
      blockType: 'chart',
      category: 'data',
    },
    {
      icon: 'LayoutDashboard' as keyof typeof icons,
      label: '多列布局',
      description: '创建多列内容布局',
      blockType: 'columns',
      category: 'layout',
    },
    {
      icon: 'Minus' as keyof typeof icons,
      label: '分割线',
      description: '添加水平分割线',
      blockType: 'divider',
      category: 'layout',
    },
    {
      icon: 'ListTodo' as keyof typeof icons,
      label: '任务列表',
      description: '创建可勾选的任务列表',
      blockType: 'todolist',
      category: 'interactive',
    },
    {
      icon: 'Calendar' as keyof typeof icons,
      label: '日历',
      description: '插入日历组件',
      blockType: 'calendar',
      category: 'interactive',
    },
    {
      icon: 'Smile' as keyof typeof icons,
      label: 'emoji',
      description: '插入Emoji',
      blockType: 'emoji',
      category: 'interactive',
    },
  ];

  // 过滤区块
  const filteredBlocks = blocks.filter((block) => {
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (event: React.DragEvent, blockType: string) => {
    event.dataTransfer.setData('application/x-block-type', blockType);
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleBlockClick = (blockType: string) => {
    // TODO: 实现插入区块的逻辑
    console.log('Insert block:', blockType);
  };

  return (
    <div className="flex h-full flex-col space-y-4 p-4">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'w-full border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400',
            'rounded-lg py-2 pr-3 pl-9 text-sm transition-colors',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'text-gray-900 dark:text-gray-100',
          )}
          placeholder="搜索区块..."
        />
        <Icon
          name="Search"
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
        />
      </div>

      {/* 分类筛选 */}
      <div className="space-y-2">
        <div className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
          分类
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex cursor-pointer items-center space-x-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600',
              )}
            >
              <Icon name={category.icon as any} className="h-3 w-3" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start space-x-2">
          <Icon
            name="Info"
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400"
          />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="mb-1 font-medium">使用方法：</p>
            <p>点击区块插入到编辑器，或拖拽到指定位置</p>
          </div>
        </div>
      </div>

      {/* 区块列表 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-3 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
          区块 ({filteredBlocks.length})
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredBlocks.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? '未找到匹配的区块' : '该分类下暂无区块'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBlocks.map((block) => (
                <BlockItem
                  key={block.blockType}
                  icon={block.icon}
                  label={block.label}
                  description={block.description}
                  blockType={block.blockType}
                  category={block.category}
                  onDragStart={handleDragStart}
                  onClick={handleBlockClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlocksTab;
