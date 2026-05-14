'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { PerformanceGrid } from '@/components/performances/PerformanceGrid';
import { FilterBar } from '@/components/shared/FilterBar';
import { Spinner } from '@/components/ui/Spinner';
import { getPublishedPerformances } from '@/lib/services/performances';
import { getPublishedEvents } from '@/lib/services/events';
import type { Performance, Event, WithId } from '@/types';

const categoryFilters = [
  { value: 'kids', label: 'Kids' },
  { value: 'teens', label: 'Teens' },
  { value: 'adults', label: 'Adults' },
];

const eventTypeOptions = [
  'Rongali Bihu',
  'Bohag Bihu',
  'Magh Bihu',
  'Cultural Program',
  'Other',
];

interface MappedPerformance {
  id: string;
  title: string;
  category: string;
  type: string;
  performers: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  eventName?: string;
  eventType?: string;
  eventYear?: number;
}

export default function PerformancesPage() {
  const searchParams = useSearchParams();
  const [performances, setPerformances] = useState<MappedPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeEventType, setActiveEventType] = useState(searchParams.get('eventType') || '');
  const [activeYear, setActiveYear] = useState(searchParams.get('year') || '');

  useEffect(() => {
    async function fetchData() {
      try {
        const [perfs, eventsResult] = await Promise.all([
          getPublishedPerformances(),
          getPublishedEvents(100),
        ]);

        const eventMap = new Map<string, { name: string; type: string }>();
        eventsResult.items.forEach((e: WithId<Event>) => {
          eventMap.set(e.id, { name: e.name, type: e.type });
        });

        const mapped = perfs.map((perf: WithId<Performance>) => {
          const event = perf.eventId ? eventMap.get(perf.eventId) : undefined;
          return {
            id: perf.id,
            title: perf.title,
            category: perf.category,
            type: perf.type,
            performers: perf.performers.map(p => p.name),
            videoUrl: perf.videoUrl,
            thumbnailUrl: perf.thumbnailUrl,
            eventName: event?.name,
            eventType: event?.type,
            eventYear: perf.eventYear,
          };
        });
        setPerformances(mapped);
      } catch (error) {
        console.error('Failed to fetch performances:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    performances.forEach(p => {
      if (p.eventYear) years.add(p.eventYear);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [performances]);

  const filtered = performances.filter(p => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (activeEventType && p.eventType !== activeEventType) return false;
    if (activeYear && p.eventYear !== Number(activeYear)) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Performances"
        description="Watch amazing performances by our talented community members of all ages."
        breadcrumbs={[{ label: 'Performances' }]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : performances.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-500 text-lg">No performances found yet.</p>
            </div>
          ) : (
            <>
              <div className="mb-8 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="event-type-filter" className="text-sm font-medium text-earth-700">
                      Event Type:
                    </label>
                    <select
                      id="event-type-filter"
                      value={activeEventType}
                      onChange={(e) => setActiveEventType(e.target.value)}
                      className="rounded-lg border border-earth-300 bg-white px-3 py-2 text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500"
                    >
                      <option value="">All Event Types</option>
                      {eventTypeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="year-filter" className="text-sm font-medium text-earth-700">
                      Year:
                    </label>
                    <select
                      id="year-filter"
                      value={activeYear}
                      onChange={(e) => setActiveYear(e.target.value)}
                      className="rounded-lg border border-earth-300 bg-white px-3 py-2 text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500"
                    >
                      <option value="">All Years</option>
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <FilterBar
                  filters={categoryFilters}
                  activeFilter={activeCategory}
                  onFilterChange={setActiveCategory}
                />
              </div>
              <PerformanceGrid performances={filtered} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
