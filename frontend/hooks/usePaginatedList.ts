'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getErrorMessage } from '@/lib/api';
import { PaginatedResult } from '@/lib/api/mappers';

interface UsePaginatedListOptions<TParams extends Record<string, unknown>> {
  fetcher: (params: TParams & { page: number; limit: number; search?: string }) => Promise<PaginatedResult<unknown>>;
  itemsPerPage?: number;
  enabled?: boolean;
  resetDeps?: unknown[];
  extraParams?: Omit<TParams, 'page' | 'limit' | 'search'>;
}

export function usePaginatedList<TParams extends Record<string, unknown> = Record<string, never>>({
  fetcher,
  itemsPerPage = 8,
  enabled = true,
  resetDeps = [],
  extraParams = {} as Omit<TParams, 'page' | 'limit' | 'search'>,
}: UsePaginatedListOptions<TParams>) {
  const [items, setItems] = useState<unknown[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const debouncedSearch = useDebouncedValue(searchTerm);

  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
    setHasLoaded(false);
    setItems([]);
    setTotal(0);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const loadItems = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      const silent = options?.silent ?? hasLoaded;

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError('');

      try {
        const response = await fetcher({
          ...(extraParams as TParams),
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch || undefined,
        });

        setItems(response.items);
        setTotalPages(Math.max(1, response.totalPages));
        setTotal(response.total);
        setHasLoaded(true);
      } catch (loadError) {
        setItems([]);
        setError(getErrorMessage(loadError, 'Failed to load data'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [enabled, hasLoaded, fetcher, extraParams, currentPage, debouncedSearch, itemsPerPage],
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const refreshAfterMutation = useCallback(async () => {
    if (items.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
      return;
    }

    await loadItems({ silent: true });
  }, [items.length, currentPage, loadItems]);

  return {
    items,
    searchTerm,
    debouncedSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    isLoading,
    isRefreshing,
    error,
    loadItems,
    handleSearch,
    refreshAfterMutation,
  };
}
