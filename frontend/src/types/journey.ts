import { ChapterWithLessons } from './chapter';

export interface Journey {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  chapterCount: number;
  lessonCount: number;
  totalDurationSeconds: number;
  price: number;
  currency: string;
  originalPrice?: number;
  discountPercentage?: number;
}

export interface JourneyDetail extends Journey {
  chapters: ChapterWithLessons[];
  isPurchased: boolean;
}
