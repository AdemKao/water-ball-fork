'use client';

import { useRef, useCallback, useEffect } from 'react';
import { progressService } from '@/services/progress.service';

const REPORT_INTERVAL = 10000;

export function useVideoProgress(lessonId: string) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPositionRef = useRef<number>(0);
  const isTrackingRef = useRef(false);

  const startTracking = useCallback((startPosition: number) => {
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;
    currentPositionRef.current = startPosition;

    intervalRef.current = setInterval(() => {
      progressService.updateProgress(lessonId, currentPositionRef.current)
        .catch(console.error);
    }, REPORT_INTERVAL);
  }, [lessonId]);

  const updatePosition = useCallback((position: number) => {
    currentPositionRef.current = position;
  }, []);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (currentPositionRef.current > 0) {
      progressService.sendBeaconProgress(lessonId, currentPositionRef.current);
    }
  }, [lessonId]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTrackingRef.current) {
        progressService.sendBeaconProgress(lessonId, currentPositionRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lessonId]);

  return { startTracking, updatePosition, stopTracking };
}
