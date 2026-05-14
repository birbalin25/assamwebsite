'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight, Clock, Pin } from 'lucide-react';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getPublishedAnnouncements } from '@/lib/services/announcements';
import type { Announcement, WithId } from '@/types';

export function LatestNews() {
  const [news, setNews] = useState<WithId<Announcement>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await getPublishedAnnouncements(3);
        setNews(data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </section>
    );
  }

  if (news.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-gamosa-500 font-medium text-sm tracking-wider uppercase">Stay Updated</span>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-earth-800 mt-2">
                Latest News
              </h2>
            </div>
            <Link href="/news" className="hidden sm:block">
              <Button variant="ghost" rightIcon={<ArrowRight className="h-4 w-4" />}>
                All News
              </Button>
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {news.map((item, index) => {
            const dateStr = item.publishDate?.seconds
              ? format(new Date(item.publishDate.seconds * 1000), 'MMMM d, yyyy')
              : '';

            return (
              <AnimatedSection key={item.id} delay={index * 0.1}>
                <Link href={`/news/${item.slug}`}>
                  <Card hover className="h-full group">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={item.category === 'Event' ? 'gamosa' : item.category === 'Community' ? 'tea' : 'default'}>
                        {item.category}
                      </Badge>
                      {item.isPinned && (
                        <Pin className="h-3.5 w-3.5 text-muga-500" />
                      )}
                    </div>
                    <h3 className="font-heading font-semibold text-earth-800 group-hover:text-gamosa-600 transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-earth-500 line-clamp-2 mb-4">{item.excerpt}</p>
                    {dateStr && (
                      <div className="flex items-center gap-1.5 text-xs text-earth-400">
                        <Clock className="h-3.5 w-3.5" />
                        {dateStr}
                      </div>
                    )}
                  </Card>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>

        <div className="sm:hidden text-center mt-8">
          <Link href="/news">
            <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View All News
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
