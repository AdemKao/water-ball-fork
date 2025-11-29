import {
  Gym,
  GymExercise,
  GymExerciseDetail,
  GymSubmission,
  GymListResponse,
  GymExerciseListResponse,
  GymSubmissionListResponse,
  ReviewSubmissionRequest,
} from '@/types/gym';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const gymService = {
  async getGymsByJourney(journeyId: string): Promise<Gym[]> {
    const response = await fetch(`${API_URL}/api/journeys/${journeyId}/gyms`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch gyms');
    const data: GymListResponse = await response.json();
    return data.gyms;
  },

  async getExercises(gymId: number): Promise<GymExercise[]> {
    const response = await fetch(`${API_URL}/api/gyms/${gymId}/exercises`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch exercises');
    const data: GymExerciseListResponse = await response.json();
    return data.exercises;
  },

  async getExerciseDetail(exerciseId: number): Promise<GymExerciseDetail> {
    const response = await fetch(`${API_URL}/api/exercises/${exerciseId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch exercise detail');
    return response.json();
  },

  async submitExercise(exerciseId: number, file: File): Promise<GymSubmission> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/api/exercises/${exerciseId}/submissions`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to submit exercise');
    return response.json();
  },

  async getMySubmissions(exerciseId: number): Promise<GymSubmission[]> {
    const response = await fetch(`${API_URL}/api/exercises/${exerciseId}/submissions/me`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch submissions');
    const data: { submissions: GymSubmission[] } = await response.json();
    return data.submissions;
  },

  async getPendingSubmissions(page: number = 0, size: number = 20): Promise<GymSubmissionListResponse> {
    const response = await fetch(`${API_URL}/api/admin/submissions/pending?page=${page}&size=${size}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch pending submissions');
    return response.json();
  },

  async reviewSubmission(submissionId: number, review: ReviewSubmissionRequest): Promise<GymSubmission> {
    const response = await fetch(`${API_URL}/api/admin/submissions/${submissionId}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(review),
    });
    if (!response.ok) throw new Error('Failed to review submission');
    return response.json();
  },

  async downloadSubmission(submissionId: number): Promise<Blob> {
    const response = await fetch(`${API_URL}/api/submissions/${submissionId}/download`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to download submission');
    return response.blob();
  },
};
