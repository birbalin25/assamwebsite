import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';
import { siteConfig, generatePageMeta } from '@/lib/constants/seo';
import AlbumDetailPageClient from './AlbumDetailPageClient';

type Props = {
  params: Promise<{ albumSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { albumSlug } = await params;

  try {
    const db = getAdminDb();
    const snap = await db
      .collection('albums')
      .where('slug', '==', albumSlug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snap.empty) return generatePageMeta('Album Not Found');

    const album = snap.docs[0].data();
    const title = album.name || 'Album';
    const description = album.description || `${title} — photos and videos from the Assamese community in Dallas.`;

    return generatePageMeta(title, description, {
      url: `${siteConfig.url}/gallery/albums/${albumSlug}`,
      image: `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}`,
    });
  } catch {
    return generatePageMeta('Gallery');
  }
}

export default function AlbumDetailPage() {
  return <AlbumDetailPageClient />;
}
