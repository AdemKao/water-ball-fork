'use client';

import { use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePurchaseStatus } from '@/hooks/usePurchaseStatus';
import { PurchaseStatus } from '@/components/purchase';
import { ProtectedRoute } from '@/components/auth';
import { Loader2 } from 'lucide-react';

export default function CallbackPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
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
        router.replace(`/courses/${courseId}/purchase/success?purchaseId=${purchaseId}`);
      }
    },
  });

  useEffect(() => {
    if (!purchaseId) {
      router.replace(`/courses/${courseId}`);
    }
  }, [purchaseId, courseId, router]);

  if (!purchaseId) {
    return null;
  }

  const handleRetry = () => {
    router.push(`/courses/${courseId}/purchase`);
  };

  const handleBackToCourse = () => {
    router.push(`/courses/${courseId}`);
  };

  if (callbackStatus === 'cancel') {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-background py-16">
          <PurchaseStatus
            status="CANCELLED"
            failureReason={errorMessage}
            onRetry={handleRetry}
            onBackToCourse={handleBackToCourse}
          />
        </div>
      </ProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  if (status && status !== 'PENDING' && status !== 'COMPLETED') {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-background py-16">
          <PurchaseStatus
            status={status}
            failureReason={purchase?.failureReason}
            onRetry={handleRetry}
            onBackToCourse={handleBackToCourse}
          />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-background py-16">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <h1 className="mt-6 text-2xl font-bold">正在確認付款結果...</h1>
          <p className="mt-2 text-muted-foreground">
            {isPolling ? '請稍候，我們正在確認您的付款狀態' : '正在載入...'}
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
