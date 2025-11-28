'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePurchaseStatus } from '@/hooks/usePurchaseStatus';
import { usePurchase } from '@/hooks/usePurchase';
import { PurchaseLayout } from '@/components/order';
import { PurchaseSummary } from '@/components/purchase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';

export default function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ journeyId: string; purchaseId: string }>;
}) {
  const { journeyId, purchaseId } = use(params);
  const router = useRouter();

  const { purchase, isLoading } = usePurchaseStatus({
    purchaseId,
    enabled: true,
  });

  const { cancelPurchase, isCancelling } = usePurchase(journeyId);

  useEffect(() => {
    if (purchase?.status === 'COMPLETED') {
      router.replace(`/journeys/${journeyId}/purchase/success?purchaseId=${purchaseId}`);
    }
  }, [purchase?.status, journeyId, purchaseId, router]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!purchase) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold">找不到此訂單</h1>
            <Button variant="outline" onClick={() => router.push('/courses')} className="mt-4">
              返回課程列表
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (purchase.status !== 'PENDING') {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold">
              {purchase.status === 'COMPLETED' ? '此訂單已完成' : '此訂單已取消或失效'}
            </h1>
            <Button variant="outline" onClick={() => router.push('/courses')} className="mt-4">
              返回課程列表
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const handleContinuePayment = () => {
    if (purchase.checkoutUrl) {
      window.location.href = purchase.checkoutUrl;
    }
  };

  const handleCancelPurchase = async () => {
    try {
      await cancelPurchase(purchaseId);
      router.push('/courses');
    } catch {
    }
  };

  const journeySummary = {
    id: purchase.journeyId,
    title: purchase.journeyTitle,
    thumbnailUrl: purchase.journeyThumbnailUrl,
    chapterCount: 0,
    lessonCount: 0,
  };

  const pricing = {
    price: purchase.amount,
    currency: purchase.currency,
  };

  return (
    <ProtectedRoute>
      <PurchaseLayout currentStep={2} backHref="/courses" backLabel="返回課程列表">
        <h1 className="mb-8 text-2xl font-bold">繼續付款</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">訂單資訊</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">訂單編號</span>
                  <span className="font-mono">{purchase.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">付款方式</span>
                  <span>{purchase.paymentMethod === 'CREDIT_CARD' ? '信用卡' : '銀行轉帳'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">建立時間</span>
                  <span>{new Date(purchase.createdAt).toLocaleString('zh-TW')}</span>
                </div>
                {purchase.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">付款期限</span>
                    <span className="text-destructive">
                      {new Date(purchase.expiresAt).toLocaleString('zh-TW')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleContinuePayment}
                className="flex-1 h-12 text-lg bg-primary hover:bg-primary/90"
              >
                前往付款
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelPurchase}
                disabled={isCancelling}
                className="h-12"
              >
                {isCancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  '取消訂單'
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
      </PurchaseLayout>
    </ProtectedRoute>
  );
}
