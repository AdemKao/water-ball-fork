'use client';

import { CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CompletionCelebrationProps {
  isVisible: boolean;
  lessonTitle: string;
  nextLessonId?: string | null;
  courseId: string;
  onClose: () => void;
}

export function CompletionCelebration({
  isVisible,
  lessonTitle,
  nextLessonId,
  courseId,
  onClose,
}: CompletionCelebrationProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={cn(
          'bg-card border rounded-lg p-8 max-w-md mx-4 text-center space-y-6 transform transition-all duration-500',
          'scale-100 opacity-100 animate-in fade-in zoom-in-95'
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">恭喜完成!</h2>
          <p className="text-muted-foreground">
            你已完成「{lessonTitle}」
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline">返回課程</Button>
          </Link>
          {nextLessonId && (
            <Link href={`/courses/${courseId}/lessons/${nextLessonId}`}>
              <Button>下一課</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
