'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getErrorMessage, hostedZones } from '@/lib/api';
import { HostedZone } from '@/types/hosted-zone';

interface UseHostedZonesListOptions {
  itemsPerPage?: number;
}

export function useHostedZonesList({ itemsPerPage = 8 }: UseHostedZonesListOptions = {}) {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const debouncedSearch = useDebouncedValue(searchTerm);

  const loadZones = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? hasLoaded;

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError('');

      try {
        const response = await hostedZones.list({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch || undefined,
        });

        setZones(response.items);
        setTotalPages(Math.max(1, response.totalPages));
        setTotal(response.total);
        setHasLoaded(true);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Failed to load hosted zones'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, debouncedSearch, hasLoaded, itemsPerPage],
  );

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const refreshAfterMutation = useCallback(async () => {
    if (zones.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
      return;
    }

    await loadZones({ silent: true });
  }, [zones.length, currentPage, loadZones]);

  return {
    zones,
    searchTerm,
    debouncedSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    isLoading,
    isRefreshing,
    error,
    loadZones,
    handleSearch,
    refreshAfterMutation,
  };
}
