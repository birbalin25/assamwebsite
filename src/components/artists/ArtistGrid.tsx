import { ArtistCard } from './ArtistCard';

interface Artist {
  id: string;
  name: string;
  specialties: string[];
  profileImage?: string;
}

interface ArtistGridProps {
  artists: Artist[];
}

export function ArtistGrid({ artists }: ArtistGridProps) {
  if (artists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-earth-500">No artists found.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {artists.map((artist) => (
        <ArtistCard key={artist.id} {...artist} />
      ))}
    </div>
  );
}
