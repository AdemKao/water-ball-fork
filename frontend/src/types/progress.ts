export interface LessonProgress {
  isCompleted: boolean;
  lastPositionSeconds: number;
  completedAt: string | null;
}

export interface UpdateProgressResponse {
  lessonId: string;
  isCompleted: boolean;
  lastPositionSeconds: number;
  updatedAt: string;
}

export interface CompleteResponse {
  lessonId: string;
  isCompleted: boolean;
  completedAt: string;
}

export interface JourneyProgress {
  journeyId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  chapters: ChapterProgress[];
}

export interface ChapterProgress {
  chapterId: string;
  title: string;
  totalLessons: number;
  completedLessons: number;
  isCompleted: boolean;
}
