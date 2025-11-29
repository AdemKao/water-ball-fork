import { apiClient } from '@/lib/api-client';
import { ProblemDetail } from '@/types/gym';

export const problemService = {
  async getProblem(problemId: string): Promise<ProblemDetail> {
    return apiClient<ProblemDetail>(`/api/problems/${problemId}`);
  },
};
