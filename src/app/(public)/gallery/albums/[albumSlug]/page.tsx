'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';
import { PhotoLightbox } from '@/components/gallery/PhotoLightbox';
import { FilterBar } from '@/components/shared/FilterBar';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { FolderOpen } from 'lucide-react';
import { getAlbumBySlug, getPublishedAlbums } from '@/lib/services/albums';
import { getPublishedMediaByAlbumId } from '@/lib/services/media';
import type { Album, MediaItem, WithId } from '@/types';

export default function AlbumDetailPage() {
  const params = useParams();
  const slug = params.albumSlug as string;

  const [album, setAlbum] = useState<WithId<Album> | null>(null);
  const [photos, setPhotos] = useState<WithId<MediaItem>[]>([]);
  const [videos, setVideos] = useState<WithId<MediaItem>[]>([]);
  const [subAlbums, setSubAlbums] = useState<WithId<Album>[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeMediaFilter, setActiveMediaFilter] = useState('');

  useEffect(() => {
    async function fetchAlbum() {
      try {
        const albumData = await getAlbumBySlug(slug);
        if (!albumData) {
          setLoading(false);
          return;
        }
        setAlbum(albumData);

        const [mediaItems, children] = await Promise.all([
          getPublishedMediaByAlbumId(albumData.id),
          getPublishedAlbums(albumData.id),
        ]);

        setPhotos(mediaItems.filter(m => m.type === 'photo'));
        setVideos(mediaItems.filter(m => m.type === 'video'));
        setSubAlbums(children);
      } catch (error) {
        console.error('Failed to fetch album:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlbum();
  }, [slug]);

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!album) {
    return (
      <>
        <PageHeader
          title="Album Not Found"
          breadcrumbs={[
            { label: 'Gallery', href: '/gallery' },
            { label: 'Not Found' },
          ]}
        />
        <div className="text-center py-20">
          <p className="text-earth-500 text-lg">This album doesn&apos;t exist or isn&apos;t published.</p>
          <Link href="/gallery" className="text-gamosa-600 text-sm mt-2 inline-block hover:underline">
            Back to Gallery
          </Link>
        </div>
      </>
    );
  }

  const photoGridData = photos.map(p => ({
    id: p.id,
    url: p.url,
    thumbnailUrl: p.thumbnailUrl,
    title: p.title || p.caption,
    width: p.width,
    height: p.height,
  }));

  const lightboxPhotos = photos.map(p => ({
    url: p.url,
    title: p.title || p.caption,
  }));

  return (
    <>
      <PageHeader
        title={album.name}
        description={album.description}
        breadcrumbs={[
          { label: 'Gallery', href: '/gallery' },
          { label: album.name },
        ]}
      />

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sub-Albums */}
          {subAlbums.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-heading font-bold text-earth-800 mb-6">Sub-Albums</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subAlbums.map((sub) => (
                  <Link key={sub.id} href={`/gallery/albums/${sub.slug}`}>
                    <Card hover padding="none" className="group overflow-hidden">
                      <div className="relative h-40 bg-gradient-to-br from-muga-100 to-gamosa-100 flex items-center justify-center overflow-hidden">
                        {sub.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={sub.thumbnail}
                            alt={sub.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        ) : (
                          <FolderOpen className="h-10 w-10 text-muga-300" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading font-semibold text-earth-800 group-hover:text-gamosa-600 transition-colors">
                          {sub.name}
                        </h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Media Filter */}
          {(photos.length > 0 || videos.length > 0) && (
            <div className="mb-8">
              <FilterBar
                filters={[
                  ...(photos.length > 0 ? [{ value: 'images', label: `Images (${photos.length})` }] : []),
                  ...(videos.length > 0 ? [{ value: 'videos', label: `Videos (${videos.length})` }] : []),
                ]}
                activeFilter={activeMediaFilter}
                onFilterChange={setActiveMediaFilter}
                allLabel="All"
              />
            </div>
          )}

          {/* Photos */}
          {photos.length > 0 && (activeMediaFilter === '' || activeMediaFilter === 'images') && (
            <div className="mb-12">
              <h2 className="text-xl font-heading font-bold text-earth-800 mb-6">
                Photos ({photos.length})
              </h2>
              <PhotoGrid photos={photoGridData} onPhotoClick={handlePhotoClick} />
              <PhotoLightbox
                photos={lightboxPhotos}
                open={lightboxOpen}
                index={lightboxIndex}
                onClose={() => setLightboxOpen(false)}
              />
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (activeMediaFilter === '' || activeMediaFilter === 'videos') && (
            <div className="mb-12">
              <h2 className="text-xl font-heading font-bold text-earth-800 mb-6">
                Videos ({videos.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Card key={video.id} padding="none" className="overflow-hidden">
                    <div className="relative aspect-video bg-earth-900">
                      <video
                        controls
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                        poster={video.thumbnailUrl || undefined}
                        className="w-full h-full object-contain"
                      >
                        <source src={video.url} />
                      </video>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm text-earth-800 line-clamp-2">
                        {video.title || 'Untitled Video'}
                      </h3>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {photos.length === 0 && videos.length === 0 && subAlbums.length === 0 && (
            <div className="text-center py-20">
              <p className="text-earth-500 text-lg">This album is empty.</p>
              <Link href="/gallery" className="text-gamosa-600 text-sm mt-2 inline-block hover:underline">
                Back to Gallery
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
