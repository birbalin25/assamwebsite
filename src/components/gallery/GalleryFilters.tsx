'use client';

import { FilterBar } from '@/components/shared/FilterBar';
import { YearFilter } from '@/components/events/YearFilter';

interface GalleryFiltersProps {
  years: number[];
  activeYear: number | null;
  onYearChange: (year: number | null) => void;
  categories?: { value: string; label: string }[];
  activeCategory?: string;
  onCategoryChange?: (value: string) => void;
}

export function GalleryFilters({
  years,
  activeYear,
  onYearChange,
  categories,
  activeCategory,
  onCategoryChange,
}: GalleryFiltersProps) {
  return (
    <div className="space-y-4">
      <YearFilter years={years} activeYear={activeYear} onYearChange={onYearChange} />
      {categories && onCategoryChange && (
        <FilterBar
          filters={categories}
          activeFilter={activeCategory || ''}
          onFilterChange={onCategoryChange}
        />
      )}
    </div>
  );
}
