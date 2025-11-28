'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface PurchaseButtonProps {
  journeyId: string;
  price: number;
  currency?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}

export function PurchaseButton({
  journeyId,
  price,
  currency = 'TWD',
  size = 'default',
  variant = 'default',
  className,
}: PurchaseButtonProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const formattedPrice = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  const handleClick = () => {
    if (!user) {
      const redirectUrl = `/courses/${journeyId}/purchase`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    router.push(`/courses/${journeyId}/purchase`);
  };

  return (
    <Button
      data-testid="purchase-button"
      onClick={handleClick}
      size={size}
      variant={variant}
      className={cn(className)}
      disabled={isLoading}
    >
      購買課程 {formattedPrice}
    </Button>
  );
}
