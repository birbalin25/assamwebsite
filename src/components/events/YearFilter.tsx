'use client';

import { cn } from '@/lib/utils/cn';

interface YearFilterProps {
  years: number[];
  activeYear: number | null;
  onYearChange: (year: number | null) => void;
}

export function YearFilter({ years, activeYear, onYearChange }: YearFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onYearChange(null)}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-full transition-colors',
          activeYear === null ? 'bg-gamosa-500 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
        )}
      >
        All Years
      </button>
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onYearChange(year)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-full transition-colors',
            activeYear === year ? 'bg-gamosa-500 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
          )}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
