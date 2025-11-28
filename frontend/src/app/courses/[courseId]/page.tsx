'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useJourney } from '@/hooks/useJourney';
import { usePurchase } from '@/hooks/usePurchase';
import { usePendingPurchases } from '@/hooks/usePendingPurchases';
import { ChapterAccordion, CourseProgress } from '@/components/course';
import { PurchaseButton, PendingPurchaseBanner } from '@/components/purchase';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseJourneyPage({ params }: PageProps) {
  const { courseId } = use(params);
  const router = useRouter();
  const { journey, isLoading, error } = useJourney(courseId);
  const { cancelPurchase, isCancelling } = usePurchase(courseId);
  const { pendingPurchaseForJourney, refetch } = usePendingPurchases(courseId);

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        <div className="space-y-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">
          {error?.message || '課程不存在'}
        </p>
      </div>
    );
  }

  const completedLessons = journey.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length,
    0
  );
  const progressPercentage = journey.lessonCount > 0 
    ? Math.round((completedLessons / journey.lessonCount) * 100) 
    : 0;

  const getFirstUncompletedLesson = () => {
    for (const chapter of journey.chapters) {
      for (const lesson of chapter.lessons) {
        if (!lesson.isCompleted) {
          return lesson.id;
        }
      }
    }
    return journey.chapters[0]?.lessons[0]?.id;
  };

  const handleStartLearning = () => {
    const lessonId = getFirstUncompletedLesson();
    if (lessonId) {
      router.push(`/courses/${courseId}/lessons/${lessonId}`);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{journey.title}</h1>
            {journey.description && (
              <p className="text-muted-foreground">{journey.description}</p>
            )}
          </div>

          {!journey.isPurchased && (
            <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
              <div className="flex-1">
                <p className="font-medium">購買此課程以解鎖所有內容</p>
                <p className="text-sm text-muted-foreground">
                  {journey.chapterCount} 章節 · {journey.lessonCount} 堂課
                </p>
              </div>
              <PurchaseButton
                journeyId={courseId}
                price={journey.price}
                currency={journey.currency}
              />
            </div>
          )}

          {journey.isPurchased && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <CourseProgress
                  progress={{
                    journeyId: journey.id,
                    totalLessons: journey.lessonCount,
                    completedLessons,
                    progressPercentage,
                    chapters: [],
                  }}
                />
              </div>
              <Button
                onClick={handleStartLearning}
                data-testid={completedLessons > 0 ? 'continue-learning-button' : 'start-learning-button'}
              >
                {completedLessons > 0 ? '繼續學習' : '開始學習'}
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {journey.chapters.map((chapter, index) => (
              <ChapterAccordion
                key={chapter.id}
                chapter={chapter}
                isPurchased={journey.isPurchased}
                defaultOpen={index === 0}
                onLessonClick={handleLessonClick}
              />
            ))}
          </div>
        </div>
      </div>

      {pendingPurchaseForJourney && (
        <PendingPurchaseBanner
          purchase={pendingPurchaseForJourney}
          onContinue={handleContinuePurchase}
          onCancel={handleCancelPurchase}
          isCancelling={isCancelling}
        />
      )}
    </>
  );
}
