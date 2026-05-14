import { Globe, Camera, PlayCircle, ExternalLink } from 'lucide-react';
import { socialLinks } from '@/lib/constants/navigation';

const links = [
  { name: 'Facebook', href: socialLinks.facebook, icon: Globe, color: 'hover:text-blue-600' },
  { name: 'Instagram', href: socialLinks.instagram, icon: Camera, color: 'hover:text-pink-600' },
  { name: 'YouTube', href: socialLinks.youtube, icon: PlayCircle, color: 'hover:text-red-600' },
];

export function SocialLinks() {
  return (
    <div className="space-y-3">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-earth-200 text-earth-600 hover:border-earth-300 transition-colors ${link.color}`}
        >
          <link.icon className="h-5 w-5" />
          <span className="font-medium text-sm">{link.name}</span>
          <ExternalLink className="h-4 w-4 ml-auto text-earth-400" />
        </a>
      ))}
    </div>
  );
}
