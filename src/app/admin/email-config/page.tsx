'use client';

import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, type SiteConfig } from '@/lib/services/siteConfig';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Info } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

export default function EmailConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [contactFormEnabled, setContactFormEnabled] = useState(true);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getSiteConfig();
        setRecipientEmail(config.contactFormRecipient || 'dfwassamese@gmail.com');
        setResendApiKey(config.resendApiKey || '');
        setContactFormEnabled(config.contactFormEnabled !== false);
      } catch {
        toast.error('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Partial<SiteConfig> = {
        contactFormRecipient: recipientEmail.trim() || 'dfwassamese@gmail.com',
        contactFormEnabled,
      };
      if (resendApiKey.trim()) {
        updates.resendApiKey = resendApiKey.trim();
      }
      await updateSiteConfig(updates);
      toast.success('Email settings saved.');
    } catch {
      toast.error('Failed to save settings.');
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-earth-800">Email Configuration</h1>
        <Button onClick={() => setShowSaveConfirm(true)} isLoading={saving}>Save Settings</Button>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Contact Form Toggle */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-semibold text-earth-800">Contact Form</h2>
              <p className="text-sm text-earth-500 mt-1">
                Enable or disable the contact form on the public website. When disabled, visitors will see a message
                that the contact service is temporarily unavailable.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={contactFormEnabled}
                onChange={(e) => setContactFormEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-earth-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gamosa-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gamosa-500" />
            </label>
          </div>
        </Card>

        {/* Recipient Email */}
        <Card>
          <h2 className="text-lg font-heading font-semibold text-earth-800 mb-1">Recipient Email</h2>
          <p className="text-sm text-earth-500 mb-4">
            The email address where contact form submissions will be sent. When someone fills out the Contact Us
            form on the website, the message will be delivered to this email address.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> On Resend&apos;s free tier, the recipient email must be the <strong>same email address</strong> you used to sign up at resend.com. Emails to other addresses will not be delivered until you verify a custom domain.
            </p>
          </div>
          <Input
            label="Recipient Email Address"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="dfwassamese@gmail.com"
            helperText="Default: dfwassamese@gmail.com"
          />
        </Card>

        {/* Resend API Key */}
        <Card>
          <h2 className="text-lg font-heading font-semibold text-earth-800 mb-1">Resend API Key</h2>
          <div className="bg-earth-50 border border-earth-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-gamosa-500 shrink-0 mt-0.5" />
              <div className="text-sm text-earth-600 space-y-2">
                <p>
                  <strong>Resend</strong> is a free email delivery service that sends the contact form messages
                  to your recipient email automatically. Without this key, messages are still saved and viewable
                  in the <strong>Admin &gt; Messages</strong> section, but no email notification will be sent.
                </p>
                <p><strong>How to get a Resend API key:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Go to <a href="https://resend.com/signup" target="_blank" rel="noopener noreferrer" className="text-gamosa-600 underline hover:text-gamosa-700">resend.com/signup</a> and create a free account</li>
                  <li>Once logged in, click <strong>API Keys</strong> in the left sidebar</li>
                  <li>Click <strong>Create API Key</strong>, name it (e.g. &quot;assam-website&quot;)</li>
                  <li>Set permission to <strong>Sending access</strong></li>
                  <li>Copy the key (starts with <code className="bg-earth-100 px-1 rounded">re_...</code>) and paste it below</li>
                </ol>
                <p className="text-earth-500">
                  Free tier: 100 emails/day, 3,000 emails/month. No credit card required.
                </p>
              </div>
            </div>
          </div>
          <Input
            label="API Key"
            type="password"
            value={resendApiKey}
            onChange={(e) => setResendApiKey(e.target.value)}
            placeholder="re_xxxxxxxx_xxxxxxxxxxxxxxxxxxxx"
            helperText="Stored securely. Leave empty to keep the existing key unchanged."
          />
        </Card>
      </div>
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); handleSave(); }}
        title="Save Email Settings"
        message="Are you sure you want to save the email configuration?"
        confirmLabel="Save"
        confirmVariant="primary"
      />
    </div>
  );
}
