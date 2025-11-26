# Frontend Tasks: Course Lesson System

## Overview

實作課程瀏覽與學習介面，基於 Journey -> Chapter -> Lesson 三層架構。

---

## Phase 1: Types Definition

### Task 1.1: 更新 types/journey.ts

**檔案**: `src/types/journey.ts`

```typescript
export interface Journey {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  chapterCount: number;
  lessonCount: number;
  totalDurationSeconds: number;
}

export interface JourneyDetail extends Journey {
  chapters: ChapterWithLessons[];
  isPurchased: boolean;
}
```

**驗收條件**:

- [ ] 型別定義完整
- [ ] 與 backend-spec.md API response 一致

---

### Task 1.2: 建立 types/chapter.ts

**檔案**: `src/types/chapter.ts`

```typescript
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
```

**驗收條件**:

- [ ] AccessType enum 定義正確
- [ ] Chapter 與 ChapterWithLessons 型別分離

---

### Task 1.3: 更新 types/lesson.ts

**檔案**: `src/types/lesson.ts`

```typescript
import { AccessType } from './chapter';

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
```

**驗收條件**:

- [ ] LessonType enum 與 backend 一致
- [ ] LessonSummary 用於列表顯示
- [ ] LessonDetail 用於詳情頁

---

### Task 1.4: 建立 types/progress.ts

**檔案**: `src/types/progress.ts`

```typescript
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
```

**驗收條件**:

- [ ] 進度型別完整
- [ ] Response 型別與 API 一致

---

### Task 1.5: 更新 types/index.ts

**檔案**: `src/types/index.ts`

新增 exports:

```typescript
export * from './journey';
export * from './chapter';
export * from './lesson';
export * from './progress';
```

**驗收條件**:

- [ ] 所有新型別可從 `@/types` import

---

## Phase 2: Services

### Task 2.1: 建立 services/journey.service.ts

**檔案**: `src/services/journey.service.ts`

```typescript
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
```

**驗收條件**:

- [ ] 三個方法實作完成
- [ ] 錯誤處理正確
- [ ] credentials: 'include' 確保 cookie 傳送

---

### Task 2.2: 建立 services/lesson.service.ts

**檔案**: `src/services/lesson.service.ts`

```typescript
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
        message: response.status === 403 
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
```

**驗收條件**:

- [ ] 403/401 錯誤正確處理
- [ ] 回傳錯誤物件包含 status

---

### Task 2.3: 建立 services/progress.service.ts

**檔案**: `src/services/progress.service.ts`

```typescript
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
```

**驗收條件**:

- [ ] PUT/POST 方法實作
- [ ] sendBeacon 用於頁面離開時

---

## Phase 3: Hooks

### Task 3.1: 建立 hooks/useJourneyList.ts

**檔案**: `src/hooks/useJourneyList.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Journey } from '@/types';
import { journeyService } from '@/services/journey.service';

export function useJourneyList() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJourneys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await journeyService.getJourneys();
      setJourneys(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  return { journeys, isLoading, error, refetch: fetchJourneys };
}
```

**驗收條件**:

- [ ] 自動 fetch on mount
- [ ] 提供 refetch 方法
- [ ] Loading/error state 管理

---

### Task 3.2: 建立 hooks/useJourney.ts

**檔案**: `src/hooks/useJourney.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { JourneyDetail } from '@/types';
import { journeyService } from '@/services/journey.service';

export function useJourney(journeyId: string) {
  const [journey, setJourney] = useState<JourneyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJourney = useCallback(async () => {
    if (!journeyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await journeyService.getJourney(journeyId);
      setJourney(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [journeyId]);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney]);

  return { journey, isLoading, error, refetch: fetchJourney };
}
```

**驗收條件**:

- [ ] journeyId 變更時自動 refetch
- [ ] null check for journeyId

---

### Task 3.3: 建立 hooks/useLesson.ts

**檔案**: `src/hooks/useLesson.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { LessonDetail } from '@/types';
import { lessonService, LessonError } from '@/services/lesson.service';

export function useLesson(lessonId: string) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<LessonError | null>(null);

  const isAccessDenied = error?.status === 403;
  const isUnauthorized = error?.status === 401;

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await lessonService.getLesson(lessonId);
      setLesson(data);
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'status' in err) {
        setError(err as LessonError);
      } else {
        setError({ status: 500, message: 'Unknown error' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return { lesson, isLoading, error, isAccessDenied, isUnauthorized };
}
```

**驗收條件**:

- [ ] isAccessDenied/isUnauthorized flags
- [ ] Error 包含 status 和 message

---

### Task 3.4: 建立 hooks/useLessonProgress.ts

**檔案**: `src/hooks/useLessonProgress.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { LessonProgress } from '@/types';
import { progressService } from '@/services/progress.service';

export function useLessonProgress(lessonId: string, initialProgress?: LessonProgress) {
  const [progress, setProgress] = useState<LessonProgress | null>(initialProgress ?? null);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProgress = useCallback(async (position: number) => {
    if (!lessonId) return;
    setIsUpdating(true);
    try {
      const result = await progressService.updateProgress(lessonId, position);
      setProgress({
        isCompleted: result.isCompleted,
        lastPositionSeconds: result.lastPositionSeconds,
        completedAt: null,
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [lessonId]);

  const markComplete = useCallback(async () => {
    if (!lessonId) return;
    setIsUpdating(true);
    try {
      const result = await progressService.markComplete(lessonId);
      setProgress({
        isCompleted: true,
        lastPositionSeconds: progress?.lastPositionSeconds ?? 0,
        completedAt: result.completedAt,
      });
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [lessonId, progress?.lastPositionSeconds]);

  return { progress, updateProgress, markComplete, isUpdating };
}
```

**驗收條件**:

- [ ] updateProgress debounce 處理
- [ ] markComplete 更新本地 state

---

### Task 3.5: 建立 hooks/useVideoProgress.ts

**檔案**: `src/hooks/useVideoProgress.ts`

```typescript
'use client';

import { useRef, useCallback, useEffect } from 'react';
import { progressService } from '@/services/progress.service';

const REPORT_INTERVAL = 30000; // 30 seconds

export function useVideoProgress(lessonId: string) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPositionRef = useRef<number>(0);
  const isTrackingRef = useRef(false);

  const startTracking = useCallback((startPosition: number) => {
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;
    currentPositionRef.current = startPosition;

    intervalRef.current = setInterval(() => {
      progressService.updateProgress(lessonId, currentPositionRef.current)
        .catch(console.error);
    }, REPORT_INTERVAL);
  }, [lessonId]);

  const updatePosition = useCallback((position: number) => {
    currentPositionRef.current = position;
  }, []);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Send final position via beacon
    if (currentPositionRef.current > 0) {
      progressService.sendBeaconProgress(lessonId, currentPositionRef.current);
    }
  }, [lessonId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTrackingRef.current) {
        progressService.sendBeaconProgress(lessonId, currentPositionRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lessonId]);

  return { startTracking, updatePosition, stopTracking };
}
```

**驗收條件**:

- [ ] 每 30 秒回報一次
- [ ] 頁面隱藏/離開時用 sendBeacon
- [ ] cleanup interval on unmount

---

## Phase 4: Course Components

### Task 4.1: 建立 components/course/ProgressBar.tsx

**檔案**: `src/components/course/ProgressBar.tsx`

```typescript
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  showPercentage = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 bg-muted rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-muted-foreground">{percentage}%</span>
      )}
    </div>
  );
}
```

**驗收條件**:

- [ ] 三種尺寸支援
- [ ] 百分比顯示可選

---

### Task 4.2: 建立 components/course/LessonTypeIcon.tsx

**檔案**: `src/components/course/LessonTypeIcon.tsx`

```typescript
import { Video, FileText, ClipboardList } from 'lucide-react';
import { LessonType } from '@/types';
import { cn } from '@/lib/utils';

interface LessonTypeIconProps {
  type: LessonType;
  className?: string;
}

export function LessonTypeIcon({ type, className }: LessonTypeIconProps) {
  const iconClass = cn('h-4 w-4', className);

  switch (type) {
    case 'VIDEO':
      return <Video className={iconClass} />;
    case 'ARTICLE':
      return <FileText className={iconClass} />;
    case 'GOOGLE_FORM':
      return <ClipboardList className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
}
```

**驗收條件**:

- [ ] 三種課程類型圖示
- [ ] 支援 className 自訂

---

### Task 4.3: 建立 components/course/LessonItem.tsx

**檔案**: `src/components/course/LessonItem.tsx`

```typescript
import { Check, Lock } from 'lucide-react';
import { LessonSummary } from '@/types';
import { LessonTypeIcon } from './LessonTypeIcon';
import { cn } from '@/lib/utils';

interface LessonItemProps {
  lesson: LessonSummary;
  isActive?: boolean;
  onClick?: () => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function LessonItem({ lesson, isActive, onClick }: LessonItemProps) {
  const isLocked = !lesson.isAccessible;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
        isActive && 'bg-primary/10',
        !isLocked && 'hover:bg-muted cursor-pointer',
        isLocked && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className="flex-shrink-0">
        {lesson.isCompleted ? (
          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        ) : isLocked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          <LessonTypeIcon type={lesson.lessonType} className="text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm truncate', isActive && 'font-medium')}>
          {lesson.title}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {lesson.accessType === 'TRIAL' && !isLocked && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600">
            試讀
          </span>
        )}
        {lesson.durationSeconds && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(lesson.durationSeconds)}
          </span>
        )}
      </div>
    </button>
  );
}
```

**驗收條件**:

- [ ] 完成狀態顯示綠色勾
- [ ] 鎖定狀態顯示鎖
- [ ] 試讀標籤顯示
- [ ] 時長格式化

---

### Task 4.4: 建立 components/course/ChapterAccordion.tsx

**檔案**: `src/components/course/ChapterAccordion.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ChevronDown, Lock, Check } from 'lucide-react';
import { ChapterWithLessons } from '@/types';
import { LessonItem } from './LessonItem';
import { cn } from '@/lib/utils';

interface ChapterAccordionProps {
  chapter: ChapterWithLessons;
  isPurchased: boolean;
  defaultOpen?: boolean;
  activeLessonId?: string;
  onLessonClick?: (lessonId: string) => void;
}

export function ChapterAccordion({
  chapter,
  isPurchased,
  defaultOpen = false,
  activeLessonId,
  onLessonClick,
}: ChapterAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const isLocked = chapter.accessType === 'PURCHASED' && !isPurchased;
  const completedCount = chapter.lessons.filter(l => l.isCompleted).length;
  const isCompleted = completedCount === chapter.lessons.length && chapter.lessons.length > 0;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : isLocked ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
          )}
          <div className="text-left">
            <h3 className="font-medium">{chapter.title}</h3>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{chapter.lessons.length} 課程完成
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t px-2 py-2 space-y-1">
          {chapter.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isActive={lesson.id === activeLessonId}
              onClick={() => onLessonClick?.(lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**驗收條件**:

- [ ] 展開/收合動畫
- [ ] 完成狀態計算
- [ ] 鎖定章節顯示

---

### Task 4.5: 更新 components/course/JourneyCard.tsx

**檔案**: `src/components/course/JourneyCard.tsx`

建立新的 JourneyCard 取代現有 CourseCard:

```typescript
import Link from 'next/link';
import { Journey, JourneyProgress } from '@/types';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface JourneyCardProps {
  journey: Journey;
  progress?: JourneyProgress;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function JourneyCard({ journey, progress }: JourneyCardProps) {
  return (
    <Link href={`/courses/${journey.id}`}>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative w-full h-40 bg-muted">
          {journey.thumbnailUrl ? (
            <img
              src={journey.thumbnailUrl}
              alt={journey.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2">{journey.title}</h3>
          {journey.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {journey.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{journey.chapterCount} 章節</span>
            <span>{journey.lessonCount} 課程</span>
            <span>{formatDuration(journey.totalDurationSeconds)}</span>
          </div>
          {progress && (
            <div className="pt-2">
              <ProgressBar
                value={progress.progressPercentage}
                showPercentage
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
```

**驗收條件**:

- [ ] Link 到課程詳情頁
- [ ] 顯示進度 (如有)
- [ ] 時長格式化

---

### Task 4.6: 建立 components/course/JourneyList.tsx

**檔案**: `src/components/course/JourneyList.tsx`

```typescript
import { Journey } from '@/types';
import { JourneyCard } from './JourneyCard';

interface JourneyListProps {
  journeys: Journey[];
}

export function JourneyList({ journeys }: JourneyListProps) {
  if (journeys.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">目前沒有課程</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {journeys.map((journey) => (
        <JourneyCard key={journey.id} journey={journey} />
      ))}
    </div>
  );
}
```

**驗收條件**:

- [ ] Empty state 處理
- [ ] Responsive grid

---

### Task 4.7: 建立 components/course/CourseProgress.tsx

**檔案**: `src/components/course/CourseProgress.tsx`

```typescript
import { JourneyProgress } from '@/types';
import { ProgressBar } from './ProgressBar';

interface CourseProgressProps {
  progress: JourneyProgress;
}

export function CourseProgress({ progress }: CourseProgressProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">學習進度</h3>
        <span className="text-sm text-muted-foreground">
          {progress.completedLessons}/{progress.totalLessons} 課程完成
        </span>
      </div>
      <ProgressBar value={progress.progressPercentage} showPercentage />
    </div>
  );
}
```

**驗收條件**:

- [ ] 顯示完成數/總數
- [ ] 進度條百分比

---

### Task 4.8: 建立 components/course/index.ts

**檔案**: `src/components/course/index.ts`

```typescript
export * from './ProgressBar';
export * from './LessonTypeIcon';
export * from './LessonItem';
export * from './ChapterAccordion';
export * from './JourneyCard';
export * from './JourneyList';
export * from './CourseProgress';
```

**驗收條件**:

- [ ] 所有 course components 可從 index 匯出

---

## Phase 5: Lesson Components

### Task 5.1: 建立 components/lesson/VideoPlayer.tsx

**檔案**: `src/components/lesson/VideoPlayer.tsx`

```typescript
'use client';

import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  contentUrl: string;
  initialPosition?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

export function VideoPlayer({
  contentUrl,
  initialPosition = 0,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const youtubeId = getYouTubeVideoId(contentUrl);

  if (youtubeId) {
    // YouTube embed
    const startParam = initialPosition > 0 ? `&start=${Math.floor(initialPosition)}` : '';
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0${startParam}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Native video player for direct URLs
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        className="w-full h-full"
        controls
        onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      >
        <source src={contentUrl} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
```

**注意**: YouTube iframe 無法追蹤進度，需要未來整合 YouTube IFrame API。MVP 先支援基本播放。

**驗收條件**:

- [ ] YouTube URL 自動轉 embed
- [ ] Native video 支援
- [ ] 基本 callback support

---

### Task 5.2: 建立 components/lesson/GoogleFormEmbed.tsx

**檔案**: `src/components/lesson/GoogleFormEmbed.tsx`

```typescript
interface GoogleFormEmbedProps {
  formUrl: string;
}

export function GoogleFormEmbed({ formUrl }: GoogleFormEmbedProps) {
  // Ensure it's an embed URL
  const embedUrl = formUrl.includes('viewform') 
    ? formUrl.replace('viewform', 'viewform?embedded=true')
    : formUrl;

  return (
    <div className="w-full min-h-[600px] rounded-lg overflow-hidden border">
      <iframe
        src={embedUrl}
        className="w-full h-[600px]"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
      >
        Loading...
      </iframe>
    </div>
  );
}
```

**驗收條件**:

- [ ] 自動轉換 embed URL
- [ ] 適當的 iframe 高度

---

### Task 5.3: 建立 components/lesson/ArticleContent.tsx

**檔案**: `src/components/lesson/ArticleContent.tsx`

```typescript
interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
```

**注意**: MVP 先支援 HTML 內容。未來可考慮 Markdown 支援。

**驗收條件**:

- [ ] 支援 HTML 內容渲染
- [ ] prose 樣式套用

---

### Task 5.4: 建立 components/lesson/LessonNavigation.tsx

**檔案**: `src/components/lesson/LessonNavigation.tsx`

```typescript
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonNavItem } from '@/types';
import { Button } from '@/components/ui/button';

interface LessonNavigationProps {
  previousLesson: LessonNavItem | null;
  nextLesson: LessonNavItem | null;
  courseId: string;
}

export function LessonNavigation({
  previousLesson,
  nextLesson,
  courseId,
}: LessonNavigationProps) {
  return (
    <div className="flex items-center justify-between py-4 border-t">
      {previousLesson ? (
        <Link href={`/courses/${courseId}/lessons/${previousLesson.id}`}>
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{previousLesson.title}</span>
            <span className="sm:hidden">上一課</span>
          </Button>
        </Link>
      ) : (
        <div />
      )}
      {nextLesson ? (
        <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
          <Button variant="ghost" className="gap-2">
            <span className="hidden sm:inline">{nextLesson.title}</span>
            <span className="sm:hidden">下一課</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
```

**驗收條件**:

- [ ] 上一課/下一課導航
- [ ] 響應式標題顯示

---

### Task 5.5: 建立 components/lesson/LessonSidebar.tsx

**檔案**: `src/components/lesson/LessonSidebar.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { JourneyDetail } from '@/types';
import { ChapterAccordion } from '@/components/course/ChapterAccordion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LessonSidebarProps {
  journey: JourneyDetail;
  activeLessonId: string;
  courseId: string;
}

export function LessonSidebar({ journey, activeLessonId, courseId }: LessonSidebarProps) {
  const router = useRouter();

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  };

  return (
    <div className="h-full flex flex-col border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold truncate">{journey.title}</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {journey.chapters.map((chapter, index) => (
            <ChapterAccordion
              key={chapter.id}
              chapter={chapter}
              isPurchased={journey.isPurchased}
              defaultOpen={chapter.lessons.some(l => l.id === activeLessonId)}
              activeLessonId={activeLessonId}
              onLessonClick={handleLessonClick}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

**驗收條件**:

- [ ] 顯示所有章節
- [ ] 當前課程所在章節自動展開
- [ ] 可滾動

---

### Task 5.6: 建立 components/lesson/AccessDeniedModal.tsx

**檔案**: `src/components/lesson/AccessDeniedModal.tsx`

```typescript
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessDeniedModalProps {
  journeyId: string;
  journeyTitle?: string;
}

export function AccessDeniedModal({ journeyId, journeyTitle }: AccessDeniedModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg p-8 max-w-md mx-4 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <Lock className="h-6 w-6 text-yellow-500" />
        </div>
        <h2 className="text-xl font-semibold">需要購買才能觀看</h2>
        <p className="text-muted-foreground">
          此課程內容需要購買後才能觀看完整內容
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Link href={`/courses/${journeyId}`}>
            <Button variant="outline">返回課程</Button>
          </Link>
          <Button className="bg-primary text-primary-foreground">
            立即購買
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**驗收條件**:

- [ ] Modal 遮罩
- [ ] 返回課程連結
- [ ] 購買按鈕 (MVP 先不實作功能)

---

### Task 5.7: 建立 components/lesson/index.ts

**檔案**: `src/components/lesson/index.ts`

```typescript
export * from './VideoPlayer';
export * from './GoogleFormEmbed';
export * from './ArticleContent';
export * from './LessonNavigation';
export * from './LessonSidebar';
export * from './AccessDeniedModal';
```

**驗收條件**:

- [ ] 所有 lesson components 可從 index 匯出

---

## Phase 6: Pages

### Task 6.1: 更新 (main)/courses/page.tsx

**檔案**: `src/app/(main)/courses/page.tsx`

```typescript
'use client';

import { useJourneyList } from '@/hooks/useJourneyList';
import { JourneyList } from '@/components/course';

export default function CoursesPage() {
  const { journeys, isLoading, error } = useJourneyList();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">無法載入課程列表</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">課程列表</h1>
      <JourneyList journeys={journeys} />
    </div>
  );
}
```

**驗收條件**:

- [ ] Loading skeleton
- [ ] Error state
- [ ] 實際資料顯示

---

### Task 6.2: 更新 courses/[courseId]/page.tsx

**檔案**: `src/app/courses/[courseId]/page.tsx`

```typescript
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useJourney } from '@/hooks/useJourney';
import { ChapterAccordion, CourseProgress } from '@/components/course';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseJourneyPage({ params }: PageProps) {
  const { courseId } = use(params);
  const router = useRouter();
  const { journey, isLoading, error } = useJourney(courseId);

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        <div className="space-y-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">
          {error?.message || '課程不存在'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{journey.title}</h1>
          {journey.description && (
            <p className="text-muted-foreground">{journey.description}</p>
          )}
        </div>

        {/* Progress (if purchased) */}
        {journey.isPurchased && (
          <CourseProgress
            progress={{
              journeyId: journey.id,
              totalLessons: journey.lessonCount,
              completedLessons: journey.chapters.reduce(
                (acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length,
                0
              ),
              progressPercentage: 0, // Calculate from chapters
              chapters: [],
            }}
          />
        )}

        {/* Chapters */}
        <div className="space-y-3">
          {journey.chapters.map((chapter, index) => (
            <ChapterAccordion
              key={chapter.id}
              chapter={chapter}
              isPurchased={journey.isPurchased}
              defaultOpen={index === 0}
              onLessonClick={handleLessonClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**驗收條件**:

- [ ] 顯示課程標題描述
- [ ] 章節手風琴列表
- [ ] 點擊課程導航到播放頁

---

### Task 6.3: 更新 courses/[courseId]/lessons/[lessonId]/page.tsx

**檔案**: `src/app/courses/[courseId]/lessons/[lessonId]/page.tsx`

```typescript
'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLesson } from '@/hooks/useLesson';
import { useJourney } from '@/hooks/useJourney';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useAuth } from '@/hooks/useAuth';
import {
  VideoPlayer,
  GoogleFormEmbed,
  ArticleContent,
  LessonNavigation,
  LessonSidebar,
  AccessDeniedModal,
} from '@/components/lesson';

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { lesson, isLoading, error, isAccessDenied, isUnauthorized } = useLesson(lessonId);
  const { journey } = useJourney(courseId);
  const { progress, updateProgress, markComplete } = useLessonProgress(
    lessonId,
    lesson?.progress
  );
  const { startTracking, updatePosition, stopTracking } = useVideoProgress(lessonId);

  // Redirect to login if unauthorized
  useEffect(() => {
    if (isUnauthorized && !user) {
      router.push('/login');
    }
  }, [isUnauthorized, user, router]);

  // Start video tracking when lesson loads
  useEffect(() => {
    if (lesson?.lessonType === 'VIDEO' && lesson.progress) {
      startTracking(lesson.progress.lastPositionSeconds);
    }
    return () => {
      stopTracking();
    };
  }, [lesson, startTracking, stopTracking]);

  if (isLoading) {
    return (
      <div className="h-screen flex">
        <div className="flex-1 p-8">
          <div className="aspect-video bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="w-80 bg-muted animate-pulse" />
      </div>
    );
  }

  if (isAccessDenied) {
    return <AccessDeniedModal journeyId={courseId} />;
  }

  if (error || !lesson) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-destructive">{error?.message || '課程不存在'}</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (lesson.lessonType) {
      case 'VIDEO':
        return (
          <VideoPlayer
            contentUrl={lesson.contentUrl || ''}
            initialPosition={progress?.lastPositionSeconds}
            onTimeUpdate={(time) => updatePosition(time)}
            onEnded={() => markComplete()}
          />
        );
      case 'GOOGLE_FORM':
        return <GoogleFormEmbed formUrl={lesson.contentUrl || ''} />;
      case 'ARTICLE':
        return <ArticleContent content={lesson.contentUrl || ''} />;
      default:
        return <p>Unsupported lesson type</p>;
    }
  };

  return (
    <div className="h-screen flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-muted-foreground">{lesson.description}</p>
            )}
            {renderContent()}
            <LessonNavigation
              previousLesson={lesson.previousLesson}
              nextLesson={lesson.nextLesson}
              courseId={courseId}
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {journey && (
        <div className="hidden lg:block w-80">
          <LessonSidebar
            journey={journey}
            activeLessonId={lessonId}
            courseId={courseId}
          />
        </div>
      )}
    </div>
  );
}
```

**驗收條件**:

- [ ] 根據 lessonType 渲染對應內容
- [ ] 影片進度追蹤
- [ ] 側邊欄顯示課程列表
- [ ] 上下課導航
- [ ] 權限檢查與 Modal

---

### Task 6.4: 更新 courses/[courseId]/layout.tsx

**檔案**: `src/app/courses/[courseId]/layout.tsx`

```typescript
export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
```

**驗收條件**:

- [ ] 簡單的 layout wrapper

---

## Phase 7: Integration & Polish

### Task 7.1: Loading States

確保所有頁面有適當的 loading skeleton:

- [ ] JourneyList skeleton
- [ ] JourneyDetail skeleton  
- [ ] LessonPage skeleton

---

### Task 7.2: Error States

確保所有錯誤有適當的顯示:

- [ ] Network error
- [ ] 404 Not found
- [ ] 403 Access denied

---

### Task 7.3: Responsive Design

- [ ] Mobile: 隱藏 lesson sidebar，可用抽屜顯示
- [ ] Tablet: 調整 grid columns
- [ ] Desktop: 完整顯示

---

### Task 7.4: 安裝必要依賴

```bash
npm install lucide-react
```

確認 shadcn/ui 元件:

- [ ] Button
- [ ] ScrollArea
- [ ] 其他需要的元件

---

## Summary Checklist

### Types (5 tasks)

- [ ] 1.1 journey.ts
- [ ] 1.2 chapter.ts
- [ ] 1.3 lesson.ts
- [ ] 1.4 progress.ts
- [ ] 1.5 types/index.ts

### Services (3 tasks)

- [ ] 2.1 journey.service.ts
- [ ] 2.2 lesson.service.ts
- [ ] 2.3 progress.service.ts

### Hooks (5 tasks)

- [ ] 3.1 useJourneyList.ts
- [ ] 3.2 useJourney.ts
- [ ] 3.3 useLesson.ts
- [ ] 3.4 useLessonProgress.ts
- [ ] 3.5 useVideoProgress.ts

### Course Components (8 tasks)

- [ ] 4.1 ProgressBar.tsx
- [ ] 4.2 LessonTypeIcon.tsx
- [ ] 4.3 LessonItem.tsx
- [ ] 4.4 ChapterAccordion.tsx
- [ ] 4.5 JourneyCard.tsx
- [ ] 4.6 JourneyList.tsx
- [ ] 4.7 CourseProgress.tsx
- [ ] 4.8 course/index.ts

### Lesson Components (7 tasks)

- [ ] 5.1 VideoPlayer.tsx
- [ ] 5.2 GoogleFormEmbed.tsx
- [ ] 5.3 ArticleContent.tsx
- [ ] 5.4 LessonNavigation.tsx
- [ ] 5.5 LessonSidebar.tsx
- [ ] 5.6 AccessDeniedModal.tsx
- [ ] 5.7 lesson/index.ts

### Pages (4 tasks)

- [ ] 6.1 (main)/courses/page.tsx
- [ ] 6.2 courses/[courseId]/page.tsx
- [ ] 6.3 courses/[courseId]/lessons/[lessonId]/page.tsx
- [ ] 6.4 courses/[courseId]/layout.tsx

### Integration (4 tasks)

- [ ] 7.1 Loading states
- [ ] 7.2 Error states
- [ ] 7.3 Responsive design
- [ ] 7.4 Dependencies

**Total: 36 tasks**

---

## Phase 8: E2E Tests

### Task 8.1: 課程列表頁面載入與顯示測試

**檔案**: `e2e/course-list.spec.ts`

**測試場景**:
- 課程列表頁面正確載入
- 顯示課程卡片（標題、描述、章節數、課程數、時長）
- 空狀態處理（無課程時顯示提示）
- Loading skeleton 顯示

```typescript
import { test, expect } from '@playwright/test'

test.describe('Course List Page', () => {
  test('displays course list with journey cards', async ({ page }) => {
    await page.goto('/courses')

    await expect(page.locator('h1')).toContainText('課程列表')

    const journeyCards = page.locator('[data-testid="journey-card"]')
    await expect(journeyCards.first()).toBeVisible()

    const firstCard = journeyCards.first()
    await expect(firstCard.locator('[data-testid="journey-title"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="journey-chapter-count"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="journey-lesson-count"]')).toBeVisible()
  })

  test('shows loading skeleton while fetching', async ({ page }) => {
    await page.route('**/api/journeys', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.continue()
    })

    await page.goto('/courses')

    await expect(page.locator('[data-testid="skeleton"]').first()).toBeVisible()
  })

  test('displays empty state when no courses', async ({ page }) => {
    await page.route('**/api/journeys', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/courses')

    await expect(page.locator('text=目前沒有課程')).toBeVisible()
  })

  test('navigates to course detail on card click', async ({ page }) => {
    await page.goto('/courses')

    const firstCard = page.locator('[data-testid="journey-card"]').first()
    await firstCard.click()

    await expect(page).toHaveURL(/\/courses\/[\w-]+/)
  })
})
```

**驗收條件**:
- [ ] 課程列表正確載入並顯示課程卡片
- [ ] Loading skeleton 在載入時顯示
- [ ] 空狀態正確顯示
- [ ] 點擊課程卡片導航到詳情頁

---

### Task 8.2: 課程詳情頁面載入與章節展開測試

**檔案**: `e2e/course-detail.spec.ts`

**測試場景**:
- 課程詳情頁面正確載入
- 章節手風琴展開/收合
- 課程項目顯示（標題、類型圖示、時長）
- 已完成課程顯示勾選

```typescript
import { test, expect } from '@playwright/test'

test.describe('Course Detail Page', () => {
  test('displays journey detail with chapters', async ({ page }) => {
    await page.goto('/courses/test-journey-id')

    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="chapter-accordion"]').first()).toBeVisible()
  })

  test('expands and collapses chapter accordion', async ({ page }) => {
    await page.goto('/courses/test-journey-id')

    const firstChapter = page.locator('[data-testid="chapter-accordion"]').first()
    const chapterButton = firstChapter.locator('[data-testid="chapter-toggle"]')
    const lessonList = firstChapter.locator('[data-testid="lesson-list"]')

    await chapterButton.click()
    await expect(lessonList).toBeVisible()

    await chapterButton.click()
    await expect(lessonList).not.toBeVisible()
  })

  test('displays lesson items with type icons', async ({ page }) => {
    await page.goto('/courses/test-journey-id')

    const firstChapter = page.locator('[data-testid="chapter-accordion"]').first()
    await firstChapter.locator('[data-testid="chapter-toggle"]').click()

    const lessonItem = firstChapter.locator('[data-testid="lesson-item"]').first()
    await expect(lessonItem.locator('[data-testid="lesson-type-icon"]')).toBeVisible()
    await expect(lessonItem.locator('[data-testid="lesson-title"]')).toBeVisible()
  })

  test('shows completed status for finished lessons', async ({ page }) => {
    await page.goto('/courses/test-journey-id')

    const completedLesson = page.locator('[data-testid="lesson-item"][data-completed="true"]')
    if (await completedLesson.count() > 0) {
      await expect(completedLesson.first().locator('[data-testid="completed-icon"]')).toBeVisible()
    }
  })

  test('displays progress bar for purchased courses', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
    ])

    await page.goto('/courses/test-journey-id')

    const progressBar = page.locator('[data-testid="course-progress"]')
    await expect(progressBar).toBeVisible()
  })
})
```

**驗收條件**:
- [ ] 課程詳情頁正確載入
- [ ] 章節可展開/收合
- [ ] 課程項目顯示類型圖示和時長
- [ ] 已完成課程顯示勾選
- [ ] 已購買課程顯示進度條

---

### Task 8.3: 未登入用戶點擊 PURCHASED 課程被導向登入測試

**檔案**: `e2e/auth-redirect.spec.ts`

**測試場景**:
- 未登入用戶點擊 PURCHASED 課程
- 自動導向登入頁面
- 登入後導回原本要訪問的課程

```typescript
import { test, expect } from '@playwright/test'

test.describe('Auth Redirect for PURCHASED Lessons', () => {
  test('redirects unauthenticated user to login when accessing purchased lesson', async ({ page }) => {
    await page.route('**/api/lessons/*', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/purchased-lesson-id')

    await expect(page).toHaveURL('/login')
  })

  test('shows lock icon for purchased chapters when not logged in', async ({ page }) => {
    await page.goto('/courses/test-journey-id')

    const lockedChapter = page.locator('[data-testid="chapter-accordion"][data-locked="true"]')
    if (await lockedChapter.count() > 0) {
      await expect(lockedChapter.first().locator('[data-testid="lock-icon"]')).toBeVisible()
    }
  })

  test('shows access denied modal for purchased content', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
    ])

    await page.route('**/api/lessons/*', (route) => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Access denied' }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/purchased-lesson-id')

    await expect(page.locator('[data-testid="access-denied-modal"]')).toBeVisible()
    await expect(page.locator('text=需要購買才能觀看')).toBeVisible()
  })

  test('can navigate back to course from access denied modal', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
    ])

    await page.route('**/api/lessons/*', (route) => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Access denied' }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/purchased-lesson-id')

    await page.click('text=返回課程')

    await expect(page).toHaveURL('/courses/test-journey-id')
  })
})
```

**驗收條件**:
- [ ] 未登入用戶訪問 PURCHASED 課程導向登入頁
- [ ] PURCHASED 章節顯示鎖定圖示
- [ ] 已登入但未購買用戶顯示 Access Denied Modal
- [ ] Modal 中的「返回課程」按鈕正常運作

---

### Task 8.4: 登入用戶存取 PUBLIC/TRIAL 課程測試

**檔案**: `e2e/public-trial-access.spec.ts`

**測試場景**:
- PUBLIC 課程任何人可存取
- TRIAL 課程顯示「試讀」標籤
- TRIAL 課程內容可正常播放

```typescript
import { test, expect } from '@playwright/test'

test.describe('PUBLIC and TRIAL Course Access', () => {
  test('allows access to PUBLIC lessons without login', async ({ page }) => {
    await page.route('**/api/lessons/public-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'public-lesson-id',
          title: 'Public Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=test',
          accessType: 'PUBLIC',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/public-lesson-id')

    await expect(page.locator('h1')).toContainText('Public Lesson')
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible()
  })

  test('shows trial badge for TRIAL lessons', async ({ page }) => {
    await page.goto('/courses/test-journey-id')

    const trialLesson = page.locator('[data-testid="lesson-item"][data-access-type="TRIAL"]')
    if (await trialLesson.count() > 0) {
      await expect(trialLesson.first().locator('[data-testid="trial-badge"]')).toBeVisible()
      await expect(trialLesson.first().locator('text=試讀')).toBeVisible()
    }
  })

  test('allows access to TRIAL lessons', async ({ page }) => {
    await page.route('**/api/lessons/trial-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'trial-lesson-id',
          title: 'Trial Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=test',
          accessType: 'TRIAL',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/trial-lesson-id')

    await expect(page.locator('h1')).toContainText('Trial Lesson')
  })

  test('displays lesson content correctly based on type', async ({ page }) => {
    await page.route('**/api/lessons/article-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'article-lesson-id',
          title: 'Article Lesson',
          lessonType: 'ARTICLE',
          contentUrl: '<h2>Article Content</h2><p>This is article content.</p>',
          accessType: 'PUBLIC',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/article-lesson-id')

    await expect(page.locator('[data-testid="article-content"]')).toBeVisible()
    await expect(page.locator('text=Article Content')).toBeVisible()
  })
})
```

**驗收條件**:
- [ ] PUBLIC 課程無需登入即可存取
- [ ] TRIAL 課程顯示「試讀」標籤
- [ ] TRIAL 課程內容可正常載入
- [ ] 不同類型課程（VIDEO/ARTICLE/GOOGLE_FORM）正確顯示

---

### Task 8.5: 已購買用戶觀看影片課程測試

**檔案**: `e2e/video-playback.spec.ts`

**測試場景**:
- 影片播放器正確載入
- YouTube 影片嵌入正常
- Native 影片播放正常
- 從上次觀看位置繼續

```typescript
import { test, expect } from '@playwright/test'

test.describe('Video Playback for Purchased Users', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
    ])
  })

  test('displays video player for VIDEO lesson', async ({ page }) => {
    await page.route('**/api/lessons/video-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'video-lesson-id',
          title: 'Video Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/video-lesson-id')

    await expect(page.locator('[data-testid="video-player"]')).toBeVisible()
  })

  test('embeds YouTube video correctly', async ({ page }) => {
    await page.route('**/api/lessons/youtube-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'youtube-lesson-id',
          title: 'YouTube Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/youtube-lesson-id')

    const iframe = page.locator('iframe[src*="youtube.com/embed"]')
    await expect(iframe).toBeVisible()
  })

  test('resumes video from last position', async ({ page }) => {
    await page.route('**/api/lessons/resume-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'resume-lesson-id',
          title: 'Resume Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          progress: { isCompleted: false, lastPositionSeconds: 120, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/resume-lesson-id')

    const iframe = page.locator('iframe[src*="youtube.com/embed"]')
    const src = await iframe.getAttribute('src')
    expect(src).toContain('start=120')
  })

  test('displays Google Form for GOOGLE_FORM lesson', async ({ page }) => {
    await page.route('**/api/lessons/form-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'form-lesson-id',
          title: 'Form Lesson',
          lessonType: 'GOOGLE_FORM',
          contentUrl: 'https://docs.google.com/forms/d/e/test/viewform',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/form-lesson-id')

    const iframe = page.locator('iframe[src*="docs.google.com/forms"]')
    await expect(iframe).toBeVisible()
  })
})
```

**驗收條件**:
- [ ] VIDEO 類型課程顯示影片播放器
- [ ] YouTube 影片正確嵌入
- [ ] 從上次觀看位置繼續（start 參數）
- [ ] GOOGLE_FORM 類型課程顯示表單

---

### Task 8.6: 影片進度自動儲存測試

**檔案**: `e2e/progress-tracking.spec.ts`

**測試場景**:
- 播放影片時定期儲存進度
- 頁面離開時儲存進度
- 進度 API 正確呼叫

```typescript
import { test, expect } from '@playwright/test'

test.describe('Video Progress Auto-Save', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
    ])
  })

  test('sends progress update request periodically', async ({ page }) => {
    const progressRequests: Array<{ url: string; body: string }> = []

    await page.route('**/api/lessons/*/progress', async (route) => {
      const request = route.request()
      progressRequests.push({
        url: request.url(),
        body: request.postData() || '',
      })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          lessonId: 'video-lesson-id',
          isCompleted: false,
          lastPositionSeconds: 30,
          updatedAt: new Date().toISOString(),
        }),
      })
    })

    await page.route('**/api/lessons/video-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'video-lesson-id',
          title: 'Video Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://example.com/video.mp4',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/video-lesson-id')

    await page.waitForTimeout(35000)

    expect(progressRequests.length).toBeGreaterThan(0)
  })

  test('sends progress on page unload', async ({ page }) => {
    let beaconSent = false

    await page.route('**/api/lessons/*/progress', async (route) => {
      beaconSent = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          lessonId: 'video-lesson-id',
          isCompleted: false,
          lastPositionSeconds: 60,
          updatedAt: new Date().toISOString(),
        }),
      })
    })

    await page.route('**/api/lessons/video-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'video-lesson-id',
          title: 'Video Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://example.com/video.mp4',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/video-lesson-id')
    await page.goto('/courses')

    expect(beaconSent).toBe(true)
  })

  test('updates local progress state after save', async ({ page }) => {
    await page.route('**/api/lessons/*/progress', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          lessonId: 'video-lesson-id',
          isCompleted: false,
          lastPositionSeconds: 45,
          updatedAt: new Date().toISOString(),
        }),
      })
    })

    await page.route('**/api/lessons/video-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'video-lesson-id',
          title: 'Video Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://example.com/video.mp4',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/video-lesson-id')

    await expect(page.locator('[data-testid="video-player"]')).toBeVisible()
  })
})
```

**驗收條件**:
- [ ] 每 30 秒自動發送進度更新請求
- [ ] 頁面離開時發送進度（sendBeacon）
- [ ] 進度 API 回應正確處理

---

### Task 8.7: 課程完成後顯示完成狀態測試

**檔案**: `e2e/lesson-completion.spec.ts`

**測試場景**:
- 影片播放完畢標記完成
- 完成狀態在側邊欄顯示
- 完成後章節進度更新

```typescript
import { test, expect } from '@playwright/test'

test.describe('Lesson Completion Status', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
    ])
  })

  test('marks lesson as complete when video ends', async ({ page }) => {
    let completeRequestSent = false

    await page.route('**/api/lessons/video-lesson-id/complete', (route) => {
      completeRequestSent = true
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          lessonId: 'video-lesson-id',
          isCompleted: true,
          completedAt: new Date().toISOString(),
        }),
      })
    })

    await page.route('**/api/lessons/video-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'video-lesson-id',
          title: 'Video Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://example.com/video.mp4',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/video-lesson-id')

    const video = page.locator('video')
    if (await video.count() > 0) {
      await page.evaluate(() => {
        const videoEl = document.querySelector('video')
        if (videoEl) {
          videoEl.dispatchEvent(new Event('ended'))
        }
      })
    }

    expect(completeRequestSent).toBe(true)
  })

  test('displays completed icon in sidebar for finished lessons', async ({ page }) => {
    await page.route('**/api/journeys/test-journey-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-journey-id',
          title: 'Test Journey',
          description: 'Test description',
          chapters: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              accessType: 'PUBLIC',
              lessons: [
                {
                  id: 'lesson-1',
                  title: 'Lesson 1',
                  lessonType: 'VIDEO',
                  isCompleted: true,
                  isAccessible: true,
                  accessType: 'PUBLIC',
                },
                {
                  id: 'lesson-2',
                  title: 'Lesson 2',
                  lessonType: 'VIDEO',
                  isCompleted: false,
                  isAccessible: true,
                  accessType: 'PUBLIC',
                },
              ],
            },
          ],
          isPurchased: true,
        }),
      })
    })

    await page.goto('/courses/test-journey-id')

    const completedLesson = page.locator('[data-testid="lesson-item"]').first()
    await expect(completedLesson.locator('[data-testid="completed-icon"]')).toBeVisible()
  })

  test('updates chapter progress when lesson completed', async ({ page }) => {
    await page.route('**/api/journeys/test-journey-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-journey-id',
          title: 'Test Journey',
          description: 'Test description',
          chapters: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              accessType: 'PUBLIC',
              lessons: [
                {
                  id: 'lesson-1',
                  title: 'Lesson 1',
                  lessonType: 'VIDEO',
                  isCompleted: true,
                  isAccessible: true,
                  accessType: 'PUBLIC',
                },
                {
                  id: 'lesson-2',
                  title: 'Lesson 2',
                  lessonType: 'VIDEO',
                  isCompleted: true,
                  isAccessible: true,
                  accessType: 'PUBLIC',
                },
              ],
            },
          ],
          isPurchased: true,
        }),
      })
    })

    await page.goto('/courses/test-journey-id')

    await expect(page.locator('text=2/2 課程完成')).toBeVisible()
  })

  test('shows completed chapter icon when all lessons done', async ({ page }) => {
    await page.route('**/api/journeys/test-journey-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-journey-id',
          title: 'Test Journey',
          description: 'Test description',
          chapters: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              accessType: 'PUBLIC',
              lessons: [
                {
                  id: 'lesson-1',
                  title: 'Lesson 1',
                  lessonType: 'VIDEO',
                  isCompleted: true,
                  isAccessible: true,
                  accessType: 'PUBLIC',
                },
              ],
            },
          ],
          isPurchased: true,
        }),
      })
    })

    await page.goto('/courses/test-journey-id')

    const chapter = page.locator('[data-testid="chapter-accordion"]').first()
    await expect(chapter.locator('[data-testid="chapter-completed-icon"]')).toBeVisible()
  })
})
```

**驗收條件**:
- [ ] 影片結束時自動呼叫完成 API
- [ ] 已完成課程顯示勾選圖示
- [ ] 章節進度正確更新
- [ ] 章節全部完成顯示完成圖示

---

### Task 8.8: 上下課導航功能測試

**檔案**: `e2e/lesson-navigation.spec.ts`

**測試場景**:
- 上一課按鈕正確導航
- 下一課按鈕正確導航
- 第一課隱藏上一課按鈕
- 最後一課隱藏下一課按鈕

```typescript
import { test, expect } from '@playwright/test'

test.describe('Lesson Navigation', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
    ])
  })

  test('navigates to previous lesson', async ({ page }) => {
    await page.route('**/api/lessons/middle-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'middle-lesson-id',
          title: 'Middle Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=test',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: { id: 'first-lesson-id', title: 'First Lesson' },
          nextLesson: { id: 'last-lesson-id', title: 'Last Lesson' },
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/middle-lesson-id')

    const prevButton = page.locator('[data-testid="prev-lesson-btn"]')
    await expect(prevButton).toBeVisible()
    await prevButton.click()

    await expect(page).toHaveURL('/courses/test-journey-id/lessons/first-lesson-id')
  })

  test('navigates to next lesson', async ({ page }) => {
    await page.route('**/api/lessons/middle-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'middle-lesson-id',
          title: 'Middle Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=test',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: { id: 'first-lesson-id', title: 'First Lesson' },
          nextLesson: { id: 'last-lesson-id', title: 'Last Lesson' },
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/middle-lesson-id')

    const nextButton = page.locator('[data-testid="next-lesson-btn"]')
    await expect(nextButton).toBeVisible()
    await nextButton.click()

    await expect(page).toHaveURL('/courses/test-journey-id/lessons/last-lesson-id')
  })

  test('hides previous button on first lesson', async ({ page }) => {
    await page.route('**/api/lessons/first-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'first-lesson-id',
          title: 'First Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=test',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: null,
          nextLesson: { id: 'second-lesson-id', title: 'Second Lesson' },
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/first-lesson-id')

    await expect(page.locator('[data-testid="prev-lesson-btn"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="next-lesson-btn"]')).toBeVisible()
  })

  test('hides next button on last lesson', async ({ page }) => {
    await page.route('**/api/lessons/last-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'last-lesson-id',
          title: 'Last Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=test',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: { id: 'second-lesson-id', title: 'Second Lesson' },
          nextLesson: null,
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/last-lesson-id')

    await expect(page.locator('[data-testid="prev-lesson-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="next-lesson-btn"]')).not.toBeVisible()
  })

  test('displays lesson titles in navigation buttons on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })

    await page.route('**/api/lessons/middle-lesson-id', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'middle-lesson-id',
          title: 'Middle Lesson',
          lessonType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/watch?v=test',
          progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
          previousLesson: { id: 'first-lesson-id', title: 'First Lesson' },
          nextLesson: { id: 'last-lesson-id', title: 'Last Lesson' },
          journeyId: 'test-journey-id',
          journeyTitle: 'Test Journey',
        }),
      })
    })

    await page.goto('/courses/test-journey-id/lessons/middle-lesson-id')

    await expect(page.locator('[data-testid="prev-lesson-btn"]')).toContainText('First Lesson')
    await expect(page.locator('[data-testid="next-lesson-btn"]')).toContainText('Last Lesson')
  })
})
```

**驗收條件**:
- [ ] 點擊「上一課」正確導航
- [ ] 點擊「下一課」正確導航
- [ ] 第一課不顯示「上一課」按鈕
- [ ] 最後一課不顯示「下一課」按鈕
- [ ] 桌面版顯示課程標題

---

### Task 8.9: 響應式設計測試（mobile sidebar）

**檔案**: `e2e/responsive.spec.ts`

**測試場景**:
- 桌面版顯示側邊欄
- 手機版隱藏側邊欄
- 手機版可透過按鈕開啟側邊欄
- 平板版布局正確

```typescript
import { test, expect, devices } from '@playwright/test'

test.describe('Responsive Design', () => {
  test.describe('Desktop', () => {
    test.use({ viewport: { width: 1280, height: 720 } })

    test('shows lesson sidebar on desktop', async ({ page, context }) => {
      await context.addCookies([
        { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
      ])

      await page.route('**/api/lessons/video-lesson-id', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'video-lesson-id',
            title: 'Video Lesson',
            lessonType: 'VIDEO',
            contentUrl: 'https://www.youtube.com/watch?v=test',
            progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
            previousLesson: null,
            nextLesson: null,
            journeyId: 'test-journey-id',
            journeyTitle: 'Test Journey',
          }),
        })
      })

      await page.route('**/api/journeys/test-journey-id', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-journey-id',
            title: 'Test Journey',
            chapters: [],
            isPurchased: true,
          }),
        })
      })

      await page.goto('/courses/test-journey-id/lessons/video-lesson-id')

      await expect(page.locator('[data-testid="lesson-sidebar"]')).toBeVisible()
    })

    test('displays journey cards in 3-column grid', async ({ page }) => {
      await page.goto('/courses')

      const grid = page.locator('[data-testid="journey-list"]')
      await expect(grid).toHaveClass(/lg:grid-cols-3/)
    })
  })

  test.describe('Tablet', () => {
    test.use({ viewport: { width: 768, height: 1024 } })

    test('displays journey cards in 2-column grid', async ({ page }) => {
      await page.goto('/courses')

      const grid = page.locator('[data-testid="journey-list"]')
      await expect(grid).toHaveClass(/md:grid-cols-2/)
    })
  })

  test.describe('Mobile', () => {
    test.use({ ...devices['iPhone 12'] })

    test('hides lesson sidebar on mobile', async ({ page, context }) => {
      await context.addCookies([
        { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
      ])

      await page.route('**/api/lessons/video-lesson-id', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'video-lesson-id',
            title: 'Video Lesson',
            lessonType: 'VIDEO',
            contentUrl: 'https://www.youtube.com/watch?v=test',
            progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
            previousLesson: null,
            nextLesson: null,
            journeyId: 'test-journey-id',
            journeyTitle: 'Test Journey',
          }),
        })
      })

      await page.route('**/api/journeys/test-journey-id', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-journey-id',
            title: 'Test Journey',
            chapters: [],
            isPurchased: true,
          }),
        })
      })

      await page.goto('/courses/test-journey-id/lessons/video-lesson-id')

      await expect(page.locator('[data-testid="lesson-sidebar"]')).not.toBeVisible()
    })

    test('can open sidebar drawer on mobile', async ({ page, context }) => {
      await context.addCookies([
        { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
      ])

      await page.route('**/api/lessons/video-lesson-id', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'video-lesson-id',
            title: 'Video Lesson',
            lessonType: 'VIDEO',
            contentUrl: 'https://www.youtube.com/watch?v=test',
            progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
            previousLesson: null,
            nextLesson: null,
            journeyId: 'test-journey-id',
            journeyTitle: 'Test Journey',
          }),
        })
      })

      await page.route('**/api/journeys/test-journey-id', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-journey-id',
            title: 'Test Journey',
            chapters: [
              {
                id: 'chapter-1',
                title: 'Chapter 1',
                accessType: 'PUBLIC',
                lessons: [
                  {
                    id: 'video-lesson-id',
                    title: 'Video Lesson',
                    lessonType: 'VIDEO',
                    isCompleted: false,
                    isAccessible: true,
                    accessType: 'PUBLIC',
                  },
                ],
              },
            ],
            isPurchased: true,
          }),
        })
      })

      await page.goto('/courses/test-journey-id/lessons/video-lesson-id')

      const menuButton = page.locator('[data-testid="mobile-menu-btn"]')
      if (await menuButton.isVisible()) {
        await menuButton.click()
        await expect(page.locator('[data-testid="mobile-sidebar-drawer"]')).toBeVisible()
      }
    })

    test('displays journey cards in single column', async ({ page }) => {
      await page.goto('/courses')

      const cards = page.locator('[data-testid="journey-card"]')
      if (await cards.count() > 0) {
        const firstCardBox = await cards.first().boundingBox()
        const secondCard = cards.nth(1)
        if (await secondCard.count() > 0) {
          const secondCardBox = await secondCard.boundingBox()
          if (firstCardBox && secondCardBox) {
            expect(firstCardBox.x).toBe(secondCardBox.x)
          }
        }
      }
    })

    test('navigation buttons show abbreviated text', async ({ page, context }) => {
      await context.addCookies([
        { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' },
      ])

      await page.route('**/api/lessons/middle-lesson-id', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'middle-lesson-id',
            title: 'Middle Lesson',
            lessonType: 'VIDEO',
            contentUrl: 'https://www.youtube.com/watch?v=test',
            progress: { isCompleted: false, lastPositionSeconds: 0, completedAt: null },
            previousLesson: { id: 'first-lesson-id', title: 'First Lesson' },
            nextLesson: { id: 'last-lesson-id', title: 'Last Lesson' },
            journeyId: 'test-journey-id',
            journeyTitle: 'Test Journey',
          }),
        })
      })

      await page.goto('/courses/test-journey-id/lessons/middle-lesson-id')

      await expect(page.locator('[data-testid="prev-lesson-btn"]')).toContainText('上一課')
      await expect(page.locator('[data-testid="next-lesson-btn"]')).toContainText('下一課')
    })
  })
})
```

**驗收條件**:
- [ ] 桌面版（≥1024px）顯示側邊欄
- [ ] 平板版（768-1023px）顯示 2 欄課程卡片
- [ ] 手機版（<768px）隱藏側邊欄
- [ ] 手機版可透過按鈕開啟側邊欄抽屜
- [ ] 手機版課程卡片為單欄
- [ ] 手機版導航按鈕顯示縮寫文字

---

## E2E Tests Summary Checklist

### E2E Tests (9 tasks)

- [ ] 8.1 課程列表頁面載入與顯示測試
- [ ] 8.2 課程詳情頁面載入與章節展開測試
- [ ] 8.3 未登入用戶點擊 PURCHASED 課程被導向登入測試
- [ ] 8.4 登入用戶存取 PUBLIC/TRIAL 課程測試
- [ ] 8.5 已購買用戶觀看影片課程測試
- [ ] 8.6 影片進度自動儲存測試
- [ ] 8.7 課程完成後顯示完成狀態測試
- [ ] 8.8 上下課導航功能測試
- [ ] 8.9 響應式設計測試（mobile sidebar）

**Total Tasks: 45 tasks (36 original + 9 E2E tests)**
