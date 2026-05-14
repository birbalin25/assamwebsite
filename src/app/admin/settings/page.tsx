'use client';

import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, getStoredDefaults, ensureDefaultsStored, type SiteConfig } from '@/lib/services/siteConfig';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type SectionKey = 'identity' | 'about' | 'community' | 'highlights' | 'social';

const sectionFields: Record<SectionKey, (keyof SiteConfig)[]> = {
  identity: ['siteName', 'siteTagline', 'contactEmail', 'contactPhone', 'siteLogo'],
  about: ['aboutTitle', 'aboutDescription', 'aboutStoryTitle', 'aboutStoryParagraph1', 'aboutStoryParagraph2', 'aboutMission', 'aboutValue1Title', 'aboutValue1Description', 'aboutValue2Title', 'aboutValue2Description', 'aboutValue3Title', 'aboutValue3Description', 'aboutValue4Title', 'aboutValue4Description'],
  community: ['communityTitle', 'communityDescription', 'communityImage'],
  highlights: ['highlightPerformersTitle', 'highlightPerformersDescription', 'highlightCommunityTitle', 'highlightCommunityDescription'],
  social: ['facebookUrl', 'instagramUrl', 'youtubeUrl'],
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [defaults, setDefaults] = useState<SiteConfig | null>(null);

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
    if (!confirm(`Reset this section to defaults? Your current values will be overwritten.`)) return;
    const fields = sectionFields[section];
    const updates: Partial<SiteConfig> = {};
    for (const field of fields) {
      (updates as unknown as Record<string, unknown>)[field] = (defaults as unknown as Record<string, unknown>)[field] ?? '';
    }
    setConfig(prev => prev ? { ...prev, ...updates } : prev);
    toast.success('Section reset to defaults. Click "Save Settings" to apply.');
  };

  const handleResetAll = () => {
    if (!defaults) return;
    if (!confirm('Reset ALL settings to defaults? This will overwrite all your changes.')) return;
    setConfig({ ...defaults });
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
          <Button variant="ghost" onClick={handleResetAll} leftIcon={<RotateCcw className="h-4 w-4" />}>
            Reset All
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Save Settings
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Site Identity */}
        <Card>
          <SectionHeader title="Site Identity" section="identity" onReset={handleResetSection} />
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

        {/* Section: About Page */}
        <Card>
          <SectionHeader title="About Page" section="about" onReset={handleResetSection} />
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
            <div className="sm:col-span-2 border-t border-earth-200 pt-4 mt-2">
              <p className="text-sm font-medium text-earth-700 mb-3">Our Story</p>
            </div>
            <Input
              label="Story Section Title"
              value={config.aboutStoryTitle || ''}
              onChange={(e) => handleChange('aboutStoryTitle', e.target.value)}
              placeholder="e.g. Our Story"
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Story Paragraph 1"
                value={config.aboutStoryParagraph1 || ''}
                onChange={(e) => handleChange('aboutStoryParagraph1', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Story Paragraph 2"
                value={config.aboutStoryParagraph2 || ''}
                onChange={(e) => handleChange('aboutStoryParagraph2', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 border-t border-earth-200 pt-4 mt-2">
              <p className="text-sm font-medium text-earth-700 mb-3">Mission Statement</p>
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Mission"
                value={config.aboutMission || ''}
                onChange={(e) => handleChange('aboutMission', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 border-t border-earth-200 pt-4 mt-2">
              <p className="text-sm font-medium text-earth-700 mb-3">Values (4 cards shown on the About page)</p>
            </div>
            <Input
              label="Value 1 Title"
              value={config.aboutValue1Title || ''}
              onChange={(e) => handleChange('aboutValue1Title', e.target.value)}
            />
            <Input
              label="Value 1 Description"
              value={config.aboutValue1Description || ''}
              onChange={(e) => handleChange('aboutValue1Description', e.target.value)}
            />
            <Input
              label="Value 2 Title"
              value={config.aboutValue2Title || ''}
              onChange={(e) => handleChange('aboutValue2Title', e.target.value)}
            />
            <Input
              label="Value 2 Description"
              value={config.aboutValue2Description || ''}
              onChange={(e) => handleChange('aboutValue2Description', e.target.value)}
            />
            <Input
              label="Value 3 Title"
              value={config.aboutValue3Title || ''}
              onChange={(e) => handleChange('aboutValue3Title', e.target.value)}
            />
            <Input
              label="Value 3 Description"
              value={config.aboutValue3Description || ''}
              onChange={(e) => handleChange('aboutValue3Description', e.target.value)}
            />
            <Input
              label="Value 4 Title"
              value={config.aboutValue4Title || ''}
              onChange={(e) => handleChange('aboutValue4Title', e.target.value)}
            />
            <Input
              label="Value 4 Description"
              value={config.aboutValue4Description || ''}
              onChange={(e) => handleChange('aboutValue4Description', e.target.value)}
            />
          </div>
        </Card>

        {/* Section: Community Page */}
        <Card>
          <SectionHeader title="Community Page" section="community" onReset={handleResetSection} />
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
              <Textarea
                label="Page Description"
                value={config.communityDescription || ''}
                onChange={(e) => handleChange('communityDescription', e.target.value)}
                placeholder="Description shown below the community page header..."
              />
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


        {/* Section: Community Highlights */}
        <Card>
          <SectionHeader title="Community Highlights" section="highlights" onReset={handleResetSection} />
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
            <Textarea
              label="Performers Section Description"
              value={config.highlightPerformersDescription}
              onChange={(e) => handleChange('highlightPerformersDescription', e.target.value)}
            />
            <Textarea
              label="Community Section Description"
              value={config.highlightCommunityDescription}
              onChange={(e) => handleChange('highlightCommunityDescription', e.target.value)}
            />
          </div>
        </Card>

        {/* Section: Social Links */}
        <Card>
          <SectionHeader title="Social Links" section="social" onReset={handleResetSection} />
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
