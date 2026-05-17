'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MemberGrid } from '@/components/community/MemberGrid';
import { Spinner } from '@/components/ui/Spinner';
import { getPublishedMembers } from '@/lib/services/members';
import { getSiteConfig } from '@/lib/services/siteConfig';
import type { Member, WithId } from '@/types';

const defaultTitle = 'Community';
const defaultDescription = 'Meet the families and individuals who make our Assamese community in the USA vibrant and strong.';

export default function CommunityPage() {
  const [members, setMembers] = useState<{ id: string; name: string; designation?: string; roles: string[]; location: string; profileImage?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [headerImage, setHeaderImage] = useState<string | undefined>();
  const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number; zoom: number } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [result, config] = await Promise.all([
          getPublishedMembers(),
          getSiteConfig(),
        ]);

        if (config.communityTitle) setTitle(config.communityTitle);
        if (config.communityDescription) setDescription(config.communityDescription);
        if (config.communityImage && config.communityImageVisible !== false) {
          setHeaderImage(config.communityImage);
          if (config.communityImageCrop) {
            try { setCropData(JSON.parse(config.communityImageCrop)); } catch { /* ignore invalid JSON */ }
          }
        }

        const mapped = result.map((member: WithId<Member>) => ({
          id: member.id,
          name: member.name,
          designation: member.showDesignation !== false ? member.designation : undefined,
          roles: member.roles,
          location: member.location.city + ', ' + member.location.state,
          profileImage: member.profileImage,
        }));
        setMembers(mapped);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: 'Community' }]}
      />
      {headerImage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="rounded-xl overflow-hidden shadow-lg bg-earth-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={headerImage}
              alt={title}
              className="w-full h-auto max-h-[60vh] object-contain sm:object-cover sm:h-64 md:h-72 lg:h-80"
              style={cropData ? {
                objectPosition: `${cropData.x + cropData.width / 2}% ${cropData.y + cropData.height / 2}%`,
                transform: cropData.zoom > 1 ? `scale(${cropData.zoom})` : undefined,
              } : undefined}
            />
          </div>
        </div>
      )}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-500 text-lg">No community members found yet.</p>
            </div>
          ) : (
            <MemberGrid members={members} />
          )}
        </div>
      </section>
    </>
  );
}
