# Tasks: Frontend UI Rebuild

## Task Group A: 全域樣式與共用元件

- [ ] 建立共用 `TopNav` 與 `Footer` 元件（含 Logo、選單、登入 CTA、社群連結）。
- [ ] 定義色票、字體尺寸、陰影、圓角於 `src/styles/tokens.ts`。
- [ ] 建立 1280px 容器與響應式斷點（≥1280, 1024, 768, 480）。
- [ ] 建立共用 `CTAButton`, `SectionHeading`, `Card` 組件供各頁重用。
- [ ] 設定 Next Image 資源與 `public/world/*` 圖片路徑。

## Task Group B: 首頁 `/`

- [ ] 實作 Hero 區（文案、雙 CTA、右側課程卡圖片）。
- [ ] 實作四張卡片 2x2 Grid，含 CTA 連結與 icon。
- [ ] 實作講師介紹區（頭像、四個指標、CTA badge）。
- [ ] 實作 Footer CTA 區，與共用 Footer 整合。
- [ ] 撰寫 Playwright 測試驗證 CTA 導向與卡片存在。

## Task Group C: 課程頁 `/courses`

- [ ] 建立課程卡片資料模型（標題、講師、擁有狀態）。
- [ ] 還原「軟體設計模式精通之旅」「AI x BDD」卡片與按鈕。
- [ ] 實作折價券提示與訂單紀錄卡。
- [ ] 加入 Loading/Skeleton 狀態。
- [ ] Playwright 測試驗證 CTA 連結與訂單紀錄訊息。

## Task Group D: 排行榜 `/leaderboard`

- [ ] 建立 TabList + TabPanel 結構（學習/本週）。
- [ ] 實作排行榜列表：排名、頭像、稱號、等級、XP。
- [ ] 支援水平捲動與 Skeleton/Suspense 狀態。
- [ ] 確認底部顯示訪客列。
- [ ] 撰寫互動測試覆蓋 Tab 切換與資料呈現。

## Task Group E: 旅程主頁 `/journeys/software-design-pattern`

- [ ] 重現 Hero 區（描述、統計、CTA）。
- [ ] 建立 Accordion 內容（副本零～五）。
- [ ] 實作證書區與 Highlight 列表。
- [ ] 整合「立即加入課程」「預約 1v1」導向。
- [ ] 測試 CTAs 導向是否正確。

## Task Group F: 訂單流程 `/journeys/software-design-pattern/orders?productId=1`

- [ ] 建立 Stepper 元件顯示 1~3 步驟。
- [ ] 渲染課程詳情文案與保證區塊。
- [ ] 實作售價與分期資訊卡。
- [ ] 建立 Accordion 展示副本與服務內容。
- [ ] 測試主 CTA（下一步）存在且可點擊。

## Task Group G: 挑戰地圖 `/journeys/software-design-pattern/roadmap`

- [ ] 實作 Header（days left、cleared、XP）。
- [ ] 建立主線/支線 Tab 與清單資料（序號、標題、難度星數）。
- [ ] 每條目需為 Link 並含 hover/focus 狀態。
- [ ] 手機版改為單欄列表。
- [ ] 撰寫測試確認 Tab 切換與連結 URL。

## Task Group H: SOP 頁與登入流程 `/journeys/software-design-pattern/sop`

- [ ] 實作訪客提示訊息與購買連結。
- [ ] 確認登入按鈕導向 `/sign-in`。
- [ ] 建立 Table of Contents placeholder（不可展開）。
- [ ] 測試未登入時行為（顯示提示而非內容）。

## Task Group I: 可及性、RWD 與驗證

- [ ] 針對 CTA/Tab/Accordion/表格加上 aria-* 屬性。
- [ ] 於 1280/1024/768/375px 手動驗證版面。
- [ ] Lighthouse 與 axe 測試通過（Performance ≥80, Accessibility ≥90）。
- [ ] 撰寫文件 `docs/frontend-testing.md` 補充新的測試指引。
