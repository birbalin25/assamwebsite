'use client';

import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, getStoredDefaults, ensureDefaultsStored, type SiteConfig } from '@/lib/services/siteConfig';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Spinner } from '@/components/ui/Spinner';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { RotateCcw } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

const communityFields: (keyof SiteConfig)[] = [
  'communityTitle', 'communityDescription', 'communityImage',
  'highlightPerformersTitle', 'highlightPerformersDescription',
  'highlightCommunityTitle', 'highlightCommunityDescription',
];

export default function AdminCommunityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [defaults, setDefaults] = useState<SiteConfig | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        await ensureDefaultsStored();
        const [data, defs] = await Promise.all([
          getSiteConfig(),
          getStoredDefaults(),
        ]);
        setConfig(data);
        setDefaults(defs);
      } catch (error) {
        console.error('Error loading config:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleChange = (field: keyof SiteConfig, value: string) => {
    setConfig((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleReset = () => {
    if (!defaults || !config) return;
    const updates: Partial<SiteConfig> = {};
    for (const field of communityFields) {
      (updates as unknown as Record<string, unknown>)[field] = (defaults as unknown as Record<string, unknown>)[field] ?? '';
    }
    setConfig(prev => prev ? { ...prev, ...updates } : prev);
    setShowResetConfirm(false);
    toast.success('Reset to defaults. Click "Save" to apply.');
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updates: Partial<SiteConfig> = {};
      for (const field of communityFields) {
        (updates as unknown as Record<string, unknown>)[field] = (config as unknown as Record<string, unknown>)[field];
      }
      await updateSiteConfig(updates);
      toast.success('Community settings saved');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save settings');
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

  if (!config) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-earth-800">Community Page</h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setShowResetConfirm(true)} leftIcon={<RotateCcw className="h-4 w-4" />}>
            Reset to Default
          </Button>
          <Button onClick={() => setShowSaveConfirm(true)} isLoading={saving}>
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-heading font-semibold text-earth-800 mb-4">Page Header</h2>
          <p className="text-sm text-earth-500 mb-4">Configure the title, description, and header image for the Community page.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Page Title"
              value={config.communityTitle || ''}
              onChange={(e) => handleChange('communityTitle', e.target.value)}
              placeholder="e.g. Community"
              helperText="Default: Community"
            />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Page Description</label>
              <RichTextEditor content={config.communityDescription || ''} onChange={(html) => handleChange('communityDescription', html)} />
            </div>
            <div className="sm:col-span-2">
              <FileUploadField
                label="Header Image"
                value={config.communityImage || ''}
                onChange={(url) => handleChange('communityImage', url)}
                type="image"
                storagePath="site/community"
                helperText="Banner image shown at the top of the Community page"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-heading font-semibold text-earth-800 mb-4">Community Highlights</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Performers Section Title"
              value={config.highlightPerformersTitle}
              onChange={(e) => handleChange('highlightPerformersTitle', e.target.value)}
              helperText={defaults ? `Default: ${defaults.highlightPerformersTitle}` : undefined}
            />
            <Input
              label="Community Section Title"
              value={config.highlightCommunityTitle}
              onChange={(e) => handleChange('highlightCommunityTitle', e.target.value)}
              helperText={defaults ? `Default: ${defaults.highlightCommunityTitle}` : undefined}
            />
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Performers Section Description</label>
              <RichTextEditor content={config.highlightPerformersDescription} onChange={(html) => handleChange('highlightPerformersDescription', html)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Community Section Description</label>
              <RichTextEditor content={config.highlightCommunityDescription} onChange={(html) => handleChange('highlightCommunityDescription', html)} />
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); handleSave(); }}
        title="Save Community Page"
        message="Are you sure you want to save the Community page settings?"
        confirmLabel="Save"
        confirmVariant="primary"
      />
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Community Page"
        message="Reset all Community page fields to defaults? You will still need to click Save to apply."
        confirmLabel="Reset"
      />
    </div>
  );
}
