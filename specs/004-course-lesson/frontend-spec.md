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
  onNext?: () => void;
}
```

**行為:**

- 點擊「上一課」導航到上一個課程
- 點擊「下一課」：
  1. 先觸發 `onNext` callback（用於非影片課程的完成標記）
  2. 再導航到下一個課程

## Lesson Completion by Type

不同課程類型有不同的完成觸發條件：

| 類型 | 完成觸發時機 |
|------|------------|
| VIDEO | 影片播放結束 (`onEnded` event) |
| ARTICLE | 點擊「下一課」按鈕 |
| GOOGLE_FORM | 點擊「下一課」按鈕 |

**實作方式:**

- `LessonNavigation` 組件接受 `onNext` callback
- 對於非 VIDEO 類型的課程，傳入 `markComplete` 作為 `onNext`
- 用戶點擊「下一課」時，會先呼叫 `markComplete()` 再導航

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
  async updateProgress(lessonId: string, lastPositionSeconds: number): Promise<UpdateProgressResponse>;
  async markComplete(lessonId: string): Promise<CompleteResponse>;
  sendBeaconProgress(lessonId: string, lastPositionSeconds: number): void;
};
```

---

## Page-API Interaction Flows

本節詳細說明每個頁面與 API 的互動流程，幫助交接工程師理解系統運作方式。

### 1. 課程列表頁 `/courses`

```
┌─────────────────────────────────────────────────────────────┐
│  /courses                                                    │
├─────────────────────────────────────────────────────────────┤
│  Hooks: useJourneyList                                      │
│  Components: JourneyCard, JourneyList                       │
└─────────────────────────────────────────────────────────────┘
```

**初始載入流程：**

```
頁面載入
    │
    ▼
useJourneyList()
    │
    ▼
GET /api/journeys ──────────────────────────────► Backend
    │                                                 │
    │◄────────────── Journey[] ──────────────────────┘
    │
    ▼
渲染 JourneyCard 列表
```

**API 呼叫：**

| 時機 | API | 說明 |
|------|-----|------|
| 頁面載入 | `GET /api/journeys` | 取得所有已發布課程 |

**不需要登入**，任何人都可以瀏覽課程列表。

---

### 2. 課程總覽頁 `/courses/[courseId]`

```
┌─────────────────────────────────────────────────────────────┐
│  /courses/[courseId]                                         │
├─────────────────────────────────────────────────────────────┤
│  Hooks: useJourney, useLesson, useLessonProgress,           │
│         useVideoProgress, usePurchase, usePendingPurchases  │
│  Components: CourseSidebar, VideoPlayer, LessonNavigation   │
└─────────────────────────────────────────────────────────────┘
```

**初始載入流程：**

```
頁面載入
    │
    ├──► useJourney(courseId)
    │        │
    │        ▼
    │    GET /api/journeys/{courseId} ──────────────► Backend
    │        │                                           │
    │        │◄───── JourneyDetail (含章節、課程列表) ────┘
    │        │
    │        ▼
    │    渲染 CourseSidebar (章節列表)
    │
    ├──► usePendingPurchases(courseId)
    │        │
    │        ▼
    │    GET /api/purchases/pending ────────────────► Backend
    │        │                                           │
    │        │◄───── PendingPurchase[] ─────────────────┘
    │
    ▼
預設選擇第一個 lesson (activeLessonId)
    │
    ▼
useLesson(activeLessonId)
    │
    ▼
GET /api/lessons/{lessonId} ────────────────────► Backend
    │                                                 │
    │◄───── LessonDetail (含 progress, contentUrl) ──┘
    │
    ▼
判斷 lessonType
    │
    ├─── VIDEO ──────► 啟動 useVideoProgress
    │                      │
    │                      ▼
    │                  startTracking(lastPositionSeconds)
    │                      │
    │                      ▼
    │                  渲染 VideoPlayer
    │
    ├─── ARTICLE ────► 渲染文章內容
    │
    └─── GOOGLE_FORM ► 渲染 Google Form 嵌入
```

**使用者操作流程：**

```
[VIDEO 類型課程]

影片播放中
    │
    ├──► VideoPlayer.onTimeUpdate(currentTime)
    │        │
    │        ▼
    │    updatePosition(currentTime)  ← 更新本地 ref
    │
    │    每 10 秒自動觸發
    │        │
    │        ▼
    │    PUT /api/lessons/{lessonId}/progress ──────► Backend
    │        body: { lastPositionSeconds: number }       │
    │        │                                           │
    │        │◄───── { isCompleted, lastPositionSeconds } ┘
    │
    ▼
影片播放結束 (onEnded)
    │
    ▼
markComplete()
    │
    ▼
POST /api/lessons/{lessonId}/complete ─────────► Backend
    │                                                │
    │◄───── { isCompleted: true, completedAt } ─────┘
    │
    ├──► refetchJourney() ← 更新側邊欄完成狀態
    │
    └──► setShowCelebration(true) ← 顯示慶祝 Modal
```

```
[ARTICLE / GOOGLE_FORM 類型課程]

用戶瀏覽內容
    │
    ▼
點擊「下一課」按鈕
    │
    ├──► onNext() → markComplete()
    │        │
    │        ▼
    │    POST /api/lessons/{lessonId}/complete ────► Backend
    │        │                                          │
    │        │◄───── { isCompleted: true } ────────────┘
    │
    └──► onNavigate(nextLessonId)
             │
             ▼
         setSelectedLessonId(nextLessonId)
             │
             ▼
         useLesson 重新 fetch 新課程
```

```
[離開頁面 / 切換課程]

stopTracking()
    │
    ▼
sendBeaconProgress(lessonId, currentPosition)
    │
    ▼
PUT /api/lessons/{lessonId}/progress ──────────► Backend
    (使用 keepalive: true 確保請求完成)
```

**API 呼叫摘要：**

| 時機 | API | 說明 |
|------|-----|------|
| 頁面載入 | `GET /api/journeys/{id}` | 取得課程詳情含章節 |
| 頁面載入 | `GET /api/purchases/pending` | 檢查待付款訂單 |
| 選擇課程 | `GET /api/lessons/{id}` | 取得課程內容 |
| 每 10 秒 | `PUT /api/lessons/{id}/progress` | 儲存觀看進度 |
| 課程完成 | `POST /api/lessons/{id}/complete` | 標記課程完成 |
| 完成後 | `GET /api/journeys/{id}` | 刷新側邊欄狀態 |
| 離開頁面 | `PUT /api/lessons/{id}/progress` | 儲存最後位置 (beacon) |

---

### 3. 課程播放頁 `/courses/[courseId]/lessons/[lessonId]`

```
┌─────────────────────────────────────────────────────────────┐
│  /courses/[courseId]/lessons/[lessonId]                     │
├─────────────────────────────────────────────────────────────┤
│  Hooks: useLesson, useJourney, useLessonProgress,           │
│         useVideoProgress, useAuth                           │
│  Components: VideoPlayer, GoogleFormEmbed, ArticleContent,  │
│              LessonNavigation, LessonSidebar,               │
│              CompletionCelebration, AccessDeniedModal       │
└─────────────────────────────────────────────────────────────┘
```

**初始載入流程：**

```
頁面載入
    │
    ├──► useAuth()
    │        │
    │        ▼
    │    檢查登入狀態
    │
    ├──► useLesson(lessonId)
    │        │
    │        ▼
    │    GET /api/lessons/{lessonId} ───────────────► Backend
    │        │                                           │
    │        │◄─────────────────────────────────────────┘
    │        │
    │        ├── 200 OK ──────► 取得 LessonDetail
    │        ├── 401 ─────────► isUnauthorized = true → 導向登入
    │        └── 403 ─────────► isAccessDenied = true → 顯示購買 Modal
    │
    └──► useJourney(courseId)
             │
             ▼
         GET /api/journeys/{courseId} ──────────────► Backend
             │                                           │
             │◄───── JourneyDetail ─────────────────────┘
             │
             ▼
         渲染 LessonSidebar
```

**使用者互動流程與課程總覽頁相同**，差異在於：
- 導航時使用 `router.push()` 而非 `setSelectedLessonId()`
- 有獨立的 `LessonSidebar` 元件

---

### 4. 權限檢查流程

```
用戶請求課程內容
    │
    ▼
GET /api/lessons/{lessonId}
    │
    ├── lesson.accessType = PUBLIC
    │       └──► 200 OK (任何人可看)
    │
    ├── lesson.accessType = TRIAL
    │       │
    │       ├── 未登入 ──► 401 Unauthorized
    │       │               │
    │       │               ▼
    │       │           前端顯示 LoginRequiredModal
    │       │
    │       └── 已登入 ──► 200 OK
    │
    └── lesson.accessType = PURCHASED
            │
            ├── 未登入 ──► 401 Unauthorized
            │
            ├── 已登入但未購買 ──► 403 Forbidden
            │                         │
            │                         ▼
            │                     前端顯示 AccessDeniedModal
            │                         │
            │                         ▼
            │                     引導用戶購買課程
            │
            └── 已購買 ──► 200 OK
```

---

### 5. 進度追蹤時序圖

```
┌─────────┐          ┌──────────────┐          ┌─────────────────┐          ┌─────────┐
│  User   │          │  VideoPlayer │          │ useVideoProgress│          │ Backend │
└────┬────┘          └──────┬───────┘          └────────┬────────┘          └────┬────┘
     │                      │                           │                        │
     │    播放影片           │                           │                        │
     │─────────────────────>│                           │                        │
     │                      │                           │                        │
     │                      │   onTimeUpdate(time)      │                        │
     │                      │──────────────────────────>│                        │
     │                      │                           │                        │
     │                      │                           │  updatePosition(time)  │
     │                      │                           │  (更新 ref, 不發 API)  │
     │                      │                           │                        │
     │                      │         ... 每秒觸發 ...   │                        │
     │                      │                           │                        │
     │                      │                           │  [每 10 秒 interval]    │
     │                      │                           │  PUT /progress          │
     │                      │                           │───────────────────────>│
     │                      │                           │                        │
     │                      │                           │◄──── 200 OK ───────────│
     │                      │                           │                        │
     │    影片播放結束        │                           │                        │
     │                      │   onEnded()               │                        │
     │                      │──────────────────────────>│                        │
     │                      │                           │                        │
     │                      │                           │  markComplete()        │
     │                      │                           │                        │
     │                      │                           │  POST /complete        │
     │                      │                           │───────────────────────>│
     │                      │                           │                        │
     │                      │                           │◄──── 200 OK ───────────│
     │                      │                           │                        │
     │    [顯示慶祝 Modal]   │                           │  onComplete callback   │
     │◄─────────────────────┼───────────────────────────│                        │
     │                      │                           │                        │
```

---

### 6. 非影片課程完成流程

```
┌─────────┐          ┌──────────────────┐          ┌──────────────────┐          ┌─────────┐
│  User   │          │ LessonNavigation │          │ useLessonProgress│          │ Backend │
└────┬────┘          └────────┬─────────┘          └────────┬─────────┘          └────┬────┘
     │                        │                             │                         │
     │  閱讀文章 / 填寫表單    │                             │                         │
     │                        │                             │                         │
     │  點擊「下一課」         │                             │                         │
     │───────────────────────>│                             │                         │
     │                        │                             │                         │
     │                        │  onNext() [非 VIDEO 時傳入]  │                         │
     │                        │────────────────────────────>│                         │
     │                        │                             │                         │
     │                        │                             │  markComplete()         │
     │                        │                             │                         │
     │                        │                             │  POST /complete         │
     │                        │                             │────────────────────────>│
     │                        │                             │                         │
     │                        │                             │◄──── 200 OK ────────────│
     │                        │                             │                         │
     │                        │  onNavigate(nextLessonId)   │                         │
     │                        │────────────────────────────>│                         │
     │                        │                             │                         │
     │  [導航到下一課]         │                             │                         │
     │◄───────────────────────│                             │                         │
     │                        │                             │                         │
```

---

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

### 適用頁面

影片進度追蹤需要在以下兩個頁面實作：

1. **`/courses/[courseId]` (課程總覽頁)** - 嵌入式播放器，用戶在側邊欄選擇課程後直接播放
2. **`/courses/[courseId]/lessons/[lessonId]` (課程播放頁)** - 獨立播放頁面

兩個頁面都必須：

- 呼叫 `useVideoProgress(lessonId)` 取得 `startTracking`, `updatePosition`, `stopTracking`
- 在 lesson 載入且為 VIDEO 類型時呼叫 `startTracking(lesson.progress.lastPositionSeconds)`
- 將 `updatePosition` 傳給 `VideoPlayer` 的 `onTimeUpdate` callback
- 在 component unmount 時呼叫 `stopTracking`

### 追蹤邏輯

```typescript
// 1. 進入課程頁面時，從 API 取得上次觀看位置
// 2. 當 lesson 載入完成且為 VIDEO 類型時，呼叫 startTracking(lastPositionSeconds)
// 3. 影片播放時，VideoPlayer 每秒呼叫 onTimeUpdate -> updatePosition
// 4. useVideoProgress 內部每 10 秒自動呼叫 API 儲存進度
// 5. 影片結束時，呼叫 markComplete
// 6. 離開頁面或切換 lesson 時，stopTracking 會發送最後位置
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

1. [x] 建立 `types/journey.ts`
2. [x] 建立 `types/chapter.ts`
3. [x] 建立 `types/lesson.ts`
4. [x] 建立 `types/progress.ts`
5. [x] 建立 `services/journey.service.ts`
6. [x] 建立 `services/lesson.service.ts`
7. [x] 建立 `services/progress.service.ts`

### Phase 2: Hooks

8. [x] 建立 `hooks/useJourneyList.ts`
9. [x] 建立 `hooks/useJourney.ts`
10. [x] 建立 `hooks/useLesson.ts`
11. [x] 建立 `hooks/useLessonProgress.ts`
12. [x] 建立 `hooks/useVideoProgress.ts`

### Phase 3: Components

13. [x] 建立 `components/course/JourneyCard.tsx`
14. [x] 建立 `components/course/JourneyList.tsx`
15. [x] 建立 `components/course/ChapterAccordion.tsx`
16. [x] 建立 `components/course/LessonItem.tsx`
17. [x] 建立 `components/course/LessonTypeIcon.tsx`
18. [x] 建立 `components/course/ProgressBar.tsx`
19. [x] 建立 `components/course/CourseProgress.tsx`
20. [x] 建立 `components/course/InstructorInfo.tsx`

### Phase 4: Lesson Components

21. [x] 建立 `components/lesson/VideoPlayer.tsx`
22. [x] 建立 `components/lesson/GoogleFormEmbed.tsx`
23. [x] 建立 `components/lesson/ArticleContent.tsx`
24. [x] 建立 `components/lesson/LessonNavigation.tsx`
25. [x] 建立 `components/lesson/LessonSidebar.tsx`

### Phase 5: Pages

26. [x] 更新 `(main)/courses/page.tsx`
27. [x] 建立 `courses/[courseId]/layout.tsx`
28. [x] 建立 `courses/[courseId]/page.tsx`
29. [x] 建立 `courses/[courseId]/lessons/[lessonId]/page.tsx`

### Phase 6: Integration & Polish

30. [x] 實作影片進度追蹤
31. [x] 實作權限檢查 UI
32. [x] 實作 loading/error states
33. [x] 響應式設計調整

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

- [x] 課程列表正確顯示
- [x] 章節可展開收合
- [x] 影片可正常播放
- [x] 進度自動儲存
- [x] 上次觀看位置正確恢復
- [x] 權限控制 UI 正確顯示
- [x] 響應式設計正常運作
- [ ] E2E 測試覆蓋所有核心用戶流程
- [ ] E2E 測試在 CI 環境中穩定執行
- [ ] 響應式設計測試通過（Desktop/Tablet/Mobile）
