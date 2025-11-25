'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { JourneyDetail } from '@/types';
import { ChapterAccordion } from '@/components/course/ChapterAccordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileLessonSidebarProps {
  journey: JourneyDetail;
  activeLessonId: string;
  courseId: string;
}

export function MobileLessonSidebar({
  journey,
  activeLessonId,
  courseId,
}: MobileLessonSidebarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">課程目錄</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="truncate text-left">{journey.title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-2">
            {journey.chapters.map((chapter) => (
              <ChapterAccordion
                key={chapter.id}
                chapter={chapter}
                isPurchased={journey.isPurchased}
                defaultOpen={chapter.lessons.some((l) => l.id === activeLessonId)}
                activeLessonId={activeLessonId}
                onLessonClick={handleLessonClick}
              />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
