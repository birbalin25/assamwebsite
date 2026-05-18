import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Heart, ArrowRight, Share2 } from 'lucide-react';
import { generatePageMeta } from '@/lib/constants/seo';

export const metadata = generatePageMeta(
  'Thank You',
  'Thank you for your generous donation to the Assamese community in Dallas.'
);

export default function ThankYouPage() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-20 h-20 bg-gamosa-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="h-10 w-10 text-gamosa-500 fill-gamosa-500" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-heading font-bold text-earth-800 mb-4">
          Thank You for Your Generosity!
        </h1>
        <p className="text-lg text-earth-500 mb-8">
          Your donation makes a real difference in preserving Assamese culture and strengthening
          our community across the United States. A receipt has been sent to your email.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Back to Home</Button>
          </Link>
          <Button variant="outline" leftIcon={<Share2 className="h-4 w-4" />}>
            Share
          </Button>
        </div>
      </div>
    </section>
  );
}
