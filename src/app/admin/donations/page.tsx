'use client';

import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, type SiteConfig } from '@/lib/services/siteConfig';
import { getAllDonationEvents, createDonationEvent, updateDonationEvent, deleteDonationEvent, ensureDefaultDonationEvent, DEFAULT_DONATION_EVENT, type DonationEventWithId } from '@/lib/services/donationEvents';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2, X, Info, Star } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

type EventForm = {
  title: string;
  description: string;
  goal: string;
  amounts: string;
  isActive: boolean;
};

const emptyForm: EventForm = {
  title: '',
  description: '',
  goal: '0',
  amounts: '25, 50, 100, 250',
  isActive: false,
};

export default function AdminDonationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [donationsEnabled, setDonationsEnabled] = useState(true);
  const [paypalEmail, setPaypalEmail] = useState('');

  const [events, setEvents] = useState<DonationEventWithId[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [savingEvent, setSavingEvent] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showSaveSettingsConfirm, setShowSaveSettingsConfirm] = useState(false);
  const [showSaveEventConfirm, setShowSaveEventConfirm] = useState(false);

  const fetchData = async () => {
    try {
      await ensureDefaultDonationEvent();
      const [config, evts] = await Promise.all([
        getSiteConfig(),
        getAllDonationEvents(),
      ]);
      setDonationsEnabled(config.donationsEnabled !== false);
      setPaypalEmail(config.paypalEmail || '');
      setEvents(evts);
    } catch {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSiteConfig({
        donationsEnabled,
        paypalEmail: paypalEmail.trim() || undefined,
      });
      toast.success('Settings saved.');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const openNewForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (evt: DonationEventWithId) => {
    setEditingId(evt.id);
    setForm({
      title: evt.title,
      description: evt.description,
      goal: String(evt.goal || 0),
      amounts: (evt.amounts || []).join(', '),
      isActive: evt.isActive,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSaveEvent = async () => {
    setSavingEvent(true);
    try {
      const amounts = form.amounts
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n) && n > 0);

      const payload = {
        title: form.title.trim() || DEFAULT_DONATION_EVENT.title,
        description: form.description.trim() || DEFAULT_DONATION_EVENT.description,
        goal: parseInt(form.goal) || 0,
        amounts: amounts.length > 0 ? amounts : DEFAULT_DONATION_EVENT.amounts,
        isActive: form.isActive,
      };

      // If setting this one active, deactivate others
      if (payload.isActive) {
        for (const evt of events) {
          if (evt.isActive && evt.id !== editingId) {
            await updateDonationEvent(evt.id, { isActive: false });
          }
        }
      }

      if (editingId) {
        await updateDonationEvent(editingId, payload);
        toast.success('Donation event updated.');
      } else {
        await createDonationEvent(payload);
        toast.success('Donation event created.');
      }

      closeForm();
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save donation event.');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      for (const evt of events) {
        if (evt.isActive) await updateDonationEvent(evt.id, { isActive: false });
      }
      await updateDonationEvent(id, { isActive: true });
      toast.success('Active donation event updated.');
      await fetchData();
    } catch {
      toast.error('Failed to update.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDonationEvent(id);
      toast.success('Donation event deleted.');
      setDeleteTarget(null);
      await fetchData();
    } catch {
      toast.error('Failed to delete.');
    }
  };

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
        <Button onClick={() => setShowSaveSettingsConfirm(true)} isLoading={saving}>Save Settings</Button>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable + PayPal */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-semibold text-earth-800">Donations</h2>
                <p className="text-sm text-earth-500 mt-1">Enable or disable the donation page.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                <input type="checkbox" checked={donationsEnabled} onChange={(e) => setDonationsEnabled(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-earth-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gamosa-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gamosa-500" />
              </label>
            </div>
          </Card>

          <Card>
            <h2 className="font-heading font-semibold text-earth-800 mb-2">PayPal Email</h2>
            <Input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="your-paypal@email.com"
              helperText="Email linked to your PayPal account where donations are sent"
            />
          </Card>
        </div>

        {/* Donation Events */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading font-semibold text-earth-800">Donation Events</h2>
            <p className="text-sm text-earth-500 mt-1">Create campaigns with custom titles, descriptions, goals, and amounts. The active event is shown on the donate page.</p>
          </div>
          {!showForm && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openNewForm} size="sm">
              New Event
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-earth-800">{editingId ? 'Edit Donation Event' : 'New Donation Event'}</h3>
              <button onClick={closeForm} className="text-earth-400 hover:text-earth-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <Input
                label="Title (optional)"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Bihu 2025 Fundraiser"
                helperText={`Default: ${DEFAULT_DONATION_EVENT.title}`}
              />
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Description (optional)</label>
                <RichTextEditor content={form.description} onChange={(html) => setForm(f => ({ ...f, description: html }))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Goal ($, optional)"
                  type="number"
                  value={form.goal}
                  onChange={(e) => setForm(f => ({ ...f, goal: e.target.value }))}
                  helperText="Set to 0 to hide goal"
                />
                <Input
                  label="Donation Amounts"
                  value={form.amounts}
                  onChange={(e) => setForm(f => ({ ...f, amounts: e.target.value }))}
                  helperText="Comma-separated, e.g. 25, 50, 100, 250"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                <span className="text-sm text-earth-700">Set as active donation event (shown on website)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={() => setShowSaveEventConfirm(true)} isLoading={savingEvent}>{editingId ? 'Update' : 'Create'}</Button>
              <Button variant="ghost" onClick={closeForm}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-earth-500">No donation events yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map(evt => (
              <Card key={evt.id} padding="sm" className="flex items-start gap-4">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-earth-800 truncate">{evt.title}</h3>
                    {evt.isActive && <Badge variant="tea">Active</Badge>}
                  </div>
                  <p className="text-xs text-earth-500 mt-0.5 line-clamp-2 whitespace-pre-line">{evt.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-earth-400">
                    {evt.goal > 0 && <span>Goal: ${evt.goal.toLocaleString()}</span>}
                    <span>Amounts: {(evt.amounts || []).map(a => `$${a}`).join(', ') || 'Default'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!evt.isActive && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetActive(evt.id)} title="Set as active">
                      <Star className="h-4 w-4 text-muga-500" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openEditForm(evt)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!evt.isActive && evt.title !== DEFAULT_DONATION_EVENT.title && (
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(evt.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* PayPal Info */}
        <Card className="bg-earth-50 border-earth-200">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-gamosa-500 shrink-0 mt-0.5" />
            <div className="text-sm text-earth-600 space-y-1">
              <p><strong>How PayPal donations work:</strong></p>
              <p>Users click &quot;Donate with PayPal&quot; on the website, choose an amount, and are redirected to PayPal&apos;s secure page. Money goes directly to the PayPal account linked to the email above. Fee: 2.89% + $0.49 per transaction.</p>
            </div>
          </div>
        </Card>
      </div>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Donation Event"
        message="Are you sure you want to delete this donation event? This action cannot be undone."
        confirmLabel="Delete"
      />
      <ConfirmDialog
        isOpen={showSaveSettingsConfirm}
        onClose={() => setShowSaveSettingsConfirm(false)}
        onConfirm={() => { setShowSaveSettingsConfirm(false); handleSaveSettings(); }}
        title="Save Settings"
        message="Are you sure you want to save the donation settings?"
        confirmLabel="Save"
        confirmVariant="primary"
      />
      <ConfirmDialog
        isOpen={showSaveEventConfirm}
        onClose={() => setShowSaveEventConfirm(false)}
        onConfirm={() => { setShowSaveEventConfirm(false); handleSaveEvent(); }}
        title={editingId ? 'Update Donation Event' : 'Create Donation Event'}
        message={editingId ? 'Are you sure you want to update this donation event?' : 'Are you sure you want to create this donation event?'}
        confirmLabel={editingId ? 'Update' : 'Create'}
        confirmVariant="primary"
      />
    </div>
  );
}
