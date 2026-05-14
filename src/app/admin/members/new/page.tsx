'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { createMember } from '@/lib/services/members';
import { DESIGNATION_OPTIONS } from '@/types/member';

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [designationMode, setDesignationMode] = useState<'preset' | 'custom'>('preset');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const name = formData.get('name') as string;
      const designation = designationMode === 'custom'
        ? (formData.get('customDesignation') as string) || undefined
        : (formData.get('designation') as string) || undefined;
      const showDesignation = !!formData.get('showDesignation');
      const email = (formData.get('email') as string) || undefined;
      const phone = (formData.get('phone') as string) || undefined;
      const city = (formData.get('city') as string) || '';
      const state = (formData.get('state') as string) || '';
      const joinedYear = Number(formData.get('joinedYear')) || new Date().getFullYear();
      const isPublished = !!formData.get('isPublished');
      const isActive = !!formData.get('isActive');
      const showPhone = !!formData.get('showPhone');
      const showEmail = !!formData.get('showEmail');

      await createMember({
        name,
        ...(designation && { designation }),
        showDesignation,
        ...(email && { email }),
        ...(phone && { phone }),
        showPhone,
        showEmail,
        family: [],
        roles: ['Member'],
        location: { city, state },
        joinedYear,
        isPublished,
        isActive,
      });

      toast.success('Member created!');
      router.push('/admin/members');
    } catch {
      toast.error('Failed to create member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-earth-800 mb-6">New Member</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <div className="space-y-4">
            <Input label="Full Name" name="name" required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-earth-700">Designation</label>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setDesignationMode('preset')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${designationMode === 'preset' ? 'bg-gamosa-500 text-white border-gamosa-500' : 'text-earth-500 border-earth-300'}`}>Select</button>
                <button type="button" onClick={() => setDesignationMode('custom')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${designationMode === 'custom' ? 'bg-gamosa-500 text-white border-gamosa-500' : 'text-earth-500 border-earth-300'}`}>Custom</button>
              </div>
              {designationMode === 'preset' ? (
                <select name="designation" className="block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500">
                  <option value="">None</option>
                  {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input name="customDesignation" placeholder="Enter custom designation..." className="block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500" />
              )}
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="showDesignation" defaultChecked className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
              <span className="text-sm text-earth-700">Show designation on website</span>
            </label>
            <Input label="Email" name="email" type="email" />
            <label className="flex items-center gap-3 mt-1">
              <input type="checkbox" name="showEmail" className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
              <span className="text-sm text-earth-700">Show email on website</span>
            </label>
            <Input label="Phone" name="phone" type="tel" />
            <label className="flex items-center gap-3 mt-1">
              <input type="checkbox" name="showPhone" className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
              <span className="text-sm text-earth-700">Show phone number on website</span>
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="City" name="city" />
              <Input label="State" name="state" />
            </div>
            <Input label="Joined Year" name="joinedYear" type="number" defaultValue={new Date().getFullYear()} />
            <div className="flex gap-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="isPublished" className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                <span className="text-sm text-earth-700">Published</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="isActive" defaultChecked className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                <span className="text-sm text-earth-700">Active</span>
              </label>
            </div>
          </div>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" isLoading={loading}>Save Member</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
