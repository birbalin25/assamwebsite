import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const donationFormSchema = z.object({
  amount: z.number().min(1, 'Minimum donation is $1'),
  donorName: z.string().min(2, 'Name is required'),
  donorEmail: z.string().email('Please enter a valid email'),
  isAnonymous: z.boolean().default(false),
  message: z.string().optional(),
});

export const eventFormSchema = z.object({
  name: z.string().min(3, 'Event name is required'),
  type: z.enum(['Rongali Bihu', 'Bohag Bihu', 'Magh Bihu', 'Cultural Program', 'Other']),
  year: z.number().min(2000).max(2100),
  date: z.string(),
  venueName: z.string().min(2, 'Venue name is required'),
  venueAddress: z.string(),
  venueCity: z.string(),
  venueState: z.string(),
  description: z.string(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export const performanceFormSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  title: z.string().min(3, 'Title is required'),
  category: z.enum(['kids', 'teens', 'adults']),
  type: z.enum(['Solo Dance', 'Group Dance', 'Solo Song', 'Chorus', 'Drama', 'Instrumental', 'Recitation', 'Other']),
  description: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
});

export const memberFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  city: z.string(),
  state: z.string(),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  joinedYear: z.number().min(2000).max(2100),
  isPublished: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const announcementFormSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(10, 'Content is required'),
  excerpt: z.string().max(200),
  category: z.enum(['General', 'Event', 'Community', 'Urgent']),
  isPinned: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type DonationFormData = z.infer<typeof donationFormSchema>;
export type EventFormData = z.infer<typeof eventFormSchema>;
export type PerformanceFormData = z.infer<typeof performanceFormSchema>;
export type MemberFormData = z.infer<typeof memberFormSchema>;
export type AnnouncementFormData = z.infer<typeof announcementFormSchema>;
