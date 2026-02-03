import { HTMLProps, forwardRef } from 'react';

import { cn } from '@/utils';

interface SpinnerProps extends Omit<HTMLProps<HTMLDivElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', ...rest }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-[3px]',
    };

    const spinnerClass = cn(
      'animate-spin rounded-full border-current border-t-transparent',
      sizeClasses[size],
      className,
    );

    return <div className={spinnerClass} ref={ref} {...rest} />;
  },
);

Spinner.displayName = 'Spinner';

export default Spinner;
