import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonNavItem } from '@/types';
import { Button } from '@/components/ui/button';

interface LessonNavigationProps {
  previousLesson: LessonNavItem | null;
  nextLesson: LessonNavItem | null;
  onNavigate?: (lessonId: string) => void;
  onNext?: () => void;
}

export function LessonNavigation({
  previousLesson,
  nextLesson,
  onNavigate,
  onNext,
}: LessonNavigationProps) {
  const handleNextClick = () => {
    onNext?.();
    if (nextLesson) {
      onNavigate?.(nextLesson.id);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-t">
      {previousLesson ? (
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => onNavigate?.(previousLesson.id)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{previousLesson.title}</span>
          <span className="sm:hidden">上一課</span>
        </Button>
      ) : (
        <div />
      )}
      {nextLesson ? (
        <Button
          variant="ghost"
          className="gap-2"
          onClick={handleNextClick}
        >
          <span className="hidden sm:inline">{nextLesson.title}</span>
          <span className="sm:hidden">下一課</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}
