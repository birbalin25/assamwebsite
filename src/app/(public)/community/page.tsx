import { generatePageMeta } from '@/lib/constants/seo';
import CommunityPageClient from './CommunityPageClient';

export const metadata = generatePageMeta(
  'Community',
  'Meet the families and individuals of the Assamese community in Dallas.'
);

export default function CommunityPage() {
  return <CommunityPageClient />;
}
