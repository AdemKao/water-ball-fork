'use client';

import { useState, useEffect, useCallback } from 'react';
import { gymService } from '@/services/gym.service';
import { Gym, GymType } from '@/types/gym';

export function useGymList(options?: {
  journeyId?: string;
  type?: GymType;
}) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGyms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gymService.getGyms({
        journeyId: options?.journeyId,
        type: options?.type,
      });
      setGyms(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gyms'));
    } finally {
      setIsLoading(false);
    }
  }, [options?.journeyId, options?.type]);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  return { gyms, isLoading, error, refetch: fetchGyms };
}
