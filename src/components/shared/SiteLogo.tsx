'use client';

import { useState, useEffect } from 'react';
import { getSiteConfig } from '@/lib/services/siteConfig';
import { cn } from '@/lib/utils/cn';

interface SiteLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-12 h-12 text-xl',
  xl: 'w-16 h-16 text-2xl',
};

let cachedLogo: string | null | undefined = undefined;

export function SiteLogo({ size = 'md', className }: SiteLogoProps) {
  const [logo, setLogo] = useState<string | null>(cachedLogo ?? null);

  useEffect(() => {
    if (cachedLogo !== undefined) return;
    getSiteConfig().then(config => {
      cachedLogo = config.siteLogo || null;
      setLogo(cachedLogo);
    }).catch(() => {
      cachedLogo = null;
    });
  }, []);

  const sizeClass = sizeMap[size];

  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt="Logo"
        className={cn('rounded-full object-cover', sizeClass, className)}
      />
    );
  }

  return (
    <div className={cn('bg-gamosa-500 rounded-full flex items-center justify-center text-white font-heading font-bold', sizeClass, className)}>
      A
    </div>
  );
}
