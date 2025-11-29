import { test, expect, Page } from '@playwright/test';

const TEST_JOURNEY_ID = 1;
const TEST_GYM_ID = 1;
const TEST_EXERCISE_ID = 1;

const mockGyms = {
  gyms: [
    {
      id: 1,
      journeyId: TEST_JOURNEY_ID,
      title: '白段道館',
      description: '設計模式基礎練習',
      displayOrder: 1,
      exerciseCount: 3,
      completedCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      journeyId: TEST_JOURNEY_ID,
      title: '黑段道館',
      description: '進階設計模式練習',
      displayOrder: 2,
      exerciseCount: 5,
      completedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const mockExercises = {
  exercises: [
    {
      id: 1,
      gymId: TEST_GYM_ID,
      title: '責任鏈模式練習',
      description: '實作碰撞偵測處理鏈',
      difficulty: 'EASY',
      displayOrder: 1,
      hasSubmission: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      gymId: TEST_GYM_ID,
      title: '狀態模式練習',
      description: '實作角色狀態機',
      difficulty: 'MEDIUM',
      displayOrder: 2,
      hasSubmission: true,
      latestSubmissionStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      gymId: TEST_GYM_ID,
      title: '策略模式練習',
      description: '實作攻擊策略切換',
      difficulty: 'HARD',
      displayOrder: 3,
      hasSubmission: true,
      latestSubmissionStatus: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const mockExerciseDetail = {
  id: TEST_EXERCISE_ID,
  gymId: TEST_GYM_ID,
  title: '責任鏈模式練習',
  description: '實作碰撞偵測處理鏈\n\n請根據課程內容，實作一個責任鏈模式來處理遊戲中的碰撞偵測。',
  difficulty: 'EASY',
  displayOrder: 1,
  hasSubmission: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  submissions: [],
};

const mockSubmission = {
  id: 1,
  exerciseId: TEST_EXERCISE_ID,
  userId: 1,
  fileUrl: 'https://example.com/file.pdf',
  fileName: 'submission.pdf',
  fileSize: 1024,
  status: 'PENDING',
  submittedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

async function setupMockAuth(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: 'auth_token',
      value: 'mock-jwt-token',
      domain: 'localhost',
      path: '/',
    },
  ]);
}

async function setupAuthenticatedApiMocks(page: Page): Promise<void> {
  await page.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-001',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
      }),
    });
  });
}

async function setupUnauthenticatedApiMocks(page: Page): Promise<void> {
  await page.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized' }),
    });
  });
}

async function setupGymApiMocks(page: Page): Promise<void> {
  await page.route(`**/api/journeys/${TEST_JOURNEY_ID}/gyms`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockGyms),
    });
  });

  await page.route(`**/api/gyms/${TEST_GYM_ID}/exercises`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockExercises),
    });
  });

  await page.route(`**/api/exercises/${TEST_EXERCISE_ID}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockExerciseDetail),
    });
  });

  await page.route(`**/api/exercises/${TEST_EXERCISE_ID}/submissions/me`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ submissions: [] }),
    });
  });

  await page.route(`**/api/exercises/${TEST_EXERCISE_ID}/submissions`, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockSubmission),
      });
    } else {
      route.continue();
    }
  });
}

test.describe('Gym List View', () => {
  test.beforeEach(async ({ page }) => {
    await setupGymApiMocks(page);
    await setupUnauthenticatedApiMocks(page);
  });

  test('should navigate to roadmap page and click on gym tab to see gym list', async ({
    page,
  }) => {
    await page.goto('/roadmap');

    await page.getByRole('button', { name: '道場' }).click();

    await expect(page.getByText('練習道場')).toBeVisible();
    await expect(page.getByText('白段道館')).toBeVisible();
    await expect(page.getByText('黑段道館')).toBeVisible();
  });

  test('should display gym cards with progress information', async ({ page }) => {
    await page.goto('/roadmap');

    await page.getByRole('button', { name: '道場' }).click();

    await expect(page.getByText('1/3')).toBeVisible();
    await expect(page.getByText('0/5')).toBeVisible();
    await expect(page.getByText('設計模式基礎練習')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await page.route(`**/api/journeys/${TEST_JOURNEY_ID}/gyms`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGyms),
      });
    });

    await page.goto('/roadmap');
    await page.getByRole('button', { name: '道場' }).click();

    await expect(page.getByText('Loading gyms...')).toBeVisible();
    await expect(page.getByText('練習道場')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Gym Detail Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupGymApiMocks(page);
    await setupUnauthenticatedApiMocks(page);
  });

  test('should navigate to gym detail page when clicking on a gym card', async ({ page }) => {
    await page.goto('/roadmap');

    await page.getByRole('button', { name: '道場' }).click();
    await expect(page.getByText('白段道館')).toBeVisible();

    await page.getByText('白段道館').click();

    await expect(page).toHaveURL(/\/gym\/1/);
  });

  test('should display exercise list on gym detail page', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('責任鏈模式練習')).toBeVisible();
    await expect(page.getByText('狀態模式練習')).toBeVisible();
    await expect(page.getByText('策略模式練習')).toBeVisible();
  });

  test('should display difficulty badges on exercises', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('簡單')).toBeVisible();
    await expect(page.getByText('中等')).toBeVisible();
    await expect(page.getByText('困難')).toBeVisible();
  });

  test('should display exercise descriptions', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('實作碰撞偵測處理鏈')).toBeVisible();
    await expect(page.getByText('實作角色狀態機')).toBeVisible();
  });
});

test.describe('Exercise Detail View', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupAuthenticatedApiMocks(page);
    await setupGymApiMocks(page);
  });

  test('should navigate to exercise detail page when clicking on an exercise', async ({
    page,
  }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await page.getByText('責任鏈模式練習').click();

    await expect(page).toHaveURL(/\/exercises\/1/);
  });

  test('should display exercise title and description on detail page', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText('責任鏈模式練習')).toBeVisible();
    await expect(page.getByText(/實作碰撞偵測處理鏈/)).toBeVisible();
  });

  test('should display difficulty badge on exercise detail page', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText('簡單')).toBeVisible();
  });

  test('should display submission form for authenticated user', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByRole('button', { name: '提交作業' })).toBeVisible();
    await expect(page.getByText('拖放文件到此處或點擊選擇')).toBeVisible();
  });

  test('should have a back button that navigates to gym page', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByRole('button', { name: '返回' })).toBeVisible();
  });
});

test.describe('Submission Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupAuthenticatedApiMocks(page);
    await setupGymApiMocks(page);
  });

  test('should display upload form for authenticated user', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByRole('button', { name: '提交作業' })).toBeVisible();
    await expect(page.getByText('拖放文件到此處或點擊選擇')).toBeVisible();
  });

  test('should have submit button disabled when no file is selected', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    const submitButton = page.getByRole('button', { name: '提交作業' });
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button after selecting a file', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-submission.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content'),
    });

    await expect(page.getByText('test-submission.pdf')).toBeVisible();
    const submitButton = page.getByRole('button', { name: '提交作業' });
    await expect(submitButton).toBeEnabled();
  });

  test.skip('should show success message after successful submission', async ({ page }) => {
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('request', (req) => {
      if (req.url().includes('submissions')) {
        console.log('REQUEST:', req.method(), req.url());
      }
    });
    page.on('response', (res) => {
      if (res.url().includes('submissions')) {
        console.log('RESPONSE:', res.status(), res.url());
      }
    });

    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-submission.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content'),
    });

    await page.getByRole('button', { name: '提交作業' }).click();

    await expect(page.getByText('提交成功！')).toBeVisible({ timeout: 10000 });
  });

  test('should display supported file types hint', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText(/支援 PDF, Word, 程式碼文件等/)).toBeVisible();
  });
});

test.describe('Unauthenticated Access', () => {
  test.beforeEach(async ({ page }) => {
    await setupGymApiMocks(page);
    await setupUnauthenticatedApiMocks(page);
  });

  test('should allow unauthenticated user to view gym list', async ({ page }) => {
    await page.goto('/roadmap');

    await page.getByRole('button', { name: '道場' }).click();

    await expect(page.getByText('練習道場')).toBeVisible();
    await expect(page.getByText('白段道館')).toBeVisible();
    await expect(page.getByText('黑段道館')).toBeVisible();
  });

  test('should allow unauthenticated user to view exercise list', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('責任鏈模式練習')).toBeVisible();
    await expect(page.getByText('狀態模式練習')).toBeVisible();
  });

  test('should allow unauthenticated user to view exercise detail', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText('責任鏈模式練習')).toBeVisible();
  });

  test('should still show upload form for unauthenticated user', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByRole('button', { name: '提交作業' })).toBeVisible();
  });
});

test.describe('Public Submission Page', () => {
  const mockPublicSubmission = {
    id: '123',
    problemId: String(TEST_EXERCISE_ID),
    problemTitle: '責任鏈模式練習',
    gymTitle: '白段道館',
    userName: 'Test User',
    userAvatarUrl: null,
    fileUrl: 'https://example.com/file.pdf',
    fileName: 'my-submission.pdf',
    status: 'REVIEWED',
    submittedAt: new Date().toISOString(),
    review: {
      content: '做得很好！',
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewerName: 'Reviewer',
    },
  };

  test('should display public submission details without authentication', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route('**/api/submissions/public/123', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPublicSubmission),
      });
    });

    await page.goto('/submissions/123');

    await expect(page.getByText('my-submission.pdf')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('做得很好！')).toBeVisible();
  });

  test('should show 404 for non-existent public submission', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route('**/api/submissions/public/999', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Submission not found or not public' }),
      });
    });

    await page.goto('/submissions/999');

    await expect(page.getByText('找不到作業')).toBeVisible({ timeout: 10000 });
  });

  test('should show 404 for private submission accessed via public URL', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route('**/api/submissions/public/456', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Submission not found or not public' }),
      });
    });

    await page.goto('/submissions/456');

    await expect(page.getByText('找不到作業')).toBeVisible({ timeout: 10000 });
  });

  test('should display download button for public submission file', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route('**/api/submissions/public/123', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPublicSubmission),
      });
    });

    await page.goto('/submissions/123');

    await expect(page.getByRole('link', { name: '下載' })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Error Handling', () => {
  test('should display error message when gym list fails to load', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route(`**/api/journeys/${TEST_JOURNEY_ID}/gyms`, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.goto('/roadmap');
    await page.getByRole('button', { name: '道場' }).click();

    await expect(page.getByText(/Error loading gyms/)).toBeVisible();
  });

  test('should display error message when exercise list fails to load', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route(`**/api/gyms/${TEST_GYM_ID}/exercises`, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText(/Error/)).toBeVisible();
  });

  test('should display error message when exercise detail fails to load', async ({ page }) => {
    await setupMockAuth(page);
    await setupAuthenticatedApiMocks(page);
    await page.route(`**/api/exercises/${TEST_EXERCISE_ID}`, (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not Found' }),
      });
    });
    await page.route(`**/api/exercises/${TEST_EXERCISE_ID}/submissions/me`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ submissions: [] }),
      });
    });

    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText(/Error loading exercise/)).toBeVisible();
  });
});
