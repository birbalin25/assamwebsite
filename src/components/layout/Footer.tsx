import Link from 'next/link';
import { Globe, Camera, PlayCircle, Mail, MapPin, Heart } from 'lucide-react';
import { socialLinks } from '@/lib/constants/navigation';
import { siteConfig } from '@/lib/constants/seo';
import { SiteLogo } from '@/components/shared/SiteLogo';

const footerLinks = {
  explore: [
    { label: 'Events', href: '/events' },
    { label: 'Performances', href: '/performances' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Artists', href: '/artists' },
  ],
  community: [
    { label: 'About Us', href: '/about' },
    { label: 'Community', href: '/community' },
    { label: 'News', href: '/news' },
    { label: 'Contact', href: '/contact' },
  ],
  support: [
    { label: 'Donate', href: '/donate' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-earth-800 text-earth-200">
      {/* Gamosa Border Top */}
      <div className="gamosa-border-top" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <SiteLogo size="md" />
              <div>
                <div className="font-heading font-bold text-lg text-white leading-tight">
                  Assam in Dallas
                </div>
                <div className="text-xs text-muga-400 font-medium tracking-wider uppercase">USA</div>
              </div>
            </Link>
            <p className="text-earth-400 text-sm leading-relaxed mb-4">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-3">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-earth-700 hover:bg-gamosa-500 text-earth-300 hover:text-white transition-colors" aria-label="Facebook">
                <Globe className="h-5 w-5" />
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-earth-700 hover:bg-gamosa-500 text-earth-300 hover:text-white transition-colors" aria-label="Instagram">
                <Camera className="h-5 w-5" />
              </a>
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gamosa-500 hover:bg-gamosa-600 text-white transition-colors" aria-label="YouTube">
                <PlayCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-earth-400 hover:text-muga-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-earth-400 hover:text-muga-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-earth-400">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-muga-400" />
                <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-muga-400 transition-colors">
                  {siteConfig.contactEmail}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-earth-400">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muga-400" />
                <span>United States</span>
              </li>
            </ul>
            <Link href="/donate" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-muga-500 hover:bg-muga-600 text-white text-sm font-medium rounded-lg transition-colors">
              <Heart className="h-4 w-4" />
              Support Us
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-earth-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-earth-500">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-sm text-earth-500">
              Made with <Heart className="inline h-3 w-3 text-gamosa-500 mx-1" /> for the Assamese diaspora
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
