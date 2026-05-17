'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getAllAnnouncements, deleteAnnouncement, ensureDefaultAnnouncements } from '@/lib/services/announcements';
import { toast } from 'sonner';
import type { Announcement, WithId } from '@/types';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<WithId<Announcement>[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  const fetchAnnouncements = async () => {
    try {
      await ensureDefaultAnnouncements();
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch {
      toast.error('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success('Announcement deleted.');
    } catch {
      toast.error('Failed to delete announcement.');
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const categoryOptions = [...new Set(announcements.map(a => a.category).filter(Boolean))].sort();

  const filteredAnnouncements = announcements.filter(a => {
    if (filterCategory && a.category !== filterCategory) return false;
    return true;
  });

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'isPinned', label: 'Pinned', render: (item: Record<string, unknown>) => item.isPinned ? <Badge variant="muga">Pinned</Badge> : <span className="text-earth-400">—</span> },
    { key: 'isPublished', label: 'Status', render: (item: Record<string, unknown>) => <Badge variant={item.isPublished ? 'tea' : 'default'}>{item.isPublished ? 'Published' : 'Draft'}</Badge> },
    {
      key: 'actions', label: '',
      render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/announcements/${item.id}/edit`}>
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
        <h1 className="text-2xl font-heading font-bold text-earth-800">Announcements</h1>
        <Link href="/admin/announcements/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Announcement</Button>
        </Link>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-earth-500">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filter</span>
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="text-sm rounded-lg border border-earth-300 px-3 py-1.5 text-earth-700 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500">
          <option value="">All Categories</option>
          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {filterCategory && (
          <button onClick={() => setFilterCategory('')} className="text-xs px-2.5 py-1.5 rounded-lg text-earth-500 hover:text-earth-700 hover:bg-earth-100 transition-colors flex items-center gap-1">
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
      <DataTable columns={columns} data={filteredAnnouncements as unknown as Record<string, unknown>[]} keyField="id" />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={!!deleting}
      />
    </div>
  );
}
