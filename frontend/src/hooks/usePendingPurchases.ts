'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PendingPurchase } from '@/types';
import { purchaseService } from '@/services/purchase.service';

export function usePendingPurchases(journeyId?: string) {
  const [pendingPurchases, setPendingPurchases] = useState<PendingPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (journeyId) {
        const pending = await purchaseService.getPendingPurchaseByJourney(journeyId);
        setPendingPurchases(pending ? [pending] : []);
      } else {
        const pending = await purchaseService.getPendingPurchases();
        setPendingPurchases(pending);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [journeyId]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const pendingPurchaseForJourney = useMemo(() => {
    if (!journeyId) return null;
    return pendingPurchases.find(p => p.journeyId === journeyId) || null;
  }, [pendingPurchases, journeyId]);

  return { 
    pendingPurchases, 
    pendingPurchaseForJourney,
    isLoading, 
    error, 
    refetch: fetchPending 
  };
}
