'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { VideoCard } from '@/components/gallery/VideoCard';
import { YearFilter } from '@/components/events/YearFilter';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { getPublishedMedia } from '@/lib/services/media';
import type { MediaItem, WithId } from '@/types';

interface MappedVideo {
  id: string;
  title: string;
  eventName?: string;
  year: number;
  videoUrl: string;
  thumbnailUrl?: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<MappedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MappedVideo | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const result = await getPublishedMedia('video', undefined, 200);
        const mapped = result.items.map((item: WithId<MediaItem>) => ({
          id: item.id,
          title: item.title || item.caption || 'Untitled Video',
          eventName: item.eventName,
          year: item.year,
          videoUrl: item.url,
          thumbnailUrl: item.thumbnailUrl,
        }));
        setVideos(mapped);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const years = [...new Set(videos.map(v => v.year))].sort((a, b) => b - a);
  const filtered = activeYear ? videos.filter(v => v.year === activeYear) : videos;

  return (
    <>
      <PageHeader
        title="Videos"
        description="Watch performance videos from our events."
        breadcrumbs={[
          { label: 'Gallery', href: '/gallery' },
          { label: 'Videos' },
        ]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-500 text-lg">No videos found yet.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <YearFilter years={years} activeYear={activeYear} onYearChange={setActiveYear} />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((video) => (
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    eventName={video.eventName}
                    thumbnailUrl={video.thumbnailUrl}
                    onClick={() => setSelectedVideo(video)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <Modal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title={selectedVideo?.title}
        size="xl"
      >
        {selectedVideo?.videoUrl ? (
          <div className="aspect-video rounded-lg overflow-hidden">
            {selectedVideo.videoUrl.includes('youtube.com') || selectedVideo.videoUrl.includes('youtu.be') ? (
              <iframe
                src={selectedVideo.videoUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                title={selectedVideo.title}
              />
            ) : (
              <video
                controls
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full bg-black"
              >
                <source src={selectedVideo.videoUrl} />
              </video>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-earth-100 rounded-lg flex items-center justify-center">
            <p className="text-earth-400">Video not available</p>
          </div>
        )}
      </Modal>
    </>
  );
}
