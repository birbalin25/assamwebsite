'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';
import { PhotoLightbox } from '@/components/gallery/PhotoLightbox';
import { YearFilter } from '@/components/events/YearFilter';
import { Spinner } from '@/components/ui/Spinner';
import { getPublishedMedia } from '@/lib/services/media';
import type { MediaItem, WithId } from '@/types';

interface MappedPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  year: number;
}

export default function PhotosPage() {
  const searchParams = useSearchParams();
  const yearParam = searchParams.get('year');

  const [photos, setPhotos] = useState<MappedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState<number | null>(yearParam ? Number(yearParam) : null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const result = await getPublishedMedia('photo', undefined, 200);
        const mapped = result.items.map((item: WithId<MediaItem>) => ({
          id: item.id,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          title: item.title || item.caption,
          year: item.year,
        }));
        setPhotos(mapped);
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPhotos();
  }, []);

  const years = [...new Set(photos.map(p => p.year))].sort((a, b) => b - a);
  const filtered = activeYear ? photos.filter(p => p.year === activeYear) : photos;

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Photos"
        description="Browse photos from our events and celebrations."
        breadcrumbs={[
          { label: 'Gallery', href: '/gallery' },
          { label: 'Photos' },
        ]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-500 text-lg">No photos found yet.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <YearFilter years={years} activeYear={activeYear} onYearChange={setActiveYear} />
              </div>
              <PhotoGrid photos={filtered} onPhotoClick={handlePhotoClick} />
              <PhotoLightbox
                photos={filtered}
                open={lightboxOpen}
                index={lightboxIndex}
                onClose={() => setLightboxOpen(false)}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
