'use client';

import { useState } from 'react';
import {
  PaymentMethod,
  CreditCardPaymentDetails,
  BankTransferPaymentDetails,
} from '@/types';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/hooks/usePayment';
import { cn } from '@/lib/utils';

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  onSubmit: (
    details: CreditCardPaymentDetails | BankTransferPaymentDetails
  ) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function PaymentForm({
  paymentMethod,
  onSubmit,
  isSubmitting = false,
  error,
}: PaymentFormProps) {
  const { validateCreditCard, formatCardNumber, formatExpiryDate, isExpired } =
    usePayment();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCreditCardForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    if (!validateCreditCard(cleanCardNumber)) {
      newErrors.cardNumber = '請輸入有效的信用卡號';
    }
    if (!expiryDate || expiryDate.length !== 5) {
      newErrors.expiryDate = '請輸入有效的到期日 (MM/YY)';
    } else if (isExpired(expiryDate)) {
      newErrors.expiryDate = '此卡已過期';
    }
    if (!/^\d{3}$/.test(cvv)) {
      newErrors.cvv = '請輸入 3 位數 CVV';
    }
    if (!cardholderName.trim()) {
      newErrors.cardholderName = '請輸入持卡人姓名';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBankTransferForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!/^\d{3}$/.test(bankCode)) {
      newErrors.bankCode = '請輸入 3 位數銀行代碼';
    }
    if (!/^\d{10,16}$/.test(accountNumber)) {
      newErrors.accountNumber = '請輸入有效的帳號 (10-16 位數字)';
    }
    if (!accountName.trim()) {
      newErrors.accountName = '請輸入戶名';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'CREDIT_CARD') {
      if (!validateCreditCardForm()) return;
      const [month, year] = expiryDate.split('/');
      onSubmit({
        type: 'CREDIT_CARD',
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryMonth: month,
        expiryYear: `20${year}`,
        cvv,
        cardholderName,
      });
    } else {
      if (!validateBankTransferForm()) return;
      onSubmit({
        type: 'BANK_TRANSFER',
        bankCode,
        accountNumber,
        accountName,
      });
    }
  };

  const inputClassName = (field: string) =>
    cn(
      'w-full rounded-md border px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-primary/50',
      errors[field] ? 'border-destructive' : 'border-input'
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {paymentMethod === 'CREDIT_CARD' ? (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium">信用卡號</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className={inputClassName('cardNumber')}
              maxLength={19}
              data-testid="card-number"
            />
            {errors.cardNumber && (
              <p className="mt-1 text-xs text-destructive" data-testid="card-number-error">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">到期日</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                className={inputClassName('expiryDate')}
                maxLength={5}
                data-testid="expiry-date"
              />
              {errors.expiryDate && (
                <p className="mt-1 text-xs text-destructive" data-testid="expiry-date-error">{errors.expiryDate}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                className={inputClassName('cvv')}
                maxLength={3}
                data-testid="cvv"
              />
              {errors.cvv && (
                <p className="mt-1 text-xs text-destructive">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">持卡人姓名</label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="王小明"
              className={inputClassName('cardholderName')}
              data-testid="cardholder-name"
            />
            {errors.cardholderName && (
              <p className="mt-1 text-xs text-destructive">{errors.cardholderName}</p>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium">銀行代碼</label>
            <input
              type="text"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="012"
              className={inputClassName('bankCode')}
              maxLength={3}
              data-testid="bank-code"
            />
            {errors.bankCode && (
              <p className="mt-1 text-xs text-destructive" data-testid="bank-code-error">{errors.bankCode}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">帳號</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 16))
              }
              placeholder="12345678901234"
              className={inputClassName('accountNumber')}
              maxLength={16}
              data-testid="account-number"
            />
            {errors.accountNumber && (
              <p className="mt-1 text-xs text-destructive">{errors.accountNumber}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">戶名</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="王小明"
              className={inputClassName('accountName')}
              data-testid="account-name"
            />
            {errors.accountName && (
              <p className="mt-1 text-xs text-destructive">{errors.accountName}</p>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="confirm-purchase-button">
        {isSubmitting ? '處理中...' : '確認付款'}
      </Button>
    </form>
  );
}
