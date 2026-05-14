'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { useAuth } from '@/providers/AuthProvider';
import {
  LayoutDashboard, Calendar, Music, Users, Image, FolderOpen, Megaphone, Mail, Send,
  Presentation, Heart, LogOut, ArrowLeft, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SiteLogo } from '@/components/shared/SiteLogo';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  Music: <Music className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Image: <Image className="h-5 w-5" />,
  FolderOpen: <FolderOpen className="h-5 w-5" />,
  Megaphone: <Megaphone className="h-5 w-5" />,
  Mail: <Mail className="h-5 w-5" />,
  Presentation: <Presentation className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Send: <Send className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
};

import { adminNavLinks } from '@/lib/constants/navigation';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  };

  return (
    <aside className="w-64 bg-earth-800 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-earth-700">
        <Link href="/admin" className="flex items-center gap-3">
          <SiteLogo size="sm" />
          <span className="font-heading font-bold text-white">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {adminNavLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gamosa-500 text-white'
                  : 'text-earth-400 hover:text-white hover:bg-earth-700'
              )}
            >
              {iconMap[link.icon]}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-earth-700 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-earth-400 hover:text-white hover:bg-earth-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-earth-400 hover:text-white hover:bg-earth-700 rounded-lg transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
        {user && (
          <p className="px-3 text-xs text-earth-500 truncate">{user.email}</p>
        )}
      </div>
    </aside>
  );
}
