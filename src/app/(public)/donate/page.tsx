'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Heart, Shield, ExternalLink, HeartOff } from 'lucide-react';
import { getSiteConfig, type SiteConfig, DEFAULT_SITE_CONFIG } from '@/lib/services/siteConfig';
import { getActiveDonationEvent, DEFAULT_DONATION_EVENT, type DonationEventWithId } from '@/lib/services/donationEvents';

export default function DonatePage() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [event, setEvent] = useState<DonationEventWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [cfg, evt] = await Promise.all([
          getSiteConfig(),
          getActiveDonationEvent(),
        ]);
        setConfig(cfg);
        setEvent(evt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const title = event?.title || DEFAULT_DONATION_EVENT.title;
  const description = event?.description || DEFAULT_DONATION_EVENT.description;
  const goal = event?.goal ?? DEFAULT_DONATION_EVENT.goal ?? 0;
  const rawAmounts = event?.amounts?.filter(a => a > 0);
  const amounts = rawAmounts && rawAmounts.length > 0 ? rawAmounts : DEFAULT_DONATION_EVENT.amounts;
  const amount = selectedAmount || Number(customAmount) || 0;

  const handlePayPalDonate = () => {
    if (!config.paypalEmail) return;
    const paypalUrl = new URL('https://www.paypal.com/donate');
    paypalUrl.searchParams.set('business', config.paypalEmail);
    paypalUrl.searchParams.set('currency_code', 'USD');
    paypalUrl.searchParams.set('item_name', `Donation - ${title}`);
    if (amount > 0) {
      paypalUrl.searchParams.set('amount', String(amount));
    }
    paypalUrl.searchParams.set('return', window.location.origin + '/donate/thank-you');
    window.open(paypalUrl.toString(), '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!config.donationsEnabled) {
    return (
      <>
        <PageHeader title="Support Our Community" breadcrumbs={[{ label: 'Donate' }]} />
        <section className="py-12 lg:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <HeartOff className="h-12 w-12 text-earth-300 mx-auto mb-4" />
            <p className="text-earth-500 font-medium">Donations are currently not being accepted.</p>
            <p className="text-earth-400 text-sm mt-2">Please check back later.</p>
          </div>
        </section>
      </>
    );
  }

  if (!config.paypalEmail) {
    return (
      <>
        <PageHeader title={title} description={description} breadcrumbs={[{ label: 'Donate' }]} />
        <section className="py-12 lg:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <Heart className="h-12 w-12 text-earth-300 mx-auto mb-4" />
            <p className="text-earth-500 font-medium">Donations are being set up.</p>
            <p className="text-earth-400 text-sm mt-2">Please check back soon.</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={title} description={description} breadcrumbs={[{ label: 'Donate' }]} />
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <h3 className="font-heading font-semibold text-lg text-earth-800 mb-4">Choose an Amount</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {amounts.map(amt => (
                    <button
                      key={amt}
                      onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        selectedAmount === amt
                          ? 'border-gamosa-500 bg-gamosa-50 shadow-md'
                          : 'border-earth-200 hover:border-gamosa-300 hover:bg-earth-50'
                      }`}
                    >
                      <p className="text-xl font-bold text-earth-800">${amt}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">Or enter a custom amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                    placeholder="Enter amount"
                    className="block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500"
                  />
                </div>
              </Card>

              <div className="bg-earth-100 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-earth-500">Donation Amount</p>
                  <p className="text-3xl font-bold text-earth-800">${amount || '\u2014'}</p>
                </div>
                <button
                  onClick={handlePayPalDonate}
                  disabled={amount < 1}
                  className="inline-flex items-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.612A.782.782 0 0 1 5.717 2h5.176c3.073 0 5.196 2.054 4.748 5.092-.49 3.324-3.3 5.26-6.283 5.26H7.513l-1.42 8.217a.641.641 0 0 1-.633.538l-.384.23z"/>
                    <path d="M19.867 7.058c-.49 3.324-3.3 5.26-6.283 5.26h-1.845l-1.42 8.217a.641.641 0 0 1-.633.538h-2.95l.258-1.494.115-.666 1.097-6.348.072-.413h3.487c3.884 0 6.905-2.638 7.497-6.665a5.548 5.548 0 0 0 .605 1.571z" opacity=".7"/>
                  </svg>
                  Donate with PayPal
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {goal > 0 && (
                <Card>
                  <h3 className="font-heading font-semibold text-earth-800 mb-3">Fundraising Goal</h3>
                  <p className="text-2xl font-bold text-gamosa-600">${goal.toLocaleString()}</p>
                  <p className="text-xs text-earth-400 mt-1">Help us reach our goal!</p>
                </Card>
              )}
              <Card>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-tea-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-earth-700 text-sm">Secure Payment</p>
                      <p className="text-xs text-earth-500">Powered by PayPal</p>
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
