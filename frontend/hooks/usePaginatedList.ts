'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Use a ref instead of state for hasLoaded.
  // If it were state, every successful fetch would flip it true → recreate
  // loadItems (it was in the useCallback dep array) → re-trigger the effect
  // → fire another fetch → on any transient failure, show the error banner.
  // This was the root cause of the flickering "Failed to load hosted zones".
  const hasLoadedRef = useRef(false);

  // AbortController ref lets us cancel the previous in-flight request before
  // starting a new one, preventing a race where a slow/failing stale request
  // overwrites the result of a newer, faster request with an error.
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm);

  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
    hasLoadedRef.current = false;
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

      // Cancel the previous request if it's still in-flight.
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const silent = options?.silent ?? hasLoadedRef.current;

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

        // If this request was aborted (superseded by a newer one), ignore the result.
        if (controller.signal.aborted) return;

        setItems(response.items);
        setTotalPages(Math.max(1, response.totalPages));
        setTotal(response.total);
        hasLoadedRef.current = true;
      } catch (loadError: unknown) {
        // Don't update state for intentionally cancelled requests.
        if (controller.signal.aborted) return;

        const isAbortError =
          loadError instanceof Error && loadError.name === 'AbortError';

        if (!isAbortError) {
          setItems([]);
          setError(getErrorMessage(loadError, 'Failed to load data'));
        }
      } finally {
        // Only update loading state if this is still the active request.
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    // hasLoadedRef is intentionally omitted — it's a ref, read at call time,
    // not a reactive value. Including it would re-introduce the re-fetch loop.
    [enabled, fetcher, extraParams, currentPage, debouncedSearch, itemsPerPage],
  );

  useEffect(() => {
    loadItems();

    // Cancel the in-flight request when the component unmounts or the effect
    // re-runs (e.g. page navigation), so we never call setState on an
    // unmounted component.
    return () => {
      abortControllerRef.current?.abort();
    };
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
