import { Timestamp } from './common';

export type MemberRole = 'President' | 'Vice President' | 'Secretary' | 'Treasurer' | 'Board Member' | 'Volunteer' | 'Member';

export interface FamilyMember {
  name: string;
  relation: string;
  isPerformer: boolean;
}

export interface PerformerProfile {
  bio: string;
  specialties: string[];
  featuredImage?: string;
  galleryImages?: string[];
}

export const DESIGNATION_OPTIONS = [
  'President',
  'Vice President',
  'Secretary',
  'Joint Secretary',
  'Cultural Secretary',
  'Finance Secretary',
  'Treasurer',
  'Public Relations Officer',
  'Event Coordinator',
  'Youth Coordinator',
  'Women\'s Wing Coordinator',
  'Board Member',
  'Advisory Board Member',
  'Executive Committee Member',
  'Founding Member',
  'Patron',
  'Volunteer Lead',
  'Volunteer',
  'Member',
] as const;

export interface Member {
  name: string;
  designation?: string;
  showDesignation?: boolean;
  email?: string;
  phone?: string;
  showPhone?: boolean;
  showEmail?: boolean;
  family: FamilyMember[];
  roles: MemberRole[];
  location: {
    city: string;
    state: string;
  };
  profileImage?: string;
  profileImageBlur?: string;
  performerProfile?: PerformerProfile;
  joinedYear: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
