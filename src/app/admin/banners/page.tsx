'use client';

import { useState, useEffect } from 'react';
import { getAllBanners, createBanner, updateBanner, deleteBanner, ensureDefaultBanners, DEFAULT_BANNERS } from '@/lib/services/banners';
import { getSiteConfig, updateSiteConfig } from '@/lib/services/siteConfig';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, RotateCcw } from 'lucide-react';
import type { Banner, WithId } from '@/types';
import Image from 'next/image';

type BannerFormData = {
  title: string;
  description: string;
  lang: 'en' | 'as';
  image: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  isActive: boolean;
  titleOffsetTop: number;
  titleOffsetLeft: number;
  descOffsetTop: number;
  descOffsetLeft: number;
  dividerOffsetTop: number;
  dividerOffsetLeft: number;
  showTitle: boolean;
  showDescription: boolean;
  showDivider: boolean;
};

const emptyForm: BannerFormData = {
  title: '',
  description: '',
  lang: 'en',
  image: '',
  ctaText: '',
  ctaLink: '',
  order: 0,
  isActive: true,
  titleOffsetTop: 0,
  titleOffsetLeft: 0,
  descOffsetTop: 0,
  descOffsetLeft: 0,
  dividerOffsetTop: 0,
  dividerOffsetLeft: 0,
  showTitle: true,
  showDescription: true,
  showDivider: false,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<WithId<Banner>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerFormData>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [transitionInterval, setTransitionInterval] = useState(15);
  const [savingInterval, setSavingInterval] = useState(false);

  const fetchBanners = async () => {
    try {
      await ensureDefaultBanners();
      const [data, config] = await Promise.all([
        getAllBanners(),
        getSiteConfig(),
      ]);
      setBanners(data);
      if (config.bannerTransitionInterval && config.bannerTransitionInterval > 0) {
        setTransitionInterval(config.bannerTransitionInterval);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      order: banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 1,
    });
    setShowForm(true);
  };

  const openEditForm = (banner: WithId<Banner>) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      description: banner.description || '',
      lang: banner.lang || 'en',
      image: banner.image,
      ctaText: banner.ctaText || '',
      ctaLink: banner.ctaLink || '',
      order: banner.order,
      isActive: banner.isActive,
      titleOffsetTop: banner.titleOffset?.top ?? 0,
      titleOffsetLeft: banner.titleOffset?.left ?? 0,
      descOffsetTop: banner.descriptionOffset?.top ?? 0,
      descOffsetLeft: banner.descriptionOffset?.left ?? 0,
      dividerOffsetTop: banner.dividerOffset?.top ?? 0,
      dividerOffsetLeft: banner.dividerOffset?.left ?? 0,
      showTitle: banner.showTitle !== false,
      showDescription: banner.showDescription !== false,
      showDivider: banner.showDivider === true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!form.image.trim()) {
      toast.error('Image is required');
      return;
    }

    setSaving(true);
    try {
      const titleOffset = (form.titleOffsetTop || form.titleOffsetLeft)
        ? { top: form.titleOffsetTop || undefined, left: form.titleOffsetLeft || undefined }
        : undefined;
      const descriptionOffset = (form.descOffsetTop || form.descOffsetLeft)
        ? { top: form.descOffsetTop || undefined, left: form.descOffsetLeft || undefined }
        : undefined;
      const dividerOffset = (form.dividerOffsetTop || form.dividerOffsetLeft)
        ? { top: form.dividerOffsetTop || undefined, left: form.dividerOffsetLeft || undefined }
        : undefined;

      const payload: Omit<Banner, 'createdAt' | 'updatedAt'> = {
        title: form.title.trim(),
        description: form.description.trim(),
        lang: form.lang,
        image: form.image.trim(),
        ctaText: form.ctaText.trim() || undefined,
        ctaLink: form.ctaLink.trim() || undefined,
        titleOffset,
        descriptionOffset,
        dividerOffset,
        showTitle: form.showTitle,
        showDescription: form.showDescription,
        showDivider: form.showDivider,
        order: form.order,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateBanner(editingId, payload);
        toast.success('Banner updated');
      } else {
        await createBanner(payload);
        toast.success('Banner created');
      }

      closeForm();
      await fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error(editingId ? 'Failed to update banner' : 'Failed to create banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBanner(id);
      toast.success('Banner deleted');
      setDeleteConfirmId(null);
      await fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete banner');
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('This will delete all current banners and restore the 2 original defaults. Are you sure?')) return;
    setSaving(true);
    try {
      // Delete all existing banners
      for (const banner of banners) {
        await deleteBanner(banner.id);
      }
      // Re-create defaults
      for (const banner of DEFAULT_BANNERS) {
        await createBanner(banner);
      }
      toast.success('Banners reset to defaults');
      await fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reset banners');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInterval = async () => {
    setSavingInterval(true);
    try {
      await updateSiteConfig({ bannerTransitionInterval: transitionInterval });
      toast.success('Transition interval saved');
    } catch {
      toast.error('Failed to save interval');
    } finally {
      setSavingInterval(false);
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
        <h1 className="text-2xl font-heading font-bold text-earth-800">Homepage Banners</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleResetToDefaults} leftIcon={<RotateCcw className="h-4 w-4" />} disabled={saving}>
            Reset to Defaults
          </Button>
          {!showForm && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openNewForm}>
              New Banner
            </Button>
          )}
        </div>
      </div>

      {/* Transition Interval */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Slide Transition Interval (seconds)"
              type="number"
              value={transitionInterval}
              onChange={(e) => setTransitionInterval(Math.max(1, parseInt(e.target.value) || 15))}
              helperText="How many seconds each banner is shown before switching. Default: 15"
            />
          </div>
          <Button onClick={handleSaveInterval} isLoading={savingInterval} size="sm">
            Save Interval
          </Button>
        </div>
      </Card>

      {/* Banner Form */}
      {showForm && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-earth-800">
              {editingId ? 'Edit Banner' : 'New Banner'}
            </h2>
            <button onClick={closeForm} className="text-earth-400 hover:text-earth-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Assam in Dallas"
            />
            <Select
              label="Language"
              value={form.lang}
              onChange={e => setForm(f => ({ ...f, lang: e.target.value as 'en' | 'as' }))}
              options={[
                { value: 'en', label: 'English' },
                { value: 'as', label: 'Assamese' },
              ]}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Banner description text..."
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <FileUploadField
                label="Banner Image"
                value={form.image}
                onChange={(url) => setForm(f => ({ ...f, image: url }))}
                type="image"
                storagePath="banners"
                helperText="Upload an image or paste a URL (e.g. /images/banners/bg-1.png)"
              />
            </div>
            <Input
              label="CTA Text (optional)"
              value={form.ctaText}
              onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))}
              placeholder="e.g. Learn More"
            />
            <Input
              label="CTA Link (optional)"
              value={form.ctaLink}
              onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))}
              placeholder="e.g. /events"
            />
            <div className="md:col-span-2 border-t border-earth-200 pt-4 mt-2">
              <p className="text-sm font-medium text-earth-700 mb-3">Visibility</p>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showTitle} onChange={e => setForm(f => ({ ...f, showTitle: e.target.checked }))} className="h-4 w-4 rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                  <span className="text-sm text-earth-700">Show Title</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showDivider} onChange={e => setForm(f => ({ ...f, showDivider: e.target.checked }))} className="h-4 w-4 rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                  <span className="text-sm text-earth-700">Show Divider Line</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showDescription} onChange={e => setForm(f => ({ ...f, showDescription: e.target.checked }))} className="h-4 w-4 rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500" />
                  <span className="text-sm text-earth-700">Show Description</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2 border-t border-earth-200 pt-4 mt-2">
              <p className="text-sm font-medium text-earth-700 mb-3">Title Position Offset (inches)</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Up/Down"
                  type="number"
                  value={form.titleOffsetTop}
                  onChange={e => setForm(f => ({ ...f, titleOffsetTop: parseFloat(e.target.value) || 0 }))}
                  helperText="Positive = down, Negative = up"
                />
                <Input
                  label="Left/Right"
                  type="number"
                  value={form.titleOffsetLeft}
                  onChange={e => setForm(f => ({ ...f, titleOffsetLeft: parseFloat(e.target.value) || 0 }))}
                  helperText="Positive = right, Negative = left"
                />
              </div>
            </div>
            <div className="md:col-span-2 border-t border-earth-200 pt-4">
              <p className="text-sm font-medium text-earth-700 mb-3">Description Position Offset (inches)</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Up/Down"
                  type="number"
                  value={form.descOffsetTop}
                  onChange={e => setForm(f => ({ ...f, descOffsetTop: parseFloat(e.target.value) || 0 }))}
                  helperText="Positive = down, Negative = up"
                />
                <Input
                  label="Left/Right"
                  type="number"
                  value={form.descOffsetLeft}
                  onChange={e => setForm(f => ({ ...f, descOffsetLeft: parseFloat(e.target.value) || 0 }))}
                  helperText="Positive = right, Negative = left"
                />
              </div>
            </div>
            <div className="md:col-span-2 border-t border-earth-200 pt-4">
              <p className="text-sm font-medium text-earth-700 mb-3">Divider Line Position Offset (inches)</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Up/Down" type="number" value={form.dividerOffsetTop} onChange={e => setForm(f => ({ ...f, dividerOffsetTop: parseFloat(e.target.value) || 0 }))} helperText="Positive = down, Negative = up" />
                <Input label="Left/Right" type="number" value={form.dividerOffsetLeft} onChange={e => setForm(f => ({ ...f, dividerOffsetLeft: parseFloat(e.target.value) || 0 }))} helperText="Positive = right, Negative = left" />
              </div>
            </div>
            <Input
              label="Order"
              type="number"
              value={form.order}
              onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
            />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
                />
                <span className="text-sm font-medium text-earth-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <Button onClick={handleSave} isLoading={saving}>
              {editingId ? 'Update Banner' : 'Create Banner'}
            </Button>
            <Button variant="ghost" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Banners list */}
      {banners.length === 0 && !showForm ? (
        <Card className="text-center py-12">
          <p className="text-earth-500 mb-3">No banners yet.</p>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openNewForm}>
            Create Your First Banner
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map(banner => (
            <Card key={banner.id} className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-earth-100 border border-earth-200 shrink-0 relative">
                {banner.image ? (
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gamosa-100 to-muga-100" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-earth-800 truncate">{banner.title}</h3>
                <p className="text-xs text-earth-500 truncate max-w-md">
                  {banner.description || 'No description'}
                </p>
                <p className="text-xs text-earth-400 mt-0.5">Order: {banner.order}</p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={banner.lang === 'as' ? 'muga' : 'outline'}>
                  {banner.lang === 'as' ? 'Assamese' : 'English'}
                </Badge>
                <Badge variant={banner.isActive ? 'tea' : 'default'}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditForm(banner)}
                  aria-label="Edit banner"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                {deleteConfirmId === banner.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(banner.id)}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmId(banner.id)}
                    aria-label="Delete banner"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
