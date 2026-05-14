import { PageHeader } from '@/components/layout/PageHeader';
import { DonationForm } from '@/components/donate/DonationForm';
import { DonationImpact } from '@/components/donate/DonationImpact';
import { Card } from '@/components/ui/Card';
import { Heart, Shield, RefreshCcw } from 'lucide-react';

export const metadata = {
  title: 'Donate',
  description: 'Support the Assamese community in the USA through your generous donations.',
};

export default function DonatePage() {
  return (
    <>
      <PageHeader
        title="Support Our Community"
        description="Your generous donation helps us preserve Assamese culture and organize community events across the USA."
        breadcrumbs={[{ label: 'Donate' }]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DonationForm />
            </div>
            <div className="space-y-6">
              <DonationImpact current={4250} goal={10000} />
              <Card>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-tea-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-earth-700 text-sm">Secure Payment</p>
                      <p className="text-xs text-earth-500">Powered by Stripe</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <RefreshCcw className="h-5 w-5 text-muga-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-earth-700 text-sm">Tax Deductible</p>
                      <p className="text-xs text-earth-500">You&apos;ll receive a receipt</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-gamosa-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-earth-700 text-sm">100% for Community</p>
                      <p className="text-xs text-earth-500">All funds support events & programs</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
