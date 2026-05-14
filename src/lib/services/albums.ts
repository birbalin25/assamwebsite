import {
  collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, limit
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Album, WithId } from '@/types';

/**
 * Removes keys with undefined values from an object.
 * Firestore rejects undefined values in documents.
 */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

function getCol() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, COLLECTIONS.ALBUMS);
}

export async function getAllAlbums(): Promise<WithId<Album>[]> {
  const snap = await getDocs(getCol());
  const albums = snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Album>));
  return albums.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function getPublishedAlbums(parentId?: string | null): Promise<WithId<Album>[]> {
  const q = query(getCol(), where('isPublished', '==', true));
  const snap = await getDocs(q);
  let albums = snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Album>));

  // Filter by parentId client-side
  if (parentId === null || parentId === undefined) {
    albums = albums.filter(a => !a.parentId);
  } else {
    albums = albums.filter(a => a.parentId === parentId);
  }

  return albums.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getAlbumById(id: string): Promise<WithId<Album> | null> {
  const snap = await getDoc(doc(getFirebaseDb()!, COLLECTIONS.ALBUMS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId<Album>;
}

export async function getAlbumBySlug(slug: string): Promise<WithId<Album> | null> {
  const q = query(getCol(), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as WithId<Album>;
}

export async function createAlbum(data: Omit<Album, 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const cleaned = stripUndefined({ ...data, createdAt: now, updatedAt: now });
  const ref = await addDoc(getCol(), cleaned);
  return ref.id;
}

export async function updateAlbum(id: string, data: Partial<Album>): Promise<void> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const cleaned = stripUndefined({ ...data, updatedAt: now });
  await updateDoc(doc(getFirebaseDb()!, COLLECTIONS.ALBUMS, id), cleaned);
}

export async function deleteAlbum(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb()!, COLLECTIONS.ALBUMS, id));
}
