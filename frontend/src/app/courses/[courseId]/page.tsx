'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useJourney } from '@/hooks/useJourney';
import { ChapterAccordion, CourseProgress } from '@/components/course';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseJourneyPage({ params }: PageProps) {
  const { courseId } = use(params);
  const router = useRouter();
  const { journey, isLoading, error } = useJourney(courseId);

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{journey.title}</h1>
          {journey.description && (
            <p className="text-muted-foreground">{journey.description}</p>
          )}
        </div>

        {journey.isPurchased && (
          <CourseProgress
            progress={{
              journeyId: journey.id,
              totalLessons: journey.lessonCount,
              completedLessons,
              progressPercentage,
              chapters: [],
            }}
          />
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
  );
}
