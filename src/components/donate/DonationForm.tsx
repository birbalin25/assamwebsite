'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DonationTiers } from './DonationTiers';
import { donationTiers } from '@/lib/constants/categories';
import { toast } from 'sonner';

export function DonationForm() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const amount = selectedAmount || Number(customAmount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 1) {
      toast.error('Please select or enter a donation amount.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, donorName, donorEmail, isAnonymous, message }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="font-heading font-semibold text-lg text-earth-800 mb-4">Choose an Amount</h3>
        <DonationTiers
          tiers={[...donationTiers]}
          selectedAmount={selectedAmount}
          onSelect={(amt) => {
            setSelectedAmount(amt);
            setCustomAmount('');
          }}
        />
        <div className="mt-4">
          <Input
            label="Or enter a custom amount ($)"
            type="number"
            min="1"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            placeholder="Enter amount"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-earth-800">Your Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={donorName} onChange={e => setDonorName(e.target.value)} required />
          <Input label="Email" type="email" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} required />
        </div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            className="rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
          />
          <span className="text-sm text-earth-700">Make my donation anonymous</span>
        </label>
        <Textarea
          label="Message (optional)"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Leave a message with your donation..."
        />
      </div>

      <div className="bg-earth-100 rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-earth-500">Donation Amount</p>
          <p className="text-3xl font-bold text-earth-800">${amount || '—'}</p>
        </div>
        <Button type="submit" size="lg" isLoading={loading} disabled={amount < 1}>
          Donate Now
        </Button>
      </div>
    </form>
  );
}
