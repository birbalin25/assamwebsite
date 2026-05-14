import {
  collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, limit, startAfter, type DocumentSnapshot
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { MediaItem, WithId, PaginatedResult } from '@/types';

function getCol() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, COLLECTIONS.MEDIA);
}

export async function getPublishedMedia(
  type?: 'photo' | 'video',
  year?: number,
  pageSize = 24,
  lastDoc?: DocumentSnapshot
): Promise<PaginatedResult<WithId<MediaItem>>> {
  const conditions = [where('isPublished', '==', true)];
  if (type) conditions.push(where('type', '==', type));
  if (year) conditions.push(where('year', '==', year));

  let q = query(getCol(), ...conditions, orderBy('year', 'desc'), limit(pageSize + 1));
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const items = snap.docs.slice(0, pageSize).map(d => ({ id: d.id, ...d.data() } as WithId<MediaItem>));
  return {
    items,
    lastDoc: snap.docs[pageSize - 1] || null,
    hasMore: snap.docs.length > pageSize,
  };
}

export async function createMediaItem(data: Omit<MediaItem, 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  const ref = await addDoc(getCol(), { ...data, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateMediaItem(id: string, data: Partial<MediaItem>): Promise<void> {
  const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  await updateDoc(doc(getFirebaseDb()!, COLLECTIONS.MEDIA, id), { ...data, updatedAt: now });
}

export async function getMediaByAlbumId(albumId: string): Promise<WithId<MediaItem>[]> {
  const q = query(getCol(), where('albumId', '==', albumId));
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<MediaItem>));
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getPublishedMediaByAlbumId(albumId: string): Promise<WithId<MediaItem>[]> {
  const q = query(getCol(), where('albumId', '==', albumId));
  const snap = await getDocs(q);
  const items = snap.docs
    .map(d => ({ id: d.id, ...d.data() } as WithId<MediaItem>))
    .filter(item => item.isPublished);
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getMediaCountByAlbumId(albumId: string): Promise<number> {
  const q = query(getCol(), where('albumId', '==', albumId));
  const snap = await getDocs(q);
  return snap.docs.filter(d => (d.data() as MediaItem).isPublished).length;
}

export async function deleteMediaItem(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb()!, COLLECTIONS.MEDIA, id));
}
