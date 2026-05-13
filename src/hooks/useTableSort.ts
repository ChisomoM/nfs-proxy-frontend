import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableSortState<T> {
  sorted: T[];
  sortColumn: string | null;
  sortDirection: SortDirection;
  handleSort: (column: string) => void;
}

function parseNumeric(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value);
}

function isAmountString(value: string): boolean {
  return /^[A-Z]{2,3}\s[\d,]+/.test(value);
}

function compareValues(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;

  if (typeof a === 'string' && typeof b === 'string') {
    if (isAmountString(a) && isAmountString(b)) {
      return parseNumeric(a) - parseNumeric(b);
    }
    if (isDateString(a) && isDateString(b)) {
      return new Date(a).getTime() - new Date(b).getTime();
    }
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  }

  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
}

export function useTableSort<T extends object>(
  data: T[]
): TableSortState<T> {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;
    return [...data].sort((a, b) => {
      const row = a as Record<string, unknown>;
      const rowB = b as Record<string, unknown>;
      const cmp = compareValues(row[sortColumn], rowB[sortColumn]);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [data, sortColumn, sortDirection]);

  return { sorted, sortColumn, sortDirection, handleSort };
}
