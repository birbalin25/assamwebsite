'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { cn } from '@/lib/utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: React.ReactNode;
  className?: string;
  showBack?: boolean;
}

export function PageHeader({ title, description, breadcrumbs, children, className, showBack = true }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn('bg-earth-800 muga-texture', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-earth-400 hover:text-muga-400 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
        )}
        {breadcrumbs && (
          <Breadcrumb items={breadcrumbs} className="mb-4 [&_a]:text-earth-400 [&_a:hover]:text-muga-400 [&_span]:text-earth-300 [&_svg]:text-earth-600" />
        )}
        <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-earth-300 text-lg max-w-2xl">{description}</p>
        )}
        {children}
      </div>
      <div className="gamosa-border-top" />
    </div>
  );
}
