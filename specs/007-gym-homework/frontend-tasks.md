# Frontend Tasks: Gym Homework System

## Overview

本文件定義道館作業系統前端開發任務，依據 frontend-spec.md 和 api-spec.md 規格撰寫。

---

## IMPORTANT: Implementation Status Summary

### Architecture Mismatch

**The current frontend implementation does NOT match the spec.** A decision is needed:

| Aspect | Spec (frontend-spec.md) | Current Implementation |
|--------|------------------------|------------------------|
| **URL Structure** | `/gyms`, `/gyms/[gymId]`, `/gyms/[gymId]/stages/[stageId]`, `/gyms/[gymId]/problems/[problemId]` | `/gym/[gymId]`, `/exercises/[exerciseId]` |
| **Data Model** | Gym → Stage → Problem (3 levels) | Gym → Exercise (2 levels, no Stage) |
| **ID Type** | UUID (string) | number |
| **Types** | GymType, Stage, Problem, Hint, Prerequisites | Difficulty, Exercise, simpler Submission |
| **API Endpoints** | `GET /api/gyms`, `GET /api/gyms/{gymId}/stages/{stageId}` | `GET /api/journeys/{journeyId}/gyms`, `GET /api/gyms/{gymId}/exercises` |

### Options

1. **Option A: Rewrite frontend to match spec** - Significant effort, aligns with spec
2. **Option B: Update spec to match implementation** - Less effort, simpler architecture

### Currently Implemented (using OLD architecture)

| File | Status | Notes |
|------|--------|-------|
| `types/gym.ts` | ⚠️ PARTIAL | Different model (Exercise vs Stage/Problem) |
| `services/gym.service.ts` | ⚠️ PARTIAL | Different API endpoints |
| `hooks/useGym.ts` | ⚠️ PARTIAL | Has useGyms, useGymExercises, useExerciseDetail, useMySubmissions |
| `hooks/useGymExercise.ts` | ⚠️ PARTIAL | Duplicate of useGym.ts functions |
| `components/gym/GymList.tsx` | ✅ EXISTS | Simpler model |
| `components/gym/ExerciseList.tsx` | ✅ EXISTS | Maps to ProblemList in spec |
| `components/gym/ExerciseDetail.tsx` | ✅ EXISTS | Maps to ProblemDetail in spec |
| `components/gym/SubmissionUpload.tsx` | ✅ EXISTS | Maps to FileUploader in spec |
| `components/gym/SubmissionHistory.tsx` | ✅ EXISTS | Simpler model |
| `app/gym/[gymId]/page.tsx` | ✅ EXISTS | Wrong URL (should be `/gyms/[gymId]`) |
| `app/exercises/[exerciseId]/page.tsx` | ✅ EXISTS | Wrong URL (should be `/gyms/[gymId]/problems/[problemId]`) |

### Missing from Spec

- `/gyms` page (gym list)
- `/gyms/[gymId]/stages/[stageId]` page (stage detail)
- Stage-related components (StageCard, StageList)
- DifficultyStars, HintAccordion, PrerequisiteStatus, LockedContent components
- GymTypeFilter, ReviewDisplay, GymProgress, PublicSubmission components
- useStage, useProblem, useSubmissionHistory, usePublicSubmissions, useGymProgress, useFileUpload hooks
- problem.service.ts, submission.service.ts services
- E2E tests

---

## Phase 1: Types & Services

### FE-001: 定義 Gym 相關型別

**描述**: 建立 `types/gym.ts`，定義道館系統所需的所有 TypeScript 型別

**依賴**: 無

**實作狀態**: ⚠️ PARTIAL - Different architecture

**驗收標準**:

- [ ] 定義所有 Enum 型別 (GymType, SubmissionType, SubmissionStatus, ReviewStatus, PrerequisiteType)
  - ⚠️ Current: Difficulty, SubmissionStatus (different enums)
- [ ] 定義 Gym, GymDetail, GymSummary 介面
  - ⚠️ Current: Gym (simpler, number id, no thumbnailUrl, no type)
- [ ] 定義 StageSummary, StageDetail 介面
  - ❌ Not implemented (no Stage concept)
- [ ] 定義 ProblemSummary, ProblemDetail, Hint, ProblemNav 介面
  - ⚠️ Current: GymExercise, GymExerciseDetail (different model)
- [ ] 定義 Submission, SubmissionInfo, SubmissionDetail, ReviewInfo 介面
  - ⚠️ Current: GymSubmission (simpler model)
- [ ] 定義 PublicSubmission 介面
  - ❌ Not implemented
- [ ] 定義 GymProgressSummary, GymProgressItem 介面
  - ❌ Not implemented
- [ ] 定義 Request/Response 型別 (CreateSubmissionRequest, UploadUrlRequest, UploadUrlResponse, VisibilityUpdateRequest, PaginatedResponse)
  - ⚠️ Current: SubmitExerciseRequest, ReviewSubmissionRequest (different model)
- [ ] 定義 SUBMISSION_TYPE_CONFIG 常數物件
  - ❌ Not implemented
- [ ] 定義 PrerequisiteInfo 介面
  - ❌ Not implemented
- [ ] TypeScript 編譯通過，無型別錯誤
  - ✅ Current types compile

**工作量**: M

---

### FE-002: 實作 gym.service.ts

**描述**: 建立道館相關 API 服務

**依賴**: FE-001

**實作狀態**: ⚠️ PARTIAL - Different API endpoints

**驗收標準**:

- [ ] 實作 `getGyms(params?)` - 取得道館列表，支援 journeyId、type 篩選
  - ⚠️ Current: getGymsByJourney(journeyId) - different endpoint, no type filter
- [ ] 實作 `getGym(gymId)` - 取得道館詳情
  - ❌ Not implemented (current gets exercises, not gym detail)
- [ ] 實作 `getStage(gymId, stageId)` - 取得關卡詳情
  - ❌ Not implemented (no Stage concept)
- [ ] 正確處理 API 錯誤回應
  - ⚠️ Current: Basic error handling
- [ ] 使用專案既有的 api-client 進行請求
  - ❌ Current: Uses fetch directly, not api-client

**工作量**: S

---

### FE-003: 實作 problem.service.ts

**描述**: 建立題目相關 API 服務

**依賴**: FE-001

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 實作 `getProblem(problemId)` - 取得題目詳情
  - ⚠️ Current: getExerciseDetail in gym.service.ts (different endpoint)
- [ ] 實作 `getUploadUrl(data)` - 取得檔案上傳的 Signed URL
  - ❌ Not implemented
- [ ] 正確處理 401/403/404 錯誤
  - ❌ Not implemented
- [ ] 使用專案既有的 api-client 進行請求
  - ❌ Not implemented

**工作量**: S

---

### FE-004: 實作 submission.service.ts

**描述**: 建立提交相關 API 服務

**依賴**: FE-001

**實作狀態**: ⚠️ PARTIAL - In gym.service.ts

**驗收標準**:

- [ ] 實作 `createSubmission(problemId, data)` - 提交作答
  - ⚠️ Current: submitExercise in gym.service.ts (different signature)
- [ ] 實作 `getSubmissionHistory(problemId)` - 取得提交歷史
  - ⚠️ Current: getMySubmissions in gym.service.ts
- [ ] 實作 `getSubmission(submissionId)` - 取得單一提交詳情
  - ❌ Not implemented
- [ ] 實作 `updateVisibility(submissionId, isPublic)` - 更新公開設定
  - ❌ Not implemented
- [ ] 實作 `getPublicSubmissions(params?)` - 取得公開提交列表 (含分頁)
  - ❌ Not implemented
- [ ] 實作 `getGymProgress()` - 取得個人道館進度
  - ❌ Not implemented
- [ ] 正確處理各種錯誤狀態
  - ⚠️ Basic error handling only

**工作量**: M

---

## Phase 2: Hooks

### FE-005: 實作 useGymList hook

**描述**: 建立道館列表資料 hook

**依賴**: FE-002

**實作狀態**: ⚠️ PARTIAL - Different signature

**驗收標準**:

- [ ] 回傳 `{ gyms, isLoading, error, refetch }`
  - ✅ Current: useGyms returns this
- [ ] 支援 journeyId、type 篩選參數
  - ⚠️ Current: Only journeyId, no type filter
- [ ] 處理載入狀態
  - ✅ Implemented
- [ ] 處理錯誤狀態
  - ✅ Implemented
- [ ] 支援手動重新取得資料
  - ✅ Implemented

**工作量**: S

---

### FE-006: 實作 useGym hook

**描述**: 建立道館詳情資料 hook

**依賴**: FE-002

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 gymId 參數
- [ ] 回傳 `{ gym, isLoading, error, refetch }`
- [ ] 處理 404 錯誤

**工作量**: S

---

### FE-007: 實作 useStage hook

**描述**: 建立關卡詳情資料 hook

**依賴**: FE-002

**實作狀態**: ❌ NOT IMPLEMENTED (no Stage concept)

**驗收標準**:

- [ ] 接受 gymId, stageId 參數
- [ ] 回傳 `{ stage, isLoading, error, refetch }`
- [ ] 處理 403 (未購買) 和 404 錯誤

**工作量**: S

---

### FE-008: 實作 useProblem hook

**描述**: 建立題目詳情資料 hook

**依賴**: FE-003

**實作狀態**: ⚠️ PARTIAL - Different hook name

**驗收標準**:

- [ ] 接受 problemId 參數
  - ⚠️ Current: useExerciseDetail/useGymExerciseDetail accepts exerciseId
- [ ] 回傳 `{ problem, isLoading, error, refetch }`
  - ⚠️ Current: Returns exercise, not problem
- [ ] 處理 401/403/404 錯誤
  - ❌ Not implemented

**工作量**: S

---

### FE-009: 實作 useSubmission hook

**描述**: 建立提交作答 hook

**依賴**: FE-004

**實作狀態**: ⚠️ PARTIAL - Different signature

**驗收標準**:

- [ ] 接受 problemId 參數
  - ⚠️ Current: useSubmitExercise doesn't take problemId
- [ ] 回傳 `{ submit, isSubmitting, error }`
  - ⚠️ Current: Returns submitExercise(exerciseId, file)
- [ ] submit 函式接受 CreateSubmissionRequest 並回傳 Promise<Submission>
  - ⚠️ Current: Takes (exerciseId, file)
- [ ] 處理提交過程中的錯誤
  - ✅ Implemented

**工作量**: S

---

### FE-010: 實作 useSubmissionHistory hook

**描述**: 建立提交歷史資料 hook

**依賴**: FE-004

**實作狀態**: ⚠️ PARTIAL

**驗收標準**:

- [ ] 接受 problemId 參數
  - ⚠️ Current: useMySubmissions accepts exerciseId
- [ ] 回傳 `{ submissions, isLoading, error, updateVisibility, refetch }`
  - ⚠️ Current: No updateVisibility
- [ ] updateVisibility 可更新單一提交的公開設定
  - ❌ Not implemented
- [ ] 更新後自動刷新列表
  - ❌ Not implemented

**工作量**: S

---

### FE-011: 實作 usePublicSubmissions hook

**描述**: 建立公開提交列表資料 hook

**依賴**: FE-004

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 支援 gymId、problemId、page、size 參數
- [ ] 回傳 `{ submissions, pagination, isLoading, error, refetch }`
- [ ] pagination 包含 totalElements, totalPages, currentPage, pageSize

**工作量**: S

---

### FE-012: 實作 useGymProgress hook

**描述**: 建立個人道館進度資料 hook

**依賴**: FE-004

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 回傳 `{ progress, isLoading, error, refetch }`
- [ ] 需登入才能使用

**工作量**: S

---

### FE-013: 實作 useFileUpload hook

**描述**: 建立檔案上傳功能 hook

**依賴**: FE-003

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 回傳 `{ getUploadUrl, uploadFile, isUploading, progress, error }`
- [ ] getUploadUrl 取得 Signed URL
- [ ] uploadFile 直接上傳檔案到 storage，支援進度回報
- [ ] 處理上傳失敗錯誤

**工作量**: M

---

## Phase 3: Basic Components

### FE-014: 實作 DifficultyStars 元件

**描述**: 難度星星顯示元件

**依賴**: FE-001

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 difficulty (1-5)、maxStars (預設 5)、size ('sm'|'md'|'lg') props
- [ ] 正確顯示填滿與空心星星
- [ ] 支援三種尺寸

**工作量**: S

---

### FE-015: 實作 SubmissionTypeIcon 元件

**描述**: 提交類型圖示元件

**依賴**: FE-001

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 type: SubmissionType prop
- [ ] 根據 SUBMISSION_TYPE_CONFIG 顯示對應圖示
- [ ] 支援 tooltip 顯示類型名稱

**工作量**: S

---

### FE-016: 實作 PrerequisiteStatus 元件

**描述**: 前置條件狀態顯示元件

**依賴**: FE-001

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 prerequisites、showLinks props
- [ ] 顯示條件列表與完成狀態 (✓/✗)
- [ ] showLinks 為 true 時可點擊跳轉至對應 Lesson/Problem

**工作量**: S

---

### FE-017: 實作 LockedContent 元件

**描述**: 鎖定內容提示元件

**依賴**: FE-016

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 type ('purchase'|'prerequisite')、prerequisites、journeyId、message props
- [ ] type='purchase' 時顯示購買提示與按鈕
- [ ] type='prerequisite' 時顯示前置條件列表

**工作量**: S

---

### FE-018: 實作 HintAccordion 元件

**描述**: 提示摺疊面板元件

**依賴**: FE-001

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 hints: Hint[] prop
- [ ] 初始狀態全部收合
- [ ] 點擊可展開/收合單個提示
- [ ] 顯示「提示 1」「提示 2」等標題

**工作量**: S

---

### FE-019: 實作 ReviewDisplay 元件

**描述**: 批改結果顯示元件

**依賴**: FE-001

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 review: ReviewInfo、showReviewer props
- [ ] 顯示狀態標籤 (通過/需修改)
- [ ] 使用 Markdown 渲染批改內容
- [ ] 顯示批改者名稱與時間

**工作量**: S

---

### FE-020: 實作 GymCard 元件

**描述**: 道館卡片元件

**依賴**: FE-014

**實作狀態**: ⚠️ PARTIAL - In GymList component

**驗收標準**:

- [ ] 接受 gym: Gym、onClick props
  - ⚠️ Current: GymList renders cards inline
- [ ] 顯示縮圖、標題、類型標籤、所屬課程
  - ⚠️ Current: Simpler display (title, progress only)
- [ ] 顯示進度 (x/y 題完成) 與進度條
  - ✅ Implemented
- [ ] 未購買時顯示鎖定狀態
  - ❌ Not implemented

**工作量**: M

---

### FE-021: 實作 GymList 元件

**描述**: 道館列表元件

**依賴**: FE-020

**實作狀態**: ⚠️ PARTIAL

**驗收標準**:

- [ ] 接受 gyms: Gym[] prop
  - ✅ Implemented
- [ ] 依 journeyTitle 分組顯示
  - ❌ Not implemented
- [ ] 響應式網格佈局 (Desktop 4欄、Tablet 2-3欄、Mobile 1欄)
  - ⚠️ Has grid but not 4-column

**工作量**: S

---

### FE-022: 實作 GymTypeFilter 元件

**描述**: 道館類型篩選元件

**依賴**: FE-001

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 value、onChange props
- [ ] 提供「全部」「主線任務」「支線任務」選項
- [ ] 選中狀態視覺反饋

**工作量**: S

---

### FE-023: 實作 StageCard 元件

**描述**: 關卡卡片元件

**依賴**: FE-014, FE-016

**實作狀態**: ❌ NOT IMPLEMENTED (no Stage concept)

**驗收標準**:

- [ ] 接受 stage: StageSummary、gymId、isPurchased、onClick props
- [ ] 顯示標題、難度星星、進度
- [ ] 顯示解鎖狀態圖示
- [ ] 未解鎖時顯示前置條件

**工作量**: M

---

### FE-024: 實作 StageList 元件

**描述**: 關卡列表元件

**依賴**: FE-023

**實作狀態**: ❌ NOT IMPLEMENTED (no Stage concept)

**驗收標準**:

- [ ] 接受 stages: StageSummary[]、gymId、isPurchased props
- [ ] 垂直列表佈局
- [ ] 點擊可導航至關卡詳情頁

**工作量**: S

---

### FE-025: 實作 ProblemCard 元件

**描述**: 題目卡片元件

**依賴**: FE-014, FE-015

**實作狀態**: ⚠️ PARTIAL - ExerciseList renders cards inline

**驗收標準**:

- [ ] 接受 problem: ProblemSummary、gymId、onClick props
  - ⚠️ Current: ExerciseList has inline cards
- [ ] 顯示標題、難度星星、提交類型圖示
  - ⚠️ Current: Shows difficulty as badge, not stars
- [ ] 顯示完成狀態圖示
  - ✅ Shows submission status
- [ ] 顯示最新提交狀態標籤 (PENDING/REVIEWED/NEEDS_REVISION)
  - ⚠️ Current: Shows PENDING/APPROVED/REJECTED
- [ ] 未解鎖時顯示鎖定樣式
  - ❌ Not implemented

**工作量**: M

---

### FE-026: 實作 ProblemList 元件

**描述**: 題目列表元件

**依賴**: FE-025

**實作狀態**: ⚠️ PARTIAL - Named ExerciseList

**驗收標準**:

- [ ] 接受 problems: ProblemSummary[]、gymId props
  - ⚠️ Current: ExerciseList accepts exercises, gymId
- [ ] 垂直列表佈局
  - ✅ Implemented
- [ ] 點擊可導航至題目詳情頁
  - ✅ Implemented

**工作量**: S

---

### FE-027: 實作 ProblemDescription 元件

**描述**: 題目描述元件 (Markdown 渲染)

**依賴**: 無

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 content: string (Markdown) prop
- [ ] 正確渲染 Markdown 內容
- [ ] 支援程式碼區塊高亮

**工作量**: S

---

### FE-028: 實作 SubmissionCard 元件

**描述**: 提交記錄卡片元件

**依賴**: FE-019

**實作狀態**: ⚠️ PARTIAL - In SubmissionHistory

**驗收標準**:

- [ ] 接受 submission: Submission、onVisibilityChange props
  - ⚠️ Current: SubmissionHistory renders inline
- [ ] 顯示版本號、提交時間、檔案名稱、狀態
  - ⚠️ Current: No version number
- [ ] 有批改結果時顯示 ReviewDisplay
  - ⚠️ Current: Shows feedback inline
- [ ] 公開設定開關
  - ❌ Not implemented

**工作量**: M

---

### FE-029: 實作 SubmissionHistory 元件

**描述**: 提交歷史列表元件

**依賴**: FE-028

**實作狀態**: ⚠️ PARTIAL

**驗收標準**:

- [ ] 接受 submissions: Submission[]、onVisibilityChange props
  - ⚠️ Current: No onVisibilityChange
- [ ] 依版本號降序排列
  - ⚠️ Current: No version concept
- [ ] 空狀態顯示「尚無提交記錄」
  - ✅ Implemented

**工作量**: S

---

### FE-030: 實作 GymProgressCard 元件

**描述**: 道館進度卡片元件

**依賴**: FE-001

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 progress: GymProgressItem prop
- [ ] 顯示道館名稱、類型、進度比例
- [ ] 顯示進度條與百分比
- [ ] 顯示待批改數量

**工作量**: S

---

### FE-031: 實作 GymProgress 元件

**描述**: 道館進度統計元件

**依賴**: FE-030

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 progress: GymProgressSummary prop
- [ ] 顯示總覽統計 (完成道館數、完成題目數、待批改數)
- [ ] 顯示各道館進度卡片列表

**工作量**: S

---

### FE-032: 實作 PublicSubmissionCard 元件

**描述**: 公開提交卡片元件

**依賴**: FE-019

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 submission: PublicSubmission prop
- [ ] 顯示用戶頭像、名稱
- [ ] 顯示題目與道館名稱
- [ ] 顯示提交狀態與批改結果

**工作量**: S

---

### FE-033: 實作 PublicSubmissionList 元件

**描述**: 公開提交列表元件

**依賴**: FE-032, FE-011

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 接受 gymId、problemId props (可選篩選)
- [ ] 使用 usePublicSubmissions hook
- [ ] 支援分頁功能
- [ ] 空狀態處理

**工作量**: M

---

## Phase 4: Page Components

### FE-034: 實作 /gyms 道館列表頁面

**描述**: 道館列表頁面

**依賴**: FE-005, FE-021, FE-022

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 使用 useGymList hook 取得資料
- [ ] 整合 GymTypeFilter 篩選功能
- [ ] 整合 GymList 顯示道館
- [ ] 處理載入狀態
- [ ] 點擊道館卡片導航至道館詳情頁

**工作量**: M

---

### FE-035: 實作 /gyms/[gymId] 道館詳情頁面

**描述**: 道館詳情頁面

**依賴**: FE-006, FE-024, FE-017

**實作狀態**: ⚠️ PARTIAL - Wrong URL (/gym/[gymId])

**驗收標準**:

- [ ] 使用 useGym hook 取得資料
  - ⚠️ Current: Uses useGymExercises (different data)
- [ ] 顯示道館資訊 (標題、描述、類型、進度)
  - ⚠️ Current: Shows exercise list, not gym info
- [ ] 整合 StageList 顯示關卡列表
  - ❌ Current: Shows ExerciseList (no Stage concept)
- [ ] 未購買時顯示 LockedContent
  - ❌ Not implemented
- [ ] 顯示同課程其他道館
  - ❌ Not implemented
- [ ] 返回道館列表連結
  - ❌ Not implemented

**工作量**: M

---

### FE-036: 實作 /gyms/[gymId]/stages/[stageId] 關卡詳情頁面

**描述**: 關卡詳情頁面

**依賴**: FE-007, FE-026, FE-017

**實作狀態**: ❌ NOT IMPLEMENTED (no Stage concept)

**驗收標準**:

- [ ] 使用 useStage hook 取得資料
- [ ] 顯示關卡資訊 (標題、難度、描述、進度)
- [ ] 整合 ProblemList 顯示題目列表
- [ ] 關卡未解鎖時顯示 LockedContent
- [ ] 返回道館詳情連結

**工作量**: M

---

### FE-037: 實作 /gyms/[gymId]/problems/[problemId] 題目詳情頁面

**描述**: 題目詳情頁面

**依賴**: FE-008, FE-010, FE-018, FE-027, FE-029, FE-038, FE-017

**實作狀態**: ⚠️ PARTIAL - Wrong URL (/exercises/[exerciseId])

**驗收標準**:

- [ ] 使用 useProblem 和 useSubmissionHistory hooks
  - ⚠️ Current: Uses useGymExerciseDetail
- [ ] Tab 切換「題目描述」與「提交歷史」
  - ⚠️ Current: Shows both in single view
- [ ] 顯示題目資訊 (標題、難度、經驗值)
  - ⚠️ Current: No experience points
- [ ] 整合 ProblemDescription 渲染題目內容
  - ⚠️ Current: Plain text description
- [ ] 整合 HintAccordion 顯示提示
  - ❌ Not implemented
- [ ] 整合 SubmissionForm 提交作答
  - ⚠️ Current: Has SubmissionUpload (simpler)
- [ ] 整合 SubmissionHistory 顯示提交記錄
  - ✅ Implemented
- [ ] 上一題/下一題導航
  - ❌ Not implemented
- [ ] 題目未解鎖時顯示 LockedContent
  - ❌ Not implemented
- [ ] 響應式設計 (Desktop 雙欄、Mobile 單欄 Tab)
  - ⚠️ Current: Single column only

**工作量**: L

---

### FE-038: 實作 SubmissionForm 元件

**描述**: 作答提交表單元件

**依賴**: FE-009, FE-039

**實作狀態**: ⚠️ PARTIAL - Named SubmissionUpload

**驗收標準**:

- [ ] 接受 problemId、allowedTypes、onSubmitSuccess props
  - ⚠️ Current: Different props
- [ ] 整合 FileUploader 元件
  - ⚠️ Current: Has file input
- [ ] 檔案類型驗證
  - ❌ Not implemented
- [ ] 檔案大小驗證
  - ❌ Not implemented
- [ ] 公開設定選項 (checkbox)
  - ❌ Not implemented
- [ ] 提交按鈕與載入狀態
  - ✅ Implemented
- [ ] 成功時呼叫 onSubmitSuccess 並顯示 Toast
  - ⚠️ Partial

**工作量**: M

---

### FE-039: 實作 FileUploader 元件

**描述**: 檔案上傳元件

**依賴**: FE-013

**實作狀態**: ⚠️ PARTIAL - In SubmissionUpload

**驗收標準**:

- [ ] 接受 allowedTypes、onFileSelect、isUploading、uploadProgress、error props
  - ⚠️ Current: Simpler props
- [ ] 拖放區域支援
  - ❌ Not implemented
- [ ] 點擊選擇檔案
  - ✅ Implemented
- [ ] 顯示允許的檔案類型與大小限制
  - ❌ Not implemented
- [ ] 上傳進度條
  - ❌ Not implemented
- [ ] 錯誤訊息顯示
  - ⚠️ Basic only

**工作量**: M

---

### FE-040: 實作 ProblemDetail 元件

**描述**: 題目詳情容器元件

**依賴**: FE-027, FE-014, FE-018

**實作狀態**: ⚠️ PARTIAL - Named ExerciseDetail

**驗收標準**:

- [ ] 接受 problem: ProblemDetail prop
  - ⚠️ Current: Takes exercise
- [ ] 組合顯示標題、難度、經驗值
  - ⚠️ Current: No experience points
- [ ] 整合 ProblemDescription
  - ⚠️ Current: Plain text
- [ ] 整合 HintAccordion
  - ❌ Not implemented

**工作量**: S

---

### FE-041: 實作 /my/gym-progress 個人道館進度頁面

**描述**: 個人道館進度頁面

**依賴**: FE-012, FE-031

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 使用 useGymProgress hook 取得資料
- [ ] 整合 GymProgress 元件顯示統計與列表
- [ ] 未登入時導向登入頁
- [ ] 處理載入狀態

**工作量**: S

---

### FE-042: 建立 components/gym/index.ts 匯出檔

**描述**: 建立元件匯出索引檔

**依賴**: FE-014 ~ FE-033, FE-038 ~ FE-040

**實作狀態**: ✅ EXISTS (for current components)

**驗收標準**:

- [ ] 匯出所有 gym 相關元件
  - ⚠️ Current: Exports existing components only
- [ ] 可透過 `@/components/gym` 引入
  - ✅ Implemented

**工作量**: S

---

## Phase 5: File Upload Feature

### FE-043: 實作 Signed URL 上傳流程

**描述**: 完整實作使用 Signed URL 的檔案上傳流程

**依賴**: FE-013, FE-038, FE-039

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 選擇檔案後呼叫 getUploadUrl 取得 Signed URL
- [ ] 使用 Signed URL 直接上傳至 Storage
- [ ] 上傳完成後呼叫 createSubmission 建立提交記錄
- [ ] 上傳進度即時更新
- [ ] 上傳失敗時顯示錯誤並可重試
- [ ] 整合至 SubmissionForm

**工作量**: M

---

### FE-044: 實作 Direct Multipart 上傳備用方案

**描述**: 實作直接 multipart/form-data 上傳作為備用

**依賴**: FE-004, FE-038

**實作狀態**: ✅ IMPLEMENTED (current approach)

**驗收標準**:

- [x] 當 Signed URL 方式失敗時自動切換
  - ⚠️ Current: Only multipart is implemented
- [x] 直接使用 multipart/form-data 上傳
  - ✅ Implemented
- [x] 維持相同的使用者體驗
  - ✅ Works

**工作量**: S

---

## Phase 6: E2E Tests

### FE-045: E2E 測試 - 瀏覽道館列表

**描述**: 測試案例 1 - 已登入用戶瀏覽道館列表

**依賴**: FE-034

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 用戶已登入且已購買課程
- [ ] 進入道館列表頁面
- [ ] 看到道館卡片與進度資訊
- [ ] 可篩選主線/支線任務

**工作量**: S

---

### FE-046: E2E 測試 - 查看關卡與題目

**描述**: 測試案例 2 - 用戶查看關卡題目列表

**依賴**: FE-035, FE-036

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 用戶已登入並購買課程
- [ ] 點擊道館卡片進入道館詳情
- [ ] 看到關卡列表
- [ ] 點擊關卡進入關卡詳情
- [ ] 看到題目列表與完成狀態

**工作量**: S

---

### FE-047: E2E 測試 - 提交作答

**描述**: 測試案例 3 - 用戶提交 PDF 作答

**依賴**: FE-037, FE-043

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 用戶已登入並購買課程
- [ ] 題目允許 PDF 格式
- [ ] 進入題目詳情頁
- [ ] 上傳 PDF 檔案
- [ ] 點擊提交作答
- [ ] 顯示提交成功訊息
- [ ] 題目狀態變為待批改

**工作量**: M

---

### FE-048: E2E 測試 - 查看批改結果

**描述**: 測試案例 4 - 用戶查看已批改的提交

**依賴**: FE-037

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 用戶有一筆已批改的提交
- [ ] 進入題目詳情頁
- [ ] 切換到提交歷史 tab
- [ ] 看到批改結果
- [ ] 顯示批改者名稱與時間

**工作量**: S

---

### FE-049: E2E 測試 - 前置條件鎖定

**描述**: 測試案例 5 - 題目因前置條件未完成而鎖定

**依賴**: FE-037

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 題目 B 的前置條件是完成題目 A
- [ ] 用戶尚未完成題目 A
- [ ] 嘗試進入題目 B
- [ ] 顯示題目鎖定提示
- [ ] 顯示需完成的前置條件
- [ ] 提供跳轉至前置題目的連結

**工作量**: S

---

### FE-050: E2E 測試 - 未購買課程

**描述**: 測試案例 6 - 未購買用戶嘗試查看題目

**依賴**: FE-037

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 用戶未購買課程
- [ ] 嘗試進入題目詳情頁
- [ ] 顯示購買課程以解鎖提示
- [ ] 提供購買按鈕

**工作量**: S

---

### FE-051: E2E 測試 - 重新提交作答

**描述**: 測試案例 7 - 用戶重新提交需修改的作答

**依賴**: FE-037, FE-043

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 用戶的前次提交被標記為需修改
- [ ] 上傳新版本檔案
- [ ] 點擊提交作答
- [ ] 建立版本 2 的提交
- [ ] 保留版本 1 的記錄

**工作量**: S

---

### FE-052: E2E 測試 - 設定提交公開

**描述**: 測試案例 8 - 用戶公開自己的批改結果

**依賴**: FE-037

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 用戶有一筆已批改的提交
- [ ] 在提交歷史中打開公開開關
- [ ] 該提交可被其他學員在公開列表中看到

**工作量**: S

---

### FE-053: E2E 測試 - 查看公開提交

**描述**: 測試案例 9 - 用戶查看其他學員的公開提交

**依賴**: FE-033

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 有其他學員公開了提交
- [ ] 進入公開提交列表
- [ ] 看到其他學員的提交與批改結果

**工作量**: S

---

### FE-054: E2E 測試 - 檔案類型驗證

**描述**: 測試案例 10 - 用戶上傳不允許的檔案類型

**依賴**: FE-037, FE-039

**實作狀態**: ❌ NOT IMPLEMENTED

**驗收標準**:

- [ ] 題目只允許 PDF 格式
- [ ] 嘗試上傳 .docx 檔案
- [ ] 顯示檔案類型不允許錯誤訊息
- [ ] 無法提交

**工作量**: S

---

## Task Summary

| Phase | Task Count | Spec Status | Implementation Status |
|-------|------------|-------------|----------------------|
| Phase 1: Types & Services | 4 | Defined | ⚠️ PARTIAL (wrong model) |
| Phase 2: Hooks | 9 | Defined | ⚠️ PARTIAL (4/9 exist with different signatures) |
| Phase 3: Basic Components | 20 | Defined | ⚠️ PARTIAL (5/20 exist with different model) |
| Phase 4: Page Components | 9 | Defined | ⚠️ PARTIAL (2/9 exist with wrong URLs) |
| Phase 5: File Upload | 2 | Defined | ⚠️ PARTIAL (multipart only) |
| Phase 6: E2E Tests | 10 | Defined | ❌ NOT STARTED |
| **Total** | **54** | - | **~20% complete (wrong architecture)** |

## Implementation Decision Required

Before proceeding, a decision must be made:

### Option A: Rewrite Frontend to Match Spec
- **Effort**: HIGH (essentially rewrite most frontend code)
- **Pros**: Matches spec exactly, 3-level hierarchy (Gym→Stage→Problem), more features
- **Cons**: Significant effort, may require backend API changes

### Option B: Update Spec to Match Implementation  
- **Effort**: LOW (update documentation only)
- **Pros**: Quick, uses existing working code
- **Cons**: Simpler 2-level hierarchy (Gym→Exercise), fewer features

### Option C: Incremental Migration
- **Effort**: MEDIUM
- **Steps**:
  1. Fix URL structure (`/gym/` → `/gyms/`)
  2. Add missing features incrementally
  3. Keep 2-level model but add spec features (hints, prerequisites, etc.)

## Dependency Graph

```
Phase 1 (Types & Services)
FE-001 ─┬─> FE-002 ─┬─> FE-005, FE-006, FE-007
        ├─> FE-003 ─┼─> FE-008, FE-013
        └─> FE-004 ─┴─> FE-009, FE-010, FE-011, FE-012

Phase 2 (Hooks)
FE-005 ~ FE-013 (依賴 Phase 1)

Phase 3 (Basic Components)
FE-014 ──> FE-020, FE-023, FE-025, FE-040
FE-015 ──> FE-025
FE-016 ──> FE-017, FE-023
FE-019 ──> FE-028, FE-032
FE-020 ──> FE-021
FE-023 ──> FE-024
FE-025 ──> FE-026
FE-028 ──> FE-029
FE-030 ──> FE-031
FE-032, FE-011 ──> FE-033

Phase 4 (Page Components)
FE-005, FE-021, FE-022 ──> FE-034
FE-006, FE-024, FE-017 ──> FE-035
FE-007, FE-026, FE-017 ──> FE-036
FE-008, FE-010, FE-018, FE-027, FE-029, FE-038, FE-017 ──> FE-037
FE-009, FE-039 ──> FE-038
FE-013 ──> FE-039
FE-027, FE-014, FE-018 ──> FE-040
FE-012, FE-031 ──> FE-041

Phase 5 (File Upload)
FE-013, FE-038, FE-039 ──> FE-043
FE-004, FE-038 ──> FE-044

Phase 6 (E2E Tests)
依賴對應的 Page Components
```
