'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils/cn';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallback?: string;
}

export function OptimizedImage({ className, fallback, alt, ...props }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) {
    return (
      <div className={cn('bg-earth-200 flex items-center justify-center', className)}>
        <span className="text-earth-400 text-sm">{alt || 'Image'}</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={cn(
        'transition-opacity duration-500',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
}
