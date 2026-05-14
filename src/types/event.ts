import { Timestamp } from './common';

export type EventType = 'Rongali Bihu' | 'Bohag Bihu' | 'Magh Bihu' | 'Cultural Program' | 'Other';

export interface Event {
  name: string;
  slug: string;
  type: EventType;
  year: number;
  date: Timestamp;
  endDate?: Timestamp;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  description: string;
  featuredImage: string;
  featuredImageBlur?: string;
  coverImage?: string;
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
  performanceIds: string[];
  mediaAlbumId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
