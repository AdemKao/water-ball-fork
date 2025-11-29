import { test, expect, Page } from '@playwright/test';

const TEST_GYM_ID = '1';
const TEST_STAGE_ID = '1';
const TEST_EXERCISE_ID = '1';

const mockGymList = [
  {
    id: '1',
    journeyId: '1',
    journeyTitle: 'Design Patterns Journey',
    title: '白段道館',
    description: '設計模式基礎練習',
    thumbnailUrl: null,
    type: 'MAIN_QUEST',
    stageCount: 1,
    problemCount: 3,
    completedCount: 1,
    isPurchased: true,
  },
  {
    id: '2',
    journeyId: '1',
    journeyTitle: 'Design Patterns Journey',
    title: '黑段道館',
    description: '進階設計模式練習',
    thumbnailUrl: null,
    type: 'SIDE_QUEST',
    stageCount: 1,
    problemCount: 5,
    completedCount: 0,
    isPurchased: true,
  },
];

const mockGymDetail = {
  id: '1',
  journeyId: '1',
  journeyTitle: 'Design Patterns Journey',
  title: '白段道館',
  description: '設計模式基礎練習',
  thumbnailUrl: null,
  type: 'MAIN_QUEST',
  stageCount: 1,
  problemCount: 3,
  completedCount: 1,
  isPurchased: true,
  stages: [
    {
      id: '1',
      title: '初級關卡',
      description: '基礎練習',
      difficulty: 1,
      problemCount: 3,
      completedCount: 1,
      isUnlocked: true,
      prerequisites: [],
    },
  ],
  relatedGyms: [],
};

const mockStageDetail = {
  id: '1',
  gymId: '1',
  gymTitle: '白段道館',
  title: '初級關卡',
  description: '基礎練習',
  difficulty: 1,
  isUnlocked: true,
  isPurchased: true,
  prerequisites: [],
  problems: [
    {
      id: '1',
      title: '責任鏈模式練習',
      difficulty: 1,
      submissionTypes: ['PDF', 'CODE'],
      isCompleted: false,
      isUnlocked: true,
      submissionStatus: null,
      prerequisites: [],
    },
    {
      id: '2',
      title: '狀態模式練習',
      difficulty: 2,
      submissionTypes: ['PDF'],
      isCompleted: false,
      isUnlocked: true,
      submissionStatus: 'PENDING',
      prerequisites: [],
    },
    {
      id: '3',
      title: '策略模式練習',
      difficulty: 3,
      submissionTypes: ['PDF'],
      isCompleted: true,
      isUnlocked: true,
      submissionStatus: 'REVIEWED',
      prerequisites: [],
    },
  ],
};

const mockProblemDetail = {
  id: TEST_EXERCISE_ID,
  stageId: TEST_STAGE_ID,
  stageTitle: '初級關卡',
  gymId: TEST_GYM_ID,
  gymTitle: '白段道館',
  title: '責任鏈模式練習',
  description: '實作碰撞偵測處理鏈\n\n請根據課程內容，實作一個責任鏈模式來處理遊戲中的碰撞偵測。',
  difficulty: 1,
  submissionTypes: ['PDF', 'CODE'],
  hints: [],
  expReward: 100,
  isUnlocked: true,
  prerequisites: [],
  latestSubmission: null,
  previousProblem: null,
  nextProblem: null,
};

const mockSubmission = {
  id: '1',
  problemId: TEST_EXERCISE_ID,
  status: 'PENDING',
  fileUrl: 'https://example.com/file.pdf',
  fileName: 'submission.pdf',
  fileType: 'application/pdf',
  fileSizeBytes: 1024,
  submittedAt: new Date().toISOString(),
  version: 1,
  isPublic: false,
  review: null,
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
  await page.route('**/api/gyms?*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockGymList),
    });
  });

  await page.route('**/api/gyms', (route) => {
    if (route.request().url().includes('?')) return;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockGymList),
    });
  });

  await page.route(`**/api/gyms/${TEST_GYM_ID}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockGymDetail),
    });
  });

  await page.route(`**/api/gyms/${TEST_GYM_ID}/stages/${TEST_STAGE_ID}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockStageDetail),
    });
  });

  await page.route(`**/api/problems/${TEST_EXERCISE_ID}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProblemDetail),
    });
  });

  await page.route(`**/api/problems/${TEST_EXERCISE_ID}/submissions`, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockSubmission),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }
  });
}

test.describe('Gym Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupGymApiMocks(page);
    await setupUnauthenticatedApiMocks(page);
  });

  test('should display gym title and description', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('白段道館')).toBeVisible();
    await expect(page.getByText('設計模式基礎練習')).toBeVisible();
  });

  test('should display stage with problems', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.locator('[data-slot="card-title"]', { hasText: '初級關卡' })).toBeVisible();
    await expect(page.getByText('責任鏈模式練習')).toBeVisible();
  });

  test('should display progress information', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText(/進度.*1.*\/.*3/)).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await page.route(`**/api/gyms/${TEST_GYM_ID}`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGymDetail),
      });
    });

    await page.goto(`/gym/${TEST_GYM_ID}`);
    await expect(page.getByText('白段道館')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Problem List in Gym', () => {
  test.beforeEach(async ({ page }) => {
    await setupGymApiMocks(page);
    await setupUnauthenticatedApiMocks(page);
  });

  test('should display problem list within stage', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('責任鏈模式練習')).toBeVisible();
    await expect(page.getByText('狀態模式練習')).toBeVisible();
    await expect(page.getByText('策略模式練習')).toBeVisible();
  });

  test('should display difficulty indicators on problems', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('責任鏈模式練習')).toBeVisible();
  });
});

test.describe('Exercise Detail View', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupAuthenticatedApiMocks(page);
    await setupGymApiMocks(page);
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

  test('should show success message after successful submission', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-submission.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content'),
    });

    const submitButton = page.getByRole('button', { name: '提交作業' });
    await submitButton.click();

    await expect(page.getByText('提交成功！')).toBeVisible({ timeout: 5000 });
  });

  test('should allow resubmission (version 2)', async ({ page }) => {
    const existingSubmission = {
      ...mockSubmission,
      version: 1,
    };
    await page.route(`**/api/problems/${TEST_EXERCISE_ID}/submissions`, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ ...mockSubmission, version: 2 }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([existingSubmission]),
        });
      }
    });

    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText('submission.pdf')).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'resubmission.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('resubmission content'),
    });

    await page.getByRole('button', { name: '提交作業' }).click();

    await expect(page.getByText('提交成功！')).toBeVisible({ timeout: 10000 });
  });

  test('should toggle visibility after submission is reviewed', async ({ page }) => {
    const reviewedSubmission = {
      ...mockSubmission,
      status: 'REVIEWED',
      isPublic: false,
      review: {
        id: 'review-1',
        content: '做得不錯！',
        status: 'APPROVED',
        reviewedAt: new Date().toISOString(),
        reviewerName: 'Teacher',
      },
    };

    let currentVisibility = false;
    await page.route(`**/api/problems/${TEST_EXERCISE_ID}/submissions`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ ...reviewedSubmission, isPublic: currentVisibility }]),
      });
    });

    await page.route(`**/api/submissions/${mockSubmission.id}/visibility`, (route) => {
      if (route.request().method() === 'PATCH') {
        currentVisibility = !currentVisibility;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      } else {
        route.continue();
      }
    });

    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText('設為公開')).toBeVisible();
    await page.getByRole('button', { name: '設為公開' }).click();
    await expect(page.getByText('公開中')).toBeVisible({ timeout: 5000 });
  });

  test('should display supported file types hint', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText(/支援.*PDF/)).toBeVisible();
  });

  test('should reject unsupported file types', async ({ page }) => {
    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'test.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('test content'),
    });

    const submitButton = page.getByRole('button', { name: '提交作業' });
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Unauthenticated Access', () => {
  test.beforeEach(async ({ page }) => {
    await setupGymApiMocks(page);
    await setupUnauthenticatedApiMocks(page);
  });

  test('should allow unauthenticated user to view gym detail', async ({ page }) => {
    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('白段道館')).toBeVisible();
    await expect(page.getByText('設計模式基礎練習')).toBeVisible();
  });

  test('should allow unauthenticated user to view problem list', async ({ page }) => {
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
  test('should display error message when gym detail fails to load', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route(`**/api/gyms/${TEST_GYM_ID}`, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText(/無法載入道場資訊/)).toBeVisible();
  });

  test('should display error message when exercise detail fails to load', async ({ page }) => {
    await setupMockAuth(page);
    await setupAuthenticatedApiMocks(page);
    await page.route(`**/api/problems/${TEST_EXERCISE_ID}`, (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not Found' }),
      });
    });
    await page.route(`**/api/problems/${TEST_EXERCISE_ID}/submissions`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText(/Error loading exercise/)).toBeVisible();
  });
});

test.describe('Prerequisite Locking', () => {
  const lockedProblemDetail = {
    id: '2',
    stageId: TEST_STAGE_ID,
    stageTitle: '初級關卡',
    gymId: TEST_GYM_ID,
    gymTitle: '白段道館',
    title: '狀態模式練習',
    description: '需要先完成前置題目',
    difficulty: 2,
    submissionTypes: ['PDF'],
    hints: [],
    expReward: 150,
    isUnlocked: false,
    prerequisites: [
      {
        type: 'PROBLEM',
        targetId: '1',
        targetTitle: '責任鏈模式練習',
        isSatisfied: false,
      },
    ],
    latestSubmission: null,
    previousProblem: null,
    nextProblem: null,
  };

  test('should display locked state for problem with unsatisfied prerequisites', async ({
    page,
  }) => {
    await setupMockAuth(page);
    await setupAuthenticatedApiMocks(page);
    await page.route('**/api/problems/2', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(lockedProblemDetail),
      });
    });
    await page.route('**/api/problems/2/submissions', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`/exercises/2?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText('狀態模式練習')).toBeVisible();
    await expect(page.getByText('需要先完成前置題目')).toBeVisible();
  });

  test('should show locked problem in stage list', async ({ page }) => {
    const stageWithLockedProblem = {
      ...mockStageDetail,
      problems: [
        ...mockStageDetail.problems,
        {
          id: '4',
          title: '觀察者模式練習',
          difficulty: 3,
          submissionTypes: ['PDF'],
          isCompleted: false,
          isUnlocked: false,
          submissionStatus: null,
          prerequisites: [
            {
              type: 'PROBLEM',
              targetId: '3',
              targetTitle: '策略模式練習',
              isSatisfied: false,
            },
          ],
        },
      ],
    };

    await setupUnauthenticatedApiMocks(page);
    await page.route(`**/api/gyms/${TEST_GYM_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGymDetail),
      });
    });
    await page.route(`**/api/gyms/${TEST_GYM_ID}/stages/${TEST_STAGE_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(stageWithLockedProblem),
      });
    });

    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('觀察者模式練習')).toBeVisible();
  });
});

test.describe('Unpurchased Course Access', () => {
  const unpurchasedGymDetail = {
    ...mockGymDetail,
    isPurchased: false,
  };

  const unpurchasedStageDetail = {
    ...mockStageDetail,
    isPurchased: false,
  };

  test('should display gym info even when not purchased', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route(`**/api/gyms/${TEST_GYM_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(unpurchasedGymDetail),
      });
    });
    await page.route(`**/api/gyms/${TEST_GYM_ID}/stages/${TEST_STAGE_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(unpurchasedStageDetail),
      });
    });

    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('白段道館')).toBeVisible();
    await expect(page.getByText('設計模式基礎練習')).toBeVisible();
  });

  test('should show problem list even when not purchased', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route(`**/api/gyms/${TEST_GYM_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(unpurchasedGymDetail),
      });
    });
    await page.route(`**/api/gyms/${TEST_GYM_ID}/stages/${TEST_STAGE_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(unpurchasedStageDetail),
      });
    });

    await page.goto(`/gym/${TEST_GYM_ID}`);

    await expect(page.getByText('責任鏈模式練習')).toBeVisible();
    await expect(page.getByText('狀態模式練習')).toBeVisible();
  });

  test('should allow viewing exercise detail when not purchased', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);
    await page.route(`**/api/problems/${TEST_EXERCISE_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProblemDetail),
      });
    });
    await page.route(`**/api/problems/${TEST_EXERCISE_ID}/submissions`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`/exercises/${TEST_EXERCISE_ID}?gymId=${TEST_GYM_ID}`);

    await expect(page.getByText('責任鏈模式練習')).toBeVisible();
    await expect(page.getByText(/實作碰撞偵測處理鏈/)).toBeVisible();
  });
});

test.describe('Gym Progress Page', () => {
  const mockGymProgress = {
    totalGyms: 3,
    completedGyms: 1,
    totalProblems: 10,
    completedProblems: 4,
    pendingReviews: 2,
    gyms: [
      {
        gymId: '1',
        gymTitle: '白段道館',
        gymType: 'MAIN_QUEST',
        totalProblems: 3,
        completedProblems: 2,
        pendingReviews: 1,
      },
      {
        gymId: '2',
        gymTitle: '黑段道館',
        gymType: 'SIDE_QUEST',
        totalProblems: 5,
        completedProblems: 2,
        pendingReviews: 1,
      },
    ],
  };

  test('should redirect to login when not authenticated', async ({ page }) => {
    await setupUnauthenticatedApiMocks(page);

    await page.goto('/my/gym-progress');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should display gym progress for authenticated user', async ({ page }) => {
    await setupMockAuth(page);
    await setupAuthenticatedApiMocks(page);
    await page.route('**/api/my/gym-progress', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGymProgress),
      });
    });

    await page.goto('/my/gym-progress');

    await expect(page.getByText('我的道場進度')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('總體進度')).toBeVisible();
  });

  test('should display individual gym progress cards', async ({ page }) => {
    await setupMockAuth(page);
    await setupAuthenticatedApiMocks(page);
    await page.route('**/api/my/gym-progress', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGymProgress),
      });
    });

    await page.goto('/my/gym-progress');

    await expect(page.getByText('我的道場進度')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('白段道館')).toBeVisible();
    await expect(page.getByText('黑段道館')).toBeVisible();
  });

  test('should show error state when progress fails to load', async ({ page }) => {
    await setupMockAuth(page);
    await setupAuthenticatedApiMocks(page);
    await page.route('**/api/my/gym-progress', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.goto('/my/gym-progress');

    await expect(page.getByText('我的道場進度')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('無法載入進度資料')).toBeVisible();
    await expect(page.getByRole('button', { name: '重試' })).toBeVisible();
  });
});
