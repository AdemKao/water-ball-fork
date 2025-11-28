# Specification: Frontend UI Rebuild (Waterball World)

## Overview

重製前端介面，使 Next.js App Router 應用在未登入情境下呈現與 <https://world.waterballsa.tw/> 完全一致的版面、層級與互動。此需求涵蓋首頁、課程、排行榜、旅程主頁、挑戰地圖與 SOP 頁，需依照對應截圖（位於 `specs/006-frontend-ui-re/fork-images`）還原排版、間距、字體、配色與行為。

## Global Requirements

1. **導覽列與頁尾一致性**：所有頁面共用含 Logo、主選單（首頁/課程/排行榜/所有單元/挑戰地圖/SOP 寶典）與登入按鈕的頂部導覽列，以及含社群/條款/版權資訊的頁尾。
2. **Typography & Colors**：採用與原站一致的粗細、字階與深淺灰；主要強調色使用 #F17500（CTA）、#1B1B1F（標題）、#4B5563（段落），背景保持淺色大面積留白。
3. **Layout System**：桌機寬度 1280px 容器，內容置中；Hero、卡片與表格依截圖比例配置；保留陰影、圓角與漸層背景。
4. **Responsive**：需提供斷點（≥1024 桌機、768-1023 平板、<768 手機），保證卡片區域改為縱向堆疊，排行榜表格可水平捲動。
5. **資源管理**：靜態圖片放於 `public/world/*`，以 Next Image 載入；重複使用的 Copy 與資料以字串常數或 CMS 模組封裝，方便後續國際化。
6. **互動一致性**：所有 CTA/Tab/展開按鈕需具 hover/focus 狀態，點擊轉導 URL 與官方站一致；未登入時所有受保護頁面顯示登入入口或購買提示。

## Page Requirements

### 1. 首頁（`/`）

- **Hero 區**：左側文案、雙 CTAs（「軟體設計模式精通之旅」「AI x BDD」）。CTA 需含副標、按鈕列（「立刻體驗」「立刻購買」）。右側顯示兩張課程卡片圖片。
- **旅程卡片群**：含「軟體設計模式之旅課程」「水球潘的部落格」「直接與老師或是其他工程師交流」「技能評級及證書系統」等卡片，須維持 2x2 Grid 於桌機、Stack 於手機。
- **講師介紹**：展示水球潘照片與四個重點敘述列；每列附 icon/badge。
- **Footer CTA**：保留 Line/Facebook/Discord/Youtube/社群卡片/隱私權政策/服務條款/E-mail。
- **截圖對應**：`world-waterballsa-tw_home-default.png`（Hero），`world-waterballsa-tw_home-scroll-mid.png`（卡片群），`world-waterballsa-tw_home-scroll-bottom.png`（講師 + Footer）。

### 2. 課程列表（`/courses`）

- **課程卡片**：依截圖呈現兩張卡片，含課程標題、講師、標籤（「尚未擁有」「僅限付費」）與主按鈕。主卡片需同時顯示「試聽課程」「立刻購買」。
- **訂單紀錄區**：灰色卡片顯示「目前沒有訂單記錄」。
- **狀態提示**：CTA 旁顯示折價券提示與說明文案。
- **截圖對應**：`world-waterballsa-tw-courses_click-aixbdd-likougoumai.png`。

### 3. 排行榜（`/leaderboard`）

- **Tab 切換**：含「學習排行榜」「本週成長榜」兩個 tabs，預設第一個，點擊切換表格內容。
- **排行榜列表**：桌機以兩欄/表格形式呈現排名、頭像、名稱、稱號、等級、XP。需支援水平滾動與骨架狀態。
- **訪客資訊**：底部顯示「訪客 初級工程師 0」列。
- **截圖對應**：`world-waterballsa-tw-leaderboard_click-weekly-tab.png`（週榜）。

### 4. 旅程主頁（`/journeys/software-design-pattern`）

- **Hero 內容**：標題、副標、課程描述、統計（部影片/大量實戰題）與 CTA（立即加入課程、預約 1v1）。
- **Accordion Sections**：保留七個「Toggle section」區塊，用於展示各副本與課程特色。
- **證書區**：顯示 sample certificate 圖片與三個指標（中文課程、支援行動裝置、專業完課認證）。
- **截圖對應**：`world-waterballsa-tw-journeys-software-design-pattern_click-join-course.png`（含跳轉至 orders 的流程）。

### 5. 挑戰地圖（`/journeys/software-design-pattern/roadmap`）

- **Header**：顯示「挑戰地圖」「0 days left」「0/20 cleared」「0 XP」。
- **Tab 列**：主線/支線切換，主線顯示白段與黑段道館清單，支線顯示 A/B/C 題目列表。
- **卡片/連結**：每條目需含序號、標題、星級難度。點擊導向對應章節 URL。
- **截圖對應**：`world-waterballsa-tw-roadmap_click-side-quests-tab.png`。

### 6. SOP 寶典（`/journeys/software-design-pattern/sop`）

- **訪客狀態**：顯示「您無法觀看『SOP 寶典』」訊息與購買課程的連結。
- **登入行為**：登入按鈕導向 `/sign-in`。未登入維持提示畫面，如截圖 `world-waterballsa-tw-sop_click-login.png`。

### 7. 訂單流程（`/journeys/software-design-pattern/orders?productId=1`）

- **流程步驟列**：顯示 1~3 Step（建立訂單/完成支付/約定開學）。
- **課程詳情**：復刻官方文案、章節 accordion、售價區塊、分期資訊與「下一步：選取付款方式」按鈕。
- **截圖對應**：`world-waterballsa-tw-journeys-software-design-pattern_click-join-course.png`。

## Non-Functional

1. **Performance**：Lighthouse Performance ≥ 80；避免 Layout Shift，Hero 圖片使用固定尺寸。
2. **Accessibility**：提供語意化 heading、aria-controls、tablist/tab/tabpanels、表格 `<thead>/<tbody>`，並確保對比比率 ≥ 4.5。
3. **State Management**：排行榜資料支援快取與 loading skeleton；Tab 切換不重新載入整頁。
4. **Testing**：以 Playwright/Vitest 撰寫互動測試（按鈕導向、tab 切換、accordion 展開）。

## Success Criteria

- [ ] 每個頁面與對應截圖在桌機視窗下無明顯差異（±2px 容忍）。
- [ ] CTA/Tab/Accordion 行為與官方站一致。
- [ ] 所有頁面通過無障礙 lint（eslint-plugin-jsx-a11y）。
- [ ] RWD 於 375px、768px、1280px 三個斷點無版面錯亂。
- [ ] 主要互動皆有自動化測試覆蓋。
