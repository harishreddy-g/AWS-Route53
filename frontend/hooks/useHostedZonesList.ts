'use client';

import { useCallback } from 'react';
import { hostedZones } from '@/lib/api';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { HostedZone } from '@/types/hosted-zone';

interface UseHostedZonesListOptions {
  itemsPerPage?: number;
}

export function useHostedZonesList({ itemsPerPage = 8 }: UseHostedZonesListOptions = {}) {
  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) => hostedZones.list(params),
    [],
  );

  const result = usePaginatedList({
    fetcher,
    itemsPerPage,
  });

  return {
    zones: result.items as HostedZone[],
    searchTerm: result.searchTerm,
    debouncedSearch: result.debouncedSearch,
    currentPage: result.currentPage,
    setCurrentPage: result.setCurrentPage,
    totalPages: result.totalPages,
    total: result.total,
    isLoading: result.isLoading,
    isRefreshing: result.isRefreshing,
    error: result.error,
    loadZones: result.loadItems,
    handleSearch: result.handleSearch,
    refreshAfterMutation: result.refreshAfterMutation,
  };
}
