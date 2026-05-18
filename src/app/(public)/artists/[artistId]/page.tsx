import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';
import { siteConfig, generatePageMeta } from '@/lib/constants/seo';
import ArtistDetailPageClient from './ArtistDetailPageClient';

type Props = {
  params: Promise<{ artistId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { artistId } = await params;

  try {
    const db = getAdminDb();
    const doc = await db.collection('members').doc(artistId).get();

    if (!doc.exists) return generatePageMeta('Artist Not Found');

    const member = doc.data()!;
    const title = member.name || 'Artist';
    const specialties = member.performerProfile?.specialties?.join(', ');
    const description = specialties
      ? `${title} — ${specialties}. Assamese artist in Dallas.`
      : member.performerProfile?.bio
        ? member.performerProfile.bio.slice(0, 160)
        : `${title} — Assamese artist and performer in Dallas.`;

    return generatePageMeta(title, description, {
      url: `${siteConfig.url}/artists/${artistId}`,
      image: `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}`,
    });
  } catch {
    return generatePageMeta('Artists');
  }
}

export default function ArtistDetailPage() {
  return <ArtistDetailPageClient />;
}
