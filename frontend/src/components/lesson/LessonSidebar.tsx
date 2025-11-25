'use client';

import { useRouter } from 'next/navigation';
import { JourneyDetail } from '@/types';
import { ChapterAccordion } from '@/components/course/ChapterAccordion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LessonSidebarProps {
  journey: JourneyDetail;
  activeLessonId: string;
  courseId: string;
}

export function LessonSidebar({ journey, activeLessonId, courseId }: LessonSidebarProps) {
  const router = useRouter();

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  };

  return (
    <div className="h-full flex flex-col border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold truncate">{journey.title}</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {journey.chapters.map((chapter) => (
            <ChapterAccordion
              key={chapter.id}
              chapter={chapter}
              isPurchased={journey.isPurchased}
              defaultOpen={chapter.lessons.some(l => l.id === activeLessonId)}
              activeLessonId={activeLessonId}
              onLessonClick={handleLessonClick}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
