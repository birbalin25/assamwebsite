'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { EventGrid } from '@/components/events/EventGrid';
import { YearFilter } from '@/components/events/YearFilter';
import { Spinner } from '@/components/ui/Spinner';
import { getPublishedEvents } from '@/lib/services/events';
import type { Event, WithId } from '@/types';

export default function EventsPage() {
  const [events, setEvents] = useState<{ id: string; name: string; type: string; date: string; venue: string; year: number; slug: string; isFeatured?: boolean; featuredImage?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState<number | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const result = await getPublishedEvents(100);
        const mapped = result.items.map((event: WithId<Event>) => ({
          id: event.id,
          name: event.name,
          type: event.type,
          date: event.date ? format(new Date(event.date.seconds * 1000), 'MMMM d, yyyy') : '',
          venue: event.venue.name + ', ' + event.venue.state,
          year: event.year,
          slug: event.slug,
          isFeatured: event.isFeatured,
          featuredImage: event.featuredImage || undefined,
        }));
        setEvents(mapped);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const years = [...new Set(events.map(e => e.year))].sort((a, b) => b - a);
  const filtered = activeYear ? events.filter(e => e.year === activeYear) : events;

  return (
    <>
      <PageHeader
        title="Events"
        description="Browse our Bihu celebrations, cultural programs, and community gatherings."
        breadcrumbs={[{ label: 'Events' }]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-500 text-lg">No events found yet.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <YearFilter years={years} activeYear={activeYear} onYearChange={setActiveYear} />
              </div>
              <EventGrid events={filtered} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
