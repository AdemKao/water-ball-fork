# Frontend Testing Documentation

## 1. Overview

This project uses a two-tool testing strategy to ensure comprehensive test coverage:

| Tool | Purpose | Speed | Environment |
|------|---------|-------|-------------|
| **Vitest + React Testing Library** | Unit & Component tests | Fast (in-memory) | jsdom |
| **Playwright** | End-to-End tests | Slower (real browser) | Chromium, Firefox, WebKit |

### Why Two Tools?

- **Vitest** runs tests in Node.js with jsdom, making it extremely fast for testing individual components, hooks, and utility functions in isolation.
- **Playwright** runs tests in real browsers, enabling full user flow testing including navigation, authentication, and complex interactions.

---

## 2. Setup

### Installing Dependencies

```bash
cd frontend

npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom vite-tsconfig-paths

npm install -D @playwright/test
npx playwright install
```

### Configuration Files

#### vitest.config.ts

Create `frontend/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', '.next', 'src/test'],
    },
  },
})
```

#### Test Setup File

Create `frontend/src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

#### playwright.config.ts

Create `frontend/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 3. Running Tests

### Local - Unit/Component Tests (Vitest)

```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### Local - E2E Tests (Playwright)

```bash
npm run test:e2e          # Run headless
npm run test:e2e:ui       # Run with Playwright UI
```

### Docker

#### Unit/Component Tests

```bash
docker run --rm -v $(pwd)/frontend:/app -w /app node:18-alpine npm run test
```

#### E2E Tests

```bash
docker run --rm -v $(pwd)/frontend:/app -w /app mcr.microsoft.com/playwright:v1.40.0-jammy npm run test:e2e
```

#### Docker Compose (with backend)

```bash
docker-compose up -d
docker run --rm --network host -v $(pwd)/frontend:/app -w /app mcr.microsoft.com/playwright:v1.40.0-jammy npm run test:e2e
```

---

## 4. Writing Tests

### Unit/Component Tests (Vitest + React Testing Library)

#### Testing a Utility Function

`src/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500')
    expect(result).toBe('px-4 py-2 bg-blue-500')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toContain('active')
  })

  it('removes duplicate tailwind classes', () => {
    const result = cn('px-4', 'px-6')
    expect(result).toBe('px-6')
  })
})
```

#### Testing a React Component

`src/components/ui/button.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

#### Testing a Custom Hook

`src/hooks/useAuth.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'
import { AuthProvider } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('updates state after login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' })
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
  })
})
```

### E2E Tests (Playwright)

Create the `frontend/e2e` directory for E2E tests.

#### Page Navigation Test

`e2e/navigation.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('navigates to courses page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Courses')

    await expect(page).toHaveURL('/courses')
    await expect(page.locator('h1')).toContainText('Courses')
  })

  test('navigates to leaderboard page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Leaderboard')

    await expect(page).toHaveURL('/leaderboard')
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/')

    await page.click('[data-testid="nav-roadmap"]')
    await expect(page).toHaveURL('/roadmap')

    await page.click('[data-testid="nav-missions"]')
    await expect(page).toHaveURL('/missions')
  })
})
```

#### Form Submission Test

`e2e/forms.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Form Submission', () => {
  test('submits contact form successfully', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('textarea[name="message"]', 'Hello, this is a test message.')

    await page.click('button[type="submit"]')

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/contact')

    await page.click('button[type="submit"]')

    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()
  })
})
```

#### Authentication Flow Test

`e2e/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/profile')

    await expect(page).toHaveURL('/login')
  })

  test('shows Google login button', async ({ page }) => {
    await page.goto('/login')

    const googleButton = page.locator('button:has-text("Google")')
    await expect(googleButton).toBeVisible()
  })

  test('authenticated user can access protected routes', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'access_token',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/profile')

    await expect(page).toHaveURL('/profile')
    await expect(page.locator('h1')).toContainText('Profile')
  })

  test('logout clears session and redirects', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'access_token',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/profile')
    await page.click('[data-testid="logout-button"]')

    await expect(page).toHaveURL('/login')
    const cookies = await context.cookies()
    expect(cookies.find((c) => c.name === 'access_token')).toBeUndefined()
  })
})
```

---

## 5. Test Configuration

### vitest.config.ts Explanation

| Option | Description |
|--------|-------------|
| `environment: 'jsdom'` | Simulates browser DOM in Node.js |
| `globals: true` | Makes `describe`, `it`, `expect` available globally |
| `setupFiles` | Runs before each test file (e.g., import jest-dom matchers) |
| `include` | Glob pattern for test files |
| `coverage.provider` | Uses V8 for fast coverage collection |

### playwright.config.ts Explanation

| Option | Description |
|--------|-------------|
| `testDir` | Directory containing E2E tests |
| `fullyParallel` | Run tests in parallel |
| `forbidOnly` | Fails CI if `.only` is left in tests |
| `retries` | Number of retries on failure |
| `baseURL` | Base URL for `page.goto('/')` |
| `webServer` | Automatically starts dev server before tests |
| `projects` | Test across multiple browsers |

### Test File Naming Conventions

| Pattern | Type | Example |
|---------|------|---------|
| `*.test.ts` | Unit tests | `utils.test.ts` |
| `*.test.tsx` | Component tests | `Button.test.tsx` |
| `*.spec.ts` | Integration tests | `api.spec.ts` |
| `*.e2e.ts` or `e2e/*.spec.ts` | E2E tests | `auth.e2e.ts` |

---

## 6. Scripts to Add to package.json

Add these scripts to `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 7. Directory Structure

```
frontend/
├── e2e/
│   ├── auth.spec.ts
│   ├── forms.spec.ts
│   └── navigation.spec.ts
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── button.test.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useAuth.test.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── utils.test.ts
│   └── test/
│       └── setup.ts
├── playwright.config.ts
├── vitest.config.ts
└── package.json
```

---

## 8. CI Integration

Example GitHub Actions workflow:

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: cd frontend && npm ci
      - run: cd frontend && npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: cd frontend && npm ci
      - run: cd frontend && npx playwright install --with-deps
      - run: cd frontend && npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## 9. Best Practices

1. **Test behavior, not implementation** - Focus on what users see and do
2. **Use data-testid sparingly** - Prefer accessible queries (role, label, text)
3. **Keep tests isolated** - Each test should be independent
4. **Mock external services** - Use MSW for API mocking in component tests
5. **Run unit tests frequently** - They're fast, run them on every save
6. **Run E2E tests before merging** - Catch integration issues early
