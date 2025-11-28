'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentMethod } from '@/types';
import { useJourney } from '@/hooks/useJourney';
import { usePurchase } from '@/hooks/usePurchase';
import { usePendingPurchases } from '@/hooks/usePendingPurchases';
import { Button } from '@/components/ui/button';
import { PaymentMethodSelector, PurchaseSummary, PendingPurchaseBanner } from '@/components/purchase';
import { PurchaseLayout } from '@/components/order';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';

export default function PurchasePage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = use(params);
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { journey, isLoading: isLoadingJourney, error: journeyError } = useJourney(journeyId);
  const { createPurchase, cancelPurchase, isCreating, isCancelling } =
    usePurchase(journeyId);
  const { pendingPurchaseForJourney, isLoading: isLoadingPending, refetch } = usePendingPurchases(journeyId);

  useEffect(() => {
    if (journey?.isPurchased) {
      router.replace(`/courses/${journeyId}`);
    }
  }, [journey?.isPurchased, journeyId, router]);

  if (isLoadingJourney || isLoadingPending) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  if (journeyError || !journey) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold">無法載入課程資訊</h1>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
              返回
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (journey.isPurchased) {
    return null;
  }

  const journeySummary = {
    id: journey.id,
    title: journey.title,
    thumbnailUrl: journey.thumbnailUrl,
    chapterCount: journey.chapters?.length || 0,
    lessonCount: journey.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0,
  };

  const pricing = {
    price: journey.price,
    currency: journey.currency,
    originalPrice: journey.originalPrice,
    discountPercentage: journey.discountPercentage,
  };

  const handleProceedToPayment = async () => {
    if (!selectedMethod) return;

    try {
      setError(null);
      const result = await createPurchase(selectedMethod);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setError('無法取得付款連結');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '建立訂單失敗');
    }
  };

  const handleContinuePurchase = () => {
    if (pendingPurchaseForJourney?.checkoutUrl) {
      window.location.href = pendingPurchaseForJourney.checkoutUrl;
    }
  };

  const handleCancelPurchase = async () => {
    if (pendingPurchaseForJourney) {
      try {
        await cancelPurchase(pendingPurchaseForJourney.id);
        refetch();
      } catch {
      }
    }
  };

  return (
    <ProtectedRoute>
      <PurchaseLayout currentStep={2} backHref={`/journeys/${journeyId}/orders`} backLabel="返回訂單">
        <h1 className="mb-8 text-2xl font-bold">選擇付款方式</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          <div>
            <div className="space-y-6">
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onSelect={setSelectedMethod}
                disabled={isCreating || !!pendingPurchaseForJourney}
              />
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {!pendingPurchaseForJourney && (
                <Button
                  onClick={handleProceedToPayment}
                  disabled={!selectedMethod || isCreating}
                  className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                  data-testid="proceed-to-payment-button"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    '前往付款'
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <PurchaseSummary
              journey={journeySummary}
              pricing={pricing}
              paymentMethod={selectedMethod || undefined}
            />
          </div>
        </div>
      </PurchaseLayout>

      {pendingPurchaseForJourney && (
        <PendingPurchaseBanner
          purchase={pendingPurchaseForJourney}
          onContinue={handleContinuePurchase}
          onCancel={handleCancelPurchase}
          isCancelling={isCancelling}
        />
      )}
    </ProtectedRoute>
  );
}
