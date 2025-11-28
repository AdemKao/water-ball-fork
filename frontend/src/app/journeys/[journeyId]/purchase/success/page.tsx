'use client';

import { use, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { purchaseService } from '@/services/purchase.service';
import { useJourney } from '@/hooks/useJourney';
import { PurchaseSuccess } from '@/components/purchase';
import { PurchaseLayout } from '@/components/order';
import { ProtectedRoute } from '@/components/auth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Purchase } from '@/types';

function SuccessContent({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get('purchaseId');

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { journey, isLoading: isLoadingJourney } = useJourney(journeyId);

  useEffect(() => {
    if (!purchaseId) {
      router.replace(`/courses/${journeyId}`);
      return;
    }

    purchaseService
      .getPurchase(purchaseId)
      .then(setPurchase)
      .catch(() => {
        setError('無法載入購買資訊');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [purchaseId, journeyId, router]);

  if (isLoading || isLoadingJourney) {
    return (
      <PurchaseLayout currentStep={3}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PurchaseLayout>
    );
  }

  if (!purchase || !journey || error) {
    return (
      <PurchaseLayout currentStep={3}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-xl font-semibold">無法載入購買資訊</h1>
            <p className="mt-2 text-muted-foreground">{error || '請稍後再試'}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/courses')}
              className="mt-4"
            >
              返回課程列表
            </Button>
          </div>
        </div>
      </PurchaseLayout>
    );
  }

  const journeyInfo = {
    id: journey.id,
    title: journey.title,
    thumbnailUrl: journey.thumbnailUrl,
  };

  return (
    <PurchaseLayout currentStep={3}>
      <PurchaseSuccess purchase={purchase} journey={journeyInfo} />
    </PurchaseLayout>
  );
}

export default function SuccessPage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = use(params);

  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <PurchaseLayout currentStep={3}>
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </PurchaseLayout>
        }
      >
        <SuccessContent journeyId={journeyId} />
      </Suspense>
    </ProtectedRoute>
  );
}
