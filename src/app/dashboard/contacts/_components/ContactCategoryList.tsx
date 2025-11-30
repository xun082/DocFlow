'use client';

import { Users, UserPlus, Star, UsersRound, Headphones, Network } from 'lucide-react';

import { ContactCategory } from './types';

interface ContactCategoryListProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORIES: ContactCategory[] = [
  {
    id: 'org-all',
    name: '组织内联系人',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'external',
    name: '外部联系人',
    icon: <Network className="w-5 h-5" />,
  },
  {
    id: 'new',
    name: '新的联系人',
    icon: <UserPlus className="w-5 h-5" />,
  },
  {
    id: 'starred',
    name: '星标联系人',
    icon: <Star className="w-5 h-5" />,
  },
  {
    id: 'groups',
    name: '我的群组',
    icon: <UsersRound className="w-5 h-5" />,
  },
  {
    id: 'service',
    name: '服务台',
    icon: <Headphones className="w-5 h-5" />,
  },
];

export default function ContactCategoryList({
  selectedCategory,
  onSelectCategory,
}: ContactCategoryListProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 标题 */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">通讯录</h2>
      </div>

      {/* 分类列表 */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.id;

            return (
              <li key={category.id}>
                <button
                  onClick={() => onSelectCategory(category.id)}
                  className={`
                    w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`
                        transition-colors duration-200
                        ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}
                      `}
                    >
                      {category.icon}
                    </span>
                    <span>{category.name}</span>
                  </div>
                  {category.count !== undefined && (
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full
                        ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                      `}
                    >
                      {category.count}
                    </span>
                  )}
                  {category.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                      {category.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
