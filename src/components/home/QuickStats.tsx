'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Calendar, Music, Award } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      className="text-4xl lg:text-5xl font-heading font-bold text-white"
    >
      {isInView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {value}{suffix}
        </motion.span>
      ) : '0'}
    </motion.span>
  );
}

export function QuickStats() {
  const [memberCount, setMemberCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [performanceCount, setPerformanceCount] = useState(0);
  const [yearsActive, setYearsActive] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      const db = getFirebaseDb();
      if (!db) return;

      try {
        // Members: published + active
        const membersSnap = await getDocs(
          query(collection(db, COLLECTIONS.MEMBERS), where('isPublished', '==', true))
        );
        setMemberCount(membersSnap.size);

        // Events: published
        const eventsSnap = await getDocs(
          query(collection(db, COLLECTIONS.EVENTS), where('isPublished', '==', true))
        );
        setEventCount(eventsSnap.size);

        // Performances: published
        const performancesSnap = await getDocs(
          query(collection(db, COLLECTIONS.PERFORMANCES), where('isPublished', '==', true))
        );
        setPerformanceCount(performancesSnap.size);

        // Years active: earliest event year to current year
        if (eventsSnap.size > 0) {
          let earliest = new Date().getFullYear();
          eventsSnap.docs.forEach(d => {
            const year = d.data().year;
            if (typeof year === 'number' && year < earliest) earliest = year;
          });
          setYearsActive(new Date().getFullYear() - earliest + 1);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    }

    fetchCounts();
  }, []);

  const stats = [
    { icon: Users, value: memberCount, suffix: '+', label: 'Community Members', color: 'text-gamosa-500' },
    { icon: Calendar, value: eventCount, suffix: '+', label: 'Events Organized', color: 'text-muga-500' },
    { icon: Music, value: performanceCount, suffix: '+', label: 'Performances', color: 'text-tea-500' },
    { icon: Award, value: yearsActive, suffix: '', label: 'Years Active', color: 'text-gamosa-500' },
  ];

  return (
    <section className="py-16 lg:py-20 bg-tea-500 muga-texture relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color} opacity-80`} style={{ color: 'rgba(255,255,255,0.7)' }} />
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="text-white/80 text-sm mt-2 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
