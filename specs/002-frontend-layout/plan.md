# Implementation Plan: Frontend Layout

## Phase 1: Layout 基礎架構

### 1.1 建立 Layout Components

- 建立 `components/layout/` 資料夾結構
- 實作 `Sider` 元件 (Default navigation)
- 實作 `CourseSider` 元件 (Course navigation)
- 實作 `MainContent` 元件 (Content wrapper)

### 1.2 更新 Root Layout

- 修改 `app/layout.tsx` 以支援 Sider 切換邏輯
- 整合 Default Sider 到 Root Layout
- 設定響應式行為 (Desktop/Tablet/Mobile)

## Phase 2: 頁面路由架構

### 2.1 建立主要頁面路由

- 建立 `/` (Landing) - `app/page.tsx`
- 建立 `/courses` (Courses List) - `app/courses/page.tsx`
- 建立 `/leaderboard` - `app/leaderboard/page.tsx`
- 建立 `/missions` - `app/missions/page.tsx`
- 建立 `/profile` - `app/profile/page.tsx`
- 建立 `/roadmap` - `app/roadmap/page.tsx`
- 建立 `/login` - `app/login/page.tsx`

### 2.2 建立課程相關路由

- 建立 `/courses/[courseId]` (Course Journey) - `app/courses/[courseId]/page.tsx`
- 建立 `/courses/[courseId]/layout.tsx` (Course Layout with Course Sider)
- 建立 `/courses/[courseId]/lessons/[lessonId]` (Lesson) - `app/courses/[courseId]/lessons/[lessonId]/page.tsx`

## Phase 3: Sider 導航功能

### 3.1 Default Sider 導航項目

- Landing 導航項目
- Courses 導航項目
- Leaderboard 導航項目
- Missions 導航項目
- Profile 導航項目
- Roadmap 導航項目
- Login 導航項目
- Active state 高亮顯示

### 3.2 Course Sider 導航項目

- Lesson List 展示
- Course Progress 顯示
- Course Resources 連結
- Back to Courses 按鈕
- 根據 courseId 動態載入課程資訊

## Phase 4: 響應式設計

### 4.1 Desktop Layout

- 固定寬度 Sider (例如: 256px)
- 固定顯示導航選單
- 內容區域自適應剩餘空間

### 4.2 Tablet Layout

- 可收合的 Sider
- 展開/收合按鈕
- 收合時顯示 icon-only 導航

### 4.3 Mobile Layout

- Drawer-style Sider (overlay)
- Hamburger menu 按鈕
- 點擊外部區域關閉 Sider

## Phase 5: UI/UX 優化

### 5.1 shadcn/ui 組件整合

- 安裝必要的 shadcn/ui 組件
  - Button
  - Sheet (for mobile drawer)
  - ScrollArea
  - Separator
- 配置 shadcn/ui 主題色彩
  - 在 `tailwind.config.ts` 設定主題色彩變數
  - 在 `app/globals.css` 定義 Light/Dark mode 色彩
  - Light Mode Primary: `#3863C7`
  - Dark Mode Primary: `#9edbf6`
- 設定 Sider 固定寬度: `230px`

### 5.2 動畫與過渡效果

- Sider 展開/收合動畫
- 頁面切換過渡效果
- 導航項目 hover 效果

### 5.3 Login 頁面特殊處理

- 實作無 Sider 的 Layout
- 全螢幕登入介面

## Phase 6: 頁面內容骨架

### 6.1 建立頁面 Placeholder

- 為每個頁面建立基本結構
- 加入頁面標題與描述
- 預留內容區域

### 6.2 導航測試

- 測試所有頁面路由可正常訪問
- 測試 Sider 導航功能
- 測試 Course Sider 切換邏輯

## Phase 7: TypeScript 型別定義

### 7.1 Navigation Types

- 定義 NavigationItem 型別
- 定義 Course 型別 (基礎結構)
- 定義 Lesson 型別 (基礎結構)

### 7.2 Layout Props Types

- 定義 SiderProps
- 定義 CourseSiderProps
- 定義 MainContentProps

## Timeline Estimation

- Phase 1: 1.5 hours
- Phase 2: 1 hour
- Phase 3: 1.5 hours
- Phase 4: 2 hours
- Phase 5: 1.5 hours
- Phase 6: 30 mins
- Phase 7: 30 mins

Total: ~8.5 hours
