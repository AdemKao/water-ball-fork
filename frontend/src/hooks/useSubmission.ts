'use client';

import { useState, useCallback } from 'react';
import { Submission } from '@/types/gym';
import { submissionService } from '@/services/submission.service';

export function useSubmission(problemId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(
    async (file: File, isPublic: boolean = false): Promise<Submission> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await submissionService.createSubmission(problemId, file, isPublic);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to submit');
        setError(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [problemId]
  );

  return { submit, isSubmitting, error };
}
