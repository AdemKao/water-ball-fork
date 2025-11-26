'use client';

import { useState, useEffect, useCallback } from 'react';
import { JourneyDetail } from '@/types';
import { journeyService } from '@/services/journey.service';

export function useJourney(journeyId: string) {
  const [journey, setJourney] = useState<JourneyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJourney = useCallback(async () => {
    if (!journeyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await journeyService.getJourney(journeyId);
      setJourney(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [journeyId]);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney]);

  return { journey, isLoading, error, refetch: fetchJourney };
}
