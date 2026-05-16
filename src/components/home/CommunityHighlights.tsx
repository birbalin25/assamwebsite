'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Star } from 'lucide-react';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSiteConfig, DEFAULT_SITE_CONFIG, type SiteConfig } from '@/lib/services/siteConfig';

export function CommunityHighlights() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    getSiteConfig().then(setConfig).catch(console.error);
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-earth-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-12">
            <span className="text-tea-500 font-medium text-sm tracking-wider uppercase">Our People</span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-earth-800 mt-2">
              Community Highlights
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8">
          <AnimatedSection direction="left">
            <Card className="h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gamosa-100 rounded-xl flex items-center justify-center shrink-0">
                  <Star className="h-6 w-6 text-gamosa-500" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-earth-800 mb-2">
                    {config.highlightPerformersTitle}
                  </h3>
                  <div className="text-earth-500 text-sm leading-relaxed mb-4 [&_p]:m-0"
                    dangerouslySetInnerHTML={{ __html: config.highlightPerformersDescription }}
                  />
                  <Link href="/performances">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      View Performances
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </AnimatedSection>

          <AnimatedSection direction="right">
            <Card className="h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-tea-100 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6 text-tea-500" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-earth-800 mb-2">
                    {config.highlightCommunityTitle}
                  </h3>
                  <div className="text-earth-500 text-sm leading-relaxed mb-4 [&_p]:m-0"
                    dangerouslySetInnerHTML={{ __html: config.highlightCommunityDescription }}
                  />
                  <Link href="/community">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Meet Our Community
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
