import { cn } from '@/lib/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export function Skeleton({ className, variant = 'text', width, height, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-earth-200',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-earth-200 overflow-hidden">
      <Skeleton variant="rectangular" className="h-48 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton width="60%" />
        <Skeleton width="100%" />
        <Skeleton width="80%" />
      </div>
    </div>
  );
}
