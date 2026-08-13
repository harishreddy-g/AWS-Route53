'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { dnsRecords, getErrorMessage } from '@/lib/api';
import { DNSRecord } from '@/types/dns-record';

interface UseDnsRecordsListOptions {
  itemsPerPage?: number;
  enabled?: boolean;
}

export function useDnsRecordsList(zoneId: number, { itemsPerPage = 8, enabled = true }: UseDnsRecordsListOptions = {}) {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const debouncedSearch = useDebouncedValue(searchTerm);
  const isZoneValid = !Number.isNaN(zoneId);

  useEffect(() => {
    setSearchTerm('');
    setTypeFilter('all');
    setCurrentPage(1);
    setHasLoaded(false);
    setRecords([]);
    setTotal(0);
    setError('');
  }, [zoneId]);

  const loadRecords = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!enabled || !isZoneValid) {
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
        const response = await dnsRecords.list(zoneId, {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
        });

        setRecords(response.items);
        setTotalPages(Math.max(1, response.totalPages));
        setTotal(response.total);
        setHasLoaded(true);
      } catch (loadError) {
        setRecords([]);
        setError(getErrorMessage(loadError, 'Failed to load DNS records'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [zoneId, enabled, isZoneValid, currentPage, debouncedSearch, typeFilter, hasLoaded, itemsPerPage],
  );

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  const refreshAfterMutation = useCallback(async () => {
    if (records.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
      return;
    }

    await loadRecords({ silent: true });
  }, [records.length, currentPage, loadRecords]);

  return {
    records,
    searchTerm,
    debouncedSearch,
    typeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    isLoading,
    isRefreshing,
    error,
    loadRecords,
    handleSearch,
    handleTypeFilter,
    clearFilters,
    refreshAfterMutation,
  };
}
