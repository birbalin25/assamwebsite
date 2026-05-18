import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';
import { siteConfig, generatePageMeta } from '@/lib/constants/seo';
import MemberDetailPageClient from './MemberDetailPageClient';

type Props = {
  params: Promise<{ memberId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { memberId } = await params;

  try {
    const db = getAdminDb();
    const doc = await db.collection('members').doc(memberId).get();

    if (!doc.exists) return generatePageMeta('Member Not Found');

    const member = doc.data()!;
    const title = member.name || 'Community Member';
    const location = member.location
      ? `${member.location.city}, ${member.location.state}`
      : 'Dallas';
    const description = member.performerProfile?.bio
      ? member.performerProfile.bio.slice(0, 160)
      : `${title} — member of the Assamese community in ${location}.`;

    return generatePageMeta(title, description, {
      url: `${siteConfig.url}/community/${memberId}`,
      image: `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}`,
    });
  } catch {
    return generatePageMeta('Community');
  }
}

export default function MemberDetailPage() {
  return <MemberDetailPageClient />;
}
