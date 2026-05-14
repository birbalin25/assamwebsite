import { Timestamp } from './common';

export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Donation {
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  status: DonationStatus;
  isAnonymous: boolean;
  message?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
