'use client';

import { PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';
import { CreditCard, Building2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const paymentMethods = [
  {
    value: 'CREDIT_CARD' as PaymentMethod,
    label: '信用卡付款',
    description: '支援 Visa, MasterCard, JCB',
    Icon: CreditCard,
  },
  {
    value: 'BANK_TRANSFER' as PaymentMethod,
    label: '銀行轉帳',
    description: 'ATM 轉帳或網路銀行',
    Icon: Building2,
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">選擇付款方式</h3>
      <div className="grid gap-3">
        {paymentMethods.map(({ value, label, description, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            disabled={disabled}
            data-testid={`payment-method-${value}`}
            data-selected={selectedMethod === value ? 'true' : 'false'}
            className={cn(
              'flex items-center gap-4 rounded-lg border p-4 text-left transition-colors',
              'hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50',
              selectedMethod === value
                ? 'border-primary bg-primary/5'
                : 'border-border'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                selectedMethod === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{label}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
            <div
              className={cn(
                'h-5 w-5 rounded-full border-2',
                selectedMethod === value
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30'
              )}
            >
              {selectedMethod === value && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
