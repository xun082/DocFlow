import { icons } from 'lucide-react';

import { cn } from '@/utils/utils';

export type IconProps = {
  name: keyof typeof icons;
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
