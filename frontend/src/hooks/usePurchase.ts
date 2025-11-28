'use client';

import { useState, useCallback } from 'react';
import {
  PaymentMethod,
  CreatePurchaseResponse,
} from '@/types';
import { purchaseService } from '@/services/purchase.service';

export function usePurchase(journeyId: string) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPurchase = useCallback(
    async (paymentMethod: PaymentMethod): Promise<CreatePurchaseResponse> => {
      setIsCreating(true);
      setError(null);
      try {
        return await purchaseService.createPurchase({ journeyId, paymentMethod });
      } finally {
        setIsCreating(false);
      }
    },
    [journeyId]
  );

  const cancelPurchase = useCallback(async (purchaseId: string): Promise<void> => {
    setIsCancelling(true);
    setError(null);
    try {
      await purchaseService.cancelPurchase(purchaseId);
    } finally {
      setIsCancelling(false);
    }
  }, []);

  return {
    createPurchase,
    cancelPurchase,
    isCreating,
    isCancelling,
    error,
  };
}
