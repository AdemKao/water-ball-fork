export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER';
export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Purchase {
  id: string;
  journeyId: string;
  journeyTitle: string;
  journeyThumbnailUrl: string | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  createdAt: string;
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
  createdAt: string;
  expiresAt: string;
}

export interface CreatePurchaseRequest {
  journeyId: string;
  paymentMethod: PaymentMethod;
}

export interface CreatePurchaseResponse {
  purchaseId: string;
  amount: number;
  currency: string;
}

export interface CreditCardPaymentDetails {
  type: 'CREDIT_CARD';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface BankTransferPaymentDetails {
  type: 'BANK_TRANSFER';
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export interface JourneyPricing {
  journeyId: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discountPercentage?: number;
}

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}
