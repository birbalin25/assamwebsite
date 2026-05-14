import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Timestamp } from '@/types';

export function formatDate(timestamp: Timestamp | Date | string, fmt: string = 'MMMM d, yyyy'): string {
  if (typeof timestamp === 'string') return format(parseISO(timestamp), fmt);
  if (timestamp instanceof Date) return format(timestamp, fmt);
  return format(new Date(timestamp.seconds * 1000), fmt);
}

export function formatRelativeDate(timestamp: Timestamp | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date((timestamp as Timestamp).seconds * 1000);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function timestampToDate(timestamp: Timestamp): Date {
  return new Date(timestamp.seconds * 1000);
}
