'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { purchaseService } from '@/services/purchase.service';
import { useJourney } from '@/hooks/useJourney';
import { PurchaseSuccess } from '@/components/purchase';
import { ProtectedRoute } from '@/components/auth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Purchase } from '@/types';

export default function SuccessPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get('purchaseId');

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { journey, isLoading: isLoadingJourney } = useJourney(courseId);

  useEffect(() => {
    if (!purchaseId) {
      router.replace(`/courses/${courseId}`);
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
  }, [purchaseId, courseId, router]);

  if (isLoading || isLoadingJourney) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!purchase || !journey || error) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
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
      </ProtectedRoute>
    );
  }

  const journeyInfo = {
    id: journey.id,
    title: journey.title,
    thumbnailUrl: journey.thumbnailUrl,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-16">
        <PurchaseSuccess purchase={purchase} journey={journeyInfo} />
      </div>
    </ProtectedRoute>
  );
}
