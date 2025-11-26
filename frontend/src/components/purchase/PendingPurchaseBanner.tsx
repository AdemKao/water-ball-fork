'use client';

import { useEffect, useState } from 'react';
import { PendingPurchase } from '@/types';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface PendingPurchaseBannerProps {
  purchase: PendingPurchase;
  onContinue: () => void;
  onCancel: () => void;
}

export function PendingPurchaseBanner({
  purchase,
  onContinue,
  onCancel,
}: PendingPurchaseBannerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expires = new Date(purchase.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('已過期');
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [purchase.expiresAt]);

  const formattedAmount = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: purchase.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(purchase.amount);

  return (
    <div
      data-testid="pending-purchase-banner"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="font-medium">您有一筆未完成的購買</p>
            <p className="text-sm text-muted-foreground">
              {purchase.journeyTitle} · {formattedAmount} · 剩餘 {timeLeft}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} data-testid="cancel-purchase-button">
            取消
          </Button>
          <Button data-testid="continue-purchase-button" size="sm" onClick={onContinue}>
            繼續購買
          </Button>
        </div>
      </div>
    </div>
  );
}
