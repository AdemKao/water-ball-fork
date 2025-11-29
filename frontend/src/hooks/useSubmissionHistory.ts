'use client';

import { useState, useEffect, useCallback } from 'react';
import { Submission } from '@/types/gym';
import { submissionService } from '@/services/submission.service';

export function useSubmissionHistory(problemId: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!problemId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await submissionService.getSubmissionHistory(problemId);
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch submissions'));
    } finally {
      setIsLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const updateVisibility = useCallback(
    async (submissionId: string, isPublic: boolean): Promise<void> => {
      await submissionService.updateVisibility(submissionId, isPublic);
      await fetchSubmissions();
    },
    [fetchSubmissions]
  );

  const refetch = useCallback(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, isLoading, error, updateVisibility, refetch };
}
