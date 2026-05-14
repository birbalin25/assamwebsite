'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { toast } from 'sonner';
import { createEvent } from '@/lib/services/events';
import { slugify } from '@/lib/utils/slugify';
import type { EventType } from '@/types';

const eventTypeOptions = [
  { value: 'Rongali Bihu', label: 'Rongali Bihu' },
  { value: 'Bohag Bihu', label: 'Bohag Bihu' },
  { value: 'Magh Bihu', label: 'Magh Bihu' },
  { value: 'Cultural Program', label: 'Cultural Program' },
  { value: 'Other', label: 'Other' },
];

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const type = formData.get('type') as EventType;
      const year = Number(formData.get('year'));
      const dateStr = formData.get('date') as string;
      const endDateStr = formData.get('endDate') as string;
      const venueName = formData.get('venueName') as string;
      const venueAddress = formData.get('venueAddress') as string;
      const venueCity = formData.get('venueCity') as string;
      const venueState = formData.get('venueState') as string;
      const isPublished = !!formData.get('isPublished');
      const isFeatured = !!formData.get('isFeatured');

      const dateTs = { seconds: Math.floor(new Date(dateStr).getTime() / 1000), nanoseconds: 0 };
      const endDate = endDateStr ? { seconds: Math.floor(new Date(endDateStr).getTime() / 1000), nanoseconds: 0 } : undefined;

      await createEvent({
        name,
        slug: slugify(name),
        type,
        year,
        date: dateTs,
        ...(endDate && { endDate }),
        venue: {
          name: venueName,
          address: venueAddress || '',
          city: venueCity || '',
          state: venueState || '',
        },
        description,
        featuredImage,
        isPublished,
        isFeatured,
        order: 0,
        performanceIds: [],
      });

      toast.success('Event created successfully!');
      router.push('/admin/events');
    } catch {
      toast.error('Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-earth-800 mb-6">New Event</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="font-heading font-semibold text-earth-800 mb-4">Event Details</h2>
              <div className="space-y-4">
                <Input label="Event Name" name="name" placeholder="e.g., Rongali Bihu 2025" required />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select label="Event Type" name="type" options={eventTypeOptions} placeholder="Select type" />
                  <Input label="Year" name="year" type="number" defaultValue={new Date().getFullYear()} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Start Date" name="date" type="date" required />
                  <Input label="End Date" name="endDate" type="date" />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-heading font-semibold text-earth-800 mb-4">Venue</h2>
              <div className="space-y-4">
                <Input label="Venue Name" name="venueName" placeholder="e.g., Community Center" required />
                <Input label="Address" name="venueAddress" placeholder="Street address" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="City" name="venueCity" placeholder="City" />
                  <Input label="State" name="venueState" placeholder="State" />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-heading font-semibold text-earth-800 mb-4">Description</h2>
              <RichTextEditor content={description} onChange={setDescription} />
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="font-heading font-semibold text-earth-800 mb-4">Featured Image</h2>
              <FileUploadField
                label="Event Cover Image"
                value={featuredImage}
                onChange={setFeaturedImage}
                type="image"
                storagePath="events/covers"
                helperText="Upload a cover image for this event"
              />
            </Card>

            <Card>
              <h2 className="font-heading font-semibold text-earth-800 mb-4">Publishing</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="isPublished" className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                  <span className="text-sm text-earth-700">Published</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="isFeatured" className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                  <span className="text-sm text-earth-700">Featured on homepage</span>
                </label>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" isLoading={loading} className="flex-1">Save Event</Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
