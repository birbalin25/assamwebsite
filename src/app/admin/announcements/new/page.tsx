'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { createAnnouncement } from '@/lib/services/announcements';
import { slugify } from '@/lib/utils/slugify';
import type { AnnouncementCategory } from '@/types';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const title = formData.get('title') as string;
      const category = (formData.get('category') as AnnouncementCategory) || 'General';
      const excerpt = (formData.get('excerpt') as string) || '';
      const isPinned = !!formData.get('isPinned');
      const isPublished = !!formData.get('isPublished');

      const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };

      await createAnnouncement({
        title,
        slug: slugify(title),
        content,
        excerpt,
        category,
        isPinned,
        isPublished,
        publishDate: now,
        author: 'Admin',
      });

      toast.success('Announcement created!');
      router.push('/admin/announcements');
    } catch {
      toast.error('Failed to create announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-earth-800 mb-6">New Announcement</h1>
      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); setShowSaveConfirm(true); }} className="max-w-2xl space-y-6">
        <Card>
          <div className="space-y-4">
            <Input label="Title" name="title" required />
            <Select label="Category" name="category" options={[{ value: 'General', label: 'General' }, { value: 'Event', label: 'Event' }, { value: 'Community', label: 'Community' }, { value: 'Urgent', label: 'Urgent' }]} />
            <Input label="Excerpt" name="excerpt" placeholder="Short summary (max 200 chars)" />
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Content</label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="isPinned" className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                <span className="text-sm text-earth-700">Pinned</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="isPublished" className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                <span className="text-sm text-earth-700">Published</span>
              </label>
            </div>
          </div>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" isLoading={loading}>Save Announcement</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); handleSubmit({ preventDefault: () => {}, currentTarget: formRef.current } as unknown as React.FormEvent); }}
        title="Save Announcement"
        message="Are you sure you want to save this announcement?"
        confirmLabel="Save"
        confirmVariant="primary"
      />
    </div>
  );
}
