import { generatePageMeta } from '@/lib/constants/seo';
import DonatePageClient from './DonatePageClient';

export const metadata = generatePageMeta(
  'Donate',
  'Support the Assamese community in Dallas. Your donations fund cultural events and community programs.'
);

export default function DonatePage() {
  return <DonatePageClient />;
}
