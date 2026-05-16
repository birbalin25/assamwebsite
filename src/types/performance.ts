import { Timestamp } from './common';

export type PerformanceCategory = string;
export type PerformanceType = string;

export const PRESET_CATEGORIES = ['Kids', 'Teens', 'Adults'] as const;
export const PRESET_TYPES = ['Solo Dance', 'Group Dance', 'Solo Song', 'Chorus', 'Drama', 'Instrumental', 'Recitation'] as const;

export interface Performer {
  memberId: string;
  name: string;
  role?: string;
}

export interface Performance {
  eventId: string;
  eventYear: number;
  title: string;
  description?: string;
  category: PerformanceCategory;
  type: PerformanceType;
  performers: Performer[];
  videoUrl?: string;
  thumbnailUrl?: string;
  thumbnailBlur?: string;
  galleryImages?: string[];   // array of image URLs
  videos?: string[];          // array of video URLs (Firebase Storage or YouTube)
  duration?: string;
  order: number;
  isPublished: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
