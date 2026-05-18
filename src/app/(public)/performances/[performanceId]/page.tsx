import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';
import { siteConfig, generatePageMeta, stripHtml, truncate } from '@/lib/constants/seo';
import PerformanceDetailPageClient from './PerformanceDetailPageClient';

type Props = {
  params: Promise<{ performanceId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { performanceId } = await params;

  try {
    const db = getAdminDb();
    const doc = await db.collection('performances').doc(performanceId).get();

    if (!doc.exists) return generatePageMeta('Performance Not Found');

    const perf = doc.data()!;
    const title = perf.title || 'Performance';
    const description = perf.description
      ? truncate(stripHtml(perf.description))
      : `${title} — a performance from the Assamese community in Dallas.`;

    return generatePageMeta(title, description, {
      url: `${siteConfig.url}/performances/${performanceId}`,
      image: `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}`,
    });
  } catch {
    return generatePageMeta('Performances');
  }
}

export default function PerformanceDetailPage() {
  return <PerformanceDetailPageClient />;
}
