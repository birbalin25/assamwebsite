'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns, data, keyField, onRowClick, searchPlaceholder = 'Search...'
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = String(a[sortKey] ?? '');
        const bVal = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      })
    : filtered;

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full max-w-sm pl-10 pr-4 py-2 rounded-lg border border-earth-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-earth-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-earth-50 border-b border-earth-200">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-earth-600',
                    col.sortable && 'cursor-pointer select-none hover:text-earth-800'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {sorted.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-earth-400">No results found.</td></tr>
            ) : (
              sorted.map(item => (
                <tr
                  key={String(item[keyField])}
                  className={cn('bg-white hover:bg-earth-50 transition-colors', onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-earth-700">
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-earth-400 mt-2">{sorted.length} of {data.length} results</p>
    </div>
  );
}
