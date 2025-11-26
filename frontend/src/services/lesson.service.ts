import { LessonDetail } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LessonError {
  status: number;
  message: string;
}

export const lessonService = {
  async getLesson(lessonId: string): Promise<LessonDetail> {
    const response = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error: LessonError = {
        status: response.status,
        message:
          response.status === 403
            ? '請購買此課程以解鎖完整內容'
            : response.status === 401
              ? '請先登入'
              : '無法載入課程',
      };
      throw error;
    }

    return response.json();
  },
};
