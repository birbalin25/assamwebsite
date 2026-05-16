'use client';

import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, getStoredDefaults, ensureDefaultsStored, type SiteConfig } from '@/lib/services/siteConfig';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { RotateCcw } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

type SectionKey = 'identity' | 'social';

const sectionFields: Record<SectionKey, (keyof SiteConfig)[]> = {
  identity: ['siteName', 'siteTagline', 'contactEmail', 'contactPhone', 'siteLogo'],
  social: ['facebookUrl', 'instagramUrl', 'youtubeUrl'],
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [defaults, setDefaults] = useState<SiteConfig | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [resetSectionTarget, setResetSectionTarget] = useState<SectionKey | null>(null);

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

  const handleChange = (field: keyof SiteConfig, value: string | number) => {
    setConfig((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleResetSection = (section: SectionKey) => {
    if (!defaults || !config) return;
    const fields = sectionFields[section];
    const updates: Partial<SiteConfig> = {};
    for (const field of fields) {
      (updates as unknown as Record<string, unknown>)[field] = (defaults as unknown as Record<string, unknown>)[field] ?? '';
    }
    setConfig(prev => prev ? { ...prev, ...updates } : prev);
    setResetSectionTarget(null);
    toast.success('Section reset to defaults. Click "Save Settings" to apply.');
  };

  const handleResetAll = () => {
    if (!defaults) return;
    setConfig({ ...defaults });
    setShowResetAllConfirm(false);
    toast.success('All settings reset to defaults. Click "Save Settings" to apply.');
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await updateSiteConfig(config);
      toast.success('Settings saved successfully');
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
        <h1 className="text-2xl font-heading font-bold text-earth-800">Settings</h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setShowResetAllConfirm(true)} leftIcon={<RotateCcw className="h-4 w-4" />}>
            Reset All
          </Button>
          <Button onClick={() => setShowSaveConfirm(true)} isLoading={saving}>
            Save Settings
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Site Identity */}
        <Card>
          <SectionHeader title="Site Identity" section="identity" onReset={setResetSectionTarget} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Site Name"
              value={config.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              helperText={defaults ? `Default: ${defaults.siteName}` : undefined}
            />
            <Input
              label="Tagline"
              value={config.siteTagline}
              onChange={(e) => handleChange('siteTagline', e.target.value)}
            />
            <Input
              label="Contact Email"
              type="email"
              value={config.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
            />
            <Input
              label="Contact Phone"
              type="tel"
              value={config.contactPhone || ''}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
            />
            <div className="sm:col-span-2">
              <FileUploadField
                label="Site Logo"
                value={config.siteLogo || ''}
                onChange={(url) => handleChange('siteLogo', url)}
                type="image"
                storagePath="site/logo"
                helperText="Logo image shown in the navbar, footer, and admin sidebar. Default: circular 'A' icon. Remove the image to revert to default."
              />
            </div>
          </div>
        </Card>

        {/* Section: Social Links */}
        <Card>
          <SectionHeader title="Social Links" section="social" onReset={setResetSectionTarget} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Facebook URL"
              type="url"
              value={config.facebookUrl || ''}
              onChange={(e) => handleChange('facebookUrl', e.target.value)}
              helperText={defaults?.facebookUrl ? `Default: ${defaults.facebookUrl}` : undefined}
            />
            <Input
              label="Instagram URL"
              type="url"
              value={config.instagramUrl || ''}
              onChange={(e) => handleChange('instagramUrl', e.target.value)}
              helperText={defaults?.instagramUrl ? `Default: ${defaults.instagramUrl}` : undefined}
            />
            <Input
              label="YouTube URL"
              type="url"
              value={config.youtubeUrl || ''}
              onChange={(e) => handleChange('youtubeUrl', e.target.value)}
              helperText={defaults?.youtubeUrl ? `Default: ${defaults.youtubeUrl}` : undefined}
            />
          </div>
        </Card>
      </div>
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); handleSave(); }}
        title="Save Settings"
        message="Are you sure you want to save all settings?"
        confirmLabel="Save"
        confirmVariant="primary"
      />
      <ConfirmDialog
        isOpen={showResetAllConfirm}
        onClose={() => setShowResetAllConfirm(false)}
        onConfirm={handleResetAll}
        title="Reset All Settings"
        message="Reset ALL settings to defaults? This will overwrite all your changes. You will still need to click Save to apply."
        confirmLabel="Reset All"
      />
      <ConfirmDialog
        isOpen={!!resetSectionTarget}
        onClose={() => setResetSectionTarget(null)}
        onConfirm={() => resetSectionTarget && handleResetSection(resetSectionTarget)}
        title="Reset Section"
        message="Reset this section to defaults? Your current values will be overwritten. You will still need to click Save to apply."
        confirmLabel="Reset"
      />
    </div>
  );
}

function SectionHeader({ title, section, onReset }: { title: string; section: SectionKey; onReset: (s: SectionKey) => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-heading font-semibold text-earth-800">{title}</h2>
      <button
        type="button"
        onClick={() => onReset(section)}
        className="flex items-center gap-1.5 text-xs text-earth-500 hover:text-gamosa-600 transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset to Default
      </button>
    </div>
  );
}
