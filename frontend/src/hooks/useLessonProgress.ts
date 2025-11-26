'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { LessonProgress } from '@/types';
import { progressService } from '@/services/progress.service';

interface UseLessonProgressOptions {
  onComplete?: () => void;
}

export function useLessonProgress(
  lessonId: string,
  initialProgress?: LessonProgress,
  options?: UseLessonProgressOptions
) {
  const [progress, setProgress] = useState<LessonProgress | null>(initialProgress ?? null);
  const [isUpdating, setIsUpdating] = useState(false);
  const onCompleteRef = useRef(options?.onComplete);

  useEffect(() => {
    onCompleteRef.current = options?.onComplete;
  }, [options?.onComplete]);

  const updateProgress = useCallback(
    async (position: number) => {
      if (!lessonId) return;
      setIsUpdating(true);
      try {
        const result = await progressService.updateProgress(lessonId, position);
        setProgress({
          isCompleted: result.isCompleted,
          lastPositionSeconds: result.lastPositionSeconds,
          completedAt: null,
        });
      } catch (err) {
        console.error('Failed to update progress:', err);
      } finally {
        setIsUpdating(false);
      }
    },
    [lessonId]
  );

  const markComplete = useCallback(async () => {
    if (!lessonId) return;
    setIsUpdating(true);
    try {
      const result = await progressService.markComplete(lessonId);
      setProgress({
        isCompleted: true,
        lastPositionSeconds: progress?.lastPositionSeconds ?? 0,
        completedAt: result.completedAt,
      });
      onCompleteRef.current?.();
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [lessonId, progress?.lastPositionSeconds]);

  return { progress, updateProgress, markComplete, isUpdating };
}
