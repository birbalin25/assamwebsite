'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryBadge } from '@/components/performances/CategoryBadge';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Play, Users, Calendar } from 'lucide-react';
import { PhotoLightbox } from '@/components/gallery/PhotoLightbox';
import { getPerformanceById } from '@/lib/services/performances';
import { getEventById } from '@/lib/services/events';
import type { Performance, WithId } from '@/types';

export default function PerformanceDetailPage() {
  const params = useParams<{ performanceId: string }>();
  const [performance, setPerformance] = useState<WithId<Performance> | null>(null);
  const [eventName, setEventName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const perf = await getPerformanceById(params.performanceId);
        if (!perf) {
          setNotFound(true);
          return;
        }
        setPerformance(perf);

        if (perf.eventId) {
          const event = await getEventById(perf.eventId);
          if (event) {
            setEventName(event.name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch performance:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.performanceId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !performance) {
    return (
      <>
        <PageHeader
          title="Performance Not Found"
          breadcrumbs={[
            { label: 'Performances', href: '/performances' },
            { label: 'Not Found' },
          ]}
        />
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-earth-500 text-lg">The performance you are looking for could not be found.</p>
          </div>
        </section>
      </>
    );
  }

  const performerNames = performance.performers.map(p => p.name).join(', ');

  return (
    <>
      <PageHeader
        title={performance.title}
        breadcrumbs={[
          { label: 'Performances', href: '/performances' },
          { label: performance.title },
        ]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <CategoryBadge category={performance.category} />
            <Badge variant="outline">{performance.type}</Badge>
          </div>

          {performance.videoUrl ? (
            <div className="aspect-video mb-8 rounded-xl overflow-hidden">
              <iframe
                src={performance.videoUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                title={performance.title}
              />
            </div>
          ) : (
            <div className="aspect-video bg-earth-100 rounded-xl mb-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gamosa-500 flex items-center justify-center mb-3">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
                <p className="text-earth-500 text-sm">Video not available</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {eventName && (
              <div className="flex items-center gap-3 text-earth-600">
                <Calendar className="h-5 w-5 text-muga-500" />
                <span>{eventName}</span>
              </div>
            )}
            {performerNames && (
              <div className="flex items-center gap-3 text-earth-600">
                <Users className="h-5 w-5 text-tea-500" />
                <span>{performerNames}</span>
              </div>
            )}
          </div>

          {performance.description && (
            <div
              className="prose prose-earth max-w-none mt-6"
              dangerouslySetInnerHTML={{ __html: performance.description }}
            />
          )}

          {performance.galleryImages && performance.galleryImages.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-heading font-semibold text-earth-800 mb-4">Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {performance.galleryImages.map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-earth-100 cursor-pointer group"
                    onDoubleClick={() => {
                      setLightboxIndex(i);
                      setLightboxOpen(true);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-300"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                ))}
              </div>
              <PhotoLightbox
                photos={performance.galleryImages.map(url => ({ url }))}
                open={lightboxOpen}
                index={lightboxIndex}
                onClose={() => setLightboxOpen(false)}
              />
            </div>
          )}

          {performance.videos && performance.videos.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-heading font-semibold text-earth-800 mb-4">More Videos</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {performance.videos.map((url, i) => (
                  <div key={i} className="aspect-video rounded-lg overflow-hidden bg-earth-900">
                    {url.includes('youtube.com') || url.includes('youtu.be') ? (
                      <iframe src={url.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen />
                    ) : (
                      <video src={url} controls className="w-full h-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
