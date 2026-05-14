import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface EventCardProps {
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

export function EventCard({ name, type, date, venue, year, slug, isFeatured, featuredImage }: EventCardProps) {
  return (
    <Link href={`/events/${year}/${slug}`}>
      <Card hover padding="none" className="group overflow-hidden">
        <div className="relative h-44 bg-gradient-to-br from-gamosa-100 to-muga-100 flex items-center justify-center overflow-hidden">
          {featuredImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage} alt={name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </>
          ) : (
            <Calendar className="h-14 w-14 text-gamosa-300" />
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="gamosa">{type}</Badge>
            {isFeatured && <Badge variant="muga">Featured</Badge>}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-heading font-semibold text-lg text-earth-800 group-hover:text-gamosa-600 transition-colors">
            {name}
          </h3>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-earth-500">
              <Calendar className="h-4 w-4 text-muga-500 shrink-0" />
              {date}
            </div>
            <div className="flex items-center gap-2 text-sm text-earth-500">
              <MapPin className="h-4 w-4 text-tea-500 shrink-0" />
              {venue}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
