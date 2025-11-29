import { apiClient } from '@/lib/api-client';
import { Gym, GymDetail, GymType, StageDetail } from '@/types/gym';

export const gymService = {
  async getGyms(params?: {
    journeyId?: string;
    type?: GymType;
  }): Promise<Gym[]> {
    const searchParams = new URLSearchParams();
    if (params?.journeyId) searchParams.set('journeyId', params.journeyId);
    if (params?.type) searchParams.set('type', params.type);

    const query = searchParams.toString();
    const endpoint = query ? `/api/gyms?${query}` : '/api/gyms';

    return apiClient<Gym[]>(endpoint);
  },

  async getGym(gymId: string): Promise<GymDetail> {
    return apiClient<GymDetail>(`/api/gyms/${gymId}`);
  },

  async getStage(gymId: string, stageId: string): Promise<StageDetail> {
    return apiClient<StageDetail>(`/api/gyms/${gymId}/stages/${stageId}`);
  },
};
