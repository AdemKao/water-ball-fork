import {
  CreatePurchaseRequest,
  CreatePurchaseResponse,
  Purchase,
  PendingPurchase,
  PurchaseStatus,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const purchaseService = {
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

  async getUserPurchases(params?: { 
    status?: PurchaseStatus; 
    page?: number; 
    size?: number 
  }): Promise<{
    content: Purchase[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());
    const query = searchParams.toString();
    const response = await fetch(`${API_URL}/api/purchases${query ? `?${query}` : ''}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch purchases');
    return response.json();
  },
};
