'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  JourneyPricing,
  PaymentMethod,
  CreatePurchaseResponse,
  Purchase,
  CreditCardPaymentDetails,
  BankTransferPaymentDetails,
} from '@/types';
import { purchaseService } from '@/services/purchase.service';

export function usePurchase(journeyId: string) {
  const [pricing, setPricing] = useState<JourneyPricing | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!journeyId) return;
    setIsLoadingPricing(true);
    purchaseService
      .getJourneyPricing(journeyId)
      .then(setPricing)
      .catch(setError)
      .finally(() => setIsLoadingPricing(false));
  }, [journeyId]);

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

  const confirmPurchase = useCallback(
    async (
      purchaseId: string,
      paymentDetails: CreditCardPaymentDetails | BankTransferPaymentDetails
    ): Promise<Purchase> => {
      setIsConfirming(true);
      setError(null);
      try {
        return await purchaseService.confirmPurchase(purchaseId, paymentDetails);
      } finally {
        setIsConfirming(false);
      }
    },
    []
  );

  const cancelPurchase = useCallback(async (purchaseId: string): Promise<void> => {
    await purchaseService.cancelPurchase(purchaseId);
  }, []);

  return {
    pricing,
    isLoadingPricing,
    createPurchase,
    confirmPurchase,
    cancelPurchase,
    isCreating,
    isConfirming,
    error,
  };
}
