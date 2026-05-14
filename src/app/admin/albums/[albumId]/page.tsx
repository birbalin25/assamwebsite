'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FolderOpen, Trash2, Loader2, Camera, ZoomIn } from 'lucide-react';
import { ref, deleteObject } from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { PhotoLightbox } from '@/components/gallery/PhotoLightbox';
import { getAlbumById } from '@/lib/services/albums';
import { getMediaByAlbumId, deleteMediaItem, updateMediaItem } from '@/lib/services/media';
import { getAllAlbums } from '@/lib/services/albums';
import { toast } from 'sonner';
import type { Album, MediaItem, WithId } from '@/types';

export default function AdminAlbumDetailPage() {
  const params = useParams();
  const albumId = params.albumId as string;

  const [album, setAlbum] = useState<WithId<Album> | null>(null);
  const [media, setMedia] = useState<WithId<MediaItem>[]>([]);
  const [subAlbums, setSubAlbums] = useState<WithId<Album>[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [albumData, mediaData, allAlbums] = await Promise.all([
        getAlbumById(albumId),
        getMediaByAlbumId(albumId),
        getAllAlbums(),
      ]);
      setAlbum(albumData);
      setMedia(mediaData);
      setSubAlbums(allAlbums.filter(a => a.parentId === albumId));
    } catch {
      toast.error('Failed to load album.');
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteMedia = async (item: WithId<MediaItem>) => {
    if (!confirm('Delete this media item?')) return;
    setDeletingId(item.id);
    try {
      const storage = getFirebaseStorage();
      if (storage) {
        const urlToPath = (url: string) => {
          try {
            const match = url.match(/\/o\/(.+?)\?/);
            if (match) return decodeURIComponent(match[1]);
          } catch { /* ignore */ }
          return null;
        };
        const originalPath = urlToPath(item.url);
        const thumbPath = urlToPath(item.thumbnailUrl);
        if (originalPath) await deleteObject(ref(storage, originalPath)).catch(() => {});
        if (thumbPath) await deleteObject(ref(storage, thumbPath)).catch(() => {});
      }
      await deleteMediaItem(item.id);
      setMedia(prev => prev.filter(m => m.id !== item.id));
      toast.success('Media deleted.');
    } catch {
      toast.error('Failed to delete media.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveFromAlbum = async (item: WithId<MediaItem>) => {
    if (!confirm('Remove this item from the album? (The media will not be deleted)')) return;
    setDeletingId(item.id);
    try {
      await updateMediaItem(item.id, { albumId: undefined });
      setMedia(prev => prev.filter(m => m.id !== item.id));
      toast.success('Removed from album.');
    } catch {
      toast.error('Failed to remove from album.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-20">
        <p className="text-earth-500 text-lg">Album not found.</p>
        <Link href="/admin/albums" className="text-gamosa-600 text-sm mt-2 inline-block hover:underline">
          Back to Albums
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/albums"
          className="inline-flex items-center gap-1.5 text-sm text-earth-500 hover:text-gamosa-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Albums
        </Link>

        <div className="flex items-start gap-4">
          {album.thumbnail ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-earth-100 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={album.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-earth-100 flex items-center justify-center shrink-0">
              <FolderOpen className="h-8 w-8 text-earth-300" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-bold text-earth-800">{album.name}</h1>
              <Badge variant={album.isPublished ? 'tea' : 'default'}>
                {album.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            {album.description && (
              <p className="text-sm text-earth-500 mt-1">{album.description}</p>
            )}
            <p className="text-xs text-earth-400 mt-1">
              {media.length} media item{media.length !== 1 ? 's' : ''}
              {album.year ? ` \u00b7 ${album.year}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Albums */}
      {subAlbums.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading font-semibold text-earth-800 mb-3">Sub-Albums</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subAlbums.map((sub) => (
              <Link key={sub.id} href={`/admin/albums/${sub.id}`}>
                <Card hover padding="sm" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-earth-100 flex items-center justify-center shrink-0">
                    {sub.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sub.thumbnail} alt="" className="w-full h-full object-cover rounded" />
                    ) : (
                      <FolderOpen className="h-5 w-5 text-earth-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-earth-800 truncate">{sub.name}</p>
                    <Badge variant={sub.isPublished ? 'tea' : 'default'} className="mt-0.5">
                      {sub.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <Card className="mb-8">
        <h2 className="font-heading font-semibold text-earth-800 mb-4">Upload Media to Album</h2>
        <AlbumMediaUploader
          albumId={albumId}
          year={album.year || new Date().getFullYear()}
          albumName={album.name}
          onUploadComplete={fetchData}
        />
      </Card>

      {/* Media Grid */}
      <h2 className="font-heading font-semibold text-earth-800 mb-4">
        Media ({media.length})
      </h2>
      {media.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-earth-400">
          <Camera className="h-12 w-12 mb-3" />
          <p className="text-sm font-medium">No media in this album</p>
          <p className="text-xs mt-1">Upload images or videos above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {media.map((item, index) => (
            <div
              key={item.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-earth-100 cursor-pointer"
              onDoubleClick={() => {
                setLightboxIndex(index);
                setLightboxOpen(true);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.title || ''}
                className="w-full h-full object-cover select-none"
                loading="lazy"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">
                  {item.title || 'Untitled'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  className="w-7 h-7 bg-gamosa-500 hover:bg-gamosa-600 rounded-full flex items-center justify-center"
                  title="View full size"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveFromAlbum(item); }}
                  disabled={deletingId === item.id}
                  className="w-7 h-7 bg-earth-700 hover:bg-earth-800 rounded-full flex items-center justify-center"
                  title="Remove from album"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                  ) : (
                    <ArrowLeft className="h-3.5 w-3.5 text-white" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item); }}
                  disabled={deletingId === item.id}
                  className="w-7 h-7 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center"
                  title="Delete permanently"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  )}
                </button>
              </div>

              {/* Badges */}
              <div className="absolute top-1.5 left-1.5 flex gap-1">
                {!item.isPublished && (
                  <span className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    Draft
                  </span>
                )}
                {item.type === 'video' && (
                  <span className="bg-earth-700 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    Video
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <PhotoLightbox
        photos={media.map(m => ({ url: m.url, title: m.title }))}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

/**
 * Wrapper around MediaUploader that sets albumId on uploaded items.
 * After upload completes, it patches each newly created media item with the albumId.
 */
function AlbumMediaUploader({
  albumId,
  year,
  albumName,
  onUploadComplete,
}: {
  albumId: string;
  year: number;
  albumName: string;
  onUploadComplete: () => void;
}) {
  return (
    <MediaUploader
      year={year}
      eventName={albumName}
      onUploadComplete={onUploadComplete}
      albumId={albumId}
      accept={{
        'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
        'video/*': ['.mp4', '.mov', '.webm'],
      }}
    />
  );
}
