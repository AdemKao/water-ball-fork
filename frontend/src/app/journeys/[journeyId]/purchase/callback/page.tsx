'use client';

import { use, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePurchaseStatus } from '@/hooks/usePurchaseStatus';
import { PurchaseStatus } from '@/components/purchase';
import { PurchaseLayout } from '@/components/order';
import { ProtectedRoute } from '@/components/auth';
import { Loader2 } from 'lucide-react';

function CallbackContent({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const purchaseId = searchParams.get('purchaseId');
  const callbackStatus = searchParams.get('status') as 'success' | 'cancel' | null;
  const errorMessage = searchParams.get('error');

  const isSuccessCallback = callbackStatus === 'success';
  
  const { purchase, status, isLoading, isPolling } = usePurchaseStatus({
    purchaseId: purchaseId || '',
    enabled: !!purchaseId && isSuccessCallback,
    onStatusChange: (newStatus) => {
      if (newStatus === 'COMPLETED') {
        router.replace(`/journeys/${journeyId}/purchase/success?purchaseId=${purchaseId}`);
      }
    },
  });

  useEffect(() => {
    if (!purchaseId) {
      router.replace(`/journeys/${journeyId}/orders`);
    }
  }, [purchaseId, journeyId, router]);

  if (!purchaseId) {
    return null;
  }

  const handleRetry = () => {
    router.push(`/journeys/${journeyId}/purchase`);
  };

  const handleBackToCourse = () => {
    router.push(`/courses/${journeyId}`);
  };

  if (callbackStatus === 'cancel') {
    return (
      <PurchaseLayout currentStep={2}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <PurchaseStatus
            status="CANCELLED"
            failureReason={errorMessage}
            onRetry={handleRetry}
            onBackToCourse={handleBackToCourse}
          />
        </div>
      </PurchaseLayout>
    );
  }

  if (isLoading) {
    return (
      <PurchaseLayout currentStep={2}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PurchaseLayout>
    );
  }

  if (status && status !== 'PENDING' && status !== 'COMPLETED') {
    return (
      <PurchaseLayout currentStep={2}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <PurchaseStatus
            status={status}
            failureReason={purchase?.failureReason}
            onRetry={handleRetry}
            onBackToCourse={handleBackToCourse}
          />
        </div>
      </PurchaseLayout>
    );
  }

  return (
    <PurchaseLayout currentStep={2}>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <h1 className="mt-6 text-2xl font-bold">正在確認付款結果...</h1>
          <p className="mt-2 text-muted-foreground">
            {isPolling ? '請稍候，我們正在確認您的付款狀態' : '正在載入...'}
          </p>
        </div>
      </div>
    </PurchaseLayout>
  );
}

export default function CallbackPage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = use(params);

  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <PurchaseLayout currentStep={2}>
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </PurchaseLayout>
        }
      >
        <CallbackContent journeyId={journeyId} />
      </Suspense>
    </ProtectedRoute>
  );
}
