'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { CategoryBadge } from '@/components/performances/CategoryBadge';
import { Spinner } from '@/components/ui/Spinner';
import { getAllPerformances, deletePerformance } from '@/lib/services/performances';
import { toast } from 'sonner';
import type { Performance, WithId } from '@/types';

export default function AdminPerformancesPage() {
  const [performances, setPerformances] = useState<WithId<Performance>[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPerformances = async () => {
    try {
      const data = await getAllPerformances();
      setPerformances(data);
    } catch {
      toast.error('Failed to load performances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPerformances(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this performance?')) return;
    setDeleting(id);
    try {
      await deletePerformance(id);
      setPerformances(prev => prev.filter(p => p.id !== id));
      toast.success('Performance deleted.');
    } catch {
      toast.error('Failed to delete performance.');
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
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
        <h1 className="text-2xl font-heading font-bold text-earth-800">Performances</h1>
        <Link href="/admin/performances/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Performance</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={performances as unknown as Record<string, unknown>[]} keyField="id" />
    </div>
  );
}
