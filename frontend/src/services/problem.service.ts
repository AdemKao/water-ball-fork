import { apiClient } from '@/lib/api-client';
import { ProblemDetail, UploadUrlRequest, UploadUrlResponse } from '@/types/gym';

export const problemService = {
  async getProblem(problemId: string): Promise<ProblemDetail> {
    return apiClient<ProblemDetail>(`/api/problems/${problemId}`);
  },

  async getUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
    return apiClient<UploadUrlResponse>(`/api/problems/${data.problemId}/upload-url`, {
      method: 'POST',
      body: JSON.stringify({
        fileName: data.fileName,
        fileType: data.fileType,
        fileSizeBytes: data.fileSizeBytes,
      }),
    });
  },
};
