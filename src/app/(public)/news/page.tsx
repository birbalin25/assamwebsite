import { generatePageMeta } from '@/lib/constants/seo';
import NewsPageClient from './NewsPageClient';

export const metadata = generatePageMeta(
  'News & Announcements',
  'Latest news and updates from the Assamese community in Dallas.'
);

export default function NewsPage() {
  return <NewsPageClient />;
}
