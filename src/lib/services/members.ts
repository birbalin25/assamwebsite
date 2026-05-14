import {
  collection, query, where, orderBy, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Member, WithId } from '@/types';

function getCol() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, COLLECTIONS.MEMBERS);
}

export async function getPublishedMembers(): Promise<WithId<Member>[]> {
  const q = query(getCol(), where('isPublished', '==', true), where('isActive', '==', true), orderBy('name', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Member>));
}

export async function getMemberById(id: string): Promise<WithId<Member> | null> {
  const snap = await getDoc(doc(getFirebaseDb()!, COLLECTIONS.MEMBERS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId<Member>;
}

export async function getPerformers(): Promise<WithId<Member>[]> {
  const q = query(getCol(), where('isPublished', '==', true), where('isActive', '==', true));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as WithId<Member>))
    .filter(m => m.performerProfile);
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export async function createMember(data: Omit<Member, 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const cleaned = stripUndefined({ ...data, createdAt: now, updatedAt: now });
  const ref = await addDoc(getCol(), cleaned);
  return ref.id;
}

export async function updateMember(id: string, data: Partial<Member>): Promise<void> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const cleaned = stripUndefined({ ...data, updatedAt: now });
  await updateDoc(doc(getFirebaseDb()!, COLLECTIONS.MEMBERS, id), cleaned);
}

export async function deleteMember(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb()!, COLLECTIONS.MEMBERS, id));
}

export async function getAllMembers(): Promise<WithId<Member>[]> {
  const q = query(getCol(), orderBy('name', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Member>));
}
