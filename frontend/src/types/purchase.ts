export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER';

export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

export interface Purchase {
  id: string;
  journeyId: string;
  journeyTitle: string;
  journeyThumbnailUrl: string | null;
  journeyDescription?: string | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  checkoutUrl?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string | null;
  completedAt: string | null;
}

export interface PendingPurchase {
  id: string;
  journeyId: string;
  journeyTitle: string;
  journeyThumbnailUrl: string | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: 'PENDING';
  checkoutUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreatePurchaseRequest {
  journeyId: string;
  paymentMethod: PaymentMethod;
}

export interface CreatePurchaseResponse {
  id: string;
  journeyId: string;
  journeyTitle: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  checkoutUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType;
}

export interface PurchaseCallbackParams {
  purchaseId: string;
  status: 'success' | 'cancel';
  error?: string;
}
