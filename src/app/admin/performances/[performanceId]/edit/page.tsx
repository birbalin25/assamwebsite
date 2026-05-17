'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, CheckSquare, Square, Trash2 } from 'lucide-react';
import { VideoThumbnail } from '@/components/admin/VideoThumbnail';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { toast } from 'sonner';
import { getPerformanceById, updatePerformance } from '@/lib/services/performances';
import { getAllEvents } from '@/lib/services/events';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Event, WithId } from '@/types';
import { PRESET_CATEGORIES, PRESET_TYPES } from '@/types';

const categoryOptions = [...PRESET_CATEGORIES.map(c => ({ value: c, label: c })), { value: 'Other', label: 'Other' }];
const typeOptions = [...PRESET_TYPES.map(t => ({ value: t, label: t })), { value: 'Other', label: 'Other' }];

export default function EditPerformancePage() {
  const params = useParams();
  const router = useRouter();
  const performanceId = params.performanceId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<WithId<Event>[]>([]);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [eventId, setEventId] = useState('');
  const [category, setCategory] = useState('Adults');
  const [customCategory, setCustomCategory] = useState('');
  const [type, setType] = useState('Solo Dance');
  const [customType, setCustomType] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [order, setOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [showDeleteImagesConfirm, setShowDeleteImagesConfirm] = useState(false);
  const [showDeleteVideosConfirm, setShowDeleteVideosConfirm] = useState(false);
  const [deleteImageIndex, setDeleteImageIndex] = useState<number | null>(null);
  const [deleteVideoIndex, setDeleteVideoIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [performance, allEvents] = await Promise.all([
          getPerformanceById(performanceId),
          getAllEvents(),
        ]);
        setEvents(allEvents);

        if (!performance) {
          setNotFound(true);
          return;
        }

        setTitle(performance.title);
        setEventId(performance.eventId || '');

        // If saved category matches a preset, select it; otherwise treat as custom
        const presetCats = PRESET_CATEGORIES as readonly string[];
        if (presetCats.includes(performance.category)) {
          setCategory(performance.category);
        } else {
          setCategory('Other');
          setCustomCategory(performance.category);
        }

        // Same for type
        const presetTypes = PRESET_TYPES as readonly string[];
        if (presetTypes.includes(performance.type)) {
          setType(performance.type);
        } else {
          setType('Other');
          setCustomType(performance.type);
        }
        setDescription(performance.description || '');
        setThumbnailUrl(performance.thumbnailUrl || '');
        setVideoUrl(performance.videoUrl || '');
        setGalleryImages(performance.galleryImages || []);
        setVideos(performance.videos || []);
        setOrder(performance.order || 0);
        setIsPublished(performance.isPublished);
      } catch {
        toast.error('Failed to load performance.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [performanceId]);

  const eventOptions = events.map(e => ({ value: e.id, label: `${e.name} (${e.year})` }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedEvent = events.find(ev => ev.id === eventId);
      const eventYear = selectedEvent?.year || new Date().getFullYear();

      const resolvedCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;
      const resolvedType = type === 'Other' && customType.trim() ? customType.trim() : type;

      await updatePerformance(performanceId, {
        title,
        category: resolvedCategory,
        type: resolvedType,
        eventId: eventId || '',
        eventYear,
        ...(videoUrl && { videoUrl }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(description && { description }),
        ...(galleryImages.length > 0 && { galleryImages }),
        ...(videos.length > 0 && { videos }),
        order,
        isPublished,
      });

      toast.success('Performance updated!');
      router.push('/admin/performances');
    } catch {
      toast.error('Failed to update performance.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-earth-600">Performance not found</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-earth-800 mb-6">Edit Performance</h1>
      <form onSubmit={(e) => { e.preventDefault(); setShowSaveConfirm(true); }} className="max-w-3xl space-y-6">
        <Card>
          <h2 className="font-heading font-semibold text-earth-800 mb-4">Performance Details</h2>
          <div className="space-y-4">
            <Input label="Title" name="title" placeholder="e.g., Bihu Dance Group" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Select label="Event" name="eventId" options={eventOptions} placeholder="Select event" value={eventId} onChange={(e) => setEventId(e.target.value)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Select label="Category" name="category" options={categoryOptions} value={category} onChange={(e) => setCategory(e.target.value)} />
                {category === 'Other' && (
                  <input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Enter custom category..." className="mt-2 block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500" />
                )}
              </div>
              <div>
                <Select label="Type" name="type" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
                {type === 'Other' && (
                  <input value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Enter custom type..." className="mt-2 block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Description</label>
              <RichTextEditor content={description} onChange={setDescription} />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-heading font-semibold text-earth-800 mb-4">Thumbnail Image</h2>
          <FileUploadField
            label="Performance Thumbnail"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            type="image"
            storagePath="performances/thumbnails"
            helperText="Upload an image or paste a URL for the performance thumbnail"
          />
        </Card>

        <Card>
          <h2 className="font-heading font-semibold text-earth-800 mb-4">Video</h2>
          <FileUploadField
            label="Performance Video"
            value={videoUrl}
            onChange={setVideoUrl}
            type="video"
            storagePath="performances/videos"
            helperText="Upload a video file (MP4, MOV, WebM) or paste a YouTube/Vimeo link"
          />
        </Card>

        <Card>
          <h2 className="font-heading font-semibold text-earth-800 mb-4">Gallery Images</h2>
          {galleryImages.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedImages.size === galleryImages.length) {
                      setSelectedImages(new Set());
                    } else {
                      setSelectedImages(new Set(galleryImages.map((_, i) => i)));
                    }
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-earth-300 hover:border-earth-400 text-earth-600 hover:text-earth-800 transition-colors flex items-center gap-1.5"
                >
                  {selectedImages.size === galleryImages.length ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                  {selectedImages.size === galleryImages.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedImages.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteImagesConfirm(true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Selected ({selectedImages.size})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                {galleryImages.map((url, i) => (
                  <div
                    key={i}
                    className={`relative group aspect-square rounded-lg overflow-hidden bg-earth-100 cursor-pointer ${selectedImages.has(i) ? 'ring-2 ring-gamosa-500 ring-offset-1' : ''}`}
                    onClick={() => setSelectedImages(prev => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i); else next.add(i);
                      return next;
                    })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1">
                      {selectedImages.has(i)
                        ? <CheckSquare className="h-5 w-5 text-gamosa-500 drop-shadow" />
                        : <Square className="h-5 w-5 text-white/70 drop-shadow opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDeleteImageIndex(i); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <FileUploadField
            label="Add Images"
            value=""
            multiple
            onChange={(url) => { if (url) setGalleryImages(prev => [...prev, url]); }}
            type="image"
            storagePath="performances/gallery"
            helperText="Select multiple images at once or drag & drop."
          />
        </Card>

        <Card>
          <h2 className="font-heading font-semibold text-earth-800 mb-4">Additional Videos</h2>
          {videos.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedVideos.size === videos.length) {
                      setSelectedVideos(new Set());
                    } else {
                      setSelectedVideos(new Set(videos.map((_, i) => i)));
                    }
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-earth-300 hover:border-earth-400 text-earth-600 hover:text-earth-800 transition-colors flex items-center gap-1.5"
                >
                  {selectedVideos.size === videos.length ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                  {selectedVideos.size === videos.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedVideos.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteVideosConfirm(true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Selected ({selectedVideos.size})
                  </button>
                )}
              </div>
              <div className="space-y-2 mb-4">
                {videos.map((url, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2 bg-earth-50 rounded-lg border cursor-pointer transition-colors ${selectedVideos.has(i) ? 'border-gamosa-500 ring-1 ring-gamosa-500' : 'border-earth-200'}`}
                    onClick={() => setSelectedVideos(prev => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i); else next.add(i);
                      return next;
                    })}
                  >
                    <div className="shrink-0">
                      {selectedVideos.has(i)
                        ? <CheckSquare className="h-5 w-5 text-gamosa-500" />
                        : <Square className="h-5 w-5 text-earth-300" />}
                    </div>
                    <VideoThumbnail url={url} />
                    <p className="text-sm text-earth-600 truncate flex-1">{url}</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDeleteVideoIndex(i); }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <FileUploadField
            label="Add Videos"
            value=""
            multiple
            onChange={(url) => { if (url) setVideos(prev => [...prev, url]); }}
            type="video"
            storagePath="performances/extra-videos"
            helperText="Select multiple video files at once or drag & drop. You can also paste YouTube/Vimeo URLs."
          />
        </Card>

        <Card>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
            <span className="text-sm text-earth-700">Published</span>
          </label>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" isLoading={saving}>Update Performance</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); handleSubmit({ preventDefault: () => {} } as React.FormEvent); }}
        title="Update Performance"
        message="Are you sure you want to update this performance?"
        confirmLabel="Update"
        confirmVariant="primary"
      />
      <ConfirmDialog
        isOpen={showDeleteImagesConfirm}
        onClose={() => setShowDeleteImagesConfirm(false)}
        onConfirm={() => {
          setGalleryImages(prev => prev.filter((_, i) => !selectedImages.has(i)));
          setSelectedImages(new Set());
          setShowDeleteImagesConfirm(false);
        }}
        title="Delete Selected Images"
        message={`Are you sure you want to delete ${selectedImages.size} selected image(s)? This cannot be undone.`}
        confirmLabel="Delete"
      />
      <ConfirmDialog
        isOpen={showDeleteVideosConfirm}
        onClose={() => setShowDeleteVideosConfirm(false)}
        onConfirm={() => {
          setVideos(prev => prev.filter((_, i) => !selectedVideos.has(i)));
          setSelectedVideos(new Set());
          setShowDeleteVideosConfirm(false);
        }}
        title="Delete Selected Videos"
        message={`Are you sure you want to delete ${selectedVideos.size} selected video(s)? This cannot be undone.`}
        confirmLabel="Delete"
      />
      <ConfirmDialog
        isOpen={deleteImageIndex !== null}
        onClose={() => setDeleteImageIndex(null)}
        onConfirm={() => {
          if (deleteImageIndex !== null) {
            const i = deleteImageIndex;
            setGalleryImages(prev => prev.filter((_, j) => j !== i));
            setSelectedImages(prev => { const next = new Set<number>(); prev.forEach(idx => { if (idx < i) next.add(idx); else if (idx > i) next.add(idx - 1); }); return next; });
            setDeleteImageIndex(null);
          }
        }}
        title="Delete Image"
        message="Are you sure you want to delete this image? This cannot be undone."
        confirmLabel="Delete"
      />
      <ConfirmDialog
        isOpen={deleteVideoIndex !== null}
        onClose={() => setDeleteVideoIndex(null)}
        onConfirm={() => {
          if (deleteVideoIndex !== null) {
            const i = deleteVideoIndex;
            setVideos(prev => prev.filter((_, j) => j !== i));
            setSelectedVideos(prev => { const next = new Set<number>(); prev.forEach(idx => { if (idx < i) next.add(idx); else if (idx > i) next.add(idx - 1); }); return next; });
            setDeleteVideoIndex(null);
          }
        }}
        title="Delete Video"
        message="Are you sure you want to delete this video? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
