'use client';

import { useState, useEffect, useCallback } from 'react';
import { Purchase, PurchaseStatus } from '@/types';
import { purchaseService } from '@/services/purchase.service';

interface UsePurchaseHistoryOptions {
  status?: PurchaseStatus;
  page?: number;
  size?: number;
}

export function usePurchaseHistory(enabled: boolean = true, options?: UsePurchaseHistoryOptions) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPurchases = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await purchaseService.getUserPurchases(options);
      setPurchases(response.content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setPurchases([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, options?.status, options?.page, options?.size]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    purchases,
    isLoading,
    error,
    refetch: fetchPurchases,
  };
}
