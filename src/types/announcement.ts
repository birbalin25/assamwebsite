import { Timestamp } from './common';

export type AnnouncementCategory = 'General' | 'Event' | 'Community' | 'Urgent';

export interface Announcement {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: AnnouncementCategory;
  featuredImage?: string;
  featuredImageBlur?: string;
  isPinned: boolean;
  isPublished: boolean;
  publishDate: Timestamp;
  author: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
