'use client';

import { useState } from 'react';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  preview?: string;
}

const TemplatesTab = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 模板数据
  const templates: Template[] = [
    {
      id: '1',
      name: '技术文档',
      description: '用于API文档、技术规范等',
      icon: 'Code',
      category: 'tech',
      tags: ['API', '技术', '规范'],
      preview: '# API 文档\n\n## 概述\n\n### 接口列表\n\n### 请求示例',
    },
    {
      id: '2',
      name: '会议纪要',
      description: '标准的会议记录模板',
      icon: 'Users',
      category: 'business',
      tags: ['会议', '纪要', '团队'],
      preview: '# 会议纪要\n\n**时间：** \n**参与人员：** \n\n## 议题\n\n## 决议事项',
    },
    {
      id: '3',
      name: '项目计划',
      description: '项目规划和里程碑模板',
      icon: 'Calendar',
      category: 'project',
      tags: ['项目', '计划', '里程碑'],
      preview: '# 项目计划\n\n## 项目概述\n\n## 目标和里程碑\n\n## 资源分配',
    },
    {
      id: '4',
      name: '学习笔记',
      description: '知识整理和学习记录',
      icon: 'BookOpen',
      category: 'education',
      tags: ['学习', '笔记', '知识'],
      preview: '# 学习笔记\n\n## 主题\n\n## 要点总结\n\n## 实践练习',
    },
    {
      id: '5',
      name: '产品需求',
      description: 'PRD产品需求文档模板',
      icon: 'Package',
      category: 'product',
      tags: ['产品', '需求', 'PRD'],
      preview: '# 产品需求文档\n\n## 需求背景\n\n## 功能描述\n\n## 验收标准',
    },
    {
      id: '6',
      name: '设计规范',
      description: 'UI/UX设计规范文档',
      icon: 'Palette',
      category: 'design',
      tags: ['设计', 'UI', 'UX'],
      preview: '# 设计规范\n\n## 色彩系统\n\n## 组件库\n\n## 交互规范',
    },
  ];

  // 分类
  const categories = [
    { id: 'all', name: '全部', icon: 'Grid3X3' },
    { id: 'tech', name: '技术', icon: 'Code' },
    { id: 'business', name: '商务', icon: 'Briefcase' },
    { id: 'project', name: '项目', icon: 'FolderOpen' },
    { id: 'education', name: '教育', icon: 'GraduationCap' },
    { id: 'product', name: '产品', icon: 'Package' },
    { id: 'design', name: '设计', icon: 'Palette' },
  ];

  // 过滤模板
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCreateDocument = (template: Template) => {
    // TODO: 实现创建文档逻辑
    console.log('Create document from template:', template);
  };

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 p-4">
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
          placeholder="搜索模板..."
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
                'flex items-center space-x-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
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

      {/* 模板列表 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-3 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
          模板 ({filteredTemplates.length})
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? '未找到匹配的模板' : '该分类下暂无模板'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    'group rounded-lg border border-gray-200 p-3 dark:border-gray-600',
                    'bg-white hover:border-blue-300 dark:bg-gray-800 dark:hover:border-blue-500',
                    'cursor-pointer transition-all duration-200 hover:shadow-sm',
                  )}
                  onClick={() => handleCreateDocument(template)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                        'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                        'transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50',
                      )}
                    >
                      <Icon name={template.icon as any} className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                          {template.name}
                        </h4>
                        <Icon
                          name="Plus"
                          className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:text-blue-500 group-hover:opacity-100 dark:text-gray-500 dark:group-hover:text-blue-400"
                        />
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {template.description}
                      </p>

                      {/* 标签 */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 创建自定义模板 */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-600">
        <button
          className={cn(
            'flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-3',
            'border-2 border-dashed border-gray-300 dark:border-gray-600',
            'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400',
            'transition-colors hover:border-blue-300 dark:hover:border-blue-500',
            'text-sm font-medium',
          )}
          onClick={() => {
            // TODO: 实现创建自定义模板逻辑
            console.log('Create custom template');
          }}
        >
          <Icon name="Plus" className="h-4 w-4" />
          <span>创建自定义模板</span>
        </button>
      </div>
    </div>
  );
};

export default TemplatesTab;
