import * as LucideIcons from 'lucide-react';

import { cn } from '@/utils/utils';

// 创建图标映射，包含所有图标组件（排除 Lucide 前缀的别名和 icons 对象本身）
const icons: Record<string, React.ComponentType<any>> = {};

// 遍历所有导出，找出图标组件
for (const [key, value] of Object.entries(LucideIcons)) {
  // 排除非组件导出：icons 对象、Lucide 前缀的别名
  if (key !== 'icons' && !key.startsWith('Lucide')) {
    // React 组件在运行时可能是函数或对象（取决于环境），这里接受两者
    const isValidComponent =
      typeof value === 'function' ||
      (typeof value === 'object' && value !== null && ('render' in value || '$$typeof' in value));

    if (isValidComponent) {
      // 优先使用不带 Icon 后缀的名称
      const baseName = key.endsWith('Icon') ? key.slice(0, -4) : key;

      // 如果已经有不带后缀的版本，优先使用它
      if (!icons[baseName]) {
        icons[baseName] = value as React.ComponentType<any>;
      }

      // 也保存原始名称（如果不同的话）
      if (key !== baseName) {
        icons[key] = value as React.ComponentType<any>;
      }
    }
  }
}

export type IconName = keyof typeof icons;

// 导出获取图标组件的函数
export function getIconComponent(name: IconName): React.ComponentType<any> | null {
  return icons[name] || null;
}

export type IconProps = {
  name: IconName;
  className?: string;
  strokeWidth?: number;
};

export function Icon({ name, className, strokeWidth }: IconProps) {
  const IconComponent = icons[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={cn('w-4 h-4', className)} strokeWidth={strokeWidth || 2.5} />;
}
