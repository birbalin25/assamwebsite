'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Calendar, MapPin, Clock, Users, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getEventBySlug } from '@/lib/services/events';
import type { Event, WithId } from '@/types';

export default function EventDetailPage() {
  const params = useParams<{ year: string; eventSlug: string }>();
  const [event, setEvent] = useState<WithId<Event> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const result = await getEventBySlug(Number(params.year), params.eventSlug);
        if (!result) {
          setNotFound(true);
        } else {
          setEvent(result);
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.year, params.eventSlug]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <>
        <PageHeader
          title="Event Not Found"
          breadcrumbs={[
            { label: 'Events', href: '/events' },
            { label: 'Not Found' },
          ]}
        />
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-earth-500 text-lg">The event you are looking for could not be found.</p>
          </div>
        </section>
      </>
    );
  }

  const formattedDate = event.date
    ? format(new Date(event.date.seconds * 1000), 'MMMM d, yyyy')
    : '';
  const formattedEndDate = event.endDate
    ? format(new Date(event.endDate.seconds * 1000), 'MMMM d, yyyy')
    : '';

  return (
    <>
      <PageHeader
        title={event.name}
        breadcrumbs={[
          { label: 'Events', href: '/events' },
          { label: String(event.year) },
          { label: event.name },
        ]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="gamosa">{event.type}</Badge>
            {event.isFeatured && <Badge variant="muga">Featured</Badge>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 text-earth-600">
              <Calendar className="h-5 w-5 text-muga-500" />
              <span>{formattedDate}{formattedEndDate ? ` - ${formattedEndDate}` : ''}</span>
            </div>
            <div className="flex items-center gap-3 text-earth-600">
              <MapPin className="h-5 w-5 text-tea-500" />
              <span>{event.venue.name}, {event.venue.city}, {event.venue.state}</span>
            </div>
            {event.venue.address && (
              <div className="flex items-center gap-3 text-earth-600">
                <Clock className="h-5 w-5 text-gamosa-500" />
                <span>{event.venue.address}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-earth-600">
              <Users className="h-5 w-5 text-muga-500" />
              <span>Open to All</span>
            </div>
          </div>
          <div className="mb-8">
            <Link href={`/performances?eventType=${encodeURIComponent(event.type)}&year=${event.year}`}>
              <Button
                size="md"
                leftIcon={<Play className="h-4 w-4" />}
              >
                Watch Performances
              </Button>
            </Link>
          </div>

          {event.description && (
            <div
              className="prose prose-earth max-w-none"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}
        </div>
      </section>
    </>
  );
}
