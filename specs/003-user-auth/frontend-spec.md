# Frontend Specification: User Authentication

## Overview

實作 Google OAuth2 登入介面，管理用戶認證狀態，配合後端 JWT Cookie 進行 API 請求。

## Technical Stack

- Next.js 16 (App Router)
- React 19
- @react-oauth/google (新增)
- TypeScript

## Dependencies (新增至 package.json)

```json
{
  "@react-oauth/google": "^0.12.1"
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Components                              │
│  LoginButton, UserMenu, ProtectedRoute                       │
├─────────────────────────────────────────────────────────────┤
│                        Hooks                                 │
│  useAuth, useUser                                            │
├─────────────────────────────────────────────────────────────┤
│                       Services                               │
│  auth.service.ts                                             │
├─────────────────────────────────────────────────────────────┤
│                        Types                                 │
│  auth.ts, user.ts                                            │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # 更新登入頁面
│   │   └── layout.tsx
│   └── providers.tsx              # Google OAuth Provider
├── components/
│   ├── auth/
│   │   ├── GoogleLoginButton.tsx  # Google 登入按鈕
│   │   ├── UserMenu.tsx           # 用戶選單 (頭像、登出)
│   │   └── ProtectedRoute.tsx     # 路由保護 wrapper
│   └── layout/
│       └── navbar.tsx             # 更新：顯示登入狀態
├── hooks/
│   ├── useAuth.ts                 # 認證狀態 hook
│   └── useUser.ts                 # 當前用戶資訊 hook
├── services/
│   └── auth.service.ts            # 認證 API 呼叫
├── types/
│   ├── auth.ts                    # 認證相關型別
│   └── user.ts                    # 用戶型別
└── lib/
    └── api-client.ts              # 更新：處理 401 自動 refresh
```

## Types

### types/user.ts

```typescript
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  pictureUrl: string | null;
  role: UserRole;
}
```

### types/auth.ts

```typescript
import { User } from './user';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface GoogleLoginResponse {
  user: User;
}

export interface AuthContextValue extends AuthState {
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

## Components

### GoogleLoginButton

Google 登入按鈕，使用 @react-oauth/google

```typescript
interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

**行為:**

- 顯示 Google 登入按鈕
- 成功後呼叫 `authService.loginWithGoogle()`
- 更新 AuthContext 狀態
- 導向首頁或指定頁面

### UserMenu

登入後顯示的用戶選單

```typescript
interface UserMenuProps {
  user: User;
}
```

**行為:**

- 顯示用戶頭像
- 點擊展開選單：個人資料、登出
- 登出後清除狀態並導向首頁

### ProtectedRoute

保護需要登入的頁面

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}
```

**行為:**

- 檢查用戶是否已登入
- 可選檢查用戶角色
- 未登入導向登入頁
- 角色不符顯示 403 或 fallback

## Hooks

### useAuth

主要認證 hook，提供登入登出功能

```typescript
function useAuth(): AuthContextValue;
```

**功能:**

- `loginWithGoogle(credential)` - Google 登入
- `logout()` - 登出
- `refreshUser()` - 重新取得用戶資訊
- `user` - 當前用戶
- `isAuthenticated` - 是否已登入
- `isLoading` - 載入中狀態

### useUser

取得當前用戶資訊 (簡化版)

```typescript
function useUser(): {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
};
```

## Services

### auth.service.ts

```typescript
export const authService = {
  async loginWithGoogle(credential: string): Promise<GoogleLoginResponse>;
  async logout(): Promise<void>;
  async getMe(): Promise<User>;
  async refreshToken(): Promise<void>;
};
```

**注意事項:**

- 所有請求需設定 `credentials: 'include'` 以傳送 Cookie
- 401 錯誤時嘗試 refresh token
- Refresh 失敗則清除狀態並導向登入頁

## API Client Updates

### lib/api-client.ts 更新

```typescript
// 新增功能：
// 1. 自動處理 401 錯誤
// 2. 嘗試 refresh token
// 3. Refresh 成功後重試原請求
// 4. Refresh 失敗導向登入頁
```

## Provider Setup

### app/providers.tsx

```typescript
// Google OAuth Provider 配置
// 包裝 GoogleOAuthProvider
// 提供 GOOGLE_CLIENT_ID
```

### app/layout.tsx 更新

```typescript
// 加入 Providers wrapper
// 加入 AuthProvider
```

## Page Updates

### (auth)/login/page.tsx

- 加入 GoogleLoginButton
- 已登入用戶自動導向首頁

### layout/navbar.tsx

- 未登入：顯示「登入」按鈕
- 已登入：顯示 UserMenu

## Environment Variables

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_API_URL=http://localhost:8888
```

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        Login Flow                                 │
├──────────────────────────────────────────────────────────────────┤
│  1. User clicks GoogleLoginButton                                 │
│  2. Google popup opens                                            │
│  3. User selects account                                          │
│  4. Google returns credential (ID Token)                          │
│  5. Frontend calls POST /api/auth/google with credential          │
│  6. Backend validates, returns user, sets HttpOnly cookies        │
│  7. Frontend updates AuthContext with user                        │
│  8. Redirect to home or previous page                             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     Token Refresh Flow                            │
├──────────────────────────────────────────────────────────────────┤
│  1. API request returns 401                                       │
│  2. api-client intercepts error                                   │
│  3. Calls POST /api/auth/refresh                                  │
│  4. If success: retry original request                            │
│  5. If fail: clear state, redirect to login                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       Logout Flow                                 │
├──────────────────────────────────────────────────────────────────┤
│  1. User clicks logout                                            │
│  2. Frontend calls POST /api/auth/logout                          │
│  3. Backend clears cookies                                        │
│  4. Frontend clears AuthContext                                   │
│  5. Redirect to home                                              │
└──────────────────────────────────────────────────────────────────┘
```

## Implementation Tasks

### Phase 1: Setup & Types

1. [ ] 安裝 @react-oauth/google
2. [ ] 建立 `types/user.ts`
3. [ ] 建立 `types/auth.ts`

### Phase 2: Services

4. [ ] 建立 `services/auth.service.ts`
5. [ ] 更新 `lib/api-client.ts` - 加入 401 處理與 auto refresh

### Phase 3: Context & Hooks

6. [ ] 建立 `contexts/AuthContext.tsx`
7. [ ] 建立 `hooks/useAuth.ts`
8. [ ] 建立 `hooks/useUser.ts`
9. [ ] 建立 `app/providers.tsx`
10. [ ] 更新 `app/layout.tsx` - 加入 providers

### Phase 4: Components

11. [ ] 建立 `components/auth/GoogleLoginButton.tsx`
12. [ ] 建立 `components/auth/UserMenu.tsx`
13. [ ] 建立 `components/auth/ProtectedRoute.tsx`

### Phase 5: Page Integration

14. [ ] 更新 `(auth)/login/page.tsx` - 加入 Google 登入
15. [ ] 更新 `components/layout/navbar.tsx` - 顯示登入狀態

### Phase 6: Testing

16. [ ] 測試 Google 登入流程
17. [ ] 測試 Token refresh 流程
18. [ ] 測試登出流程
19. [ ] 測試 ProtectedRoute

## Success Criteria

- [ ] Google 登入按鈕正常顯示並可登入
- [ ] 登入後 Navbar 顯示用戶頭像
- [ ] 登出後狀態正確清除
- [ ] Token 過期後自動 refresh
- [ ] 受保護頁面未登入時導向登入頁
- [ ] 刷新頁面後登入狀態保持
