'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { mainNavLinks } from '@/lib/constants/navigation';
import { SiteLogo } from '@/components/shared/SiteLogo';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled ? 'glass shadow-md' : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <SiteLogo size="md" className="group-hover:opacity-90 transition-opacity" />
            <div className="hidden sm:block">
              <div className={cn(
                'font-heading font-bold text-lg leading-tight transition-colors',
                isScrolled ? 'text-earth-800' : 'text-earth-800'
              )}>
                Assam in Dallas
              </div>
              <div className="text-xs text-muga-600 font-medium tracking-wider uppercase">USA</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-gamosa-600 bg-gamosa-50'
                    : 'text-earth-600 hover:text-gamosa-500 hover:bg-earth-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Donate Button + Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <Link href="/donate" className="hidden sm:block">
              <Button variant="secondary" size="sm" leftIcon={<Heart className="h-4 w-4" />}>
                Donate
              </Button>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-earth-600 hover:bg-earth-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-earth-200 shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname === link.href
                      ? 'text-gamosa-600 bg-gamosa-50'
                      : 'text-earth-600 hover:text-gamosa-500 hover:bg-earth-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/donate" className="block pt-2">
                <Button variant="secondary" size="md" leftIcon={<Heart className="h-4 w-4" />} className="w-full">
                  Donate
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
