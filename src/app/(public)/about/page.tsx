'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { Heart, Users, Award, Globe } from 'lucide-react';
import { getSiteConfig, DEFAULT_SITE_CONFIG, type SiteConfig } from '@/lib/services/siteConfig';

const icons = [Heart, Users, Award, Globe];

export default function AboutPage() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteConfig().then(setConfig).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const values = [
    { icon: icons[0], title: config.aboutValue1Title || DEFAULT_SITE_CONFIG.aboutValue1Title!, description: config.aboutValue1Description || DEFAULT_SITE_CONFIG.aboutValue1Description! },
    { icon: icons[1], title: config.aboutValue2Title || DEFAULT_SITE_CONFIG.aboutValue2Title!, description: config.aboutValue2Description || DEFAULT_SITE_CONFIG.aboutValue2Description! },
    { icon: icons[2], title: config.aboutValue3Title || DEFAULT_SITE_CONFIG.aboutValue3Title!, description: config.aboutValue3Description || DEFAULT_SITE_CONFIG.aboutValue3Description! },
    { icon: icons[3], title: config.aboutValue4Title || DEFAULT_SITE_CONFIG.aboutValue4Title!, description: config.aboutValue4Description || DEFAULT_SITE_CONFIG.aboutValue4Description! },
  ];

  return (
    <>
      <PageHeader
        title={config.aboutTitle || 'About Us'}
        description={config.aboutDescription || DEFAULT_SITE_CONFIG.aboutDescription}
        breadcrumbs={[{ label: 'About' }]}
      />

      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="prose prose-earth max-w-none mb-12">
              <h2 className="font-heading text-earth-800">{config.aboutStoryTitle || 'Our Story'}</h2>
              <p className="text-earth-600 leading-relaxed">
                {config.aboutStoryParagraph1 || DEFAULT_SITE_CONFIG.aboutStoryParagraph1}
              </p>
              <p className="text-earth-600 leading-relaxed">
                {config.aboutStoryParagraph2 || DEFAULT_SITE_CONFIG.aboutStoryParagraph2}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h2 className="text-2xl font-heading font-bold text-earth-800 mb-6">Our Values</h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {values.map((value) => (
                <Card key={value.title} hover>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gamosa-100 rounded-lg flex items-center justify-center shrink-0">
                      <value.icon className="h-5 w-5 text-gamosa-500" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-earth-800 mb-1">{value.title}</h3>
                      <p className="text-sm text-earth-500">{value.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <h2 className="text-2xl font-heading font-bold text-earth-800 mb-6">Our Mission</h2>
            <Card className="bg-earth-800 text-white border-earth-700">
              <p className="text-earth-200 leading-relaxed text-lg font-heading italic">
                &ldquo;{config.aboutMission || DEFAULT_SITE_CONFIG.aboutMission}&rdquo;
              </p>
            </Card>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
