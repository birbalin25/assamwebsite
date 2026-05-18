import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';
import { siteConfig, generatePageMeta, stripHtml, truncate } from '@/lib/constants/seo';
import NewsDetailPageClient from './NewsDetailPageClient';

type Props = {
  params: Promise<{ announcementId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { announcementId } = await params;

  try {
    const db = getAdminDb();
    const snap = await db
      .collection('announcements')
      .where('slug', '==', announcementId)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snap.empty) return generatePageMeta('Announcement Not Found');

    const ann = snap.docs[0].data();
    const title = ann.title || 'Announcement';
    const description = ann.content
      ? truncate(stripHtml(ann.content))
      : ann.excerpt || `${title} — news from the Assamese community in Dallas.`;

    return generatePageMeta(title, description, {
      url: `${siteConfig.url}/news/${announcementId}`,
      image: `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}`,
    });
  } catch {
    return generatePageMeta('News & Announcements');
  }
}

export default function NewsDetailPage() {
  return <NewsDetailPageClient />;
}
