'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, UserPlus, Star, UsersRound, Headphones, Network, LucideIcon } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  icon: LucideIcon;
  href: string;
  count?: number;
  badge?: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'org-all',
    name: '组织内联系人',
    icon: Users,
    href: '/dashboard/contacts',
  },
  {
    id: 'external',
    name: '外部联系人',
    icon: Network,
    href: '/dashboard/contacts/external',
  },
  {
    id: 'new',
    name: '新的联系人',
    icon: UserPlus,
    href: '/dashboard/contacts/requests',
  },
  {
    id: 'starred',
    name: '星标联系人',
    icon: Star,
    href: '/dashboard/contacts/starred',
  },
  {
    id: 'groups',
    name: '我的群组',
    icon: UsersRound,
    href: '/dashboard/contacts/groups',
  },
  {
    id: 'service',
    name: '服务台',
    icon: Headphones,
    href: '/dashboard/contacts/service',
  },
];

interface CategoryItemProps {
  category: CategoryItem;
  isActive: boolean;
}

function CategoryNavItem({ category, isActive }: CategoryItemProps) {
  const Icon = category.icon;

  return (
    <Link
      href={category.href}
      className={`
        w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200 ease-in-out
        ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
      `}
    >
      <div className="flex items-center space-x-3">
        <Icon
          className={`
            w-5 h-5 transition-colors duration-200
            ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}
          `}
        />
        <span>{category.name}</span>
      </div>

      {/* 数量徽章 */}
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

      {/* 红点徽章 */}
      {category.badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
          {category.badge}
        </span>
      )}
    </Link>
  );
}

export default function ContactCategoryList() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto py-4 pt-6">
        <ul className="space-y-1 px-2">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <CategoryNavItem category={category} isActive={pathname === category.href} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
