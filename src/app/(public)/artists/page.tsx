'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ArtistGrid } from '@/components/artists/ArtistGrid';
import { Spinner } from '@/components/ui/Spinner';
import { getPerformers } from '@/lib/services/members';
import type { Member, WithId } from '@/types';

export default function ArtistsPage() {
  const [artists, setArtists] = useState<{ id: string; name: string; specialties: string[]; profileImage: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtists() {
      try {
        const result = await getPerformers();
        const mapped = result.map((member: WithId<Member>) => ({
          id: member.id,
          name: member.name,
          specialties: member.performerProfile?.specialties || [],
          profileImage: member.profileImage || '',
        }));
        setArtists(mapped);
      } catch (error) {
        console.error('Failed to fetch artists:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  return (
    <>
      <PageHeader
        title="Artists"
        description="Meet the talented performers who bring our cultural celebrations to life."
        breadcrumbs={[{ label: 'Artists' }]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-500 text-lg">No artists found yet.</p>
            </div>
          ) : (
            <ArtistGrid artists={artists} />
          )}
        </div>
      </section>
    </>
  );
}
