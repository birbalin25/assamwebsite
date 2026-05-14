'use client';

import { cn } from '@/lib/utils/cn';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  className?: string;
  allLabel?: string;
}

export function FilterBar({ filters, activeFilter, onFilterChange, className, allLabel = 'All' }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onFilterChange('')}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-full transition-colors',
          activeFilter === ''
            ? 'bg-gamosa-500 text-white'
            : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
        )}
      >
        {allLabel}
      </button>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-full transition-colors',
            activeFilter === filter.value
              ? 'bg-gamosa-500 text-white'
              : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
