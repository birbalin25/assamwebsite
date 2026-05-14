import {
  collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, limit
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Announcement, WithId } from '@/types';

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

function getCol() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, COLLECTIONS.ANNOUNCEMENTS);
}

export async function getPublishedAnnouncements(count?: number): Promise<WithId<Announcement>[]> {
  const q = query(getCol(), where('isPublished', '==', true));
  const snap = await getDocs(q);
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Announcement>));
  // Sort: pinned first, then by publishDate desc
  items.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.publishDate?.seconds ?? 0) - (a.publishDate?.seconds ?? 0);
  });
  if (count) items = items.slice(0, count);
  return items;
}

export async function getAnnouncementById(id: string): Promise<WithId<Announcement> | null> {
  const snap = await getDoc(doc(getFirebaseDb()!, COLLECTIONS.ANNOUNCEMENTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId<Announcement>;
}

export async function getAnnouncementBySlug(slug: string): Promise<WithId<Announcement> | null> {
  const q = query(getCol(), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as WithId<Announcement>;
}

export async function createAnnouncement(data: Omit<Announcement, 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const cleaned = stripUndefined({ ...data, createdAt: now, updatedAt: now });
  const ref = await addDoc(getCol(), cleaned);
  return ref.id;
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>): Promise<void> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const cleaned = stripUndefined({ ...data, updatedAt: now });
  await updateDoc(doc(getFirebaseDb()!, COLLECTIONS.ANNOUNCEMENTS, id), cleaned);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb()!, COLLECTIONS.ANNOUNCEMENTS, id));
}

export async function getAllAnnouncements(): Promise<WithId<Announcement>[]> {
  const snap = await getDocs(getCol());
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Announcement>));
  return items.sort((a, b) => (b.publishDate?.seconds ?? 0) - (a.publishDate?.seconds ?? 0));
}

const DUMMY_NEWS: Omit<Announcement, 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Rongali Bihu 2025 Celebration Announced',
    slug: 'rongali-bihu-2025-celebration-announced',
    content: '<p>We are thrilled to announce the Rongali Bihu 2025 celebration! Join us for a day filled with traditional Bihu dance, Husori performances, authentic Assamese cuisine, and cultural activities for all ages. This year\'s event promises to be bigger and better than ever.</p><p>Mark your calendars and bring your families for an unforgettable celebration of Assamese New Year!</p>',
    excerpt: 'Join us for the grand Rongali Bihu 2025 celebration with traditional performances, food, and cultural activities.',
    category: 'Event',
    isPinned: true,
    isPublished: true,
    publishDate: { seconds: Math.floor(Date.now() / 1000) - 86400, nanoseconds: 0 },
    author: 'Admin',
  },
  {
    title: 'Community Picnic at Lake Park',
    slug: 'community-picnic-at-lake-park',
    content: '<p>Our annual community picnic is back! This is a wonderful opportunity for families to connect, enjoy outdoor games, and share home-cooked Assamese delicacies. Activities include tug-of-war, relay races for kids, and a potluck lunch.</p><p>Everyone is welcome — bring a dish to share and join us for a relaxing day by the lake.</p>',
    excerpt: 'Annual community picnic with outdoor games, potluck lunch, and family fun at Lake Park.',
    category: 'Community',
    isPinned: false,
    isPublished: true,
    publishDate: { seconds: Math.floor(Date.now() / 1000) - 172800, nanoseconds: 0 },
    author: 'Admin',
  },
  {
    title: 'Youth Dance Workshop Registration Open',
    slug: 'youth-dance-workshop-registration-open',
    content: '<p>Calling all young dancers! We are offering a free Bihu dance workshop for children aged 5-15. Professional instructors will teach traditional Bihu dance steps, hand movements, and rhythms over four weekend sessions.</p><p>This is a great opportunity for the next generation to learn and preserve our cultural art forms. Register now — spots are limited!</p>',
    excerpt: 'Free Bihu dance workshop for children aged 5-15. Four weekend sessions with professional instructors.',
    category: 'General',
    isPinned: false,
    isPublished: true,
    publishDate: { seconds: Math.floor(Date.now() / 1000) - 345600, nanoseconds: 0 },
    author: 'Admin',
  },
  {
    title: 'Assamese Language Classes Starting Soon',
    slug: 'assamese-language-classes-starting-soon',
    content: '<p>Help your children stay connected to their roots! We are launching weekly Assamese language classes for kids and beginners. Classes will cover reading, writing, and conversational Assamese through fun, interactive lessons.</p><p>Classes will be held every Saturday morning via Zoom. No prior knowledge required.</p>',
    excerpt: 'Weekly Assamese language classes for kids and beginners starting soon. Interactive lessons via Zoom.',
    category: 'Community',
    isPinned: false,
    isPublished: true,
    publishDate: { seconds: Math.floor(Date.now() / 1000) - 518400, nanoseconds: 0 },
    author: 'Admin',
  },
];

/**
 * Seeds dummy news articles into Firestore if none exist.
 */
export async function ensureDefaultAnnouncements(): Promise<void> {
  const snap = await getDocs(getCol());
  if (snap.size > 0) return;
  for (const news of DUMMY_NEWS) {
    await createAnnouncement(news);
  }
}
