'use client';

import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, getStoredDefaults, ensureDefaultsStored, type SiteConfig } from '@/lib/services/siteConfig';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Spinner } from '@/components/ui/Spinner';
import { RotateCcw } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

const aboutFields: (keyof SiteConfig)[] = [
  'aboutTitle', 'aboutDescription', 'aboutStoryTitle', 'aboutStoryParagraph1', 'aboutStoryParagraph2', 'aboutMission',
  'aboutValue1Title', 'aboutValue1Description', 'aboutValue2Title', 'aboutValue2Description',
  'aboutValue3Title', 'aboutValue3Description', 'aboutValue4Title', 'aboutValue4Description',
];

export default function AdminAboutPage() {
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
    for (const field of aboutFields) {
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
      for (const field of aboutFields) {
        (updates as unknown as Record<string, unknown>)[field] = (config as unknown as Record<string, unknown>)[field];
      }
      await updateSiteConfig(updates);
      toast.success('About page settings saved');
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
        <h1 className="text-2xl font-heading font-bold text-earth-800">About Page</h1>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Page Title"
              value={config.aboutTitle || ''}
              onChange={(e) => handleChange('aboutTitle', e.target.value)}
              placeholder="e.g. About Us"
              helperText={defaults?.aboutTitle ? `Default: ${defaults.aboutTitle}` : undefined}
            />
            <Input
              label="Page Description"
              value={config.aboutDescription || ''}
              onChange={(e) => handleChange('aboutDescription', e.target.value)}
              placeholder="Short description under the page header"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-heading font-semibold text-earth-800 mb-4">Our Story</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Story Section Title"
              value={config.aboutStoryTitle || ''}
              onChange={(e) => handleChange('aboutStoryTitle', e.target.value)}
              placeholder="e.g. Our Story"
            />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Story Paragraph 1</label>
              <RichTextEditor content={config.aboutStoryParagraph1 || ''} onChange={(html) => handleChange('aboutStoryParagraph1', html)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Story Paragraph 2</label>
              <RichTextEditor content={config.aboutStoryParagraph2 || ''} onChange={(html) => handleChange('aboutStoryParagraph2', html)} />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-heading font-semibold text-earth-800 mb-4">Mission Statement</h2>
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Mission</label>
            <RichTextEditor content={config.aboutMission || ''} onChange={(html) => handleChange('aboutMission', html)} />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-heading font-semibold text-earth-800 mb-4">Values</h2>
          <p className="text-sm text-earth-500 mb-4">4 cards shown on the About page</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Value 1 Title" value={config.aboutValue1Title || ''} onChange={(e) => handleChange('aboutValue1Title', e.target.value)} />
            <Input label="Value 1 Description" value={config.aboutValue1Description || ''} onChange={(e) => handleChange('aboutValue1Description', e.target.value)} />
            <Input label="Value 2 Title" value={config.aboutValue2Title || ''} onChange={(e) => handleChange('aboutValue2Title', e.target.value)} />
            <Input label="Value 2 Description" value={config.aboutValue2Description || ''} onChange={(e) => handleChange('aboutValue2Description', e.target.value)} />
            <Input label="Value 3 Title" value={config.aboutValue3Title || ''} onChange={(e) => handleChange('aboutValue3Title', e.target.value)} />
            <Input label="Value 3 Description" value={config.aboutValue3Description || ''} onChange={(e) => handleChange('aboutValue3Description', e.target.value)} />
            <Input label="Value 4 Title" value={config.aboutValue4Title || ''} onChange={(e) => handleChange('aboutValue4Title', e.target.value)} />
            <Input label="Value 4 Description" value={config.aboutValue4Description || ''} onChange={(e) => handleChange('aboutValue4Description', e.target.value)} />
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); handleSave(); }}
        title="Save About Page"
        message="Are you sure you want to save the About page settings?"
        confirmLabel="Save"
        confirmVariant="primary"
      />
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset About Page"
        message="Reset all About page fields to defaults? You will still need to click Save to apply."
        confirmLabel="Reset"
      />
    </div>
  );
}
