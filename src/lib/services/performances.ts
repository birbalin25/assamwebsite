import {
  collection, query, where, orderBy, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, limit
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Performance, WithId } from '@/types';

function getCol() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, COLLECTIONS.PERFORMANCES);
}

export async function getPublishedPerformances(eventId?: string): Promise<WithId<Performance>[]> {
  let q;
  if (eventId) {
    q = query(getCol(), where('isPublished', '==', true), where('eventId', '==', eventId), orderBy('order', 'asc'));
  } else {
    q = query(getCol(), where('isPublished', '==', true), orderBy('eventYear', 'desc'), limit(50));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Performance>));
}

export async function getPerformanceById(id: string): Promise<WithId<Performance> | null> {
  const snap = await getDoc(doc(getFirebaseDb()!, COLLECTIONS.PERFORMANCES, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId<Performance>;
}

export async function createPerformance(data: Omit<Performance, 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const ref = await addDoc(getCol(), { ...data, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updatePerformance(id: string, data: Partial<Performance>): Promise<void> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  await updateDoc(doc(getFirebaseDb()!, COLLECTIONS.PERFORMANCES, id), { ...data, updatedAt: now });
}

export async function deletePerformance(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb()!, COLLECTIONS.PERFORMANCES, id));
}

export async function getAllPerformances(): Promise<WithId<Performance>[]> {
  const q = query(getCol(), orderBy('eventYear', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Performance>));
}
