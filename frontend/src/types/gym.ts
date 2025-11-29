export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Gym {
  id: number;
  journeyId: number;
  title: string;
  description?: string;
  displayOrder: number;
  exerciseCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GymExercise {
  id: number;
  gymId: number;
  title: string;
  description?: string;
  difficulty: Difficulty;
  displayOrder: number;
  hasSubmission: boolean;
  latestSubmissionStatus?: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GymSubmission {
  id: number;
  exerciseId: number;
  userId: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: SubmissionStatus;
  feedback?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface GymExerciseDetail extends GymExercise {
  submissions: GymSubmission[];
}

export interface SubmitExerciseRequest {
  file: File;
}

export interface ReviewSubmissionRequest {
  status: 'APPROVED' | 'REJECTED';
  feedback?: string;
}

export interface GymListResponse {
  gyms: Gym[];
}

export interface GymExerciseListResponse {
  exercises: GymExercise[];
}

export interface GymSubmissionListResponse {
  submissions: GymSubmission[];
  totalCount: number;
  page: number;
  pageSize: number;
}
