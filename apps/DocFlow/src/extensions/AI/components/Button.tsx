import React from 'react';

import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    // 映射shadcn button的variant和size属性
    const shadcnVariant = {
      default: 'default',
      outline: 'secondary',
      ghost: 'ghost',
    }[variant];

    const shadcnSize = {
      default: 'default',
      sm: 'sm',
      lg: 'lg',
      icon: 'icon',
    }[size];

    return (
      <ShadcnButton
        className={cn(className)} // 保留原有cn工具函数处理自定义类名
        variant={shadcnVariant as any}
        size={shadcnSize as any}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export default Button;
