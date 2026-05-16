'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { toast } from 'sonner';
import { getEventById, updateEvent } from '@/lib/services/events';
import { slugify } from '@/lib/utils/slugify';
import type { EventType, WithId, Event } from '@/types';

const eventTypeOptions = [
  { value: 'Rongali Bihu', label: 'Rongali Bihu' },
  { value: 'Bohag Bihu', label: 'Bohag Bihu' },
  { value: 'Magh Bihu', label: 'Magh Bihu' },
  { value: 'Cultural Program', label: 'Cultural Program' },
  { value: 'Other', label: 'Other' },
];

function timestampToDateStr(ts: { seconds: number }): string {
  return new Date(ts.seconds * 1000).toISOString().split('T')[0];
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<WithId<Event> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [eventType, setEventType] = useState('Rongali Bihu');
  const [customType, setCustomType] = useState('');

  useEffect(() => {
    if (!eventId) return;
    getEventById(eventId)
      .then((data) => {
        if (data) {
          setEvent(data);
          setDescription(data.description || '');
          setFeaturedImage(data.featuredImage || '');
          const knownTypes = eventTypeOptions.map(o => o.value);
          if (knownTypes.includes(data.type)) {
            setEventType(data.type);
          } else {
            setEventType('Other');
            setCustomType(data.type);
          }
        }
      })
      .catch(() => {
        toast.error('Failed to load event.');
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const selectedType = formData.get('type') as string;
      const type = (selectedType === 'Other' && customType.trim() ? customType.trim() : selectedType) as EventType;
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

      await updateEvent(eventId, {
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
      });

      toast.success('Event updated successfully!');
      router.push('/admin/events');
    } catch {
      toast.error('Failed to update event.');
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

  if (!event) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-earth-600">Event not found</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-earth-800 mb-6">Edit Event</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="font-heading font-semibold text-earth-800 mb-4">Event Details</h2>
              <div className="space-y-4">
                <Input label="Event Name" name="name" placeholder="e.g., Rongali Bihu 2025" defaultValue={event.name} required />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Select label="Event Type" name="type" options={eventTypeOptions} value={eventType} onChange={(e) => setEventType(e.target.value)} placeholder="Select type" />
                    {eventType === 'Other' && (
                      <input
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="Enter custom event type..."
                        className="mt-2 block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500"
                      />
                    )}
                  </div>
                  <Input label="Year" name="year" type="number" defaultValue={event.year} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Start Date" name="date" type="date" defaultValue={event.date ? timestampToDateStr(event.date) : ''} required />
                  <Input label="End Date" name="endDate" type="date" defaultValue={event.endDate ? timestampToDateStr(event.endDate) : ''} />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-heading font-semibold text-earth-800 mb-4">Venue</h2>
              <div className="space-y-4">
                <Input label="Venue Name" name="venueName" placeholder="e.g., Community Center" defaultValue={event.venue?.name || ''} required />
                <Input label="Address" name="venueAddress" placeholder="Street address" defaultValue={event.venue?.address || ''} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="City" name="venueCity" placeholder="City" defaultValue={event.venue?.city || ''} />
                  <Input label="State" name="venueState" placeholder="State" defaultValue={event.venue?.state || ''} />
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
                  <input type="checkbox" name="isPublished" defaultChecked={event.isPublished} className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                  <span className="text-sm text-earth-700">Published</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="isFeatured" defaultChecked={event.isFeatured} className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                  <span className="text-sm text-earth-700">Featured on homepage</span>
                </label>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" isLoading={saving} className="flex-1">Update Event</Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
