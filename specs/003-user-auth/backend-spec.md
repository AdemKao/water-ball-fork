# Backend Specification: User Authentication

## Overview

實作 Google OAuth2 登入系統，使用 JWT Token 進行 API 驗證，支援 Role-based 權限控制。

## Technical Stack

- Spring Boot 3.2
- Spring Security 6
- JJWT 0.12.3 (已存在)
- Google API Client (新增)
- PostgreSQL + Flyway

## Architecture (3-Layer)

```
┌─────────────────────────────────────────────────────────────┐
│                     Controller Layer                        │
│  AuthController, UserController                             │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                          │
│  AuthService, UserService, JwtService, GoogleAuthService    │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                         │
│  UserRepository                                             │
└─────────────────────────────────────────────────────────────┘
```

## Dependencies (新增至 pom.xml)

```xml
<dependency>
    <groupId>com.google.api-client</groupId>
    <artifactId>google-api-client</artifactId>
    <version>2.2.0</version>
</dependency>
```

## Database Schema

### users table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    picture_url VARCHAR(500),
    role VARCHAR(50), -- NULL, 'ADMIN', 'TEACHER', 'STUDENT'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### user_auth_providers table

```sql
CREATE TABLE user_auth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,           -- 'GOOGLE', 'GITHUB', 'LINE', 'EMAIL'
    provider_user_id VARCHAR(255) NOT NULL,  -- provider 端的唯一識別碼
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_user_auth_providers_user_id ON user_auth_providers(user_id);
CREATE INDEX idx_user_auth_providers_lookup ON user_auth_providers(provider, provider_user_id);
```

### refresh_tokens table

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

## API Endpoints

### Authentication

#### POST /api/auth/google

Google 登入/註冊

**Request:**

```json
{
  "credential": "google-id-token-from-frontend"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "pictureUrl": "https://...",
    "role": null
  }
}
```

**Cookies Set:**

- `access_token`: HttpOnly, Secure, SameSite=Strict, Max-Age=1800 (30min)
- `refresh_token`: HttpOnly, Secure, SameSite=Strict, Path=/api/auth, Max-Age=2592000 (30days)

#### POST /api/auth/refresh

刷新 Access Token

**Request:** Cookie 中的 refresh_token

**Response (200):**

```json
{
  "message": "Token refreshed"
}
```

**Cookies Set:**

- 新的 `access_token`

#### POST /api/auth/logout

登出

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**

- `access_token`
- `refresh_token`

#### GET /api/auth/me

取得當前用戶資訊

**Response (200):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "pictureUrl": "https://...",
  "role": null
}
```

**Response (401):**

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

## Components Structure

### Entity Layer

```
entity/
├── User.java
├── UserAuthProvider.java
└── RefreshToken.java
```

### Repository Layer

```
repository/
├── UserRepository.java
├── UserAuthProviderRepository.java
└── RefreshTokenRepository.java
```

### Service Layer

```
service/
├── auth/
│   ├── AuthService.java          # 主要認證邏輯
│   ├── GoogleAuthService.java    # Google ID Token 驗證
│   └── JwtService.java           # JWT 產生與驗證
└── UserService.java              # 用戶 CRUD
```

### Controller Layer

```
controller/
└── AuthController.java
```

### Security Config

```
config/
├── SecurityConfig.java           # 更新現有配置
└── JwtAuthenticationFilter.java  # JWT 過濾器
```

### DTO

```
dto/
├── request/
│   └── GoogleLoginRequest.java
└── response/
    ├── AuthResponse.java
    └── UserResponse.java
```

## Security Configuration

### JWT Filter Chain

```
Request → JwtAuthenticationFilter → SecurityContext → Controller
```

### Protected Routes

- `/api/auth/google` - permitAll
- `/api/auth/refresh` - permitAll
- `/api/auth/logout` - authenticated
- `/api/auth/me` - authenticated
- `/api/**` - authenticated (除了上述例外)
- `/api/health/**` - permitAll
- `/swagger-ui/**` - permitAll

### CSRF Protection

- 使用 SameSite=Strict Cookie，CSRF disabled (Stateless API)
- 配合 HttpOnly Cookie 防止 XSS

## Environment Variables

```properties
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-change-in-production
JWT_ACCESS_EXPIRATION=1800000    # 30 minutes in ms
JWT_REFRESH_EXPIRATION=2592000000  # 30 days in ms

# Cookie Configuration
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false  # true in production
```

## Error Handling

| Error | Status | Response |
|-------|--------|----------|
| Invalid Google Token | 401 | `{"error": "Invalid credential"}` |
| Expired Access Token | 401 | `{"error": "Token expired"}` |
| Invalid Refresh Token | 401 | `{"error": "Invalid refresh token"}` |
| Missing Token | 401 | `{"error": "Unauthorized"}` |
| Forbidden (Role) | 403 | `{"error": "Forbidden"}` |

## Implementation Tasks

### Phase 1: Database & Entity

1. [ ] 建立 Flyway migration: `V2__create_users_and_auth_tables.sql`
2. [ ] 建立 `User` entity
3. [ ] 建立 `UserAuthProvider` entity
4. [ ] 建立 `RefreshToken` entity
5. [ ] 建立 `UserRepository`
6. [ ] 建立 `UserAuthProviderRepository`
7. [ ] 建立 `RefreshTokenRepository`

### Phase 2: Service Layer

8. [ ] 建立 `JwtService` - JWT 產生與驗證
9. [ ] 建立 `GoogleAuthService` - Google ID Token 驗證
10. [ ] 建立 `AuthService` - 整合認證邏輯
11. [ ] 建立 `UserService` - 用戶 CRUD

### Phase 3: Security Config

12. [ ] 建立 `JwtAuthenticationFilter`
13. [ ] 更新 `SecurityConfig` - 配置 JWT filter chain
14. [ ] 建立 DTO classes

### Phase 4: Controller Layer

15. [ ] 建立 `AuthController`
16. [ ] 實作 Google 登入 endpoint
17. [ ] 實作 refresh token endpoint
18. [ ] 實作 logout endpoint
19. [ ] 實作 me endpoint

### Phase 5: Testing

20. [ ] 建立 `AuthControllerTest`
21. [ ] 建立 `JwtServiceTest`
22. [ ] 建立 `AuthServiceTest`

## Success Criteria

- [ ] Google 登入可正常運作
- [ ] JWT Token 正確設定於 HttpOnly Cookie
- [ ] Access Token 過期後可用 Refresh Token 更新
- [ ] 受保護 API 需要有效 JWT 才能存取
- [ ] Logout 可正確清除 Token
- [ ] Role-based 權限可正常判斷
