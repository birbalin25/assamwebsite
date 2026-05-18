import { generatePageMeta } from '@/lib/constants/seo';
import GalleryPageClient from './GalleryPageClient';

export const metadata = generatePageMeta(
  'Gallery',
  'Browse photos and videos from Assamese cultural events and celebrations in Dallas.'
);

export default function GalleryPage() {
  return <GalleryPageClient />;
}
