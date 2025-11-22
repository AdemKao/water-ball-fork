import { apiClient } from '@/lib/api-client';

interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
}

export const healthService = {
  checkHealth: async (): Promise<HealthCheckResponse> => {
    return apiClient.get<HealthCheckResponse>('/api/health');
  },
};
