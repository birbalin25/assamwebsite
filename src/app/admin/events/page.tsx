'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { getAllEvents, deleteEvent } from '@/lib/services/events';
import { toast } from 'sonner';
import type { Event, WithId } from '@/types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<WithId<Event>[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setDeleting(id);
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted.');
    } catch {
      toast.error('Failed to delete event.');
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'isPublished', label: 'Status',
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isPublished ? 'tea' : 'default'}>
          {item.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'isFeatured', label: 'Featured',
      render: (item: Record<string, unknown>) => item.isFeatured ? <Badge variant="muga">Featured</Badge> : <span className="text-earth-400">—</span>,
    },
    {
      key: 'actions', label: '',
      render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/events/${item.id}/edit`}>
            <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(String(item.id)); }}
            isLoading={deleting === String(item.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-earth-800">Events</h1>
        <Link href="/admin/events/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Event</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={events as unknown as Record<string, unknown>[]} keyField="id" />
    </div>
  );
}
