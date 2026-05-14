'use client';

import { cn } from '@/lib/utils/cn';
import { Heart } from 'lucide-react';

interface Tier {
  amount: number;
  label: string;
  description: string;
}

interface DonationTiersProps {
  tiers: Tier[];
  selectedAmount: number | null;
  onSelect: (amount: number) => void;
}

export function DonationTiers({ tiers, selectedAmount, onSelect }: DonationTiersProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tiers.map((tier) => (
        <button
          key={tier.amount}
          onClick={() => onSelect(tier.amount)}
          className={cn(
            'p-5 rounded-xl border-2 text-left transition-all hover:shadow-md',
            selectedAmount === tier.amount
              ? 'border-gamosa-500 bg-gamosa-50 shadow-sm'
              : 'border-earth-200 bg-white hover:border-gamosa-300'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-earth-800">${tier.amount}</span>
            <Heart className={cn('h-5 w-5', selectedAmount === tier.amount ? 'text-gamosa-500 fill-gamosa-500' : 'text-earth-300')} />
          </div>
          <p className="font-medium text-earth-700 text-sm">{tier.label}</p>
          <p className="text-earth-500 text-xs mt-1">{tier.description}</p>
        </button>
      ))}
    </div>
  );
}
