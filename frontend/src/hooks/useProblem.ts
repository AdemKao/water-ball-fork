'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProblemDetail } from '@/types/gym';
import { problemService } from '@/services/problem.service';

interface ProblemError {
  status: number;
  message: string;
}

export function useProblem(problemId: string) {
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ProblemError | null>(null);
  const isInitialLoad = useRef(true);

  const fetchProblem = useCallback(async (showLoading: boolean = true) => {
    if (!problemId) return;
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await problemService.getProblem(problemId);
      setProblem(data);
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'status' in err) {
        setError(err as ProblemError);
      } else {
        setError({ status: 500, message: 'Unknown error' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    fetchProblem(true);
    isInitialLoad.current = false;
  }, [fetchProblem]);

  const refetch = useCallback(() => {
    fetchProblem(false);
  }, [fetchProblem]);

  return { problem, isLoading, error, refetch };
}
