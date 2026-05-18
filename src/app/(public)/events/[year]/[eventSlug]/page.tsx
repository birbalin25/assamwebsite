import { cache } from 'react';
import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';
import { siteConfig, generatePageMeta, stripHtml, truncate } from '@/lib/constants/seo';
import { JsonLd } from '@/components/shared/JsonLd';
import EventDetailPageClient from './EventDetailPageClient';

type Props = {
  params: Promise<{ year: string; eventSlug: string }>;
};

const getEvent = cache(async (year: number, slug: string) => {
  const db = getAdminDb();
  const snap = await db
    .collection('events')
    .where('year', '==', year)
    .where('slug', '==', slug)
    .where('status', '==', 'published')
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].data();
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, eventSlug } = await params;

  try {
    const event = await getEvent(Number(year), eventSlug);
    if (!event) return generatePageMeta('Event Not Found');

    const title = event.name || 'Event';
    const description = event.description
      ? truncate(stripHtml(event.description))
      : `${title} — an Assamese community event in Dallas.`;

    return generatePageMeta(title, description, {
      url: `${siteConfig.url}/events/${year}/${eventSlug}`,
      image: `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}`,
    });
  } catch {
    return generatePageMeta('Events');
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { year, eventSlug } = await params;

  let jsonLd = null;
  try {
    const event = await getEvent(Number(year), eventSlug);
    if (event) {
      const startDate = event.date
        ? new Date(event.date.seconds * 1000).toISOString()
        : undefined;
      const endDate = event.endDate
        ? new Date(event.endDate.seconds * 1000).toISOString()
        : undefined;

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        location: {
          '@type': 'Place',
          name: event.venue?.name,
          address: {
            '@type': 'PostalAddress',
            addressLocality: event.venue?.city,
            addressRegion: event.venue?.state,
          },
        },
        organizer: {
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteConfig.url,
        },
        ...(event.description && {
          description: truncate(stripHtml(event.description), 300),
        }),
      };
    }
  } catch {
    // Proceed without JSON-LD
  }

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <EventDetailPageClient />
    </>
  );
}
