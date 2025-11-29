'use client';

import { useState, useEffect, useCallback } from 'react';
import { StageDetail } from '@/types/gym';
import { gymService } from '@/services/gym.service';

interface StageError {
  status: number;
  message: string;
}

export function useStage(gymId: string, stageId: string) {
  const [stage, setStage] = useState<StageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StageError | null>(null);

  const fetchStage = useCallback(async () => {
    if (!gymId || !stageId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await gymService.getStage(gymId, stageId);
      setStage(data);
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'status' in err) {
        setError(err as StageError);
      } else {
        setError({ status: 500, message: 'Unknown error' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [gymId, stageId]);

  useEffect(() => {
    fetchStage();
  }, [fetchStage]);

  const refetch = useCallback(() => {
    fetchStage();
  }, [fetchStage]);

  return { stage, isLoading, error, refetch };
}
