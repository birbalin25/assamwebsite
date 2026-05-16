import Link from 'next/link';
import { Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CategoryBadge } from './CategoryBadge';

interface VideoPerformance {
  id: string;
  title: string;
  category: string;
  type: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  eventName?: string;
}

interface PerformanceVideoGridProps {
  performances: VideoPerformance[];
}

export function PerformanceVideoGrid({ performances }: PerformanceVideoGridProps) {
  if (performances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-earth-500">No video performances found.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {performances.map((perf) => (
        <Link key={perf.id} href={`/performances/${perf.id}`}>
          <Card hover padding="none" className="group overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-earth-100 to-earth-200 flex items-center justify-center overflow-hidden">
              {perf.thumbnailUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={perf.thumbnailUrl} alt={perf.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-gamosa-500/90 flex items-center justify-center group-hover:bg-gamosa-600 transition-colors">
                      <Play className="h-6 w-6 text-white ml-0.5" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-14 h-14 rounded-full bg-gamosa-500/90 flex items-center justify-center group-hover:bg-gamosa-600 transition-colors">
                  <Play className="h-6 w-6 text-white ml-1" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CategoryBadge category={perf.category} />
              </div>
              <h3 className="font-heading font-semibold text-earth-800 group-hover:text-gamosa-600 transition-colors line-clamp-1">
                {perf.title}
              </h3>
              {perf.eventName && (
                <p className="text-xs text-earth-400 mt-1">{perf.eventName}</p>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
