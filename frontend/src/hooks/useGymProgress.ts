'use client';

import { useState, useEffect, useCallback } from 'react';
import { GymProgressSummary } from '@/types/gym';
import { submissionService } from '@/services/submission.service';

export function useGymProgress() {
  const [progress, setProgress] = useState<GymProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await submissionService.getGymProgress();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gym progress'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, isLoading, error, refetch: fetchProgress };
}
