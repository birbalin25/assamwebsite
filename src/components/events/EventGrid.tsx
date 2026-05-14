import { EventCard } from './EventCard';

interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  year: number;
  slug: string;
  isFeatured?: boolean;
  featuredImage?: string;
}

interface EventGridProps {
  events: Event[];
}

export function EventGrid({ events }: EventGridProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-earth-500">No events found.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  );
}
