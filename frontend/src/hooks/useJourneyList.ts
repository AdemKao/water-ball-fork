'use client';

import { useState, useEffect, useCallback } from 'react';
import { Journey } from '@/types';
import { journeyService } from '@/services/journey.service';

export function useJourneyList() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJourneys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await journeyService.getJourneys();
      setJourneys(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  return { journeys, isLoading, error, refetch: fetchJourneys };
}
