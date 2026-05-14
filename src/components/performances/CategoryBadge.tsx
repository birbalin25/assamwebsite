import { cn } from '@/lib/utils/cn';

const categoryStyles: Record<string, string> = {
  kids: 'bg-blue-100 text-blue-700',
  teens: 'bg-purple-100 text-purple-700',
  adults: 'bg-green-100 text-green-700',
};

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
      categoryStyles[category] || 'bg-earth-100 text-earth-700',
      className
    )}>
      {category}
    </span>
  );
}
