import { generatePageMeta } from '@/lib/constants/seo';
import PerformancesPageClient from './PerformancesPageClient';

export const metadata = generatePageMeta(
  'Performances',
  'Watch performances from the Assamese community in Dallas — dance, music, drama, and cultural showcases.'
);

export default function PerformancesPage() {
  return <PerformancesPageClient />;
}
