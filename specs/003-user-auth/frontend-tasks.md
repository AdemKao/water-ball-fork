# Frontend Implementation Tasks: User Authentication

## Phase 1: Setup & Dependencies

### Task 1.1: 安裝依賴

```bash
cd frontend
npm install @react-oauth/google
```

---

## Phase 2: Types

### Task 2.1: 建立 User Type

**檔案:** `src/types/user.ts`

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

---

### Task 2.2: 建立 Auth Types

**檔案:** `src/types/auth.ts`

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

---

## Phase 3: Services

### Task 3.1: 建立 Auth Service

**檔案:** `src/services/auth.service.ts`

```typescript
import { GoogleLoginResponse, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  async loginWithGoogle(credential: string): Promise<GoogleLoginResponse> {
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },

  async getMe(): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return response.json();
  },

  async refreshToken(): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
  },
};
```

---

### Task 3.2: 更新 API Client (加入自動 Refresh)

**檔案:** `src/lib/api-client.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function refreshToken(): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken()
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;
      response = await fetch(url, config);
    } catch {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
```

---

## Phase 4: Context & Hooks

### Task 4.1: 建立 AuthContext

**檔案:** `src/contexts/AuthContext.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContextValue, AuthState, User } from '@/types';
import { authService } from '@/services/auth.service';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getMe();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginWithGoogle = useCallback(async (credential: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.loginWithGoogle(credential);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
```

---

### Task 4.2: 建立 useAuth Hook

**檔案:** `src/hooks/useAuth.ts`

```typescript
'use client';

import { useAuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  return useAuthContext();
}
```

---

### Task 4.3: 建立 useUser Hook

**檔案:** `src/hooks/useUser.ts`

```typescript
'use client';

import { useAuth } from './useAuth';

export function useUser() {
  const { user, isLoading } = useAuth();

  return {
    user,
    isLoading,
    error: null,
  };
}
```

---

## Phase 5: Providers

### Task 5.1: 建立 Providers

**檔案:** `src/app/providers.tsx`

```typescript
'use client';

import { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
```

---

### Task 5.2: 更新 Root Layout

**檔案:** `src/app/layout.tsx`

```typescript
// 將現有的 ThemeProvider 替換為 Providers
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

## Phase 6: Components

### Task 6.1: 建立 GoogleLoginButton

**檔案:** `src/components/auth/GoogleLoginButton.tsx`

```typescript
'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      setIsLoading(true);
      try {
        // 用 access_token 換取 id_token
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        );
        
        // 使用 Google 的 tokeninfo endpoint 取得 id_token
        // 或者改用 useGoogleLogin 的 flow: 'auth-code' 模式
        // 這裡我們改用 GoogleLogin component 方式
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      onError?.(new Error(error.error_description || 'Login failed'));
    },
  });

  return (
    <Button
      onClick={() => login()}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? (
        'Signing in...'
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  );
}
```

---

### Task 6.2: 建立 GoogleLoginButtonV2 (使用 credential response)

**檔案:** `src/components/auth/GoogleLoginButton.tsx` (替換版本)

```typescript
'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('No credential received');
      onError?.(new Error('No credential received'));
      return;
    }

    try {
      await loginWithGoogle(response.credential);
      onSuccess?.();
      router.push('/');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
    }
  };

  const handleError = () => {
    const error = new Error('Google login failed');
    setError(error.message);
    onError?.(error);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        width="300"
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

---

### Task 6.3: 建立 UserMenu

**檔案:** `src/components/auth/UserMenu.tsx`

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {user.pictureUrl ? (
            <img
              src={user.pictureUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### Task 6.4: 建立 ProtectedRoute

**檔案:** `src/components/auth/ProtectedRoute.tsx`

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return fallback || <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-500">You do not have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

### Task 6.5: 建立 auth components index

**檔案:** `src/components/auth/index.ts`

```typescript
export { GoogleLoginButton } from './GoogleLoginButton';
export { UserMenu } from './UserMenu';
export { ProtectedRoute } from './ProtectedRoute';
```

---

## Phase 7: UI Components (新增)

### Task 7.1: 安裝並建立 DropdownMenu

```bash
npx shadcn@latest add dropdown-menu
```

---

## Phase 8: Page Updates

### Task 8.1: 更新 Login Page

**檔案:** `src/app/(auth)/login/page.tsx`

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { GoogleLoginButton } from '@/components/auth';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
```

---

### Task 8.2: 更新 Navbar

**檔案:** `src/components/layout/navbar.tsx`

```typescript
// 新增以下內容到 Navbar component

import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 在 Navbar 內部:
const { user, isAuthenticated, isLoading } = useAuth();

// 在適當位置加入:
{isLoading ? (
  <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
) : isAuthenticated ? (
  <UserMenu />
) : (
  <Button asChild variant="outline" size="sm">
    <Link href="/login">Sign In</Link>
  </Button>
)}
```

---

## Phase 9: Types Export

### Task 9.1: 更新 types index

**檔案:** `src/types/index.ts`

```typescript
export * from './user';
export * from './auth';
export * from './course';
export * from './lesson';
export * from './navigation';
```

---

## Checklist

### Phase 1: Setup

- [ ] Task 1.1: 安裝 @react-oauth/google

### Phase 2: Types

- [ ] Task 2.1: User Type
- [ ] Task 2.2: Auth Types

### Phase 3: Services

- [ ] Task 3.1: Auth Service
- [ ] Task 3.2: API Client 更新

### Phase 4: Context & Hooks

- [ ] Task 4.1: AuthContext
- [ ] Task 4.2: useAuth Hook
- [ ] Task 4.3: useUser Hook

### Phase 5: Providers

- [ ] Task 5.1: Providers
- [ ] Task 5.2: Root Layout 更新

### Phase 6: Components

- [ ] Task 6.1: GoogleLoginButton (原版)
- [ ] Task 6.2: GoogleLoginButton (credential 版)
- [ ] Task 6.3: UserMenu
- [ ] Task 6.4: ProtectedRoute
- [ ] Task 6.5: Auth components index

### Phase 7: UI Components

- [ ] Task 7.1: DropdownMenu

### Phase 8: Page Updates

- [ ] Task 8.1: Login Page
- [ ] Task 8.2: Navbar

### Phase 9: Types Export

- [ ] Task 9.1: Types index
