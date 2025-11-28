import { test, expect, Page } from '@playwright/test';

const TEST_COURSE_ID = 'test-journey-001';

const mockPurchasedJourneyDetail = {
  id: TEST_COURSE_ID,
  title: 'Test Course',
  description: 'A test course for E2E testing',
  thumbnailUrl: null,
  chapterCount: 1,
  lessonCount: 1,
  totalDurationSeconds: 3600,
  chapters: [
    {
      id: 'chapter-1',
      title: 'Chapter 1',
      order: 1,
      lessons: [
        {
          id: 'lesson-1',
          title: 'Lesson 1',
          lessonType: 'VIDEO',
          order: 1,
          durationSeconds: 600,
          isCompleted: false,
          isFree: false,
        },
      ],
    },
  ],
  isPurchased: true,
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

async function setupApiMocks(page: Page): Promise<void> {
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

  await page.route(`**/api/journeys/${TEST_COURSE_ID}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPurchasedJourneyDetail),
    });
  });

  await page.route(`**/api/purchases/pending/journey/${TEST_COURSE_ID}`, (route) => {
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'No pending purchase' }),
    });
  });
}

test.describe('Already Purchased Course UI', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupApiMocks(page);
  });

  test('should not display purchase button for already purchased course', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}`);

    await expect(page.getByTestId('purchase-button')).not.toBeVisible();
  });

  test('should display start or continue learning button for already purchased course', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}`);

    const startLearningButton = page.getByTestId('start-learning-button');
    const continueLearningButton = page.getByTestId('continue-learning-button');

    const isStartVisible = await startLearningButton.isVisible().catch(() => false);
    const isContinueVisible = await continueLearningButton.isVisible().catch(() => false);

    expect(isStartVisible || isContinueVisible).toBe(true);
  });
});
