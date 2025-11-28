'use client';

import { useState } from 'react';
import { ChevronUp, ChevronLeft, ChevronRight, Play, Check, Lock } from 'lucide-react';
import { JourneyDetail, LessonSummary } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CourseSidebarProps {
  journey: JourneyDetail;
  activeLessonId?: string;
  onLessonClick?: (lessonId: string, isTrial: boolean) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface ChapterSectionProps {
  title: string;
  lessons: LessonSummary[];
  isPurchased: boolean;
  defaultOpen?: boolean;
  activeLessonId?: string;
  onLessonClick?: (lessonId: string, isTrial: boolean) => void;
}

function LessonRow({
  lesson,
  isActive,
  onClick,
  isTrial,
}: {
  lesson: LessonSummary;
  isActive?: boolean;
  onClick?: () => void;
  isTrial?: boolean;
}) {
  const isLocked = !lesson.isAccessible;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
        isActive && 'bg-primary text-primary-foreground',
        !isActive && !isLocked && 'hover:bg-muted',
        isLocked && 'opacity-60 cursor-not-allowed'
      )}
    >
      <Play className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 text-sm leading-snug">{lesson.title}</span>
      <div className="flex-shrink-0">
        {lesson.isCompleted ? (
          <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
            <Check className="h-3 w-3" />
          </div>
        ) : isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
        )}
      </div>
    </button>
  );
}

function ChapterSection({
  title,
  lessons,
  isPurchased,
  defaultOpen = false,
  activeLessonId,
  onLessonClick,
}: ChapterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <ChevronUp
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            !isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div>
          {lessons.map((lesson) => {
            const isTrial = lesson.accessType === 'TRIAL';
            return (
              <LessonRow
                key={lesson.id}
                lesson={{ ...lesson, isAccessible: isPurchased || isTrial }}
                isActive={lesson.id === activeLessonId}
                isTrial={isTrial}
                onClick={() => onLessonClick?.(lesson.id, isTrial)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CourseSidebar({
  journey,
  activeLessonId,
  onLessonClick,
  collapsed = false,
  onToggleCollapse,
}: CourseSidebarProps) {
  return (
    <div className="relative flex h-full">
      <aside className={cn(
        "bg-background border-r flex flex-col h-full transition-all duration-300",
        collapsed ? "w-0 overflow-hidden" : "w-[280px]"
      )}>
        <ScrollArea className="flex-1">
          {journey.chapters.map((chapter, index) => (
            <ChapterSection
              key={chapter.id}
              title={chapter.title}
              lessons={chapter.lessons}
              isPurchased={journey.isPurchased}
              defaultOpen={
                index === 0 ||
                chapter.lessons.some((l) => l.id === activeLessonId)
              }
              activeLessonId={activeLessonId}
              onLessonClick={onLessonClick}
            />
          ))}
        </ScrollArea>
      </aside>
      
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="h-12 w-5 bg-muted border border-border rounded-r-md flex items-center justify-center hover:bg-muted/80 transition-colors self-center -ml-px"
          title={collapsed ? "展開側邊欄" : "收起側邊欄"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
