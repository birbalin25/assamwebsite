import { Timestamp } from './common';

export type MediaType = 'photo' | 'video';

export interface MediaItem {
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  blurDataUrl?: string;
  title?: string;
  caption?: string;
  eventId?: string;
  eventName?: string;
  year: number;
  albumId?: string;
  album?: string;
  category?: string;
  width?: number;
  height?: number;
  order: number;
  isPublished: boolean;
  isFeatured: boolean;
  uploadedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
