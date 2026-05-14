'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { toast } from 'sonner';
import { getAnnouncementById, updateAnnouncement } from '@/lib/services/announcements';
import { slugify } from '@/lib/utils/slugify';
import type { AnnouncementCategory, WithId, Announcement } from '@/types';

export default function EditAnnouncementPage() {
  const params = useParams<{ announcementId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState<WithId<Announcement> | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('General');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAnnouncementById(params.announcementId);
        if (!data) {
          toast.error('Announcement not found.');
          router.push('/admin/announcements');
          return;
        }
        setAnnouncement(data);
        setTitle(data.title);
        setCategory(data.category);
        setExcerpt(data.excerpt);
        setContent(data.content);
        setIsPinned(data.isPinned);
        setIsPublished(data.isPublished);
      } catch {
        toast.error('Failed to load announcement.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.announcementId, router]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }
    setSaving(true);
    try {
      await updateAnnouncement(params.announcementId, {
        title: title.trim(),
        slug: slugify(title.trim()),
        category,
        excerpt: excerpt.trim(),
        content,
        isPinned,
        isPublished,
      });
      toast.success('Announcement updated!');
      router.push('/admin/announcements');
    } catch {
      toast.error('Failed to update announcement.');
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

  if (!announcement) return null;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-earth-800 mb-6">Edit Announcement</h1>
      <div className="max-w-2xl space-y-6">
        <Card>
          <div className="space-y-4">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
              options={[
                { value: 'General', label: 'General' },
                { value: 'Event', label: 'Event' },
                { value: 'Community', label: 'Community' },
                { value: 'Urgent', label: 'Urgent' },
              ]}
            />
            <Input
              label="Excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary (max 200 chars)"
            />
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Content</label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
                />
                <span className="text-sm text-earth-700">Pinned</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
                />
                <span className="text-sm text-earth-700">Published</span>
              </label>
            </div>
          </div>
        </Card>
        <div className="flex gap-3">
          <Button onClick={handleSave} isLoading={saving}>Update Announcement</Button>
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
