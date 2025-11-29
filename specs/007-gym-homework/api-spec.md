# Gym Homework API Specification

> 供 Frontend Team 開發使用的 API 規格。此文件著重於請求/回應格式，省略實作細節。

## Base Info

- **Base URL**: `/api`
- **Auth**: JWT Bearer Token in `Authorization` header
- **Content-Type**: `application/json` (除檔案上傳外)

---

## Enums

```typescript
type GymType = 'MAIN_QUEST' | 'SIDE_QUEST'

type SubmissionType = 'PDF' | 'MP4' | 'CODE' | 'IMAGE'

type SubmissionStatus = 'PENDING' | 'REVIEWED' | 'NEEDS_REVISION'

type ReviewStatus = 'APPROVED' | 'NEEDS_REVISION'

type PrerequisiteType = 'LESSON' | 'PROBLEM'
```

---

## Common Types

```typescript
interface ErrorResponse {
  timestamp: string      // ISO8601
  status: number
  error: string
  message: string
  path: string
}

interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number         // current page (0-based)
  size: number           // page size
}

interface PrerequisiteInfo {
  type: PrerequisiteType
  id: string             // UUID
  title: string
  isCompleted: boolean
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request - 請求參數錯誤 |
| 401 | Unauthorized - 未登入或 Token 過期 |
| 403 | Forbidden - 無權限 (未購買/未解鎖) |
| 404 | Not Found - 資源不存在 |
| 409 | Conflict - 資源衝突 |

---

## Endpoints

### 1. Gym APIs

#### GET /api/gyms

取得道館列表

**Auth**: Optional (登入時回傳個人進度)

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| journeyId | UUID | No | 篩選特定課程 |
| type | GymType | No | 篩選道館類型 |

**Response** `200 OK`:

```typescript
interface GymListItem {
  id: string
  journeyId: string
  journeyTitle: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  type: GymType
  stageCount: number
  problemCount: number
  completedCount: number    // 0 if not logged in
  isPurchased: boolean      // false if not logged in
}

type Response = GymListItem[]
```

---

#### GET /api/gyms/{gymId}

取得道館詳情

**Auth**: Optional

**Path Params**: `gymId: UUID`

**Response** `200 OK`:

```typescript
interface GymDetailResponse {
  id: string
  journeyId: string
  journeyTitle: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  type: GymType
  stages: StageSummary[]
  isPurchased: boolean
  relatedGyms: GymSummary[]
}

interface StageSummary {
  id: string
  title: string
  description: string | null
  difficulty: number         // 1-5
  problemCount: number
  completedCount: number
  isUnlocked: boolean
  prerequisites: PrerequisiteInfo[]
}

interface GymSummary {
  id: string
  title: string
  type: GymType
}
```

**Error**: `404` - 道館不存在或未發布

---

#### GET /api/gyms/{gymId}/stages/{stageId}

取得關卡詳情

**Auth**: Optional

**Path Params**: `gymId: UUID`, `stageId: UUID`

**Response** `200 OK`:

```typescript
interface StageDetailResponse {
  id: string
  gymId: string
  gymTitle: string
  title: string
  description: string | null
  difficulty: number
  problems: ProblemSummary[]
  isUnlocked: boolean
  isPurchased: boolean
  prerequisites: PrerequisiteInfo[]
}

interface ProblemSummary {
  id: string
  title: string
  difficulty: number
  submissionTypes: SubmissionType[]
  isCompleted: boolean
  isUnlocked: boolean
  submissionStatus: SubmissionStatus | null
}
```

**Errors**:

- `403` - 未購買課程，無法查看題目詳情
- `404` - 關卡不存在

---

### 2. Problem APIs

#### GET /api/problems/{problemId}

取得題目詳情

**Auth**: Required

**Path Params**: `problemId: UUID`

**Response** `200 OK`:

```typescript
interface ProblemDetailResponse {
  id: string
  stageId: string
  stageTitle: string
  gymId: string
  gymTitle: string
  title: string
  description: string        // Markdown
  difficulty: number
  submissionTypes: SubmissionType[]
  hints: Hint[]
  expReward: number
  isUnlocked: boolean
  prerequisites: PrerequisiteInfo[]
  latestSubmission: SubmissionInfo | null
  previousProblem: ProblemNav | null
  nextProblem: ProblemNav | null
}

interface Hint {
  order: number
  content: string
}

interface SubmissionInfo {
  id: string
  status: SubmissionStatus
  fileUrl: string
  fileName: string
  submittedAt: string        // ISO8601
  version: number
  review: ReviewInfo | null
}

interface ReviewInfo {
  id: string
  content: string            // Markdown
  status: ReviewStatus
  reviewedAt: string
  reviewerName: string
}

interface ProblemNav {
  id: string
  title: string
}
```

**Errors**:

- `401` - 未登入
- `403` - 未購買課程 / 未解鎖題目
- `404` - 題目不存在

---

### 3. Submission APIs

#### POST /api/problems/{problemId}/submissions

提交作答

**Auth**: Required

**Path Params**: `problemId: UUID`

**Content-Type**: `multipart/form-data`

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | 上傳檔案 |
| isPublic | boolean | No | 是否公開 (default: false) |

**Response** `201 Created`:

```typescript
interface SubmissionResponse {
  id: string
  problemId: string
  fileUrl: string
  fileName: string
  fileType: SubmissionType
  status: SubmissionStatus
  isPublic: boolean
  version: number
  submittedAt: string
}
```

**Errors**:

- `400` - File type not allowed for this problem
- `400` - File size exceeds limit
- `401` - Unauthorized
- `403` - Course not purchased
- `403` - Problem is locked. Complete prerequisites first
- `404` - Problem not found

---

#### GET /api/problems/{problemId}/submissions

取得題目的提交歷史

**Auth**: Required

**Path Params**: `problemId: UUID`

**Response** `200 OK`:

```typescript
interface SubmissionHistoryItem {
  id: string
  fileUrl: string
  fileName: string
  fileType: SubmissionType
  status: SubmissionStatus
  isPublic: boolean
  version: number
  submittedAt: string
  review: ReviewInfo | null
}

type Response = SubmissionHistoryItem[]
```

---

#### GET /api/submissions/{submissionId}

取得提交詳情

**Auth**: Required

**Path Params**: `submissionId: UUID`

**Response** `200 OK`:

```typescript
interface SubmissionDetailResponse {
  id: string
  problemId: string
  problemTitle: string
  stageTitle: string
  gymTitle: string
  fileUrl: string
  fileName: string
  fileType: SubmissionType
  fileSizeBytes: number
  status: SubmissionStatus
  isPublic: boolean
  version: number
  submittedAt: string
  review: ReviewInfo | null
}
```

**Errors**:

- `401` - 未登入
- `403` - 非自己的提交且非公開
- `404` - 提交不存在

---

#### PATCH /api/submissions/{submissionId}/visibility

更新提交的公開設定

**Auth**: Required

**Path Params**: `submissionId: UUID`

**Request Body**:

```typescript
interface VisibilityUpdateRequest {
  isPublic: boolean
}
```

**Response** `200 OK`:

```typescript
interface VisibilityUpdateResponse {
  id: string
  isPublic: boolean
  updatedAt: string
}
```

---

#### GET /api/submissions/public

取得公開的批改結果列表

**Auth**: Optional

**Query Parameters**:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| problemId | UUID | No | - | 篩選特定題目 |
| gymId | UUID | No | - | 篩選特定道館 |
| page | number | No | 0 | 頁碼 (0-based) |
| size | number | No | 20 | 每頁筆數 |

**Response** `200 OK`:

```typescript
interface PublicSubmission {
  id: string
  userName: string
  userAvatarUrl: string | null
  problemId: string
  problemTitle: string
  gymTitle: string
  fileUrl: string
  fileName: string
  status: SubmissionStatus
  submittedAt: string
  review: {
    content: string
    status: ReviewStatus
    reviewedAt: string
    reviewerName: string
  } | null
}

type Response = PaginatedResponse<PublicSubmission>
```

---

### 4. User Progress API

#### GET /api/my/gym-progress

取得個人道館進度總覽

**Auth**: Required

**Response** `200 OK`:

```typescript
interface GymProgressResponse {
  totalGyms: number
  completedGyms: number
  totalProblems: number
  completedProblems: number
  pendingReviews: number
  gyms: GymProgressItem[]
}

interface GymProgressItem {
  gymId: string
  gymTitle: string
  type: GymType
  problemCount: number
  completedCount: number
  pendingCount: number
  progressPercentage: number
}
```

---

### 5. File Upload API

#### POST /api/upload/submission

取得檔案上傳的 Signed URL

**Auth**: Required

**Request Body**:

```typescript
interface UploadUrlRequest {
  problemId: string
  fileName: string
  fileType: string          // MIME type, e.g. "application/pdf"
  fileSizeBytes: number
}
```

**Response** `200 OK`:

```typescript
interface UploadUrlResponse {
  uploadUrl: string
  fileKey: string
  expiresAt: string         // ISO8601
}
```

**Errors**:

- `400` - 檔案類型不允許
- `400` - 檔案大小超過限制
- `401` - 未登入
- `403` - 未購買課程

---

## File Size Limits

| Type | Max Size |
|------|----------|
| PDF | 50 MB |
| MP4 | 500 MB |
| CODE (zip/txt) | 10 MB |
| IMAGE | 10 MB |

---

## Frontend Integration Notes

### 1. Authentication Flow

所有需要登入的 API，請在 request header 帶上：

```
Authorization: Bearer <access_token>
```

### 2. File Upload Flow

**使用 Signed URL 上傳 (推薦)**:

1. 呼叫 `POST /api/upload/submission` 取得 `uploadUrl` 和 `fileKey`
2. 使用取得的 `uploadUrl` 直接上傳檔案到 storage
3. 呼叫 `POST /api/problems/{problemId}/submissions` 並帶上 `fileKey`

**直接上傳 (簡易模式)**:

1. 直接呼叫 `POST /api/problems/{problemId}/submissions` 使用 `multipart/form-data`

### 3. Prerequisite Display

當 `isUnlocked = false` 時，顯示 `prerequisites` 陣列讓使用者知道需完成哪些條件：

- `type: 'LESSON'` → 導向對應課程
- `type: 'PROBLEM'` → 導向對應題目

### 4. Submission Status Display

| Status | UI 狀態 | Description |
|--------|---------|-------------|
| `PENDING` | 待批改 | 黃色/橘色標籤 |
| `REVIEWED` | 已批改 | 藍色標籤，檢查 review.status |
| `NEEDS_REVISION` | 需修改 | 紅色標籤，允許重新提交 |

### 5. Review Status Display

| Status | UI 狀態 | Description |
|--------|---------|-------------|
| `APPROVED` | 通過 | 綠色標籤/勾勾 |
| `NEEDS_REVISION` | 需修改 | 紅色標籤，顯示批改意見 |

---

## Mock Data Examples

### Gym List Response

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "journeyId": "660e8400-e29b-41d4-a716-446655440000",
    "journeyTitle": "軟體設計之旅",
    "title": "設計模式道館",
    "description": "挑戰經典的設計模式題目",
    "thumbnailUrl": "https://example.com/gym-thumb.jpg",
    "type": "MAIN_QUEST",
    "stageCount": 5,
    "problemCount": 20,
    "completedCount": 8,
    "isPurchased": true
  }
]
```

### Problem Detail Response

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "stageId": "770e8400-e29b-41d4-a716-446655440000",
  "stageTitle": "第一關：策略模式",
  "gymId": "550e8400-e29b-41d4-a716-446655440000",
  "gymTitle": "設計模式道館",
  "title": "策略模式實戰題",
  "description": "## 題目說明\n\n請實作一個...",
  "difficulty": 3,
  "submissionTypes": ["CODE", "PDF"],
  "hints": [
    { "order": 1, "content": "可以先思考哪些行為是可以抽換的" },
    { "order": 2, "content": "試著畫出 UML 圖" }
  ],
  "expReward": 20,
  "isUnlocked": true,
  "prerequisites": [],
  "latestSubmission": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "status": "REVIEWED",
    "fileUrl": "https://storage.example.com/submissions/xxx.pdf",
    "fileName": "my-solution.pdf",
    "submittedAt": "2024-01-15T10:30:00Z",
    "version": 2,
    "review": {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "content": "## 批改結果\n\n做得很好！",
      "status": "APPROVED",
      "reviewedAt": "2024-01-16T14:00:00Z",
      "reviewerName": "水球老師"
    }
  },
  "previousProblem": {
    "id": "880e8400-e29b-41d4-a716-446655440001",
    "title": "策略模式概念題"
  },
  "nextProblem": null
}
```

### Submission Response

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "problemId": "880e8400-e29b-41d4-a716-446655440000",
  "fileUrl": "https://storage.example.com/submissions/xxx.pdf",
  "fileName": "my-solution.pdf",
  "fileType": "PDF",
  "status": "PENDING",
  "isPublic": false,
  "version": 1,
  "submittedAt": "2024-01-15T10:30:00Z"
}
```
