import { generatePageMeta } from '@/lib/constants/seo';
import ArtistsPageClient from './ArtistsPageClient';

export const metadata = generatePageMeta(
  'Artists',
  'Discover talented Assamese artists in Dallas — musicians, dancers, singers, and performers.'
);

export default function ArtistsPage() {
  return <ArtistsPageClient />;
}
