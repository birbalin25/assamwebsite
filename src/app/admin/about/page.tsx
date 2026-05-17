'use client';

import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, getStoredDefaults, ensureDefaultsStored, DEFAULT_SITE_CONFIG, type SiteConfig } from '@/lib/services/siteConfig';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Spinner } from '@/components/ui/Spinner';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

interface ValueItem {
  title: string;
  description: string;
}

const defaultValues: ValueItem[] = [
  { title: DEFAULT_SITE_CONFIG.aboutValue1Title!, description: DEFAULT_SITE_CONFIG.aboutValue1Description! },
  { title: DEFAULT_SITE_CONFIG.aboutValue2Title!, description: DEFAULT_SITE_CONFIG.aboutValue2Description! },
  { title: DEFAULT_SITE_CONFIG.aboutValue3Title!, description: DEFAULT_SITE_CONFIG.aboutValue3Description! },
  { title: DEFAULT_SITE_CONFIG.aboutValue4Title!, description: DEFAULT_SITE_CONFIG.aboutValue4Description! },
];

function parseValues(config: SiteConfig): ValueItem[] {
  if (config.aboutValues) {
    try {
      const parsed = JSON.parse(config.aboutValues);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* fall through */ }
  }
  // Fallback to legacy fields
  const legacy: ValueItem[] = [];
  if (config.aboutValue1Title) legacy.push({ title: config.aboutValue1Title, description: config.aboutValue1Description || '' });
  if (config.aboutValue2Title) legacy.push({ title: config.aboutValue2Title, description: config.aboutValue2Description || '' });
  if (config.aboutValue3Title) legacy.push({ title: config.aboutValue3Title, description: config.aboutValue3Description || '' });
  if (config.aboutValue4Title) legacy.push({ title: config.aboutValue4Title, description: config.aboutValue4Description || '' });
  return legacy.length > 0 ? legacy : defaultValues;
}

function getStoryContent(config: SiteConfig): string {
  if (config.aboutStoryContent) return config.aboutStoryContent;
  // Fallback: combine legacy paragraphs into HTML
  const p1 = config.aboutStoryParagraph1 || DEFAULT_SITE_CONFIG.aboutStoryParagraph1 || '';
  const p2 = config.aboutStoryParagraph2 || DEFAULT_SITE_CONFIG.aboutStoryParagraph2 || '';
  return `<p>${p1}</p>${p2 ? `<p>${p2}</p>` : ''}`;
}

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [defaults, setDefaults] = useState<SiteConfig | null>(null);
  const [storyContent, setStoryContent] = useState('');
  const [values, setValues] = useState<ValueItem[]>([]);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deleteValueIndex, setDeleteValueIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        await ensureDefaultsStored();
        const [data, defs] = await Promise.all([getSiteConfig(), getStoredDefaults()]);
        setConfig(data);
        setDefaults(defs);
        setStoryContent(getStoryContent(data));
        setValues(parseValues(data));
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
    if (!config) return;
    setConfig(prev => prev ? {
      ...prev,
      aboutTitle: DEFAULT_SITE_CONFIG.aboutTitle,
      aboutDescription: DEFAULT_SITE_CONFIG.aboutDescription,
      aboutStoryTitle: DEFAULT_SITE_CONFIG.aboutStoryTitle,
      aboutMission: DEFAULT_SITE_CONFIG.aboutMission,
    } : prev);
    setStoryContent(getStoryContent(DEFAULT_SITE_CONFIG));
    setValues(defaultValues);
    setShowResetConfirm(false);
    toast.success('Reset to defaults. Click "Save" to apply.');
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await updateSiteConfig({
        aboutTitle: config.aboutTitle,
        aboutDescription: config.aboutDescription,
        aboutStoryTitle: config.aboutStoryTitle,
        aboutStoryContent: storyContent,
        aboutMission: config.aboutMission,
        aboutValues: JSON.stringify(values),
      });
      toast.success('About page settings saved');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddValue = () => {
    setValues(prev => [...prev, { title: '', description: '' }]);
  };

  const handleUpdateValue = (index: number, field: 'title' | 'description', value: string) => {
    setValues(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handleDeleteValue = (index: number) => {
    setValues(prev => prev.filter((_, i) => i !== index));
    setDeleteValueIndex(null);
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
          <div className="space-y-4">
            <Input
              label="Story Section Title"
              value={config.aboutStoryTitle || ''}
              onChange={(e) => handleChange('aboutStoryTitle', e.target.value)}
              placeholder="e.g. Our Story"
            />
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Story Paragraph</label>
              <RichTextEditor content={storyContent} onChange={setStoryContent} />
              <p className="text-xs text-earth-400 mt-1">Use the editor to write multiple paragraphs. Press Enter to create new paragraphs.</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-heading font-semibold text-earth-800">Values</h2>
              <p className="text-sm text-earth-500 mt-0.5">Add, edit, or remove value cards shown on the About page</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddValue} leftIcon={<Plus className="h-4 w-4" />}>
              Add Value
            </Button>
          </div>
          {values.length === 0 ? (
            <p className="text-sm text-earth-400 text-center py-8">No values added. Click &quot;Add Value&quot; to get started.</p>
          ) : (
            <div className="space-y-4">
              {values.map((value, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-earth-50 rounded-lg border border-earth-200">
                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <Input
                      label={`Title`}
                      value={value.title}
                      onChange={(e) => handleUpdateValue(i, 'title', e.target.value)}
                      placeholder="e.g. Cultural Preservation"
                    />
                    <Input
                      label={`Description`}
                      value={value.description}
                      onChange={(e) => handleUpdateValue(i, 'description', e.target.value)}
                      placeholder="Short description of this value"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteValueIndex(i)}
                    className="mt-7 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Delete value"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
      <ConfirmDialog
        isOpen={deleteValueIndex !== null}
        onClose={() => setDeleteValueIndex(null)}
        onConfirm={() => { if (deleteValueIndex !== null) handleDeleteValue(deleteValueIndex); }}
        title="Delete Value"
        message="Are you sure you want to delete this value? Click Save to apply the change."
        confirmLabel="Delete"
      />
    </div>
  );
}
