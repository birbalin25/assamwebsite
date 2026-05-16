'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { getMemberById, updateMember } from '@/lib/services/members';
import { DESIGNATION_OPTIONS } from '@/types/member';
import type { Member, MemberRole, WithId } from '@/types';

const allRoles: MemberRole[] = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Board Member', 'Volunteer', 'Member'];

export default function EditMemberPage() {
  const params = useParams<{ memberId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState<WithId<Member> | null>(null);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [showDesignation, setShowDesignation] = useState(true);
  const [designationMode, setDesignationMode] = useState<'preset' | 'custom'>('preset');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [joinedYear, setJoinedYear] = useState(new Date().getFullYear());
  const [roles, setRoles] = useState<MemberRole[]>(['Member']);
  const [profileImage, setProfileImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    async function fetchMember() {
      try {
        const data = await getMemberById(params.memberId);
        if (!data) {
          toast.error('Member not found.');
          router.push('/admin/members');
          return;
        }
        setMember(data);
        setName(data.name);
        const desig = data.designation || '';
        setDesignation(desig);
        setShowDesignation(data.showDesignation !== false);
        if (desig && !DESIGNATION_OPTIONS.includes(desig as typeof DESIGNATION_OPTIONS[number])) {
          setDesignationMode('custom');
        }
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setShowPhone(data.showPhone || false);
        setShowEmail(data.showEmail || false);
        setCity(data.location.city);
        setState(data.location.state);
        setJoinedYear(data.joinedYear);
        setRoles(data.roles);
        setProfileImage(data.profileImage || '');
        setIsPublished(data.isPublished);
        setIsActive(data.isActive);
      } catch {
        toast.error('Failed to load member.');
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [params.memberId, router]);

  const handleRoleToggle = (role: MemberRole) => {
    setRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }
    setSaving(true);
    try {
      await updateMember(params.memberId, {
        name: name.trim(),
        designation: designation.trim() || undefined,
        showDesignation,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        showPhone,
        showEmail,
        location: { city: city.trim(), state: state.trim() },
        joinedYear,
        roles: roles.length > 0 ? roles : ['Member'],
        profileImage: profileImage || undefined,
        isPublished,
        isActive,
      });
      toast.success('Member updated!');
      router.push('/admin/members');
    } catch {
      toast.error('Failed to update member.');
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

  if (!member) return null;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-earth-800 mb-6">Edit Member</h1>
      <div className="max-w-2xl space-y-6">
        <Card>
          <div className="space-y-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-earth-700">Designation</label>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setDesignationMode('preset')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${designationMode === 'preset' ? 'bg-gamosa-500 text-white border-gamosa-500' : 'text-earth-500 border-earth-300'}`}>Select</button>
                <button type="button" onClick={() => setDesignationMode('custom')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${designationMode === 'custom' ? 'bg-gamosa-500 text-white border-gamosa-500' : 'text-earth-500 border-earth-300'}`}>Custom</button>
              </div>
              {designationMode === 'preset' ? (
                <select value={designation} onChange={(e) => setDesignation(e.target.value)} className="block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500">
                  <option value="">None</option>
                  {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Enter custom designation..." className="block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500" />
              )}
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={showDesignation} onChange={(e) => setShowDesignation(e.target.checked)} className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
              <span className="text-sm text-earth-700">Show designation on website</span>
            </label>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="flex items-center gap-3 mt-1">
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
              />
              <span className="text-sm text-earth-700">Show email on website</span>
            </label>
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <label className="flex items-center gap-3 mt-1">
              <input
                type="checkbox"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
                className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
              />
              <span className="text-sm text-earth-700">Show phone number on website</span>
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <Input label="Joined Year" type="number" value={joinedYear} onChange={(e) => setJoinedYear(Number(e.target.value) || new Date().getFullYear())} />
          </div>
        </Card>

        <Card>
          <h2 className="font-heading font-semibold text-earth-800 mb-3">Roles</h2>
          <div className="flex flex-wrap gap-3">
            {allRoles.map((role) => (
              <label key={role} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
                />
                <span className="text-sm text-earth-700">{role}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <FileUploadField
            label="Profile Image"
            value={profileImage}
            onChange={setProfileImage}
            type="image"
            storagePath="members/profiles"
            helperText="Profile photo for this member"
          />
        </Card>

        <Card>
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
              />
              <span className="text-sm text-earth-700">Published</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
              />
              <span className="text-sm text-earth-700">Active</span>
            </label>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => setShowSaveConfirm(true)} isLoading={saving}>Update Member</Button>
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); handleSave(); }}
        title="Update Member"
        message="Are you sure you want to update this member?"
        confirmLabel="Update"
        confirmVariant="primary"
      />
    </div>
  );
}
