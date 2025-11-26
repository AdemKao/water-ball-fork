'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentMethod } from '@/types';
import { useJourney } from '@/hooks/useJourney';
import { usePurchase } from '@/hooks/usePurchase';
import { usePendingPurchases } from '@/hooks/usePendingPurchases';
import { Button } from '@/components/ui/button';
import { PaymentMethodSelector, PurchaseSummary, PaymentForm } from '@/components/purchase';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';

type Step = 'select-method' | 'payment-form';

export default function PurchasePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const [step, setStep] = useState<Step>('select-method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { journey, isLoading: isLoadingJourney, error: journeyError } = useJourney(courseId);
  const { pricing, isLoadingPricing, createPurchase, processPayment, isCreating, isProcessingPayment } =
    usePurchase(courseId);
  const { pendingPurchases } = usePendingPurchases(courseId);

  if (pendingPurchases.length > 0 && !purchaseId) {
    const pending = pendingPurchases[0];
    router.replace(`/courses/${courseId}/purchase/confirm?purchaseId=${pending.id}`);
    return null;
  }

  if (isLoadingJourney || isLoadingPricing) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  if (journeyError || !journey || !pricing) {
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

  const journeySummary = {
    id: journey.id,
    title: journey.title,
    thumbnailUrl: journey.thumbnailUrl,
    chapterCount: journey.chapters?.length || 0,
    lessonCount: journey.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0,
  };

  const handleNext = async () => {
    if (!selectedMethod) return;

    try {
      setError(null);
      const result = await createPurchase(selectedMethod);
      setPurchaseId(result.purchaseId);
      setStep('payment-form');
    } catch (err) {
      setError(err instanceof Error ? err.message : '建立訂單失敗');
    }
  };

  const handlePaymentSubmit = async (
    details: Parameters<typeof processPayment>[1]
  ) => {
    if (!purchaseId) return;

    try {
      setError(null);
      const result = await processPayment(purchaseId, details);
      if (result.status === 'COMPLETED') {
        router.push(`/courses/${courseId}/purchase/success?purchaseId=${purchaseId}`);
      } else {
        setError(result.failureReason || '付款失敗');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '付款失敗');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <button
            onClick={() => (step === 'payment-form' ? setStep('select-method') : router.back())}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 'payment-form' ? '返回選擇付款方式' : '返回課程頁面'}
          </button>

          <h1 className="mb-8 text-2xl font-bold">購買課程</h1>

          <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
            <div>
              {step === 'select-method' && (
                <div className="space-y-6">
                  <PaymentMethodSelector
                    selectedMethod={selectedMethod}
                    onSelect={setSelectedMethod}
                    disabled={isCreating}
                  />
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!selectedMethod || isCreating}
                    className="w-full"
                    data-testid="next-step-button"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        處理中...
                      </>
                    ) : (
                      '下一步'
                    )}
                  </Button>
                </div>
              )}

              {step === 'payment-form' && selectedMethod && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">填寫付款資訊</h3>
                  <PaymentForm
                    paymentMethod={selectedMethod}
                    onSubmit={handlePaymentSubmit}
                    isSubmitting={isProcessingPayment}
                    error={error}
                  />
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-8 lg:self-start">
              <PurchaseSummary
                journey={journeySummary}
                pricing={pricing}
                paymentMethod={selectedMethod || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
