import { cn } from '@/lib/utils/cn';

interface CulturalMotifBannerProps {
  variant?: 'gamosa' | 'muga' | 'tea';
  className?: string;
}

export function CulturalMotifBanner({ variant = 'gamosa', className }: CulturalMotifBannerProps) {
  const bgColor = {
    gamosa: 'bg-gamosa-50',
    muga: 'bg-muga-50',
    tea: 'bg-tea-50',
  };

  return (
    <div className={cn('py-4', bgColor[variant], className)}>
      <div className="gamosa-border-top" />
    </div>
  );
}
