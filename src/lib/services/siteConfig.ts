'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/collections';

export interface SiteConfig {
  // Site identity
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone?: string;

  // Site logo
  siteLogo?: string; // URL to logo image

  // Banner settings
  bannerTransitionInterval?: number; // seconds between slides

  // Homepage animations
  homepageAnimation?: string;          // e.g. 'flying_birds' or '' for none
  homepageAnimationEnabled?: boolean;  // master toggle

  // Quick Stats
  statMembers: number;
  statEvents: number;
  statPerformances: number;
  statYearsActive: number;

  // Community Highlights
  highlightPerformersTitle: string;
  highlightPerformersDescription: string;
  highlightCommunityTitle: string;
  highlightCommunityDescription: string;

  // Community page
  communityTitle?: string;
  communityDescription?: string;
  communityImage?: string;
  communityImageVisible?: boolean;

  // About page
  aboutTitle?: string;
  aboutDescription?: string;
  aboutStoryTitle?: string;
  aboutStoryParagraph1?: string;
  aboutStoryParagraph2?: string;
  aboutStoryContent?: string; // Rich text (replaces paragraph1+2)
  aboutMission?: string;
  aboutValues?: string; // JSON array of {title, description}
  aboutValue1Title?: string;
  aboutValue1Description?: string;
  aboutValue2Title?: string;
  aboutValue2Description?: string;
  aboutValue3Title?: string;
  aboutValue3Description?: string;
  aboutValue4Title?: string;
  aboutValue4Description?: string;

  // Donations
  donationsEnabled?: boolean;
  paypalEmail?: string;
  donationGoal?: number;
  donationMessage?: string;

  // Contact / Email settings
  contactFormRecipient?: string;
  contactFormEnabled?: boolean;
  resendApiKey?: string;

  // Social links
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'Assam in Dallas, USA',
  siteTagline: 'Connecting cultures, celebrating heritage, and building community.',
  contactEmail: 'info@assameseassociationofdallas.org',
  statMembers: 500,
  statEvents: 50,
  statPerformances: 200,
  statYearsActive: 15,
  highlightPerformersTitle: 'Talented Performers',
  highlightPerformersDescription:
    'From young children to seasoned adults, our community showcases incredible talent through Bihu dance, Borgeet, drama, and instrumental performances at every celebration.',
  highlightCommunityTitle: 'Growing Community',
  highlightCommunityDescription:
    'Families from across the United States come together to celebrate our rich Assamese heritage, creating lasting bonds and passing traditions to the next generation.',
  homepageAnimation: 'flying_birds',
  homepageAnimationEnabled: true,
  donationsEnabled: true,
  donationGoal: 10000,
  donationMessage: 'Your generous donation helps us preserve Assamese culture and organize community events across the USA.',
  contactFormRecipient: 'vijay.in09@gmail.com',
  contactFormEnabled: true,
  aboutTitle: 'About Us',
  aboutDescription: 'Preserving Assamese heritage and building community across America.',
  aboutStoryTitle: 'Our Story',
  aboutStoryParagraph1: 'The Assamese Community USA was founded by a group of passionate Assamese families who envisioned a platform to preserve and celebrate the rich cultural heritage of Assam while living thousands of miles away from home. What started as a small gathering has grown into a vibrant community that spans across the United States.',
  aboutStoryParagraph2: 'Every year, we organize Bihu celebrations, cultural programs, and community gatherings that bring together families from diverse backgrounds, united by their love for Assamese culture. Our events feature performances by children, teens, and adults, showcasing traditional and contemporary Assamese art forms.',
  aboutMission: 'To preserve and promote Assamese culture, traditions, and identity among the diaspora in the United States, while fostering a strong sense of community, celebrating artistic talent across generations, and creating lasting connections between families.',
  aboutValue1Title: 'Cultural Preservation',
  aboutValue1Description: 'Keeping Assamese traditions alive through Bihu celebrations, music, dance, and language for future generations.',
  aboutValue2Title: 'Community Building',
  aboutValue2Description: 'Creating a home away from home for Assamese families across the United States through fellowship and shared experiences.',
  aboutValue3Title: 'Youth Development',
  aboutValue3Description: 'Nurturing young talent and cultural pride through performance opportunities, workshops, and mentorship programs.',
  aboutValue4Title: 'Cultural Exchange',
  aboutValue4Description: 'Sharing the beauty of Assamese culture with the broader American community and fostering cross-cultural understanding.',
  facebookUrl: 'https://facebook.com/assamesecommunityusa',
  instagramUrl: 'https://instagram.com/assamesecommunityusa',
  youtubeUrl: 'https://youtube.com/@assamesecommunityusa',
};

const DOC_ID = 'main';
const DEFAULTS_DOC_ID = 'defaults';

/**
 * Saves the current DEFAULT_SITE_CONFIG to Firestore as a read-only reference.
 * Called once at app init to ensure defaults are persisted.
 */
export async function ensureDefaultsStored(): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const ref = doc(db, COLLECTIONS.SITE_CONFIG, DEFAULTS_DOC_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, DEFAULT_SITE_CONFIG);
    }
  } catch (error) {
    console.error('Error storing defaults:', error);
  }
}

/**
 * Returns the stored defaults from Firestore (immutable reference copy).
 * Falls back to hardcoded DEFAULT_SITE_CONFIG if not found.
 */
export async function getStoredDefaults(): Promise<SiteConfig> {
  const db = getFirebaseDb();
  if (!db) return DEFAULT_SITE_CONFIG;
  try {
    const ref = doc(db, COLLECTIONS.SITE_CONFIG, DEFAULTS_DOC_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return DEFAULT_SITE_CONFIG;
    return { ...DEFAULT_SITE_CONFIG, ...snap.data() } as SiteConfig;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const db = getFirebaseDb();
  if (!db) return DEFAULT_SITE_CONFIG;

  try {
    const ref = doc(db, COLLECTIONS.SITE_CONFIG, DOC_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return DEFAULT_SITE_CONFIG;
    return { ...DEFAULT_SITE_CONFIG, ...snap.data() } as SiteConfig;
  } catch (error) {
    console.error('Error fetching site config:', error);
    return DEFAULT_SITE_CONFIG;
  }
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');

  const ref = doc(db, COLLECTIONS.SITE_CONFIG, DOC_ID);
  await setDoc(ref, data, { merge: true });
}
