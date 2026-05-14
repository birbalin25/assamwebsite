// Verified: Vercel auto-deploy from GitHub is working
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedEvents } from '@/components/home/FeaturedEvents';
import { QuickStats } from '@/components/home/QuickStats';
import { CommunityHighlights } from '@/components/home/CommunityHighlights';
import { LatestNews } from '@/components/home/LatestNews';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedEvents />
      <QuickStats />
      <CommunityHighlights />
      <LatestNews />
    </>
  );
}
