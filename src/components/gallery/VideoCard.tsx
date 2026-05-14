import { Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  eventName?: string;
  onClick?: () => void;
}

export function VideoCard({ title, eventName, onClick }: VideoCardProps) {
  return (
    <Card hover padding="none" className="group cursor-pointer overflow-hidden" onClick={onClick}>
      <div className="relative aspect-video bg-gradient-to-br from-earth-100 to-earth-200 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-gamosa-500/90 flex items-center justify-center group-hover:bg-gamosa-600 group-hover:scale-110 transition-all">
          <Play className="h-6 w-6 text-white ml-1" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm text-earth-800 group-hover:text-gamosa-600 transition-colors line-clamp-2">
          {title}
        </h3>
        {eventName && (
          <p className="text-xs text-earth-400 mt-1">{eventName}</p>
        )}
      </div>
    </Card>
  );
}
