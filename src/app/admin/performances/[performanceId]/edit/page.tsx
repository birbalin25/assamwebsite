'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
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
          <FileUploadField
            label="Add Images"
            value=""
            multiple
            onChange={(url) => { if (url) setGalleryImages(prev => [...prev, url]); }}
            type="image"
            storagePath="performances/gallery"
            helperText="Select multiple images at once or drag & drop."
          />
          {galleryImages.length > 0 && (
            <div className="mt-4 space-y-2">
              {galleryImages.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                  <span className="text-xs text-earth-500 truncate flex-1">{url}</span>
                  <button type="button" onClick={() => setGalleryImages(prev => prev.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-heading font-semibold text-earth-800 mb-4">Additional Videos</h2>
          <FileUploadField
            label="Add Videos"
            value=""
            multiple
            onChange={(url) => { if (url) setVideos(prev => [...prev, url]); }}
            type="video"
            storagePath="performances/extra-videos"
            helperText="Select multiple video files at once or drag & drop. You can also paste YouTube/Vimeo URLs."
          />
          {videos.length > 0 && (
            <div className="mt-4 space-y-2">
              {videos.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-earth-500 truncate flex-1">{url}</span>
                  <button type="button" onClick={() => setVideos(prev => prev.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
}
