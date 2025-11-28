'use client';

import { use, useState, useMemo } from 'react';
import { useJourney } from '@/hooks/useJourney';
import { useLesson } from '@/hooks/useLesson';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { usePurchase } from '@/hooks/usePurchase';
import { usePendingPurchases } from '@/hooks/usePendingPurchases';
import { Navbar } from '@/components/layout/navbar';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { PendingPurchaseBanner } from '@/components/purchase';
import { VideoPlayer, LessonNavigation, LoginRequiredModal } from '@/components/lesson';
import { useAuth } from '@/hooks/useAuth';
import { X } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseJourneyPage({ params }: PageProps) {
  const { courseId } = use(params);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { journey, isLoading, error, refetch: refetchJourney } = useJourney(courseId);
  const { cancelPurchase, isCancelling } = usePurchase(courseId);
  const { pendingPurchaseForJourney, refetch } = usePendingPurchases(courseId);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const activeLessonId = useMemo(() => {
    if (selectedLessonId) return selectedLessonId;
    return journey?.chapters[0]?.lessons[0]?.id || null;
  }, [selectedLessonId, journey]);

  const { lesson, isLoading: isLessonLoading, isUnauthorized } = useLesson(activeLessonId || '');
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
    setSelectedLessonId(lessonId);
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

  const isTrialLesson = currentLesson?.accessType === 'TRIAL';
  const needsLogin = (isTrialLesson && !user && !isAuthLoading) || isUnauthorized;

  const renderMainContent = () => {
    if (!activeLessonId || !currentLesson) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          請選擇一個課程開始學習
        </div>
      );
    }

    if (isLessonLoading && !isUnauthorized) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video bg-muted animate-pulse rounded-lg" />
        </div>
      );
    }

    if (needsLogin) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">請先登入以觀看試聽課程</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              登入
            </button>
          </div>
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
      <div className="space-y-4">
        {!bannerDismissed && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 flex items-center justify-between">
            <p className="text-sm">
              將此體驗課程的全部影片看完就可以獲得 3000 元課程折價券！
            </p>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

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
          onNavigate={(lessonId) => setSelectedLessonId(lessonId)}
        />
      </div>
    );
  };

  return (
    <>
      <div className="h-screen flex flex-col">
        <Navbar journeyId={courseId} />

        <SidebarProvider className="flex-1 overflow-hidden">
          <CourseSidebar
            journey={journey}
            activeLessonId={activeLessonId || undefined}
            onLessonClick={handleLessonClick}
          />

          <main className="flex-1 overflow-auto p-4 lg:p-8 bg-muted/30">
            {renderMainContent()}
          </main>
        </SidebarProvider>
      </div>

      {pendingPurchaseForJourney && (
        <PendingPurchaseBanner
          purchase={pendingPurchaseForJourney}
          onContinue={handleContinuePurchase}
          onCancel={handleCancelPurchase}
          isCancelling={isCancelling}
        />
      )}

      <LoginRequiredModal
        open={showLoginModal || needsLogin}
        onOpenChange={(open) => {
          setShowLoginModal(open);
        }}
        redirectUrl={`/courses/${courseId}`}
      />
    </>
  );
}
