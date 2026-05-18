'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { User, MapPin, Calendar, Phone, Mail } from 'lucide-react';
import { getMemberById } from '@/lib/services/members';
import type { Member, WithId } from '@/types';

export default function MemberDetailPage() {
  const params = useParams<{ memberId: string }>();
  const [member, setMember] = useState<WithId<Member> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchMember() {
      try {
        const result = await getMemberById(params.memberId);
        if (!result) {
          setNotFound(true);
        } else {
          setMember(result);
        }
      } catch (error) {
        console.error('Failed to fetch member:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [params.memberId]);

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
          title="Member Not Found"
          breadcrumbs={[
            { label: 'Community', href: '/community' },
            { label: 'Not Found' },
          ]}
        />
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-earth-500 text-lg">The member you are looking for could not be found.</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={member.name}
        breadcrumbs={[
          { label: 'Community', href: '/community' },
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
                className="w-28 h-28 rounded-full object-cover shrink-0 mx-auto md:mx-0"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-tea-100 to-tea-200 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <User className="h-14 w-14 text-tea-500" />
              </div>
            )}
            <div>
              <p className="text-earth-500 font-medium mb-2">
                {member.showDesignation !== false && member.designation ? member.designation : 'Member'}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {member.roles.map((role) => (
                  <Badge key={role} variant="tea">{role}</Badge>
                ))}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-earth-500">
                  <MapPin className="h-4 w-4" /> {member.location.city}, {member.location.state}
                </div>
                <div className="flex items-center gap-2 text-sm text-earth-500">
                  <Calendar className="h-4 w-4" /> Member since {member.joinedYear}
                </div>
                {member.showPhone && member.phone && (
                  <div className="flex items-center gap-2 text-sm text-earth-500">
                    <Phone className="h-4 w-4" /> {member.phone}
                  </div>
                )}
                {member.showEmail && member.email && (
                  <div className="flex items-center gap-2 text-sm text-earth-500">
                    <Mail className="h-4 w-4" /> {member.email}
                  </div>
                )}
              </div>
              {member.performerProfile?.bio && (
                <p className="text-earth-600 leading-relaxed">
                  {member.performerProfile.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
