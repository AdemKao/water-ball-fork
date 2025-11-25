import { LessonSummary } from './lesson';

export type AccessType = 'PUBLIC' | 'TRIAL' | 'PURCHASED';

export interface Chapter {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  accessType: AccessType;
  lessonCount: number;
}

export interface ChapterWithLessons extends Chapter {
  lessons: LessonSummary[];
}
