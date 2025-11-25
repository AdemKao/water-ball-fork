import { Journey, JourneyDetail, JourneyProgress } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const journeyService = {
  async getJourneys(): Promise<Journey[]> {
    const response = await fetch(`${API_URL}/api/journeys`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch journeys');
    return response.json();
  },

  async getJourney(journeyId: string): Promise<JourneyDetail> {
    const response = await fetch(`${API_URL}/api/journeys/${journeyId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error('Journey not found');
      throw new Error('Failed to fetch journey');
    }
    return response.json();
  },

  async getJourneyProgress(journeyId: string): Promise<JourneyProgress> {
    const response = await fetch(`${API_URL}/api/journeys/${journeyId}/progress`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch progress');
    return response.json();
  },
};
