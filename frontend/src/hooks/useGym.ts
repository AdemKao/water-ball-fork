'use client';

import { useState, useEffect, useCallback } from 'react';
import { gymService } from '@/services/gym.service';
import { Gym, GymDetail, GymType } from '@/types/gym';

export function useGyms(journeyId?: string, type?: GymType) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGyms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gymService.getGyms({ journeyId, type });
      setGyms(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gyms'));
    } finally {
      setIsLoading(false);
    }
  }, [journeyId, type]);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  return { gyms, isLoading, error, refetch: fetchGyms };
}

export function useGym(gymId: string) {
  const [gym, setGym] = useState<GymDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGym = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await gymService.getGym(gymId);
      setGym(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gym'));
    } finally {
      setIsLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchGym();
  }, [fetchGym]);

  return { gym, isLoading, error, refetch: fetchGym };
}
