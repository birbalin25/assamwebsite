'use client';

import { cn } from '@/lib/utils/cn';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  width?: number;
  height?: number;
}

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (index: number) => void;
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-earth-500">No photos found.</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          onClick={() => onPhotoClick?.(index)}
          className="block w-full break-inside-avoid group relative overflow-hidden rounded-lg cursor-pointer"
        >
          <div className="relative bg-earth-100 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.title || ''}
              className={cn(
                'w-full object-cover select-none',
                index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'
              )}
              loading="lazy"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {photo.title && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium truncate">{photo.title}</p>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
