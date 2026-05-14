'use client';

import { useState, useCallback } from 'react';

interface UsePaginationOptions<T> {
  fetchFn: (pageSize: number, lastDoc?: unknown) => Promise<{ items: T[]; lastDoc: unknown; hasMore: boolean }>;
  pageSize?: number;
}

export function usePagination<T>({ fetchFn, pageSize = 20 }: UsePaginationOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<unknown>(undefined);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const result = await fetchFn(pageSize, lastDoc);
      setItems(prev => [...prev, ...result.items]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pageSize, lastDoc, loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setLastDoc(undefined);
    setHasMore(true);
  }, []);

  return { items, loading, hasMore, loadMore, reset };
}
