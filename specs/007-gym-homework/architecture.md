# Gym Homework System - 整體架構設計

## Overview

道館作業系統是一個遊戲化的程式作業平台，將傳統的作業系統包裝成「道館挑戰」模式。學生需完成各道館的關卡題目，上傳作業後由老師批改並給予回饋。

## 核心概念

```
┌─────────────────────────────────────────────────────────────────┐
│                        Journey (課程)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Gym (道館)                           │   │
│  │   Type: MAIN_QUEST (主線) | SIDE_QUEST (支線)             │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │                   Stage (關卡)                       │ │   │
│  │  │   Difficulty: ★☆☆☆☆ ~ ★★★★★                        │ │   │
│  │  │   Prerequisites: [Lesson IDs] | [Problem IDs]       │ │   │
│  │  │  ┌────────────────────────────────────────────────┐ │ │   │
│  │  │  │              Problem (題目)                     │ │ │   │
│  │  │  │   Difficulty: ★☆☆☆☆ ~ ★★★★★                   │ │ │   │
│  │  │  │   Prerequisites: [Lesson IDs] | [Problem IDs]  │ │ │   │
│  │  │  │   Hints: [提示1, 提示2, ...]                    │ │ │   │
│  │  │  │   Submission Types: [PDF, MP4, CODE, ...]      │ │ │   │
│  │  │  └────────────────────────────────────────────────┘ │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 資料模型關係

```
Journey (1) ──────────────< (N) Gym
    │                           │
    │                           └──< (N) Stage
    │                                     │
    │                                     └──< (N) Problem
    │                                              │
    └─────────── Lesson (N) <─── Prerequisites  ───┘
                                                   │
                                                   └──> Submission (N)
                                                              │
                                                              └──> Review (N)
```

## 核心實體

### Gym (道館)

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| journey_id | UUID | 所屬課程 (FK) |
| title | string | 道館名稱 |
| description | text | 道館描述 |
| type | enum | MAIN_QUEST / SIDE_QUEST |
| thumbnail_url | string | 縮圖 |
| sort_order | int | 排序 |
| is_published | boolean | 是否發布 |

### Stage (關卡)

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| gym_id | UUID | 所屬道館 (FK) |
| title | string | 關卡名稱 |
| description | text | 關卡描述 |
| difficulty | int | 難度 (1-5 星) |
| sort_order | int | 排序 |

### Problem (題目)

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| stage_id | UUID | 所屬關卡 (FK) |
| title | string | 題目名稱 |
| description | text | 題目描述 (支援 Markdown) |
| difficulty | int | 難度 (1-5 星) |
| submission_types | string[] | 允許的提交類型 |
| hints | jsonb | 提示列表 |
| exp_reward | int | 經驗值獎勵 (預留) |
| sort_order | int | 排序 |

### Prerequisites (前置條件)

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| target_type | enum | STAGE / PROBLEM |
| target_id | UUID | 目標關卡或題目 ID |
| prerequisite_type | enum | LESSON / PROBLEM |
| prerequisite_id | UUID | 前置條件的 Lesson 或 Problem ID |

### Submission (提交作答)

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| user_id | UUID | 提交者 (FK) |
| problem_id | UUID | 題目 (FK) |
| file_url | string | 上傳檔案 URL |
| file_type | string | 檔案類型 (pdf/mp4/code/...) |
| file_name | string | 原始檔名 |
| status | enum | PENDING / REVIEWED / NEEDS_REVISION |
| is_public | boolean | 是否公開批改結果 |
| submitted_at | timestamp | 提交時間 |
| version | int | 版本號 (重新提交時遞增) |

### Review (批改結果)

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| submission_id | UUID | 提交 (FK) |
| reviewer_id | UUID | 批改者 (FK) |
| content | text | 批改內容 (支援 Markdown) |
| status | enum | APPROVED / NEEDS_REVISION |
| reviewed_at | timestamp | 批改時間 |

## 權限控制

### 存取規則

```
┌──────────────────────────────────────────────────────────────┐
│                      Access Control                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  未購買 Journey:                                              │
│    ✓ 可看到 Gym 列表                                          │
│    ✓ 可看到 Stage 列表                                        │
│    ✗ 看不到 Problem 詳情 (顯示鎖定)                            │
│    ✗ 無法提交作答                                             │
│                                                              │
│  已購買 Journey:                                              │
│    ✓ 可看到所有內容                                           │
│    ✓ 需檢查 Prerequisites 才能作答                             │
│                                                              │
│  Prerequisites 檢查:                                          │
│    - 無設定條件 → 直接可作答                                   │
│    - 有設定條件 → 檢查是否完成指定 Lesson/Problem              │
│    - Problem 完成定義: 已提交過 (不論批改狀態)                  │
│    - Lesson 完成定義: lesson_progress.is_completed = true     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 作答與批改流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   學生      │     │   系統      │     │   老師      │     │   學生      │
│  查看題目   │────>│  檢查權限   │     │  (後台)     │     │  查看結果   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │                    │                    │
                          ▼                    │                    │
                    ┌─────────────┐            │                    │
                    │  顯示題目   │            │                    │
                    │  + 提示     │            │                    │
                    └─────────────┘            │                    │
                          │                    │                    │
                          ▼                    │                    │
┌─────────────┐     ┌─────────────┐            │                    │
│   學生      │────>│  上傳作業   │            │                    │
│  作答上傳   │     │  (檔案)     │            │                    │
└─────────────┘     └─────────────┘            │                    │
                          │                    │                    │
                          │  狀態: PENDING     │                    │
                          ▼                    ▼                    │
                    ┌─────────────┐     ┌─────────────┐            │
                    │  等待批改   │────>│  老師批改   │            │
                    └─────────────┘     └─────────────┘            │
                                              │                    │
                          ┌───────────────────┴───────────────────┐
                          ▼                                       ▼
                    ┌─────────────┐                         ┌─────────────┐
                    │  APPROVED   │                         │ NEEDS_REV   │
                    │  (通過)     │                         │ (需修改)    │
                    └─────────────┘                         └─────────────┘
                          │                                       │
                          ▼                                       ▼
                    ┌─────────────┐                         ┌─────────────┐
                    │  顯示回饋   │                         │  學生重新   │
                    │  + 經驗值   │                         │  提交作業   │
                    └─────────────┘                         └─────────────┘
```

## 提交狀態機

```
                    ┌─────────────┐
                    │   PENDING   │ (學生提交後)
                    └──────┬──────┘
                           │
              老師批改      │
           ┌───────────────┼───────────────┐
           ▼               │               ▼
    ┌─────────────┐        │        ┌─────────────┐
    │  APPROVED   │        │        │NEEDS_REVISION│
    │  (完成)     │        │        │ (需修改)     │
    └─────────────┘        │        └──────┬──────┘
                           │               │
                           │    學生重新提交│
                           │               ▼
                           │        ┌─────────────┐
                           └───────>│   PENDING   │ (新版本)
                                    └─────────────┘
```

## 技術架構

### Backend (Spring Boot)

維持現有 3-Layer 架構，Gym 相關代碼照現有慣例放置。唯一新增 `infrastructure/` 層放置技術基礎設施。

```
com.waterball.course/
├── controller/
│   ├── ... (現有)
│   ├── GymController.java
│   ├── ProblemController.java
│   ├── SubmissionController.java
│   └── FileUploadController.java
│
├── service/
│   ├── ... (現有)
│   └── gym/
│       ├── GymService.java
│       ├── StageService.java
│       ├── ProblemService.java
│       ├── SubmissionService.java
│       ├── PrerequisiteService.java
│       └── GymAccessControlService.java
│
├── repository/
│   ├── ... (現有)
│   ├── GymRepository.java
│   ├── StageRepository.java
│   ├── StagePrerequisiteRepository.java
│   ├── ProblemRepository.java
│   ├── ProblemPrerequisiteRepository.java
│   ├── SubmissionRepository.java
│   └── ReviewRepository.java
│
├── entity/
│   ├── ... (現有)
│   ├── Gym.java
│   ├── GymType.java
│   ├── Stage.java
│   ├── StagePrerequisite.java
│   ├── Problem.java
│   ├── ProblemPrerequisite.java
│   ├── PrerequisiteType.java
│   ├── Submission.java
│   ├── SubmissionStatus.java
│   ├── SubmissionType.java
│   ├── Review.java
│   └── ReviewStatus.java
│
├── dto/
│   ├── request/
│   │   ├── ... (現有)
│   │   ├── SubmissionRequest.java
│   │   ├── UploadUrlRequest.java
│   │   └── VisibilityUpdateRequest.java
│   └── response/
│       ├── ... (現有)
│       ├── GymListResponse.java
│       ├── GymDetailResponse.java
│       ├── StageSummaryResponse.java
│       ├── StageDetailResponse.java
│       ├── ProblemSummaryResponse.java
│       ├── ProblemDetailResponse.java
│       ├── SubmissionResponse.java
│       ├── ReviewResponse.java
│       ├── PrerequisiteInfoResponse.java
│       ├── UploadUrlResponse.java
│       └── GymProgressResponse.java
│
└── infrastructure/                    # 新增：技術基礎設施層
    └── storage/
        ├── FileStorageService.java    # Interface (Port)
        ├── StorageConfig.java
        ├── StorageProperties.java
        ├── LocalFileStorage.java      # Adapter
        ├── SupabaseStorage.java       # Adapter
        └── S3Storage.java             # Adapter
```

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/
│   │   └── gyms/
│   │       ├── page.tsx                    # 道館列表
│   │       └── [gymId]/
│   │           ├── page.tsx                # 道館詳情 (關卡列表)
│   │           └── stages/
│   │               └── [stageId]/
│   │                   ├── page.tsx        # 關卡詳情 (題目列表)
│   │                   └── problems/
│   │                       └── [problemId]/
│   │                           └── page.tsx # 題目詳情 + 作答
│   ├── components/
│   │   └── gym/
│   │       ├── GymCard.tsx
│   │       ├── GymList.tsx
│   │       ├── StageCard.tsx
│   │       ├── StageList.tsx
│   │       ├── ProblemCard.tsx
│   │       ├── ProblemList.tsx
│   │       ├── ProblemDetail.tsx
│   │       ├── SubmissionForm.tsx
│   │       ├── SubmissionHistory.tsx
│   │       ├── ReviewDisplay.tsx
│   │       ├── HintAccordion.tsx
│   │       ├── DifficultyStars.tsx
│   │       ├── PrerequisiteStatus.tsx
│   │       └── LockedContent.tsx
│   ├── hooks/
│   │   ├── useGymList.ts
│   │   ├── useGym.ts
│   │   ├── useStage.ts
│   │   ├── useProblem.ts
│   │   ├── useSubmission.ts
│   │   └── usePrerequisiteCheck.ts
│   ├── services/
│   │   ├── gym.service.ts
│   │   ├── stage.service.ts
│   │   ├── problem.service.ts
│   │   └── submission.service.ts
│   └── types/
│       ├── gym.ts
│       ├── stage.ts
│       ├── problem.ts
│       └── submission.ts
```

## 檔案上傳架構

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────>│  Backend    │────>│  Supabase   │
│  (上傳檔案) │     │  (驗證+處理)│     │  Storage    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      │  1. 選擇檔案      │                    │
      │  2. 驗證類型/大小 │                    │
      ├──────────────────>│                    │
      │                   │  3. 產生 signed URL│
      │                   ├───────────────────>│
      │                   │<───────────────────│
      │<──────────────────│  4. 回傳 URL       │
      │                   │                    │
      │  5. 直接上傳到 Supabase               │
      ├───────────────────────────────────────>│
      │                   │                    │
      │  6. 建立 Submission 記錄              │
      ├──────────────────>│                    │
      │                   │                    │
```

## 支援的檔案類型

| 類型 | MIME Type | 說明 | 大小限制 |
|------|-----------|------|----------|
| PDF | application/pdf | 文件報告 | 50MB |
| MP4 | video/mp4 | 影片說明 | 500MB |
| CODE | text/plain, application/zip | 程式碼 | 10MB |
| IMAGE | image/png, image/jpeg | 截圖 | 10MB |

## 經驗值系統 (預留)

```typescript
interface ExpConfig {
  problemCompleted: number;      // 完成題目 +10 exp
  stageCompleted: number;        // 完成關卡 +50 exp (bonus)
  gymCompleted: number;          // 完成道館 +200 exp (bonus)
  firstAttemptBonus: number;     // 一次通過 +5 exp
}
```

## API 設計原則

1. **RESTful 命名**: `/api/gyms`, `/api/gyms/{id}/stages`, etc.
2. **分頁**: 列表 API 支援分頁
3. **權限檢查**: 每個 API 檢查 Journey 購買狀態
4. **錯誤處理**: 統一錯誤格式，明確的錯誤碼

## 整合點

### 與現有系統整合

| 系統 | 整合方式 |
|------|----------|
| Journey (004) | Gym 屬於 Journey，共用購買權限 |
| Lesson Progress (004) | Prerequisites 檢查 Lesson 完成狀態 |
| User Auth (003) | 使用現有認證系統 |
| Supabase Storage | 檔案上傳使用現有 Supabase 配置 |

## 未來擴展

- [ ] 經驗值系統實作
- [ ] 排行榜整合
- [ ] 老師批改後台
- [ ] 程式碼自動評測 (OJ)
- [ ] 即時通知系統
