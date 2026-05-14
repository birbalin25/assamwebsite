import {
  collection, query, where, orderBy, getDocs, getDoc, doc, addDoc, updateDoc,
  deleteDoc, limit, startAfter, type DocumentSnapshot
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Event, WithId, PaginatedResult } from '@/types';

function getEventsCol() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, COLLECTIONS.EVENTS);
}

export async function getPublishedEvents(pageSize = 20, lastDoc?: DocumentSnapshot): Promise<PaginatedResult<WithId<Event>>> {
  let q = query(
    getEventsCol(),
    where('isPublished', '==', true),
    orderBy('year', 'desc'),
    orderBy('order', 'asc'),
    limit(pageSize + 1)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const items = snap.docs.slice(0, pageSize).map(d => ({ id: d.id, ...d.data() } as WithId<Event>));
  return {
    items,
    lastDoc: snap.docs[pageSize - 1] || null,
    hasMore: snap.docs.length > pageSize,
  };
}

export async function getFeaturedEvents(): Promise<WithId<Event>[]> {
  const q = query(
    getEventsCol(),
    where('isPublished', '==', true),
    where('isFeatured', '==', true),
    orderBy('year', 'desc'),
    limit(4)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Event>));
}

export async function getEventBySlug(year: number, slug: string): Promise<WithId<Event> | null> {
  const q = query(getEventsCol(), where('year', '==', year), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as WithId<Event>;
}

export async function getEventById(id: string): Promise<WithId<Event> | null> {
  const snap = await getDoc(doc(getFirebaseDb()!, COLLECTIONS.EVENTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId<Event>;
}

export async function createEvent(data: Omit<Event, 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const ref = await addDoc(getEventsCol(), { ...data, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateEvent(id: string, data: Partial<Event>): Promise<void> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  await updateDoc(doc(getFirebaseDb()!, COLLECTIONS.EVENTS, id), { ...data, updatedAt: now });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb()!, COLLECTIONS.EVENTS, id));
}

export async function getAllEvents(): Promise<WithId<Event>[]> {
  const q = query(getEventsCol(), orderBy('year', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Event>));
}
