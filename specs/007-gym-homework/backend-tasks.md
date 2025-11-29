# Backend Tasks: Gym Homework System

## Overview

道館作業系統後端開發任務清單，包含資料庫遷移、實體定義、服務層實作、API 開發與整合測試。

**估計總工時**：約 10-12 人天

---

## Phase 1: Database & Entities

### BE-001: 建立 Gym 資料庫遷移

**描述**：建立 gyms、stages、problems 核心資料表的 Flyway 遷移腳本。

**依賴任務**：無

**工作量**：M

**驗收標準**：

- [ ] 建立 `V{version}__create_gym_tables.sql` 遷移腳本
- [ ] gyms 表包含所有必要欄位 (id, journey_id, title, description, thumbnail_url, gym_type, sort_order, is_published, timestamps)
- [ ] stages 表包含所有必要欄位 (id, gym_id, title, description, difficulty, sort_order, timestamps)
- [ ] problems 表包含所有必要欄位 (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order, timestamps)
- [ ] 正確建立外鍵約束 (gyms -> journeys, stages -> gyms, problems -> stages)
- [ ] 建立必要的索引
- [ ] 執行 `./mvnw flyway:migrate` 成功

---

### BE-002: 建立 Prerequisites 資料庫遷移

**描述**：建立關卡和題目前置條件的資料表。

**依賴任務**：BE-001

**工作量**：M

**驗收標準**：

- [ ] 建立 `V{version}__create_prerequisite_tables.sql` 遷移腳本
- [ ] stage_prerequisites 表包含 (id, stage_id, prerequisite_lesson_id, prerequisite_problem_id, timestamps)
- [ ] problem_prerequisites 表包含 (id, problem_id, prerequisite_lesson_id, prerequisite_problem_id, timestamps)
- [ ] 正確建立外鍵約束
- [ ] 實作 CHECK 約束確保 lesson_id 和 problem_id 只能擇一填寫
- [ ] 實作 CHECK 約束確保 problem_prerequisites 不能指向自己
- [ ] 建立 UNIQUE 約束防止重複前置條件
- [ ] 建立必要的索引

---

### BE-003: 建立 Submission & Review 資料庫遷移

**描述**：建立提交記錄和批改記錄的資料表。

**依賴任務**：BE-001

**工作量**：M

**驗收標準**：

- [ ] 建立 `V{version}__create_submission_tables.sql` 遷移腳本
- [ ] submissions 表包含所有必要欄位 (id, user_id, problem_id, file_url, file_type, file_name, file_size_bytes, status, is_public, version, timestamps)
- [ ] reviews 表包含所有必要欄位 (id, submission_id, reviewer_id, content, status, reviewed_at)
- [ ] 正確建立外鍵約束 (submissions -> users, problems; reviews -> submissions, users)
- [ ] 建立必要的索引 (user_id, problem_id, status, is_public)

---

### BE-004: 建立 Enum 定義

**描述**：建立道館系統所需的列舉類型。

**依賴任務**：無

**工作量**：S

**驗收標準**：

- [ ] 建立 `GymType` 列舉 (MAIN_QUEST, SIDE_QUEST)
- [ ] 建立 `SubmissionType` 列舉 (PDF, MP4, CODE, IMAGE)
- [ ] 建立 `SubmissionStatus` 列舉 (PENDING, REVIEWED, NEEDS_REVISION)
- [ ] 建立 `ReviewStatus` 列舉 (APPROVED, NEEDS_REVISION)
- [ ] 建立 `PrerequisiteType` 列舉 (LESSON, PROBLEM)
- [ ] 所有列舉放置於 `entity/` package 下

---

### BE-005: 建立 Gym、Stage、Problem 實體

**描述**：建立道館核心三層架構的 JPA 實體類別。

**依賴任務**：BE-001, BE-004

**工作量**：M

**驗收標準**：

- [ ] 建立 `Gym` 實體，正確映射所有欄位
- [ ] 建立 `Stage` 實體，包含 @ManyToOne 關聯到 Gym
- [ ] 建立 `Problem` 實體，包含 @ManyToOne 關聯到 Stage
- [ ] Problem 實體正確處理 submission_types (VARCHAR[]) 和 hints (JSONB) 欄位
- [ ] 使用 Lombok 簡化 getter/setter
- [ ] 正確設定 JPA 關聯的 fetch 策略

---

### BE-006: 建立 Prerequisites 實體

**描述**：建立關卡和題目前置條件的 JPA 實體類別。

**依賴任務**：BE-002, BE-005

**工作量**：S

**驗收標準**：

- [ ] 建立 `StagePrerequisite` 實體
- [ ] 建立 `ProblemPrerequisite` 實體
- [ ] 正確設定與 Stage、Problem、Lesson 的關聯
- [ ] 兩個實體都能處理 lesson_id 或 problem_id 二擇一的情況

---

### BE-007: 建立 Submission & Review 實體

**描述**：建立提交記錄和批改記錄的 JPA 實體類別。

**依賴任務**：BE-003, BE-004

**工作量**：M

**驗收標準**：

- [ ] 建立 `Submission` 實體，正確映射所有欄位
- [ ] 建立 `Review` 實體，正確映射所有欄位
- [ ] Submission 包含 @ManyToOne 關聯到 User 和 Problem
- [ ] Review 包含 @ManyToOne 關聯到 Submission 和 User (reviewer)
- [ ] Submission 包含 @OneToMany 關聯到 Review (一個 submission 可能有多次 review)

---

## Phase 2: Core Services

### BE-008: 建立 Repository 介面

**描述**：建立所有資料存取層的 Repository 介面。

**依賴任務**：BE-005, BE-006, BE-007

**工作量**：M

**驗收標準**：

- [ ] 建立 `GymRepository` 繼承 JpaRepository
- [ ] 建立 `StageRepository` 繼承 JpaRepository
- [ ] 建立 `StagePrerequisiteRepository` 繼承 JpaRepository
- [ ] 建立 `ProblemRepository` 繼承 JpaRepository
- [ ] 建立 `ProblemPrerequisiteRepository` 繼承 JpaRepository
- [ ] 建立 `SubmissionRepository` 繼承 JpaRepository
- [ ] 建立 `ReviewRepository` 繼承 JpaRepository
- [ ] 各 Repository 加入必要的查詢方法 (findByJourneyId, findByGymId, findByUserId 等)

---

### BE-009: 實作 GymService

**描述**：實作道館相關的業務邏輯。

**依賴任務**：BE-008

**工作量**：M

**驗收標準**：

- [ ] 實作 `getGymList(UUID journeyId, GymType type, UUID userId)` 方法
- [ ] 實作 `getGymDetail(UUID gymId, UUID userId)` 方法
- [ ] 回傳資料包含關卡數量、題目數量、完成數量統計
- [ ] 回傳資料包含課程購買狀態
- [ ] 回傳資料包含同課程的其他道館 (relatedGyms)

---

### BE-010: 實作 StageService

**描述**：實作關卡相關的業務邏輯。

**依賴任務**：BE-008

**工作量**：M

**驗收標準**：

- [ ] 實作 `getStageDetail(UUID gymId, UUID stageId, UUID userId)` 方法
- [ ] 回傳資料包含題目列表 (需檢查購買狀態)
- [ ] 回傳資料包含解鎖狀態 (isUnlocked)
- [ ] 回傳資料包含前置條件資訊

---

### BE-011: 實作 ProblemService

**描述**：實作題目相關的業務邏輯。

**依賴任務**：BE-008

**工作量**：M

**驗收標準**：

- [ ] 實作 `getProblemDetail(UUID problemId, UUID userId)` 方法
- [ ] 回傳資料包含完整題目資訊 (description, hints, submissionTypes)
- [ ] 回傳資料包含最新提交資訊 (latestSubmission)
- [ ] 回傳資料包含上一題/下一題導覽資訊
- [ ] 回傳資料包含解鎖狀態和前置條件

---

### BE-012: 實作 PrerequisiteService

**描述**：實作前置條件檢查的業務邏輯。

**依賴任務**：BE-008

**工作量**：M

**驗收標準**：

- [ ] 實作 `getStagePrerequisites(UUID stageId, UUID userId)` 方法
- [ ] 實作 `getProblemPrerequisites(UUID problemId, UUID userId)` 方法
- [ ] 實作 `isStageUnlocked(UUID stageId, UUID userId)` 方法
- [ ] 實作 `isProblemUnlocked(UUID problemId, UUID userId)` 方法
- [ ] LESSON 類型前置條件：檢查 lesson_progress.is_completed
- [ ] PROBLEM 類型前置條件：檢查是否有該題目的 submission 記錄
- [ ] 回傳前置條件列表包含完成狀態

---

### BE-013: 實作 GymAccessControlService

**描述**：實作道館存取權限控制的業務邏輯。

**依賴任務**：BE-008, BE-012

**工作量**：M

**驗收標準**：

- [ ] 實作 `canViewProblemDetail(UUID problemId, UUID userId)` 方法
- [ ] 實作 `canSubmitAnswer(UUID problemId, UUID userId)` 方法
- [ ] 未購買 Journey：不可看 Problem 詳情、不可提交
- [ ] 已購買但未解鎖：不可看 Problem 詳情、不可提交
- [ ] 已購買且已解鎖：可看詳情、可提交
- [ ] 整合 PrerequisiteService 進行解鎖判斷

---

### BE-014: 實作 SubmissionService

**描述**：實作提交作答相關的業務邏輯。

**依賴任務**：BE-008, BE-013

**工作量**：L

**驗收標準**：

- [ ] 實作 `createSubmission(UUID problemId, UUID userId, SubmissionRequest request)` 方法
- [ ] 實作 `getSubmissionHistory(UUID problemId, UUID userId)` 方法
- [ ] 實作 `getSubmissionDetail(UUID submissionId, UUID userId)` 方法
- [ ] 實作 `updateVisibility(UUID submissionId, UUID userId, boolean isPublic)` 方法
- [ ] 實作 `getPublicSubmissions(UUID problemId, UUID gymId, Pageable pageable)` 方法
- [ ] 實作 `getUserProgress(UUID userId)` 方法
- [ ] 重複提交時自動遞增 version
- [ ] 驗證檔案類型符合題目允許的 submissionTypes
- [ ] 驗證檔案大小符合限制

---

## Phase 3: API Layer

### BE-015: 建立 Request/Response DTO

**描述**：建立所有 API 請求和回應的資料傳輸物件。

**依賴任務**：BE-004

**工作量**：M

**驗收標準**：

- [ ] 建立 Request DTOs:
  - `SubmissionRequest` (file, isPublic)
  - `UploadUrlRequest` (problemId, fileName, fileType, fileSizeBytes)
  - `VisibilityUpdateRequest` (isPublic)
- [ ] 建立 Response DTOs:
  - `GymListResponse` (id, journeyId, journeyTitle, title, description, thumbnailUrl, type, stageCount, problemCount, completedCount, isPurchased)
  - `GymDetailResponse` (包含 stages, relatedGyms)
  - `StageSummaryResponse` (id, title, description, difficulty, problemCount, completedCount, isUnlocked, prerequisites)
  - `StageDetailResponse` (包含 problems)
  - `ProblemSummaryResponse` (id, title, difficulty, submissionTypes, isCompleted, isUnlocked, submissionStatus)
  - `ProblemDetailResponse` (完整題目資訊，包含 hints, latestSubmission, navigation)
  - `SubmissionResponse` (提交資訊，包含 review)
  - `ReviewResponse` (批改資訊)
  - `PrerequisiteInfoResponse` (type, id, title, isCompleted)
  - `UploadUrlResponse` (uploadUrl, fileKey, expiresAt)
  - `GymProgressResponse` (總覽統計)
- [ ] 所有 DTO 使用 Java Record 或 Lombok

---

### BE-016: 實作 GymController

**描述**：實作道館相關的 REST API 端點。

**依賴任務**：BE-009, BE-010, BE-015

**工作量**：M

**驗收標準**：

- [ ] 實作 `GET /api/gyms` - 道館列表
  - 支援 journeyId 篩選
  - 支援 type 篩選
  - 登入時回傳個人進度
- [ ] 實作 `GET /api/gyms/{gymId}` - 道館詳情
  - 包含關卡列表
  - 包含同課程其他道館
- [ ] 實作 `GET /api/gyms/{gymId}/stages/{stageId}` - 關卡詳情
  - 包含題目列表
  - 未購買時隱藏題目詳情
- [ ] 正確處理 404 (道館/關卡不存在)
- [ ] 正確處理 403 (未購買課程)

---

### BE-017: 實作 ProblemController

**描述**：實作題目相關的 REST API 端點。

**依賴任務**：BE-011, BE-014, BE-015

**工作量**：M

**驗收標準**：

- [ ] 實作 `GET /api/problems/{problemId}` - 題目詳情
  - 包含完整描述、提示、提交類型
  - 包含最新提交資訊
  - 包含上下題導覽
- [ ] 實作 `POST /api/problems/{problemId}/submissions` - 提交作答
  - 支援 multipart/form-data 上傳
  - 驗證檔案類型和大小
- [ ] 實作 `GET /api/problems/{problemId}/submissions` - 提交歷史
- [ ] 正確處理 401 (未登入)
- [ ] 正確處理 403 (未購買/未解鎖)
- [ ] 正確處理 404 (題目不存在)

---

### BE-018: 實作 SubmissionController

**描述**：實作提交記錄相關的 REST API 端點。

**依賴任務**：BE-014, BE-015

**工作量**：M

**驗收標準**：

- [ ] 實作 `GET /api/submissions/{submissionId}` - 提交詳情
  - 自己的提交：完整資訊
  - 他人公開提交：完整資訊
  - 他人非公開提交：403
- [ ] 實作 `PATCH /api/submissions/{submissionId}/visibility` - 更新公開設定
  - 只能修改自己的提交
- [ ] 實作 `GET /api/submissions/public` - 公開提交列表
  - 支援 problemId 篩選
  - 支援 gymId 篩選
  - 支援分頁
- [ ] 實作 `GET /api/my/gym-progress` - 個人進度總覽

---

### BE-019: 實作 FileUploadController

**描述**：實作檔案上傳相關的 REST API 端點。

**依賴任務**：BE-013, BE-015

**工作量**：M

**驗收標準**：

- [ ] 實作 `POST /api/upload/submission` - 取得上傳 URL
  - 驗證 problemId 存在
  - 驗證使用者有權限提交
  - 驗證檔案類型符合題目要求
  - 驗證檔案大小符合限制
  - 回傳 signed URL 和 file key
- [ ] 正確處理 400 (檔案類型/大小不符)
- [ ] 正確處理 401 (未登入)
- [ ] 正確處理 403 (未購買課程)

---

## Phase 4: File Storage Infrastructure

### BE-020: 建立 FileStorageService 介面

**描述**：定義檔案儲存服務的抽象介面。

**依賴任務**：無

**工作量**：S

**驗收標準**：

- [ ] 建立 `infrastructure/storage/` package
- [ ] 定義 `FileStorageService` 介面
  - `generateUploadUrl(String fileKey, String contentType, long fileSizeBytes): UploadUrlResult`
  - `getDownloadUrl(String fileKey): String`
  - `deleteFile(String fileKey): void`
- [ ] 定義 `UploadUrlResult` record (uploadUrl, fileKey, expiresAt, headers)
- [ ] 定義 `StorageProperties` 配置類別

---

### BE-021: 實作 LocalFileStorage

**描述**：實作本地檔案儲存 (開發環境預設)。

**依賴任務**：BE-020

**工作量**：M

**驗收標準**：

- [ ] 實作 `LocalFileStorage` 類別
- [ ] generateUploadUrl 回傳內部上傳端點 `/api/files/upload/{fileKey}`
- [ ] getDownloadUrl 回傳靜態檔案路徑 `/files/{fileKey}`
- [ ] 實作實際的檔案儲存邏輯 (寫入 ./uploads 目錄)
- [ ] 實作檔案刪除邏輯
- [ ] 建立本地檔案上傳端點 `POST /api/files/upload/{fileKey}`
- [ ] 配置靜態資源 serving (`/files/**`)

---

### BE-022: 實作 SupabaseStorage

**描述**：實作 Supabase Storage 整合。

**依賴任務**：BE-020

**工作量**：M

**驗收標準**：

- [ ] 實作 `SupabaseStorage` 類別
- [ ] 正確產生 Supabase signed upload URL
- [ ] 正確產生 Supabase signed download URL
- [ ] 實作檔案刪除 API 呼叫
- [ ] 處理 Supabase API 錯誤

---

### BE-023: 實作 S3Storage (可選)

**描述**：實作 AWS S3 整合。

**依賴任務**：BE-020

**工作量**：M

**驗收標準**：

- [ ] 實作 `S3Storage` 類別
- [ ] 使用 AWS SDK 產生 presigned URL
- [ ] 正確設定 bucket 和 region
- [ ] 實作檔案刪除

---

### BE-024: 實作 StorageConfig

**描述**：實作儲存 Provider 的自動配置。

**依賴任務**：BE-021, BE-022

**工作量**：S

**驗收標準**：

- [ ] 建立 `StorageConfig` 配置類別
- [ ] 使用 `@ConditionalOnProperty` 根據 `app.storage.provider` 選擇實作
- [ ] 預設使用 `local` provider
- [ ] 在 `application.yml` 加入儲存配置範例
- [ ] 在 `application-test.yml` 使用 local storage

---

## Phase 5: Integration Tests

### BE-025: 建立測試資料 SQL Script

**描述**：建立整合測試所需的測試資料。

**依賴任務**：BE-001, BE-002, BE-003

**工作量**：M

**驗收標準**：

- [ ] 建立 `test/resources/sql/gym-test-data.sql`
- [ ] 包含測試用 Journey、Gym、Stage、Problem 資料
- [ ] 包含前置條件設定 (LESSON 和 PROBLEM 類型)
- [ ] 包含測試用 User 和 Purchase 資料
- [ ] 包含測試用 Submission 和 Review 資料
- [ ] 資料足以覆蓋所有測試場景

---

### BE-026: 實作 GymController 整合測試

**描述**：測試道館相關 API 端點。

**依賴任務**：BE-016, BE-025

**工作量**：M

**驗收標準**：

- [ ] 測試 GET /api/gyms - 已購買用戶
- [ ] 測試 GET /api/gyms - 未購買用戶
- [ ] 測試 GET /api/gyms?journeyId={id} - 篩選特定課程
- [ ] 測試 GET /api/gyms/{gymId} - 正常情況
- [ ] 測試 GET /api/gyms/{gymId} - 道館不存在 (404)
- [ ] 測試 GET /api/gyms/{gymId}/stages/{stageId} - 正常情況
- [ ] 測試 GET /api/gyms/{gymId}/stages/{stageId} - 未購買 (403)
- [ ] 所有測試繼承 BaseIntegrationTest

---

### BE-027: 實作 ProblemController 整合測試

**描述**：測試題目相關 API 端點。

**依賴任務**：BE-017, BE-025

**工作量**：M

**驗收標準**：

- [ ] 測試 GET /api/problems/{problemId} - 已解鎖
- [ ] 測試 GET /api/problems/{problemId} - 未解鎖 (403)
- [ ] 測試 GET /api/problems/{problemId} - 未購買 (403)
- [ ] 測試 POST /api/problems/{problemId}/submissions - 正常提交
- [ ] 測試 POST /api/problems/{problemId}/submissions - 檔案類型不符 (400)
- [ ] 測試 POST /api/problems/{problemId}/submissions - 重複提交 (version 遞增)
- [ ] 測試 GET /api/problems/{problemId}/submissions - 提交歷史

---

### BE-028: 實作 SubmissionController 整合測試

**描述**：測試提交記錄相關 API 端點。

**依賴任務**：BE-018, BE-025

**工作量**：M

**驗收標準**：

- [ ] 測試 GET /api/submissions/{submissionId} - 自己的提交
- [ ] 測試 GET /api/submissions/{submissionId} - 他人公開提交
- [ ] 測試 GET /api/submissions/{submissionId} - 他人非公開提交 (403)
- [ ] 測試 PATCH /api/submissions/{submissionId}/visibility - 正常更新
- [ ] 測試 PATCH /api/submissions/{submissionId}/visibility - 非自己的提交 (403)
- [ ] 測試 GET /api/submissions/public - 分頁
- [ ] 測試 GET /api/submissions/public?gymId={id} - 篩選
- [ ] 測試 GET /api/my/gym-progress

---

### BE-029: 實作 PrerequisiteService 整合測試

**描述**：測試前置條件檢查邏輯。

**依賴任務**：BE-012, BE-025

**工作量**：M

**驗收標準**：

- [ ] 測試 LESSON 類型前置條件 - 已完成 Lesson
- [ ] 測試 LESSON 類型前置條件 - 未完成 Lesson
- [ ] 測試 PROBLEM 類型前置條件 - 已提交 (不論批改狀態)
- [ ] 測試 PROBLEM 類型前置條件 - 未提交
- [ ] 測試多個前置條件組合
- [ ] 測試無前置條件 (直接解鎖)

---

### BE-030: 實作 FileStorage 整合測試

**描述**：測試檔案儲存功能。

**依賴任務**：BE-019, BE-021, BE-024

**工作量**：M

**驗收標準**：

- [ ] 測試 POST /api/upload/submission - 正常取得上傳 URL
- [ ] 測試 POST /api/upload/submission - 檔案類型不允許 (400)
- [ ] 測試 POST /api/upload/submission - 檔案大小超限 (400)
- [ ] 測試 LocalFileStorage 實際上傳和下載
- [ ] 測試 LocalFileStorage 檔案刪除

---

## Task Dependencies Graph

```
Phase 1: Database & Entities
┌──────┐    ┌──────┐    ┌──────┐
│BE-001│───>│BE-002│    │BE-003│
└──────┘    └──────┘    └──────┘
    │           │           │
    │    ┌──────┘           │
    │    │                  │
    ▼    ▼                  │
┌──────────┐    ┌──────┐    │
│  BE-005  │    │BE-004│<───┘
└──────────┘    └──────┘
    │               │
    ▼               ▼
┌──────┐       ┌──────┐
│BE-006│       │BE-007│
└──────┘       └──────┘

Phase 2: Core Services
┌──────────────────────────────────────┐
│              BE-008                   │ (Repositories)
└──────────────────────────────────────┘
    │         │         │         │
    ▼         ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│BE-009│ │BE-010│ │BE-011│ │BE-012│
└──────┘ └──────┘ └──────┘ └──────┘
                              │
                              ▼
                         ┌──────┐
                         │BE-013│
                         └──────┘
                              │
                              ▼
                         ┌──────┐
                         │BE-014│
                         └──────┘

Phase 3: API Layer
┌──────┐
│BE-015│ (DTOs)
└──────┘
    │
    ├─────────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│BE-016│ │BE-017│ │BE-018│ │BE-019│
└──────┘ └──────┘ └──────┘ └──────┘

Phase 4: File Storage
┌──────┐
│BE-020│ (Interface)
└──────┘
    │
    ├─────────┬─────────┐
    ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐
│BE-021│ │BE-022│ │BE-023│
└──────┘ └──────┘ └──────┘
    │         │
    └────┬────┘
         ▼
    ┌──────┐
    │BE-024│
    └──────┘

Phase 5: Integration Tests
┌──────┐
│BE-025│ (Test Data)
└──────┘
    │
    ├─────────┬─────────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│BE-026│ │BE-027│ │BE-028│ │BE-029│ │BE-030│
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘
```

---

## Work Estimation Summary

| Phase | Tasks | Total Estimation |
|-------|-------|------------------|
| Phase 1: Database & Entities | BE-001 ~ BE-007 | 4 days |
| Phase 2: Core Services | BE-008 ~ BE-014 | 3 days |
| Phase 3: API Layer | BE-015 ~ BE-019 | 2.5 days |
| Phase 4: File Storage | BE-020 ~ BE-024 | 2 days |
| Phase 5: Integration Tests | BE-025 ~ BE-030 | 2.5 days |
| **Total** | **30 tasks** | **~14 days** |

**Size Legend:**

- S (Small): 0.5 day
- M (Medium): 1 day
- L (Large): 1.5-2 days
