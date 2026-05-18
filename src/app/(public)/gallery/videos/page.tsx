import { generatePageMeta } from '@/lib/constants/seo';
import VideosPageClient from './VideosPageClient';

export const metadata = generatePageMeta(
  'Videos',
  'Video highlights from Assamese cultural performances and community events in Dallas.'
);

export default function VideosPage() {
  return <VideosPageClient />;
}
