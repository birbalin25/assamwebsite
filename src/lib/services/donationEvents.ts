import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';

export interface DonationEvent {
  title: string;
  description: string;
  goal: number;
  amounts: number[];
  isActive: boolean;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
}

export type DonationEventWithId = DonationEvent & { id: string };

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

function getCol() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, COLLECTIONS.DONATION_EVENTS);
}

export const DEFAULT_DONATION_EVENT: Omit<DonationEvent, 'createdAt' | 'updatedAt'> = {
  title: 'Support Our Community',
  description: 'Your generous donation helps us preserve Assamese culture and organize community events across the USA.',
  goal: 10000,
  amounts: [25, 50, 100, 250],
  isActive: true,
};

export async function getAllDonationEvents(): Promise<DonationEventWithId[]> {
  const snap = await getDocs(getCol());
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as DonationEventWithId));
  return items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function getActiveDonationEvent(): Promise<DonationEventWithId | null> {
  const snap = await getDocs(getCol());
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as DonationEventWithId));
  return items.find(e => e.isActive) || null;
}

export async function getDonationEventById(id: string): Promise<DonationEventWithId | null> {
  const snap = await getDoc(doc(getFirebaseDb()!, COLLECTIONS.DONATION_EVENTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as DonationEventWithId;
}

export async function createDonationEvent(data: Omit<DonationEvent, 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const cleaned = stripUndefined({ ...data, createdAt: now, updatedAt: now });
  const ref = await addDoc(getCol(), cleaned);
  return ref.id;
}

export async function updateDonationEvent(id: string, data: Partial<DonationEvent>): Promise<void> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const cleaned = stripUndefined({ ...data, updatedAt: now });
  await updateDoc(doc(getFirebaseDb()!, COLLECTIONS.DONATION_EVENTS, id), cleaned);
}

export async function deleteDonationEvent(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb()!, COLLECTIONS.DONATION_EVENTS, id));
}

export async function ensureDefaultDonationEvent(): Promise<void> {
  const snap = await getDocs(getCol());
  if (snap.size > 0) return;
  await createDonationEvent(DEFAULT_DONATION_EVENT);
}
