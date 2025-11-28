'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  PurchaseLayout,
  CourseDescription,
  PricingCard,
} from '@/components/order';
import { ChapterAccordion } from '@/components/course/ChapterAccordion';
import { useJourney } from '@/hooks/useJourney';
import { usePendingPurchases } from '@/hooks/usePendingPurchases';
import { useAuth } from '@/hooks/useAuth';

export default function OrdersPage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { journey, isLoading, error } = useJourney(journeyId);
  const { pendingPurchaseForJourney, isLoading: isLoadingPending } = usePendingPurchases(
    user ? journeyId : undefined
  );

  useEffect(() => {
    if (!isLoading && journey?.isPurchased) {
      router.replace(`/courses/${journeyId}`);
      return;
    }
    if (!isLoadingPending && pendingPurchaseForJourney) {
      router.replace(`/journeys/${journeyId}/purchase`);
    }
  }, [isLoading, journey?.isPurchased, isLoadingPending, pendingPurchaseForJourney, journeyId, router]);

  const handleNextStep = () => {
    router.push(`/journeys/${journeyId}/purchase`);
  };

  if (isLoading || (user && isLoadingPending)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">
          {error?.message || '無法載入課程資料'}
        </div>
      </div>
    );
  }

  if (pendingPurchaseForJourney || journey?.isPurchased) {
    return null;
  }

  const installmentMonths = 12;

  return (
    <PurchaseLayout currentStep={1}>
      <CourseDescription
        title={journey.title}
        description={journey.description ? [journey.description] : []}
      />

      <div className="mt-8 space-y-2">
        <h3 className="font-medium text-lg mb-3">課程內容</h3>
        {journey.chapters.map((chapter, index) => (
          <ChapterAccordion
            key={chapter.id}
            chapter={chapter}
            isPurchased={false}
            defaultOpen={index === 0}
          />
        ))}
      </div>

      <div className="mt-8">
        <PricingCard
          price={journey.price}
          installmentInfo={{
            months: installmentMonths,
            monthlyPayment: Math.ceil(journey.price / installmentMonths),
          }}
        />
      </div>

      <div className="mt-8">
        <Button
          onClick={handleNextStep}
          className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
        >
          下一步：選取付款方式
        </Button>
      </div>
    </PurchaseLayout>
  );
}
