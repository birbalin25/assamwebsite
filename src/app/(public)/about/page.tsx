'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { Heart, Users, Award, Globe, Star, Lightbulb, Shield, Handshake } from 'lucide-react';
import { getSiteConfig, DEFAULT_SITE_CONFIG, type SiteConfig } from '@/lib/services/siteConfig';

const iconPool = [Heart, Users, Award, Globe, Star, Lightbulb, Shield, Handshake];

interface ValueItem {
  title: string;
  description: string;
}

function getValues(config: SiteConfig): ValueItem[] {
  if (config.aboutValues) {
    try {
      const parsed = JSON.parse(config.aboutValues);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* fall through */ }
  }
  // Fallback to legacy fields
  return [
    { title: config.aboutValue1Title || DEFAULT_SITE_CONFIG.aboutValue1Title!, description: config.aboutValue1Description || DEFAULT_SITE_CONFIG.aboutValue1Description! },
    { title: config.aboutValue2Title || DEFAULT_SITE_CONFIG.aboutValue2Title!, description: config.aboutValue2Description || DEFAULT_SITE_CONFIG.aboutValue2Description! },
    { title: config.aboutValue3Title || DEFAULT_SITE_CONFIG.aboutValue3Title!, description: config.aboutValue3Description || DEFAULT_SITE_CONFIG.aboutValue3Description! },
    { title: config.aboutValue4Title || DEFAULT_SITE_CONFIG.aboutValue4Title!, description: config.aboutValue4Description || DEFAULT_SITE_CONFIG.aboutValue4Description! },
  ];
}

function getStoryHtml(config: SiteConfig): string {
  if (config.aboutStoryContent) return config.aboutStoryContent;
  // Fallback to legacy paragraphs
  const p1 = config.aboutStoryParagraph1 || DEFAULT_SITE_CONFIG.aboutStoryParagraph1 || '';
  const p2 = config.aboutStoryParagraph2 || DEFAULT_SITE_CONFIG.aboutStoryParagraph2 || '';
  return `<p>${p1}</p>${p2 ? `<p>${p2}</p>` : ''}`;
}

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

  const values = getValues(config);
  const storyHtml = getStoryHtml(config);

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
              <div
                className="text-earth-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: storyHtml }}
              />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h2 className="text-2xl font-heading font-bold text-earth-800 mb-6">Our Values</h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {values.map((value, i) => {
                const Icon = iconPool[i % iconPool.length];
                return (
                  <Card key={i} hover>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gamosa-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-gamosa-500" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-earth-800 mb-1">{value.title}</h3>
                        <p className="text-sm text-earth-500">{value.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
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
