'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Music, Image, Megaphone, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';
import { getAllEvents } from '@/lib/services/events';
import { getAllPerformances } from '@/lib/services/performances';
import { getAllMembers } from '@/lib/services/members';
import { getAllAnnouncements } from '@/lib/services/announcements';
import { getAllDonations } from '@/lib/services/donations';
import { collection, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';

interface StatItem {
  label: string;
  value: string;
  icon: typeof Calendar;
  href: string;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [events, performances, members, announcements, donations] = await Promise.all([
          getAllEvents(),
          getAllPerformances(),
          getAllMembers(),
          getAllAnnouncements(),
          getAllDonations(),
        ]);

        // Count media items
        let mediaCount = 0;
        try {
          const mediaSnap = await getDocs(collection(getFirebaseDb()!, COLLECTIONS.MEDIA));
          mediaCount = mediaSnap.size;
        } catch {
          mediaCount = 0;
        }

        const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const formattedDonations = `$${totalDonations.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

        setStats([
          { label: 'Events', value: String(events.length), icon: Calendar, href: '/admin/events', color: 'bg-gamosa-100 text-gamosa-600' },
          { label: 'Performances', value: String(performances.length), icon: Music, href: '/admin/performances', color: 'bg-muga-100 text-muga-600' },
          { label: 'Members', value: String(members.length), icon: Users, href: '/admin/members', color: 'bg-tea-100 text-tea-600' },
          { label: 'Media', value: String(mediaCount), icon: Image, href: '/admin/media', color: 'bg-blue-100 text-blue-600' },
          { label: 'Announcements', value: String(announcements.length), icon: Megaphone, href: '/admin/announcements', color: 'bg-purple-100 text-purple-600' },
          { label: 'Donations', value: formattedDonations, icon: Heart, href: '/admin/donations', color: 'bg-pink-100 text-pink-600' },
        ]);
      } catch {
        // Fallback to zeros if fetch fails
        setStats([
          { label: 'Events', value: '0', icon: Calendar, href: '/admin/events', color: 'bg-gamosa-100 text-gamosa-600' },
          { label: 'Performances', value: '0', icon: Music, href: '/admin/performances', color: 'bg-muga-100 text-muga-600' },
          { label: 'Members', value: '0', icon: Users, href: '/admin/members', color: 'bg-tea-100 text-tea-600' },
          { label: 'Media', value: '0', icon: Image, href: '/admin/media', color: 'bg-blue-100 text-blue-600' },
          { label: 'Announcements', value: '0', icon: Megaphone, href: '/admin/announcements', color: 'bg-purple-100 text-purple-600' },
          { label: 'Donations', value: '$0', icon: Heart, href: '/admin/donations', color: 'bg-pink-100 text-pink-600' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-earth-800 mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-earth-800">{stat.value}</p>
                <p className="text-sm text-earth-500">{stat.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="font-heading font-semibold text-lg text-earth-800 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {['Event "Rongali Bihu 2025" was updated', 'New media uploaded (12 photos)', 'Announcement published: "Registration Open"', 'Donation received: $100'].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-earth-100 last:border-0">
              <div className="w-2 h-2 rounded-full bg-gamosa-500" />
              <p className="text-sm text-earth-600">{activity}</p>
              <span className="text-xs text-earth-400 ml-auto">Just now</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
