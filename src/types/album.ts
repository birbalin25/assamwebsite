import { Timestamp } from './common';

export interface Album {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  thumbnail?: string;
  year?: number;
  eventId?: string;
  isPublished: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
