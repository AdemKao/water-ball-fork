'use client';

import { useState, useEffect, useCallback } from 'react';
import { LessonDetail } from '@/types';
import { lessonService, LessonError } from '@/services/lesson.service';

export function useLesson(lessonId: string) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<LessonError | null>(null);

  const isAccessDenied = error?.status === 403;
  const isUnauthorized = error?.status === 401;

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await lessonService.getLesson(lessonId);
      setLesson(data);
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'status' in err) {
        setError(err as LessonError);
      } else {
        setError({ status: 500, message: 'Unknown error' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return { lesson, isLoading, error, isAccessDenied, isUnauthorized };
}
