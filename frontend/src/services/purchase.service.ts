import {
  JourneyPricing,
  CreatePurchaseRequest,
  CreatePurchaseResponse,
  Purchase,
  PendingPurchase,
  CreditCardPaymentDetails,
  BankTransferPaymentDetails,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const purchaseService = {
  async getJourneyPricing(journeyId: string): Promise<JourneyPricing> {
    const response = await fetch(`${API_URL}/api/journeys/${journeyId}/pricing`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch pricing');
    return response.json();
  },

  async createPurchase(data: CreatePurchaseRequest): Promise<CreatePurchaseResponse> {
    const response = await fetch(`${API_URL}/api/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create purchase');
    return response.json();
  },

  async confirmPurchase(
    purchaseId: string,
    paymentDetails: CreditCardPaymentDetails | BankTransferPaymentDetails
  ): Promise<Purchase> {
    const response = await fetch(`${API_URL}/api/purchases/${purchaseId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(paymentDetails),
    });
    if (!response.ok) throw new Error('Failed to confirm purchase');
    return response.json();
  },

  async cancelPurchase(purchaseId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/purchases/${purchaseId}/cancel`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to cancel purchase');
  },

  async getPurchase(purchaseId: string): Promise<Purchase> {
    const response = await fetch(`${API_URL}/api/purchases/${purchaseId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch purchase');
    return response.json();
  },

  async getPendingPurchases(): Promise<PendingPurchase[]> {
    const response = await fetch(`${API_URL}/api/purchases/pending`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch pending purchases');
    return response.json();
  },

  async getPendingPurchaseByJourney(journeyId: string): Promise<PendingPurchase | null> {
    const response = await fetch(`${API_URL}/api/purchases/pending/journey/${journeyId}`, {
      credentials: 'include',
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch pending purchase');
    return response.json();
  },

  async getUserPurchases(): Promise<Purchase[]> {
    const response = await fetch(`${API_URL}/api/purchases`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch purchases');
    return response.json();
  },
};
