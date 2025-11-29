'use client';

import { useState, useCallback } from 'react';
import { CreateSubmissionRequest, Submission } from '@/types/gym';
import { submissionService } from '@/services/submission.service';

export function useSubmission(problemId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(
    async (data: CreateSubmissionRequest): Promise<Submission> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await submissionService.createSubmission(problemId, data);
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
