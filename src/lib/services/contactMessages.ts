import {
  collection, getDocs, addDoc, deleteDoc, doc
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export type ContactMessageWithId = ContactMessage & { id: string };

function getCol() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, COLLECTIONS.CONTACT_MESSAGES);
}

export async function submitContactMessage(data: Omit<ContactMessage, 'createdAt'>): Promise<string> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const ref = await addDoc(getCol(), { ...data, createdAt: now });
  return ref.id;
}

export async function getAllContactMessages(): Promise<ContactMessageWithId[]> {
  const snap = await getDocs(getCol());
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessageWithId));
  return items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function deleteContactMessage(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb()!, COLLECTIONS.CONTACT_MESSAGES, id));
}
