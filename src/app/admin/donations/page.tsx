'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { getAllDonations, deleteDonation } from '@/lib/services/donations';
import { toast } from 'sonner';
import type { Donation, WithId } from '@/types';

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<WithId<Donation>[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDonations = async () => {
    try {
      const data = await getAllDonations();
      setDonations(data);
    } catch {
      toast.error('Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation record?')) return;
    setDeleting(id);
    try {
      await deleteDonation(id);
      setDonations(prev => prev.filter(d => d.id !== id));
      toast.success('Donation record deleted.');
    } catch {
      toast.error('Failed to delete donation.');
    } finally {
      setDeleting(null);
    }
  };

  const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const formattedTotal = `$${total.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const columns = [
    {
      key: 'donorName', label: 'Donor', sortable: true,
      render: (item: Record<string, unknown>) => item.isAnonymous ? 'Anonymous' : String(item.donorName || ''),
    },
    {
      key: 'amount', label: 'Amount', sortable: true,
      render: (item: Record<string, unknown>) => `$${Number(item.amount || 0).toLocaleString('en-US')}`,
    },
    {
      key: 'createdAt', label: 'Date', sortable: true,
      render: (item: Record<string, unknown>) => {
        const ts = item.createdAt as { seconds?: number } | undefined;
        if (!ts?.seconds) return '—';
        return new Date(ts.seconds * 1000).toLocaleDateString();
      },
    },
    { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <Badge variant="tea">{String(item.status)}</Badge> },
    { key: 'isAnonymous', label: 'Anonymous', render: (item: Record<string, unknown>) => item.isAnonymous ? 'Yes' : 'No' },
    {
      key: 'actions', label: '',
      render: (item: Record<string, unknown>) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(String(item.id)); }}
          isLoading={deleting === String(item.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
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
        <h1 className="text-2xl font-heading font-bold text-earth-800">Donations</h1>
        <Card padding="sm" className="bg-tea-50 border-tea-200">
          <p className="text-sm text-tea-700">Total: <span className="font-bold">{formattedTotal}</span></p>
        </Card>
      </div>
      <DataTable columns={columns} data={donations as unknown as Record<string, unknown>[]} keyField="id" />
    </div>
  );
}
