import { Check, Lock } from 'lucide-react';
import { LessonSummary } from '@/types';
import { LessonTypeIcon } from './LessonTypeIcon';
import { cn } from '@/lib/utils';

interface LessonItemProps {
  lesson: LessonSummary;
  isActive?: boolean;
  onClick?: () => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function LessonItem({ lesson, isActive, onClick }: LessonItemProps) {
  const isLocked = !lesson.isAccessible;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
        isActive && 'bg-primary/10',
        !isLocked && 'hover:bg-muted cursor-pointer',
        isLocked && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className="flex-shrink-0">
        {lesson.isCompleted ? (
          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        ) : isLocked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          <LessonTypeIcon type={lesson.lessonType} className="text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm truncate', isActive && 'font-medium')}>{lesson.title}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {lesson.accessType === 'TRIAL' && !isLocked && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600">
            試讀
          </span>
        )}
        {lesson.durationSeconds && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(lesson.durationSeconds)}
          </span>
        )}
      </div>
    </button>
  );
}
