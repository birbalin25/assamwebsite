import Link from 'next/link';
import { Play, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CategoryBadge } from './CategoryBadge';

interface PerformanceCardProps {
  id: string;
  title: string;
  category: string;
  type: string;
  performers: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  eventName?: string;
}

export function PerformanceCard({ id, title, category, type, performers, videoUrl, thumbnailUrl, eventName }: PerformanceCardProps) {
  return (
    <Link href={`/performances/${id}`}>
      <Card hover padding="none" className="group overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-earth-100 to-earth-200 flex items-center justify-center overflow-hidden">
          {thumbnailUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
              {videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gamosa-500/90 flex items-center justify-center group-hover:bg-gamosa-600 transition-colors">
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  </div>
                </div>
              )}
            </>
          ) : videoUrl ? (
            <div className="w-14 h-14 rounded-full bg-gamosa-500/90 flex items-center justify-center group-hover:bg-gamosa-600 transition-colors">
              <Play className="h-6 w-6 text-white ml-1" />
            </div>
          ) : (
            <Users className="h-12 w-12 text-earth-300" />
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CategoryBadge category={category} />
            <Badge variant="outline">{type}</Badge>
          </div>
          <h3 className="font-heading font-semibold text-earth-800 group-hover:text-gamosa-600 transition-colors line-clamp-1">
            {title}
          </h3>
          {eventName && (
            <p className="text-xs text-earth-400 mt-1">{eventName}</p>
          )}
          {performers.length > 0 && (
            <p className="text-sm text-earth-500 mt-2 line-clamp-1">
              {performers.join(', ')}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
