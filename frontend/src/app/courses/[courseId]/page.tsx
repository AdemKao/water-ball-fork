'use client';

import { use, useState, useMemo } from 'react';
import { useJourney } from '@/hooks/useJourney';
import { useLesson } from '@/hooks/useLesson';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { usePurchase } from '@/hooks/usePurchase';
import { usePendingPurchases } from '@/hooks/usePendingPurchases';
import { CourseHeader } from '@/components/course/CourseHeader';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { PendingPurchaseBanner } from '@/components/purchase';
import { VideoPlayer, LessonNavigation, LoginRequiredModal } from '@/components/lesson';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { X } from 'lucide-react';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseJourneyPage({ params }: PageProps) {
  const { courseId } = use(params);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { journey, isLoading, error, refetch: refetchJourney } = useJourney(courseId);
  const { cancelPurchase, isCancelling } = usePurchase(courseId);
  const { pendingPurchaseForJourney, refetch } = usePendingPurchases(courseId);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const activeLessonId = useMemo(() => {
    if (selectedLessonId) return selectedLessonId;
    return journey?.chapters[0]?.lessons[0]?.id || null;
  }, [selectedLessonId, journey]);

  const { lesson, isLoading: isLessonLoading } = useLesson(activeLessonId || '');
  const { progress, markComplete } = useLessonProgress(
    activeLessonId || '',
    lesson?.progress,
    { onComplete: refetchJourney }
  );
  const { updatePosition } = useVideoProgress(activeLessonId || '');

  const handleLessonClick = (lessonId: string, isTrial: boolean) => {
    if (isTrial && !user && !isAuthLoading) {
      setShowLoginModal(true);
      return;
    }
    setActiveLessonId(lessonId);
    setMobileMenuOpen(false);
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
      <div className="h-screen flex flex-col">
        <div className="h-16 border-b bg-background animate-pulse" />
        <div className="flex-1 flex">
          <div className="w-[280px] bg-muted animate-pulse hidden lg:block" />
          <div className="flex-1 p-8">
            <div className="aspect-video bg-muted animate-pulse rounded-lg max-w-4xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-destructive">{error?.message || '課程不存在'}</p>
      </div>
    );
  }

  const currentLesson = journey.chapters
    .flatMap((c) => c.lessons)
    .find((l) => l.id === activeLessonId);

  const renderMainContent = () => {
    if (!activeLessonId || !currentLesson) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          請選擇一個課程開始學習
        </div>
      );
    }

    if (isLessonLoading) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video bg-muted animate-pulse rounded-lg" />
        </div>
      );
    }

    if (!lesson) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          無法載入課程內容
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-[#F17500]/10 border border-[#F17500]/30 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm">
            將此體驗課程的全部影片看完就可以獲得 3000 元課程折價券！
          </p>
          <button className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {lesson.lessonType === 'VIDEO' && lesson.contentUrl && (
          <VideoPlayer
            contentUrl={lesson.contentUrl}
            initialPosition={progress?.lastPositionSeconds}
            onTimeUpdate={(time) => updatePosition(time)}
            onEnded={() => markComplete()}
          />
        )}

        {lesson.lessonType === 'ARTICLE' && (
          <div className="prose dark:prose-invert max-w-none">
            {lesson.contentUrl}
          </div>
        )}

        <LessonNavigation
          previousLesson={lesson.previousLesson}
          nextLesson={lesson.nextLesson}
          courseId={courseId}
        />
      </div>
    );
  };

  return (
    <>
      <div className="h-screen flex flex-col">
        <CourseHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          journeyId={courseId}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="hidden lg:block">
            <CourseSidebar
              journey={journey}
              activeLessonId={activeLessonId || undefined}
              onLessonClick={handleLessonClick}
            />
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-[280px] p-0">
              <CourseSidebar
                journey={journey}
                activeLessonId={activeLessonId || undefined}
                onLessonClick={handleLessonClick}
              />
            </SheetContent>
          </Sheet>

          <main className="flex-1 overflow-auto p-4 lg:p-8 bg-muted/30">
            {renderMainContent()}
          </main>
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

      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
