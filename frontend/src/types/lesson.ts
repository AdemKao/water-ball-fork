import { AccessType } from './chapter';
import { LessonProgress } from './progress';

export type LessonType = 'VIDEO' | 'GOOGLE_FORM' | 'ARTICLE';

export interface InstructorInfo {
  id: string;
  name: string;
  pictureUrl: string | null;
}

export interface LessonSummary {
  id: string;
  title: string;
  lessonType: LessonType;
  durationSeconds: number | null;
  accessType: AccessType;
  isAccessible: boolean;
  isCompleted: boolean;
  instructor: InstructorInfo | null;
}

export interface LessonNavItem {
  id: string;
  title: string;
}

export interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  lessonType: LessonType;
  contentUrl: string | null;
  videoStreamUrl: string | null;
  durationSeconds: number | null;
  instructor: InstructorInfo | null;
  progress: LessonProgress;
  previousLesson: LessonNavItem | null;
  nextLesson: LessonNavItem | null;
  journeyId: string;
  journeyTitle: string;
}
