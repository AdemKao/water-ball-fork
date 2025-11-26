import {
  JourneyPricing,
  CreatePurchaseRequest,
  CreatePurchaseResponse,
  Purchase,
  PendingPurchase,
  CreditCardPaymentDetails,
  BankTransferPaymentDetails,
  PaymentResultResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const purchaseService = {
  async getJourneyPricing(journeyId: string): Promise<JourneyPricing> {
    const response = await fetch(`${API_URL}/api/journeys/${journeyId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch pricing');
    const journey = await response.json();
    return {
      journeyId: journey.id,
      price: journey.price,
      currency: journey.currency || 'TWD',
      originalPrice: journey.originalPrice,
      discountPercentage: journey.discountPercentage,
    };
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

  async processPayment(
    purchaseId: string,
    paymentDetails: CreditCardPaymentDetails | BankTransferPaymentDetails
  ): Promise<PaymentResultResponse> {
    const response = await fetch(`${API_URL}/api/purchases/${purchaseId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(paymentDetails),
    });
    if (!response.ok) throw new Error('Failed to process payment');
    return response.json();
  },

  async cancelPurchase(purchaseId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/purchases/${purchaseId}`, {
      method: 'DELETE',
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
    const data = await response.json();
    return data.content || data;
  },
};
