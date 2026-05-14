export const performanceCategories = [
  { value: 'kids', label: 'Kids', color: 'bg-blue-100 text-blue-800' },
  { value: 'teens', label: 'Teens', color: 'bg-purple-100 text-purple-800' },
  { value: 'adults', label: 'Adults', color: 'bg-green-100 text-green-800' },
] as const;

export const performanceTypes = [
  'Solo Dance',
  'Group Dance',
  'Solo Song',
  'Chorus',
  'Drama',
  'Instrumental',
  'Recitation',
  'Other',
] as const;

export const eventTypes = [
  'Rongali Bihu',
  'Bohag Bihu',
  'Magh Bihu',
  'Cultural Program',
  'Other',
] as const;

export const memberRoles = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Board Member',
  'Volunteer',
  'Member',
] as const;

export const announcementCategories = [
  'General',
  'Event',
  'Community',
  'Urgent',
] as const;

export const donationTiers = [
  { amount: 25, label: 'Supporter', description: 'Helps with event decorations and supplies' },
  { amount: 50, label: 'Patron', description: 'Sponsors refreshments for one community event' },
  { amount: 100, label: 'Champion', description: 'Supports a children\'s performance workshop' },
  { amount: 250, label: 'Guardian', description: 'Funds venue rental for a cultural program' },
  { amount: 500, label: 'Benefactor', description: 'Sponsors an entire community celebration' },
] as const;
