# Frontend Specification: Course Lesson System

## Overview

實作課程瀏覽與學習介面，支援 Journey -> Chapter -> Lesson 三層架構，包含權限控制、多種課程類型、學習進度追蹤。

## Technical Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Components                              │
│  JourneyCard, ChapterAccordion, LessonItem, VideoPlayer      │
│  ProgressBar, LessonTypeIcon                                 │
├─────────────────────────────────────────────────────────────┤
│                        Hooks                                 │
│  useJourney, useLesson, useLessonProgress, useVideoProgress  │
├─────────────────────────────────────────────────────────────┤
│                       Services                               │
│  journey.service.ts, lesson.service.ts, progress.service.ts  │
├─────────────────────────────────────────────────────────────┤
│                        Types                                 │
│  journey.ts, chapter.ts, lesson.ts, progress.ts              │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/
│   ├── (main)/
│   │   └── courses/
│   │       └── page.tsx                    # 課程列表頁
│   └── courses/
│       └── [courseId]/
│           ├── layout.tsx                  # 課程詳情 layout
│           ├── page.tsx                    # 課程總覽頁
│           └── lessons/
│               └── [lessonId]/
│                   └── page.tsx            # 課程播放頁
├── components/
│   ├── course/
│   │   ├── JourneyCard.tsx                 # 課程卡片
│   │   ├── JourneyList.tsx                 # 課程列表
│   │   ├── ChapterAccordion.tsx            # 章節手風琴
│   │   ├── LessonItem.tsx                  # 課程項目
│   │   ├── LessonTypeIcon.tsx              # 課程類型圖示
│   │   ├── ProgressBar.tsx                 # 進度條
│   │   ├── CourseProgress.tsx              # 課程進度卡片
│   │   └── InstructorInfo.tsx              # 講師資訊
│   ├── lesson/
│   │   ├── VideoPlayer.tsx                 # 影片播放器
│   │   ├── GoogleFormEmbed.tsx             # Google Form 嵌入
│   │   ├── ArticleContent.tsx              # 文章內容
│   │   ├── LessonNavigation.tsx            # 上下課程導航
│   │   └── LessonSidebar.tsx               # 課程側邊欄
│   └── layout/
│       └── course-sider.tsx                # 更新：課程側邊欄
├── hooks/
│   ├── useJourney.ts                       # 課程資料 hook
│   ├── useJourneyList.ts                   # 課程列表 hook
│   ├── useLesson.ts                        # 課程詳情 hook
│   ├── useLessonProgress.ts                # 學習進度 hook
│   └── useVideoProgress.ts                 # 影片進度 hook
├── services/
│   ├── journey.service.ts                  # 課程 API
│   ├── lesson.service.ts                   # 課程 API
│   └── progress.service.ts                 # 進度 API
└── types/
    ├── journey.ts                          # 課程型別
    ├── chapter.ts                          # 章節型別
    ├── lesson.ts                           # 課程型別
    └── progress.ts                         # 進度型別
```

## Types

### types/journey.ts

```typescript
export interface Journey {
  id: string;
  title: string;
  description: string;
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

### types/chapter.ts

```typescript
export type AccessType = 'PUBLIC' | 'TRIAL' | 'PURCHASED';

export interface Chapter {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  accessType: AccessType;
  lessonCount: number;
}

export interface ChapterWithLessons extends Chapter {
  lessons: LessonSummary[];
}
```

### types/lesson.ts

```typescript
export type LessonType = 'VIDEO' | 'GOOGLE_FORM' | 'ARTICLE' | 'QUIZ';

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

export interface LessonDetail {
  id: string;
  title: string;
  description: string;
  lessonType: LessonType;
  contentUrl: string;
  durationSeconds: number | null;
  instructor: InstructorInfo;
  progress: LessonProgress;
  previousLesson: LessonNavItem | null;
  nextLesson: LessonNavItem | null;
}

export interface LessonNavItem {
  id: string;
  title: string;
}

export interface InstructorInfo {
  id: string;
  name: string;
  pictureUrl: string | null;
}
```

### types/progress.ts

```typescript
export interface LessonProgress {
  isCompleted: boolean;
  lastPositionSeconds: number;
  completedAt: string | null;
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

export interface VideoWatchLog {
  startPositionSeconds: number;
  endPositionSeconds: number;
  watchDurationSeconds: number;
}
```

## Components

### JourneyCard

課程卡片，顯示課程資訊

```typescript
interface JourneyCardProps {
  journey: Journey;
  progress?: JourneyProgress;
}
```

**顯示內容:**

- 課程縮圖
- 標題
- 描述 (截斷)
- 章節數、課程數
- 總時長
- 學習進度 (如果有)

### ChapterAccordion

章節手風琴，展開顯示課程列表

```typescript
interface ChapterAccordionProps {
  chapter: ChapterWithLessons;
  isPurchased: boolean;
  defaultOpen?: boolean;
}
```

**行為:**

- 點擊展開/收合
- 顯示課程列表
- 鎖定圖示表示需購買
- 章節完成打勾

### LessonItem

課程項目，顯示課程資訊

```typescript
interface LessonItemProps {
  lesson: LessonSummary;
  isActive?: boolean;
  onClick?: () => void;
}
```

**顯示內容:**

- 課程類型圖示
- 標題
- 時長
- 完成狀態
- 鎖定/試讀標籤

### VideoPlayer

影片播放器，支援進度追蹤

```typescript
interface VideoPlayerProps {
  contentUrl: string;
  initialPosition?: number;
  onProgress?: (position: number) => void;
  onComplete?: () => void;
}
```

**行為:**

- 播放影片
- 定期回報觀看進度 (每 30 秒)
- 影片結束觸發完成
- 支援從上次位置繼續

### ProgressBar

進度條元件

```typescript
interface ProgressBarProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

### LessonNavigation

上下課程導航

```typescript
interface LessonNavigationProps {
  previousLesson: LessonNavItem | null;
  nextLesson: LessonNavItem | null;
  courseId: string;
}
```

## Hooks

### useJourneyList

取得課程列表

```typescript
function useJourneyList(): {
  journeys: Journey[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};
```

### useJourney

取得課程詳情

```typescript
function useJourney(journeyId: string): {
  journey: JourneyDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};
```

### useLesson

取得課程詳情

```typescript
function useLesson(lessonId: string): {
  lesson: LessonDetail | null;
  isLoading: boolean;
  error: Error | null;
  isAccessDenied: boolean;
};
```

### useLessonProgress

管理學習進度

```typescript
function useLessonProgress(lessonId: string): {
  progress: LessonProgress | null;
  updateProgress: (position: number) => Promise<void>;
  markComplete: () => Promise<void>;
  isUpdating: boolean;
};
```

### useVideoProgress

影片進度追蹤 (定期上報)

```typescript
function useVideoProgress(lessonId: string): {
  startTracking: (startPosition: number) => void;
  updatePosition: (currentPosition: number) => void;
  stopTracking: () => void;
};
```

## Services

### journey.service.ts

```typescript
export const journeyService = {
  async getJourneys(): Promise<Journey[]>;
  async getJourney(journeyId: string): Promise<JourneyDetail>;
  async getJourneyProgress(journeyId: string): Promise<JourneyProgress>;
};
```

### lesson.service.ts

```typescript
export const lessonService = {
  async getLesson(lessonId: string): Promise<LessonDetail>;
};
```

### progress.service.ts

```typescript
export const progressService = {
  async updateProgress(lessonId: string, data: UpdateProgressRequest): Promise<void>;
  async markComplete(lessonId: string): Promise<void>;
  async logVideoWatch(lessonId: string, data: VideoWatchLog): Promise<void>;
};
```

## Page Implementation

### /courses (課程列表頁)

```typescript
// 顯示所有已發布課程
// 使用 JourneyCard 元件
// 支援分類篩選 (未來)
```

### /courses/[courseId] (課程詳情頁)

```typescript
// 顯示課程資訊
// 使用 ChapterAccordion 顯示章節
// 顯示購買狀態
// 顯示學習進度
```

### /courses/[courseId]/lessons/[lessonId] (課程播放頁)

```typescript
// 左側：課程內容 (VideoPlayer / GoogleFormEmbed / ArticleContent)
// 右側：課程列表側邊欄
// 上下課程導航
// 權限檢查，無權限顯示購買提示
```

## Access Control UI

### 未購買課程

```typescript
// 顯示課程列表，但 PURCHASED 課程顯示鎖定圖示
// 點擊 PURCHASED 課程顯示購買提示 Modal
// TRIAL 課程可進入但顯示試讀標籤
// PUBLIC 課程完全開放
```

### 試讀模式

```typescript
// 顯示「試讀」標籤
// 影片可能只能觀看部分
// 顯示「購買解鎖完整內容」提示
```

## Video Progress Tracking

### 追蹤邏輯

```typescript
// 1. 進入課程頁面時，從 API 取得上次觀看位置
// 2. 影片播放時，每 30 秒呼叫一次 updateProgress
// 3. 影片結束時，呼叫 markComplete
// 4. 離開頁面時，儲存當前位置
// 5. 定期呼叫 logVideoWatch 記錄觀看 log
```

### 進度更新策略

```typescript
// 使用 debounce 避免頻繁 API 呼叫
// 使用 fetch with keepalive 確保離開頁面時能發送
// 本地 state 與 API 同步
```

### 完成狀態即時更新

當學生完成課程後，系統需要：

1. **即時刷新側邊欄完成狀態** - 調用 `useJourney` 的 `refetch` 方法更新 journey 數據
2. **顯示完成慶祝 Modal** - 使用 `CompletionCelebration` 組件顯示慶祝動畫
3. **提供導航選項** - Modal 內包含「返回課程」和「下一課」按鈕

```typescript
// useLessonProgress hook 應支援 onComplete callback
function useLessonProgress(lessonId: string, options?: {
  initialProgress?: LessonProgress;
  onComplete?: () => void;
}): {
  progress: LessonProgress | null;
  updateProgress: (position: number) => Promise<void>;
  markComplete: () => Promise<void>;
  isUpdating: boolean;
};

// LessonPage 使用範例
const { refetch: refetchJourney } = useJourney(courseId);
const { markComplete } = useLessonProgress(lessonId, {
  initialProgress: lesson?.progress,
  onComplete: () => {
    refetchJourney(); // 刷新側邊欄完成狀態
    setShowCelebration(true); // 顯示慶祝 Modal
  },
});
```

## UI States

### Loading State

- 骨架屏顯示
- 課程列表 loading
- 影片 loading

### Error State

- 網路錯誤提示
- 課程不存在提示
- 權限不足提示

### Empty State

- 沒有課程時的空狀態

## Implementation Tasks

### Phase 1: Types & Services

1. [ ] 建立 `types/journey.ts`
2. [ ] 建立 `types/chapter.ts`
3. [ ] 建立 `types/lesson.ts`
4. [ ] 建立 `types/progress.ts`
5. [ ] 建立 `services/journey.service.ts`
6. [ ] 建立 `services/lesson.service.ts`
7. [ ] 建立 `services/progress.service.ts`

### Phase 2: Hooks

8. [ ] 建立 `hooks/useJourneyList.ts`
9. [ ] 建立 `hooks/useJourney.ts`
10. [ ] 建立 `hooks/useLesson.ts`
11. [ ] 建立 `hooks/useLessonProgress.ts`
12. [ ] 建立 `hooks/useVideoProgress.ts`

### Phase 3: Components

13. [ ] 建立 `components/course/JourneyCard.tsx`
14. [ ] 建立 `components/course/JourneyList.tsx`
15. [ ] 建立 `components/course/ChapterAccordion.tsx`
16. [ ] 建立 `components/course/LessonItem.tsx`
17. [ ] 建立 `components/course/LessonTypeIcon.tsx`
18. [ ] 建立 `components/course/ProgressBar.tsx`
19. [ ] 建立 `components/course/CourseProgress.tsx`
20. [ ] 建立 `components/course/InstructorInfo.tsx`

### Phase 4: Lesson Components

21. [ ] 建立 `components/lesson/VideoPlayer.tsx`
22. [ ] 建立 `components/lesson/GoogleFormEmbed.tsx`
23. [ ] 建立 `components/lesson/ArticleContent.tsx`
24. [ ] 建立 `components/lesson/LessonNavigation.tsx`
25. [ ] 建立 `components/lesson/LessonSidebar.tsx`

### Phase 5: Pages

26. [ ] 更新 `(main)/courses/page.tsx`
27. [ ] 建立 `courses/[courseId]/layout.tsx`
28. [ ] 建立 `courses/[courseId]/page.tsx`
29. [ ] 建立 `courses/[courseId]/lessons/[lessonId]/page.tsx`

### Phase 6: Integration & Polish

30. [ ] 實作影片進度追蹤
31. [ ] 實作權限檢查 UI
32. [ ] 實作 loading/error states
33. [ ] 響應式設計調整

### Phase 7: E2E Tests

34. [ ] 課程列表頁面載入與顯示測試
35. [ ] 課程詳情頁面載入與章節展開測試
36. [ ] 未登入用戶點擊 PURCHASED 課程被導向登入測試
37. [ ] 登入用戶存取 PUBLIC/TRIAL 課程測試
38. [ ] 已購買用戶觀看影片課程測試
39. [ ] 影片進度自動儲存測試
40. [ ] 課程完成後顯示完成狀態測試
41. [ ] 上下課導航功能測試
42. [ ] 響應式設計測試（mobile sidebar）

## Success Criteria

- [ ] 課程列表正確顯示
- [ ] 章節可展開收合
- [ ] 影片可正常播放
- [ ] 進度自動儲存
- [ ] 上次觀看位置正確恢復
- [ ] 權限控制 UI 正確顯示
- [ ] 響應式設計正常運作
- [ ] E2E 測試覆蓋所有核心用戶流程
- [ ] E2E 測試在 CI 環境中穩定執行
- [ ] 響應式設計測試通過（Desktop/Tablet/Mobile）
