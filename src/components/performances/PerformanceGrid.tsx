import { PerformanceCard } from './PerformanceCard';

interface Performance {
  id: string;
  title: string;
  category: string;
  type: string;
  performers: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  eventName?: string;
}

interface PerformanceGridProps {
  performances: Performance[];
}

export function PerformanceGrid({ performances }: PerformanceGridProps) {
  if (performances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-earth-500">No performances found.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {performances.map((perf) => (
        <PerformanceCard key={perf.id} {...perf} />
      ))}
    </div>
  );
}
