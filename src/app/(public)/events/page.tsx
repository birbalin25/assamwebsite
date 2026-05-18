import { generatePageMeta } from '@/lib/constants/seo';
import EventsPageClient from './EventsPageClient';

export const metadata = generatePageMeta(
  'Events',
  'Browse our Bihu celebrations, cultural programs, and community gatherings in Dallas.'
);

export default function EventsPage() {
  return <EventsPageClient />;
}
