# Implementation Plan: Project Setup

## Phase 1: 基礎架構設置
### 1.1 建立專案目錄結構
- 建立 frontend, backend, docs, specs 資料夾
- 建立根目錄的 README.md 和 .gitignore

### 1.2 設定 Docker Compose
- 建立 docker-compose.yml
- 配置 PostgreSQL 服務
- 配置網路和資料持久化

## Phase 2: Backend Setup
### 2.1 Spring Boot 專案初始化
- 使用 Spring Initializr 基礎配置
- 設定依賴: Web, JPA, PostgreSQL, Security, Validation, Testcontainers
- 配置 application.yml (開發/生產環境)

### 2.2 建立 3-Layer 架構基礎
```
backend/src/main/java/com/waterball/course/
├── controller/
├── service/
├── repository/
├── model/
│   ├── entity/
│   └── dto/
├── config/
├── exception/
└── util/
```

### 2.3 設定 Storage Interface
- 建立 StorageService interface
- 實作 SupabaseStorageService
- 配置可抽換架構 (Strategy Pattern)

### 2.4 建立 E2E 測試框架
- 配置 TestContainers
- 建立測試基礎類別
- 建立範例測試

### 2.5 Dockerfile
- 多階段建構
- 優化層級快取

## Phase 3: Frontend Setup
### 3.1 Next.js 15 專案初始化
- 建立 Next.js 專案 with TypeScript
- 安裝 Tailwind CSS
- 初始化 shadcn/ui

### 3.2 設定專案結構
```
frontend/
├── src/
│   ├── app/            # App Router
│   ├── components/     # React 元件
│   │   ├── ui/        # shadcn components
│   │   └── features/  # 功能元件
│   ├── lib/           # 工具函式
│   ├── hooks/         # Custom hooks
│   ├── services/      # API 呼叫
│   └── types/         # TypeScript types
├── public/
└── next.config.js
```

### 3.3 設定 API Client
- 建立 axios/fetch wrapper
- 配置 API base URL
- 建立基礎 API 服務

### 3.4 Dockerfile
- 多階段建構
- 優化建構速度

## Phase 4: Integration
### 4.1 環境變數配置
- 建立 .env.example
- 文件化所有必要環境變數

### 4.2 Docker Compose 整合
- 整合 frontend 服務
- 整合 backend 服務
- 配置服務間網路

### 4.3 健康檢查
- Backend health endpoint
- Database 連接檢查
- Frontend readiness 檢查

## Phase 5: Documentation
### 5.1 README.md
- 專案介紹
- 快速開始指南
- 開發指南
- 部署指南

### 5.2 docs/ 文件
- 架構說明
- API 文件結構
- 開發規範

## Timeline Estimation
- Phase 1: 30 mins
- Phase 2: 2 hours
- Phase 3: 1.5 hours
- Phase 4: 1 hour
- Phase 5: 30 mins

Total: ~5.5 hours
