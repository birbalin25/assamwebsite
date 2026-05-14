export type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

export type WithId<T> = T & { id: string };

export type SortDirection = 'asc' | 'desc';

export type PaginatedResult<T> = {
  items: T[];
  lastDoc: unknown;
  hasMore: boolean;
};
