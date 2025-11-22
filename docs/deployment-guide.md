# Deployment Guide

## Docker Compose Deployment

### Quick Start

1. 確認已安裝 Docker 和 Docker Compose：

```bash
docker --version
docker-compose --version
```

2. 建立環境變數檔案：

```bash
cp .env.example .env
```

3. 編輯 `.env` 設定 production 環境變數

4. 啟動所有服務：

```bash
docker-compose up -d
```

5. 查看服務狀態：

```bash
docker-compose ps
```

6. 查看 logs：

```bash
docker-compose logs -f
```

### Service URLs

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:8080>
- PostgreSQL: localhost:5432

### Health Checks

檢查 Backend 健康狀態：

```bash
curl http://localhost:8080/api/health
```

預期回應：

```json
{
  "status": "UP",
  "service": "course-platform",
  "version": "1.0.0"
}
```

## Environment Variables

### Required Variables

#### Backend

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/course_platform
SPRING_DATASOURCE_USERNAME=waterball
SPRING_DATASOURCE_PASSWORD=<strong-password>
SPRING_SECURITY_JWT_SECRET=<your-jwt-secret>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
```

#### Frontend

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Production Deployment

### 1. Update Configuration

編輯 `docker-compose.yml` 的 production 設定：

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Use strong password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: always

  backend:
    environment:
      SPRING_PROFILES_ACTIVE: prod
    restart: always

  frontend:
    environment:
      NODE_ENV: production
    restart: always
```

### 2. Build Images

```bash
docker-compose build
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Database Migration

如果需要執行資料庫遷移：

```bash
docker-compose exec backend ./mvnw flyway:migrate
```

## Scaling

### Horizontal Scaling

擴展 backend instances：

```bash
docker-compose up -d --scale backend=3
```

需要配置 load balancer (nginx, traefik)。

## Monitoring

### View Logs

所有服務：

```bash
docker-compose logs -f
```

特定服務：

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Container Stats

```bash
docker stats
```

## Backup and Restore

### Database Backup

```bash
docker-compose exec postgres pg_dump -U waterball course_platform > backup.sql
```

### Database Restore

```bash
docker-compose exec -T postgres psql -U waterball course_platform < backup.sql
```

## Troubleshooting

### Service Won't Start

1. 查看 logs：

```bash
docker-compose logs <service-name>
```

2. 檢查網路：

```bash
docker network ls
docker network inspect <network-name>
```

3. 重啟服務：

```bash
docker-compose restart <service-name>
```

### Database Connection Errors

1. 確認 PostgreSQL 正在運行：

```bash
docker-compose ps postgres
```

2. 測試連接：

```bash
docker-compose exec postgres psql -U waterball -d course_platform
```

### Clean Restart

完全清除並重新啟動：

```bash
docker-compose down -v
docker-compose up -d
```

## Updating the Application

### Update Backend

```bash
cd backend
git pull
docker-compose build backend
docker-compose up -d backend
```

### Update Frontend

```bash
cd frontend
git pull
docker-compose build frontend
docker-compose up -d frontend
```

## Security Best Practices

1. 使用強密碼
2. 不要在版本控制系統中提交 `.env` 檔案
3. 定期更新 dependencies
4. 使用 HTTPS (透過 reverse proxy)
5. 限制資料庫連接來源
6. 定期備份資料

## Performance Optimization

### Backend

- 調整 JVM heap size：

```yaml
backend:
  environment:
    JAVA_OPTS: "-Xms512m -Xmx2g"
```

### Frontend

- 啟用 gzip compression
- 使用 CDN for static assets
- 實作 caching strategies

### Database

- 定期執行 VACUUM
- 建立適當的 indexes
- 監控 slow queries

```bash
docker-compose exec postgres psql -U waterball -d course_platform -c "VACUUM ANALYZE;"
```
