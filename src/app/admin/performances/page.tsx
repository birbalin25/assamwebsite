'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { CategoryBadge } from '@/components/performances/CategoryBadge';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getAllPerformances, deletePerformance } from '@/lib/services/performances';
import { getAllEvents } from '@/lib/services/events';
import { toast } from 'sonner';
import type { Performance, Event, WithId } from '@/types';

export default function AdminPerformancesPage() {
  const [performances, setPerformances] = useState<WithId<Performance>[]>([]);
  const [eventMap, setEventMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterEvent, setFilterEvent] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const fetchPerformances = async () => {
    try {
      const [data, events] = await Promise.all([getAllPerformances(), getAllEvents()]);
      setPerformances(data);
      const map: Record<string, string> = {};
      events.forEach(e => { map[e.id] = `${e.name} (${e.year})`; });
      setEventMap(map);
    } catch {
      toast.error('Failed to load performances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPerformances(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deletePerformance(id);
      setPerformances(prev => prev.filter(p => p.id !== id));
      toast.success('Performance deleted.');
    } catch {
      toast.error('Failed to delete performance.');
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  // Derive unique filter options from data
  const eventOptions = [...new Set(performances.map(p => p.eventId).filter(Boolean))].sort((a, b) => (eventMap[a] || '').localeCompare(eventMap[b] || ''));
  const categoryOptions = [...new Set(performances.map(p => p.category))].sort();
  const typeOptions = [...new Set(performances.map(p => p.type))].sort();
  const yearOptions = [...new Set(performances.map(p => p.eventYear))].sort((a, b) => b - a);

  const hasActiveFilter = filterEvent || filterCategory || filterType || filterYear;

  const filteredPerformances = performances.filter(p => {
    if (filterEvent && p.eventId !== filterEvent) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterType && p.type !== filterType) return false;
    if (filterYear && p.eventYear !== Number(filterYear)) return false;
    return true;
  });

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'eventId', label: 'Event', sortable: true, render: (item: Record<string, unknown>) => <span className="text-earth-600 text-sm">{eventMap[String(item.eventId)] || '—'}</span> },
    { key: 'category', label: 'Category', render: (item: Record<string, unknown>) => <CategoryBadge category={String(item.category)} /> },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'eventYear', label: 'Year', sortable: true },
    { key: 'isPublished', label: 'Status', render: (item: Record<string, unknown>) => <Badge variant={item.isPublished ? 'tea' : 'default'}>{item.isPublished ? 'Published' : 'Draft'}</Badge> },
    {
      key: 'actions', label: '',
      render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/performances/${item.id}/edit`}>
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
        <h1 className="text-2xl font-heading font-bold text-earth-800">Performances</h1>
        <Link href="/admin/performances/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Performance</Button>
        </Link>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-earth-500">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
        </div>
        <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)} className="text-sm rounded-lg border border-earth-300 px-3 py-1.5 text-earth-700 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500">
          <option value="">All Events</option>
          {eventOptions.map(id => <option key={id} value={id}>{eventMap[id]}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="text-sm rounded-lg border border-earth-300 px-3 py-1.5 text-earth-700 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500">
          <option value="">All Categories</option>
          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm rounded-lg border border-earth-300 px-3 py-1.5 text-earth-700 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500">
          <option value="">All Types</option>
          {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="text-sm rounded-lg border border-earth-300 px-3 py-1.5 text-earth-700 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500">
          <option value="">All Years</option>
          {yearOptions.map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        {hasActiveFilter && (
          <button onClick={() => { setFilterEvent(''); setFilterCategory(''); setFilterType(''); setFilterYear(''); }} className="text-xs px-2.5 py-1.5 rounded-lg text-earth-500 hover:text-earth-700 hover:bg-earth-100 transition-colors flex items-center gap-1">
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
      <DataTable columns={columns} data={filteredPerformances as unknown as Record<string, unknown>[]} keyField="id" />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Performance"
        message="Are you sure you want to delete this performance? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={!!deleting}
      />
    </div>
  );
}
