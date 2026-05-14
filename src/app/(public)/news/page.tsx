'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Clock, Pin } from 'lucide-react';
import { getPublishedAnnouncements, ensureDefaultAnnouncements } from '@/lib/services/announcements';
import type { Announcement, WithId } from '@/types';

interface MappedNews {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  isPinned: boolean;
  slug: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<MappedNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        await ensureDefaultAnnouncements();
        const result = await getPublishedAnnouncements();
        const mapped = result.map((ann: WithId<Announcement>) => ({
          id: ann.id,
          title: ann.title,
          excerpt: ann.excerpt,
          category: ann.category,
          date: ann.publishDate ? format(new Date(ann.publishDate.seconds * 1000), 'MMMM d, yyyy') : '',
          isPinned: ann.isPinned,
          slug: ann.slug,
        }));
        setNews(mapped);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <>
      <PageHeader
        title="News & Announcements"
        description="Stay updated with the latest from our community."
        breadcrumbs={[{ label: 'News' }]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-500 text-lg">No news or announcements yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`}>
                  <Card hover className="group">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={item.category === 'Event' ? 'gamosa' : item.category === 'Community' ? 'tea' : 'default'}>
                            {item.category}
                          </Badge>
                          {item.isPinned && <Pin className="h-3.5 w-3.5 text-muga-500" />}
                        </div>
                        <h2 className="font-heading font-semibold text-lg text-earth-800 group-hover:text-gamosa-600 transition-colors">
                          {item.title}
                        </h2>
                        <p className="text-sm text-earth-500 mt-1">{item.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-earth-400 shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        {item.date}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
