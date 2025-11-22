# Frontend Layout Specification

## Overview

本文件定義 Waterball Course Platform 前端的整體布局架構與頁面結構。

## Technology Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui

## Layout Architecture

### Main Layout Structure

網站採用左右分欄布局：

```
┌─────────────────────────────────────┐
│        Sider       │   Main Content │
│     (Navigation)   │     (Pages)    │
│                    │                │
│                    │                │
│                    │                │
│                    │                │
└─────────────────────────────────────┘
```

### Layout Behavior

- **Default State**: 左側 Sider 顯示主導航選單
- **Course State**: 進入課程後，Sider 內容切換為課程相關導航

### Sider Component

Sider 根據當前路由狀態動態調整內容：

#### 1. Default Sider (主導航)

顯示條件：未進入課程時

導航項目：

- Landing
- Courses
- Leaderboard
- Missions
- Profile
- Roadmap
- Login

#### 2. Course Sider (課程導航)

顯示條件：進入課程頁面時 (路由包含 `/courses/:courseId`)

導航項目：

- Lesson List
- Course Progress
- Course Resources
- Back to Courses

## Page Routes

### 1. Landing Page

- **Route**: `/`
- **Description**: 首頁，介紹平台特色與主要功能
- **Screenshot**: `assets/landing.png`
- **Sider**: Default Sider

### 2. Courses Page

- **Route**: `/courses`
- **Description**: 課程列表頁面，顯示所有可選課程
- **Screenshot**: `assets/courses-1.png`
- **Sider**: Default Sider

### 3. Leaderboard Page

- **Route**: `/leaderboard`
- **Description**: 排行榜頁面，顯示學生學習成績排名
- **Screenshot**: `assets/leaderboard-2.png`
- **Sider**: Default Sider

### 4. Missions Page

- **Route**: `/missions`
- **Description**: 任務頁面，顯示學習任務與挑戰
- **Screenshot**: `assets/missions-8.png`
- **Sider**: Default Sider

### 5. Profile Page

- **Route**: `/profile`
- **Description**: 個人資料頁面，顯示學生個人資訊與學習紀錄
- **Screenshot**: `assets/profile-9.png`
- **Sider**: Default Sider

### 6. Roadmap Page

- **Route**: `/roadmap`
- **Description**: 學習路線圖頁面，顯示課程學習路徑
- **Screenshot**:
  - `assets/roadmap-4.png`
  - `assets/roadmap-5.png`
- **Sider**: Default Sider

### 7. Login Page

- **Route**: `/login`
- **Description**: 登入頁面
- **Screenshot**: `assets/login-7.png`
- **Sider**: None (可能為全螢幕登入頁面)

### 8. Lesson Page

- **Route**: `/courses/:courseId/lessons/:lessonId`
- **Description**: 課程內容頁面，顯示課程單元內容
- **Screenshot**: `assets/courses-lesson-9.png`
- **Sider**: Course Sider

### 9. Course Journey Page

- **Route**: `/courses/:courseId`
- **Description**: 課程旅程頁面，顯示課程大綱與進度
- **Screenshot**:
  - `assets/courses-journey-3.png`
  - `assets/courses-journey-6.png`
- **Sider**: Course Sider

## Component Structure

```
frontend/src/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   ├── courses/
│   │   ├── page.tsx                  # Courses list
│   │   └── [courseId]/
│   │       ├── page.tsx              # Course journey
│   │       ├── layout.tsx            # Course layout (with Course Sider)
│   │       └── lessons/
│   │           └── [lessonId]/
│   │               └── page.tsx      # Lesson page
│   ├── leaderboard/
│   │   └── page.tsx
│   ├── missions/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── roadmap/
│   │   └── page.tsx
│   └── login/
│       └── page.tsx
└── components/
    ├── layout/
    │   ├── sider.tsx                 # Main navigation sider
    │   ├── course-sider.tsx          # Course navigation sider
    │   └── main-content.tsx          # Main content wrapper
    └── features/
        └── (feature-specific components)
```

## Layout States

### State 1: Default Layout

**使用頁面**: Landing, Courses, Leaderboard, Missions, Profile, Roadmap

```tsx
<RootLayout>
  <Sider />                    {/* Default navigation */}
  <MainContent>
    {children}                 {/* Page content */}
  </MainContent>
</RootLayout>
```

### State 2: Course Layout

**使用頁面**: Course Journey, Lesson

```tsx
<RootLayout>
  <CourseSider courseId={courseId} />  {/* Course-specific navigation */}
  <MainContent>
    {children}                          {/* Course/Lesson content */}
  </MainContent>
</RootLayout>
```

### State 3: Minimal Layout

**使用頁面**: Login

```tsx
<RootLayout>
  {children}                   {/* Full-screen login page, no sider */}
</RootLayout>
```

## Responsive Design

- **Desktop**: Full layout with fixed width Sider
- **Tablet**: Collapsible Sider
- **Mobile**: Drawer-style Sider (overlay on content)

## Navigation Flow

```
Landing → Courses → Course Journey → Lesson
                 ↓
              Login (if not authenticated)
                 ↓
        Other Pages (Leaderboard, Missions, Profile, Roadmap)
```

## Implementation Notes

1. 使用 Next.js App Router 的 layout 系統實現巢狀布局
2. Sider 狀態透過路由判斷自動切換
3. 所有頁面共用 Root Layout，但 Course 相關頁面使用額外的 Course Layout
4. 使用 shadcn/ui 的組件建構 UI 元素
5. 響應式設計使用 Tailwind CSS breakpoints

## Design System

### Color Scheme

參考 [Waterball SA](https://world.waterballsa.tw/) 的設計系統：

#### Light Mode
- **Primary**: `#3863C7` (藍色)
- **Background**: White
- **Text**: Dark gray/Black

#### Dark Mode
- **Primary**: `#9edbf6` (淺藍色)
- **Background**: Dark gray
- **Text**: Light gray/White

### Layout Measurements

- **Sider Width**: `230px` (固定寬度)
- **Breakpoints**: 使用 Tailwind CSS 預設 breakpoints
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

### shadcn/ui Theme Configuration

在 `tailwind.config.ts` 中配置主題色彩：

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      // ... 其他 shadcn/ui 色彩配置
    },
  },
}
```

在 `app/globals.css` 中定義 CSS 變數：

```css
@layer base {
  :root {
    --primary: 220 68% 50%; /* #3863C7 */
    /* ... 其他變數 */
  }
  
  .dark {
    --primary: 195 89% 78%; /* #9edbf6 */
    /* ... 其他變數 */
  }
}
```

## Design References

所有頁面設計稿位於：`specs/002-frontend-layout/assets/`
