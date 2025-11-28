'use client';

import { useState } from 'react';
import { ChevronUp, ChevronLeft, ChevronRight, Play, Check, Lock } from 'lucide-react';
import { JourneyDetail, LessonSummary } from '@/types';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface CourseSidebarProps {
  journey: JourneyDetail;
  activeLessonId?: string;
  onLessonClick?: (lessonId: string, isTrial: boolean) => void;
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
}: {
  lesson: LessonSummary;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const isLocked = !lesson.isAccessible;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onClick}
        disabled={isLocked}
        isActive={isActive}
        className={cn(
          'h-auto py-3',
          isLocked && 'opacity-60 cursor-not-allowed'
        )}
      >
        <Play className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 leading-snug">{lesson.title}</span>
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
      </SidebarMenuButton>
    </SidebarMenuItem>
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
      <SidebarGroup className="p-0">
        <SidebarGroupLabel asChild className="px-4 py-3 h-auto hover:bg-sidebar-accent">
          <CollapsibleTrigger className="w-full flex items-center justify-between">
            <span>{title}</span>
            <ChevronUp
              className={cn(
                'h-4 w-4 transition-transform',
                !isOpen && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {lessons.map((lesson) => {
                const isTrial = lesson.accessType === 'TRIAL';
                return (
                  <LessonRow
                    key={lesson.id}
                    lesson={{ ...lesson, isAccessible: isPurchased || isTrial }}
                    isActive={lesson.id === activeLessonId}
                    onClick={() => onLessonClick?.(lesson.id, isTrial)}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function CourseSidebar({
  journey,
  activeLessonId,
  onLessonClick,
}: CourseSidebarProps) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
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
      </SidebarContent>
      <SidebarFooter className="border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-start gap-2"
        >
          {open ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>收合側邊欄</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
