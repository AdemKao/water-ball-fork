# Tasks: Frontend Layout

## Task 1: 建立 Layout 元件結構

- [ ] 建立 `components/layout/` 資料夾
- [ ] 建立 `components/layout/sider.tsx` (Default Sider)
- [ ] 建立 `components/layout/course-sider.tsx` (Course Sider)
- [ ] 建立 `components/layout/main-content.tsx` (Main Content)

## Task 2: 實作 Default Sider 元件

- [ ] 設計 Sider 基本結構 (fixed width, scrollable)
- [ ] 實作 7 個導航項目 (Landing, Courses, Leaderboard, Missions, Profile, Roadmap, Login)
- [ ] 實作 active state 高亮邏輯 (根據當前路由)
- [ ] 加入導航項目 icon (使用 lucide-react 或其他 icon library)
- [ ] 實作 hover 效果

## Task 3: 實作 Course Sider 元件

- [ ] 設計 Course Sider 基本結構
- [ ] 實作 "Back to Courses" 按鈕
- [ ] 實作 Lesson List 區域
- [ ] 實作 Course Progress 顯示
- [ ] 實作 Course Resources 連結
- [ ] 根據 courseId props 動態調整內容

## Task 4: 實作 MainContent 元件

- [ ] 建立 MainContent wrapper 元件
- [ ] 設定內容區域的 padding 和 max-width
- [ ] 確保內容區域可滾動

## Task 5: 更新 Root Layout

- [ ] 修改 `app/layout.tsx` 整合 Sider
- [ ] 實作 Sider 顯示/隱藏邏輯 (根據路由)
- [ ] 設定 flex layout (Sider + MainContent)
- [ ] 加入 responsive breakpoints

## Task 6: 建立主要頁面路由

- [ ] 更新 `app/page.tsx` (Landing Page)
- [ ] 建立 `app/courses/page.tsx` (Courses List)
- [ ] 建立 `app/leaderboard/page.tsx`
- [ ] 建立 `app/missions/page.tsx`
- [ ] 建立 `app/profile/page.tsx`
- [ ] 建立 `app/roadmap/page.tsx`
- [ ] 建立 `app/login/page.tsx` (無 Sider)

## Task 7: 建立課程相關路由

- [ ] 建立 `app/courses/[courseId]/page.tsx` (Course Journey)
- [ ] 建立 `app/courses/[courseId]/layout.tsx` (Course Layout)
- [ ] 建立 `app/courses/[courseId]/lessons/[lessonId]/page.tsx` (Lesson)
- [ ] 在 Course Layout 中整合 CourseSider

## Task 8: 實作響應式 Sider - Desktop

- [ ] 設定 Desktop breakpoint (>=1024px)
- [ ] 固定寬度 Sider (230px，參考 Waterball SA 設計)
- [ ] Sider 始終顯示

## Task 9: 實作響應式 Sider - Tablet

- [ ] 設定 Tablet breakpoint (768px - 1023px)
- [ ] 實作可收合的 Sider
- [ ] 加入展開/收合按鈕
- [ ] 收合時顯示 icon-only 導航

## Task 10: 實作響應式 Sider - Mobile

- [ ] 設定 Mobile breakpoint (<768px)
- [ ] 使用 shadcn/ui Sheet 實作 Drawer
- [ ] 加入 Hamburger menu 按鈕
- [ ] 實作點擊外部關閉 Drawer
- [ ] Overlay 背景效果

## Task 11: 安裝與配置 shadcn/ui 組件

- [ ] 配置 Tailwind CSS 主題色彩
  - [ ] 在 `tailwind.config.ts` 設定 primary 色彩變數
  - [ ] 在 `app/globals.css` 定義 Light mode primary: `#3863C7`
  - [ ] 在 `app/globals.css` 定義 Dark mode primary: `#9edbf6`
- [ ] 安裝 `button` 組件
- [ ] 安裝 `sheet` 組件 (for mobile drawer)
- [ ] 安裝 `scroll-area` 組件
- [ ] 安裝 `separator` 組件
- [ ] 安裝 icon library (lucide-react)

## Task 12: 實作 UI 動畫效果

- [ ] Sider 展開/收合過渡動畫
- [ ] 導航項目 hover 效果
- [ ] Mobile drawer 滑入/滑出動畫
- [ ] 頁面切換 fade 效果 (optional)

## Task 13: Login 頁面特殊處理

- [ ] 實作 Login Layout (無 Sider)
- [ ] 設定全螢幕樣式
- [ ] 置中登入表單

## Task 14: 建立 TypeScript 型別定義

- [ ] 建立 `types/navigation.ts` - NavigationItem 型別
- [ ] 建立 `types/course.ts` - Course 基礎型別
- [ ] 建立 `types/lesson.ts` - Lesson 基礎型別
- [ ] 定義 Layout component props 型別

## Task 15: 頁面內容骨架

- [ ] 為 Landing Page 加入基本結構與標題
- [ ] 為 Courses Page 加入基本結構與標題
- [ ] 為 Leaderboard Page 加入基本結構與標題
- [ ] 為 Missions Page 加入基本結構與標題
- [ ] 為 Profile Page 加入基本結構與標題
- [ ] 為 Roadmap Page 加入基本結構與標題
- [ ] 為 Course Journey Page 加入基本結構
- [ ] 為 Lesson Page 加入基本結構

## Task 16: 導航功能測試

- [ ] 測試 Default Sider 所有導航項目
- [ ] 測試 Course Sider "Back to Courses" 功能
- [ ] 測試 active state 正確顯示
- [ ] 測試響應式行為 (Desktop/Tablet/Mobile)
- [ ] 測試 Login 頁面無 Sider 顯示

## Task 17: 整合與優化

- [ ] 檢查所有頁面路由可正常訪問
- [ ] 調整 Sider 樣式與間距
- [ ] 調整 MainContent 樣式與間距
- [ ] 確保 Tailwind CSS 正確編譯
- [ ] 優化 TypeScript 型別檢查

## Task 18: 文件更新

- [ ] 更新 README (如有必要)
- [ ] 加入 Layout 使用說明註解
- [ ] 記錄響應式 breakpoints
