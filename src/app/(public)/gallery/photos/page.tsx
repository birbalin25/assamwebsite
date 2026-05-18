import { generatePageMeta } from '@/lib/constants/seo';
import PhotosPageClient from './PhotosPageClient';

export const metadata = generatePageMeta(
  'Photos',
  'Photo gallery from Assamese community events, festivals, and gatherings in Dallas.'
);

export default function PhotosPage() {
  return <PhotosPageClient />;
}
