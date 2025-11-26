'use client';

import { useState, use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJourney } from '@/hooks/useJourney';
import { usePurchase } from '@/hooks/usePurchase';
import { purchaseService } from '@/services/purchase.service';
import { Button } from '@/components/ui/button';
import { PurchaseSummary } from '@/components/purchase';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';
import { PendingPurchase, PaymentMethod } from '@/types';

export default function ConfirmPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get('purchaseId');

  const [purchase, setPurchase] = useState<PendingPurchase | null>(null);
  const [isLoadingPurchase, setIsLoadingPurchase] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { journey, isLoading: isLoadingJourney } = useJourney(courseId);
  const { pricing, isLoadingPricing, confirmPurchase, isConfirming } = usePurchase(courseId);

  useEffect(() => {
    if (!purchaseId) {
      router.replace(`/courses/${courseId}/purchase`);
      return;
    }

    purchaseService
      .getPendingPurchaseByJourney(courseId)
      .then((p) => {
        if (!p) {
          router.replace(`/courses/${courseId}/purchase`);
          return;
        }
        setPurchase(p);
      })
      .catch(() => {
        setError('無法載入訂單資訊');
      })
      .finally(() => {
        setIsLoadingPurchase(false);
      });
  }, [purchaseId, courseId, router]);

  if (isLoadingJourney || isLoadingPricing || isLoadingPurchase) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!journey || !pricing || !purchase) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-xl font-semibold">無法載入訂單</h1>
            <p className="mt-2 text-muted-foreground">{error || '請重新嘗試'}</p>
            <Button
              variant="outline"
              onClick={() => router.push(`/courses/${courseId}/purchase`)}
              className="mt-4"
            >
              重新購買
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

  const handleConfirm = async () => {
    if (!agreed || !purchaseId) return;

    try {
      setError(null);
      const paymentDetails =
        purchase.paymentMethod === 'CREDIT_CARD'
          ? {
              type: 'CREDIT_CARD' as const,
              cardNumber: '4111111111111111',
              expiryDate: '12/25',
              cvv: '123',
              cardholderName: 'Test User',
            }
          : {
              type: 'BANK_TRANSFER' as const,
              bankCode: '012',
              accountNumber: '1234567890123',
              accountName: 'Test User',
            };

      await confirmPurchase(purchaseId, paymentDetails);
      router.push(`/courses/${courseId}/purchase/success?purchaseId=${purchaseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '確認付款失敗');
    }
  };

  const paymentMethodLabel: Record<PaymentMethod, string> = {
    CREDIT_CARD: '信用卡付款',
    BANK_TRANSFER: '銀行轉帳',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回修改
          </button>

          <h1 className="mb-8 text-2xl font-bold">確認訂單</h1>

          <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 text-lg font-medium">付款方式</h3>
                <p>{paymentMethodLabel[purchase.paymentMethod]}</p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-muted-foreground">
                    我已閱讀並同意
                    <a href="#" className="text-primary hover:underline">
                      服務條款
                    </a>
                    及
                    <a href="#" className="text-primary hover:underline">
                      退款政策
                    </a>
                  </span>
                </label>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isConfirming}
                >
                  返回修改
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!agreed || isConfirming}
                  className="flex-1"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    '確認付款'
                  )}
                </Button>
              </div>
            </div>

            <div className="lg:sticky lg:top-8 lg:self-start">
              <PurchaseSummary
                journey={journeySummary}
                pricing={pricing}
                paymentMethod={purchase.paymentMethod}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
