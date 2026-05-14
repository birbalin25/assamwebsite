import Link from 'next/link';
import { Camera } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface AlbumCardProps {
  name: string;
  photoCount: number;
  year: number;
  href: string;
}

export function AlbumCard({ name, photoCount, year, href }: AlbumCardProps) {
  return (
    <Link href={href}>
      <Card hover padding="none" className="group overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-muga-100 to-gamosa-100 flex items-center justify-center">
          <Camera className="h-12 w-12 text-muga-300" />
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {photoCount} photos
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-heading font-semibold text-earth-800 group-hover:text-gamosa-600 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-earth-400 mt-1">{year}</p>
        </div>
      </Card>
    </Link>
  );
}
