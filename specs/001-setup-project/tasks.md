# Tasks: Project Setup

## Task 1: 建立基礎目錄結構
- [ ] 建立 frontend/ 資料夾
- [ ] 建立 backend/ 資料夾
- [ ] 建立 docs/ 資料夾
- [ ] 建立根目錄 README.md
- [ ] 建立 .gitignore

## Task 2: 設定 PostgreSQL (Docker Compose)
- [ ] 建立 docker-compose.yml
- [ ] 配置 PostgreSQL 服務
- [ ] 設定資料持久化 volume
- [ ] 設定預設資料庫和使用者

## Task 3: 初始化 Spring Boot 專案
- [ ] 建立 Spring Boot 專案結構
- [ ] 配置 pom.xml 依賴
- [ ] 建立 application.yml (dev/prod profiles)
- [ ] 建立 3-layer 架構資料夾結構

## Task 4: 實作 Backend 基礎功能
- [ ] 建立 HealthCheckController
- [ ] 建立 GlobalExceptionHandler
- [ ] 建立 StorageService interface
- [ ] 實作 SupabaseStorageService
- [ ] 配置 CORS

## Task 5: 設定 Backend E2E 測試
- [ ] 配置 TestContainers
- [ ] 建立 BaseIntegrationTest
- [ ] 建立 HealthCheckControllerTest
- [ ] 配置測試 application.yml

## Task 6: 建立 Backend Dockerfile
- [ ] 建立多階段 Dockerfile
- [ ] 優化建構層級
- [ ] 配置 ENTRYPOINT

## Task 7: 初始化 Next.js 15 專案
- [ ] 建立 Next.js 專案 (TypeScript)
- [ ] 安裝並配置 Tailwind CSS
- [ ] 初始化 shadcn/ui
- [ ] 建立專案資料夾結構

## Task 8: 設定 Frontend 基礎配置
- [ ] 建立 API client service
- [ ] 建立環境變數配置
- [ ] 建立基礎 Layout
- [ ] 建立 Home page

## Task 9: 建立 Frontend Dockerfile
- [ ] 建立多階段 Dockerfile
- [ ] 配置環境變數注入
- [ ] 優化建構大小

## Task 10: 整合 Docker Compose
- [ ] 加入 backend 服務到 docker-compose.yml
- [ ] 加入 frontend 服務到 docker-compose.yml
- [ ] 配置服務間網路
- [ ] 配置健康檢查
- [ ] 設定服務啟動順序

## Task 11: 環境變數配置
- [ ] 建立 .env.example
- [ ] 建立 backend/.env.example
- [ ] 建立 frontend/.env.example
- [ ] 文件化所有環境變數

## Task 12: 撰寫文件
- [ ] 撰寫根目錄 README.md
- [ ] 建立 docs/architecture.md
- [ ] 建立 docs/development-guide.md
- [ ] 建立 docs/deployment-guide.md

## Task 13: 驗證和測試
- [ ] 測試 `docker-compose up` 可正常啟動
- [ ] 測試 frontend 可訪問 http://localhost:3000
- [ ] 測試 backend API 可訪問 http://localhost:8080
- [ ] 測試資料庫連接
- [ ] 測試 E2E 測試可執行
