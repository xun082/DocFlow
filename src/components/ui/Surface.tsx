import { HTMLProps, forwardRef } from 'react';

import { cn } from '@/utils/utils';

export type SurfaceProps = HTMLProps<HTMLDivElement> & {
  withShadow?: boolean;
  withBorder?: boolean;
  elevation?: 'low' | 'medium' | 'high';
};

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  (
    { children, className, withShadow = true, withBorder = true, elevation = 'medium', ...props },
    ref,
  ) => {
    const shadowClasses = {
      low: 'shadow-sm',
      medium: 'shadow',
      high: 'shadow-lg',
    };

    const surfaceClass = cn(
      className,
      'bg-white rounded-xl',
      withShadow ? shadowClasses[elevation] : '',
      withBorder ? 'border border-neutral-100' : '',
    );

    return (
      <div className={surfaceClass} {...props} ref={ref}>
        {children}
      </div>
    );
  },
);

Surface.displayName = 'Surface';
