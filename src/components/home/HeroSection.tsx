'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Calendar, Play } from 'lucide-react';
import { getActiveBanners } from '@/lib/services/banners';
import { getSiteConfig } from '@/lib/services/siteConfig';

type SlideOffset = {
  top?: number;
  left?: number;
};

type Slide = {
  image: string;
  title?: string;
  description: string;
  lang: string;
  ctaText?: string;
  ctaLink?: string;
  titleOffset?: SlideOffset;
  descriptionOffset?: SlideOffset;
  dividerOffset?: SlideOffset;
  showTitle?: boolean;
  showDescription?: boolean;
  showDivider?: boolean;
};

const fallbackSlides: Slide[] = [
  {
    image: '/images/banners/bg-1.png',
    description:
      'Connecting cultures, celebrating heritage, and building community. Our association proudly promotes the rich traditions and vibrant spirit of Assam and North East India, creating meaningful cultural bridges and empowering our community to thrive as an integral part of Dallas, USA\u2019s diverse multicultural landscape.',
    lang: 'en',
  },
  {
    image: '/images/banners/bg-2.png',
    description:
      '\u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4\u09BF\u0995 \u09B8\u0982\u09AF\u09CB\u0997 \u0997\u09A2\u09BC\u09BF \u09A4\u09C1\u09B2\u09BF, \u0990\u09A4\u09BF\u09B9\u09CD\u09AF \u0989\u09A6\u09AF\u09BE\u09AA\u09A8 \u0995\u09F0\u09BF \u0986\u09F0\u09C1 \u098F\u0995 \u09B6\u0995\u09CD\u09A4\u09BF\u09B6\u09BE\u09B2\u09C0 \u09B8\u09AE\u09BE\u099C \u0997\u09A2\u09BC\u09BE\u09F0 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF\u09F0\u09C7 \u0986\u09AE\u09BE\u09F0 \u09B8\u0982\u09B8\u09CD\u09A5\u09BE\u0987 \u0997\u09CC\u09F0\u09F1\u09C7\u09F0\u09C7 \u0985\u09B8\u09AE\u09F0 \u09B2\u0997\u09A4\u09C7 \u0989\u09A4\u09CD\u09A4\u09F0-\u09AA\u09C2\u09F0\u09CD\u09AC \u09AD\u09BE\u09F0\u09A4\u09F0 \u09B8\u09AE\u09C3\u09A6\u09CD\u09A7 \u09AA\u09F0\u09AE\u09CD\u09AA\u09F0\u09BE \u0986\u09F0\u09C1 \u09B8\u099C\u09C0\u09F1 \u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4\u09BF\u0995 \u0986\u0997\u09AC\u09A2\u09BC\u09BE\u0987 \u0986\u09B9\u09BF\u099B\u09C7\u0964 \u0986\u09AE\u09BF \u0985\u09F0\u09CD\u09A5\u09AC\u09B9 \u09B8\u09BE\u0982\u09B8\u09CD\u0995\u09C3\u09A4\u09BF\u0995 \u09B8\u09AE\u09CD\u09AA\u09F0\u09CD\u0995 \u09B8\u09CD\u09A5\u09BE\u09AA\u09A8 \u0995\u09F0\u09BF \u0986\u09AE\u09BE\u09F0 \u09B8\u09AE\u09BE\u099C\u0995 \u09B6\u0995\u09CD\u09A4\u09BF\u09B6\u09BE\u09B2\u09C0 \u0995\u09F0\u09BF \u09A4\u09C1\u09B2\u09BF\u09AC\u09B2\u09C8 \u09AA\u09CD\u09F0\u09A4\u09BF\u09B6\u09CD\u09F0\u09C1\u09A4\u09BF\u09AC\u09A6\u09CD\u09A7, \u09AF\u09BE\u09A4\u09C7 \u09A1\u09BE\u09B2\u09BE\u099B, \u0986\u09AE\u09C7\u09F0\u09BF\u0995\u09BE\u09F0 \u09AC\u09C8\u099A\u09BF\u09A4\u09CD\u09F0\u09AE\u09AF\u09BC \u09AC\u09B9\u09C1\u09B8\u09BE\u0982\u09B8\u09CD\u0995\u09C3\u09A4\u09BF\u0995 \u09B8\u09AE\u09BE\u099C\u09F0 \u098F\u0995 \u0985\u09AC\u09BF\u099A\u09CD\u099B\u09C7\u09A6\u09CD\u09AF \u0985\u0982\u09B6 \u09B9\u09BF\u099A\u09BE\u09AA\u09C7 \u0986\u09AE\u09BE\u09F0 \u09B8\u09AE\u09BE\u099C \u0989\u09A8\u09CD\u09A8\u09A4\u09BF \u09B2\u09BE\u09AD \u0995\u09F0\u09C7\u0964',
    lang: 'as',
  },
];

export function HeroSection() {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [intervalMs, setIntervalMs] = useState(15000);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    // Show fallback content after 3 seconds if data hasn't loaded
    const timeout = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 3000);

    async function loadData() {
      try {
        const [banners, config] = await Promise.all([
          getActiveBanners(),
          getSiteConfig(),
        ]);

        if (!cancelled) {
          if (config.bannerTransitionInterval && config.bannerTransitionInterval > 0) {
            setIntervalMs(config.bannerTransitionInterval * 1000);
          }

          if (banners.length > 0) {
            setSlides(
              banners.map(b => ({
                image: b.image,
                title: b.title,
                description: b.description,
                lang: b.lang || 'en',
                ctaText: b.ctaText,
                ctaLink: b.ctaLink,
                titleOffset: b.titleOffset,
                descriptionOffset: b.descriptionOffset,
                dividerOffset: b.dividerOffset,
                showTitle: b.showTitle !== false,
                showDescription: b.showDescription !== false,
                showDivider: b.showDivider === true,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load banners:', err);
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (el && window.innerWidth >= 768) {
      el.style.height = `${el.offsetHeight}px`;
    }
  }, []);

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs, paused]);

  const goTo = (index: number) => {
    setCurrent((index + slides.length) % slides.length);
  };

  const slide = slides[current];

  if (isLoading) {
    return (
      <section
        className="relative overflow-hidden bg-[#FAF6F0] flex items-center justify-center"
        style={{ height: 'calc(100vh - 80px)', minHeight: '550px' }}
      >
        <Spinner size="lg" />
      </section>
    );
  }

  return (
    <>
      {/* Hero section — image + title + description */}
      <section
        ref={sectionRef}
        className="relative overflow-hidden bg-[#FAF6F0]"
        style={{ height: 'calc(100vh - 80px)', minHeight: '550px' }}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Background Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt="Assamese cultural illustration"
              fill
              className="object-contain object-bottom"
              priority={current === 0}
              sizes="100vw"
              quality={100}
            />
          </motion.div>
        </AnimatePresence>

        {/* Offset styles — only apply left offsets on md+ screens */}
        <style>{`
          .hero-offset {
            top: 0;
            left: 0;
          }
          @media (min-width: 768px) {
            .hero-offset {
              top: var(--offset-top, 0px);
              left: var(--offset-left, 0px);
            }
          }
        `}</style>

        {/* Content overlay */}
        <div className="absolute inset-0 z-10">
          {/* Title + Description — pushed down on mobile, higher on desktop */}
          <div className="absolute left-1/2 -translate-x-1/2 px-4 sm:px-0 top-[18%] sm:top-[14%] md:top-[12%]" style={{ width: '92%', maxWidth: '650px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${current}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {slide.showTitle !== false && (
                  <h1
                    className="font-heading font-extrabold leading-tight mb-1 relative hero-offset whitespace-nowrap"
                    style={{
                      '--offset-top': slide.titleOffset?.top ? `${slide.titleOffset.top * 96}px` : '0px',
                      '--offset-left': slide.titleOffset?.left ? `${slide.titleOffset.left * 96}px` : '0px',
                    } as React.CSSProperties}
                  >
                    <span
                      className="text-gamosa-600 drop-shadow-sm tracking-tight"
                      style={{ fontSize: 'clamp(1.25rem, 5vw, 3.5rem)' }}
                    >
                      {slide.title || 'Assam in Dallas'}
                    </span>
                    <span
                      className="text-muga-500 font-bold italic ml-1 sm:ml-2"
                      style={{ fontSize: 'clamp(0.85rem, 3vw, 2.2rem)' }}
                    >
                      USA
                    </span>
                  </h1>
                )}

                {slide.showDivider === true && (
                  <div
                    className="flex items-center gap-1.5 justify-center mb-2 mt-2 relative hero-offset"
                    style={{
                      '--offset-top': slide.dividerOffset?.top ? `${slide.dividerOffset.top * 96}px` : '0px',
                      '--offset-left': slide.dividerOffset?.left ? `${slide.dividerOffset.left * 96}px` : '0px',
                    } as React.CSSProperties}
                  >
                    <div className="h-[3px] w-10 bg-gamosa-500 rounded-full" />
                    <div className="h-[3px] w-6 bg-muga-500 rounded-full" />
                    <div className="h-[3px] w-3 bg-tea-500 rounded-full" />
                    <div className="h-[3px] w-6 bg-muga-500 rounded-full" />
                    <div className="h-[3px] w-10 bg-gamosa-500 rounded-full" />
                  </div>
                )}

                {slide.showDescription !== false && (
                  <div
                    className={`text-earth-700 relative hero-offset ${
                      slide.lang === 'as'
                        ? 'font-assamese'
                        : 'font-heading font-medium italic'
                    }`}
                    style={{
                      fontSize: 'clamp(0.7rem, 1.6vw, 1.1rem)',
                      lineHeight: 1.7,
                      '--offset-top': slide.descriptionOffset?.top ? `${slide.descriptionOffset.top * 96}px` : '0px',
                      '--offset-left': slide.descriptionOffset?.left ? `${slide.descriptionOffset.left * 96}px` : '0px',
                    } as React.CSSProperties}
                    dangerouslySetInnerHTML={{ __html: slide.description }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicators + Buttons — desktop only (md+), positioned at 85%/90% */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2.5" style={{ top: '85%' }}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === current
                    ? 'w-8 h-2.5 bg-gamosa-500'
                    : 'w-2.5 h-2.5 bg-earth-400/40 hover:bg-earth-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="hidden md:block absolute left-1/2 -translate-x-1/2" style={{ top: '90%' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`btn-${current}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center justify-center gap-3"
              >
                <Link href="/events">
                  <Button
                    size="md"
                    leftIcon={<Calendar className="h-4 w-4" />}
                    className="shadow-md"
                    style={{ fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)' }}
                  >
                    Upcoming Events
                  </Button>
                </Link>
                <Link href="/performances">
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={<Play className="h-4 w-4" />}
                    className="shadow-md bg-white/70 backdrop-blur-sm"
                    style={{ fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)' }}
                  >
                    Watch Performances
                  </Button>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => goTo(current - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/60 backdrop-blur-sm border border-earth-200/50 flex items-center justify-center text-earth-500 hover:bg-white hover:text-gamosa-600 transition-all"
          aria-label="Previous slide"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => goTo(current + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/60 backdrop-blur-sm border border-earth-200/50 flex items-center justify-center text-earth-500 hover:bg-white hover:text-gamosa-600 transition-all"
          aria-label="Next slide"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* Mobile-only buttons — rendered BELOW the hero section so they never cover the image */}
      <div className="md:hidden bg-[#FAF6F0] py-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                index === current
                  ? 'w-8 h-2.5 bg-gamosa-500'
                  : 'w-2.5 h-2.5 bg-earth-400/40 hover:bg-earth-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/events">
            <Button size="md" leftIcon={<Calendar className="h-4 w-4" />} className="shadow-md text-sm">
              Upcoming Events
            </Button>
          </Link>
          <Link href="/performances">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Play className="h-4 w-4" />}
              className="shadow-md bg-white/70 backdrop-blur-sm text-sm"
            >
              Watch Performances
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
