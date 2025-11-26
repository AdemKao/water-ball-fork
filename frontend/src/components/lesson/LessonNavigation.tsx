import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonNavItem } from '@/types';
import { Button } from '@/components/ui/button';

interface LessonNavigationProps {
  previousLesson: LessonNavItem | null;
  nextLesson: LessonNavItem | null;
  courseId: string;
}

export function LessonNavigation({
  previousLesson,
  nextLesson,
  courseId,
}: LessonNavigationProps) {
  return (
    <div className="flex items-center justify-between py-4 border-t">
      {previousLesson ? (
        <Link href={`/courses/${courseId}/lessons/${previousLesson.id}`}>
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{previousLesson.title}</span>
            <span className="sm:hidden">上一課</span>
          </Button>
        </Link>
      ) : (
        <div />
      )}
      {nextLesson ? (
        <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
          <Button variant="ghost" className="gap-2">
            <span className="hidden sm:inline">{nextLesson.title}</span>
            <span className="sm:hidden">下一課</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
