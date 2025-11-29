import { apiClient } from '@/lib/api-client';
import {
  GymProgressSummary,
  PaginatedResponse,
  PublicSubmission,
  Submission,
  SubmissionDetail,
} from '@/types/gym';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

export const submissionService = {
  async createSubmission(
    problemId: string,
    file: File,
    isPublic: boolean = false
  ): Promise<Submission> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPublic', String(isPublic));

    const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}/submissions`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `Upload failed with status ${response.status}`);
    }

    return response.json();
  },

  async getSubmissionHistory(problemId: string): Promise<Submission[]> {
    return apiClient<Submission[]>(`/api/problems/${problemId}/submissions`);
  },

  async getSubmission(submissionId: string): Promise<SubmissionDetail> {
    return apiClient<SubmissionDetail>(`/api/submissions/${submissionId}`);
  },

  async updateVisibility(submissionId: string, isPublic: boolean): Promise<void> {
    await apiClient<void>(`/api/submissions/${submissionId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    });
  },

  async getPublicSubmissions(params?: {
    gymId?: string;
    problemId?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<PublicSubmission>> {
    const searchParams = new URLSearchParams();
    if (params?.gymId) searchParams.set('gymId', params.gymId);
    if (params?.problemId) searchParams.set('problemId', params.problemId);
    if (params?.page !== undefined) searchParams.set('page', String(params.page));
    if (params?.size !== undefined) searchParams.set('size', String(params.size));

    const query = searchParams.toString();
    const endpoint = query ? `/api/submissions/public?${query}` : '/api/submissions/public';

    return apiClient<PaginatedResponse<PublicSubmission>>(endpoint);
  },

  async getGymProgress(): Promise<GymProgressSummary> {
    return apiClient<GymProgressSummary>('/api/my/gym-progress');
  },
};
