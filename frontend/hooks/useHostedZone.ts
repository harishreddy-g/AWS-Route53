'use client';

import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage, hostedZones } from '@/lib/api';
import { HostedZone } from '@/types/hosted-zone';

export function useHostedZone(zoneId: number) {
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadZone = useCallback(async () => {
    if (Number.isNaN(zoneId)) {
      setError('Invalid hosted zone ID');
      setZone(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await hostedZones.get(zoneId);
      setZone(response);
    } catch (loadError) {
      setZone(null);
      setError(getErrorMessage(loadError, 'Failed to load hosted zone'));
    } finally {
      setIsLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    loadZone();
  }, [loadZone]);

  return { zone, isLoading, error, loadZone };
}
