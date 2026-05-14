import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm text-earth-500', className)}>
      <Link href="/" className="hover:text-gamosa-500 transition-colors" aria-label="Home">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2 text-earth-300" />
          {item.href ? (
            <Link href={item.href} className="hover:text-gamosa-500 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-earth-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
