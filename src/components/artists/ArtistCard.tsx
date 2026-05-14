import Link from 'next/link';
import { User, Music } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ArtistCardProps {
  id: string;
  name: string;
  specialties: string[];
  profileImage?: string;
}

export function ArtistCard({ id, name, specialties }: ArtistCardProps) {
  return (
    <Link href={`/artists/${id}`}>
      <Card hover className="group text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gamosa-100 to-muga-100 flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-gamosa-400" />
        </div>
        <h3 className="font-heading font-semibold text-earth-800 group-hover:text-gamosa-600 transition-colors">
          {name}
        </h3>
        {specialties.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-earth-500">
            <Music className="h-3.5 w-3.5" />
            {specialties.slice(0, 2).join(', ')}
          </div>
        )}
      </Card>
    </Link>
  );
}
