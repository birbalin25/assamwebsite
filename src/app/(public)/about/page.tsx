import { generatePageMeta } from '@/lib/constants/seo';
import AboutPageClient from './AboutPageClient';

export const metadata = generatePageMeta(
  'About Us',
  'Learn about Assam in Dallas — our story, mission, and values preserving Assamese culture in Texas.'
);

export default function AboutPage() {
  return <AboutPageClient />;
}
