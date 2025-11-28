'use client';

import Image from 'next/image';
import { PaymentMethod } from '@/types';

interface PricingInfo {
  price: number;
  currency: string;
  originalPrice?: number;
  discountPercentage?: number;
}

interface PurchaseSummaryProps {
  journey: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    chapterCount: number;
    lessonCount: number;
  };
  pricing: PricingInfo;
  paymentMethod?: PaymentMethod;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CREDIT_CARD: '信用卡付款',
  BANK_TRANSFER: '銀行轉帳',
};

export function PurchaseSummary({
  journey,
  pricing,
  paymentMethod,
}: PurchaseSummaryProps) {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: pricing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const hasDiscount =
    pricing.originalPrice && pricing.originalPrice > pricing.price;
  const discountAmount = hasDiscount
    ? pricing.originalPrice! - pricing.price
    : 0;

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-lg font-medium">訂單摘要</h3>

      <div className="mb-4 flex gap-4">
        <div className="relative h-20 w-32 overflow-hidden rounded-md bg-muted">
          {journey.thumbnailUrl ? (
            <Image
              src={journey.thumbnailUrl}
              alt={journey.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              無圖片
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{journey.title}</h4>
          <p className="text-sm text-muted-foreground">
            {journey.chapterCount} 章節 · {journey.lessonCount} 堂課
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        {hasDiscount && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">原價</span>
              <span className="text-muted-foreground line-through">
                {formatPrice(pricing.originalPrice!)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                折扣 ({pricing.discountPercentage}% off)
              </span>
              <span className="text-green-600">-{formatPrice(discountAmount)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-lg font-semibold">
          <span>總計</span>
          <span className="text-primary">{formatPrice(pricing.price)}</span>
        </div>
      </div>

      {paymentMethod && (
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">付款方式</span>
            <span>{paymentMethodLabels[paymentMethod]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
