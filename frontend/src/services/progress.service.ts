import { UpdateProgressResponse, CompleteResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const progressService = {
  async updateProgress(
    lessonId: string,
    lastPositionSeconds: number
  ): Promise<UpdateProgressResponse> {
    const response = await fetch(`${API_URL}/api/lessons/${lessonId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ lastPositionSeconds }),
    });

    if (!response.ok) throw new Error('Failed to update progress');
    return response.json();
  },

  async markComplete(lessonId: string): Promise<CompleteResponse> {
    const response = await fetch(`${API_URL}/api/lessons/${lessonId}/complete`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Failed to mark complete');
    return response.json();
  },

  sendBeaconProgress(lessonId: string, lastPositionSeconds: number): void {
    const url = `${API_URL}/api/lessons/${lessonId}/progress`;
    const data = JSON.stringify({ lastPositionSeconds });
    navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
  },
};
