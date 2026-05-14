'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getFeaturedEvents } from '@/lib/services/events';
import type { Event, WithId } from '@/types';

export function FeaturedEvents() {
  const [events, setEvents] = useState<WithId<Event>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getFeaturedEvents();
        setEvents(data.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch featured events:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
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

  if (events.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-12">
            <span className="text-muga-500 font-medium text-sm tracking-wider uppercase">Our Events</span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-earth-800 mt-2">
              Featured Celebrations
            </h2>
            <p className="text-earth-500 mt-3 max-w-xl mx-auto">
              Join us for vibrant Bihu celebrations and cultural programs that bring the Assamese community together.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {events.map((event, index) => {
            const dateStr = event.date?.seconds
              ? format(new Date(event.date.seconds * 1000), 'MMMM d, yyyy')
              : '';
            const venueStr = event.venue
              ? `${event.venue.name}${event.venue.state ? ', ' + event.venue.state : ''}`
              : '';

            return (
              <AnimatedSection key={event.id} delay={index * 0.1}>
                <Link href={`/events/${event.year}/${event.slug}`}>
                  <Card hover padding="none" className="group overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-gamosa-100 to-muga-100 overflow-hidden">
                      {event.featuredImage ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={event.featuredImage} alt={event.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-gamosa-300" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant="gamosa">{event.type}</Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading font-semibold text-lg text-earth-800 group-hover:text-gamosa-600 transition-colors">
                        {event.name}
                      </h3>
                      <div className="mt-3 space-y-2">
                        {dateStr && (
                          <div className="flex items-center gap-2 text-sm text-earth-500">
                            <Calendar className="h-4 w-4 text-muga-500" />
                            {dateStr}
                          </div>
                        )}
                        {venueStr && (
                          <div className="flex items-center gap-2 text-sm text-earth-500">
                            <MapPin className="h-4 w-4 text-tea-500" />
                            {venueStr}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection delay={0.3}>
          <div className="text-center mt-10">
            <Link href="/events">
              <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All Events
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
