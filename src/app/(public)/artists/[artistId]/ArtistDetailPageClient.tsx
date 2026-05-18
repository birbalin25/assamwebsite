'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { User, Music, Award } from 'lucide-react';
import { getMemberById } from '@/lib/services/members';
import type { Member, WithId } from '@/types';

export default function ArtistDetailPage() {
  const params = useParams<{ artistId: string }>();
  const [member, setMember] = useState<WithId<Member> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchArtist() {
      try {
        const result = await getMemberById(params.artistId);
        if (!result) {
          setNotFound(true);
        } else {
          setMember(result);
        }
      } catch (error) {
        console.error('Failed to fetch artist:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [params.artistId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <>
        <PageHeader
          title="Artist Not Found"
          breadcrumbs={[
            { label: 'Artists', href: '/artists' },
            { label: 'Not Found' },
          ]}
        />
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-earth-500 text-lg">The artist you are looking for could not be found.</p>
          </div>
        </section>
      </>
    );
  }

  const specialties = member.performerProfile?.specialties || [];
  const bio = member.performerProfile?.bio || '';

  return (
    <>
      <PageHeader
        title={member.name}
        breadcrumbs={[
          { label: 'Artists', href: '/artists' },
          { label: member.name },
        ]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {member.profileImage ? (
              <img
                src={member.profileImage}
                alt={member.name}
                className="w-32 h-32 rounded-full object-cover shrink-0 mx-auto md:mx-0"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gamosa-100 to-muga-100 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <User className="h-16 w-16 text-gamosa-400" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {specialties.map((specialty, index) => (
                  <span
                    key={specialty}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 ${
                      index % 2 === 0 ? 'bg-muga-50 text-muga-700' : 'bg-tea-50 text-tea-700'
                    } rounded-full text-sm`}
                  >
                    {index % 2 === 0 ? <Music className="h-3.5 w-3.5" /> : <Award className="h-3.5 w-3.5" />}
                    {specialty}
                  </span>
                ))}
              </div>
              {bio && (
                <p className="text-earth-600 leading-relaxed">
                  {bio}
                </p>
              )}
              {member.performerProfile?.galleryImages && member.performerProfile.galleryImages.length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {member.performerProfile.galleryImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${member.name} gallery ${index + 1}`}
                      className="rounded-lg object-cover aspect-square"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
