'use client';

import Link from 'next/link';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface TimelineEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  year: number;
  slug: string;
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-earth-200" />
      {events.map((event, index) => (
        <div
          key={event.id}
          className={cn(
            'relative flex items-start gap-6 mb-8',
            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
          )}
        >
          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-gamosa-500 rounded-full border-2 border-white z-10" />
          <div className={cn('ml-10 md:ml-0 md:w-1/2', index % 2 === 0 ? 'md:pr-12' : 'md:pl-12')}>
            <Link href={`/events/${event.year}/${event.slug}`} className="block group">
              <div className="bg-white rounded-xl border border-earth-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <Badge variant="gamosa" className="mb-2">{event.type}</Badge>
                <h3 className="font-heading font-semibold text-earth-800 group-hover:text-gamosa-600 transition-colors">
                  {event.name}
                </h3>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-earth-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-earth-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.venue}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-sm text-gamosa-500 font-medium">
                  View Details <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
