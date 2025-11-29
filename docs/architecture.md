# Architecture

## System Overview

Waterball Course Platform 採用前後端分離的微服務架構，所有服務透過 Docker Compose 編排。

## Architecture Diagram

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│   Frontend  │─────▶│   Backend   │─────▶│  PostgreSQL │
│  (Next.js)  │      │(Spring Boot)│      │             │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │             │
                     │  Supabase   │
                     │  Storage    │
                     │             │
                     └─────────────┘
```

## Backend Architecture (3-Layer)

### Controller Layer

- 負責處理 HTTP 請求和回應
- 驗證輸入參數
- 轉換 DTO

### Service Layer

- 實作業務邏輯
- 協調多個 Repository
- 處理事務管理

### Repository Layer

- 資料存取
- JPA/Hibernate 操作
- 資料庫查詢

## Storage Strategy Pattern

儲存服務採用 Strategy Pattern 設計，可輕易替換不同的儲存提供者：

```java
public interface StorageService {
    String uploadFile(String path, MultipartFile file);
    InputStream downloadFile(String path);
    void deleteFile(String path);
    String getFileUrl(String path);
}
```

實作：

- `SupabaseStorageService` - 當前 MVP 實作
- `S3StorageService` - 未來可擴展
- `LocalStorageService` - 本地開發使用

## Security

- JWT Token 認證
- CORS 配置
- Password 加密 (BCrypt)
- SQL Injection 防護 (JPA)

## Database Schema

使用 JPA 進行 ORM 映射，Hibernate 自動管理 Schema。

## Technology Stack

### Frontend

- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS + shadcn/ui
- Fetch API for HTTP requests

### Backend

- Java 17
- Spring Boot 3.2
- Spring Data JPA
- Spring Security
- PostgreSQL Driver
- TestContainers

### Infrastructure

- Docker & Docker Compose
- PostgreSQL 15
- Supabase (Storage)

## Deployment

所有服務透過 Docker Compose 部署：

```bash
docker-compose up
```

這會啟動：

1. PostgreSQL 資料庫
2. Spring Boot 後端服務
3. Next.js 前端服務

## Development Workflow

1. 本地開發使用 `.env.example` 建立 `.env`
2. Frontend: `npm run dev`
3. Backend: `mvn spring-boot:run`
4. 測試: `mvn test`
5. Docker 建構: `docker-compose build`
6. Docker 啟動: `docker-compose up`
