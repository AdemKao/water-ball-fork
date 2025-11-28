'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Purchase, PurchaseStatus } from '@/types';
import { purchaseService } from '@/services/purchase.service';

interface UsePurchaseStatusOptions {
  purchaseId: string;
  enabled?: boolean;
  pollingInterval?: number;
  maxPollingAttempts?: number;
  onStatusChange?: (status: PurchaseStatus) => void;
}

const TERMINAL_STATUSES: PurchaseStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'];

export function usePurchaseStatus(options: UsePurchaseStatusOptions) {
  const { 
    purchaseId, 
    enabled = true, 
    pollingInterval = 2000,
    maxPollingAttempts = 30,
    onStatusChange 
  } = options;

  const isEnabled = enabled && !!purchaseId;
  
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [status, setStatus] = useState<PurchaseStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);
  const prevStatusRef = useRef<PurchaseStatus | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (isMountedRef.current) {
      setIsPolling(false);
    }
  }, []);

  const fetchStatus = useCallback(async (): Promise<Purchase | null> => {
    try {
      const data = await purchaseService.getPurchase(purchaseId);
      if (!isMountedRef.current) return null;
      
      setPurchase(data);
      setStatus(data.status);
      setHasFetched(true);
      
      if (onStatusChangeRef.current && data.status !== prevStatusRef.current) {
        onStatusChangeRef.current(data.status);
      }
      prevStatusRef.current = data.status;
      
      if (TERMINAL_STATUSES.includes(data.status)) {
        stopPolling();
      }
      
      attemptRef.current++;
      if (attemptRef.current >= maxPollingAttempts) {
        stopPolling();
      }
      
      return data;
    } catch (err) {
      if (!isMountedRef.current) return null;
      setError(err instanceof Error ? err : new Error('Failed to fetch purchase status'));
      setHasFetched(true);
      stopPolling();
      return null;
    }
  }, [purchaseId, maxPollingAttempts, stopPolling]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!isEnabled) {
      return;
    }

    attemptRef.current = 0;
    prevStatusRef.current = null;
    
    const startFetching = async () => {
      const data = await fetchStatus();
      if (!isMountedRef.current || !data) return;
      
      if (!TERMINAL_STATUSES.includes(data.status)) {
        setIsPolling(true);
        pollingRef.current = setInterval(fetchStatus, pollingInterval);
      }
    };
    
    startFetching();

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [isEnabled, pollingInterval, fetchStatus, stopPolling]);

  const isLoading = useMemo(() => {
    if (!isEnabled) return false;
    return !hasFetched;
  }, [isEnabled, hasFetched]);

  return {
    purchase,
    status,
    isLoading,
    isPolling,
    error,
    stopPolling,
  };
}
