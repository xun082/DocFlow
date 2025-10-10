import { cn } from '@/utils/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-600/60', className)}
      {...props}
    />
  );
}
