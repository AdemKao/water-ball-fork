'use client';

import { useState, useCallback } from 'react';
import { LessonProgress } from '@/types';
import { progressService } from '@/services/progress.service';

export function useLessonProgress(lessonId: string, initialProgress?: LessonProgress) {
  const [progress, setProgress] = useState<LessonProgress | null>(initialProgress ?? null);
  const [isUpdating, setIsUpdating] = useState(false);

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
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [lessonId, progress?.lastPositionSeconds]);

  return { progress, updateProgress, markComplete, isUpdating };
}
