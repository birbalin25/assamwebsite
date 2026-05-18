'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Clock, User } from 'lucide-react';
import { getAnnouncementBySlug } from '@/lib/services/announcements';
import type { Announcement, WithId } from '@/types';

export default function NewsDetailPage() {
  const params = useParams<{ announcementId: string }>();
  const [announcement, setAnnouncement] = useState<WithId<Announcement> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const result = await getAnnouncementBySlug(params.announcementId);
        if (!result) {
          setNotFound(true);
        } else {
          setAnnouncement(result);
        }
      } catch (error) {
        console.error('Failed to fetch announcement:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncement();
  }, [params.announcementId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !announcement) {
    return (
      <>
        <PageHeader
          title="Announcement Not Found"
          breadcrumbs={[
            { label: 'News', href: '/news' },
            { label: 'Not Found' },
          ]}
        />
        <section className="py-12 lg:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-earth-500 text-lg">The announcement you are looking for could not be found.</p>
          </div>
        </section>
      </>
    );
  }

  const formattedDate = announcement.publishDate
    ? format(new Date(announcement.publishDate.seconds * 1000), 'MMMM d, yyyy')
    : '';

  const badgeVariant = announcement.category === 'Event'
    ? 'gamosa'
    : announcement.category === 'Community'
      ? 'tea'
      : announcement.category === 'Urgent'
        ? 'gamosa'
        : 'default';

  return (
    <>
      <PageHeader
        title={announcement.title}
        breadcrumbs={[
          { label: 'News', href: '/news' },
          { label: announcement.title },
        ]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant={badgeVariant}>{announcement.category}</Badge>
            <div className="flex items-center gap-1.5 text-sm text-earth-400">
              <Clock className="h-4 w-4" /> {formattedDate}
            </div>
            {announcement.author && (
              <div className="flex items-center gap-1.5 text-sm text-earth-400">
                <User className="h-4 w-4" /> {announcement.author}
              </div>
            )}
          </div>
          <div
            className="prose prose-earth max-w-none"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </div>
      </section>
    </>
  );
}
