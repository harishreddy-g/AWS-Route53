'use client';

import { useCallback, useState } from 'react';
import { dnsRecords } from '@/lib/api';
import { DNSRecordListParams } from '@/lib/api/dnsRecords';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { DNSRecord } from '@/types/dns-record';

interface UseDnsRecordsListOptions {
  itemsPerPage?: number;
  enabled?: boolean;
}

export function useDnsRecordsList(zoneId: number, { itemsPerPage = 8, enabled = true }: UseDnsRecordsListOptions = {}) {
  const [typeFilter, setTypeFilter] = useState('all');
  const isZoneValid = !Number.isNaN(zoneId);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) => {
      const listParams: DNSRecordListParams = {
        page: params.page,
        limit: params.limit,
        search: params.search,
        type: typeFilter === 'all' ? undefined : typeFilter,
      };
      return dnsRecords.list(zoneId, listParams);
    },
    [zoneId, typeFilter],
  );

  const result = usePaginatedList({
    fetcher,
    itemsPerPage,
    enabled: enabled && isZoneValid,
    resetDeps: [zoneId],
  });

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    result.setCurrentPage(1);
  };

  const clearFilters = () => {
    result.handleSearch('');
    setTypeFilter('all');
    result.setCurrentPage(1);
  };

  return {
    records: result.items as DNSRecord[],
    searchTerm: result.searchTerm,
    debouncedSearch: result.debouncedSearch,
    typeFilter,
    currentPage: result.currentPage,
    setCurrentPage: result.setCurrentPage,
    totalPages: result.totalPages,
    total: result.total,
    isLoading: result.isLoading,
    isRefreshing: result.isRefreshing,
    error: result.error,
    loadRecords: result.loadItems,
    handleSearch: result.handleSearch,
    handleTypeFilter,
    clearFilters,
    refreshAfterMutation: result.refreshAfterMutation,
  };
}
