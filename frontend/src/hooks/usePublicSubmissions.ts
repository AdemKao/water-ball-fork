'use client';

import { useState, useEffect, useCallback } from 'react';
import { PublicSubmission } from '@/types/gym';
import { submissionService } from '@/services/submission.service';

interface UsePublicSubmissionsOptions {
  gymId?: string;
  problemId?: string;
  page?: number;
  size?: number;
}

interface Pagination {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export function usePublicSubmissions(options?: UsePublicSubmissionsOptions) {
  const [submissions, setSubmissions] = useState<PublicSubmission[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const gymId = options?.gymId;
  const problemId = options?.problemId;
  const page = options?.page;
  const size = options?.size;

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await submissionService.getPublicSubmissions({ gymId, problemId, page, size });
      setSubmissions(data.content);
      setPagination({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.number,
        pageSize: data.size,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch public submissions'));
    } finally {
      setIsLoading(false);
    }
  }, [gymId, problemId, page, size]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const refetch = useCallback(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, pagination, isLoading, error, refetch };
}
