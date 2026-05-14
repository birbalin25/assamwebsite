import {
  collection, query, orderBy, getDocs, getDoc, doc, deleteDoc
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Donation, WithId } from '@/types';

function getCol() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, COLLECTIONS.DONATIONS);
}

export async function getAllDonations(): Promise<WithId<Donation>[]> {
  const q = query(getCol(), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Donation>));
}

export async function getDonationById(id: string): Promise<WithId<Donation> | null> {
  const snap = await getDoc(doc(getFirebaseDb()!, COLLECTIONS.DONATIONS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId<Donation>;
}

export async function deleteDonation(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb()!, COLLECTIONS.DONATIONS, id));
}
