'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getAllMembers, deleteMember } from '@/lib/services/members';
import { toast } from 'sonner';
import type { Member, WithId } from '@/types';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<WithId<Member>[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      const data = await getAllMembers();
      setMembers(data);
    } catch {
      toast.error('Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      toast.success('Member deleted.');
    } catch {
      toast.error('Failed to delete member.');
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'roles', label: 'Roles',
      render: (item: Record<string, unknown>) => {
        const roles = item.roles as string[] | undefined;
        return roles?.length ? roles.join(', ') : '—';
      },
    },
    {
      key: 'location', label: 'Location', sortable: true,
      render: (item: Record<string, unknown>) => {
        const loc = item.location as { city?: string; state?: string } | undefined;
        if (!loc) return '—';
        return [loc.city, loc.state].filter(Boolean).join(', ') || '—';
      },
    },
    {
      key: 'isPublished', label: 'Status',
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isPublished ? 'tea' : 'default'}>
          {item.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'actions', label: '',
      render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/members/${item.id}/edit`}>
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
        <h1 className="text-2xl font-heading font-bold text-earth-800">Members</h1>
        <Link href="/admin/members/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Member</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={members as unknown as Record<string, unknown>[]} keyField="id" />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={!!deleting}
      />
    </div>
  );
}
