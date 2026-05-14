import { collection, doc } from 'firebase/firestore';
import { getFirebaseDb } from './client';

export const COLLECTIONS = {
  EVENTS: 'events',
  PERFORMANCES: 'performances',
  MEMBERS: 'members',
  MEDIA: 'media',
  ALBUMS: 'albums',
  ANNOUNCEMENTS: 'announcements',
  DONATIONS: 'donations',
  BANNERS: 'banners',
  CONTACT_MESSAGES: 'contactMessages',
  SITE_CONFIG: 'siteConfig',
} as const;

export const getEventsRef = () => collection(getFirebaseDb()!, COLLECTIONS.EVENTS);
export const getPerformancesRef = () => collection(getFirebaseDb()!, COLLECTIONS.PERFORMANCES);
export const getMembersRef = () => collection(getFirebaseDb()!, COLLECTIONS.MEMBERS);
export const getMediaRef = () => collection(getFirebaseDb()!, COLLECTIONS.MEDIA);
export const getAlbumsRef = () => collection(getFirebaseDb()!, COLLECTIONS.ALBUMS);
export const getAnnouncementsRef = () => collection(getFirebaseDb()!, COLLECTIONS.ANNOUNCEMENTS);
export const getDonationsRef = () => collection(getFirebaseDb()!, COLLECTIONS.DONATIONS);
export const getBannersRef = () => collection(getFirebaseDb()!, COLLECTIONS.BANNERS);

export const eventDoc = (id: string) => doc(getFirebaseDb()!, COLLECTIONS.EVENTS, id);
export const performanceDoc = (id: string) => doc(getFirebaseDb()!, COLLECTIONS.PERFORMANCES, id);
export const memberDoc = (id: string) => doc(getFirebaseDb()!, COLLECTIONS.MEMBERS, id);
export const mediaDoc = (id: string) => doc(getFirebaseDb()!, COLLECTIONS.MEDIA, id);
export const albumDoc = (id: string) => doc(getFirebaseDb()!, COLLECTIONS.ALBUMS, id);
export const announcementDoc = (id: string) => doc(getFirebaseDb()!, COLLECTIONS.ANNOUNCEMENTS, id);
export const donationDoc = (id: string) => doc(getFirebaseDb()!, COLLECTIONS.DONATIONS, id);
export const bannerDoc = (id: string) => doc(getFirebaseDb()!, COLLECTIONS.BANNERS, id);
export const getSiteConfigDoc = () => doc(getFirebaseDb()!, COLLECTIONS.SITE_CONFIG, 'main');
