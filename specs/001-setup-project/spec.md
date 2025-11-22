# Specification: Project Setup

## Overview
建立一個收費課程網站的完整專案架構，包含前端、後端、資料庫以及開發環境配置。

## Technical Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query (資料獲取)
- Zustand/Context API (狀態管理)

### Backend
- Java 17+
- Spring Boot 3.x
- PostgreSQL 15+
- JPA/Hibernate
- Spring Security (JWT authentication)
- JUnit 5 + TestContainers (E2E testing)

### Infrastructure
- Docker & Docker Compose
- Supabase Storage (課程影片，可抽換成 S3)

## Architecture

### Backend 3-Layer Architecture
```
Controller Layer (API endpoints)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
```

### 目錄結構
```
project/
├── frontend/           # Next.js 15 應用
├── backend/            # Spring Boot 應用
├── docs/               # 專案文件
├── specs/              # 需求文件
│   └── 001-setup-project/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── docker-compose.yml  # Docker 編排設定
└── README.md
```

## Requirements

### Functional Requirements
1. 專案可使用 `docker-compose up` 在本地啟動
2. 前端可訪問 `http://localhost:3000`
3. 後端 API 可訪問 `http://localhost:8080`
4. PostgreSQL 可從本地連接
5. 包含基本的健康檢查 endpoints

### Non-Functional Requirements
1. 程式碼結構清晰，易於擴展
2. Storage layer 可輕易替換 (Supabase → S3)
3. 包含 E2E 測試框架設置
4. 包含必要的環境變數配置範例

## Success Criteria
- [ ] 所有服務可透過 docker-compose 啟動
- [ ] Frontend 可正常訪問並顯示 Hello World
- [ ] Backend API 可正常回應健康檢查
- [ ] Database 可正常連接
- [ ] 包含完整的 README 說明文件
