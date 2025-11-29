'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLesson } from '@/hooks/useLesson';
import { useJourney } from '@/hooks/useJourney';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useAuth } from '@/hooks/useAuth';
import {
  VideoPlayer,
  GoogleFormEmbed,
  ArticleContent,
  LessonNavigation,
  LessonSidebar,
  AccessDeniedModal,
  CompletionCelebration,
} from '@/components/lesson';

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { lesson, isLoading, error, isAccessDenied, isUnauthorized } = useLesson(lessonId);
  const { journey, refetch: refetchJourney } = useJourney(courseId);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleLessonComplete = useCallback(() => {
    refetchJourney();
    setShowCelebration(true);
  }, [refetchJourney]);

  const { progress, markComplete } = useLessonProgress(
    lessonId,
    lesson?.progress,
    { onComplete: handleLessonComplete }
  );
  const { startTracking, updatePosition, stopTracking } = useVideoProgress(lessonId);

  useEffect(() => {
    if (isUnauthorized && !user) {
      router.push('/login');
    }
  }, [isUnauthorized, user, router]);

  useEffect(() => {
    if (lesson?.lessonType === 'VIDEO' && lesson.progress) {
      startTracking(lesson.progress.lastPositionSeconds);
    }
    return () => {
      stopTracking();
    };
  }, [lesson, startTracking, stopTracking]);

  if (isLoading) {
    return (
      <div className="h-screen flex">
        <div className="flex-1 p-8">
          <div className="aspect-video bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="w-80 bg-muted animate-pulse hidden lg:block" />
      </div>
    );
  }

  if (isAccessDenied) {
    return <AccessDeniedModal journeyId={courseId} />;
  }

  if (error || !lesson) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-destructive">{error?.message || '課程不存在'}</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (lesson.lessonType) {
      case 'VIDEO':
        return (
          <VideoPlayer
            contentUrl={lesson.contentUrl || ''}
            initialPosition={progress?.lastPositionSeconds}
            onTimeUpdate={(time) => updatePosition(time)}
            onEnded={() => markComplete()}
          />
        );
      case 'GOOGLE_FORM':
        return <GoogleFormEmbed formUrl={lesson.contentUrl || ''} />;
      case 'ARTICLE':
        return <ArticleContent content={lesson.contentUrl || ''} />;
      default:
        return <p>Unsupported lesson type</p>;
    }
  };

  return (
    <div className="h-screen flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-muted-foreground">{lesson.description}</p>
            )}
            {renderContent()}
            <LessonNavigation
              previousLesson={lesson.previousLesson}
              nextLesson={lesson.nextLesson}
              onNavigate={(lessonId) => router.push(`/courses/${courseId}/lessons/${lessonId}`)}
            />
          </div>
        </div>
      </div>

      {journey && (
        <div className="hidden lg:block w-80">
          <LessonSidebar
            journey={journey}
            activeLessonId={lessonId}
            courseId={courseId}
          />
        </div>
      )}

      {lesson && (
        <CompletionCelebration
          isVisible={showCelebration}
          lessonTitle={lesson.title}
          nextLessonId={lesson.nextLesson?.id}
          courseId={courseId}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}
