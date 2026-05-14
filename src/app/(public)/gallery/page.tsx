'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { FolderOpen } from 'lucide-react';
import { getPublishedAlbums } from '@/lib/services/albums';
import { getMediaCountByAlbumId } from '@/lib/services/media';
import type { Album, WithId } from '@/types';

interface AlbumWithCount extends WithId<Album> {
  mediaCount: number;
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<AlbumWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const published = await getPublishedAlbums();
        const withCounts = await Promise.all(
          published.map(async (album) => {
            const mediaCount = await getMediaCountByAlbumId(album.id);
            return { ...album, mediaCount };
          })
        );
        setAlbums(withCounts);
      } catch (error) {
        console.error('Failed to fetch albums:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlbums();
  }, []);

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Browse photos and videos from our events and celebrations."
        breadcrumbs={[{ label: 'Gallery' }]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : albums.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-500 text-lg">No albums found yet.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-heading font-bold text-earth-800 mb-8">Albums</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {albums.map((album) => (
                  <Link key={album.id} href={`/gallery/albums/${album.slug}`}>
                    <Card hover padding="none" className="group overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-br from-muga-100 to-gamosa-100 flex items-center justify-center overflow-hidden">
                        {album.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={album.thumbnail}
                            alt={album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        ) : (
                          <FolderOpen className="h-12 w-12 text-muga-300" />
                        )}
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {album.mediaCount} {album.mediaCount === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading font-semibold text-earth-800 group-hover:text-gamosa-600 transition-colors">
                          {album.name}
                        </h3>
                        {album.description && (
                          <p className="text-sm text-earth-500 mt-1 line-clamp-2">{album.description}</p>
                        )}
                        {album.year && (
                          <p className="text-sm text-earth-400 mt-1">{album.year}</p>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
