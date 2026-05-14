import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'gamosa' | 'muga' | 'tea' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-earth-100 text-earth-700',
  gamosa: 'bg-gamosa-100 text-gamosa-700',
  muga: 'bg-muga-100 text-muga-700',
  tea: 'bg-tea-100 text-tea-700',
  outline: 'border border-earth-300 text-earth-600',
};

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
