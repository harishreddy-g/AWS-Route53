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

  // ── Refs for values that must NOT appear in useCallback dep arrays ──────
  //
  // hasLoadedRef: if this were state, every successful fetch would flip it
  // true → recreate loadItems (dep change) → useEffect fires → fetch again.
  const hasLoadedRef = useRef(false);

  // abortControllerRef: cancels the previous in-flight request so a stale
  // slow/failing response never overwrites a newer successful one.
  const abortControllerRef = useRef<AbortController | null>(null);

  // fetcherRef: inline arrow functions (e.g. `(p) => healthChecks.list(p)`)
  // get a new reference on every render. Keeping fetcher in a ref means
  // we always call the latest version without it being a dep → no loop.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher; // update synchronously each render

  // extraParamsRef: the default value `{}` is a brand-new object on every
  // render. If extraParams were in the useCallback dep array it would be
  // "changed" every render → loadItems recreated → useEffect fires → loop.
  const extraParamsRef = useRef(extraParams);
  extraParamsRef.current = extraParams; // update synchronously each render

  // ────────────────────────────────────────────────────────────────────────

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

      // Cancel any previous in-flight request.
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // After the first successful load, subsequent calls are "silent"
      // (show a refresh spinner instead of the full loading skeleton).
      const silent = options?.silent ?? hasLoadedRef.current;

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      try {
        const response = await fetcherRef.current({
          ...(extraParamsRef.current as TParams),
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch || undefined,
        });

        // Ignore results from superseded (aborted) requests.
        if (controller.signal.aborted) return;

        setItems(response.items);
        setTotalPages(Math.max(1, response.totalPages));
        setTotal(response.total);
        hasLoadedRef.current = true;
      } catch (loadError: unknown) {
        if (controller.signal.aborted) return;

        const isAbortError =
          loadError instanceof Error && loadError.name === 'AbortError';

        if (!isAbortError) {
          setItems([]);
          setError(getErrorMessage(loadError, 'Failed to load data'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    // fetcher → fetcherRef, extraParams → extraParamsRef, hasLoadedRef is a ref.
    // None of these are deps; they are read from refs at call time.
    // The only real triggers for a new fetch are page/search/itemsPerPage/enabled.
    [enabled, currentPage, debouncedSearch, itemsPerPage],
  );

  useEffect(() => {
    loadItems();
    return () => {
      // Cancel in-flight request on unmount / dep change so we never call
      // setState on an unmounted component.
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
