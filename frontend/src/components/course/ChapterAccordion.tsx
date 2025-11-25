'use client';

import { useState } from 'react';
import { ChevronDown, Lock, Check } from 'lucide-react';
import { ChapterWithLessons } from '@/types';
import { LessonItem } from './LessonItem';
import { cn } from '@/lib/utils';

interface ChapterAccordionProps {
  chapter: ChapterWithLessons;
  isPurchased: boolean;
  defaultOpen?: boolean;
  activeLessonId?: string;
  onLessonClick?: (lessonId: string) => void;
}

export function ChapterAccordion({
  chapter,
  isPurchased,
  defaultOpen = false,
  activeLessonId,
  onLessonClick,
}: ChapterAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isLocked = chapter.accessType === 'PURCHASED' && !isPurchased;
  const completedCount = chapter.lessons.filter((l) => l.isCompleted).length;
  const isCompleted = completedCount === chapter.lessons.length && chapter.lessons.length > 0;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : isLocked ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
          )}
          <div className="text-left">
            <h3 className="font-medium">{chapter.title}</h3>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{chapter.lessons.length} 課程完成
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t px-2 py-2 space-y-1">
          {chapter.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isActive={lesson.id === activeLessonId}
              onClick={() => onLessonClick?.(lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
