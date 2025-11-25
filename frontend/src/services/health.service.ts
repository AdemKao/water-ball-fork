import { legacyApiClient } from '@/lib/api-client';

interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
}

export const healthService = {
  checkHealth: async (): Promise<HealthCheckResponse> => {
    return legacyApiClient.get<HealthCheckResponse>('/api/health');
  },
};
