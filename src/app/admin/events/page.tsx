'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getAllEvents, deleteEvent } from '@/lib/services/events';
import { toast } from 'sonner';
import type { Event, WithId } from '@/types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<WithId<Event>[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterYear, setFilterYear] = useState('');

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
    setDeleting(id);
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted.');
    } catch {
      toast.error('Failed to delete event.');
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const typeOptions = [...new Set(events.map(e => e.type))].sort();
  const yearOptions = [...new Set(events.map(e => e.year))].sort((a, b) => b - a);
  const hasActiveFilter = filterType || filterYear;

  const filteredEvents = events.filter(e => {
    if (filterType && e.type !== filterType) return false;
    if (filterYear && e.year !== Number(filterYear)) return false;
    return true;
  });

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
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setDeleteTarget(String(item.id)); }}
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
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-earth-500">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm rounded-lg border border-earth-300 px-3 py-1.5 text-earth-700 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500">
          <option value="">All Types</option>
          {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="text-sm rounded-lg border border-earth-300 px-3 py-1.5 text-earth-700 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500">
          <option value="">All Years</option>
          {yearOptions.map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        {hasActiveFilter && (
          <button onClick={() => { setFilterType(''); setFilterYear(''); }} className="text-xs px-2.5 py-1.5 rounded-lg text-earth-500 hover:text-earth-700 hover:bg-earth-100 transition-colors flex items-center gap-1">
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
      <DataTable columns={columns} data={filteredEvents as unknown as Record<string, unknown>[]} keyField="id" />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={!!deleting}
      />
    </div>
  );
}
