'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { contactFormSchema, type ContactFormData } from '@/lib/utils/validation';
import { submitContactMessage } from '@/lib/services/contactMessages';
import { getSiteConfig } from '@/lib/services/siteConfig';
import { toast } from 'sonner';
import { MessageSquareOff, CheckCircle2, Send } from 'lucide-react';

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  useEffect(() => {
    getSiteConfig().then(config => {
      setRecipientEmail(config.contactFormRecipient || config.contactEmail || '');
      setResendApiKey(config.resendApiKey || '');
      setFormEnabled(config.contactFormEnabled !== false);
    }).catch(() => {}).finally(() => setConfigLoading(false));
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      // Save to Firestore
      await submitContactMessage({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });

      // Send email via API
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          recipientEmail,
          resendApiKey,
        }),
      });

      reset();
      setSubmitted(true);
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) return null;

  if (!formEnabled) {
    return (
      <div className="text-center py-8">
        <MessageSquareOff className="h-12 w-12 text-earth-300 mx-auto mb-3" />
        <p className="text-earth-500 font-medium">Contact form is currently unavailable.</p>
        <p className="text-earth-400 text-sm mt-1">Please try again later or reach out to us directly via email.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-tea-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-tea-600" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-earth-800 mb-2">Message Sent!</h3>
        <p className="text-earth-500 mb-6 max-w-sm mx-auto">
          Thank you for reaching out. We&apos;ve received your message and will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gamosa-600 hover:text-gamosa-700 transition-colors"
        >
          <Send className="h-4 w-4" />
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Name" {...register('name')} error={errors.name?.message} placeholder="Your name" />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="your@email.com" />
      </div>
      <Input label="Subject" {...register('subject')} error={errors.subject?.message} placeholder="What's this about?" />
      <Textarea label="Message" {...register('message')} error={errors.message?.message} placeholder="Your message..." />
      <Button type="submit" isLoading={loading}>Send Message</Button>
    </form>
  );
}
